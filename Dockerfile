FROM node:24-alpine

RUN apk add --no-cache libc6-compat git && apk update
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .