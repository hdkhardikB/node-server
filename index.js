var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var categories = require('./routes/categories');
var products = require('./routes/products');
var users = require('./routes/users');
var orders = require('./routes/order');
var path = require('path');
var jwt = require('jsonwebtoken');
require('dotenv').load();

var port = process.env.PORT || 8080;
var app = express();
var sql = require('mssql');

//Config and connect the SQL Server.
sql.db1 = new sql.Connection({
    user: process.env.DB2_USER,
    password: process.env.DB2_PASS,
    server: process.env.DB2_SERVER,
    database: process.env.DB2,
}, function (err) {
    if (err) console.error("def", err);
});

/**
 * If connection error is there while connecting
 */
sql.db1.on('error', function (err) {
    console.error('DB1 ' + err);
    if (err.code == 'ECONNCLOSED') {
        sql1.db1.connect();
    }
});

app.use(function (req, res, next) {
    var oneof = false;
    //&& req.headers.origin.match(/hercle.com/g))
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        oneof = true;
    }
    if (req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if (req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if (oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));

//Defining separate routes for every modules.
app.use('/', routes);
app.use('/user', users);


// Authorization of all other routes apart from users.
app.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

app.use('/products', products);
app.use('/categories', categories);
app.use('/orders', orders);
app.all('/*', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', {
        root: path.join(__dirname, '/public/')
    });
});
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
module.exports = app;