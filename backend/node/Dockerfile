# Use official Node.js image with Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

# Install TypeScript globally (to ensure tsc is available)
RUN npm install -g typescript

# Build TypeScript
RUN npm run build && ls -la ./dist

# Expose the port used by the app
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
