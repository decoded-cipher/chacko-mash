# Use a Node.js base image with build tools
FROM node:20-bullseye

# Install system dependencies for node-canvas
RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  build-essential \
  python3 \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .eslintrc.js ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY src/ ./src/
COPY assets/ ./assets/
COPY utilities/ ./utilities/

# Create logs directory
RUN mkdir -p logs

# Build TypeScript
RUN npm run build

# Set NODE_ENV
ENV NODE_ENV production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the app
CMD ["node", "dist/server.js"]
