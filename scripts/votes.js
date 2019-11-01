var fs = require('fs');

function buildVotes(srcFile, destFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(srcFile, (err, data) => {
      if (err) {
        reject(err);
      }

      let lines = data.toString().split(/\r?\n/);

      // Groups are string arrays
      let votes = lines.reduce((obj, line, i) => {
        if (line.trim() === '') {
          if (obj.currGroup.length > 0) {
            obj.groups.push(obj.currGroup);
            obj.currGroup = [];
          }
        } else {
          obj.currGroup.push(line);
        }

        if (i === lines.length - 1) {
          obj.groups.push(obj.currGroup);
        }

        return obj;
      }, { currGroup: [], groups: [] }).groups.map(group => {
        let groupMap = new Map(group.map(s => {
          let arr = s.split(/:\s*/);
          arr[0] = arr[0].toLowerCase();
          return arr;
        }));

        return {
          candidate: groupMap.get('c'),
          motion: groupMap.get('m'),
          year: Number.parseInt(groupMap.get('y')),
          vote: groupMap.get('v'),
          sentiment: groupMap.get('s')
        };
      });

      if (destFile != null) {
        fs.writeFileSync(destFile, JSON.stringify(votes, null, 2));
      }

      resolve(votes);
    });
  });
}

module.exports = buildVotes;