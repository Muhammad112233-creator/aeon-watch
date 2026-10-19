const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find all ScrollTrigger instances or timeline animations
const scrollMatches = content.match(/ScrollTrigger\.create\(\{[^{}]+\}\)/g) || [];
console.log("ScrollTrigger.create matches:", scrollMatches.length);

// Find all section names
const sections = content.match(/data-section="([^"]+)"/g) || [];
console.log("data-section attributes:", sections);

// Find all camera coordinates or gsap animations on camera/watch
const cameraMatches = content.match(/camera\.[a-zA-Z0-9_\.]+/g) || [];
console.log("Camera references:", Array.from(new Set(cameraMatches)));

// Find all timelines
const tlMatches = content.match(/gsap\.timeline\(\{[^{}]+\}\)/g) || [];
console.log("Timelines:", tlMatches.slice(0, 10));

