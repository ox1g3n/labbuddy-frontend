# Base image
FROM docker.io/library/node:18


# Set working directory
WORKDIR /usr/src/frontend

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose the frontend port
EXPOSE 5173

# Command to start the frontend
CMD ["npm", "run", "dev"]
