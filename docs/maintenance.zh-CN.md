# 主页维护

这是 GitHub Profile 仓库 `YspCoder/YspCoder`。根目录的 `README.md` 会出现在个人主页上。

## 修改内容

个人介绍、技术方向、项目链接和项目说明都在 `README.md` 中。GitHub Profile 支持 Markdown 与部分 HTML，但不运行网页脚本，也不支持自定义页面 CSS。

封面是原创像素湖景与编程小屋。`scripts/render-pixel-art.mjs` 是插画、技术徽章与页尾的源稿；`scripts/pixel-font.mjs` 提供不依赖字体文件的 5 × 7 像素字形。桌面 PNG 为 1200 × 460，移动端为 720 × 568。明暗版本分别表现白天与夜晚。

直接打开 `design/banner.html` 可以预览插画，它跟随系统主题与窗口宽度切换版本。

```sh
# 生成 SVG 源文件，无第三方依赖
node scripts/render-pixel-art.mjs

# 同时导出 README 使用的 PNG；传入本机 sharp 模块入口的 file URL
node scripts/render-pixel-art.mjs file:///absolute/path/to/sharp/dist/index.cjs
```

PNG 导出使用 `sharp` 0.35.x；其模块入口以安装版本的 `package.json` 为准。修改横幅文字或插画后需要重新导出四张 PNG。

README 的 `<picture>` 会根据访问者的主题与屏幕宽度选择封面、统计图片。文字介绍和项目列表使用 GitHub 原生排版。

## 更新统计

`scripts/update-profile.mjs` 从 GitHub 公开 API 读取资料，生成明暗主题、桌面和移动端的像素统计 `assets/stats-*.svg`。不需要安装第三方包，不读取私有仓库。支持 `GH_TOKEN` 或 `GITHUB_TOKEN`；工作流已注入 GitHub 自动提供的令牌，以减少未认证 API 限流。

```sh
node scripts/update-profile.mjs
```

`Update public profile statistics` 工作流每周运行，也可以在仓库的 Actions 页面手动执行。公开仓库数包含 Fork；Stars 只统计非 Fork 的公开项目，并排除个人主页仓库。加入年份来自 GitHub 账号创建时间。

如果 API 请求失败，脚本会报错，原有图片会保留。定时更新的执行时间由 GitHub 排队决定。仓库长期没有活动时，GitHub 可能暂停定时工作流，可在 Actions 页面重新启用。

## 文件

- `README.md`：主页内容。
- `assets/avatar.png`：原有 GitHub 头像快照。
- `assets/banner-*.svg` / `assets/banner-*.png`：明暗主题与移动端像素封面。
- `assets/badge-*.svg` / `assets/label-*.svg`：像素技术徽章与章节标签。
- `assets/pixel-footer*.svg`：桌面与移动端像素页尾。
- `assets/stats-*.svg`：定期生成的公开数据。
- `design/banner.html`：封面预览。
- `scripts/render-pixel-art.mjs`：像素插画与徽章的生成源稿。
- `scripts/pixel-font.mjs`：自绘像素字体。
- `scripts/update-profile.mjs`：统计更新脚本。
- `.github/workflows/update-profile.yml`：每周更新工作流。

精选项目的内容依据仓库公开文档整理。项目仍在开发时保留对应状态标记；学习或整理的上游项目不要写成个人原创作品。
