This markdown is available for insert into external projects that reference SampleDB.

## Getting Sample Data

Follow the instructions on the [SampleDB](https://github.com/paulwilcox/SampleDB) github page.  But if you really, really don't want to visit that page, a quick version follows.

In the console, do:

    npm install sampledb --save-dev

And, as needed in any .html or .js file, do:

    // client
    import sample from './node_modules/sampledb/dist/sampledb.client.js'; 
    import sampleIdb from './node_modules/sampledb/dist/sampledb.idb.js';

    // server
    let sample = require('sampledb'); // or require('./node_modules/sampledb/dist/sampledb.server.js');
    let sampleMongo = require('./node_modules/sampledb/dist/sampledb.mongo.js');

The default exports of sampledb.client.js and sampledb.server.js can be used as is.  They're simple javascript objects, so just start using them.  

For IndexedDB, a quick start that resets all data looks like this:

    sampleIdb('SampleDB', true)
    .then(db => 
        console.log([...db.objectStoreNames]) // or whatever
    );

For MongoDB, it looks like this:

    sampleMongo('mongodb://localhost:27017/SampleDB', true)
    .then(db =>
        console.log(db.getCollectionNames()) // or whatever
    );

To know the actual contents of the sample data, visit the github website referenced above, or just 

    console.log(sample);

    