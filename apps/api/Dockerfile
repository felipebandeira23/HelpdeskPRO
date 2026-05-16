FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api apps/api
COPY packages packages
COPY turbo.json ./

RUN npm ci
RUN npm run build --workspace @helpdeskpro/api

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/api/dist dist
COPY --from=builder /app/apps/api/package.json .
COPY --from=builder /app/node_modules node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
