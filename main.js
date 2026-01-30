// main.js - VERSIÓN FINAL ESTABLE
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './sessions_clean', // <--- USAMOS CARPETA NUEVA PARA EVITAR ERRORES
  }),
  puppeteer: {
    headless: true,
    protocolTimeout: 300000, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <--- IMPORTANTE PARA EVITAR BLOQUEOS
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

// Reinicio automático cada 24 horas para evitar memory leak
setInterval(() => {
  console.log("🔄 Reiniciando cliente para evitar memory leak...");
  process.exit(0); // Dokploy lo reiniciará automáticamente
}, 24 * 60 * 60 * 1000); // 24 horas
