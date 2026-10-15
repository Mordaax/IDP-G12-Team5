// Downloads the original photos from the Figma file into public/assets/img/figma/
// and points the "images" entry of src/data/db.json at them.
//
//   1. In Figma: Settings → Security → Personal access tokens → Generate new token
//      (scope: "File content: read-only").
//   2. Windows (Command Prompt):  set FIGMA_TOKEN=your-token  &&  npm run fetch-images
//      macOS / Linux:             FIGMA_TOKEN=your-token npm run fetch-images
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const FILE_KEY = '5cbpeZwQGso9ltPXUrudd3'; // Education LittleRedMusic IDP G12 Team 5
const IMAGES = {   // name in images.ts → Figma image hash
  artistHero:       '6c66b1bd93074571114ca28f265300b9de298102',
  fallingArt:       'ab0c2b675d1277aa1bbd33237f53d50766149ac8',
  artistUpcoming:   '1826d6372bb34ab417316ce0d592edc15777ab5f',
  fallingIslandsSq: 'e0d9474c4b37413f54b23e48e1955d461fc64ffa',
  evanturetime:     'd64fdaed911fe0498a374e30bcd37be59403fa62',
  eventsMap:        '2cfd94cc3bbb45d5b080e3293f8df33e796aa455',
  intriguant:       'b5fb40611a4f341895e9318aa4e783f40b209628',
  shermanZhuo:      '7aec507d805b5d0ccdbc949b7e8330c9d877f2aa',
  eventsMapSearch:  '3fd89a160dd14e1b695401aa3514f9388c127dfa',
  eventHero:        'a126e4ba1b316c3b8d8381e37112e387f022de27',
  goingA:           '2cc5627d5f94f9ffd56142d7aef032cffd7ed007',
  goingB:           'bf69a8a38e92068f60265186a79dfc851c65ee4a',
  rosaPark:         '0c41695cae30536fb6f0ea7a4345b3a48560d948',
  joelTan:          'a8b063b33fe2eddc60424a7d4ded233274647d1c',
};

const token = process.env.FIGMA_TOKEN;
if (!token) { console.error('Set FIGMA_TOKEN first (see the comment at the top of this file).'); process.exit(1); }

const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/images`, { headers: { 'X-Figma-Token': token } });
if (!res.ok) { console.error(`Figma API error ${res.status}: ${await res.text()}`); process.exit(1); }
const urls = (await res.json()).meta.images;

await mkdir('public/assets/img/figma', { recursive: true });
const paths = {};
for (const [name, hash] of Object.entries(IMAGES)) {
  const url = urls[hash];
  if (!url) { console.warn(`  ! ${name}: not found in the file any more`); continue; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const ext = buf[0] === 0x89 ? 'png' : buf[0] === 0xff ? 'jpg' : buf[0] === 0x47 ? 'gif' : 'webp';
  await writeFile(`public/assets/img/figma/${name}.${ext}`, buf);
  paths[name] = `/assets/img/figma/${name}.${ext}`;
  console.log(`  ✓ ${name}.${ext} (${Math.round(buf.length / 1024)} KB)`);
}

const db = JSON.parse(await readFile('src/data/db.json', 'utf8'));
for (const k of Object.keys(IMAGES)) db.images[k] = paths[k] ?? `/assets/img/placeholder/${k}.svg`;
await writeFile('src/data/db.json', JSON.stringify(db, null, 1));
console.log('Done — src/data/db.json now points at the real photos.');
