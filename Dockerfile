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

# Copy package.json first and install
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Set NODE_ENV
ENV NODE_ENV production

# Start the app
CMD ["node", "server.js"]
