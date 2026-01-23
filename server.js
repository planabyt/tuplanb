// Necesitamos 'fs' para escribir archivos
const fs = require('fs');
const path = require('path');

// ... (resto del código igual) ...

// Endpoint para enviar IMÁGENES (Versión Fichero Temporal)
app.post("/send-media", validateToken, async (req, res) => {
  try {
    const { channel, media, caption } = req.body;
    
    if (!channel || !media) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    // Limpiamos base64
    const partes = media.split(',');
    const base64Data = partes.length > 1 ? partes[1] : partes[0];
    
    // Creamos un nombre de archivo único
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

    res.json({ status: "ok", message: "Media enviada" });

  } catch (error) {
    console.error("Error enviando imagen:", error);
    res.status(500).json({ error: "Error: " + error.message });
  }
});
