var cityApp = angular.module('cityApp', ['ngSanitize']);

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

  // Populate main page with candidate elements
  req('data/candidate_order.json').then(groups => {
    groups.forEach(group => {
      let title = group.title || group.position;
      let classes = group.class;
      let candidates = group.candidates;

      let foo = $('.container.main-list');
      let mainDiv = $(`<div class="${classes}"></div>`);
      // mainDiv.addClass(classes);
      foo.append(mainDiv);

      let header = $(`<h2>${title}</h2>`);
      let row = $(`<div class="row"></div>`);
      mainDiv.append(header);
      mainDiv.append(row);

      candidates.forEach(candidate => {
        let div = $('<div></div>');
        div.attr('class', 'col-sm-6 col-md-3 profile-pic-div');
        div.attr('ng-click', `getCandidateInfo('${candidate}')`);
        div.click(function() {
          $('.nav-tabs a:first').tab('show'); $('#details').modal('show');
        });

        let img = $('<img />');
        img.attr('class', 'img-responsive lazyload');
        img.attr('src', `img/${candidate.split(' ').pop().toLowerCase()}.jpg`);
        let header = $(`<h3>${Humanize.capitalizeAll(candidate.toLowerCase())}</h3>`);

        div.append(img);
        div.append(header);

        row.append(div);
      });
    });
  });

  profilesRequest = req('build/profiles.json');
  votesRequest = req('build/votes.json');

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
