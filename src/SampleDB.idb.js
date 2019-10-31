import sample from './SampleDB.client.js';

export default async function (
    
    dbName, 

    // omit to do no resets, 
    // pass true to reset from SampleDB,
    // pass an {object} of key:data's to reset to that database
    // pass an [{key,keyPath,data}] to reset to that database with keypaths
    // pass a 'key' to reset only that key from SampleDB          
    reset = false,

    // set to true to delete any dataset not represented in reset
    deleteWhenNotInReset = false 
    
) {
    
    let fullReset = reset === true && deleteWhenNotInReset;

    if (fullReset)
        await indexedDB.deleteDatabase(dbName);

    let version =
        fullReset ? 1 
        : reset ? await getDbVersion(dbName) + 1
        : undefined;

    return new Promise((res,rej) => {
        let dbOpenRequest = indexedDB.open(dbName, version);
        dbOpenRequest.onsuccess = event => res(event.target.result);
        dbOpenRequest.onupgradeneeded = 
            event => upgrade(event.target.result, reset, deleteWhenNotInReset);
    });

}

async function getDbVersion(dbName) {
    return new Promise((res,rej) => {
        let dbOpenRequest = indexedDB.open(dbName);
        dbOpenRequest.onsuccess = event => {
            let db = event.target.result;
            let v = db.version;
            db.close();
            res(v);
        };
    });
}

async function upgrade (db, reset, deleteWhenNotInReset) { 

    let isObject = typeof reset === 'object' && Object.keys(reset).length > 0;

    let datasets = 
        reset === true ? sample
        : isObject ? reset
        : typeof reset === 'string' ? { [reset]: sample[reset] }
        : Array.isArray(reset) ? reset.reduce((a,b) => Object.assign(a, {[b.key]: b.data}), {})
        : null;
        
    let keyPaths = 
        reset === true ? Object.keys(sample).map(key => ({ [key]: 'id' }))
        : isObject ? Object.keys(datasets).reduce((a,b) => Object.assign(a, {[b.key]: 'id' }), {})
        : typeof reset === 'string' ? { [reset]: { [key]: 'id' } }
        : Array.isArray(reset) ? reset.reduce((a,b) => Object.assign(a, {[b.key]: b.keyPath}), {})
        : null;

    let deleteKeys = 
        deleteWhenNotInReset 
        ? [...db.objectStoreNames]
        : Object.keys(datasets);
        
    for (let key of deleteKeys) { 
        if ([...db.objectStoreNames].indexOf(key) == -1)
            continue;
        console.log(`deleting ${key}`);
        await db.deleteObjectStore(key);
    }

    for (let key of Object.keys(datasets)) { 

        console.log(`creating ${key}`);

        // if the first row of the store contains the expected key, 
        // then no autoincrement, otherwise yes.
        let store = await db.createObjectStore(key, {
            keyPath: keyPaths[key],
            autoIncrement: datasets[key].length > 0 && !Object.keys(datasets[key][0]).includes(keyPaths[key])
        });

        for (let row of datasets[key]) 
            store.put(row);

    }

}

