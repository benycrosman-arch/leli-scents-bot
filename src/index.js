require('dotenv').config();

const REQUIRED_ENV = ['ANTHROPIC_API_KEY', 'ZAPI_INSTANCE_ID', 'ZAPI_TOKEN', 'ZAPI_CLIENT_TOKEN'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.warn(`Warning: missing env var: ${key}`);
  }
}

const express = require('express');
const { getReply } = require('./claude');

const app = express();
app.use(express.json());

const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

async function sendWhatsApp(phone, message) {
  const response = await fetch(ZAPI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': process.env.ZAPI_CLIENT_TOKEN,
    },
    body: JSON.stringify({ phone, message }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Z-API error: ${response.status} ${body}`);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Leli Scents Bot' });
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const { phone, text, isGroupMsg, fromMe } = req.body;
  if (isGroupMsg || fromMe || !text?.message || !phone) return;

  try {
    const reply = await getReply(phone, text.message);
    await sendWhatsApp(phone, reply);
    console.log(`Replied to ${phone}`);
  } catch (err) {
    console.error(`Error for ${phone}: [${err.constructor.name}] ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leli Scents Bot running on port ${PORT}`);
});
