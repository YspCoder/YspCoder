import { mkdir, writeFile } from 'node:fs/promises';

const username = 'YspCoder';
const assetsDirectory = new URL('../assets/', import.meta.url);
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': `${username}-profile`,
};

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
  { value: profile.public_repos, label: '公开仓库', accent: 'mint' },
  { value: stars, label: '非 Fork 仓库获星', accent: 'amber' },
  { value: joinedYear, label: '加入 GitHub', accent: 'mint' },
];

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function createSvg(theme, mobile) {
  const palette = theme === 'dark'
    ? { background: '#141918', border: '#303b37', primary: '#f1f5f3', muted: '#afbcb6', mint: '#6ce4b2', amber: '#eabb66' }
    : { background: '#f6f9f7', border: '#dce5df', primary: '#18231e', muted: '#55675d', mint: '#147549', amber: '#92631b' };
  const width = mobile ? 600 : 920;
  const height = mobile ? 420 : 200;
  const metricMarkup = metrics.map((metric, index) => {
    const x = mobile ? 34 : 40 + index * 294;
    const y = mobile ? 83 + index * 118 : 99;
    const labelX = mobile ? 224 : x;
    const labelY = mobile ? y - 15 : y + 37;
    const divider = mobile
      ? (index < 2 ? `<path d="M34 ${y + 37}H566" stroke="${palette.border}"/>` : '')
      : (index < 2 ? `<path d="M${x + 260} 40V142" stroke="${palette.border}"/>` : '');
    return `${divider}
  <text x="${x}" y="${y}" fill="${palette[metric.accent]}" font-size="${mobile ? 57 : 62}" font-weight="700">${escapeXml(metric.value)}</text>
  <text x="${labelX}" y="${labelY}" fill="${palette.primary}" font-size="${mobile ? 25 : 19}" font-weight="500">${escapeXml(metric.label)}</text>`;
  }).join('\n');
  const timestamp = `更新于 ${updatedAt} · 上海时间`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(username)} 的 GitHub 公开统计</title>
  <desc id="description">${escapeXml(metrics.map(({ value, label }) => `${label} ${value}`).join('；'))}。${escapeXml(timestamp)}</desc>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${palette.background}" stroke="${palette.border}"/>
  <g font-family="Segoe UI, PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif" style="letter-spacing:0">
${metricMarkup}
  <text x="${mobile ? 34 : 40}" y="${mobile ? 392 : 176}" fill="${palette.muted}" font-size="${mobile ? 17 : 13}">${escapeXml(timestamp)}</text>
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
