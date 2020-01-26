let MongoClient = require('mongodb').MongoClient;
let fs = require('fs');

module.exports = url => new manager(url);

class manager {
    
    constructor(
        url // recommended: 'mongodb://localhost:27017/SampleDB'
    ) {
        this.url = url;
    }

    reset (
        json, 
        keyFilter, 
        deleteIfKeyNotFound = false
    ) {

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
            let targetKeys = (await db.collections()).map(c => c.s.name);
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
