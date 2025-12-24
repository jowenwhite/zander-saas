FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema from packages/database
COPY ../../packages/database/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start with ts-node (for now - can optimize later with build step)
CMD ["npx", "ts-node", "src/main.ts"]
