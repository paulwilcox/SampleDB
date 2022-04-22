/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

'use strict';

var require$$0 = require('mongodb');
var require$$1 = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);

let MongoClient = require$$0__default['default'].MongoClient;
let fs = require$$1__default['default'];

var SampleDB_mongo = url => new manager(url);

class manager {
    
    constructor(
        url // recommended: 'mongodb://localhost:27017/SampleDB'
    ) {
        this.url = url;
    }

    reset (
        json, 
        keysToInclude, 
        deleteIfKeyNotFound = false
    ) {

        if (json.endsWith('.json'))
            json = fs.readFileSync(json).toString();

        if (typeof json === 'string')
            json = JSON.parse(json);

        // Get the relevant keys from source
        if (keysToInclude) {

            keysToInclude = 
                keysToInclude
                .split(',')
                .map(str => str.trim());

            let j = {};
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

        try {

            let client = await MongoClient.connect(
                this.url, 
                { useUnifiedTopology: true}
            );

            let db = client.db();
            let targetKeys = (await db.collections()).map(c => c.collectionName);
            let sourceKeys = Object.keys(this.json);
            let droppedCollections = [];
            let createdCollections = [];

            // If reset was never called, just connect
            if (!this.json) 
                return db;

            // Drop irrelevant collections in target
            if(this.deleteIfKeyNotFound) {

                let keysToDelete = targetKeys
                    .filter(tk => !sourceKeys.includes(tk));                    

                for (let key of keysToDelete)               
                    await db.dropCollection(key);

                droppedCollections.push(...keysToDelete);

            }

            // replace relevant collections in target with source datasets 
            for (let sourceKey of sourceKeys) {
                if (targetKeys.includes(sourceKey)) {
                    await db.dropCollection(sourceKey);
                    droppedCollections.push(sourceKey);
                }
                await db.createCollection(sourceKey); 
                await db.collection(sourceKey).insertMany(this.json[sourceKey]);
                createdCollections.push(sourceKey);
            }

            // log activity
            if (droppedCollections.length > 0) console.log(
                `Dropped mongodb collections: ${droppedCollections.join(',')}.`
            );
            if (createdCollections.length > 0) console.log(
                `Created mongodb collections: ${createdCollections.join(',')}.`
            );

            return db;

        }
    
        catch(err) { 
            console.log(err); 
        } 

    }

}

module.exports = SampleDB_mongo;
