async function test () {
        
    let db = await 
        sampleIdb('SampleDB')
        .reset('/test/SampleDB.json', null, true)
        .connect();

    let storeReqest = 
        db.transaction('customers')
        .objectStore('customers')
        .getAll();

    return new Promise((res,rej) => {
        storeReqest.onsuccess = event => {
            let rows = event.target.result;
            res(rows.length > 0);
        };
        storeReqest.onerror = event => { throw storeReqest.error; };
    });

}