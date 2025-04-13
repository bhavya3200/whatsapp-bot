// index.js
require('dotenv').config(); // To load variables from the .env file
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { queryAI } = require('./Conversation.js'); // Importing queryAI from conversation.js

// Initialize the client with local authentication
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'whatsapp-bot' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Show QR code for initial login
client.on('qr', qr => {
    console.log('QR Code received, scan it with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Auth success
client.on('authenticated', () => {
    console.log('✅ Authenticated');
});

// Ready to send messages
client.on('ready', () => {
    console.log('🚀 Bot is ready and live!');
    // Send a test message upon successful login
    sendTestMessage();
});

// Main function to send a message
async function sendMessageToUser(message, fullWhatsAppId) {
    try {
        const numberId = await client.getNumberId(fullWhatsAppId);

        if (!numberId) {
            console.error('❌ The number is not registered on WhatsApp.');
            return;
        }

        await client.sendMessage(numberId._serialized, message);
        console.log('✅ Message sent to', numberId._serialized, ':', message);
    } catch (err) {
        console.error('❌ Error sending message:', err);
    }
}

// Send a test query to check if the AI is working
async function sendTestMessage() {
    const testQuery = 'Write a haiku about AI';
    const response = await queryAI(testQuery);
    const userPhoneNumber = `${process.env.PHONE_NUMBER}@c.us`; // Get the phone number from the .env file
    await sendMessageToUser(`Test Query Response: ${response}`, userPhoneNumber);
}

// Listen to incoming messages and respond
client.on('message', async (msg) => {
    const receivedMessage = msg.body;
    const senderNumber = msg.from;

    console.log(`Received message: ${receivedMessage} from ${senderNumber}`);

    if (receivedMessage) {
        const response = await queryAI(receivedMessage);
        await sendMessageToUser(response, senderNumber);
    }
});

// Start the client
client.initialize();
