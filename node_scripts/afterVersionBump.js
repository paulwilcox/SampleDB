let pjVersion = require('../package.json').version;
let fs = require('fs');
let path = require('path');

fs.readdirSync('./dist')
    .filter(file => 
        /sampleData\.\w+\.\d.+\.\js$/.test(file)
    )
    .forEach(file => fs.unlinkSync(`.\\dist\\${file}`));

fs.readdirSync('./dist').forEach(file => {
    
    let source = `./dist/${file}`;
    let target = `./dist/${path.basename(fileType,'.js')}.${pjVersion}.js`;

    fs.copyFile(source, target, err => {
        if (err) throw err;
        console.log(`created ${target} from ${source}`);
    });

});


