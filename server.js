var express = require('express'),
    morgan  = require('morgan'),
    path = require('path'),
    http = require('http');

var app = express();

var ig = require('instagram-node').instagram();
var eAPI = require('./expedia-api.js');

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
      res.redirect('/home');
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
      res.redirect('/home');
    }
  });
};

// TODO: flip these get calls
app.get('/authorize', exports.authorize_user);
app.get('/', exports.authorize_user_local);
// This is your redirect URI 
app.get('/handleauth', exports.handleauth);
app.get('/handleauth_local', exports.handleauth_local);

app.get('/home', function(req, res){

	// used for searching
	var tags = ["hike", "city", "europe", "history", "mountain", "beach", "sun", "sea", "family", "skiing"] 

	ig.tag_media_recent('history', function(err, result, pagination, remaining, limit) {
			// console.log(result); //for debugging purposes

			// Creates the tags search bar area
			tags_html = '<ul id=\"tags\">'
			for (i = 0; i < tags.length; i++) { 
		  	tags_html += "<li id=\"" + tags[i] + "\" class='tags_link'><a href=\"#tag=" + tags[i] + "\">" + tags[i] + "</a></li>";
			}
			tags_html += "</ul>"

			text = ''
			// if (result != undefined) {
			// 	for (i = 0; i < result.length; i++) { 
			// 		console.log(result[i])
			//   	text += "<a href =\"/getflightinfo?lat=" + result[i].location.latitude + "&long=" + result[i].location.longitude + "\"><img src=\"" + result[i].images.standard_resolution.url + "\" height=\"150\" width=\"150\"></a>  ";
			// 	}
			// }

			res.render('index', {data: text, tags: tags_html})
	});
});

// Calls to get stuff back from expedia
app.get('/search', function(req, res){
	console.log(req.query)
	var tag = encodeURI(req.query.tag)
	ig.tag_media_recent(tag, function(err, result, pagination, remaining, limit) {
			console.log(result); //for debugging purposes
			
			text = '';
			if (result != undefined) {
				for (i = 0; i < result.length; i++) { 
					console.log(result[i])
			  	text += "<a href =\"/adventure?id=" + result[i].id + "\"><img src=\"" + result[i].images.standard_resolution.url + "\" height=\"200\" width=\"200\"></a>       ";
				}
			}

			res.send(text);
	});
})

//Call to get to info page for each pic
app.get('/adventure', function(req, res){
	var pic_id = encodeURI(req.query.id)
	ig.media(pic_id, function(err, media, remaining, limit) {
		console.log(media);
		res.render('adventure', {ig_data: JSON.stringify(media)})
	});

})

// Calls to get stuff back from expedia
app.get('/getflightinfo', function(req, res){
	var lat = encodeURI(req.query.lat)
	var long = encodeURI(req.query.long)

	eAPI.getPrice(lat, long, function(result) {
    res.json(result);
  })
})

// Crap we need to get the website approved by insta
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