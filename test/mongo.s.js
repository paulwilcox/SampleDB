async function test() {
        
    let db = await 
        sampleMongo('mongodb://localhost:27017/SampleDB')
        .reset('./test/SampleDB.json', 'students, scores')
        .connect();

    let collectionNames = 
        (await db.collections())
        .map(c => c.collectionName);

    return collectionNames.includes('students');

}