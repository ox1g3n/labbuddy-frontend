# Build Stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend files
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /usr/src/frontend

# Install serve to run the application
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /usr/src/frontend/dist ./dist

# Expose the frontend port
EXPOSE 5173

# Command to start the frontend in production
CMD ["serve", "-s", "dist", "-l", "5173"]

# Development Stage - Default
FROM node:18-alpine AS development

# Set working directory
WORKDIR /usr/src/frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose the frontend port
EXPOSE 5173

# Command to start the frontend in development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Default to development stage
FROM development
