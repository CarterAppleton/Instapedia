var express = require('express'),
    morgan  = require('morgan'),
    path = require('path'),
    http = require('http');

var app = express();

 
// Every call to `ig.use()` overrides the `client_id/client_secret` 
// or `access_token` previously entered if they exist. 
// ig.use({ access_token: '4850119.f5f94de.0b3efb249fd548ecb0a4a4d04c6f12b7' }); 

var redirect_uri = 'http://expediahackathon.azurewebsites.net/handleauth';


// This is where you would initially send users to authorize 
app.get('/authorize', exports.authorize_user);
app.get('/authorize_local', exports.authorize_user_local);
// This is your redirect URI 
app.get('/handleauth', exports.handleauth);
app.get('/handleauth_local', exports.handleauth_local);

app.get('/', function(req, res){
      res.render('index', {data: 'blah blah'})
});

// Set the views directory
app.set('views', __dirname + '/views');

// Define the view (templating) engine/
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

var ipaddress = process.env.IP || "127.0.0.1";
var port      = process.env.PORT || 50000;

app.listen(port, function() {
  console.log('%s: Node server started on %s:%d ...',
               Date(Date.now() ), port);
               });