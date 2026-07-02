FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# --host est requis pour exposer le serveur Vite en dehors du conteneur
CMD ["npm", "run", "dev", "--", "--host"]