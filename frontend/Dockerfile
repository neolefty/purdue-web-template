FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy and set up entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Use entrypoint to ensure dependencies are installed
ENTRYPOINT ["docker-entrypoint.sh"]

# Start development server
CMD ["npm", "run", "dev"]
