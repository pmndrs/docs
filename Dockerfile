FROM node:20-alpine

RUN apk add --no-cache libc6-compat git && apk update
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY . .