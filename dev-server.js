const buildProfiles = require('./scripts/profiles');
const buildVotes = require('./scripts/votes');

const express = require('express');
const app = express();

let profilesPromise = buildProfiles('./src/data/profiles');
let votesPromise = profilesPromise.then(async (profiles) => {
  let nameMap = new Map(profiles.map(p => [p.fullName.split(' ').pop(), p.fullName]));
  return await buildVotes('./src/data/votes.tsv', nameMap);
});

app.use(express.static('src/'));

app.get('/', (_, res) => res.redirect('/index.html'));

app.get('/content/profiles.json', (_, res) => {
  profilesPromise.then(profiles => {
    res.send(profiles);
  });
});

app.get('/content/votes.json', (_, res) => {
  votesPromise.then(votes => {
    res.send(votes);
  })
});

app.listen(8080, () => {
  console.log('Development server started on http://localhost:8080/');
});
