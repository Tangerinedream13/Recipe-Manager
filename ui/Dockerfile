FROM node:20-slim

WORKDIR /app

# Copy ONLY package.json (no lockfile!)
COPY package.json ./

# Clean install of deps inside the container
RUN npm install

# Copy rest of UI code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]