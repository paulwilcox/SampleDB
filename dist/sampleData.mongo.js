/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var mongodb = _interopDefault(require('mongodb'));

/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var sampleData_client = {

    products: [
        { id: 123456, price: 5 },
        { id: 123457, price: 2 },
        { id: 123458, price: 1.5 },
        { id: 123459, price: 4 }
    ],        

    customers: [
        { id: 1, fullname: "Jane Doe" },
        { id: 2, fullname: "John Doe" }
    ],  

    potentialCustomers: [
        { id: 2, fullname: "Johnathan Doe" },
        { id: 3, fullname: "John Q. Public" },
        { id: 4, fullname: "John J. Gingleheimer-Schmidt" }
    ],

    shoplifters: [
        { id: 4, fullname: "John J. Gingleheimer-Schmidt" },
        { id: 5, fullname: "Sneaky Pete" }
    ],

    orders: [
        { id: 901, customer: 1, product: 123456, speed: 1, rating: 2 },
        { id: 902, customer: 1, product: 123457, speed: 2, rating: 7 },
        { id: 903, customer: 2, product: 123456, speed: 3, rating: 43 },
        { id: 904, customer: 2, product: 123457, speed: 4, rating: 52 },
        { id: 905, customer: 1, product: 123459, speed: 5, rating: 93 },
        { id: 906, customer: 1, product: 123459, speed: 6, rating: 74 },
        { id: 907, customer: 2, product: 123458, speed: 7, rating: 3 },
        { id: 908, customer: 2, product: 123458, speed: 8, rating: 80 },
        { id: 909, customer: 1, product: 123459, speed: 7, rating: 23 },
        { id: 910, customer: 1, product: 123459, speed: 8, rating: 205 },
        { id: 911, customer: 1, product: 123459, speed: 3, rating: 4 },
        { id: 912, customer: 7, product: 123457, speed: 2, rating: 6 } // notice no customer 7 (use for outer joins)
    ],    

    students: [
        { id: "a", name: "Andrea" },
        { id: "b", name: "Becky" },
        { id: "c", name: "Colin" }
    ],

    foods: [
        { id: 1, name: 'tacos' },
        { id: 2, name: 'skittles' },
        { id: 3, name: 'flan' }
    ],

    scores: [
        {id: 1, student: "a", score: 5 },
        {id: 2, student: "b", score: 7 },
        {id: 3, student: "c", score: 10 },
        {id: 4, student: "a", score: 0 },
        {id: 5, student: "b", score: 6 },
        {id: 6, student: "c", score: 9 }
    ]

};

var sampleData_server = sampleData_client;

let MongoClient = mongodb.MongoClient;


var sampleData_mongo = (

    url = 'mongodb://localhost:27017/sampleData', 

    // omit to do no resets, 
    // pass true to reset from sampleData,
    // pass an {object} of key:data's to reset to that database
    // pass a 'key' to reset only that key from sampleData  
    reset = false,

    // set to true to delete any dataset not represented in reset
    deleteWhenNotInReset = false

) =>

    MongoClient.connect(url, { useNewUrlParser: true})
    .then(async client => {

        let db = client.db();
        let collections = await db.collections();
        let collectionNames = await collections.map(c => c.s.name);

        if (!reset)
            return db;

        let datasets = 
            reset === true ? sampleData_server
            : typeof reset === 'object' && Object.keys(reset).length > 0 ? reset
            : typeof reset === 'string' ? { [reset]: sampleData_server[reset] }
            : null;

        let deleteKeys = 
            deleteWhenNotInReset 
            ? collectionNames
            : Object.keys(datasets);

        for (let key of deleteKeys) {                
            if (collectionNames.indexOf(key) == -1)
                continue;
            console.log('deleteing: ' + key);
            await db.dropCollection(key);
        }

        for (let key of Object.keys(datasets)) {
            console.log('creating: ' + key);
            await db.createCollection(key); 
            await db.collection(key).insertMany(datasets[key]);
        }

        return db;

    })
    .catch(err => console.log(err));

module.exports = sampleData_mongo;
