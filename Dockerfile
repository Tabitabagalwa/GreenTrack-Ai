# Use Node.js 22 as the base image
FROM node:22-slim AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Final stage: Run the application
FROM node:22-slim

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Cloud Run sets the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "dist/app/server/server.mjs"]
