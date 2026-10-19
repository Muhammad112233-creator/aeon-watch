const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find all strings in the-watch.js
const regex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
const strings = [];
let m;
while ((m = regex.exec(content)) !== null) {
  const val = m[0].slice(1, -1);
  if (val.length > 5) strings.push(val);
}

console.log("Total strings:", strings.length);
console.log("Filtered unique strings (sample 60):");
const unique = Array.from(new Set(strings)).filter(s => !s.includes('\\u') && s.length > 10);
console.log(unique.slice(0, 100));
