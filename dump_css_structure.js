const fs = require('fs');
const css = fs.readFileSync('index-bd.css', 'utf8');

// Let's print out key sections in the CSS
const lines = css.split('}');
console.log("Total CSS rule blocks:", lines.length);

// Print sections of interest: .circle-svg, .fps-watch-title, .fps-color-wrapper, .images-w, .hovers-w, [data-section]
['.circle-svg', '.fps-watch-title', '.fps-color-wrapper', '.images-w', '.hovers', '[data-section', '.fps-seconds', '.background-text', '.close-button'].forEach(selector => {
  console.log(`\n=== Selector: ${selector} ===`);
  const matching = lines.filter(l => l.includes(selector));
  matching.slice(0, 3).forEach(m => console.log(m.trim() + '}'));
});
