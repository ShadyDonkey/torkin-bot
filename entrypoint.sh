#!/bin/sh

bun run server/jobs.ts && bun run server/main.ts && bun run client/.output/server/index.mjs