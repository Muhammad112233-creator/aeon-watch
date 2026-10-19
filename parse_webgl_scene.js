const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find camera position configurations or animation keyframes
const camMatches = content.match(/cameraPosition\s*=\s*\{[^{}]+\}|position:\s*\{x:[^}]+\}/g) || [];
console.log("Camera positions found:", camMatches.slice(0, 10));

// Find animations or scroll step points
const scrollSteps = content.match(/section\s*:\s*["'][^"']+["']/g) || [];
console.log("Scroll steps:", scrollSteps);

// Find mesh names or groups
const meshNames = content.match(/name\s*:\s*["'][^"']+["']/g) || [];
console.log("Mesh names sample:", meshNames.slice(0, 20));

