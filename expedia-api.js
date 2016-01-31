var API_key = "y4ZGijrmunTjx7wcVN5Xb8EVxT3GuVG1";
var request = require('request');

var home_airport = 'SEA';

var dDepartureDate = '2016-02-17';
var dReturnDate = '2016-02-22'

var home_lat = 0;
var home_long = 0;

var debug = false;
var printResponses = false;


module.exports = {
	getPrice: function getPrice(lat, long, location, callback) {

		closestAirport(lat, long, function(destAirport) {
			getRegion(lat, long, function(regionID) {
				console.log('start getPackageDeal');
				getPackageDeal(dDepartureDate, home_airport, destAirport, dReturnDate, regionID, function(response) {
					callback(response);
					console.log('getPackageDeal done');
				});
			});
		});

		// getRegion(lat, long, function(response) {
		// 	callback(response);
		// });

		// getPackageDeal('2016-02-12', home_airport, 'CDG', '2016-02-15', 8068, function(response) {
		// 	callback(response);
		// });

		print('done');
	},

	getFastPrice: function getFastPrice(lat, long, callback) {
		closestAirport(lat, long, function(destAirport) {
			getCheapestFlightPrice(home_airport, destAirport, function(flights) {
				try {
					var cost = flights.FlightListings.AirOfferSummary[0].FlightPriceSummary.TotalPrice;
					callback('$'+(cost*1.5));
					// callback(flights);
				}
				catch(e) {
					callback('$N/A');
				}
			});
		});
	},

	getThingsToDo: function getToDos(placeName, callback) {
		getThingsToDo(placeName, dDepartureDate, dReturnDate, function(thingsToDo) {
			callback(thingsToDo);
		})
	}
}

function getPackageDeal(departureDate, origin, destination, returnDate, regionID, callback) {
	if (regionID == null) {
		var jsonResponse = {};
		jsonResponse.price = '$N/A';
		jsonResponse.detailsURL = null;
		callback(jsonResponse);
	}

	var URL = 'http://terminal2.expedia.com/x/packages?adults=1&departureDate='+departureDate+'&originAirport='+origin+'&destinationAirport='+destination+'&returnDate='+returnDate+'&regionid='+regionID+'&limit=5&apikey='+API_key;
	request(URL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			var jsonResponse = {};
			jsonResponse.packages = [];
			jsonResponse.originAirport = origin;
			jsonResponse.destinationAirport = destination;
			try { 
				for (var i = 0; i < 5 || i < info.PackageSearchResultList.PackageSearchResult.length; i++) {
					var activity = info.PackageSearchResultList.PackageSearchResult[i];
					var activityJSON = {};
					activityJSON.price = activity.PackagePrice.TotalPrice.Value;
					activityJSON.detailsUrl = activity.DetailsUrl;
					jsonResponse.packages.push(activityJSON);
				}

				callback(jsonResponse);

				// print(jsonResponse);
			}
			catch(e) {
				callback(jsonResponse);
			}
		}
	})
}

function getThingsToDo(location, startDate, endDate, callback) {
	var URL = 'http://terminal2.expedia.com:80/x/activities/search?location='+location+'&startDate='+startDate+'&endDate='+endDate+'&apikey='+API_key;
	request(URL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			var thingsToDo = [];
			try {
				// print(info.activities[0]);

				for (var i = 0; i < 5 && i < info.activities.length; i++) {
					var activity = info.activities[i];
					thingsToDo.push(activity);
					// print('pushed activity: '+activity);
				}

				callback(thingsToDo);

				// print(thingsToDo);
			}
			catch(e) {
				print('No activities');
				callback(thingsToDo);
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
			
			try {
				var info = JSON.parse(body);
				print('regionID: '+info[0].id);
				if (!debug) {
					callback(info[0].id);
				}
			}
			catch(e) {
				print('no region? '+body);
				callback(null);
			}
		}
		else {
			print('getRegion failed: '+error);
		}
	})
}

function closestAirport(lat, long, callback) {
	request('http://terminal2.expedia.com/x/geo/features?within=500km&lat='+lat+'&lng='+long+'&type=airport&verbose=3&apikey='+API_key, function (error, response, body) {
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
			  					print('airport code: '+item.tags.iata.airportCode.value);
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
		// print('minor airport');
		return false;
	}
	return true;
}

function getCheapestFlightPrice_NoPrice(originAirport, destinationAirport, departureDate, returnDate, callback) {
	var URL = 'http://terminal2.expedia.com/x/mflights/search?departureDate='+departureDate+'&returnDate='+returnDate+'&departureAirport='+originAirport+'&arrivalAirport='+destinationAirport+'&apikey='+API_key;
	request(URL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			// print('body: '+JSON.stringify(body));
			callback(body);
		}
		else {
			print('getCheapestFlightPrice_NoPrice error: '+error);
		}
	})
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
					"StartDate": "2016-02-12T19:33:39.363-08:00"
					}
				}
	};

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			// print('body: '+JSON.stringify(body));
			callback(body);
		}
		else {
			print('getCheapestFlightPrice error: '+error);
		}
	});
}

function print(stuff) {
	if (printResponses)
		console.log(stuff);
}