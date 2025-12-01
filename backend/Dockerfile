# Multi-stage build for backend
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Final stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
USER nodejs
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["npm", "start"]