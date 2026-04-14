// Service SMS - À configurer avec votre fournisseur SMS (Twilio, Nexmo, etc.)

async function sendSMS(phoneNumber, message) {
  try {
    // TODO: Intégrer avec votre fournisseur SMS
    // Exemple avec Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */
    
    console.log(`[SMS] Simulation d'envoi à ${phoneNumber}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error('[SMS] Erreur:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSMS,
};
