import { mkdir, writeFile } from 'node:fs/promises';
import { pixelText } from './pixel-font.mjs';

const username = 'YspCoder';
const assetsDirectory = new URL('../assets/', import.meta.url);
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': `${username}-profile`,
};
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (token) headers.Authorization = `Bearer ${token}`;

async function getJson(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${path}`);
  }
  return response.json();
}

const profile = await getJson(`/users/${encodeURIComponent(username)}`);
const repositories = [];
for (let page = 1; ; page += 1) {
  const batch = await getJson(
    `/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&page=${page}`,
  );
  if (!Array.isArray(batch)) throw new Error('Unexpected GitHub repository response');
  repositories.push(...batch);
  if (batch.length < 100) break;
}

const publicRepositories = repositories.filter(
  (repository) => repository.visibility === 'public' && repository.private === false,
);
if (publicRepositories.length !== profile.public_repos) {
  throw new Error('Public repository count changed during the update; run again');
}
const stars = publicRepositories
  .filter((repository) => !repository.fork && repository.name.toLowerCase() !== username.toLowerCase())
  .reduce((total, repository) => total + repository.stargazers_count, 0);
const joinedYear = new Date(profile.created_at).getUTCFullYear();
if (!Number.isSafeInteger(stars) || !Number.isSafeInteger(joinedYear)) {
  throw new Error('Unexpected GitHub profile statistics');
}

const updatedAt = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const metrics = [
  { value: profile.public_repos, label: '公开仓库', code: 'REPOS', accent: 'mint' },
  { value: stars, label: '非 Fork 仓库获星', code: 'STARS', accent: 'gold' },
  { value: joinedYear, label: '加入 GitHub', code: 'SINCE', accent: 'coral' },
];

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function createSvg(theme, mobile) {
  const palette = theme === 'dark'
    ? { background: '#172422', border: '#3b5150', primary: '#edf7f4', muted: '#acbfba' }
    : { background: '#f3f7f4', border: '#abc1b8', primary: '#203a35', muted: '#536d63' };
  Object.assign(palette, { mint: '#85dfbd', gold: '#edd487', coral: '#f28a79' });
  const width = mobile ? 600 : 920;
  const height = mobile ? 420 : 236;
  const metricMarkup = metrics.map((metric, index) => {
    const x = mobile ? 34 : 40 + index * 294;
    const y = mobile ? 93 + index * 106 : 87;
    const labelX = mobile ? 226 : x;
    const labelY = mobile ? y + 33 : y + 81;
    const codeX = mobile ? labelX : x;
    const codeY = mobile ? y - 10 : y - 21;
    const divider = mobile
      ? (index < 2 ? `<path d="M34 ${y + 77}H566" stroke="${palette.border}" stroke-width="2"/>` : '')
      : (index < 2 ? `<path d="M${x + 266} 66V177" stroke="${palette.border}" stroke-width="2"/>` : '');
    const numberScale = Math.min(mobile ? 6 : 8, Math.floor((mobile ? 170 : 236) / (String(metric.value).length * 6 - 1)));
    const numberColor = theme === 'dark' ? palette[metric.accent] : palette.primary;
    return `${divider}
  <rect x="${codeX}" y="${codeY}" width="8" height="8" fill="${palette[metric.accent]}"/>
  ${pixelText(metric.code, codeX + 16, codeY, 2, palette.muted)}
  ${pixelText(String(metric.value), x, y, numberScale, numberColor)}
  <text x="${labelX}" y="${labelY}" fill="${palette.primary}" font-size="${mobile ? 24 : 19}" font-weight="500">${escapeXml(metric.label)}</text>`;
  }).join('\n');
  const timestamp = `更新于 ${updatedAt} · 上海时间`;
  const footerY = height - 25;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(username)} 的 GitHub 公开统计</title>
  <desc id="description">${escapeXml(metrics.map(({ value, label }) => `${label} ${value}`).join('；'))}。${escapeXml(timestamp)}</desc>
  <rect width="${width}" height="${height}" fill="${palette.background}"/>
  <g shape-rendering="crispEdges">
    <path d="M0 2H${width}M0 ${height - 2}H${width}" stroke="${palette.border}" stroke-width="4"/>
    <path d="M0 0V12H12M${width} 0V12H${width - 12}M0 ${height}V${height - 12}H12M${width} ${height}V${height - 12}H${width - 12}" fill="none" stroke="${palette.primary}" stroke-width="4"/>
    <rect x="40" y="0" width="48" height="4" fill="${palette.mint}"/>
    <rect x="92" y="0" width="24" height="4" fill="${palette.gold}"/>
    <rect x="120" y="0" width="16" height="4" fill="${palette.coral}"/>
    ${pixelText('SAVE DATA', mobile ? 34 : 40, 25, 2, palette.primary)}
    <path d="M${mobile ? 34 : 40} 52H${width - (mobile ? 34 : 40)}" stroke="${palette.border}" stroke-width="2"/>
  </g>
  <g font-family="Segoe UI, PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif" style="letter-spacing:0">
${metricMarkup}
  <text x="${mobile ? 34 : 40}" y="${footerY}" fill="${palette.muted}" font-size="${mobile ? 17 : 13}">${escapeXml(timestamp)}</text>
  </g>
</svg>
`;
}

await mkdir(assetsDirectory, { recursive: true });
for (const theme of ['dark', 'light']) {
  for (const mobile of [false, true]) {
    const filename = `stats-${mobile ? 'mobile-' : ''}${theme}.svg`;
    await writeFile(new URL(filename, assetsDirectory), createSvg(theme, mobile), 'utf8');
  }
}
console.log(JSON.stringify({ username, publicRepositories: profile.public_repos, nonForkStars: stars, joinedYear, updatedAt }, null, 2));
