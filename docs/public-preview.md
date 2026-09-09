# Public test deployment

Current temporary URL (2026-09-08): https://involves-bracelets-august-xbox.trycloudflare.com/

Runs the built app, not the Vite development server. server/public-preview.js serves only the dist assets and API; local Codex is forcibly disabled. Preview records use data/public-preview.sqlite, separate from the developer's islands.sqlite. Visitors connect their own coding tools. The Cloudflare quick tunnel and the server must remain running, and the computer must remain online. The random URL is temporary and is not a permanent custom domain.

Start server: `node server/public-preview.js` (port 4174, loopback by default).
Build before restarting: `npm run build`.

For a permanent deployment, Dockerfile packages the Node 24 API and static frontend together. Mount persistent storage at /app/data, place HTTPS in front of port 4174, and point the chosen domain to that server. Docker build has not been tested here. Do not deploy the SQLite file to ephemeral serverless storage. No existing development accounts, preferences, or model credentials are included in the container build.

Validated: built onboarding and save locally; public HTTPS 200 and interactive onboarding; private paths return 404; local Codex API returns unavailable / 503.

The anonymous tunnel rotated its hostname during testing; even an active SSH session does not guarantee a stable address. Use permanent hosting before broad sharing.

## Permanent subdomain deployment (prepared 2026-09-07)

`compose.yaml` supports two启动模式:

- `secure`（HTTPS 正式）：`compose.yaml` 的 `https` 服务通过 Caddy 反代到 4174，提供 80/443。请先确认能拉取 `caddy:2` 镜像。设置 `.env` 的 `ISLAND_DOMAIN` 后执行：

```bash
ISLAND_DOMAIN=vinky.live docker compose --profile secure up -d --build
```

- `direct`（临时演示）：只暴露 Node 服务端口，适合先让朋友试用；`island` 服务会直接绑定 `${ISLAND_PUBLISH_PORT}`（默认 4174）。

```bash
ISLAND_PUBLISH_PORT=80 docker compose up -d --build
```

两种模式都使用同一份持久化数据库卷 `island-data`。当域名 DNS 已配置并且 HTTPS 已生效后，再切到 `secure`；`https` 服务默认会用 `caddy:2` 提供 `80/443`，所以 `direct` 模式下请先避免再暴露 `https` 服务。

## vinky.live 直连清单（当前可复用）

当前版本可以直接接 `vinky.live`，只要完成 3 步：

1. 服务器外网开放 `80/443`（或至少临时测试的 `4174`）端口；
2. 在域名解析里新增/确认：
   - `A vinky.live -> <服务器公网 IP>`
   - `AAAA vinky.live -> <服务器公网 IPv6，可选>`
   - 或使用 `CNAME` 指向已托管入口（需该入口的 DNS 已可解析）；
3. 在服务器上运行：

```bash
cd /Users/ninghan/cola/coding/our-island
ISLAND_PUBLISH_PORT=80 docker compose up -d --build
```

如果你只先要临时验证，当前临时服务已在本机监听 `http://<本机IP>:4174`，可以先把该端口映射到公网；待域名指向确认后再切到 `compose` + HTTPS。

Public static routes now include `/models/` and `/brand/`; the image includes `src/reflection-prompts.js`, required by the backend. Public deployment intentionally keeps the developer's Codex session disabled. Model-written reflections require a production model adapter; without one, the UI explicitly provides choice summaries. Visitors may connect their own external coding agent through scoped credentials. GitHub Pages alone cannot run the database/API.

Current preview: port 4188, isolated database data/public-preview.sqlite. Verified over public HTTPS: homepage 200, cat GLB 200, logo SVG 200, unauthenticated /api/me 401. Full public browser interaction not verified (browser tool timed out).
