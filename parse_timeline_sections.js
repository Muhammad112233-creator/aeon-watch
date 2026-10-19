const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

const terms = ['Curves', 'Hands', 'Straps', 'Disassembly', 'Mechanism', 'Timeless', 'Images', 'Parts', 'Movement', 'VerticalText', 'Intro'];
terms.forEach(term => {
  let idx = 0;
  console.log(`=== Section term: ${term} ===`);
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 120)));
    console.log('---');
    idx += term.length + 1;
    if (idx > content.length) break;
  }
});
