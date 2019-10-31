var fs = require('fs').promises;
var mkdirp = require('mkdirp-promise');

/**
 * @param {string} text
 */
function parseProfileFile(text) {
  let lines = text.split(/\r?\n/)
    .filter(s => s.length > 0)
    .map(s => s.replace(/“|”/, '"'))
    .map(s => s.replace('’', '\''));

  let rawBaseData = lines[0].split(',');
  return lines.slice(1).map(line => `<p>${line}</p>`).join('');
}

var srcDir = './profile_data/unparsed';
var destDir = './profile_data/parsed';

(async() => {
  await mkdirp(destDir);

  let files = await fs.readdir(srcDir, { withFileTypes: true });
  files.map(async(file) => {
    if (file.isDirectory()) return;
    let text = (await fs.readFile(`${srcDir}/${file.name}`)).toString();
    await fs.writeFile(`${destDir}/${file.name}`, parseProfileFile(text));
  });
})();