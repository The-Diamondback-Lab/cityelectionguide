var fs = require('fs').promises;
var mkdirp = require('mkdirp-promise');

const WARNING_DIRECTIVES = {
  FULL_NAME: "InsertFullName",
  PICTURE_FILENAME: "InsertPictureFilename",
  POSITION: "InsertPosition",
  QUOTE: "InsertQuote"
}

/**
 * @typedef CandidateProfile
 * @property {string} fullName
 * @property {string} pictureFileBaseName
 * @property {string} position
 * @property {boolean} isIncumbent
 * @property {string} quote
 * @property {string} bio
 */

/**
 * Converts a profile text file to a profile-data object.
 *
 * The file should have it's first line dedicated to CSV data that specifies
 * the candidate's full name, picture file basename (name w/o
 * extension), what they are running for, if they are an incumbent,
 * and a quote.
 *
 * The rest of the file is dedicated to the candidate's biography.
 *
 * @param {string} filename
 * @param {string} text
 * @returns {CandidateProfile}
 */
function parseProfileFile(filename, text) {
  let lines = text.split(/\r?\n/)
    .filter(s => s.length > 0)
    .map(s => s.replace(/“|”/, '"'))
    .map(s => s.replace('’', '\''));

  let candidateInfo = lines[0].split(',');

  /**
   * @type {CandidateProfile}
   */
  let profile = {
    fullName: candidateInfo[0],
    pictureFileBaseName: candidateInfo[1],
    position: candidateInfo[2],
    isIncumbent: candidateInfo[3] === 'true',
    quote: candidateInfo[4],
    bio: lines.slice(1).map(line => `<p>${line}</p>`).join('')
  };

  // Print out any warnings that we can catch
  if (candidateInfo[0].toUpperCase() === WARNING_DIRECTIVES.FULL_NAME.toUpperCase()) {
    console.warn(`Candidate ${filename} does not have a valid full name`);
  } else if (candidateInfo[1].toUpperCase() === WARNING_DIRECTIVES.PICTURE_FILENAME.toUpperCase()) {
    console.warn(`Candidate ${profile.fullName} does not have a valid picture file basename`);
  } else if (candidateInfo[2].toUpperCase() === WARNING_DIRECTIVES.POSITION.toUpperCase()) {
    console.warn(`Candidate ${filename} does not have a valid position`);
  } else if (candidateInfo[3].toUpperCase() !== 'TRUE' && candidateInfo[3].toUpperCase() !== 'FALSE') {
    console.warn(`Candidate ${profile.fullName} does not have a valid incumbent value '${candidateInfo[3]}'`);
  } else if (candidateInfo[4].toUpperCase() === WARNING_DIRECTIVES.QUOTE.toUpperCase()) {
    console.warn(`Candidate ${profile.fullName} does not have a valid quote`);
  }

  return profile;
}

var srcDir = './profile_data/unparsed';
var destDir = './profile_data/parsed';

(async() => {
  await mkdirp(destDir);

  let files = await fs.readdir(srcDir, { withFileTypes: true });
  files.map(async(file) => {
    if (file.isDirectory()) return;
    let text = (await fs.readFile(`${srcDir}/${file.name}`)).toString();
    let profile = parseProfileFile(`${srcDir}/${file.name}`, text);
  });
})();