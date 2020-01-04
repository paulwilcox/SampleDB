/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var SampleDB_idb2 = dbName => new connector(dbName);

class connector {

    constructor(dbName) {
        this.dbName = dbName;
    }

    incomingJson (json, keyFilter) {
        this.json = json;
        this.keyFilter = keyFilter;
        return this;
    }

    reset (deleteIfKeyNotFound = false) {
        this.deleteIfKeyNotFound = deleteIfKeyNotFound;
        return this;
    }

    async connect () {

        if (this.json.endsWith('.json')) {
            let response = await fetch(this.json);
            let json = await response.json();
            this.json = normalizeJson(json, this.keyFilter);
        }
        else 
            this.json = normalizeJson(json, keyFilter);

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
            dbOpenRequest.onerror = () => rej(`error opening ${this.dbName}`);
            dbOpenRequest.onupgradeneeded = event => 
                upgrade(event.target.result, this.json, this.deleteIfKeyNotFound);
        });

    }

}

function normalizeJson(json, keyFilter) {

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

    return json;

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
        
    let keyPaths = 
        json 
            ? Object.keys(json).map(key => ({ [key]: 'id' }))
            : null;

    let deleteKeys = 
        deleteIfKeyNotFound 
        ? [...db.objectStoreNames]
        : Object.keys(json);

    let droppedStores = [];

    for (let key of deleteKeys) { 
        if (![...db.objectStoreNames].includes(key))
            continue;
        await db.deleteObjectStore(key);
        droppedStores.push[key];
    }

    if (droppedStores.length > 0) {
        console.log();
        console.log(
            `dropped idb.${db.name} stores: ${droppedStores.join(',')}.`
        );
        console.log();
    }

    let createdStores = [];

    for (let key of Object.keys(json)) { 

        // if the first row of the store contains the expected key, 
        // then no autoincrement, otherwise yes.
        let store = await db.createObjectStore(key, {
            keyPath: keyPaths[key],
            autoIncrement: 
                   json[key].length > 0 
                && !Object.keys(json[key][0]).includes(keyPaths[key])
        });

        createdStores.push(key);

        for (let row of json[key]) 
            store.put(row);

    }

    if (createdStores.length > 0) {
        console.log();
        console.log(
            `created idb.${db.name} stores: ${createdStores.join(',')}.`
        );
        console.log();
    }


}

export default SampleDB_idb2;
