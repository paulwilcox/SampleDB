let scTester = require('sctester');

let config = {
    testDirectory: './test',
    port: 8082,
    serverImports: `let sampleMongo = require('./src/SampleDB.mongo.js');`,
    clientImports: `import sampleIdb from '/src/SampleDB.idb.js';`
};

scTester(config);

