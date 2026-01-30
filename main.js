// main.js - VERSIÓN LEGACY ESTABLE
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './sessions_clean', 
  }),
  puppeteer: {
    headless: true,
    executablePath: '/usr/bin/chromium', // <--- Ruta correcta para Debian Bullseye
    ignoreHTTPSErrors: true, // <--- Importante para evitar cuelgues de red
    protocolTimeout: 300000, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
  },
});

client.on("qr", (qr) => {
  console.log("Escanea este QR con tu WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ WhatsApp client listo");
  try {
     console.log(await client.getChannels()); 
  } catch (e) {
     console.log("Error canales:", e.message);
  }
});

client.on("disconnected", (reason) => {
    console.log("Cliente desconectado:", reason);
});

client.initialize();

module.exports = client;

// Reinicio automático
setInterval(() => {
  process.exit(0);
}, 24 * 60 * 60 * 1000);
