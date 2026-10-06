# 主页维护

这是 GitHub Profile 仓库 `YspCoder/YspCoder`。根目录的 `README.md` 会出现在个人主页上。

## 修改内容

项目链接、导航与无障碍描述在 `README.md` 中；封面、项目面板和技术方向的图文内容在 `scripts/render-cyber-profile.mjs` 中。GitHub Profile 支持 Markdown 与部分 HTML，但不运行网页脚本，也不支持自定义页面 CSS。

当前主页采用赛博朋克开发者界面：黑底、霓虹紫、电光蓝，配合常规字体、细网格与连接图。桌面封面为 1200 × 380，移动端为 600 × 430；明暗主题均保持黑底。

`scripts/render-cyber-profile.mjs` 生成封面、四个可点击项目面板和技术方向。项目名、用途、技术及状态放在同一面板中，README 保留完整替代文字和文档链接。项目面板桌面为 1200 × 172，移动端为 600 × 218；技术方向桌面为 1200 × 114，移动端为 600 × 192。

直接打开 `design/banner.html` 可以预览封面，它跟随窗口宽度切换桌面或移动端版本。

```sh
# 生成封面与项目 SVG，无第三方依赖
node scripts/render-cyber-profile.mjs

# 同时导出 README 使用的 PNG；传入本机 sharp 模块入口的 file URL
node scripts/render-cyber-profile.mjs file:///absolute/path/to/sharp/dist/index.cjs
```

PNG 导出使用 `sharp` 0.35.x；其模块入口以安装版本的 `package.json` 为准。修改封面后需要重新导出桌面和移动端两张 PNG。封面字体使用 Bahnschrift、Arial 和 Microsoft YaHei，导出机器需提供相应字体或兼容字体。

历史方案的素材与生成脚本仍保留在仓库中，当前 README 不引用这些资源。

README 的 `<picture>` 根据屏幕宽度选择封面、项目面板和技术方向，并根据主题选择统计图片。导航、文档链接和章节标题使用 GitHub 原生排版。

## 更新统计

`scripts/update-profile.mjs` 从 GitHub 公开 API 读取资料，生成明暗主题、桌面和移动端的赛博风格统计 `assets/stats-*.svg`。桌面为 920 × 226，移动端为 600 × 376。不需要安装第三方包，不读取私有仓库。支持 `GH_TOKEN` 或 `GITHUB_TOKEN`；工作流已注入 GitHub 自动提供的令牌，以减少未认证 API 限流。

```sh
node scripts/update-profile.mjs
```

`Update public profile statistics` 工作流每周运行，也可以在仓库的 Actions 页面手动执行。公开仓库数包含 Fork；Stars 只统计非 Fork 的公开项目，并排除个人主页仓库。加入年份来自 GitHub 账号创建时间。

如果 API 请求失败，脚本会报错，原有图片会保留。定时更新的执行时间由 GitHub 排队决定。仓库长期没有活动时，GitHub 可能暂停定时工作流，可在 Actions 页面重新启用。

## 文件

- `README.md`：主页内容。
- `assets/avatar.png`：GitHub 头像快照。
- `assets/cyber-cover*.svg` / `assets/cyber-cover*.png`：桌面与移动端封面。
- `assets/cyber-project-*.svg`：桌面与移动端项目面板。
- `assets/cyber-stack*.svg`：技术方向。
- `assets/stats-*.svg`：定期生成的公开数据。
- `design/banner.html`：封面预览。
- `scripts/render-cyber-profile.mjs`：当前视觉素材的生成源稿。
- `scripts/update-profile.mjs`：统计更新脚本。
- `.github/workflows/update-profile.yml`：每周更新工作流。

精选项目的内容依据仓库公开文档整理。项目仍在开发时保留对应状态标记；学习或整理的上游项目不要写成个人原创作品。
