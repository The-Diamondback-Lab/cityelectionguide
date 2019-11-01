var fs = require('fs').promises;
var recursiveReaddir = require('recursive-readdir');

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
 * @typedef {Object.<string,string>} OldCandidateProfile
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
    .map(s => s.replace(/“|”/g, '"'))
    .map(s => s.replace(/’/g, '\''));

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

  // Wrap the candidate's quote in actual quotes if need be
  if (!/^\".*\"$/.test(profile.quote)) {
    if (!profile.quote.startsWith('"')) {
      profile.quote = '"' + profile.quote;
    }

    if (!profile.quote.endsWith('"')) {
      profile.quote += '"';
    }
  }

  return profile;
}

var srcDir = './raw_profile_data/';

(async() => {
  let files = await recursiveReaddir(srcDir);

  let profiles = await Promise.all(files.map(async(filename) => {
    let text = (await fs.readFile(filename)).toString();
    let profile = parseProfileFile(filename, text);

    return profile;
  }));

  await fs.writeFile('includes/organized-profiles.json', JSON.stringify(profiles, null, 2));

  /**
   * @type {Object.<string,OldCandidateProfile>}
   */
  let profilesAsObject = {};

  profiles.forEach(profile => {
    let electionValue = profile.position + (profile.isIncumbent ? ' (Incumbent)' : '');

    profilesAsObject[profile.fullName] = {
      'Election': electionValue,
      'Name': profile.fullName,
      'Photo file name': profile.pictureFileBaseName,
      'Profile Text': profile.bio,
      'Pulled Quote': profile.quote
    };
  });

  await fs.writeFile('includes/data/profiles.json', JSON.stringify([profilesAsObject], null, 2));
})();