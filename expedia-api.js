var API_key = "ZEHa6lhrWslR65T0PGDoY6aFmPabVANh";
var request = require('request');


function findAirports(lat, long) {

	request('http://terminal2.expedia.com/x/geo/features?within=50km&lat=33.7995&lng=-84.324306&type=airport&verbose=3&apikey=ZEHa6lhrWslR65T0PGDoY6aFmPabVANh', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body) 
	  }
	})
}