const MAX_HISTORY = 20;

// Map<phoneNumber, Array<{role, content}>>
const sessions = new Map();

function getHistory(phone) {
  return sessions.get(phone) || [];
}

function addMessage(phone, role, content) {
  const history = sessions.get(phone) || [];
  history.push({ role, content });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
  sessions.set(phone, history);
}

function clearHistory(phone) {
  sessions.delete(phone);
}

module.exports = { getHistory, addMessage, clearHistory };
