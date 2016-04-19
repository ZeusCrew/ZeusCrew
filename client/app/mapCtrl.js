angular.module('roadtrippin.maps', ['gservice'])
  .controller('mapController', function($scope, mapFactory, gservice, $location, $anchorScroll) {
    
    // Initialize some $scope variables
    // --------------------------------------------------------------

    $scope.route = {};
    $scope.route.stopOptions = [1, 2, 3, 4, 5];
    $scope.places = [];
    $scope.savedRoutes = [];

    // Auto-complete
    // --------------------------------------------------------------

    var startAutoComplete = new google.maps.places.Autocomplete(
      document.getElementById('start'), {
        types: ['geocode']
      });
    
    startAutoComplete.addListener('place_changed', function() {
      $scope.route.start = startAutoComplete.getPlace().formatted_address;
      var place = startAutoComplete.getPlace();
      console.log('place', place);   
      console.log($scope.route.start); 
    });

    var endAutoComplete = new google.maps.places.Autocomplete(
      document.getElementById('end'), {
        types: ['geocode']
      });

    endAutoComplete.addListener('place_changed', function() {
      $scope.route.end = endAutoComplete.getPlace().formatted_address;
      $(this).val('');   
    });

    // Route-related functions
    // --------------------------------------------------------------

    //this is a call to our Google maps API factory for directions
    $scope.getRoute = function() {
      gservice.calcRoute($scope.route.start, $scope.route.end, $scope.route.numStops)
        .then(function(places) { splitLocations(places); });
      //clear the form input fields
      $scope.startInput = '';
      $scope.endInput = '';
    };

    //Split up the location string into an array for easier formatting
    var splitLocations = function (places) {
      $scope.places = [];
      //copy the places array before we start splitting things so our original stays in-tact
      var placesCopy = [];
      for (var i = 0; i < places.length; i++) {
        //this apparently is needed for a clean copy...
        placesCopy.push(JSON.parse(JSON.stringify(places[i])));
      }
      placesCopy.forEach(function (place) { //the actual address splitting
        place.location = place.location.split(', ');
        $scope.places.push(place);
      });
    };

    //convert stop numbers to letters matching the google pop-ups
    $scope.getLetter = function (i) {
      return String.fromCharCode(i + 66);
    };

    //Call the map factory to save a route, then refresh the $scope savedRoutes
    $scope.saveRoute = function () {
      mapFactory.saveJourneyWithWaypoints(gservice.thisTrip).then($scope.getAll());
    };

    //get all saved routes and put them in a $scope variable
    $scope.getAll = function () {
      mapFactory.getAllRoutes().then(function (results) {
        $scope.savedRoutes = results;
      });
    };

    //retrieve and re-render a saved route
    $scope.viewSavedRoute = function (hash) {
      //scroll to the top of the page
      $location.hash('top');
      $anchorScroll();
      //find the selected route in the array of saved routes
      for (var i = 0; i < $scope.savedRoutes.length; i++) {
        if ($scope.savedRoutes[i].hash === hash) {
          //split up waypoints array into names and locations. Even index ==== name, odd index === location
          $scope.savedRoutes[i].stopLocations = [];
          $scope.savedRoutes[i].stopNames = [];
          for (var j = 0; j < $scope.savedRoutes[i].wayPoints.length; j++) {
            if (j % 2 === 0) {
              $scope.savedRoutes[i].stopNames.push($scope.savedRoutes[i].wayPoints[j]);
            } else {
              $scope.savedRoutes[i].stopLocations.push($scope.savedRoutes[i].wayPoints[j]);
            }
          }
          //set $scope.places to saved stop data so stop data will display on page
          var places = [];
          for (var k = 0; k < $scope.savedRoutes[i].stopNames.length; k++) {
            var location = $scope.savedRoutes[i].stopLocations[k];
            var place = {
              name: $scope.savedRoutes[i].stopNames[k],
              location: location,
              position: k
            };
            places.push(place);
          }
          //add stop locations to stops array, render stops to map
          gservice.render($scope.savedRoutes[i].startPoint, $scope.savedRoutes[i].endPoint, places)
          .then(function (places) { splitLocations(places); });
        }
      }
    };

    //initial data grab
    $scope.getAll();

    // User functions
    // --------------------------------------------------------------

    //sign out
    $scope.signout = function () {
      mapFactory.signout();
    };

  });
