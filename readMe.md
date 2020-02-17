# SampleDB

Sample data in a database-like structure.  A core set of data is translated 
into Node-consumable data, IndexedDB data, and MongoDB data.  Alternatively,
you can load custom data into IndexedDB or MongoDB with a consistent interface
accross database types.  

### Form of data

A 'row' ('record', 'line', etc) is an object with properties.

    { id: 1, fullname: "Jane Doe" }

A 'table' ('collection, 'objectStore', 'dataset', etc) is an array of 
such objects, usually, though not always, with shared properties.

    [
        { id: 1, fullname: "Jane Doe" },
        { id: 2, fullname: "John Doe" }
    ]  

A database is an object with tables as properties. 

    {

        customers: [
            { id: 1, fullname: "Jane Doe" },
            { id: 2, fullname: "John Doe" }
        ],

        products: [
            { id: 123456, price: 5 },
            { id: 123457, price: 2 },
            { id: 123458, price: 1.5 },
            { id: 123459, price: 4 }
        ]

    }

### Getting Started

This is realy a package to help with development and testing, so, in your
console, do:

    npm install sampledb --save-dev

### General Usage

The general idea is that you ... 

    let db = 
        sampledbConnector(dbName-or-url)
        .reset(json, keysToInclude, deleteIfKeyNotFound) // data resetting
        .connect() // connect to the source after any resetting
        .then(data => do something with data);

- json: json data or retriever of json data (such as a filepath or url route) 
- keysToInclude: Which keys in json to include?  Leave null or undefined to include all keys.   
- deleteIfKeyNotFound: boolean determining whether to drop tables not in the filter.  Set to false or ignore to keep tables, but leave them unrefreshed.

For sampledb.server.js and sampledb.client.js, there's no source you connect to, so, resetting parameters exist right in the initialization.  Also, you aren't left with a promise.  Instead, just call it's `data` property and get working:

    let rows = sampledbConnector(
        json, 
        keysToInclude,
        deleteIfKeysNotFound
    ).data;

### sampledb.server.js

    let sample = require('sampledb');
    // or './node_modules/sampledb/dist/sampledb.server.js'

    let connector = sampleServer(
        './test/SampleDB.json', // or just pass string of json data
        'students, scores' // or leave undefined for everything
    );

    let customersTable = connector.data.customers;
    // do something with customersTable

### sampledb.client.js

    // This assumes your server is set up to server a 
    // json file when './test/SampleDB.json' is routed 

    import sample from './node_modules/sampledb/dist/sampledb.client.js'; 

    async function getCustomers () {

        let connector = await sampleServer(
            './test/SampleDB.json', 
            'students, scores'
        );

        return connector.data.customers;

    }

    // do something with getCustomers

### sampledb.mongo.js

    let sampleMongo = require('./node_modules/sampledb/dist/sampledb.mongo.js');

    async function listCollections() {
            
        // The third parameter to 'reset' means that any table not
        // named 'students' or 'scores' will be dropped.
        // Pass false or omit the parameter to keep the tables, but
        // to leave them unrefreshed.

        let db = await 
            sampleMongo('mongodb://localhost:27017/SampleDB')
            .reset('./test/SampleDB.json', 'students, scores', true)
            .connect();

        let collectionNames = 
            (await db.collections())
            .map(c => c.s.name);

        return collectionNames;

    }

### sampledb.idb.js

    import sampleIdb from './node_modules/sampledb/dist/sampledb.idb.js';

    async function getCustomerRows () {
            
        let db = await 
            sampleIdb('SampleDB')
            .reset('/test/SampleDB.json', null, true)
            .connect();

        let storeReqest = 
            db.transaction('customers')
            .objectStore('customers')
            .getAll();

        return new Promise((res,rej) => {
            storeReqest.onsuccess = event => {
                let rows = event.target.result;
                res(rows);
            };
            storeReqest.onerror = event => rej(storeReqest.error);
        });

    }



