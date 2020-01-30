async function test () {
        
    let client = await 
        sampleClient('/test/SampleDB.json', null);
        
    return client.data.customers.length > 0;

}