# frontend/Dockerfile

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose Vite default dev server port
EXPOSE 3000

# Start development server, allowing external connections
CMD ["npm", "start"]