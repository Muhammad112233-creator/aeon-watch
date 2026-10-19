const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Look for object keys or texts
const jsbeautifier = require('util');

// Let's find texts around titles and descriptions
const matches = content.match(/title:\s*["'][^"']+["']|description:\s*["'][^"']+["']|text:\s*["'][^"']+["']|label:\s*["'][^"']+["']/gi) || [];
console.log("Found metadata fields:", matches);

// Let's search for exploded parts or interactive mesh parts
const meshParts = content.match(/mesh:\s*["'][^"']+["']|name:\s*["'][^"']+["']/gi) || [];
console.log("Mesh parts found:", meshParts);

