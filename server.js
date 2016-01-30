var express = require('express'),
    morgan  = require('morgan'),
    path = require('path'),
    http = require('http');

var app = express();

var ig = require('instagram-node').instagram();
 
// Every call to `ig.use()` overrides the `client_id/client_secret` 
// or `access_token` previously entered if they exist. 
// ig.use({ access_token: '4850119.f5f94de.0b3efb249fd548ecb0a4a4d04c6f12b7' }); 
ig.use({ client_id: 'f5f94de0bf0b48569685b79d4e615332',
         client_secret: 'c1e75801a1ad41f3b568a8f195121abe' });

var redirect_uri = 'http://expediahackathon.azurewebsites.net/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};

exports.authorize_user_local = function(req, res) {
  res.redirect(ig.get_authorization_url('http://127.0.0.1:50000/handleauth', { scope: ['likes'], state: 'a state' }));
};
 
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log("fuck:" + err);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      ig.use({access_token: result.access_token})
      res.redirect('/');
    }
  });
};

// This is where you would initially send users to authorize 
app.get('/authorize', exports.authorize_user);
app.get('/authorize_local', exports.authorize_user_local);
// This is your redirect URI 
app.get('/handleauth', exports.handleauth);

app.get('/', function(req, res){
	ig.tag_search('hiking', function(err, result, remaining, limit) {
			console.log(err);
			res.render('index', {data: result})
	});
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