import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pixelText } from './pixel-font.mjs';

const assets = new URL('../assets/', import.meta.url);
const sharp = process.argv[2] ? (await import(process.argv[2])).default : null;
await mkdir(assets, { recursive: true });
const originalAvatar = await readFile(new URL('avatar.png', assets));
const avatar = sharp ? await sharp(originalAvatar).resize(64, 64, { kernel: 'nearest' }).png().toBuffer() : originalAvatar;
const avatarData = `data:image/png;base64,${avatar.toString('base64')}`;
const r = (x, y, w, h, color) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const nativeText = (value, x, y, size, color, weight = 500) => `<text x="${x}" y="${y}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${xml(value)}</text>`;

function palette(theme) {
  return theme === 'dark'
    ? { bg: '#1b1f23', bar: '#282e33', border: '#566169', ink: '#edf1e9', muted: '#adb8b9', mint: '#95cfaa', coral: '#edaa96', gold: '#e0c18c', purple: '#bba8d5' }
    : { bg: '#f3f4f2', bar: '#e3e7e5', border: '#aeb9b7', ink: '#303b3e', muted: '#627272', mint: '#527e61', coral: '#a66b57', gold: '#987a43', purple: '#806990' };
}

function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(title)}"><title>${xml(title)}</title>${body}</svg>`;
}

function frame(width, height, p, accent) {
  return r(0, 0, width, height, p.bg) + `<path d="M8 0H${width - 8}v4H8zM0 8h4v${height - 16}H0zM${width - 4} 8h4v${height - 16}h-4zM8 ${height - 4}H${width - 8}v4H8z" fill="${p.border}"/>` + r(8, 0, 64, 4, accent) + r(76, 0, 24, 4, p.gold) + r(104, 0, 12, 4, p.purple);
}

function player(theme, mobile) {
  const p = palette(theme);
  const width = mobile ? 600 : 920;
  const height = mobile ? 482 : 328;
  let body = frame(width, height, p, p.coral);
  body += r(8, 8, width - 16, 42, p.bar);
  body += pixelText('YSPCODER / PROFILE.SAV', 28, 23, mobile ? 2.1 : 1.5, p.muted);
  for (let i = 0; i < 3; i++) body += r(width - 80 + i * 19, 24, 10, 10, [p.mint, p.gold, p.coral][i]);
  const ax = mobile ? 36 : 48;
  const ay = mobile ? 96 : 86;
  const avatarSize = mobile ? 156 : 184;
  body += `<image x="${ax}" y="${ay}" width="${avatarSize}" height="${avatarSize}" href="${avatarData}" style="image-rendering:pixelated"/>`;
  body += `<path d="M${ax - 8} ${ay + 20}v-28h28M${ax + avatarSize - 20} ${ay - 8}h28v28M${ax - 8} ${ay + avatarSize - 20}v28h28M${ax + avatarSize - 20} ${ay + avatarSize + 8}h28v-28" stroke="${p.mint}" stroke-width="4" fill="none"/>`;
  const tx = mobile ? 226 : 282;
  body += pixelText('PLAYER 01', tx, mobile ? 84 : 82, mobile ? 2.4 : 1.4, p.coral);
  body += pixelText('YSPCODER', tx, mobile ? 119 : 113, mobile ? 6.6 : 7, p.ink);
  body += nativeText('野生派 Coder', tx, mobile ? 205 : 204, mobile ? 29 : 25, p.muted, 600);
  body += pixelText('SPAWN : BEIJING', tx, mobile ? 233 : 240, mobile ? 2.2 : 1.8, p.muted);
  if (mobile) {
    body += nativeText('用 Go 构建服务与 SDK，', 36, 318, 28, p.ink);
    body += nativeText('探索 AI、跨平台交互和像素游戏。', 36, 360, 28, p.ink);
    body += r(36, 388, 528, 2, p.border);
    body += pixelText('BUILD / EXPLORE / SHARE', 36, 413, 2.2, p.mint);
    body += pixelText('EST. 2016', 441, 447, 2, p.muted);
  } else {
    body += r(282, 270, 590, 2, p.border);
    body += pixelText('BUILD / EXPLORE / SHARE', 282, 290, 1.8, p.mint);
    body += pixelText('EST. 2016', 786, 294, 1.1, p.muted);
  }
  return svg(width, height, 'YspCoder / 野生派 Coder / 北京 / Go、AI 集成与跨平台开发', body);
}

const quests = [
  { file: 'social-hub', title: 'SOCIAL-HUB', code: 'SOCIAL API / MCP', state: 'ALPHA', icon: 'network', accent: 'mint' },
  { file: 'omnigo', title: 'OMNIGO', code: 'LLM / MULTIMODAL', state: 'IN PROGRESS', icon: 'ai', accent: 'gold' },
  { file: 'react-native-txc-player', title: 'REACT-NATIVE-TXC-PLAYER', code: 'FABRIC / IOS / ANDROID', state: 'CROSS-PLATFORM', icon: 'video', accent: 'purple' },
  { file: 'pixel-adventure', title: 'PIXELADVENTURE2D-UE5', code: 'BLUEPRINTS / PAPERZD', state: 'GAME TEMPLATE', icon: 'game', accent: 'coral' },
];
const icons = {};
for (const icon of ['network', 'ai', 'video', 'game']) {
  const source = await readFile(new URL(`project-${icon}.svg`, assets), 'utf8');
  icons[icon] = source.replace(/^.*?<title>.*?<\/title>/s, '').replace(/<\/svg>\s*$/, '');
}

function quest(item, index, theme, mobile) {
  const p = palette(theme);
  const width = mobile ? 600 : 920;
  const height = mobile ? 174 : 132;
  const accent = p[item.accent];
  let body = frame(width, height, p, accent);
  body += r(12, 12, 4, height - 24, accent);
  body += `<g transform="translate(${mobile ? 34 : 38} ${mobile ? 52 : 27}) scale(${mobile ? 2.6 : 2.25})">${icons[item.icon]}</g>`;
  const tx = mobile ? 150 : 160;
  body += pixelText(`QUEST 0${index + 1}`, tx, mobile ? 25 : 22, mobile ? 2.4 : 1.5, accent);
  const lines = mobile && item.file === 'react-native-txc-player' ? ['REACT-NATIVE', 'TXC-PLAYER'] : [item.title];
  const size = mobile ? (lines[0].length > 17 ? 3.3 : 3.7) : 3.7;
  lines.forEach((line, lineIndex) => body += pixelText(line, tx, (mobile ? 54 : 48) + lineIndex * 33, size, p.ink));
  body += pixelText(item.code, tx, mobile ? 133 : 96, mobile ? 2.5 : 1.5, p.muted);
  if (!mobile) body += pixelText(item.state, 704, 25, 1.35, p.muted);
  body += pixelText('>', width - 40, height / 2 - 6, 1.8, accent);
  return svg(width, height, item.title, body);
}

for (const theme of ['light', 'dark']) {
  for (const mobile of [false, true]) {
    const suffix = `${theme}${mobile ? '-mobile' : ''}`;
    const source = player(theme, mobile);
    await writeFile(new URL(`player-${suffix}.svg`, assets), source);
    if (sharp) await sharp(Buffer.from(source)).png().toFile(fileURLToPath(new URL(`player-${suffix}.png`, assets)));
    for (const [index, item] of quests.entries()) {
      await writeFile(new URL(`quest-${item.file}-${suffix}.svg`, assets), quest(item, index, theme, mobile));
    }
  }
}
console.log('Player profile and four responsive quest slots generated.');
