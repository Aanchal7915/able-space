FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

# Applies pending migrations, seeds only an empty database, then boots the API.
CMD sh -c "npx prisma migrate deploy && node prisma/seed-if-empty.js && node dist/main"
