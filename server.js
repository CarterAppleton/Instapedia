var express = require('express'),
    morgan  = require('morgan'),
    path = require('path'),
    http = require('http');

var app = express();

var ig = require('instagram-node').instagram();

ig.use({ client_id: 'f5f94de0bf0b48569685b79d4e615332',
         client_secret: 'c1e75801a1ad41f3b568a8f195121abe' });

var redirect_uri = 'http://expediahackathon.azurewebsites.net/handleauth';

exports.authorize_user = function(req, res) {
	ig.use({ client_id: 'f5f94de0bf0b48569685b79d4e615332',
         client_secret: 'c1e75801a1ad41f3b568a8f195121abe' });

  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes', 'public_content'], state: 'a state' }));
};

exports.authorize_user_local = function(req, res) {
	ig.use({ client_id: 'f5f94de0bf0b48569685b79d4e615332',
         client_secret: 'c1e75801a1ad41f3b568a8f195121abe' });

  res.redirect(ig.get_authorization_url('http://127.0.0.1:50000/handleauth_local', { scope: ['likes', 'public_content'], state: 'a state' }));
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

exports.handleauth_local = function(req, res) {
  ig.authorize_user(req.query.code, 'http://127.0.0.1:50000/handleauth_local', function(err, result) {
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
app.get('/handleauth_local', exports.handleauth_local);

app.get('/', function(req, res){
	ig.tag_media_recent('monsterjam', function(err, result, pagination, remaining, limit) {
			console.log(err);
			console.log(result);
			console.log(pagination);
			console.log(remaining);
			console.log(limit);
			res.render('index', {data: result})
	});
});

app.get('/privacy', function(req, res){
	res.render('privacy')
})
app.get('/video', function(req, res){
	res.render('video')
})

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