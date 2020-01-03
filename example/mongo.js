let sampleMongo = require('../dist/SampleDB.mongo2.js');

(async () => {

    let db = await 
        sampleMongo('mongodb://localhost:27017/SampleDB')
        .incomingJson('./example/SampleDB.json', 'students, scores')
        .reset(false)
        .connect();

    let collections = await db.collections();
    
    let collectionNames = collections.map(c => c.s.name);

    console.log({ collectionNames });

})()