const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

const idx1 = content.indexOf('the-watch/en_GB.json');
if (idx1 !== -1) {
  console.log("Found en_GB.json around:", content.slice(idx1 - 100, idx1 + 2000));
}

const idx2 = content.indexOf('the-watch/fr_FR.json');
if (idx2 !== -1) {
  console.log("Found fr_FR.json around:", content.slice(idx2 - 100, idx2 + 2000));
}

