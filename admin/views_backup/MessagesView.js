import { getClients } from '../../src/models/ClientModel.js';
import { getMessages } from '../../src/models/MessageModel.js';
import { addMessage } from '../../src/models/MessageModel.js';

export function renderMessagesView(container, activeChatClientId) {
  const clients = getClients();
  if (clients.length === 0) return;

  const client = clients.find(c => c.id === activeChatClientId) || clients[0];
  const messages = getMessages(client.id);

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 flex h-[500px] overflow-hidden shadow-sm">
      
      <!-- Left sidebar: Client chats -->
      <aside class="w-64 border-r border-slate-100 flex flex-col shrink-0">
        <div class="p-4 border-b border-slate-100 bg-slate-50/40">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Inbox</span>
        </div>
        <div class="flex-grow overflow-y-auto flex flex-col divide-y divide-slate-100">
          ${clients.map(c => `
            <div onclick="window.switchActiveChat('${c.id}')" class="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors ${c.id === client.id ? 'bg-primary/5 border-l-4 border-primary' : ''}">
              <img class="w-10 h-10 rounded-full object-cover shrink-0" src="${c.avatar}" alt="Avatar">
              <div class="flex-grow min-w-0">
                <span class="text-xs font-bold text-slate-800 truncate block">${c.name}</span>
                <span class="text-[10px] text-slate-400 truncate block">${c.email}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </aside>

      <!-- Right Panel: Active Chat -->
      <section class="flex-grow flex flex-col h-full bg-white relative">
        <header class="p-4 border-b border-slate-100 bg-slate-50/20 shrink-0 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img class="w-10 h-10 rounded-full object-cover border" src="${client.avatar}" alt="Avatar">
            <div>
              <h4 class="font-headline font-bold text-xs text-slate-800">${client.name}</h4>
              <span class="text-[10px] text-slate-400">Personal Client</span>
            </div>
          </div>
        </header>

        <!-- Message List -->
        <div id="trainer-messages-container" class="flex-grow overflow-y-auto p-4 space-y-4">
          ${messages.map(m => {
            const isMe = m.sender === 'trainer';
            return `
              <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[75%] flex flex-col gap-1">
                  <div class="p-3.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}">
                    ${m.text}
                  </div>
                  <span class="text-[9px] text-slate-400 self-${isMe ? 'end' : 'start'}">${m.time}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer Form -->
        <form id="trainer-chat-form" class="p-4 border-t border-slate-100 flex gap-2 shrink-0">
          <input type="text" id="trainer-chat-input" placeholder="Type your instruction or message..." required class="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-primary">
          <button type="submit" class="bg-primary hover:bg-[#8f3200] text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </section>

    </div>
  `;

  // Scroll to bottom
  const chatContainer = document.getElementById('trainer-messages-container');
  chatContainer.scrollTop = chatContainer.scrollHeight;

  document.getElementById('trainer-chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputEl = document.getElementById('trainer-chat-input');
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(client.id, 'trainer', text);
    inputEl.value = '';
    
    if (window.renderView) {
      window.renderView();
    }
  });
}

export function setupMessagesGlobalHandlers(renderView, setActiveChatClientId) {
  window.switchActiveChat = function(clientId) {
    setActiveChatClientId(clientId);
    renderView();
  };
}
