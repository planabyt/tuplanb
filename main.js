// main.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '/sessions', // Directory for storing sessions
  }),
  puppeteer: {
    headless: true,
    // ESTA ES LA LÍNEA QUE ARREGLA EL ERROR:
    protocolTimeout: 300000, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
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
  
  // Listar canales para debug
  try {
     console.log("Canales disponibles:");
     console.log(await client.getChannels()); 
  } catch (e) {
     console.log("Error listando canales:", e.message);
  }
});

client.on("disconnected", (reason) => {
    console.log("Cliente desconectado:", reason);
});

client.initialize();

module.exports = client;
