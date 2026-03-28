require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM_PROMPT = require('./systemPrompt');
const { getHistory, addMessage, clearHistory } = require('./sessions');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RESET_KEYWORDS = ['reiniciar', 'restart', 'recomeçar', 'reset'];

async function getReply(phone, userMessage) {
  if (RESET_KEYWORDS.includes(userMessage.trim().toLowerCase())) {
    clearHistory(phone);
    return 'Conversa reiniciada! 😊 Olá! Eu sou a assistente da *Leli Scents*. Que vibe você quer viver hoje?';
  }

  addMessage(phone, 'user', userMessage);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    system: SYSTEM_PROMPT,
    messages: getHistory(phone),
    max_tokens: 500,
  });

  const reply = response.content[0].text;
  addMessage(phone, 'assistant', reply);
  return reply;
}

module.exports = { getReply };
