var mkdirp = require('mkdirp-promise');
var buildProfile = require('./scripts/profiles');

async function build(cb) {
  await mkdirp('./includes/data');

  await buildProfile('./data/profiles/', 'includes/data/profiles.json');

  cb();
}

module.exports.default = build;