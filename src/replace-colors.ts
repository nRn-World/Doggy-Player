import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/#A65D37/g, '#7A4614');
content = content.replace(/#8A4A2A/g, '#633810');
content = content.replace(/#C17A4A/g, '#9E5B1A');

fs.writeFileSync('src/App.tsx', content);
console.log('Replaced colors successfully!');
