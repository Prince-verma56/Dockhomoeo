#!/bin/sh
set -e
echo "[entrypoint] applying migrations…"
npx prisma migrate deploy
echo "[entrypoint] starting DocHomoeo API on :${PORT}…"
exec npx tsx src/server.ts
