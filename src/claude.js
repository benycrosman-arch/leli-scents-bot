require('dotenv').config();
const SYSTEM_PROMPT = require('./systemPrompt');
const { getHistory, addMessage, clearHistory } = require('./sessions');

const RESET_KEYWORDS = ['reiniciar', 'restart', 'recomeçar', 'reset'];

async function getReply(phone, userMessage) {
  if (RESET_KEYWORDS.includes(userMessage.trim().toLowerCase())) {
    clearHistory(phone);
    return 'Conversa reiniciada! 😊 Olá! Eu sou a assistente da *Leli Scents*. Que vibe você quer viver hoje?';
  }

  addMessage(phone, 'user', userMessage);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      system: SYSTEM_PROMPT,
      messages: getHistory(phone),
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  console.log('Anthropic response status:', response.status, JSON.stringify(data).slice(0, 200));

  if (!response.ok) {
    throw new Error(`Anthropic error: ${response.status} ${JSON.stringify(data)}`);
  }

  const reply = data.content[0].text;
  addMessage(phone, 'assistant', reply);
  return reply;
}

module.exports = { getReply };
