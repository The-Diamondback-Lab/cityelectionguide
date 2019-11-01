var rimraf = require('rimraf');
var mkdirp = require('mkdirp-promise');
var buildProfile = require('./scripts/profiles');
var buildVotes = require('./scripts/votes');

async function build(cb) {
  await mkdirp('./build');

  let profiles = await buildProfile('./data/profiles/', 'build/profiles.json');

  let nameMap = new Map(profiles.map(p => [p.fullName.split(' ').pop(), p.fullName]));
  await buildVotes('./data/votes.tsv', nameMap, 'build/votes.json');

  cb();
}

function clean(cb) {
  rimraf('./build', err => {
    cb(err);
  });
}

module.exports = {
  default: clean,
  build: build,
  clean: clean
}
