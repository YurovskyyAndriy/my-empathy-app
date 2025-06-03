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
EXPOSE 5173

# Start development server, allowing external connections
CMD ["npm", "run", "dev", "--", "--host"]