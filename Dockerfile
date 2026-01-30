FROM ghcr.io/puppeteer/puppeteer:21.5.2

USER root

WORKDIR /usr/src/app

COPY package*.json ./
# Instalamos dependencias
RUN npm install --ignore-scripts

COPY . .

# Permisos
RUN chown -R pptruser:pptruser /usr/src/app

USER pptruser

EXPOSE 3000

CMD [ "node", "index.js" ]
