const SALT_ROUNDS = 10;
const TOKEN_SECRET = 'i need to change this secret'; //PLEASE CHANGE ME SOON

const CLIENT_ID = "200550010387-2c1acifvq3n1k1s4v4um3g1f67g6lp8n.apps.googleusercontent.com";
const CLIENT_SECRET = "nsI7yxIyuc65RiSi2ggqCjq2";

var port = process.env.PORT || 8080;

/*-------------------------------------------------- MODULES --------------------------------------------------*/


var express = require('express');
var path = require("path");
var pg = require("pg").native;
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var squel = require('squel');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var googleapis = require('googleapis');



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
//app.use(expressJWT({secret: TOKEN_SECRET}).unless({ path: ['/', '/public', '/login', '/register', '/products']}));
//I've decided I will only protect the API routes I want, instead of using this unless syntax, which is bugging my static page.

var plus = googleapis.plus('v1');
var OAuth2 = googleapis.auth.OAuth2;
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, "http://localhost:8080/oauthcallback");
var scopes = ["https://www.googleapis.com/auth/plus.me"];
var oAuthUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});



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



app.get('/google', function(req, res) {
  res.redirect(oAuthUrl);
});

app.get('/oauthcallback', function(req, res){
  var code = req.query.code;
  oauth2Client.getToken(code, function(error, tokens){
    if(!error) {
      console.log(tokens);
      oauth2Client.setCredentials(tokens);
    }
  });
  plus.people.get({userId: 'me', auth: oauth2Client}, function(error, profile){
    res.send(profile.displayName);
  });

});


/* REQUESTS RELATING TO MULTIPLE PRODUCTS :-- '/products' */

//REMOVED the GET REQUEST here as it's functionality is covered by the PUT REQUEST below.

//PUT request for filtering products by various catergories, body is used to parse filter information
// app.put('/products', function(req, res){
//   var query = "SELECT * FROM products;";

//   if(req.body.name != null){
//     query = "SELECT * FROM products WHERE product_name='" + req.body.name + "';";
//   } else if (req.body.search != null) {
//     //find all products that relate to a search term, will likely replace the above statement. ALSO not sure how to do this...
//   } else if (req.body.productType != null) {
//     //find all products of a specific catergory
//   }

//   client.query(query, function (error, data) {

//     if(error) {
//       res.status(400).json({
//         status: 'failed',
//         message: 'failed to retrieve all products'
//       });
//     } else {
//       res.status(200).json({
//         status: 'success',
//         data: data.rows,
//         message: 'successfully retrieved all products'
//       });
//     }
//   })
// });

//Using a simple get request, will update when using search/categorise (If we need to its not actually a requirement)
//GET Request for products
app.get('/api/products', function(req, res){
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
      res.status(200).json(data.rows);
    }
  })
});

/* REQUESTS RELATING TO A SINGLE PRODUCT :-- '/product' */

//Changed slightly, still works the same
//GET request for filtering product by ID, I need to do this for productname filtering ^^ too
app.get('/api/products/:id', function(req, res) {
  var query = "SELECT * FROM products WHERE productID='" +
  parseInt(req.params.id) + "';";

  client.query(query, function(error, data){

        if(error) {
          res.status(400).json({
            status: 'failed',
            message: 'failed to retrieve product'
          });
        } else {
          res.status(200).json(data.rows[0]);
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
app.post('/register', function(req, res){

  console.log("Register method hit");

  var query;

  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var firstName = req.body.firstName;
  var lastName =req.body.lastName;
  var address = req.body.address;

  //Check the username is not already in the database
  var finished = 0;
  query = squel.select().from("users").where("username = '" + username + "'").toString();
  client.query(query, function(error, data){
    if (error) {
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'Invalid Syntax'
      });
    } else if(data.rowCount > 0) {
      res.status(409).json({
        status: 'failed',
        data: username,
        message: 'username already exists'
      });
    } else {
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
          var userToken = jwt.sign({"username": username}, TOKEN_SECRET);
          res.status(201).json({
              status: 'success',
              data: userToken,
              message: 'Successfully created user'
          });
        }
      });
    }
  }); //Eww........
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
    } else if(data.rows[0] == null){
      res.status(400).json({
        status: 'failed',
        data: username,
        message: 'username not found'
      });
    } else {
      if(bcrypt.compareSync(password, data.rows[0].password)){
        var userToken = jwt.sign({"username": username}, TOKEN_SECRET);
        res.status(200).json({
          status: 'success',
          data: userToken, //This user token should be stored client side and passed back to the server on authorized requests.
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
app.get('/user', expressJWT({secret: TOKEN_SECRET}), function(req, res){
  var username = getUserFromToken(req);
  var query = squel.select().from('users').where("username = '" + username + "'").toString();
  client.query(query, function(error, data) {
    if (error) {
      res.status(400).json({
        status: 'failed',
        message: 'Authorization error'
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: data.rows[0],
        message: 'Successfully retrieved user info'
      });
    }
  });
});

//POST request to add to or create a new cart if the user is logged in.
app.post('/cart', expressJWT({secret: TOKEN_SECRET}), function(req, res){

  var username = getUserFromToken(req);

  var productID = req.body.productID;
  var quantity = req.body.quantity;

  var query = squel.update().table('carts').set("quantity = quantity + " + quantity).where("username = '" + username + "'").where("productid = " + productID).toString();
  client.query(query, function(error, data){
    if(error) {
      res.status(400).json({
        status: 'failed',
        message: 'Invalid data'
      });
    } else if(data.rowCount < 1){
      query = squel.insert().into('carts').setFields({'username': username, 'productid': productID, 'quantity': quantity}).toString();
      client.query(query, function(error, data){
        if(error) {
          res.status(400).json({
            status: 'failed',
            message: 'Invalid data'
          });
        } else {
          res.status(201).json({
            status: 'success',
            message: 'Successfully created new cart item'
          });
        }
      });
    } else {
      res.status(201).json({
        status: 'success',
        message: 'Successfully updated quantity of item in users cart'
      });
    }
  });
});

//PUT request to add an item to the already created cart of a logged in user.
app.put('/cart', expressJWT({secret: TOKEN_SECRET}), function(req, res){

});

//GET request to retreive the contents of a logged in user's cart.
app.get('/cart', expressJWT({secret: TOKEN_SECRET}), function(req, res){
  var username = getUserFromToken(req);
  var query = squel.select().from('carts').where("username = '" + username + "'").toString();
  client.query(query, function(error, data){
    if(error) {
      res.status(400).json({
        status: 'failed',
        message: 'Authorization error'
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: data.rows,
        message: 'Successfully retrieved user cart'
      });
    }
  });
});

//Given a request obkect, this function will return the user who made the request based on the JWT
var getUserFromToken = function(req){
  //Code from the express-jwt documentation
  var toReturn;
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    var token = req.headers.authorization.split(' ')[1];
    var decodedToken = jwt.decode(token);
    toReturn = decodedToken.username;
  }
  return toReturn;
};

app.listen(port);
