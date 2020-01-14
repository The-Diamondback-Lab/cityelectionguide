const path = require('path');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp-promise');
const buildProfile = require('./scripts/profiles');
const buildVotes = require('./scripts/votes');
const buildMinify = require('./scripts/minify');

const {
  BUILD_DIR, DATA_SRC_DIR
} = require('./scripts/constants');

async function build(cb) {
  await mkdirp(path.resolve(BUILD_DIR));

  await Promise.all([ buildCandidateData(), buildMinify() ])
    .then(() => cb())
    .catch(cb);
}

async function buildCandidateData() {
  await mkdirp(path.resolve(BUILD_DIR, 'content'));

  let profiles = await buildProfile(path.resolve(DATA_SRC_DIR, 'profiles'),
    path.resolve(BUILD_DIR, 'content/profiles.json'));

  let nameMap = new Map(profiles.map(p => [p.fullName.split(' ').pop(), p.fullName]));
  await buildVotes(path.resolve(DATA_SRC_DIR, 'votes.tsv'), nameMap,
    path.resolve(BUILD_DIR, 'content/votes.json'));
}

function clean(cb) {
  rimraf(path.resolve(BUILD_DIR), err => {
    cb(err);
  });
}

module.exports = {
  default: clean,
  build: build,
  clean: clean
}
