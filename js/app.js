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
    function loadVoteData() {
        return $http.get("includes/data/votes.json").then(function(data){
            return data.data;
        });
    }
    function loadProfileData() {
        return $http.get("includes/data/profiles.json").then(function(data){
            return data.data[0];
        });
    }

    profilesRequest = loadProfileData();
    votesRequest = loadVoteData();

    $scope.voteData = []
    $scope.bio = ""
    $scope.election = ""
    $scope.name = ""

    $scope.getCandidateInfo = function(candidate) {
        getVotes(candidate)
        getProfile(candidate)
    }
    function getVotes(candidate) {
        votesRequest.then(function(data){
            $scope.votes = _.filter(data,{"Candidate":candidate})
        });
    }

    function getProfile(candidate) {
        profilesRequest.then(function(data){
            person = data[candidate]
            $scope.name = person["Name"]
            $scope.election = person["Election"]
            $scope.bio = person["Profile Text"]
            $scope.photofile = person["Photo file name"]+".jpg"
        })
    }

}]);
