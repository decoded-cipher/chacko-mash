FROM node:20-alpine

RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    build-base \
    python3 \
    pkgconfig \
    curl \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY server.js ./
COPY src/ ./src/
COPY assets/ ./assets/

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
