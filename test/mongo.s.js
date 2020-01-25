// let sampleMongo = require('../src/SampleDB.mongo2.js');

let db = await 
    sampleMongo('mongodb://localhost:27017/SampleDB')
    .incomingJson('./test/SampleDB.json', 'students, scores')
    .reset(false)
    .connect();

let collections = await db.collections();

let collectionNames = collections.map(c => c.s.name);

return collectionNames.includes('students');

