// server.js
const express = require("express");
const client = require("./main");
const {MessageMedia} = require("whatsapp-web.js");
const fs = require('fs'); // Necesario para la estrategia temporal
const path = require('path');

require("dotenv").config();

// AQUÍ SE CREA LA APP (Esta es la línea que te falta o está mal puesta)
const app = express();

// Aumentamos el límite de tamaño para aceptar fotos grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Middleware de validación
function validateToken(req, res, next) {
  const token = req.headers["x-api-key"];
  if (token && token === process.env.N8N_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Endpoint para enviar a tu canal (MENSAJES)
app.post("/send-message", validateToken, async (req, res) => {
  const { message, channel } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message requerido" });
  }

  try {
    const channelId = channel;
    const sentMsg = await client.sendMessage(channelId, message);

    res.json({
      status: "ok",
      id: sentMsg.id.id,
      message: sentMsg.body,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para enviar a tu canal (IMÁGENES - ESTRATEGIA TEMPORAL)
app.post("/send-media", validateToken, async (req, res) => {

  try {
    // Recibimos 'media' (el base64) y 'channel'
    const { channel, media, caption } = req.body;
    
    if (!channel || !media) {
      return res.status(400).json({ error: "Faltan parámetros: channel o media" });
    }
    
    // Limpiamos el base64 si trae cabecera data:image...
    const partes = media.split(',');
    const base64Data = partes.length > 1 ? partes[1] : partes[0];
    
    // --- ESTRATEGIA ARCHIVO TEMPORAL ---
    const fileName = `temp_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, fileName);

    // Guardamos la imagen en el disco del servidor
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Le decimos a WhatsApp: "Toma este archivo del disco"
    const mediaObject = MessageMedia.fromFilePath(filePath);
    
    // Enviamos
    await client.sendMessage(channel, mediaObject, { caption: caption || "" });

    // Borramos el archivo temporal
    fs.unlinkSync(filePath);
    // -----------------------------------

    res.json({ status: "ok", message: "Media enviada con éxito" });

  } catch (error) {
    console.error("Error enviando imagen:", error);
    // Intentamos borrar el fichero si falló
    try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {} 
    
    res.status(500).json({ error: "Error enviando imagen: " + error.message });
  }

});

module.exports = app;
