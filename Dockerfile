FROM node:18-alpine

RUN apk add --no-cache libc6-compat git && apk update
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .