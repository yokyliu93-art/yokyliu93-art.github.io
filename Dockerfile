FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:24-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./package.json
ENV ISLAND_PREVIEW_HOST=0.0.0.0 ISLAND_PREVIEW_PORT=4174 ISLAND_PREVIEW_DATABASE=/app/data/islands.sqlite
VOLUME ["/app/data"]
EXPOSE 4174
CMD ["node", "server/public-preview.js"]
