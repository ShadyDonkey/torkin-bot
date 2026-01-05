# Based off of the official docs https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Setup dev dependencies for building
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY client/package.json /temp/dev/client/package.json
COPY server/package.json /temp/dev/server/package.json
RUN cd /temp/dev && bun install --frozen-lockfile
# Setup production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY client/package.json /temp/prod/client/package.json
COPY server/package.json /temp/prod/server/package.json
RUN cd /temp/prod && bun install --frozen-lockfile --production 

# Build
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/client/node_modules client/node_modules
COPY . .
ENV NODE_ENV=production
RUN cd client && bun run build
# RUN bun --filter=server build --minify-whitespace --minify-syntax --target bun --outdir ./dist/server server/main.ts
RUN cp -r ./client/build/client ./public

# Copy prod deps and rest of the files
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/prod/server/node_modules server/node_modules
COPY --from=prerelease /usr/src/app/public ./public
COPY --from=prerelease /usr/src/app/server ./server
RUN cd server && bun zen generate --no-version-check
RUN cd server && bun run bot:build
RUN cd server && bun zen migrate deploy --no-version-check
# COPY --from=prerelease /usr/src/app/package.json .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "server/main.ts"]
