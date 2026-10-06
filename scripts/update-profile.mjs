import { mkdir, writeFile } from 'node:fs/promises';

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
  { value: profile.public_repos, label: '公开仓库', code: 'REPOSITORIES', accent: 'teal' },
  { value: stars, label: '非 Fork 仓库获星', code: 'STARS', accent: 'coral' },
  { value: joinedYear, label: '加入 GitHub', code: 'SINCE', accent: 'teal' },
];

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function createSvg(theme, mobile) {
  const palette = theme === 'dark'
    ? { background: '#17191c', border: '#36393d', primary: '#f2f3f4', muted: '#a4a9ad', teal: '#75c9bb', coral: '#e59a89' }
    : { background: '#ffffff', border: '#e2e5e7', primary: '#24272b', muted: '#667078', teal: '#178b7c', coral: '#c76b58' };
  const width = mobile ? 600 : 920;
  const height = mobile ? 346 : 196;
  const metricMarkup = metrics.map((metric, index) => {
    const x = mobile ? 32 : 32 + index * 302;
    const y = mobile ? 69 + index * 92 : 101;
    const labelX = mobile ? 210 : x;
    const labelY = mobile ? y + 6 : 133;
    const codeX = mobile ? labelX : x;
    const codeY = mobile ? y - 21 : 37;
    const divider = mobile
      ? (index < 2 ? `<path d="M32 ${y + 30}H568" stroke="${palette.border}"/>` : '')
      : (index < 2 ? `<path d="M${x + 274} 25V137" stroke="${palette.border}"/>` : '');
    const numberSize = Math.min(mobile ? 48 : 52, Math.floor((mobile ? 155 : 242) / (String(metric.value).length * 0.64)));
    return `${divider}
  <text x="${codeX}" y="${codeY}" fill="${palette[metric.accent]}" font-size="${mobile ? 16 : 12}" font-weight="600">${escapeXml(metric.code)}</text>
  <text x="${x}" y="${y}" fill="${palette.primary}" font-size="${numberSize}" font-weight="600" style="font-variant-numeric:tabular-nums">${escapeXml(metric.value)}</text>
  <text x="${labelX}" y="${labelY}" fill="${palette.muted}" font-size="${mobile ? 22 : 16}">${escapeXml(metric.label)}</text>`;
  }).join('\n');
  const timestamp = `更新于 ${updatedAt} · 上海时间`;
  const footerY = height - 19;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(username)} 的 GitHub 公开统计</title>
  <desc id="description">${escapeXml(metrics.map(({ value, label }) => `${label} ${value}`).join('；'))}。${escapeXml(timestamp)}</desc>
  <rect width="${width}" height="${height}" fill="${palette.background}"/>
  <path d="M0 0.5H${width}M0 ${height - 0.5}H${width}" stroke="${palette.border}"/>
  <g font-family="Segoe UI, PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif" style="letter-spacing:0">
${metricMarkup}
  <text x="32" y="${footerY}" fill="${palette.muted}" font-size="${mobile ? 16 : 12}">${escapeXml(timestamp)}</text>
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
