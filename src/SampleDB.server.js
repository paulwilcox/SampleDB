let fs = require('fs');

module.exports = (json, keysToInclude) => 
    new manager().reset(
        json, 
        keysToInclude
    );

class manager {

    constructor() {
        this.data = {};
    }

    reset (
        json, 
        keysToInclude, 
        deleteIfKeyNotFound = false
    ) {

        if (json.endsWith('.json')) 
            json = fs.readFileSync(json).toString();

        if (typeof json === 'string')
            json = JSON.parse(json);

        // Get the relevant keys from source
        if (keysToInclude) {

            keysToInclude = 
                keysToInclude
                .split(',')
                .map(str => str.trim());

            let j = {};
            for (let entry of Object.entries(json))   
                if (keysToInclude.includes(entry[0])) 
                    j[entry[0]] = entry[1];

            json = j;

        }

        // delete irrelevant keys in target
        if (deleteIfKeyNotFound) {

            let targetKeys = Object.keys(this.data);
            let sourceKeys = Object.keys(json);

            let keysToDelete = targetKeys
                .filter(tk => !sourceKeys.includes(tk));

            for (let key of keysToDelete)                
                delete this.data[key];

        }

        // reset the target keys with the source keys
        for(let entry of Object.entries(json))
            this.data[entry[0]] = json[entry[0]];
      
        return this;

    }

}

