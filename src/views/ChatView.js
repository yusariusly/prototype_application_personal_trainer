import { addMessage, getMessages } from '../models/MessageModel.js';

export function renderChatView(container, client) {
  const messages = getMessages(client.id);

  container.innerHTML = `
    <div>
      <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]">Coach Chat</h1>
      <p class="text-xs text-slate-500 mt-1">Consult your workout or daily nutrition questions directly with your trainer.</p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 flex flex-col h-[500px] overflow-hidden shadow-sm">
      <header class="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img class="w-10 h-10 rounded-full object-cover border border-slate-200" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80" alt="Bobby">
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h4 class="font-headline font-bold text-xs text-slate-800">Coach Bobby</h4>
            <span class="text-[10px] text-green-500 font-medium">Online</span>
          </div>
        </div>
      </header>

      <div id="chat-messages-container" class="flex-grow overflow-y-auto p-4 space-y-4">
        ${messages.map(m => {
          const isMe = m.sender === 'client';
          return `
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[75%] flex flex-col gap-1">
                <div class="p-3.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}">
                  ${m.text}
                </div>
                <span class="text-[9px] text-slate-400 self-${isMe ? 'end' : 'start'}">${m.time}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <form id="chat-input-form" class="p-4 border-t border-slate-100 flex gap-2 shrink-0 bg-slate-50/50">
        <input type="text" id="chat-input-text" placeholder="Type your message to Coach..." required class="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary">
        <button type="submit" class="bg-primary hover:bg-[#8f3200] text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>
    </div>
  `;

  const chatContainer = document.getElementById('chat-messages-container');
  chatContainer.scrollTop = chatContainer.scrollHeight;

  document.getElementById('chat-input-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const textEl = document.getElementById('chat-input-text');
    const text = textEl.value.trim();
    if (!text) return;

    addMessage(client.id, 'client', text);
    textEl.value = '';
    
    // Call the global re-render, assuming it's available or passed somehow
    if (window.renderView) {
      window.renderView();
    }

    setTimeout(() => {
      addMessage(client.id, 'trainer', 'Got it! I will check your squat form again tonight to maximize performance.');
      if (window.activeTab === 'chat' && window.renderView) {
        window.renderView();
      }
    }, 1500);
  });
}
