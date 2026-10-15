# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# DocHomoeo — Express API (TypeScript, run via tsx)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates curl tini \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=4000 TZ=Asia/Kolkata

# devDependencies are kept ON PURPOSE. package.json's start script is
# `tsx src/server.ts` and tsx is a devDependency — `npm ci --omit=dev` would
# produce an image that cannot start. This app ships no compile step.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
# prisma.config.ts resolves env("DATABASE_URL") eagerly when the config
# loads, so every prisma CLI call needs it present. `generate` only reads
# the schema and never connects, so a placeholder is enough. Scoped to this
# one RUN so it is NOT baked into the image — the real value arrives from
# .env.api at runtime.
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public" npx prisma generate

# multer writes here and express.static serves it (uploads.routes.ts:14 resolves
# process.cwd()/uploads). Bind-mounted in compose so a rebuild never wipes it.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
USER node
EXPOSE 4000
# This app's health route is /api/health (app.ts:57) — not /health like the
# other sites on this box.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -fsS http://127.0.0.1:4000/api/health >/dev/null || exit 1
ENTRYPOINT ["/usr/bin/tini","--","/usr/local/bin/docker-entrypoint.sh"]
