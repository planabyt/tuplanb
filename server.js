// server.js
const express = require("express");
const client = require("./main");
const {MessageMedia} = require("whatsapp-web.js");

require("dotenv").config();

const app = express();

// Límite 50mb para fotos grandes
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

// Endpoint para enviar MENSAJES (Texto)
app.post("/send-message", validateToken, async (req, res) => {
  const { message, channel } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message requerido" });
  }

  try {
    const channelId = channel;
    const sentMsg = await client.sendMessage(channelId, message);
    res.json({ status: "ok", id: sentMsg.id.id, message: sentMsg.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para enviar IMÁGENES (CORREGIDO Y LIMPIO)
app.post("/send-media", validateToken, async (req, res) => {

  try {
    const { channel, media, caption } = req.body;
    
    if (!channel || !media) {
      return res.status(400).json({ error: "Faltan parámetros: channel o media" });
    }
    
    console.log("Procesando imagen para:", channel);

    // 1. LIMPIEZA DEL BASE64
    // Separamos la cabecera "data:image/..." si existe
    let base64Data = media;
    if (media.includes(',')) {
        base64Data = media.split(',')[1];
    }
    
    // ¡ESTA ES LA CLAVE! Quitamos espacios y saltos de línea que rompen WhatsApp
    base64Data = base64Data.replace(/\s/g, '');

    // 2. Creamos la imagen en memoria directamente
    // Forzamos mimetype image/jpeg que es el que mejor traga WhatsApp
    const mediaObject = new MessageMedia('image/jpeg', base64Data, 'noticia.jpg');
    
    // 3. Enviamos
    await client.sendMessage(channel, mediaObject, { 
        caption: caption || "" 
    });

    console.log("Imagen enviada con éxito");
    res.json({ status: "ok", message: "Media enviada con éxito" });

  } catch (error) {
    console.error("Error enviando imagen:", error);
    // Devolvemos el error exacto para verlo en N8N
    res.status(500).json({ error: "Error interno: " + error.message });
  }

});

module.exports = app;
