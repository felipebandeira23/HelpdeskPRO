FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api apps/api
COPY packages packages
COPY prisma prisma
COPY turbo.json ./

RUN npm ci
RUN npm run build --workspace @helpdeskpro/api

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/api/dist dist
COPY --from=builder /app/apps/api/package.json .
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/prisma prisma

EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
