var mkdirp = require('mkdirp-promise');
var buildProfile = require('./scripts/profiles');
var buildVotes = require('./scripts/votes');

async function build(cb) {
  await mkdirp('./includes/data');

  await buildProfile('./data/profiles/', 'includes/data/profiles.json');
  await buildVotes('./data/votes.txt', 'includes/data/votes.json')

  cb();
}

exports.default = build;