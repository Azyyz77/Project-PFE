FROM node:22

# Répertoire de travail
WORKDIR /app

# Dépendances système pour Puppeteer/Chrome (WhatsApp Web.js)
RUN apt-get update && apt-get install -y \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxext6 \
    fonts-liberation \
    wget \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Node
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port du backend
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
