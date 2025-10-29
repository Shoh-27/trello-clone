# Socket.io Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose Socket.io port
EXPOSE 3000

# Start server
CMD ["node", "app.js"]