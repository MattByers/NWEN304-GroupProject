const SALT_ROUNDS = 10;

var port = process.env.PORT || 8080;
var express = require('express');
var path = require("path");
var pg = require("pg").native;
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var squel = require('squel');


/*-------------------------------------------------- INITIAL SETUP --------------------------------------------------*/

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

//static setup
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use(express.static(__dirname + '/public'));

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

//TODO: Replace all manually constructed SQL queries with squel ones

//GET Request for products
app.get('/products', function(req, res){
  var query = "SELECT * FROM products;";

  if(req.body.name != null){
    query = "SELECT * FROM products WHERE product_name='" + req.body.name + "';";
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

app.put('/products', function(req, res){
  var query = "SELECT * FROM products;";
  console.log("HIT")
  if(req.body.name != null){
    query = "SELECT * FROM products WHERE product_name='" + req.body.name + "';";
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



app.get('/products/:productID', function(req, res) {
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

//Register
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
  var finished = false;
  query = squel.select().from("users").where("username = '" + username + "'");
  client.query(query, function(error, data){
    console.log(data.command);
    if (error) {
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'Invalid Syntax'
      });
      finished = true;
    } else if(data.rowCount > 0) {
      res.status(409).json({
        status: 'failed',
        data: username,
        message: 'username already exists'
      });
      finished = true;
    }
  });

  //Bad request or username exists, break out
  if(finished === true) {
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

//login
app.put('/login', function(req, res){
  console.log("Login method hit");

  var query;

  var username = req.body.username;
  var password = req.body.password;

  query = squel.select().from('users').where("username = '" + username + "'");

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
      res.status(200).json({
        status: 'success',
        data: data.rows,
        message: 'Logged in successfully'
      });
    }
  });


});



app.listen(8080);
