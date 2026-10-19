const fs = require('fs');
const buffer = fs.readFileSync('assets/watch.glb');

// Read GLB header: magic (4), version (4), length (4)
const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);
console.log(`GLB Magic: ${magic}, Version: ${version}, Length: ${length}`);

// Chunk 0: JSON
const jsonChunkLength = buffer.readUInt32LE(12);
const jsonChunkType = buffer.toString('utf8', 16, 20);
const jsonData = buffer.toString('utf8', 20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonData);

console.log('Meshes:', gltf.meshes ? gltf.meshes.length : 0);
console.log('Nodes count:', gltf.nodes ? gltf.nodes.length : 0);
console.log('Materials count:', gltf.materials ? gltf.materials.length : 0);
console.log('\nSample node names:');
const nodeNames = (gltf.nodes || []).map(n => n.name).filter(Boolean);
console.log(nodeNames);

console.log('\nSample material names:');
const matNames = (gltf.materials || []).map(m => m.name).filter(Boolean);
console.log(matNames);
console.log('All remaining nodes:');
console.log(nodeNames.slice(90));
