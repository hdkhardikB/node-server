var express = require('express');
var router = express.Router();
var sql = require('mssql');

/**
 * To get list of categories available.
 */
router.get('/getAll', function (req, res) {

    //a new request variable to handle sql operations.
    var request = new sql.Request(sql.db1);

    // Executes an SQL procedure command. and post operations
    request.execute('spGetCategories', function (err, recordsets, returnValue, affected) {
        console.log(recordsets);
        if (err) {
            console.error(err);
            res.json(err);
            return;
        }
        var categories = recordsets[0];
        res.json(categories); //Response with list of categories.
    });
});

module.exports = router;