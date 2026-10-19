const fs = require('fs');

['index.js', 'the-watch.js', 'sample-project.js'].forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  console.log('====== FILE: ' + file + ' ======');
  // Match readable english sentences / phrases
  const matches = content.match(/[A-Z][A-Za-z0-9 ,.'’"–—:;!?()/-]{15,}/g) || [];
  const unique = Array.from(new Set(matches)).filter(s => 
    !s.includes('function') && !s.includes('prototype') && !s.includes('undefined') && !s.includes('Cannot')
  );
  console.log(unique);
});
