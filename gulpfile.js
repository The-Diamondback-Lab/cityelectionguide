var mkdirp = require('mkdirp-promise');
var buildProfile = require('./scripts/profiles');
var buildVotes = require('./scripts/votes');

async function build(cb) {
  await mkdirp('./build');

  await buildProfile('./data/profiles/', 'build/profiles.json');
  await buildVotes('./data/votes.txt', 'build/votes.json')

  cb();
}

exports.default = build;