/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var SampleDB_idb = dbName => new manager(dbName);

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
            dbOpenRequest.onerror = () => rej(`error opening ${this.dbName}`);
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

        // trim irrelevant keys from source
        if (this.keysToInclude) {

            this.keysToInclude = this.keysToInclude
                .split(',')
                .map(k => k.trim());

            for(let jkey of Object.keys(this.json)) 
                if (!this.keysToInclude.includes(jKey))
                    delete this.json[jkey];

        }
        
        // Reset the entire database if parameters imply full reset
        if (this.fullReset)
            new Promise((res,rej) => {
                let request = indexedDB.deleteDatabase(this.dbName);
                request.onsuccess = event => {
                    console.log(`deleting database ${this.dbName}`);
                    res(event.target.result);
                };
                request.onerror = () => 
                    rej(`error deleteing ${this.dbName}`);
            });

        
    }    

/*
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
*/
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
    
            if (targetKeys.includes(sourceKey)) {
                await db.deleteObjectStore(sourceKey);
                deletedStores.push(sourceKey);
            }
    
            // Order of non-numeric keys is by insertion, so 
            // this gets the first key of the first row 
            let keyPath = Object.keys(this.json[sourceKey][0])[0];

            let store = await db.createObjectStore(
                sourceKey, 
                { keyPath, autoIncrement: true }
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

export default SampleDB_idb;
