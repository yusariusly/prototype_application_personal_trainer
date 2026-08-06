import { state, saveState } from './Store.js';

export function getClients() {
  return state.clients;
}

export function getActiveClient() {
  return state.clients.find(c => c.id === state.activeClientId) || state.clients[0];
}

export function setActiveClient(id) {
  state.activeClientId = id;
  saveState();
}

export function saveClient(client) {
  const idx = state.clients.findIndex(c => c.id === client.id);
  if (idx > -1) {
    state.clients[idx] = client;
  } else {
    state.clients.push(client);
  }
  saveState();
}
