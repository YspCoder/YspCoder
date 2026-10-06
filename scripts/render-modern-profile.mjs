import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const assets = new URL('../assets/', import.meta.url);
const sharp = process.argv[2] ? (await import(process.argv[2])).default : null;
const avatar = `data:image/png;base64,${(await readFile(new URL('avatar.png', assets))).toString('base64')}`;
await mkdir(assets, { recursive: true });

const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const text = (value, x, y, size, color, weight = 400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${escapeXml(value)}</text>`;
const rect = (x, y, width, height, color) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}"/>`;
const colors = theme => theme === 'dark'
  ? { bg: '#191b1e', surface: '#202326', line: '#3b4045', ink: '#f1f4f4', muted: '#abb4b8', teal: '#70c8c0', coral: '#ed9b87', gold: '#d8bd86', blue: '#98bde1' }
  : { bg: '#f6f7f8', surface: '#ffffff', line: '#d8dfe2', ink: '#20262b', muted: '#63717a', teal: '#187e78', coral: '#bd705a', gold: '#947645', blue: '#537b9f' };

function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${escapeXml(title)}</title><g font-family="Arial, Microsoft YaHei, Noto Sans CJK SC, sans-serif" style="letter-spacing:0">${body}</g></svg>`;
}

function cover(theme, mobile) {
  const p = colors(theme);
  const width = mobile ? 600 : 920;
  const height = mobile ? 352 : 320;
  const x = mobile ? 34 : 40;
  let body = rect(0, 0, width, height, p.bg);
  body += rect(x, 0, mobile ? 70 : 100, 3, p.coral);
  body += text('YSPCODER / OPEN SOURCE', x, mobile ? 43 : 41, mobile ? 19 : 13, p.muted, 600);
  body += text('YspCoder', x - 2, mobile ? 137 : 153, mobile ? 92 : 104, p.ink, 700);
  body += text('野生派 Coder', x, mobile ? 204 : 203, mobile ? 30 : 25, p.muted, 500);
  body += `<image x="${mobile ? 374 : 655}" y="${mobile ? 155 : 65}" width="${mobile ? 184 : 230}" height="${mobile ? 184 : 230}" href="${avatar}"/>`;
  if (mobile) {
    body += text('Go / AI / Cross-platform', x, 254, 21, p.teal, 500);
    body += text('BEIJING · SINCE 2016', x, 306, 19, p.muted);
  } else {
    body += text('写代码，接通想法。', x, 239, 18, p.muted);
    body += text('Go', x, 287, 17, p.teal, 600);
    body += text('AI Integration', x + 60, 287, 17, p.coral, 600);
    body += text('Cross-platform', x + 209, 287, 17, p.blue, 600);
    body += text('BEIJING · SINCE 2016', 470, 287, 12, p.muted);
  }
  return svg(width, height, 'YspCoder · 野生派 Coder · Go / AI Integration / Cross-platform', body);
}

const projects = [
  { name: 'social-hub', file: 'social-hub', category: 'Go · Social API · MCP', status: 'Alpha', accent: 'teal' },
  { name: 'omnigo', file: 'omnigo', category: 'Go · LLM · Multimodal', status: '持续迭代', accent: 'coral' },
  { name: 'react-native-txc-player', file: 'react-native-txc-player', category: 'React Native · Fabric · iOS / Android', status: 'Cross-platform', accent: 'blue' },
  { name: 'PixelAdventure2D-UE5', file: 'pixel-adventure', category: 'Unreal Engine · Blueprints · PaperZD', status: '游戏模板', accent: 'gold' },
];

function project(item, index, theme, mobile) {
  const p = colors(theme);
  const width = mobile ? 600 : 920;
  const height = mobile ? 142 : 128;
  const accent = p[item.accent];
  let body = `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="6" fill="${p.surface}" stroke="${p.line}"/>`;
  body += text(`0${index + 1}`, mobile ? 24 : 30, mobile ? 82 : 78, mobile ? 37 : 40, accent, 400);
  body += rect(mobile ? 86 : 106, 29, 1, height - 58, p.line);
  body += text(item.name, mobile ? 109 : 133, mobile ? 65 : 61, mobile ? 31 : 32, p.ink, 600);
  body += text(item.category, mobile ? 109 : 133, mobile ? 108 : 99, mobile ? 20 : 16, p.muted);
  if (!mobile) body += text(item.status, 739, 61, 14, accent, 500);
  return svg(width, height, `${item.name} / ${item.category} / ${item.status}`, body);
}

for (const theme of ['light', 'dark']) {
  for (const mobile of [false, true]) {
    const suffix = `${theme}${mobile ? '-mobile' : ''}`;
    const source = cover(theme, mobile);
    await writeFile(new URL(`modern-banner-${suffix}.svg`, assets), source);
    if (sharp) await sharp(Buffer.from(source)).png().toFile(fileURLToPath(new URL(`modern-banner-${suffix}.png`, assets)));
    for (const [index, item] of projects.entries()) {
      await writeFile(new URL(`modern-project-${item.file}-${suffix}.svg`, assets), project(item, index, theme, mobile));
    }
  }
}
console.log('Modern profile cover and responsive project cards generated.');
