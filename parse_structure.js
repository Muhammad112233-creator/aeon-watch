const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find all HTML / templates in the-watch.js
const htmlBlocks = content.match(/<[a-z][\s\S]*?>/gi) || [];
console.log("HTML snippets found:", htmlBlocks.length);

// Let's also print sections, class names, and texts
const classMatches = content.match(/class="([^"]+)"/g) || [];
console.log("Classes found:", Array.from(new Set(classMatches)));

