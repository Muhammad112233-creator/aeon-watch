const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Search for data-section assignments
const regex = /i\(([a-zA-Z0-9_$]+),"data-section",([^\)]+)\)/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(`Element: ${m[1]}, data-section: ${m[2]}`);
}
