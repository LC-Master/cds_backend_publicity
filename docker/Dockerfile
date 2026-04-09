FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-slim AS runner
RUN useradd -m -s /bin/bash cds
WORKDIR /app
COPY --from=builder --chown=cds:cds /app/dist ./dist
COPY --from=builder --chown=cds:cds /app/package.json .
RUN chown cds:cds /app && chmod 775 /app
USER cds
EXPOSE 3000
ENTRYPOINT [ "bun" ]
CMD [ "run", "dist/server.ts" ]