# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only dependency files first
COPY package*.json ./

# Clean reproducible install
RUN npm ci

# Copy rest of project
COPY . .

# Build the app
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM node:22-alpine

WORKDIR /app

# Install lightweight static server
RUN npm install -g serve

# Copy built files only (not source code)
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]