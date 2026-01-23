// server.js
const express = require("express");
const client = require("./main");
const {MessageMedia} = require("whatsapp-web.js")

require("dotenv").config();

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

// Endpoint para enviar a tu canal
app.post("/send-message", validateToken, async (req, res) => {
  const { message, channel } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message requerido" });
  }

  try {
    // Usamos el channelId fijo desde env
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

app.post("/send-media", validateToken, async (req, res) => {

  try{
    const { channel, mediaUrl, caption } = req.body;
    
    if (!channel || !mediaUrl) {
      return res.status(400).json({ error: "Faltan parámetros: number o imageUrl" });
    }
    
    const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
    
    await client.sendMessage(channel, media, { caption });

    res.json({ status: "ok", message: "Media enviada con éxito" });
  } catch (error){
    console.error("Error enviando imagen:", error);
    res.status(500).json({ error: "Error enviando imagen" });
  }

});

module.exports = app;
