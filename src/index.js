require('dotenv').config();
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
  const body = await response.text();
  console.log('Z-API response:', response.status, body);
  if (!response.ok) {
    throw new Error(`Z-API error: ${response.status} ${body}`);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Leli Scents Bot' });
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  console.log('Webhook received:', JSON.stringify(req.body));

  const { phone, text, isGroupMsg, fromMe } = req.body;

  if (isGroupMsg) { console.log('Filtered: isGroupMsg'); return; }
  if (fromMe) { console.log('Filtered: fromMe'); return; }
  if (!text?.message) { console.log('Filtered: no text.message, body type:', req.body.type); return; }
  if (!phone) { console.log('Filtered: no phone'); return; }

  console.log('Processing message from', phone, ':', text.message);

  let reply;
  try {
    reply = await getReply(phone, text.message);
    console.log('Claude reply:', reply);
  } catch (err) {
    console.error('Claude error:', err.message);
    return;
  }

  try {
    await sendWhatsApp(phone, reply);
    console.log('Message sent successfully to', phone);
  } catch (err) {
    console.error('Z-API send error:', err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leli Scents Bot running on port ${PORT}`);
});
