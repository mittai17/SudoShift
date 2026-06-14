FROM node:22-alpine

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build Vite frontend and esbuild server
RUN npm run build

# Prune development dependencies to keep the image slim
RUN npm prune --production

# Expose default port (Railway will override this with PORT env var)
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
