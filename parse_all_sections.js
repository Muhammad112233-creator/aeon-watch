const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

const regex = /data-section="?([a-zA-Z0-9_-]+)"?/g;
let m;
const sections = [];
while ((m = regex.exec(content)) !== null) {
  sections.push(m[1]);
}
console.log("Sections found:", sections);

// Let's also look for all methods or classes that create timelines
const timelineMethods = content.match(/create[A-Z][a-zA-Z0-9]+Timeline|init[A-Z][a-zA-Z0-9]+/g) || [];
console.log("Timeline methods:", Array.from(new Set(timelineMethods)));

