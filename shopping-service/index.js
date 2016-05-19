var express = require('express'); 
var app = express(); 
var port = process.env.PORT || 8080; 
var path = require("path");
var pg = require("pg").native;

var app = express();

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

var bodyParser = require('body-parser')
app.use( bodyParser.json() ); // to support JSON­encoded bodies 
app.use(bodyParser.urlencoded({ // to support URL­encoded bodies 
extended: true 
}));  

app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next();
})


app.get('/', function(request, response){
  response.sendFile(path.join(__dirname+'/views/index.html'));
});

app.listen(8080);
