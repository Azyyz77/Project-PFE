// routes/cacheRoutes.js
const express = require('express');
const router = express.Router();
const ollamaCache = require('../services/ollamaCache');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

/**
 * @route   GET /api/cache/stats
 * @desc    Statistiques du cache Ollama
 * @access  Admin uniquement
 */
router.get('/stats', authMiddleware, authorizeRoles('admin', 'direction'), async (req, res) => {
  try {
    const stats = await ollamaCache.stats();
    res.json(stats);
  } catch (error) {
    console.error('[Cache API] Erreur stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
  }
});

/**
 * @route   DELETE /api/cache/clear
 * @desc    Vider le cache Ollama
 * @access  Admin uniquement
 */
router.delete('/clear', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedCount = await ollamaCache.clear();
    res.json({
      message: 'Cache vidé avec succès',
      deletedCount,
    });
  } catch (error) {
    console.error('[Cache API] Erreur clear:', error);
    res.status(500).json({ error: 'Erreur lors du vidage du cache' });
  }
});

module.exports = router;
