const path = require('path');
const fs = require('fs').promises;
const rimraf = require('rimraf');
const mkdirp = require('mkdirp-promise');
const CleanCSS = require('clean-css');
const babelMinify = require("babel-minify");
const htmlMinify = require('html-minifier').minify;
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
  // COPY   src/img -> build/img
  // COPY   src/fonts -> build/fonts

  // MINIFY src/js -> build/js
  await build$Minify$Js();
  // MINIFY src/styles/main.css -> build/styles/main.css
  // COPY   src/styles/spinner.css -> build/styles/spinner.css
  await build$Minify$Css();
  // MINIFY src/index.html -> build/index.html
  await build$Minify$Html();
}

async function build$Minify$Js() {
  await mkdirp(path.resolve(BUILD_DIR, 'js'));

  let jsDir = path.resolve(SRC_DIR, 'js');
  let jsFiles = [ 'app.js' ];

  let promises = jsFiles.map(jsFile => (async () => {
    let data = await fs.readFile(path.resolve(jsDir, jsFile));
    let jsOutput = babelMinify(data.toString());

    await fs.writeFile(path.resolve(BUILD_DIR, 'js', path.basename(jsFile)), jsOutput.code);
  })());

  await Promise.all(promises);
}

async function build$Minify$Css() {
  await mkdirp(path.resolve(BUILD_DIR, 'styles'));

  let styleDir = path.resolve(SRC_DIR, 'styles');
  let cssFiles = [ 'main.css', 'spinner.css' ];
  let minCss = new CleanCSS({
    rebaseTo: styleDir
  });

  let promises = cssFiles.map(cssFile => (async() => {
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

    await fs.writeFile(path.resolve(BUILD_DIR, 'styles', path.basename(cssFile)), cssOutput.styles);
  })());

  await Promise.all(promises);
}

async function build$Minify$Html() {
  let htmlFile = path.resolve(SRC_DIR, 'index.html');
  let htmlOutput = htmlMinify(await (await fs.readFile(htmlFile)).toString(), {
    collapseWhitespace: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeTagWhitespace: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });

  await fs.writeFile(path.resolve(BUILD_DIR, 'index.html'), htmlOutput);
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
