let cityApp = angular.module('cityApp', ['ngSanitize']);

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

cityApp.controller('main-ctlr', ['$scope','$http','_','$sce', ($scope, $http, _, $sce) => {
  function req(path) {
    return $http.get(path).then(data => data.data);
  }

  profilesRequest = req('content/profiles.json');
  votesRequest = req('content/votes.json');

  $scope.voteData = [];
  $scope.bio = '';
  $scope.election = '';
  $scope.name = '';

  $scope.getCandidateInfo = function(candidate) {
    getVotes(candidate);
    getProfile(candidate);
  }

  function getVotes(candidate) {
    votesRequest.then(data => {
      // Filter for vote objects whose candidate property is equal to 'candidate' (case insensitive)
      $scope.votes = data.filter(v => v.candidate.toLowerCase() === candidate.toLowerCase());
    });
  }

  function getProfile(candidate) {
    profilesRequest.then(profiles => {
      let profile = profiles.find(p => p.fullName === candidate);

      $scope.name = profile.fullName;
      $scope.election = profile.position + (profile.isIncumbent ? ' (Incumbent)' : '');
      $scope.bio = profile.bio;
      $scope.quote = profile.quote;
      $scope.photofile = profile.pictureFileBaseName + '.jpg'
    });
  }
}]);
