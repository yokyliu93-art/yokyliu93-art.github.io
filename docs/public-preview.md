# Public test deployment

Current temporary URL (2026-09-08): https://involves-bracelets-august-xbox.trycloudflare.com/

Runs the built app, not the Vite development server. server/public-preview.js serves only the dist assets and API; local Codex is forcibly disabled. Preview records use data/public-preview.sqlite, separate from the developer's islands.sqlite. Visitors connect their own coding tools. The Cloudflare quick tunnel and the server must remain running, and the computer must remain online. The random URL is temporary and is not a permanent custom domain.

Start server: `node server/public-preview.js` (port 4174, loopback by default).
Build before restarting: `npm run build`.

For a permanent deployment, Dockerfile packages the Node 24 API and static frontend together. Mount persistent storage at /app/data, place HTTPS in front of port 4174, and point the chosen domain to that server. Docker build has not been tested here. Do not deploy the SQLite file to ephemeral serverless storage. No existing development accounts, preferences, or model credentials are included in the container build.

Validated: built onboarding and save locally; public HTTPS 200 and interactive onboarding; private paths return 404; local Codex API returns unavailable / 503.

The anonymous tunnel rotated its hostname during testing; even an active SSH session does not guarantee a stable address. Use permanent hosting before broad sharing.

## Permanent subdomain deployment (prepared 2026-09-07)

`compose.yaml` runs the app with a persistent database volume and a Caddy HTTPS reverse proxy. Set `ISLAND_DOMAIN` in a server-side `.env` to the confirmed subdomain, point its DNS A/AAAA records at the server, and run `docker compose up -d --build`. Ports 80 and 443 must reach the server. Back up the `island-data` volume; never use `docker compose down -v` unless intentionally erasing accounts. This deployment configuration has not yet been run on a cloud server.

Public static routes now include `/models/` and `/brand/`; the image includes `src/reflection-prompts.js`, required by the backend. Public deployment intentionally keeps the developer's Codex session disabled. Model-written reflections require a production model adapter; without one, the UI explicitly provides choice summaries. Visitors may connect their own external coding agent through scoped credentials. GitHub Pages alone cannot run the database/API.

Current preview: port 4188, isolated database data/public-preview.sqlite. Verified over public HTTPS: homepage 200, cat GLB 200, logo SVG 200, unauthenticated /api/me 401. Full public browser interaction not verified (browser tool timed out).
