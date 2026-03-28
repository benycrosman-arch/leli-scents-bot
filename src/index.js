require('dotenv').config();
const express = require('express');
const { MessagingResponse } = require('twilio').twiml;
const { getReply } = require('./claude');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Leli Scents Bot' });
});

app.post('/webhook', async (req, res) => {
  const userMessage = req.body.Body || '';
  const from = req.body.From || 'unknown';

  const twiml = new MessagingResponse();

  try {
    const reply = await getReply(from, userMessage);
    twiml.message(reply);
  } catch (err) {
    console.error('Error getting reply:', err);
    twiml.message('Ops, tive um problema aqui. Pode tentar de novo? 😅');
  }

  res.type('text/xml').send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leli Scents Bot running on port ${PORT}`);
});
