const fs = require('fs');

['index.js', 'the-watch.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/[\w\/\-\.]+\.json/gi) || [];
  console.log(`JSON files referenced in ${file}:`, matches);
});
