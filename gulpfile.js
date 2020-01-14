const path = require('path');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp-promise');
const minify = require('minify');
const buildProfile = require('./scripts/profiles');
const buildVotes = require('./scripts/votes');

const BUILD_DIR = './build';
const DATA_SRC_DIR = './src/data';

async function build(cb) {
  await mkdirp(path.resolve(BUILD_DIR));

  await Promise.all([ build$CandidateData(), build$Minify() ])
    .catch(console.error);

  cb();
}

async function build$CandidateData() {
  await mkdirp(path.resolve(BUILD_DIR, 'content'));

  let profiles = await buildProfile(path.resolve(DATA_SRC_DIR, 'profiles'),
    path.resolve(BUILD_DIR, 'content/profiles.json'));

  let nameMap = new Map(profiles.map(p => [p.fullName.split(' ').pop(), p.fullName]));
  await buildVotes(path.resolve(DATA_SRC_DIR, 'votes.tsv'), nameMap,
    path.resolve(BUILD_DIR, 'content/votes.json'));
}

async function build$Minify() {
  // TODO minify JS, CSS, HTML, and image files
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
