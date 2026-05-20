const express = require("express");
const multer  = require("multer");
const axios   = require("axios");

const router  = express.Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_URL     = process.env.ROBOFLOW_URL;

// ─────────────────────────────────────────────────────────────────────────────
// POST /detect/upload
// Body : multipart/form-data — champ "image" (fichier)
// Retourne : { predictions, image, summary }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image fournie" });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await axios({
      method:  "POST",
      url:     ROBOFLOW_URL,
      params:  { api_key: ROBOFLOW_API_KEY },
      data:    base64Image,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const predictions = response.data.predictions ?? [];

    // Résumé formaté pour le frontend
    const summary = predictions.map((p) => ({
      class:      p.class,
      confidence: Math.round(p.confidence * 100),
      x:          Math.round(p.x),
      y:          Math.round(p.y),
      width:      Math.round(p.width),
      height:     Math.round(p.height),
    }));

    res.json({
      success:     true,
      total:       predictions.length,
      predictions: response.data.predictions, // données brutes pour les bounding boxes
      summary,                                 // données formatées pour le tableau
      image:       response.data.image,
    });

  } catch (error) {
    console.error("❌ Erreur Roboflow:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /detect/url
// Body JSON : { "imageUrl": "https://..." }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/url", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "URL manquante" });
    }

    const response = await axios({
      method: "POST",
      url:    ROBOFLOW_URL,
      params: { api_key: ROBOFLOW_API_KEY, image: imageUrl },
    });

    const predictions = response.data.predictions ?? [];

    res.json({
      success:     true,
      total:       predictions.length,
      predictions: response.data.predictions,
      image:       response.data.image,
    });

  } catch (error) {
    console.error("❌ Erreur Roboflow:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;