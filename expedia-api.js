var API_key = "y4ZGijrmunTjx7wcVN5Xb8EVxT3GuVG1";
var request = require('request');

var home_airport = 'SEA';

var dDepartureDate = '2016-02-17';
var dReturnDate = '2016-02-22'

var home_lat = 0;
var home_long = 0;

var debug = false;
var printResponses = true;


module.exports = {
	getPrice: function getPrice(lat, long, callback) {
		closestAirport(lat, long, function(destAirport) {
			getRegion(lat, long, function(regionID) {
				getPackageDeal(dDepartureDate, home_airport, destAirport, dReturnDate, regionID, function(response) {
					callback(response);
				});
			});
		});
		// getCheapestFlightPrice(home_airport, 'LAX', function(response) {
		// 	callback(response);
		// });
		// getRegion(lat, long, function(response) {
		// 	callback(response);
		// });
		// getPackageDeal('2016-02-12', home_airport, 'CDG', '2016-02-15', 8068, function(response) {
		// 	callback(response);
		// });
	}
}

function getPackageDeal(departureDate, origin, destination, returnDate, regionID, callback) {
	var URL = 'http://terminal2.expedia.com/x/packages?adults=1&departureDate='+departureDate+'&originAirport='+origin+'&destinationAirport='+destination+'&returnDate='+returnDate+'&regionid='+regionID+'&limit=5&apikey='+API_key;
	request(URL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			try {
				var detailsURL = info.PackageSearchResultList.PackageSearchResult[0].DetailsUrl;
				var price = info.PackageSearchResultList.PackageSearchResult[0].PackagePrice.TotalPrice.Value;

				callback('$'+price+': '+detailsURL);
			}
			catch(e) {
				callback(JSON.parse(body));
			}
		}
	})
}

function getRegion(lat, long, callback) {
	var URL = 'http://terminal2.expedia.com/x/geo/features?within=5km&type=city&lat='+lat+'&lng='+long+'&apikey='+API_key;
	print('lat: '+lat+'long: '+long);
	request(URL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			if (debug) {
				callback(JSON.parse(body));
			}
			
			var info = JSON.parse(body);

			if (!debug) {
				callback(info[0].id);
			}
		}
		else {
			print('getRegion failed: '+error);
		}
	})
}

function closestAirport(lat, long, callback) {
	request('http://terminal2.expedia.com/x/geo/features?within=100km&lat='+lat+'&lng='+long+'&type=airport&verbose=3&apikey='+API_key, function (error, response, body) {
		if (!error && response.statusCode == 200) {
	  		var info = JSON.parse(body);
	  		
	  		if (debug) {
	  			callback(info);
	  		}

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
			
			if (!debug) {
				callback(closest);
			}
	  	}
	  	else {
	  		print("closestAirport broke: "+error);
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
			callback(JSON.parse(body));
		}
		else {
			print(error);
		}
	});
}

function print(stuff) {
	console.log(stuff);
}