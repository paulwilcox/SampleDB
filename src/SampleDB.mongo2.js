let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');

module.exports = (url) => new connector(url);

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
                    `The following mongodb collections were dropped: ${droppedCollections}.`
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
                    `The following mongodb collections were created: ${createdCollections}.`
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
