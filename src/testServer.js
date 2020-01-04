let fs = require('fs');
let config = {
    serverImports: `let sampleMongo = require('./SampleDB.mongo2.js');`,
    clientImports: `import sampleIdb from './SampleDB.idb2.js';`
};

let ts = fs
    .readFileSync('./testServerTemplate.js').toString()
    .replace('__serverImports__', config.serverImports)
    .replace('__clientImports__', config.clientImports);

eval(ts);

let server = startServer();

server.close();
