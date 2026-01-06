#!/bin/sh

bun run server/jobs.ts && bun run server/main.ts && NITRO_PORT=3001 bun run client/server/index.mjs
