var express = require('express'),
    morgan  = require('morgan'),
    path = require('path'),
    http = require('http');

var app = express();

app.get('/', function(req, res){
  res.render('index')
});

// Set the views directory
app.set('views', __dirname + '/views');

// Define the view (templating) engine
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

var ipaddress = process.env.IP || "127.0.0.1";
var port      = process.env.PORT || 50000;

app.listen(port, function() {
  console.log('%s: Node server started on %s:%d ...',
               Date(Date.now() ), port);
               });