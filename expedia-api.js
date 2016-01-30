var API_key = "y4ZGijrmunTjx7wcVN5Xb8EVxT3GuVG1";
var request = require('request');

var home_airport = 'SEA';

var home_lat = 0;
var home_long = 0;


module.exports = {
	getPrice: function getPrice(lat, long, callback) {
		var destAirport = 'blah';
		// closestAirport(lat, long, function(response) {
		// 	callback(response);
		// });
		// getCheapestFlightPrice(home_airport, 'LAX', function(response) {
		// 	callback(response);
		// });
		getRegion(lat, long, function(response) {
			callback(response);
		});

	}
}

function getPackageDeal(departureDate, origin, destination, returnDate, regionID) {

}

function getRegion(lat, long, callback) {
	var URL = 'http://terminal2.expedia.com/x/suggestions/regions?within=5km&lng=-122.453269&lat=37.777363&apikey=y4ZGijrmunTjx7wcVN5Xb8EVxT3GuVG1';
	request(URL, function(error, response, body) {
		if (!error && response.statuscode == 200) {
			callback(body);
		}
		else {
			print('getRegion failed: '+error);
		}
	});
}

function getCheapestFlightPrice(origin, destination, callback) {
	var options = {
		uri: 'http://terminal2.expedia.com/x/flights/overview/get?apikey='+API_key,
		method: 'POST',
		json: {
					"MessageHeader": {
						"ClientInfo": {
							"DirectClientIP": "1.0.0.0",
							"DirectClientHostname": "TestDirectClientHostname",
							"DirectClientName": "TestDirectClientName",
							"OriginalClientIP": "10.0.0.5",
							"OriginalClientHostname": "TestOriginalClientHostname",
							"OriginalClientName": "TestOriginalClientName"
						},
						"MessageVersion": "V1.1",
						"CreateDateTime": "2015-11-18T15:08:14.381-08:00",
						"MessageGUID": "1234a34a-3567-89c4-19cd-12345678abcd",
						"TransactionGUID": "airoverviewhappypath"
					},
					"tpid": 1,
					"eapid": 0,
					"PointOfSaleKey": {
						"JurisdictionCountryCode": "USA",
						"CompanyCode": "10111",
						"ManagementUnitCode": "1010"
					},
					"OriginAirportCodeList": {
						"AirportCode": [origin]
					},
					"DestinationAirportCodeList": {
						"AirportCode": [destination]
					},
					"FlightListings": {
						"MaxCount": 5
					},
					"FareCalendar": {
					"StartDate": "2016-02-08T19:33:39.363-08:00"
					}
				}
	};

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			print(body);
			callback(body);
		}
		else {
			print(error);
		}
	});
	// callback('herro');
}

function closestAirport(lat, long, callback) {
	request('http://terminal2.expedia.com/x/geo/features?within=100km&lat='+lat+'&lng='+long+'&type=airport&verbose=3&apikey='+API_key, function (error, response, body) {
		if (!error && response.statusCode == 200) {
	  		var info = JSON.parse(body);
	  		var closest = "no closest airport";

		  	for (var i = 0; i < info.length; i++) {
				var item = info[i];
			  	if(item.hasOwnProperty('tags')) {
			  		if (!isMajorAirport(item)) {
			  			continue;
			  		}
			  		if(item.tags.hasOwnProperty('iata')) {
			  			if(item.tags.iata.hasOwnProperty('airportCode')) {
			  				if (item.tags.iata.airportCode.hasOwnProperty('value')) {
			  					print(item.tags.iata.airportCode.value);
			  					closest = item.tags.iata.airportCode.value;
			  					break;
			  				}
			  			}
			  		}
			  	}
			};

			destAirport = closest;
			callback(closest);
	  	}
	  	else {
	  		print("closestAirport broke");
	  	}
	})
}

function isMajorAirport(item) {
	try {
		if (item.tags.common.majorAirport.value == 0) {
			print('majorAirport = 0; WHATTTT???')
			return false;
		}
	}
	catch(e) {
		print('minor airport');
		return false;
	}
	return true;
}

function print(stuff) {
	console.log(stuff);
}