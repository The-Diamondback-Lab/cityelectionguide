const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp-promise');
const CleanCSS = require('clean-css');
const buildProfile = require('./scripts/profiles');
const buildVotes = require('./scripts/votes');

const BUILD_DIR = './build';
const SRC_DIR = './src';
const DATA_SRC_DIR = `${SRC_DIR}/data`;

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
  // MINIFY src/js -> build/js
  // MINIFY src/styles/main.css -> build/styles/main.css
  // COPY   src/styles/spinner.css -> build/styles/spinner.css
  // MINIFY src/index.html -> build/index.html
  // COPY   src/img -> build/img
  // COPY   src/fonts -> build/fonts

  await build$Minify$Css();
}

async function build$Minify$Css() {
  await mkdirp(path.resolve(BUILD_DIR, 'styles'));

  let styleDir = path.resolve(SRC_DIR, 'styles');
  let cssFiles = [ 'main.css', 'spinner.css' ];
  let minCss = new CleanCSS({
    rebaseTo: styleDir
  });

  let promises = cssFiles.map(cssFile =>
    new Promise((resolve, reject) => {
      // Minify the file
      let cssOutput = minCss.minify([ path.resolve(styleDir, cssFile) ]);

      // Check for warnings and errors (and indicate which file it came from)
      // Output warnings before errors
      if (cssOutput.warnings.length > 0) {
        console.warn(JSON.stringify({ cssFile, warnings: cssOutput.warnings }));
      }

      if (cssOutput.errors.length > 0) {
        reject(JSON.stringify({ cssFile, errors: cssOutput.errors }));
        return;
      }

      // Write out the minified CSS to the build directory with the same basename
      fs.writeFile(path.resolve(BUILD_DIR, 'styles', path.basename(cssFile)), cssOutput.styles, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  );

  await Promise.all(promises);
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
