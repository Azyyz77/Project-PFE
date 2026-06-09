// services/ollamaCache.js
// ═══════════════════════════════════════════════════════════
//  Cache Service pour Ollama Embeddings
//  Utilise Redis pour mettre en cache les embeddings
// ═══════════════════════════════════════════════════════════

const crypto = require('crypto');
const redisClient = require('../config/redis');

class OllamaCache {
  constructor() {
    this.enabled = process.env.REDIS_HOST && process.env.OLLAMA_CACHE_ENABLED !== 'false';
    this.ttl = Number(process.env.OLLAMA_CACHE_TTL || 86400); // 24h par défaut
    this.prefix = 'ollama:embed:';
    
    if (this.enabled) {
      console.log('[Ollama Cache] ✅ Cache activé (TTL:', this.ttl, 'secondes)');
    } else {
      console.log('[Ollama Cache] ⚠️  Cache désactivé (REDIS_HOST manquant ou OLLAMA_CACHE_ENABLED=false)');
    }
  }

  /**
   * Vérifie si Redis est disponible
   */
  async isAvailable() {
    if (!this.enabled) return false;
    try {
      // Pour ioredis, on teste avec une commande PING
      await redisClient.ping();
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Génère une clé de cache unique basée sur le texte
   */
  generateKey(text) {
    const hash = crypto
      .createHash('sha256')
      .update(text.trim().toLowerCase())
      .digest('hex');
    return `${this.prefix}${hash}`;
  }

  /**
   * Récupère un embedding depuis le cache
   */
  async get(text) {
    if (!this.enabled) return null;

    try {
      const key = this.generateKey(text);
      const cached = await redisClient.get(key);
      
      if (cached) {
        console.log('[Ollama Cache] ✅ HIT -', text.substring(0, 50));
        return JSON.parse(cached);
      }
      
      console.log('[Ollama Cache] ❌ MISS -', text.substring(0, 50));
      return null;
    } catch (err) {
      console.error('[Ollama Cache] Erreur get:', err.message);
      return null;
    }
  }

  /**
   * Sauvegarde un embedding dans le cache
   */
  async set(text, embedding) {
    if (!this.enabled) return false;

    try {
      const key = this.generateKey(text);
      await redisClient.setex(key, this.ttl, JSON.stringify(embedding));
      console.log('[Ollama Cache] 💾 Saved -', text.substring(0, 50));
      return true;
    } catch (err) {
      console.error('[Ollama Cache] Erreur set:', err.message);
      return false;
    }
  }

  /**
   * Invalide tout le cache Ollama
   */
  async clear() {
    if (!this.enabled) return 0;

    try {
      const keys = await redisClient.keys(`${this.prefix}*`);
      if (keys.length === 0) return 0;
      
      await redisClient.del(keys);
      console.log(`[Ollama Cache] 🗑️  ${keys.length} embeddings supprimés`);
      return keys.length;
    } catch (err) {
      console.error('[Ollama Cache] Erreur clear:', err.message);
      return 0;
    }
  }

  /**
   * Statistiques du cache
   */
  async stats() {
    if (!this.enabled) {
      return { enabled: false, count: 0 };
    }

    try {
      const keys = await redisClient.keys(`${this.prefix}*`);
      const available = await this.isAvailable();
      return {
        enabled: available,
        count: keys.length,
        ttl: this.ttl,
        prefix: this.prefix,
      };
    } catch (err) {
      console.error('[Ollama Cache] Erreur stats:', err.message);
      return { enabled: false, count: 0, error: err.message };
    }
  }
}

module.exports = new OllamaCache();
