const rimraf = require('rimraf');
const mkdirp = require('mkdirp-promise');
const buildProfile = require('./scripts/profiles');
const buildVotes = require('./scripts/votes');

async function build(cb) {
  await mkdirp('./build');

  await Promise.all(build$CandidateData(), build$Minifiy());

  cb();
}

async function build$CandidateData() {
  let profiles = await buildProfile('./data/profiles/', 'build/profiles.json');

  let nameMap = new Map(profiles.map(p => [p.fullName.split(' ').pop(), p.fullName]));
  await buildVotes('./data/votes.tsv', nameMap, 'build/votes.json');
}

async function build$Minify() {
  // TODO minify JS, CSS, HTML, and image files
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
