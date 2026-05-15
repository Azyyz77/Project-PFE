const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

let clientInstance = null;
let isReady = false;

const formatWhatsAppChatId = (telephone) => {
  const normalized = String(telephone || '').replace(/[^\d]/g, '');
  if (!normalized) {
    throw new Error('Numéro de téléphone manquant pour WhatsApp');
  }
  return `${normalized}@c.us`;
};

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
        '--disable-dev-shm-usage', // Reduces memory usage
        '--disable-gpu', // Disable GPU acceleration
      ],
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-web/main/html/index.html',
    },
  });

  clientInstance.on('qr', (qr) => {
    isReady = false;
    console.log('\n⚠️  WhatsApp QR code requis. Scannez ce QR dans WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('En attente de scan du QR code...\n');
  });

  clientInstance.on('authenticated', () => {
    console.log('✅ WhatsApp authentifié.');
  });

  clientInstance.on('auth_failure', (message) => {
    isReady = false;
    console.error('❌ Echec authentification WhatsApp:', message);
  });

  clientInstance.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp client prêt - Prêt à envoyer des messages');
  });

  clientInstance.on('disconnected', (reason) => {
    isReady = false;
    console.warn('⚠️  WhatsApp déconnecté:', reason);
    console.log('Tentative de reconnexion...');
    // Attempt to reinitialize after a delay
    setTimeout(() => {
      if (!isReady && clientInstance) {
        clientInstance.initialize().catch((error) => {
          console.error('Erreur lors de la reconnexion:', error.message);
        });
      }
    }, 5000);
  });

  clientInstance.on('message', (msg) => {
    // Only log messages from known clients or business contacts
    // You can add logic here to filter/process business-related messages
    // For now, we'll just silently ignore incoming messages
    // Uncomment the line below if you need to debug incoming messages:
    // console.log(`Message reçu de ${msg.from}: ${msg.body}`);
  });

  clientInstance.initialize().catch((error) => {
    isReady = false;
    console.error('❌ Erreur initialisation WhatsApp:', error.message);
  });

  return clientInstance;
};

const sendWhatsAppMessage = async (telephone, message) => {
  if (!clientInstance) {
    throw new Error('WhatsApp client non initialisé');
  }

  if (!isReady) {
    throw new Error('WhatsApp client non prêt. Scannez le QR code dans le terminal backend.');
  }

  const chatId = formatWhatsAppChatId(telephone);
  
  let lastError = null;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add a small delay before each attempt
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      // Get the contact first to ensure it exists
      const contact = await clientInstance.getContactById(chatId);
      if (!contact) {
        throw new Error(`Contact ${chatId} non trouvé`);
      }
      
      // Send the message
      const msg = await clientInstance.sendMessage(chatId, message);
      console.log(`Message envoyé avec succès à ${telephone} (tentative ${attempt})`);
      return msg;
    } catch (error) {
      lastError = error;
      console.error(`Tentative ${attempt} échouée:`, error.message);
      
      if (attempt === maxRetries) {
        // If this is the last attempt, throw the error
        throw new Error(`Impossible d'envoyer le message après ${maxRetries} tentatives: ${error.message}`);
      }
      
      // Check if this is a frame error that might be recoverable
      if (error.message && error.message.includes('detached Frame')) {
        console.log('Frame détachée, nouvelle tentative...');
        isReady = false;
        // Wait a bit longer before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        isReady = true;
      }
    }
  }
  
  throw lastError || new Error('Erreur inconnue lors de l\'envoi du message');
};

const getWhatsAppStatus = () => ({
  initialized: Boolean(clientInstance),
  ready: isReady,
});

/**
 * Version non-bloquante de sendWhatsAppMessage.
 * Ne lève jamais d'exception : log un avertissement et retourne false si
 * le client n'est pas prêt ou si l'envoi échoue.
 *
 * @param {string} telephone
 * @param {string} message
 * @returns {Promise<boolean>} true si envoyé, false sinon
 */
const trySendWhatsAppMessage = async (telephone, message) => {
  if (!clientInstance || !isReady) {
    console.warn('⚠️  WhatsApp non prêt — message non envoyé (scannez le QR code pour activer).');
    return false;
  }
  try {
    await sendWhatsAppMessage(telephone, message);
    return true;
  } catch (err) {
    console.warn('⚠️  Envoi WhatsApp échoué (non bloquant):', err.message);
    return false;
  }
};

module.exports = {
  initializeWhatsAppClient,
  sendWhatsAppMessage,
  trySendWhatsAppMessage,
  getWhatsAppStatus,
};
