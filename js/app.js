var cityApp = angular.module("cityApp",['ngSanitize']);

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

cityApp.controller("main-ctlr", ['$scope','$http','_',"$sce", ($scope, $http, _, $sce) => {
  function loadVoteData() {
    return $http.get("build/votes.json").then(function(data){
      return data.data;
    });
  }

  function loadProfileData() {
    return $http.get("build/profiles.json").then(function(data){
      return data.data;
    });
  }

  profilesRequest = loadProfileData();
  votesRequest = loadVoteData();

  $scope.voteData = []
  $scope.bio = ""
  $scope.election = ""
  $scope.name = ""

  $scope.getCandidateInfo = function(candidate) {
    getVotes(candidate);
    getProfile(candidate);
  }

  function getVotes(candidate) {
    votesRequest.then(function(data){
      $scope.votes = _.filter(data, { candidate })
    });
  }

  function getProfile(candidate) {
    profilesRequest.then(function(profiles){
      let profile = profiles.find(p => p.fullName === candidate);

      $scope.name = profile.fullName;
      $scope.election = profile.position + (profile.isIncumbent ? ' (Incumbent)' : '');
      $scope.bio = profile.bio;
      $scope.quote = profile.quote;
      $scope.photofile = profile.pictureFileBaseName+".jpg"
    });
  }
}]);
