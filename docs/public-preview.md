# Public test deployment

Current temporary URL: https://2c29c72dd694d5.lhr.life/

Runs the built app, not the Vite development server. server/public-preview.js serves only the dist assets and API; local Codex is forcibly disabled. Preview records use data/public-preview.sqlite, separate from the developer's islands.sqlite. Visitors connect their own coding tools. The SSH localhost.run tunnel and the server must remain running, and the computer must remain online. The random URL is temporary and is not a permanent custom domain.

Start server: `node server/public-preview.js` (port 4174, loopback by default).
Build before restarting: `npm run build`.

For a permanent deployment, Dockerfile packages the Node 24 API and static frontend together. Mount persistent storage at /app/data, place HTTPS in front of port 4174, and point the chosen domain to that server. Docker build has not been tested here. Do not deploy the SQLite file to ephemeral serverless storage. No existing development accounts, preferences, or model credentials are included in the container build.

Validated: built onboarding and save locally; public HTTPS 200 and interactive onboarding; private paths return 404; local Codex API returns unavailable / 503.

The anonymous tunnel rotated its hostname during testing; even an active SSH session does not guarantee a stable address. Use permanent hosting before broad sharing.
