/**
 * ISC License (ISC)
 * Copyright (c) 2019, Paul Wilcox <t78t78@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

'use strict';

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
