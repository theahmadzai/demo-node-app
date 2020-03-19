const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

http.createServer((req, res) => {
    unifiedServer(req, res);
}).listen(config.httpPort, () => {
    console.log(`HTTP Server started on port ${config.httpPort}!`);
});

httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, './https/key.pem'), 'utf8'),
    'cert': fs.readFileSync(path.join(__dirname, './https/cert.pem'), 'utf8')
};

https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
}).listen(config.httpsPort, () => {
    console.log(`HTTPS Server started on port ${config.httpsPort}!`);
});


const unifiedServer = (req, res) => {
    let parsedUrl = url.parse(req.url, true);

    let method = req.method.toLowerCase();
    let path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    let queryStringObject = parsedUrl.query;
    let headers = req.headers;
    let buffer = '';

    let decoder = new StringDecoder('utf-8');

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        let handler = handlers.notFound;

        if (typeof (router[path]) !== 'undefined') {
            handler = router[path];
        }

        let data = {
            path,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        let responseHandler = (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            payload = typeof (payload) == 'object' ? payload : {};

            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning response: ', statusCode, payloadString);
        };

        handler(data, responseHandler);
    });
};


const router = {
    'home': handlers.home,
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens
}
