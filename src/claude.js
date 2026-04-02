require('dotenv').config();
const SYSTEM_PROMPT = require('./systemPrompt');
const { getHistory, addMessage, clearHistory } = require('./sessions');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const RESET_KEYWORDS = ['reiniciar', 'restart', 'recomeçar', 'reset'];

async function getReply(phone, userMessage) {
  if (RESET_KEYWORDS.includes(userMessage.trim().toLowerCase())) {
    clearHistory(phone);
    return 'Conversa reiniciada! 😊 Olá! Eu sou a Leli, da *Leli Scents*. Que vibe você quer viver hoje?';
  }

  addMessage(phone, 'user', userMessage);

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      system: SYSTEM_PROMPT,
      messages: getHistory(phone),
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const reply = data.content[0].text;
  addMessage(phone, 'assistant', reply);
  return reply;
}

module.exports = { getReply };
