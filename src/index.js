require('dotenv').config();

const REQUIRED_ENV = ['ANTHROPIC_API_KEY', 'ZAPI_INSTANCE_ID', 'ZAPI_TOKEN', 'ZAPI_CLIENT_TOKEN', 'BASE_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const express = require('express');
const path = require('path');
const { getReply } = require('./claude');
const { detectImageRequest, getImageFilename } = require('./images');

const app = express();
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`;
const ZAPI_HEADERS = {
  'Content-Type': 'application/json',
  'Client-Token': process.env.ZAPI_CLIENT_TOKEN,
};

async function zapiPost(endpoint, body) {
  const response = await fetch(`${ZAPI_BASE}/${endpoint}`, {
    method: 'POST',
    headers: ZAPI_HEADERS,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Z-API ${endpoint} error: ${response.status} ${err}`);
  }
}

async function sendText(phone, message) {
  await zapiPost('send-text', { phone, message });
}

async function sendImage(phone, product, caption) {
  const filename = getImageFilename(product);
  if (!filename) return false;

  const imageUrl = `${process.env.BASE_URL}/images/${filename}`;
  await zapiPost('send-image', { phone, image: imageUrl, caption });
  return true;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Leli Scents Bot' });
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const { phone, text, isGroupMsg, fromMe } = req.body;
  if (isGroupMsg || fromMe || !text?.message || !phone) return;

  const userMessage = text.message;

  try {
    // Check if the user is asking for a product image
    const imageProduct = detectImageRequest(userMessage);
    if (imageProduct) {
      const sent = await sendImage(phone, imageProduct, `${imageProduct} ✨`);
      if (!sent) {
        await sendText(phone, `Oi! Ainda não tenho a foto do ${imageProduct} por aqui, mas você pode ver no nosso Instagram 📸 @leli.scents 😍`);
      }
    }

    // Always get and send Claude's text reply
    const reply = await getReply(phone, userMessage);
    await sendText(phone, reply);
    console.log(`Replied to ${phone}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leli Scents Bot running on port ${PORT}`);
});
