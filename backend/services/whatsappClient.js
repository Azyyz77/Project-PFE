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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  clientInstance.on('qr', (qr) => {
    isReady = false;
    console.log('\nWhatsApp QR code requis. Scannez ce QR dans WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  clientInstance.on('authenticated', () => {
    console.log('WhatsApp authentifié.');
  });

  clientInstance.on('ready', () => {
    isReady = true;
    console.log('WhatsApp client prêt.');
  });

  clientInstance.on('auth_failure', (message) => {
    isReady = false;
    console.error('Echec authentification WhatsApp:', message);
  });

  clientInstance.on('disconnected', (reason) => {
    isReady = false;
    console.warn('WhatsApp déconnecté:', reason);
  });

  clientInstance.initialize().catch((error) => {
    isReady = false;
    console.error('Erreur initialisation WhatsApp:', error.message);
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
  await clientInstance.sendMessage(chatId, message);
};

const getWhatsAppStatus = () => ({
  initialized: Boolean(clientInstance),
  ready: isReady,
});

module.exports = {
  initializeWhatsAppClient,
  sendWhatsAppMessage,
  getWhatsAppStatus,
};
