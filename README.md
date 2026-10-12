# 通知滤盒 FilterBox 官网与帮助中心

官网：<https://filterbox.catchingnow.com/> · [Google Play](https://play.google.com/store/apps/details?id=com.catchingnow.np) · [直接下载 APK](https://filterbox.catchingnow.com/latest.apk)

本仓库由 GitHub Pages（legacy Jekyll 构建，`master` 分支根目录）直接发布，没有额外的构建步骤：推送即上线（Cloudflare 缓存约 10 分钟）。

## 结构

- 首页：`index.html`（英文，默认语言）、`zh-Hans/`、`zh-Hant/`、`ja/` 下的 `index.html`，共用 `_layouts/home.html`。
- 帮助中心：`help/index.html` 及各语言目录下的 `help/index.html`，共用 `_layouts/help.html`。
- 文档：所有 `.md` 文件（不写 front matter）由 `_layouts/doc.html` 渲染成页面，同时原样发布为 `.md`，供 AI 抓取。旧链接（`/FAQ`、`/帮助`、`/购买说明`、`/高级过滤规则指南`、`/Webhook_功能指南`、`/更新记录`、`/隐私政策` 等）App 内写死跳转，文件名不要改。
- 文案：`_data/i18n/<语言>.yml` 是网站界面、首页与帮助中心的全部文案；`_data/demo/<语言>.yml` 是首页动画演示的数据，App 名、人物和消息全部虚构，不要放真实品牌或个人信息。
- 文档注册表：`_data/docs.yml` 记录每篇文档在各语言下的文件，用于侧栏、语言切换、hreflang、sitemap 和 `llms.txt`。
- 样式与脚本：`assets/css/site.css`（全站）、`assets/css/home.css`（首页与演示）、`assets/js/site.js`（全站）、`assets/js/home.js`（首页动画演示）。无外部字体、无第三方脚本、无统计代码。
- 文档内容：帮助文档只放原有的帮助内容。中文原文保持不变，繁体中文与日文版本严格对照原文翻译，不额外增补；面向 AI 的产品介绍只写在 `llms.txt` 与 `llms-full.txt` 里。
- SEO / AI：`sitemap.xml`、`llms.txt`、`llms-full.txt` 由 Liquid 根据注册表自动生成；`robots.txt` 允许所有抓取；各页面带 canonical、hreflang、Open Graph 与 JSON-LD 结构化数据。

## 日常维护

- **发布新版本**：照旧替换 `latest.apk`，在 `changelog.md` 和 `更新记录.md` 顶部追加版本说明（版本号单独一行，下面接列表，页面会自动渲染成时间线）。
- **改文案**：直接编辑 `_data/i18n/<语言>.yml`，四种语言保持一致。
- **新增文档**：新建 `.md` 文件（第一行写 `# 标题`，不要写 front matter），在 `_data/docs.yml` 登记各语言路径，并在每个 `_data/i18n/<语言>.yml` 的 `docs` 下添加标题和简介。未登记的中文文件名文档也会以简体中文渲染。
- **分享图**：首页主标题等文案改动后，可用 `tools/share-images.mjs` 重新生成 `assets/img/share-<语言>.png`（需要 Playwright，并按 GitHub Pages 规则在本地 8765 端口提供构建结果）。

## 本地预览

GitHub Pages 当前使用 `github-pages` gem 232（Jekyll 3.10，需 Ruby 3.x）：

```sh
bundle exec github-pages build --source . --destination /tmp/filterbox-site
```

预览时注意 GitHub Pages 会把 `/FAQ` 解析为 `/FAQ.html`，普通静态服务器不会。

联系：[napp+doc@catchingnow.com](mailto:napp+doc@catchingnow.com)
