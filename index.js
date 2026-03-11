const fs = require('fs');
const http = require('http');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;

    //const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
    //console.log(slugs);

    // Overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html'});

        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');

        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

        res.end(output);

    // Product page
    } else if (pathname === '/product') {
        const id = parseInt(reqUrl.searchParams.get('id'), 10);
        if (Number.isNaN(id) || id < 0 || id >= dataObj.length) {
            res.writeHead(404, { 'Content-type': 'text/html' });
            res.end('<h1>Product not found!</h1>');
        } else {
            res.writeHead(200, { 'Content-type': 'text/html' });
            const product = dataObj[id];
            const output = replaceTemplate(tempProduct, product);
            res.end(output);
        }

    // API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json'});
        res.end(data);

    // Not found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page not found!</h1>');
    }
});

server.listen(8000, 'localhost', () => {
    console.log('Listening to requests on port 8000');
});