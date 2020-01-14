const fs = require('fs').promises;
const path = require('path');
const mkdirp = require('mkdirp-promise');
const CleanCSS = require('clean-css');
const babelMinify = require("babel-minify");
const htmlMinify = require('html-minifier').minify;

const {
  BUILD_DIR, SRC_DIR
} = require('./constants');

async function buildMinify() {
  // COPY   src/img -> build/img
  // COPY   src/fonts -> build/fonts

  // MINIFY src/js -> build/js
  await minifyJs();
  // MINIFY src/styles/main.css -> build/styles/main.css
  // COPY   src/styles/spinner.css -> build/styles/spinner.css
  await minifyCss();
  // MINIFY src/index.html -> build/index.html
  await minifyHtml();
}

async function minifyJs() {
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

async function minifyCss() {
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

async function minifyHtml() {
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

module.exports = buildMinify;
