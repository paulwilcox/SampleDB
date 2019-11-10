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

There are four .js files you can use.  All have the same data, just in different form:

    // client
    import sample from './node_modules/sampledb/dist/sampledb.client.js'; 
    import sampleIdb from './node_modules/sampledb/dist/sampledb.idb.js';

    // server
    let sample = require('sampledb'); // or require('./node_modules/sampledb/dist/sampledb.server.js');
    let sampleMongo = require('./node_modules/sampledb/dist/sampledb.mongo.js');

### Usage, the quick way

The sampledb.client.js and sampledb.server.js can be used as is.  They are standard
javascript objects as described above.  Just start using them!

For any other database, you have at least one further step to actually load the data.  
If all you desire is to load the same data as exists in sampledb.client.js, then 
it's pretty easy.  Just plug in the name or path to the database you're seeking to 
work with, pass 'true' as the second parameter:

    sampleIdb('SampleDB', true);
    sampleMongo('mongodb://localhost:27017/SampleDB', true);

These return promises of the opened databases.  So really it's more like this:

    sampleIdb('SampleDB', true)
    .then(db => 
        console.log([...db.objectStoreNames]) // or whatever
    );

    sampleMongo('mongodb://localhost:27017/SampleDB', true)
    .then(db =>
        console.log(db.getCollectionNames()) // or whatever
    );

### Usage, general

In general, any SampleDB object (aside from the base server and client objects) will return a promise and is instantiated with the following parameters:

- Connection: Required.  Might simply be a databae name, a url, or a connection string.  
- Reset: Optional, default is 'false'.  Determines which tables to reset, if any.
- DeleteWhenNotInReset: Optional, default is 'false'.  Determines whether to drop tables 
  that are not represented in 'Reset'.  

The `reset` parameter has a variety of input possibilities:

- Omit to do no resets, 
- Pass `true` to reset with the same data that exists in SampleDB.client.js,
- Pass an object structured as a database (see above) to reset the state with that data
- Pass a string representing a table in SampleDB to reset only that table   

The following is an example of resetting a database in IndexedDB with custom data.  It
will create (or reset) a table called 'new'.  Any other existing tables will be preserved.

    sampleIdb(
        'SampleDB', 
        { new: [{a: 'eigh', b: 'bee', c: 'sea'}] }
    );

And this is an example of creating or resetting the 'customers' table and dropping any other
tables.

    sampleIDB('SampleDB', 'customers', true);

If working with IndexedDB, and you need to set the keyPath fields, pass an array of 
objects with 'key' (string), 'keyPath' (string), and 'data' (array) as prperties.  

- 'Key' is the name of the table.
- 'keyPath' is the property that serves as the imary key
- 'data' is the tabular data.  

### The core data

The core sample data on which all files are based is SampleDB.client.js, which looks like this:

    export default {

        products: [
            { id: 123456, price: 5 },
            { id: 123457, price: 2 },
            { id: 123458, price: 1.5 },
            { id: 123459, price: 4 }
        ],        

        customers: [
            { id: 1, fullname: "Jane Doe" },
            { id: 2, fullname: "John Doe" }
        ],  

        potentialCustomers: [
            { id: 2, fullname: "Johnathan Doe" },
            { id: 3, fullname: "John Q. Public" },
            { id: 4, fullname: "John J. Gingleheimer-Schmidt" }
        ],

        shoplifters: [
            { id: 4, fullname: "John J. Gingleheimer-Schmidt" },
            { id: 5, fullname: "Sneaky Pete" }
        ],

        orders: [
            { id: 901, customer: 1, product: 123456, speed: 1, rating: 2 },
            { id: 902, customer: 1, product: 123457, speed: 2, rating: 7 },
            { id: 903, customer: 2, product: 123456, speed: 3, rating: 43 },
            { id: 904, customer: 2, product: 123457, speed: 4, rating: 52 },
            { id: 905, customer: 1, product: 123459, speed: 5, rating: 93 },
            { id: 906, customer: 1, product: 123459, speed: 6, rating: 74 },
            { id: 907, customer: 2, product: 123458, speed: 7, rating: 3 },
            { id: 908, customer: 2, product: 123458, speed: 8, rating: 80 },
            { id: 909, customer: 1, product: 123459, speed: 7, rating: 23 },
            { id: 910, customer: 1, product: 123459, speed: 8, rating: 205 },
            { id: 911, customer: 1, product: 123459, speed: 3, rating: 4 },
            { id: 912, customer: 7, product: 123457, speed: 2, rating: 6 } // notice no customer 7 (use for outer joins)
        ],    

        students: [
            { id: "a", name: "Andrea" },
            { id: "b", name: "Becky" },
            { id: "c", name: "Colin" }
        ],

        foods: [
            { id: 1, name: 'tacos' },
            { id: 2, name: 'skittles' },
            { id: 3, name: 'flan' }
        ],

        scores: [
            {id: 1, student: "a", score: 5 },
            {id: 2, student: "b", score: 7 },
            {id: 3, student: "c", score: 10 },
            {id: 4, student: "a", score: 0 },
            {id: 5, student: "b", score: 6 },
            {id: 6, student: "c", score: 9 }
        ]

    }


