const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find JSON objects or dictionaries that contain keys like "firstLabel", "secondLabel", "disassembly", "mechanism", etc.
const matches = content.match(/\{[^{}]*(?:firstLabel|secondLabel|disassembly|timeless|mechanism|movement|watchRight|colors|description|silver|gold)[^{}]*\}/g) || [];
console.log("Matches:", matches.length);
matches.forEach((m, i) => {
  console.log(`--- Match ${i} ---`);
  console.log(m);
});
