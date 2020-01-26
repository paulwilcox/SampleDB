export default dbName => new manager(dbName);

class manager {

    constructor(dbName) {
        this.dbName = dbName;
    }

    reset (
        json, 
        keyFilter,
        deleteIfKeyNotFound = false
    ) {

        if (json.endsWith('.json')) 
            let json = (await fetch(this.json)).json();

        if (typeof json === 'string')
            json = JSON.parse(json);

        if (keyFilter) {
            let j = {};
            let keysToInclude = keyFilter.split(',').map(str => str.trim());
            for (let entry of Object.entries(json))   
                if (keysToInclude.includes(entry[0])) 
                    j[entry[0]] = entry[1];
            json = j;
        }

        this.json = json;
        this.deleteIfKeyNotFound = deleteIfKeyNotFound;
        return this;

    }

    async connect () {

        if (this.deleteIfKeyNotFound)
            await new Promise((res,rej) => {
                let request = indexedDB.deleteDatabase(this.dbName);
                request.onsuccess = event => res(event.target.result);
                request.onerror = () => rej(`error deleteing ${this.dbName}`);
            });

        let version =
            this.deleteIfKeyNotFound ? 1 
            : this.json ? await getDbVersion(dbName) + 1
            : undefined;

        return await new Promise((res,rej) => {
            let dbOpenRequest = indexedDB.open(this.dbName, version);
            dbOpenRequest.onsuccess = event => res(event.target.result);
            dbOpenRequest.onerror = () => rej(`error opening ${this.dbName}`)
            dbOpenRequest.onupgradeneeded = event => 
                upgrade(event.target.result, this.json, this.deleteIfKeyNotFound);
        });

    }

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

async function upgrade (db, json, deleteIfKeyNotFound) { 
        
    let keyPaths = json 
        ? Object.keys(json).map(key => ({ [key]: 'id' }))
        : null;

    let targetKeys = [...db.objectStoreNames];
    let sourceKeys = Object.keys(json);
    let droppedStores = [];
    let createdStores = [];

    // delete irrelevant stores from target
    if (deleteIfKeyNotFound) {

        let keysToDelete = targetKeys
            .filter(tk => !sourceKeys.includes(tk));

        for (let key of keysToDelete) 
            await db.deleteObjectStore(key);

        droppedStores.push(...keysToDelete);

    }

    // add relevant stores to target
    for (let sourceKey of sourceKeys) { 

        if (targetKeys.includes(sourceKey)) {
            await db.deleteObjectStore(sourceKey);
            deletedStores.push(sourceKey);
        }

        let keyPath = keyPaths[sourceKey];
        let autoincrement = 
            json[sourceKey]
            .find(row => Object.keys(row).includes(keyPath));

        // if the first row of the store contains the expected key, 
        // then no autoincrement, otherwise yes.
        let store = await db.createObjectStore(
            sourceKey, 
            {keyPath, autoIncrement}
        );

        for (let row of json[sourceKey]) 
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