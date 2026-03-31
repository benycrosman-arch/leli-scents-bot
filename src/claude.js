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

  console.log('Calling Anthropic API, key prefix:', process.env.ANTHROPIC_API_KEY?.slice(0, 20));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        system: SYSTEM_PROMPT,
        messages: getHistory(phone),
        max_tokens: 500,
      }),
    });
  } catch (err) {
    console.error('Fetch failed:', err.name, err.message, err.cause);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

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
