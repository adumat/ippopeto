# Pinna il digest con Renovate se vuoi build riproducibili
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY public ./public
# utente "node" (uid 1000) già presente nell'immagine
USER 1000:1000
EXPOSE 8080
CMD ["node", "server/index.js"]
