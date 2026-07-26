FROM node:18-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

ENV PORT 3000

# Start Next.js
CMD ["npm", "start"]
