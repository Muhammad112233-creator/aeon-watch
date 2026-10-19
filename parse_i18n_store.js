const fs = require('fs');
const content = fs.readFileSync('the-watch.js', 'utf8');

// Search for import of Ce or where Ce is created
const lines = content.split(';');
for (let line of lines) {
  if (line.includes('watchRight') || line.includes('firstLabel') || line.includes('timeless.firstText') || line.includes('movement.description')) {
    console.log("Found line:", line.slice(0, 250));
  }
}
