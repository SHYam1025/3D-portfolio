import fs from 'fs';

// Since we cannot easily parse binary glTF (.glb) natively in node without a library,
// let's look for strings in the glb file to see the animation names.
const buffer = fs.readFileSync('public/models/character.glb');
const content = buffer.toString('utf8');

// Use a regex to find strings that look like animation names
// In glTF json chunk, animations have a "name" property
const matches = content.match(/"name":"([^"]+)"/g);
if (matches) {
    const names = new Set(matches.map(m => m.split(':')[1].replace(/"/g, '')));
    console.log(Array.from(names).join('\n'));
}
