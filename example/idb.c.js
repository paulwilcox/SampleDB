
let db = await 
    sampleIdb('SampleDB')
    .incomingJson('/example/SampleDB.json')
    .reset(true)
    .connect();

return true;

