FROM node:18-alpine

RUN apk add --no-cache libc6-compat git && apk update
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .