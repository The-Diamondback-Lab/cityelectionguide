var fs = require('fs');
var mkdirp = require('mkdirp');

/**
 * @param {string} text
 */
function profileToHtml(text) {
  return text.split(/\r?\n/)
    .filter(s => s.length > 0)
    .map(s => s.replace(/“|”/, '"'))
    .map(s => s.replace('’', '\''))
    .map(line => `<p>${line}</p>`)
    .join('');
}

var srcDir = './profile_data/unparsed';
var destDir = './profile_data/parsed';

mkdirp.sync(destDir);

fs.readdirSync(srcDir).map(file => {
  let text = fs.readFileSync(`${srcDir}/${file}`).toString();
  fs.writeFileSync(`${destDir}/${file}`, profileToHtml(text));
});
