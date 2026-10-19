const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find all occurrences of text / copy
// Look for strings between quotes that have spaces
const textMatches = content.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g) || [];
const uniqueTexts = Array.from(new Set(textMatches))
  .map(s => s.slice(1, -1))
  .filter(s => s.length > 5 && !s.includes('\\x') && !s.includes('class=') && !s.includes('<') && !s.includes('function'));

console.log("Found texts count:", uniqueTexts.length);
console.log("\nSample readable strings:");
uniqueTexts.filter(s => /^[a-zA-Z0-9\s.,'’-]{10,}$/.test(s)).forEach(s => console.log("- " + s));

