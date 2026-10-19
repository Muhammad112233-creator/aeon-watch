const fs = require('fs');
const css = fs.readFileSync('index-bd.css', 'utf8');

console.log("CSS length:", css.length);
// Find root variables
const rootVars = css.match(/--[a-zA-Z0-9_-]+:[^;]+/g) || [];
console.log("Root variables / CSS variables:", Array.from(new Set(rootVars)));

// Sample classes
const classes = css.match(/\.[a-zA-Z0-9_-]+/g) || [];
console.log("Unique classes:", Array.from(new Set(classes)).slice(0, 80));
