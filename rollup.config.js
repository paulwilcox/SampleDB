import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import license from 'rollup-plugin-license';

// Run license() here, not in the objects of the exported 
// array.  Otherwise, the third party licence file gets 
// overwritten, not appended to.
let licensePlugin = license({
    banner: { content: { file: 'license.md' } },
    thirdParty: {
        output: 'license-3rd-party',
        includePrivate: true
    }
});

export default [{ 
    // This one just moves the file
    input: 'src/SampleDB.client.js',
    output: {
        file: 'dist/SampleDB.client.js',
        format: 'esm'
    },
    plugins: licensePlugin
}, {
    input: 'src/SampleDB.client.js',
    output: {
        file: 'src/SampleDB.server.js',
        format: 'cjs'
    },
    plugins: licensePlugin
}, {
    input: 'src/SampleDB.client.js',
    output: {
        file: 'dist/SampleDB.server.js',
        format: 'cjs'
    },
    plugins: licensePlugin
}, {
    input: 'src/SampleDB.idb.js',
    output: {
        file: 'dist/SampleDB.idb.js',
        format: 'esm'
    },
    plugins: [
        nodeResolve({ jsnext: true }), 
        commonJs({ include: 'node_modules/**' }), 
        licensePlugin
    ],    
}, {
    input: 'src/SampleDB.mongo.js',
    output: {
        file: 'dist/SampleDB.mongo.js',
        format: 'cjs'
    },
    plugins: [commonJs(), licensePlugin]
}, {
    input: 'src/SampleDB.mongo2.js',
    output: {
        file: 'dist/SampleDB.mongo2.js',
        format: 'cjs'
    },
    plugins: [commonJs({ include: 'node_modules/**' }), licensePlugin]
}];

