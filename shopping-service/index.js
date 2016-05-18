var express = require('express');

var app = express();

app.get('/', function(request, response){
  response.send("Test");
});

app.listen(8080);
