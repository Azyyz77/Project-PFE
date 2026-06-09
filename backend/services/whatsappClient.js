const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

let clientInstance = null;
let isReady = false;

/**
 * Convertit un numéro au format WhatsApp
 * Exemple:
 * +21624770580 -> 21624770580@c.us
 */
const formatWhatsAppChatId = (telephone) => {
  const normalized = String(telephone || '').replace(/[^\d]/g, '');

  if (!normalized) {
    throw new Error('Numéro de téléphone manquant pour WhatsApp');
  }

  return `${normalized}@c.us`;
};

/**
 * Initialisation du client WhatsApp
 */
const initializeWhatsAppClient = () => {
  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = new Client({
    authStrategy: new LocalAuth({
      clientId: 'sta-chery-otp',
      dataPath: path.join(__dirname, '..', '.wwebjs_auth'),
    }),

    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
      ],
    },

    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',

    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
  });

  /**
   * QR CODE
   */
  clientInstance.on('qr', (qr) => {
    isReady = false;

    console.log('\n⚠️ WhatsApp QR code requis');
    console.log('Scannez ce QR code dans WhatsApp:\n');

    qrcode.generate(qr, { small: true });

    console.log('\nEn attente du scan...\n');
  });

  /**
   * AUTHENTIFICATION
   */
  clientInstance.on('authenticated', () => {
    console.log('✅ WhatsApp authentifié');
  });

  /**
   * READY
   */
  clientInstance.on('ready', () => {
    isReady = true;

    console.log('✅ WhatsApp client prêt');
    console.log('📨 Prêt à envoyer des messages');
  });

  /**
   * AUTH FAILURE
   */
  clientInstance.on('auth_failure', (message) => {
    isReady = false;

    console.error('❌ Echec authentification WhatsApp:', message);
  });

  /**
   * DECONNEXION
   */
  clientInstance.on('disconnected', async (reason) => {
    isReady = false;

    console.warn('⚠️ WhatsApp déconnecté:', reason);

    console.log('🔄 Tentative de reconnexion...');

    try {
      setTimeout(async () => {
        try {
          await clientInstance.initialize();
        } catch (err) {
          console.error('❌ Erreur reconnexion:', err.message);
        }
      }, 5000);
    } catch (err) {
      console.error('❌ Reconnexion impossible:', err.message);
    }
  });

  /**
   * MESSAGES ENTRANTS
   */
  clientInstance.on('message', async (msg) => {
    // debug optionnel
    // console.log(`Message reçu: ${msg.body}`);
  });

  /**
   * INITIALISATION
   */
  clientInstance.initialize().catch((error) => {
    isReady = false;

    console.error(
      '❌ Erreur initialisation WhatsApp:',
      error.message
    );
  });

  return clientInstance;
};

/**
 * Envoi message WhatsApp
 */
const sendWhatsAppMessage = async (telephone, message) => {
  if (!clientInstance) {
    throw new Error('WhatsApp client non initialisé');
  }

  if (!isReady) {
    throw new Error(
      'WhatsApp client non prêt. Scannez le QR code.'
    );
  }

  const chatId = formatWhatsAppChatId(telephone);

  let lastError = null;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      /**
       * délai avant retry
       */
      if (attempt > 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1000)
        );
      }

      /**
       * vérifier readiness
       */
      if (!isReady) {
        throw new Error('WhatsApp client non prêt');
      }

      /**
       * vérifier contact
       */
      const contact = await clientInstance.getContactById(chatId);

      if (!contact) {
        throw new Error(`Contact ${chatId} non trouvé`);
      }

      /**
       * envoyer message
       */
      const response = await clientInstance.sendMessage(
        chatId,
        message
      );

      console.log(
        `✅ Message envoyé à ${telephone} (tentative ${attempt})`
      );

      return response;

    } catch (error) {
      lastError = error;

      console.error(
        `❌ Tentative ${attempt} échouée:`,
        error.message
      );

      /**
       * dernière tentative
       */
      if (attempt === maxRetries) {
        throw new Error(
          `Impossible d'envoyer le message après ${maxRetries} tentatives: ${error.message}`
        );
      }

      /**
       * erreurs Puppeteer récupérables
       */
      if (
        error.message &&
        (
          error.message.includes('detached Frame') ||
          error.message.includes('Execution context was destroyed') ||
          error.message.includes('Protocol error') ||
          error.message.includes('Session closed')
        )
      ) {
        console.log(
          '⚠️ Session WhatsApp instable, attente avant retry...'
        );

        isReady = false;

        /**
         * attendre reconnexion
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 3000)
        );

        /**
         * NE PAS remettre isReady = true ici
         * seul client.on("ready") doit le faire
         */
      }
    }
  }

  throw (
    lastError ||
    new Error('Erreur inconnue lors de l’envoi')
  );
};

/**
 * Version non bloquante
 */
const trySendWhatsAppMessage = async (
  telephone,
  message
) => {
  if (!clientInstance || !isReady) {
    console.warn(
      '⚠️ WhatsApp non prêt — message non envoyé'
    );

    return false;
  }

  try {
    await sendWhatsAppMessage(
      telephone,
      message
    );

    return true;

  } catch (err) {
    console.warn(
      '⚠️ Envoi WhatsApp échoué:',
      err.message
    );

    return false;
  }
};

/**
 * Status WhatsApp
 */
const getWhatsAppStatus = () => ({
  initialized: Boolean(clientInstance),
  ready: isReady,
});

/**
 * Debug status toutes les 10 sec
 */
setInterval(() => {
  console.log('📡 WhatsApp status:', {
    initialized: Boolean(clientInstance),
    ready: isReady,
  });
}, 10000);

module.exports = {
  initializeWhatsAppClient,
  sendWhatsAppMessage,
  trySendWhatsAppMessage,
  getWhatsAppStatus,
};