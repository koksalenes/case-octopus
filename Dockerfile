# ──────────────────────────────────────────
# Base
# ──────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

# ──────────────────────────────────────────
# Development
# ──────────────────────────────────────────
FROM base AS development

RUN npm install

COPY . .

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ──────────────────────────────────────────
# Production
# ──────────────────────────────────────────
FROM base AS production

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
