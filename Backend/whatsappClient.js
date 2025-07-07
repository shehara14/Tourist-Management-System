// whatsappClient.js
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.on('auth_failure', () => {
  console.log('❌ WhatsApp authentication failed');
});

client.initialize();

module.exports = client;