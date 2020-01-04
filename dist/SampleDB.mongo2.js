/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

'use strict';

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');

module.exports = url => new connector(url);

class connector {
    
    constructor(
        url // recommended: 'mongodb://localhost:27017/SampleDB'
    ) {
        this.url = url;
    }

    incomingJson (json, keyFilter) {

        if (json.endsWith('.json'))
            json = fs.readFileSync(json).toString();

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
        return this;

    }

    reset (deleteIfKeyNotFound = false) {
        this.deleteIfKeyNotFound = deleteIfKeyNotFound;
        return this;
    }

    async connect () { 

        try {

            let client = await MongoClient.connect(
                this.url, 
                { useNewUrlParser: true}
            );

            let db = client.db();
            let collections = await db.collections();
            let collectionNames = await collections.map(c => c.s.name);
            let droppedCollections = [];
            let createdCollections = [];

            if (!this.json)
                return db;

            let deleteKeys = 
                this.deleteIfKeyNotFound 
                ? collectionNames
                : Object.keys(this.json);

            for (let key of deleteKeys) {                
                if (collectionNames.indexOf(key) == -1)
                    continue;
                await db.dropCollection(key);
                droppedCollections.push(key);
            }

            if (droppedCollections.length > 0) {
                droppedCollections = droppedCollections.join(',');
                console.log();
                console.log(
                    `Dropped mongodb collections: ${droppedCollections}.`
                );
                console.log();
            }

            for (let key of Object.keys(this.json)) {
                await db.createCollection(key); 
                await db.collection(key).insertMany(this.json[key]);
                createdCollections.push(key);
            }

            if (createdCollections.length > 0) {
                createdCollections = createdCollections.join(',');
                console.log();
                console.log(
                    `Created mongodb collections: ${createdCollections}.`
                );
                console.log();
            }

            return db;

        }
    
        catch(err) { 
            console.log(err); 
        } 

    }

}
