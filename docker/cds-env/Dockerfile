FROM oven/bun:1.3.12-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun build ./src/init.ts --outfile ./init.ts --target bun

FROM oven/bun:1.3.12-alpine AS final-stage

WORKDIR /app

COPY --from=builder /app/init.ts /app/init.ts

CMD ["bun", "/app/init.ts"]