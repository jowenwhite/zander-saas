FROM node:20-alpine

WORKDIR /app

# Copy package files from the api directory
COPY apps/api/package*.json ./

# Install dependencies
RUN npm install

# Install specific Prisma CLI version and stripe
RUN npm install prisma@5.22.0 stripe

# Copy prisma schema from packages/database (but not seed.ts)
COPY packages/database/prisma/schema.prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy API source code and tsconfig
COPY apps/api/ .

# Compile TypeScript to JavaScript
RUN npx tsc

# Expose port
EXPOSE 3001

# Start with compiled JavaScript
CMD ["node", "dist/main.js"]
