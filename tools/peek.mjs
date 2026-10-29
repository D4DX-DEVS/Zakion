import fs from 'fs';
const P = JSON.parse(fs.readFileSync('seed/pages.json', 'utf8'));
const get = p => P.find(x => x.path === p);
const b = get(process.argv[2]).body_html;
const i = b.indexOf(process.argv[3] || '<main'); 
console.log(b.slice(i, i + (+process.argv[4] || 6000)));
