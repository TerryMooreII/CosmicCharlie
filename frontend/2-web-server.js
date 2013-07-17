
var connect = require('connect');

connect.createServer(
    connect.static(__dirname)
).listen(8080);
console.log('Listening on port 8080');


/*******************************************************/

// var connect = require('connect');
// var http = require('http');

// var app = connect()
//     .use(connect.favicon())
//     .use(connect.logger())
//     .use(function(req, res){
//         res.end('Hello World')
//     });

// http.createServer(app).listen(8888);


/*******************************************************/


// var connect = require('connect');
// var http = require('http');

// var app = connect()
//     .use(connect.favicon())
//     .use(connect.logger())
//     .use(connect.static(__dirname), {redirect:true});

// http.createServer(app).listen(8888);


/*******************************************************/