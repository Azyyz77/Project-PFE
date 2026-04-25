let nodemailer;
let transporter;

try {
  nodemailer = require('nodemailer');
  
  // Configuration du transporteur email
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  console.log('[EmailService] Service email initialisé');
} catch (error) {
  console.warn('[EmailService] Nodemailer non disponible, les emails ne seront pas envoyés:', error.message);
}

async function sendEmail(to, subject, text, html) {
  if (!transporter) {
    console.warn('[Email] Service email non configuré, email non envoyé à:', to);
    return { success: false, error: 'Service email non configuré' };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@sta-chery.tn',
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Envoyé à ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Erreur:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail,
};
