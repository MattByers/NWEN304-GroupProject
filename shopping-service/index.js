const SALT_ROUNDS = 10;
const tokenSecret = 'i need to change this secret'; //PLEASE CHANGE ME SOON



/*-------------------------------------------------- MODULES --------------------------------------------------*/



var port = process.env.PORT || 8080;
var express = require('express');
var path = require("path");
var pg = require("pg").native;
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var squel = require('squel');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');



/*-------------------------------------------------- MIDDLEWARE SETUP --------------------------------------------------*/



//Create the express app
var app = express();

//Setup the connection string to the database and connect to it
var connectionString = 'postgres://luuyzgizzvhmgw:jZbnKaGUolV3qXTv2nKeZyfkXk@ec2-54-235-65-221.compute-1.amazonaws.com:5432/d6tisfgcqns11n';
var client = new pg.Client(connectionString);
client.connect();

//Body Parser setup
app.use( bodyParser.json() ); // to support JSON­encoded bodies
app.use(bodyParser.urlencoded({ // to support URL­encoded bodies
  extended: true
}));

//JWT Authorization setup - THIS SECRET HAS TO BE SET TO SOMETHING BETTER -
//app.use(expressJWT({secret: tokenSecret}).unless({ path: ['/', '/public', '/login', '/register', '/products']}));
//I've decided I will only protect the API routes I want, instead of using this unless syntax, which is bugging my static page.

//static setup
//app.use("/css", express.static(__dirname + '/css'));
//app.use("/js", express.static(__dirname + '/js'));
//app.use("/fonts", express.static(__dirname + '/fonts'));
//app.use(express.static(__dirname + '/public'));
app.use('/', express.static('public'));

//Header setup
app.use(function(req, res, next) {
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
    if (req.method === 'OPTIONS') return res.send(200)
  }
  next();
})



/*-------------------------------------------------- RESTFUL API --------------------------------------------------*/

/* REQUESTS RELATING TO MULTIPLE PRODUCTS :-- '/products' */

//REMOVED the GET REQUEST here as it's functionality is covered by the PUT REQUEST below.

//PUT request for filtering products by various catergories, body is used to parse filter information
app.put('/products', function(req, res){
  var query = "SELECT * FROM products;";
  console.log("HIT")
  if(req.body.name != null){
    query = "SELECT * FROM products WHERE product_name='" + req.body.name + "';";
  } else if (req.body.search != null) {
    //find all products that relate to a search term, will likely replace the above statement. ALSO not sure how to do this...
  } else if (req.body.productType != null) {
    //find all products of a specific catergory
  }

  client.query(query, function (error, data) {

    if(error) {
      res.status(400).json({
        status: 'failed',
        message: 'failed to retrieve all products'
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: data.rows,
        message: 'successfully retrieved all products'
      });
    }
  })
});


/* REQUESTS RELATING TO A SINGLE PRODUCT :-- '/product' */

//GET request for filtering product by ID, I need to do this for productname filtering ^^ too
app.get('/product/:productID', function(req, res) {
  var query = "SELECT * FROM products WHERE productID='" +
  parseInt(req.params.productID) + "';";

  client.query(query, function(error, data){

        if(error) {
          res.status(400).json({
            status: 'failed',
            message: 'failed to retrieve product'
          });
        } else {
          res.status(200).json({
            status: 'success',
            data: data.rows,
            message: 'successfully retrieved product'
          });
        }
  })
});

//POST request to create a new product, should probably be restricted to admins at some stage...
app.post('/product', function(req, res) {
  var productName = req.body.productName;
  var productDesc = req.body.productDesc;
  var price = req.body.price;

  var query = squel.insert().into('products')
                    .setFields({"product_name": productName, "product_description": productDesc, "price": price})
                    .toString();

  client.query(query, function(error, data){

        if(error) {
          res.status(400).json({
            status: 'failed',
            message: 'failed to create product',
          });
        } else {
          res.status(201).json({
            status: 'success',
            message: 'successfully created product'
          });
        }
  })
});

//PUT request wich supplies all necessary infromation (in the request body) to register a new user
//Passwords are sent unhased, then salted and hashed to bbe stored in the DB, using bcrypt
app.put('/register', function(req, res){

  console.log("Register method hit");

  var query;

  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var firstName = req.body.fistName;
  var lastName =req.body.lastName;
  var address = req.body.address;

  //Check the username is not already in the database
  var finished = 0;
  query = squel.select().from("users").where("username = '" + username + "'").toString();
  client.query(query, function(error, data){
    if (error) {
      finished = 1;
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'Invalid Syntax'
      });
    } else if(data.rowCount > 0) {
      finished = 1;
      res.status(409).json({
        status: 'failed',
        data: username,
        message: 'username already exists'
      });
    }
  });

  console.log(finished);
  //Bad request or username exists, break out
  if(finished === 1) {
    return;
  }

  //Use bcrypt to automatically salt and hash passwords
  var passwordDigest = bcrypt.hashSync(password, SALT_ROUNDS);

  //Create the sql statement and insert the new user
  query = squel.insert().into("users")
              .setFields({"username": username,
              "password": passwordDigest,
              "email": email,
              "first_name": firstName,
              "last_name": lastName,
              "address": address
              }).toString();

  client.query(query, function(error){
    if(error){
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'Invalid Syntax'
      });
    } else {
      res.status(201).json({
          status: 'success',
          data: username,
          message: 'Successfully created user'
      });
    }
  });

});

//PUT request to login based on the username and password supplied in the request body, passwords are sent unhashed
app.put('/login', function(req, res){
  console.log("Login method hit");

  var query;

  var username = req.body.username;
  var password = req.body.password;

  query = squel.select().from('users').where("username = '" + username + "'").toString();

  client.query(query, function(error, data){
    if(error) {
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'Invalid Syntax'
      });
    } else if(data.rows == null){
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'username not found'
      });
    } else {
      if(bcrypt.compareSync(password, data.rows[0].password)){
        var userToken = jwt.sign({"username": username}, tokenSecret);
        res.status(200).json({
          status: 'success',
          data: userToken,
          message: 'Logged in successfully'
        });
      } else {
        res.status(401).json({
          status: 'failed',
          message: 'Incorrect password'
        });
      }
    }
  });
});


//GET REQUEST to get user details, if the user is authenticated
app.get('/user', expressJWT({secret: tokenSecret}), function(req, res){
  
});



app.listen(8080);
