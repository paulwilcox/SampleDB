export default dbName => new manager(dbName);

class manager {

    constructor(dbName) {
        this.dbName = dbName;
    }

    reset (
        json, 
        keysToInclude,
        deleteIfKeyNotFound = false
    ) {

        this.doReset = true;
        this.json = json;
        this.deleteIfKeyNotFound = deleteIfKeyNotFound;
        this.fullReset = !keysToInclude && deleteIfKeyNotFound;
        this.keysToInclude = keysToInclude;
        return this;

    }

    async connect () {

        if (this.doReset) 
            await this._reset();

        let version = await getDbVersion(this.dbName);
        version = this.fullReset ? 2 
            : this.doReset ? version + 1
            : version;

        let dbOpenRequest = indexedDB.open(this.dbName, version);

        return await new Promise((res,rej) => {
            dbOpenRequest.onsuccess = event => res(event.target.result);
            dbOpenRequest.onerror = () => rej(`error opening ${this.dbName}`)
            dbOpenRequest.onupgradeneeded = event => this.upgrade(event.target.result);
        });

    }

    async _reset () {
    
        if (this.json.endsWith('.json')) {
            this.json = await fetch(this.json);
            this.json = await this.json.json();
        }
    
        if (typeof this.json === 'string')
            this.json = JSON.parse(json);
    
        if (!this.keysToInclude)
            this.keysToInclude = Object.keys(this.json).join(',');

        this.storeSettings = parseKeysToInclude(this.keysToInclude)                

        // Get the relevant keys from source
        if (this.keysToInclude) {
            let j = {};
            for (let entry of Object.entries(this.json))    
                if (this.storeSettings.some(ss => ss.key == entry[0])) 
                    j[entry[0]] = entry[1];
            this.json = j;
        }

        // Reset the entire database if parameters imply full reset
        if (this.fullReset)
            new Promise((res,rej) => {
                let request = indexedDB.deleteDatabase(this.dbName);
                request.onsuccess = event => {
                    console.log(`deleting database ${this.dbName}`);
                    res(event.target.result);
                }
                request.onerror = () => 
                    rej(`error deleteing ${this.dbName}`);
            });

        
    }

    async upgrade (db) { 
    
        let targetKeys = [...db.objectStoreNames];
        let sourceKeys = Object.keys(this.json);
        let droppedStores = [];
        let createdStores = [];
    
        // delete irrelevant stores from target
        if (this.deleteIfKeyNotFound) {
    
            let keysToDelete = targetKeys
                .filter(tk => !sourceKeys.includes(tk));
    
            for (let key of keysToDelete) 
                await db.deleteObjectStore(key);
    
            droppedStores.push(...keysToDelete);
    
        }
    
        // add relevant stores to target
        for (let sourceKey of sourceKeys) { 
    
            let srcSettings = this.storeSettings
                .find(ss => ss.key == sourceKey);

            if (targetKeys.includes(sourceKey)) {
                await db.deleteObjectStore(sourceKey);
                deletedStores.push(sourceKey);
            }
    
            let store = await db.createObjectStore(
                sourceKey, 
                {
                    keyPath: srcSettings.keyPath, 
                    autoIncrement: srcSettings.autoIncrement
                }
            );
        
            for (let row of this.json[sourceKey]) 
                store.put(row);
    
            createdStores.push(sourceKey);
    
        }
    
        // log changes
        if (droppedStores.length > 0) console.log(
            `\ndropped idb.${db.name} stores:` + 
            `${droppedStores.join(',')}.\n`
        );
        if (createdStores.length > 0) console.log(
            `\ncreated idb.${db.name} stores: ` + 
            `${createdStores.join(',')}.\n`
        );
    
    }

}

// thanks user663031 at stackoverflow q#41516862
function parseKeysToInclude(keysToInclude) {

    let storeSettings = [];
    let storeText = '';
    let depth = 0;
    
    let processStoreText = () => {
        
        let splits = storeText.split('(');
        let key = splits.shift().trim();
        
        splits = splits.length == 0
            ? 'id,true'
            : splits.shift();

        splits = splits.replace(')', '');
        splits = splits.split(',');
        if (splits.length == 1)
            splits.push('true');
        
        let keyPath = splits.shift().trim();
        let autoincrement = splits.shift().trim() == 'true';
    
        storeSettings.push({key, keyPath, autoincrement});
        storeText = '';

    }

    for(let c of keysToInclude) {
        if (depth == 0 && c == ',') 
            processStoreText();
        else {
            storeText += c;
            if (c == '(') depth++;
            if (c == ')') depth--;
        }
    }

    processStoreText();

    return storeSettings;

}

function getDbVersion(dbName) {
    return new Promise((res,rej) => {
        let dbOpenRequest = indexedDB.open(dbName);
        dbOpenRequest.onsuccess = event => {
            let db = event.target.result;
            let v = db.version;
            db.close();
            res(v);
        };
    });
}

