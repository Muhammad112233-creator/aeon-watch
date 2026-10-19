const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Find all classes extending SvelteComponent / ae
// In svelte bundles: class X extends ae
const classDefMatches = content.match(/class ([a-zA-Z0-9_$]+) extends ae/g) || [];
console.log("Svelte component classes:", classDefMatches.length);

// Let's find sections or template HTML created in svelte components
const sectionCreations = content.match(/u\("section"\)[^}]+/g) || [];
console.log("Section creation blocks:", sectionCreations.length);
sectionCreations.forEach((sc, i) => {
  console.log(`\n--- Section ${i} ---`);
  console.log(sc.slice(0, 300));
});
