const fs = require('fs');
const files = ["index.js", "sample-project.js", "hotReplace.js", "the-watch.js", "gsapAnimation.js", "index.css"];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const urls = content.match(/[\/a-zA-Z0-9_\-\.\@]+\.(glb|gltf|hdr|exr|mp3|wav|ogg|png|jpg|jpeg|webp|svg|woff2?)/gi) || [];
  console.log("=== " + f + " assets ===");
  console.log(Array.from(new Set(urls)));
});
