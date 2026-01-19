FROM node:24-alpine

RUN apk add --no-cache libc6-compat git && apk update

WORKDIR /app

# Copy package.json first so corepack can read the packageManager field
COPY package.json pnpm-lock.yaml ./

# Enable corepack and prepare pnpm (reads version from package.json)
RUN corepack enable && corepack prepare --activate

RUN pnpm install --frozen-lockfile

COPY . .