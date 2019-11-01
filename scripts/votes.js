var fs = require('fs');

/**
 * @typedef Vote
 * @property {string} candidate
 * @property {string} year
 * @property {string} motion
 * @property {string} vote
 * @property {string} sentiment
 */

/**
 * Determines the sentiment (positive, neutral, negative) of a vote object.
 *
 * @param {string} candidateName name of the candidate
 * @param {[string, string, string]} voteObj an array of strings, indicating
 * (in order) the year, motion, and what the candidate voted for.
 * @returns {string} a positive, neutral, or negative sentiment string.
 */
function getSentiment(candidateName, voteObj) {
  if (/opposed/i.test(voteObj[2])) {
    return 'Negative';
  } else if (/in favor/i.test(voteObj[2])) {
    return 'Positive';
  } else if (/absent|abstained|not present/i.test(voteObj[2])) {
    return 'Neutral';
  } else {
    console.warn(`Cannot determine sentiment from candidate ${candidateName} "${voteObj[2]}"`);
    return 'INVALID';
  }
}

/**
 * Builds an array of vote objects from a TSV file and a name map.
 *
 * @param {string} tsvSrcFile path to voting history TSV file
 * @param {Map.<string, string>} nameMap maps a candidate's last name to their full name
 * @param {string} destFile an optional destination file to write to
 * @returns {Promise.<Vote[]>}
 */
async function buildVotes(tsvSrcFile, nameMap, destFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(tsvSrcFile, (err, data) => {
      if (err) {
        reject(err);
      }

      let lines = data.toString().split(/\r?\n/);

      // Grouping up lines in the TSV file
      let { groups } = lines.reduce((obj, line, i) => {
        // If the trimmed line is empty, push our current group of lines onto
        // obj.groups (but only if the current group is non-empty).
        // We don't combine the two conditionals here to prevent pushing an empty
        // line onto a current group (think of the situation when line = '' and
        // currGroup = [])
        if (line.trim() === '') {
          if (obj.currGroup.length > 0) {
            obj.groups.push(obj.currGroup);
            obj.currGroup = [];
          }
        } else {
          obj.currGroup.push(line);
        }

        // If we're on the last line, push our group (but only if it's non-empty)
        if (i === lines.length - 1 && obj.currGroup.length > 0) {
          obj.groups.push(obj.currGroup);
        }

        return obj;
      }, {
        /** @type string[] */
        currGroup: [],
        /** @type string[][] */
        groups: []
      });

      // Parsing the groups (or TSV lines) into vote objects
      let parsedVotes = groups.map(g => {
        // Retrieve full name of candidate and their voting history (tsv lines)
        let fullName = nameMap.get(g[0]);
        let votes = g.slice(1).map(l => l.split(/\t/));

        // Every element of votes is an array of 3 strings:
        // year, motion, and candidate's vote. We map these arrays
        // into objects that have the same info, plus the candidate's
        // name as well as a "sentiment" (whether the vote was for/against/etc the motion)
        return votes.map(v => ({
          candidate: fullName,
          year: v[0],
          motion: v[1],
          vote: v[2],
          sentiment: getSentiment(fullName, v)
        }));
      });

      // Joining the vote objects into a single array
      let joinedVotes = parsedVotes.reduce((arr, listOfVotes) => {
        arr.push(...listOfVotes);
        return arr;
      }, []);

      // Write to a file if provided a destination path
      if (destFile != null) {
        fs.writeFile(destFile, JSON.stringify(joinedVotes), err => {
          if (err) {
            reject(err);
          } else {
            resolve(joinedVotes);
          }
        });
      } else {
        resolve(joinedVotes);
      }
    });
  });
}

module.exports = buildVotes;
