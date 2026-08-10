import { getClients } from '../../src/models/ClientModel.js';
import { getMessages } from '../../src/models/MessageModel.js';
import { addMessage } from '../../src/models/MessageModel.js';

export function renderMessagesView(container, activeChatClientId) {
  const clients = getClients();
  if (clients.length === 0) return;

  const client = clients.find(c => c.id === activeChatClientId) || clients[0];
  const messages = getMessages(client.id);

  container.innerHTML = `
    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white flex h-[600px] overflow-hidden shadow-sm">
      
      <!-- Left sidebar: Client chats -->
      <aside class="w-72 border-r border-white flex flex-col shrink-0 bg-white/40">
        <div class="p-5 border-b border-white bg-slate-50/20">
          <span data-i18n="client_inbox" class="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Client Inbox</span>
        </div>
        <div class="flex-grow overflow-y-auto flex flex-col space-y-1 p-3">
          ${clients.map(c => `
            <div onclick="window.switchActiveChat('${c.id}')" class="p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white transition-all duration-300 ${c.id === client.id ? 'bg-white shadow-sm border border-white' : 'border border-transparent hover:border-white/50'}">
              <div class="relative">
                ${c.id === client.id ? '<div class="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>' : ''}
                <img class="relative w-12 h-12 rounded-full object-cover shrink-0 border-2 ${c.id === client.id ? 'border-primary shadow-sm' : 'border-transparent'}" src="${c.avatar}" alt="Avatar">
              </div>
              <div class="flex-grow min-w-0">
                <span class="text-sm font-bold text-slate-800 truncate block">${c.name}</span>
                <span class="text-xs text-slate-400 truncate block font-medium">${c.email}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </aside>

      <!-- Right Panel: Active Chat -->
      <section class="flex-grow flex flex-col h-full bg-white/60 relative">
        <div class="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <header class="p-5 border-b border-white bg-white/40 shrink-0 flex items-center justify-between relative z-10">
          <div class="flex items-center gap-4">
            <img class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" src="${client.avatar}" alt="Avatar">
            <div>
              <h4 class="font-headline font-extrabold text-sm text-slate-800">${client.name}</h4>
              <span data-i18n="personal_client" class="text-xs font-medium text-slate-500">Personal Client</span>
            </div>
          </div>
        </header>

        <!-- Message List -->
        <div id="trainer-messages-container" class="flex-grow overflow-y-auto p-6 space-y-5 relative z-10">
          ${messages.map(m => {
            const isMe = m.sender === 'trainer';
            return `
              <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[70%] flex flex-col gap-1.5">
                  <div class="p-4 text-sm font-medium leading-relaxed shadow-sm ${isMe ? 'bg-slate-800 text-white rounded-3xl rounded-tr-sm' : 'bg-white text-slate-800 rounded-3xl rounded-tl-sm border border-slate-100'}">
                    ${m.text}
                  </div>
                  <span class="text-[10px] font-bold text-slate-400 self-${isMe ? 'end' : 'start'} px-1">${m.time}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Footer Form -->
        <form class="p-5 border-t border-white flex gap-3 shrink-0 bg-white/40 relative z-10" id="trainer-chat-form">
          <input class="flex-grow bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all" id="trainer-chat-input" placeholder="Type your instruction or message..." required="" type="text"/>
          <button class="bg-gradient-to-r from-primary to-primary-container text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5" type="submit">
            <span class="material-symbols-outlined text-[24px]" data-i18n="send">send</span>
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
