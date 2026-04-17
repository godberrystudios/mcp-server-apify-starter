FROM apify/actor-node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev --audit=false

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM apify/actor-node:20

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev --audit=false

COPY .actor/ ./.actor/

CMD ["node", "dist/main.js"]
