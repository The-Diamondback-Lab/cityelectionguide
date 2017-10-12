var cityApp = angular.module("cityApp",[]);

function LodashFactory($window) {
  if(!$window._){
    // If lodash is not available you can now provide a
    // mock service, try to load it from somewhere else,
    // redirect the user to a dedicated error page, ...
  }
  return $window._;
}

// Define dependencies
LodashFactory.$inject = ['$window'];

// Register factory
myApp.factory('_', LodashFactory);

cityApp.controller("main-ctlr", ['$scope', '$http', function($scope, $http){



}]);
