import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pixelText } from './pixel-font.mjs';

const assets = new URL('../assets/', import.meta.url);
const sharp = process.argv[2] ? (await import(process.argv[2])).default : null;
await mkdir(assets, { recursive: true });

const rect = (x, y, width, height, color) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}"/>`;

function createBanner(theme, mobile) {
  const dark = theme === 'dark';
  const width = mobile ? 360 : 600;
  const height = mobile ? 284 : 230;
  const p = dark
    ? { sky: '#182829', sky2: '#213e40', far: '#2b5152', hill: '#326667', land: '#214846', grass: '#5ba89a', ink: '#f0f4da', muted: '#a2c7bb', cloud: '#305557', water: '#284d52' }
    : { sky: '#d9eeeb', sky2: '#b8dbd8', far: '#97beb9', hill: '#72aaa2', land: '#447f71', grass: '#92bfa3', ink: '#214d48', muted: '#4e7971', cloud: '#f5f9e9', water: '#80b9b8' };
  const parts = [];
  const r = (...args) => parts.push(rect(...args));
  const path = (d, color) => parts.push(`<path d="${d}" fill="${color}"/>`);
  const text = (...args) => parts.push(pixelText(...args));
  const ground = mobile ? 242 : 186;

  r(0, 0, width, height, p.sky);
  r(0, ground - 58, width, 58, p.sky2);
  // All silhouettes follow an integer grid to preserve the pixel landscape.
  path(`M0 ${ground - 32}h24v-10h32v-12h20v-13h30v11h20v10h44v-20h20v-12h26v12h20v16h40v8h42v-18h28v-20h22v-10h20v22h30v13h28v-12h40v-8h28v20h46v72H0z`, p.far);
  path(`M0 ${ground - 11}h30v-12h35v-6h22v9h31v-14h38v-12h26v12h28v14h44v-8h36v-18h26v-8h34v18h22v17h35v-10h28v-9h34v13h25v-22h26v-8h30v30h35v62H0z`, p.hill);
  r(0, ground - 9, width, 38, p.water);
  for (let i = 0; i < 15; i += 1) r((i * 47 + 8) % width, ground - 4 + (i % 3) * 8, 8 + (i % 4) * 3, 1, p.grass);

  const cloud = (x, y, w) => {
    r(x, y, w, 3, p.cloud);
    r(x + 7, y - 4, w - 15, 5, p.cloud);
    r(x + 16, y - 7, w - 30, 5, p.cloud);
  };
  cloud(mobile ? 250 : 352, mobile ? 28 : 29, 60);
  cloud(mobile ? 285 : 425, mobile ? 60 : 61, 53);
  cloud(15, ground - 54, 46);
  const moonX = mobile ? 307 : 546;
  r(moonX, 22, 17, 23, '#f2d69b');
  r(moonX - 3, 26, 23, 15, '#f2d69b');
  if (dark) {
    r(moonX + 7, 20, 13, 17, p.sky);
    r(moonX + 3, 19, 17, 10, p.sky);
  }
  const sparkle = (x, y, color) => {
    r(x, y - 3, 1, 7, color);
    r(x - 3, y, 7, 1, color);
  };
  [[18, 15], [328, 17], [376, 57], [516, 22], [583, 62], [291, 53]].forEach(([x, y], i) => {
    if (x < width - 3) sparkle(x, y, i % 2 ? p.muted : '#e6bd89');
  });

  r(0, ground + 21, width, height - ground - 21, p.land);
  r(0, ground + 21, width, 3, p.grass);
  for (let i = 0; i < 44; i += 1) {
    const x = (i * 73 + 7) % width;
    const y = ground + 28 + (i * 17) % Math.max(1, height - ground - 32);
    r(x, y, 2 + i % 3, 1, i % 2 ? p.grass : p.hill);
  }

  const studio = [];
  const sr = (...args) => studio.push(rect(...args));
  const sp = (d, color) => studio.push(`<path d="${d}" fill="${color}"/>`);
  // Open-front studio with a lit desk, shelves, and a small programmer sprite.
  sr(4, 116, 188, 5, '#152e2d');
  sr(15, 108, 167, 8, '#365651');
  sr(12, 35, 165, 75, '#294a49');
  sr(19, 40, 152, 63, '#3c6260');
  sr(25, 46, 61, 42, '#9ac8bc');
  sr(28, 49, 55, 36, '#567f7c');
  sr(31, 66, 19, 15, '#739b8c');
  sr(49, 61, 15, 20, '#85b29c');
  sr(63, 71, 17, 10, '#9bc3a7');
  sr(54, 47, 3, 40, '#b2cfb7');
  sr(26, 65, 57, 3, '#b2cfb7');
  sr(12, 34, 7, 74, '#819e89');
  sr(171, 34, 6, 75, '#819e89');
  sp('M3 34h11V23h17V12h139v11h15v11h7v7H3z', '#944f59');
  sp('M8 31h13V20h15V9h129v11h15v11h8v4H8z', '#e67b73');
  sr(36, 9, 129, 4, '#f3b494');
  sr(27, 20, 148, 3, '#c66468');
  sr(15, 31, 166, 3, '#c66468');
  for (let x = 47; x < 163; x += 20) sr(x, 15, 2, 3, '#f3a189');
  sr(116, 41, 43, 4, '#c5a982');
  sr(119, 30, 5, 11, '#96bdaa');
  sr(126, 31, 5, 10, '#de997e');
  sr(133, 28, 6, 13, '#e8c68e');
  sr(141, 31, 4, 10, '#ab9cbd');
  sr(150, 33, 5, 8, '#9ecac3');
  sr(151, 38, 3, 2, '#e8c68e');
  sr(113, 51, 47, 3, '#c5a982');
  sr(123, 45, 12, 6, '#d17e78');
  sr(140, 44, 9, 7, '#ddc29b');
  sr(34, 88, 109, 5, '#d5b78f');
  sr(39, 93, 5, 14, '#936f66');
  sr(132, 93, 5, 14, '#936f66');
  sr(46, 65, 32, 23, '#182f31');
  sr(49, 68, 26, 17, '#9be3bf');
  sr(52, 71, 8, 2, '#447c69');
  sr(63, 71, 8, 2, '#528b78');
  sr(52, 76, 15, 2, '#447c69');
  sr(52, 80, 7, 1, '#528b78');
  sr(61, 86, 3, 3, '#698f82');
  sr(92, 61, 34, 25, '#182f31');
  sr(95, 64, 28, 19, '#91cbbd');
  sr(98, 67, 12, 2, '#3e7b70');
  sr(98, 72, 19, 2, '#598e7a');
  sr(101, 77, 15, 2, '#3e7b70');
  sr(107, 86, 4, 3, '#698f82');
  sr(52, 89, 21, 2, '#7c8a7d');
  sr(140, 80, 7, 7, '#f5e2b4');
  sr(147, 81, 3, 4, '#f5e2b4');
  sr(149, 82, 1, 2, '#3c6260');
  sr(138, 75, 2, 3, '#aec7b7');
  sr(142, 71, 2, 3, '#aec7b7');
  sr(82, 74, 11, 13, '#e4b391');
  sr(78, 70, 18, 7, '#273d3b');
  sr(80, 77, 4, 5, '#273d3b');
  sr(82, 87, 13, 16, '#a495c4');
  sr(78, 90, 7, 4, '#c1afd6');
  sr(95, 91, 5, 3, '#e4b391');
  sr(77, 101, 22, 5, '#746b93');
  sr(78, 106, 4, 8, '#354b4b');
  sr(94, 106, 4, 8, '#354b4b');
  sr(75, 83, 3, 17, '#746b93');
  sr(155, 98, 15, 11, '#c58b79');
  sr(153, 95, 19, 4, '#e2ab8b');
  sr(160, 73, 3, 22, '#94be9f');
  sp('M161 82h-8v-8h-5v-7h7v7h6zM162 88h8v-9h5v-8h-7v8h-6z', '#8ec7a5');
  sr(18, 111, 158, 2, '#638878');
  for (let x = 25; x < 171; x += 26) sr(x, 105, 1, 8, '#547466');

  const scale = mobile ? 0.82 : 1;
  parts.push(`<g transform="translate(${mobile ? 177 : 385} ${ground + 21 - 121 * scale}) scale(${scale})">${studio.join('')}</g>`);

  function tree(x, y, size = 1) {
    parts.push(`<g transform="translate(${x} ${y}) scale(${size})">`);
    r(10, 27, 4, 26, '#526954');
    path('M4 32h-7v-9h8v-9h7V4h5v10h7v9h8v9h-8v9H4z', '#4f927c');
    path('M4 24h8V11h5v14h9v7H5z', '#82b89b');
    r(13, 4, 3, 9, '#acccab');
    parts.push('</g>');
  }
  tree(mobile ? 160 : 354, ground + 21 - 53 * (mobile ? 0.8 : 1), mobile ? 0.8 : 1);
  tree(mobile ? 330 : 573, ground + 21 - 53 * (mobile ? 0.65 : 0.8), mobile ? 0.65 : 0.8);
  for (const x of mobile ? [14, 72, 140, 308] : [10, 95, 311, 380, 572]) {
    r(x, ground + 10, 2, 12, '#90b596');
    r(x - 3, ground + 8, 8, 4, '#dc9991');
    r(x - 1, ground + 6, 4, 8, '#edbaa0');
  }

  const titleY = mobile ? 46 : 56;
  text('PLAYER 01 / BEIJING', 28, 25, 1, p.muted);
  text('YSPCODER', 30, titleY + 3, mobile ? 5 : 5.4, dark ? '#0f191b' : '#b0cfc4');
  text('YSPCODER', 28, titleY, mobile ? 5 : 5.4, p.ink);
  parts.push(`<text x="28" y="${mobile ? 103 : 117}" fill="${p.muted}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="${mobile ? 13 : 14}" font-weight="600">野生派 Coder / 写代码，接通想法。</text>`);
  const chipY = mobile ? 119 : 135;
  text('GO', 28, chipY, 1.2, dark ? '#a6dca9' : '#386e58');
  r(47, chipY + 3, 2, 2, '#d4a277');
  text('AI INTEGRATION', 56, chipY, 1, dark ? '#f3c398' : '#976546');
  r(143, chipY + 3, 2, 2, '#d4a277');
  text('CROSS-PLATFORM', 153, chipY, 1, dark ? '#c9b5df' : '#76618f');
  if (mobile) text('> BUILDING USEFUL THINGS_', 28, 156, 0.9, p.muted);
  else {
    text('> BUILDING USEFUL THINGS_', 28, 211, 1, '#d5e4c5');
    text('EST. 2016', 514, 211, 0.7, '#c2d6b7');
  }
  r(0, 0, width, 2, dark ? '#729f88' : '#6fa48e');
  r(0, height - 2, width, 2, '#183d35');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${height * 2}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" role="img" aria-labelledby="title desc"><title id="title">YspCoder pixel coding studio</title><desc id="desc">An original pixel landscape with a lakeside coding studio. Go, AI Integration, Cross-platform.</desc>${parts.join('')}</svg>`;
}

for (const theme of ['dark', 'light']) {
  for (const mobile of [false, true]) {
    const name = `banner-${theme}${mobile ? '-mobile' : ''}`;
    const svg = createBanner(theme, mobile);
    await writeFile(new URL(`${name}.svg`, assets), svg);
    if (sharp) await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(`${name}.png`, assets)));
  }
}

for (const [name, label, color] of [
  ['quests', 'PROJECT QUESTS', '#608c75'],
  ['inventory', 'TECH INVENTORY', '#b48460'],
  ['save', 'SAVE DATA', '#9b83b3'],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="28" viewBox="0 0 300 28" shape-rendering="crispEdges"><title>${label}</title>${rect(0, 4, 4, 20, color)}${rect(8, 10, 4, 8, color)}${pixelText(label, 26, 7, 2, color)}</svg>`;
  await writeFile(new URL(`label-${name}.svg`, assets), svg);
}

for (const [label, color] of [
  ['GO', '#69b28b'], ['PYTHON', '#d7b16f'], ['TYPESCRIPT', '#79b5c4'],
  ['REACT NATIVE', '#8bbbb6'], ['KOTLIN', '#b398c4'], ['UNREAL ENGINE', '#bd9a93'], ['MCP', '#c8ad73'],
]) {
  const width = (label.length * 6 - 1) * 2 + 24;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="34" viewBox="0 0 ${width} 34" shape-rendering="crispEdges"><title>${label}</title><path d="M4 0h${width - 8}v4h4v26h-4v4H4v-4H0V4h4z" fill="#223936"/><path d="M4 0h${width - 8}v2H4zM0 4h2v26H0zM${width - 2} 4h2v26h-2zM4 32h${width - 8}v2H4z" fill="${color}"/>${pixelText(label, 12, 10, 2, color)}</svg>`;
  await writeFile(new URL(`badge-${label.toLowerCase().replaceAll(' ', '-')}.svg`, assets), svg);
}

const footer = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="110" viewBox="0 0 600 55" shape-rendering="crispEdges"><title>Keep building. Next quest awaits.</title>${rect(0, 0, 600, 55, '#233c37')}${rect(0, 0, 600, 2, '#7da78a')}${pixelText('KEEP BUILDING. NEXT QUEST AWAITS.', 28, 21, 1.4, '#c6d5b1')}${pixelText('CONTINUE >', 480, 23, 1, '#dfb390')}${rect(11, 38, 2, 7, '#88ad8e')}${rect(8, 36, 8, 4, '#dcb198')}${rect(580, 10, 2, 7, '#a8c5b5')}${rect(578, 12, 6, 2, '#a8c5b5')}</svg>`;
await writeFile(new URL('pixel-footer.svg', assets), footer);
const mobileFooter = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="152" viewBox="0 0 360 76" shape-rendering="crispEdges"><title>Keep building. Next quest awaits.</title>${rect(0, 0, 360, 76, '#233c37')}${rect(0, 0, 360, 2, '#7da78a')}${pixelText('KEEP BUILDING.', 24, 17, 1.8, '#c6d5b1')}${pixelText('NEXT QUEST AWAITS.', 24, 44, 1.2, '#c6d5b1')}${pixelText('CONTINUE >', 249, 46, 1, '#dfb390')}${rect(336, 14, 2, 7, '#a8c5b5')}${rect(334, 16, 6, 2, '#a8c5b5')}</svg>`;
await writeFile(new URL('pixel-footer-mobile.svg', assets), mobileFooter);
console.log(`Pixel assets generated${sharp ? ' with PNG exports' : ' (SVG source only)'}.`);
