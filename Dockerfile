FROM node:24-alpine

RUN apk add --no-cache libc6-compat git && apk update

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .