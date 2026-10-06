import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const assets = new URL('../assets/', import.meta.url);
const sharp = process.argv[2] ? (await import(process.argv[2])).default : null;
await mkdir(assets, { recursive: true });
const p = { bg: '#080b10', surface: '#0f121c', ink: '#edf4ff', muted: '#a4b1c4', line: '#253047', purple: '#bd80ff', blue: '#36bfff' };
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const rect = (x, y, w, h, color, opacity = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="${opacity}"/>`;
const text = (value, x, y, size, color = p.ink, weight = 400, family = 'Bahnschrift, Arial Narrow, Arial, Microsoft YaHei, sans-serif') => `<text x="${x}" y="${y}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}" style="letter-spacing:0">${xml(value)}</text>`;
const nativeText = (value, x, y, size, color = p.ink, weight = 400) => text(value, x, y, size, color, weight, 'Microsoft YaHei, Noto Sans CJK SC, sans-serif');
const line = (d, color, width = 1, opacity = 1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
const wrap = (width, height, title, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${xml(title)}</title>${body}</svg>`;

function node(label, x, y, width, height, color, fontSize) {
  const shape = `M${x + 9} ${y}H${x + width}V${y + height - 9}L${x + width - 9} ${y + height}H${x}V${y + 9}z`;
  return `<path d="${shape}" fill="${p.surface}" stroke="${color}" stroke-width="1.5"/>` + text(label, x + 13, y + height / 2 + fontSize / 3, fontSize, color, 500);
}

function cover(mobile) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 430 : 380;
  const x = mobile ? 28 : 48;
  let body = rect(0, 0, width, height, p.bg);
  for (let i = 1; i < 12; i++) body += line(`M${i * 100} 0V${height}`, '#142037', 1, 0.6);
  for (let y = 60; y < height; y += 60) body += line(`M0 ${y}H${width}`, '#142037', 1, 0.6);
  body += line(`M0 1H${width - 26}l25 25V${height - 1}H26L1 ${height - 26}V1`, p.line, 2);
  body += line(`M${x} 1h${mobile ? 82 : 155}`, p.purple, 3);
  body += text('YSP / PUBLIC PROFILE', x, mobile ? 37 : 38, mobile ? 18 : 15, p.muted, 500);
  body += text('BEIJING / 2016', mobile ? 384 : 987, mobile ? 37 : 38, mobile ? 15 : 15, p.blue, 500);

  const baseline = mobile ? 132 : 194;
  const size = mobile ? 81 : 146;
  const title = (offset, color) => text('YSPCODER', x + offset, baseline, size, color, 700);
  body += title(0, p.ink);
  // Thin clipped offsets give a glitch accent without compromising the wordmark.
  body += `<defs><clipPath id="glitch-blue">${rect(x, baseline - size * 0.52, mobile ? 520 : 790, mobile ? 2 : 3, '#fff')}</clipPath><clipPath id="glitch-purple">${rect(x, baseline - size * 0.22, mobile ? 520 : 790, mobile ? 2 : 3, '#fff')}</clipPath></defs>`;
  body += `<g clip-path="url(#glitch-blue)">${title(4, p.blue)}</g><g clip-path="url(#glitch-purple)">${title(-3, p.purple)}</g>`;
  body += rect(mobile ? 450 : 823, baseline - (mobile ? 63 : 118), 4, mobile ? 70 : 134, p.blue);
  body += nativeText('野生派 Coder', x, mobile ? 183 : 252, mobile ? 29 : 30, p.purple, 500);
  body += nativeText('用代码连接服务、模型与跨平台体验。', x, mobile ? 232 : 296, mobile ? 23 : 22, p.muted);
  body += text('GO / AI INTEGRATION / CROSS-PLATFORM', x, mobile ? 277 : 343, mobile ? 20 : 20, p.blue, 500);

  if (mobile) {
    body += line('M171 342H224M373 342H426', p.purple, 2);
    body += node('GO / SDK', 28, 321, 143, 42, p.blue, 18);
    body += node('AI / MCP', 224, 321, 149, 42, p.purple, 18);
    body += node('APP', 426, 321, 145, 42, p.blue, 18);
    body += text('GITHUB.COM / YSPCODER', x, 402, 16, p.muted);
  } else {
    body += line('M1010 128v20h-60v45h112v21', p.blue, 2);
    body += line('M1142 147h22v106h-46', p.purple, 2);
    body += node('GO / SDK', 972, 83, 166, 45, p.blue, 21);
    body += node('AI / MCP', 891, 148, 171, 45, p.purple, 21);
    body += node('APP / MOBILE', 951, 214, 201, 45, p.blue, 21);
    body += text('CONNECT / BUILD / EXPLORE', 884, 301, 15, p.muted);
    body += line('M900 335h219l32-32', p.purple, 1.5);
  }
  body += line(`M${x} ${height - 1}h${mobile ? 98 : 184}`, p.blue, 3);
  return wrap(width, height, 'YspCoder 赛博朋克个人主页：野生派 Coder，北京，Go、AI 集成与跨平台开发。', body);
}

const projects = [
  { name: 'social-hub', file: 'social-hub', purpose: '统一社交平台 SDK，让应用与 Agent 共用集成能力。', category: 'GO / SOCIAL API / MCP', status: 'ALPHA', color: p.blue },
  { name: 'omnigo', file: 'omnigo', purpose: '用一套 Go 接口连接 LLM 与多模态模型服务。', category: 'GO / LLM / MULTIMODAL', status: 'IN DEVELOPMENT', color: p.purple },
  { name: 'react-native-txc-player', file: 'react-native-txc-player', purpose: '把原生点播能力带进 React Native。', category: 'FABRIC / IOS / ANDROID', status: 'CROSS-PLATFORM', color: p.blue },
  { name: 'PixelAdventure2D-UE5', file: 'pixel-adventure', purpose: '用 Unreal Engine 蓝图探索 2D 游戏模板。', category: 'UE5 / BLUEPRINTS / PAPERZD', status: 'GAME TEMPLATE', color: p.purple },
];

function project(item, index, mobile) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 218 : 172;
  let body = rect(0, 0, width, height, p.bg);
  body += `<path d="M18 8H${width - 34}l26 26V${height - 8}H34L8 ${height - 34}V18z" fill="${p.surface}" stroke="${p.line}"/>`;
  body += line(`M18 8h84M8 18v48M${width - 8} ${height - 8}h-66`, item.color, 2);
  body += text(`0${index + 1} / PROJECT`, mobile ? 28 : 36, mobile ? 40 : 36, mobile ? 20 : 15, item.color, 500);
  body += text(item.status, mobile ? 358 : 978, mobile ? 40 : 36, mobile ? 17 : 16, p.muted);
  const titleLines = mobile && item.file === 'react-native-txc-player' ? ['react-native-', 'txc-player'] : [item.name];
  const ty = mobile ? 83 : 80;
  const titleSize = mobile ? 34 : 39;
  titleLines.forEach((value, lineIndex) => body += text(value, mobile ? 28 : 36, ty + lineIndex * 36, titleSize, p.ink, 600));
  const shortPurpose = mobile
    ? ({ 'social-hub': '统一社交 API 与自托管 MCP。', omnigo: 'Go 的 LLM 与多模态模型集成工具包。', 'react-native-txc-player': 'React Native 原生点播播放器。', 'pixel-adventure': '用 UE5 蓝图探索 2D 游戏。' })[item.file]
    : item.purpose;
  body += nativeText(shortPurpose, mobile ? 28 : 36, mobile ? 154 : 115, mobile ? 24 : 21, p.muted);
  body += text(item.category, mobile ? 28 : 36, mobile ? 190 : 148, mobile ? 19 : 17, item.color, 500);
  body += line(`M${width - 50} ${mobile ? 171 : 127}h14v14M${width - 36} ${mobile ? 171 : 127}l-20 20`, item.color, 1.5);
  return wrap(width, height, `${item.name} / ${item.purpose} / ${item.category} / ${item.status}`, body);
}

function stack(mobile) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 192 : 114;
  let body = rect(0, 0, width, height, p.bg);
  body += text('TOOLCHAIN /', 28, 34, mobile ? 18 : 16, p.purple, 500);
  if (mobile) {
    body += text('GO / PYTHON / TYPESCRIPT', 28, 76, 24, p.ink, 500);
    body += text('REACT NATIVE / KOTLIN', 28, 115, 24, p.ink, 500);
    body += text('UNREAL ENGINE / MCP', 28, 154, 24, p.blue, 500);
  } else {
    body += text('GO / PYTHON / TYPESCRIPT / REACT NATIVE / KOTLIN / UNREAL ENGINE / MCP', 28, 81, 22, p.ink, 500);
  }
  body += line(`M28 ${height - 1}H${width - 28}`, p.line, 1);
  return wrap(width, height, 'Go、Python、TypeScript、React Native、Kotlin、Unreal Engine、MCP', body);
}

for (const mobile of [false, true]) {
  const suffix = mobile ? '-mobile' : '';
  const source = cover(mobile);
  await writeFile(new URL(`cyber-cover${suffix}.svg`, assets), source);
  if (sharp) await sharp(Buffer.from(source)).png().toFile(fileURLToPath(new URL(`cyber-cover${suffix}.png`, assets)));
  for (const [index, item] of projects.entries()) {
    await writeFile(new URL(`cyber-project-${item.file}${suffix}.svg`, assets), project(item, index, mobile));
  }
  await writeFile(new URL(`cyber-stack${suffix}.svg`, assets), stack(mobile));
}
console.log('Cyberpunk cover, project panels, and toolchain generated.');
