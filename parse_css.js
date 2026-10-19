const fs = require('fs');
const css = fs.readFileSync('index.css', 'utf8');

console.log("CSS length:", css.length);
// Let's print out all selectors and keyframe names
const selectors = css.match(/[^{}]+(?=\{)/g) || [];
console.log("Total CSS rules:", selectors.length);
console.log("Sample selectors:", selectors.slice(0, 50).map(s => s.trim()).filter(s => !s.startsWith('@')));
