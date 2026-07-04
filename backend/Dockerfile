# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first to keep them cached between builds
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend code and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Only bring the built app and production dependencies into the final image
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config-files ./config-files

EXPOSE 4000

CMD ["node", "dist/main.js"]
