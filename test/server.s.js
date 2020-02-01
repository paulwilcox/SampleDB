async function test() {
        
    let db = 
        sampleServer('./test/SampleDB.json', 'students, scores')
        .data;

    return db.students.length > 1;

}