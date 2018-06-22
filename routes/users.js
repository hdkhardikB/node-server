var express = require('express');
var router = express.Router();
var encrypt = require('../helpers/encryption.js');
var sql = require('mssql');
var jwt = require('jsonwebtoken');

require('dotenv').load();

router.get('/checkvaliduser', function (req, res) {
    var email = req.query["email"];
    var request = new sql.Request(sql.db1);
    request.input('email', email);
    request.execute("checkValidUser", function (err, recordsets, returnValue, affected) {
        console.log(recordsets);
        if (err) {
            console.error("err", err);
            res.status(401).json(err);
            return;
        }
        var result = recordsets[0][0]["returnval"];
        res.json(result === 1);
    });
});

router.post('/signup', function (req, res) {
    var email = req.body["email"];
    var password = req.body["password"];
    var mobile_no = req.body["mobile_no"];
    var first_name = req.body["first_name"];
    var last_name = req.body["last_name"];

    var request = new sql.Request(sql.db1);
    request.input('email', email);
    request.input('password', encrypt.Encrypt(password));
    request.input('first_name', first_name);
    request.input('last_name', last_name);
    request.input('mobile_no', mobile_no);
    // request.stream = true; // You can set streaming differently for each request
    request.execute("singupUser", function (err, recordsets, returnValue, affected) {
        console.log(recordsets);
        if (err) {
            console.error("err", err);
            res.status(500).json(err);
            return;
        }
        var usr = {
            email: email,
            mobile_no: mobile_no,
            ID: recordsets[0][0]["userId"],
            first_name: first_name,
            last_name: last_name
        };
        var payload = {
            admin: usr.email
        };

        var token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });
        res.json({
            success: true,
            token: token,
            user: usr
        });
    });
});


router.post('/loginUser', function (req, res) {

    var currentRs = 0; //used for keeping track of recordsets
    var usr = {
        email: '',
        mobile_no: '',
        ID: 0,
        first_name: 0,
        last_name: 0,
        status_code: 0
    };
    var user = req.body["user"];
    var password = req.body["password"];

    //Generate encrypted password to store in db.
    password = encrypt.Encrypt(req.body["password"]);

    //an sql request object
    var request = new sql.Request(sql.db1);

    request.input('pwd', password);
    request.input('email', user);
    request.stream = true; // You can set streaming differently for each request

    request.execute("spGetUser");
    request.on('recordset', function (columns) {
        console.log("columns", columns);
        currentRs += 1;
    });
    request.on('row', function (row) {
        console.log("row", row);
        usr.email = row.email;
        usr.first_name = row.first_name;
        usr.last_name = row.last_name;
        usr.mobile_no = row.mobile_no;
        usr.ID = row.id;
        usr.status_code = row.status_code;
    });

    request.on('error', function (err) {
        console.log("err", err);
        res.status(500).json({
            error: err.message
        });
        res.end();
    });

    request.on('done', function (response) {
        
        //checks for no response if there is an error in running
        //the stored procedure
        if (response != -1) {
            var payload = {
                admin: usr.email
            };
            
            //Generates API token
            var token = jwt.sign(payload, process.env.SECRET, {
                expiresIn: 60 * 60 * 24 // expires in 24 hours
            });
            res.json({
                success: usr.status_code > 0,
                token: usr.status_code > 0 ? token : "",
                user: usr
            });
        }
    });
});

module.exports = router;