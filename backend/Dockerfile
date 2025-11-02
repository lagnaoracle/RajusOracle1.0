FROM node:18-alpine

# Install git, bash, and certificates (HTTPS support)
RUN apk add --no-cache git bash openssh ca-certificates

WORKDIR /app

# Copy package.json and .npmrc first
COPY package.json ./

# Install dependencies via HTTPS
RUN npm install

# Copy rest of the source code
COPY . .

# Default command
CMD ["npm", "start"]
