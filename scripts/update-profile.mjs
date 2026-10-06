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
  { value: profile.public_repos, label: '公开仓库', code: 'REPOSITORIES', accent: 'blue' },
  { value: stars, label: '非 Fork 仓库获星', code: 'STARS', accent: 'purple' },
  { value: joinedYear, label: '加入 GitHub', code: 'SINCE', accent: 'blue' },
];

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function createSvg(theme, mobile) {
  const palette = theme === 'dark'
    ? { background: '#080b10', border: '#253045', primary: '#f5f7fc', muted: '#a6afc2', blue: '#36bfff', purple: '#bd80ff' }
    : { background: '#080b10', border: '#2b3348', primary: '#f5f7fc', muted: '#b1b9cb', blue: '#36bfff', purple: '#bd80ff' };
  const width = mobile ? 600 : 920;
  const height = mobile ? 376 : 226;
  const metricMarkup = metrics.map((metric, index) => {
    const x = mobile ? 32 : 32 + index * 302;
    const y = mobile ? 113 + index * 92 : 149;
    const labelX = mobile ? 234 : x;
    const labelY = mobile ? y - 2 : 177;
    const codeX = mobile ? labelX : x;
    const codeY = mobile ? y - 29 : 84;
    const divider = mobile
      ? (index < 2 ? `<path d="M32 ${y + 21}H568" stroke="${palette.border}"/>` : '')
      : (index < 2 ? `<path d="M${x + 272} 72V177" stroke="${palette.border}"/>` : '');
    const numberSize = Math.min(mobile ? 54 : 64, Math.floor((mobile ? 174 : 242) / (String(metric.value).length * 0.64)));
    return `${divider}
  <path d="M${codeX} ${codeY - 6}h5" stroke="${palette[metric.accent]}" stroke-width="3"/>
  <text x="${codeX + 13}" y="${codeY}" fill="${palette[metric.accent]}" font-size="${mobile ? 16 : 12}" font-weight="600">${escapeXml(metric.code)}</text>
  <text x="${x}" y="${y}" fill="${palette.primary}" font-size="${numberSize}" font-weight="700" style="font-variant-numeric:tabular-nums">${escapeXml(metric.value)}</text>
  <text x="${labelX}" y="${labelY}" fill="${palette.muted}" font-size="${mobile ? 22 : 16}">${escapeXml(metric.label)}</text>`;
  }).join('\n');
  const timestamp = `更新于 ${updatedAt} · 上海时间`;
  const footerY = height - 18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(username)} 的 GitHub 公开统计</title>
  <desc id="description">${escapeXml(metrics.map(({ value, label }) => `${label} ${value}`).join('；'))}。${escapeXml(timestamp)}</desc>
  <rect width="${width}" height="${height}" fill="${palette.background}"/>
  <path d="M32 51H${width - 32}M32 ${height - 42}H${width - 32}" stroke="${palette.border}"/>
  <path d="M32 51h58" stroke="${palette.purple}" stroke-width="2"/>
  <path d="M${width - 65} 51h33" stroke="${palette.blue}" stroke-width="2"/>
  <g font-family="Segoe UI, PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif" style="letter-spacing:0">
  <text x="32" y="33" fill="${palette.primary}" font-size="${mobile ? 19 : 15}" font-weight="600">PUBLIC METRICS</text>
  <text x="${width - 32}" y="33" fill="${palette.blue}" font-size="${mobile ? 16 : 12}" text-anchor="end">github / ${escapeXml(username)}</text>
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
