let scTester = require('sctester');

let config = {
    testDirectory: './test',
    port: 8082,
    serverImports: `let sampleMongo = require('./src/SampleDB.mongo2.js');`,
    clientImports: `import sampleIdb from '/src/SampleDB.idb2.js';`
};

scTester(config);

