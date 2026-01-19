FROM node:24-alpine

RUN apk add --no-cache libc6-compat git && apk update

# Install pnpm globally
RUN npm install -g pnpm@10.28.1

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .