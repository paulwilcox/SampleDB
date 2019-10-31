# SampleDB

Sample data in a database like structure.  A core set of data is translated into node-consumable data, IndexedDB data, and MongoDB data.  You can specify what this core set is.  You can easily reset or repopulate the sample data in IndexedDB or MongoDB.  

### Getting Started

This is realy a package to help with development and testing, so:

`npm install sampledb --save-dev`

### Records

A record is an object with properties.

`
{ id: 1, name: 'John' };
`

### Tables

A table is an object with a 'key' property that names the table, and a 'data' property
that is an array of records which share these properties (though not always).

`
{
    key: 'people',
    data: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Jude', age: 15 }
    ]
};
`

### Databases

A database is an array of such tables. 

`
[{
    key: 'people',
    data: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Jude', age: 15 }
]},[
    key: 'interests',
    data: [
        { id: 1, person: 1, interest: 'baking' },
        { id: 2, person: 2, interest: 'drawing' },
        { id: 3, person: 3, interest: 'singing' },
        { id: 4, person: 3, interest: 'acting' }
    ]
]};
`