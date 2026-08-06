import { state, saveState } from './Store.js';

export function getMessages(clientId) {
  return state.messages.filter(m => m.clientId === clientId);
}

export function addMessage(clientId, sender, text) {
  const newMsg = {
    id: `msg-${Date.now()}`,
    clientId,
    sender,
    text,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  };
  state.messages.push(newMsg);
  saveState();
  return newMsg;
}
