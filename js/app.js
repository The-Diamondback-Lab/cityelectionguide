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
cityApp.factory('_', LodashFactory);

cityApp.controller("main-ctlr", ['$scope','$http','_', function($scope,$http, _) {
    /*function loadData() {
        return $http.get("includes/data/data.json");
    }
    dataRequest = loadData().then(function(data){
        return data.data;
    });*/
    /*$scope.getCandidateInfo = function(candidate) {
        dataRequest.then(function(data){
           $scope.voteData = data[candidate]["voter-history"]
           $scope.bio = data[candidate]["bio"]
           $scope.election = data[candidate]["election"]
           $scope.name = data[candidate]["full-name"]
        });
    }
    $scope.getCandidateInfo("Chen")
    $scope.voteData = []
    $scope.bio = ""
    $scope.election = ""
    $scope.name = ""*/
    $scope.getCandidateInfo = function(candidate) {
        getVotes(candidate)
        getProfile(candidate)
    }
    function getVotes(candidate) {
        return $http.get("includes/data/votes.json").then(function(data){

           console.log(_.filter(data.data,{"Candidate":candidate}))
        });
    }
    function getProfile(candidate) {
        return $http.get("includes/data/profiles.json").then(function(data){
            console.log(data.data[0][candidate])
        })
    }
    //getProfile("Denise Mitchell")
    //getVotes("Denise Mitchell")
}]);
