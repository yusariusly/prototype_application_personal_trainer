import { getActiveClient } from '../models/ClientModel.js';
import { saveState } from '../models/Store.js';

export function setupUserHeader() {
  const client = getActiveClient();
  const avatar = client.avatar;
  const name = client.name;
  
  const userAvatarEl = document.getElementById('user-avatar');
  const userAvatarElMobile = document.getElementById('user-avatar-mobile');
  const userNameEl = document.getElementById('user-name');
  
  if (userAvatarEl) userAvatarEl.src = avatar;
  if (userAvatarElMobile) userAvatarElMobile.src = avatar;
  if (userNameEl) userNameEl.textContent = name;
  const isMs = localStorage.getItem('lang') === 'ms';
  const langEl = document.getElementById('lang-indicator');
  if (langEl) langEl.textContent = isMs ? 'MY' : 'EN';
  
  // Basic Nav Translations
  const navKeys = ['home', 'workout', 'nutrition', 'progress', 'booking', 'chat'];
  const textEn = ['Today', 'Workouts', 'Nutrition', 'Progress', 'Schedule', 'Messages'];
  const textId = ['Beranda', 'Latihan', 'Nutrisi', 'Progres', 'Jadwal', 'Obrolan'];
  
  navKeys.forEach((key, index) => {
    const el = document.getElementById(`nav-${key}`);
    if (el) el.textContent = isMs ? textId[index] : textEn[index];
    
    const mobEl = document.getElementById(`mobile-nav-${key}`);
    if (mobEl && mobEl.children[1]) mobEl.children[1].textContent = isMs ? textId[index] : textEn[index];
  });
}

export function updateNavIndicators(activeTab) {
  const tabs = ['home', 'workout', 'nutrition', 'progress', 'booking', 'chat'];
  tabs.forEach(t => {
    const el = document.getElementById(`nav-${t}`);
    const mobEl = document.getElementById(`mobile-nav-${t}`);
    
    if (el) {
      if (t === activeTab) {
        el.className = "h-full px-4 text-sm font-headline font-semibold text-primary border-b-2 border-primary transition-all";
      } else {
        el.className = "h-full px-4 text-sm font-headline font-semibold text-secondary hover:text-primary transition-all";
      }
    }
    
    if (mobEl) {
      if (t === activeTab) {
        mobEl.className = "flex flex-col items-center justify-center text-primary p-2";
      } else {
        mobEl.className = "flex flex-col items-center justify-center text-secondary p-2";
      }
    }
  });
}

export function setupAppGlobalHandlers(renderView) {
  window.handleLogout = function() {
    localStorage.removeItem('elite_pt_role');
    localStorage.removeItem('elite_pt_client_id');
    window.location.href = './index.html';
  };

  window.closeModal = function() {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = '';
    }
  };

  window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const bgColors = {
      success: 'bg-slate-900 border-l-4 border-primary text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-slate-800 text-white'
    };

    const icons = {
      success: 'check_circle',
      error: 'warning',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl flex items-center gap-3 shadow-2xl pointer-events-auto transition-all transform translate-y-2 opacity-0 duration-300 ${bgColors[type] || bgColors.success}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px] shrink-0">${icons[type] || 'check_circle'}</span>
      <span class="text-xs font-semibold leading-relaxed">${message}</span>
    `;

    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  };

  window.toggleProfileDropdown = function() {
    const drop = document.getElementById('profile-dropdown');
    if (drop) {
      drop.classList.toggle('hidden');
    }
  };

  window.toggleLanguage = function(e) {
    if (e) e.stopPropagation();
    const isEn = localStorage.getItem('lang') !== 'ms';
    const nextLang = isEn ? 'ms' : 'en';
    localStorage.setItem('lang', nextLang);
    if (window.changeLanguage) window.changeLanguage(nextLang);
    setupUserHeader();
    if(window.renderView) window.renderView();
  };

  document.addEventListener('click', (e) => {
    const drop = document.getElementById('profile-dropdown');
    if (drop && !drop.classList.contains('hidden')) {
      const btn = drop.previousElementSibling;
      if (!drop.contains(e.target) && !btn.contains(e.target)) {
        drop.classList.add('hidden');
      }
    }
  });

  window.adjustHabit = function(habitKey, amount) {
    const client = getActiveClient();
    if (!client.habits) {
      client.habits = {
        water: { current: 0, target: 3.0 },
        sleep: { current: 0, target: 8.0 },
        steps: { current: 0, target: 10000 },
        completedToday: []
      };
    }
  
    if (!client.habits[habitKey]) {
      client.habits[habitKey] = { current: 0, target: 5.0 };
    }
  
    client.habits[habitKey].current = parseFloat((client.habits[habitKey].current + amount).toFixed(2));
    
    saveState();
    renderView();
    window.showToast(`Successfully added ${habitKey === 'water' ? 'water (+0.25L)' : habitKey === 'sleep' ? 'sleep (+0.5 hrs)' : 'steps (+1,000 steps)'}!`, 'success');
  };
}
