# 主页维护

这是 GitHub Profile 仓库 `YspCoder/YspCoder`。根目录的 `README.md` 会出现在个人主页上。

## 修改内容

个人介绍、技术方向、项目链接和项目说明都在 `README.md` 中。GitHub Profile 支持 Markdown 与部分 HTML，但不运行网页脚本，也不支持自定义页面 CSS。

封面使用现有 GitHub 头像，保留 HTML 排版源稿 `design/banner.html`。桌面原稿为 1200 × 360，移动端为 480 × 380；在浏览器中添加或移除 body 的 `dark` 类可切换明暗版本。仓库中的四张 PNG 为两倍像素导出。

README 的 `<picture>` 会根据访问者的主题与屏幕宽度选择封面、统计图片。文字介绍和项目列表使用 GitHub 原生排版。

## 更新统计

`scripts/update-profile.mjs` 从 GitHub 公开 API 读取资料，生成 `assets/stats-*.svg`。不需要安装第三方包，不读取私有仓库。

```sh
node scripts/update-profile.mjs
```

`Update public profile statistics` 工作流每周运行，也可以在仓库的 Actions 页面手动执行。公开仓库数包含 Fork；Stars 只统计非 Fork 的公开项目，并排除个人主页仓库。加入年份来自 GitHub 账号创建时间。

如果 API 请求失败，脚本会报错，原有图片会保留。定时更新的执行时间由 GitHub 排队决定。仓库长期没有活动时，GitHub 可能暂停定时工作流，可在 Actions 页面重新启用。

## 文件

- `README.md`：主页内容。
- `assets/avatar.png`：制作封面时使用的 GitHub 头像快照。
- `assets/banner-*.png`：明暗主题与移动端封面。
- `assets/stats-*.svg`：定期生成的公开数据。
- `design/banner.html`：封面排版源稿。
- `scripts/update-profile.mjs`：统计更新脚本。
- `.github/workflows/update-profile.yml`：每周更新工作流。

精选项目的内容依据仓库公开文档整理。项目仍在开发时保留对应状态标记；学习或整理的上游项目不要写成个人原创作品。
