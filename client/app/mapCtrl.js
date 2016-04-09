angular.module('roadtrippin.maps', ['gservice'])
  .controller('mapController', function($scope, mapFactory, gservice) {
    $scope.route = {};
    // $scope.route.numStops = 2;
    // $scope.route.stopOptions = [{one: 1}, {two: 2}, {three: 3}, {four: 4}, {five: 5}];
    $scope.route.stopOptions = [1, 2, 3, 4, 5];
    $scope.places = [];

    //this is a call to our Google maps API factory for directions
    $scope.getRoute = function() {
      gservice.calcRoute($scope.route.start, $scope.route.end, $scope.route.numStops)
        .then(function(places) {
          $scope.places = [];
          places.forEach(function(place) {
            console.log(place);
            $scope.places.push(place);
          });
        });
    };

    $scope.saveRoute = function () {
      mapFactory.saveJourneyWithWaypoints(gservice.thisTrip);
    };

  });