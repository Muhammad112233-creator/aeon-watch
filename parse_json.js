const fs = require('fs');

['index.js', 'the-watch.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Find where "colors" or "mechanism" or "watchRight" are defined with object keys
  const regex = /\{[^{}]*("colors"|colors:|'colors')[^{}]*\}/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    console.log(`Found in ${file}:`, m[0].slice(0, 300));
  }
});

