// server.js
const express = require("express");
const client = require("./main");
const { MessageMedia } = require("whatsapp-web.js");

require("dotenv").config();

const app = express();

// Límite 50mb para fotos grandes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

// Endpoint para enviar IMÁGENES (por URL) - estable
app.post("/send-media", validateToken, async (req, res) => {
  try {
    const { channel, mediaUrl, caption } = req.body;

    if (!channel || !mediaUrl) {
      return res.status(400).json({ error: "Faltan parámetros: channel o mediaUrl" });
    }

    console.log("Procesando imagen para:", channel, "url:", mediaUrl);

    const mediaObject = await MessageMedia.fromUrl(mediaUrl);
    await client.sendMessage(channel, mediaObject, { caption: caption || "" });

    res.json({ status: "ok", message: "Media enviada con éxito" });
  } catch (error) {
    console.error("Error enviando imagen:", error);
    res.status(500).json({ error: "Error interno: " + (error?.message || error) });
  }
});
    }

    console.log("Procesando imagen para:", channel);

    let mediaObject;

    // 1) Preferimos URL (más estable desde n8n)
    if (mediaUrl) {
      mediaObject = await MessageMedia.fromUrl(mediaUrl);
    } else {
      // 2) Base64 (tu método anterior)
      let base64Data = media;

      if (typeof base64Data !== "string") {
        return res.status(400).json({ error: "media debe ser string base64" });
      }

      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      base64Data = base64Data.replace(/\s/g, "");

      mediaObject = new MessageMedia("image/jpeg", base64Data, "noticia.jpg");
    }

    await client.sendMessage(channel, mediaObject, {
      caption: caption || "",
    });

    console.log("Imagen enviada con éxito");
    res.json({ status: "ok", message: "Media enviada con éxito" });
  } catch (error) {
    console.error("Error enviando imagen:", error);
    res.status(500).json({ error: "Error interno: " + (error?.message || error) });
  }
});

module.exports = app;
