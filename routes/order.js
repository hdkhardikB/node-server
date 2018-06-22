var express = require('express');
var router = express.Router();
var sql = require('mssql');
//To save an order to database.
router.post('/save', function (req, res) {
    //product ids to be saved for user.
    var productIds = req.body["productIds"];
    //User id of the user.
    var userId = req.body["userId"];

    //a new request variable to handle sql operations.
    var request = new sql.Request(sql.db1);

    // input parameters of sql procedure.
    request.input('userId', userId);
    request.input('productIds', productIds);

    // Executes an SQL procedure command. and post operations
    request.execute('spSaveOrder', function (err, recordsets, returnValue, affected) {
        console.log(recordsets);
        if (err) {
            console.error(err);
            res.json(err);
            return;
        }
        var orderId = recordsets[0][0];
        res.json(orderId); //Returns back the new order id
    });
});

module.exports = router;