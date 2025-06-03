# Use official Node.js image with Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install global dependencies
RUN npm install -g typescript nodemon concurrently

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config for production build
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript for production
RUN npm run build

# Expose the port used by the app
EXPOSE 4000

# Default to production mode
ENV NODE_ENV=production

# Start command will be overridden by docker-compose in development
CMD ["node", "dist/index.js"]
