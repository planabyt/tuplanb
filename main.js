// main.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '/sessions', // Directory for storing sessions
  }),
  puppeteer: {
    headless: true, // Aseguramos que corra sin interfaz gráfica
    // Aumentamos el tiempo de espera interno a 5 minutos (evita el error Runtime.callFunctionOn timed out)
    protocolTimeout: 300000, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      // Estos flags ayudan mucho a la estabilidad en Docker/Dokploy
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
  
  // Listar canales para debug (opcional, puedes comentarlo si ya tienes el ID)
  try {
     console.log("Canales disponibles:");
     // console.log(await client.getChannels()); // Descomenta si necesitas ver IDs de nuevo
  } catch (e) {
     console.log("Error listando canales (no crítico):", e.message);
  }
});

// Manejo básico de errores para evitar crash total
client.on("disconnected", (reason) => {
    console.log("Cliente desconectado:", reason);
    // Opcional: client.initialize(); // Si quieres que intente reconectar solo
});

client.initialize();

module.exports = client;
