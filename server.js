// server.js
const express = require("express");
const client = require("./main");
const {MessageMedia} = require("whatsapp-web.js")

require("dotenv").config();

const app = express();

// Aumentamos el límite de tamaño para aceptar fotos grandes (IMPORTANTE)
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

// Endpoint para enviar MENSAJES DE TEXTO
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

// Endpoint para enviar IMÁGENES (CORREGIDO PARA BASE64)
app.post("/send-media", validateToken, async (req, res) => {

  try {
    // Recibimos 'media' (el base64) en lugar de 'mediaUrl'
    const { channel, media, caption } = req.body;
    
    if (!channel || !media) {
      return res.status(400).json({ error: "Faltan parámetros: channel o media" });
    }
    
    // Limpiamos el base64 si trae la cabecera "data:image/..."
    const partes = media.split(',');
    const base64Data = partes.length > 1 ? partes[1] : partes[0];
    
    // Creamos la imagen directamente desde el código (sin descargar nada)
    const mediaObject = new MessageMedia('image/jpeg', base64Data, 'imagen.jpg');
    
    // Enviamos
    await client.sendMessage(channel, mediaObject, { caption: caption || "" });

    res.json({ status: "ok", message: "Media enviada con éxito" });

  } catch (error) {
    console.error("Error enviando imagen:", error);
    res.status(500).json({ error: "Error enviando imagen: " + error.message });
  }

});

module.exports = app;
