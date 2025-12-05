FROM node:20-slim

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

# Run Vite dev server in Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]