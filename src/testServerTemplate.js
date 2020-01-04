let http = require('http');
let fs = require('fs');
__serverImports__

let testDirectory = 'example';

function startServer () { 
    
    console.log('server starting on 8082');

    return http.createServer(async (request, response) => {

        let cType =
            request.url.endsWith('.css') ? 'text/css'
            : request.url.endsWith('.js') ? 'text/javascript'
            : request.url.endsWith('.html') ? 'text/html'
            : request.url.endsWith('.json') ? 'text/json'
            : null;

        if (cType == null) {
            response.writeHead(204);
            response.end();
        }

        let content;

        try {
            content = fs.readFile(`.${testDirectory}/url`);        
        }
        catch (error) {
            response.writeHead(500);
            response.end(error.message);
        }

        if (request.url.startsWith(testDirectory)) {

            cType = 'text/html';
            content = `
    
                <body>
                <script type = 'module'>
            
                    __clientImports__

                    async function testFunc () {
                        ${content}  
                    } 
    
                    let div = document.createElement('div');
                    div.id = 'results'; 
    
                    let t0 = performance.now();
    
                    testFunc()
                    .then(res => {
                        div.innerHTML = res;
                    })
                    .then(() => 
                        div.innerHTML += ';' + (performance.now() - t0)
                    )
                    .finally(() => document.body.appendChild(div));
    
                </script>
                </body> 
    
            `;

        }

    })
    .listen(8082);

}
