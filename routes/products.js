var express = require('express');
var router = express.Router();
var sql = require('mssql');

/**
 * To get the product based on id provided.
 */
router.get('/getProductById', function (req, res) {
  //the product id to be fetched.
  var productId = req.query["productId"];

  //a new request variable to handle sql operations.
  var request = new sql.Request(sql.db1);
  // an input parameter of sql procedure.
  request.input('productId', productId);
  // Executes an SQL procedure command.
  request.execute('spProductDetail', function (err, recordsets, returnValue, affected) {
    console.log(recordsets);
    if (err) {
      console.error(err);
      res.json(err);
      return;
    }
    var productDetail = recordsets[0][0]; //The product been fetched.
    productDetail.category = recordsets[1][0]; //The category of particular product.
    console.log(productDetail);
    res.json(productDetail); //returns back the response of products
  });
});

/**
 * To get list of products for given category.
 */
router.get('/getProductsByCategory', function (req, res) {
  //Category id for which products are suppossed to fetched.
  var categoryId = req.query["categoryId"];

  //a new request variable to handle sql operations.
  var request = new sql.Request(sql.db1);

  // an input parameter of sql procedure.
  request.input('categoryId', categoryId);
  // Executes an SQL procedure command. and post operations
  request.execute('spGetProductsByCategory', function (err, recordsets, returnValue, affected) {
    console.log(recordsets);
    if (err) {
      console.error(err);
      res.json(err);
      return;
    }
    var products = recordsets[0];
    res.json(products); //returns back the response of products
  });
});

module.exports = router;