const fs = require('fs');

const findStrings = (content, term) => {
  let idx = 0;
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(`Match at ${idx}:`, content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
    idx += term.length + 1;
  }
};

['index.js', 'the-watch.js', 'sample-project.js'].forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  console.log('Searching in:', file);
  findStrings(content, 'watchRight');
  findStrings(content, 'timeless.firstLabel');
});

