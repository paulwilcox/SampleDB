let fs = require('fs');
let config = {
    testDirectory: './example',
    port: 8082,
    serverImports: `let sampleMongo = require('./src/SampleDB.mongo2.js');`,
    clientImports: `import sampleIdb from '/src/SampleDB.idb2.js';`
};

let ts = fs
    .readFileSync('./testServerTemplate.js').toString()
    .replace('__testDirectory__', config.testDirectory)
    .replace('__port__', config.port)
    .replace('__serverImports__', config.serverImports)
    .replace('__clientImports__', config.clientImports);

eval(ts);

