var API_key = "ZEHa6lhrWslR65T0PGDoY6aFmPabVANh";
var request = require('request');
var home_lat = 0;
var home_long = 0;


module.exports = {
	getPrice: function getPrice(lat, long, callback) {
		callback("foo");
	},
	findAirports: function closestAirport(lat, long, callback) {
		request('http://terminal2.expedia.com/x/geo/features?within=100km&lat=33.7995&lng=-84.324306&type=airport&verbose=3&apikey=ZEHa6lhrWslR65T0PGDoY6aFmPabVANh', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	var info = JSON.parse(body);
		  	console.log(info[0].tags.iata.airportCode.value);
		    callback(body);
		  }
		})
	}
}