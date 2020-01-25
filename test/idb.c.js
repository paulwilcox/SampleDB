
let db = await 
    sampleIdb('SampleDB')
    .incomingJson('/test/SampleDB.json')
    .reset(true)
    .connect();

return true;