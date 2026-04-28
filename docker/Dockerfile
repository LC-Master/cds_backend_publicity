FROM oven/bun:1 AS build-stage
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun prisma generate
RUN bun run build

FROM oven/bun:1-slim AS final-stage

USER root
RUN apt-get update && apt-get upgrade -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash cds

WORKDIR /app

COPY --from=build-stage --chown=cds:cds /app/dist ./dist
COPY --from=build-stage --chown=cds:cds /app/package.json .

RUN chown cds:cds /app && chmod 775 /app

USER cds
EXPOSE 3000
ENTRYPOINT [ "bun" ]
CMD [ "run", "dist/server.ts" ]