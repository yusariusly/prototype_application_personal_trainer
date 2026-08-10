import { getActiveClient } from '../models/ClientModel.js';
import { renderHomeView } from '../views/HomeView.js';
import { renderWorkoutView, setupWorkoutGlobalHandlers } from '../views/WorkoutView.js';
import { renderNutritionView, setupNutritionGlobalHandlers } from '../views/NutritionView.js';
import { renderProgressView, setupProgressGlobalHandlers } from '../views/ProgressView.js';
import { renderBookingView, setupBookingGlobalHandlers } from '../views/BookingView.js';
import { renderChatView } from '../views/ChatView.js';
import { setupUserHeader, updateNavIndicators, setupAppGlobalHandlers } from '../views/ClientAppView.js';
import { t, changeLanguage, translateDOM } from '../i18n.js';

window.activeTab = 'home';

// Check Authentication
if (localStorage.getItem('elite_pt_role') !== 'client') {
  window.location.href = './index.html';
}

function renderView() {
  const container = document.getElementById('view-container');
  if (!container) return;
  
  const client = getActiveClient();
  
  if (window.activeTab === 'home') {
    renderHomeView(container, client);
  } else if (window.activeTab === 'workout') {
    renderWorkoutView(container, client);
  } else if (window.activeTab === 'nutrition') {
    renderNutritionView(container, client);
  } else if (window.activeTab === 'progress') {
    renderProgressView(container, client);
  } else if (window.activeTab === 'booking') {
    renderBookingView(container, client);
  } else if (window.activeTab === 'chat') {
    renderChatView(container, client);
  }
}

window.renderView = renderView;

window.navigateTo = function(tab) {
  window.activeTab = tab;
  window.location.hash = `#\${tab}`;
  updateNavIndicators(window.activeTab);
  renderView();
};

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  
  // Setup Global handlers
  setupAppGlobalHandlers(renderView);
  setupWorkoutGlobalHandlers(renderView, window.showToast, window.closeModal);
  setupNutritionGlobalHandlers(renderView, window.showToast, window.closeModal);
  setupProgressGlobalHandlers(renderView, window.showToast, window.closeModal);
  setupBookingGlobalHandlers(renderView, window.showToast, window.closeModal);
  
  // expose translation helpers globally
  window.t = t;
  window.changeLanguage = changeLanguage;

  // Initialize Routing
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    window.navigateTo(hash);
  };
  window.addEventListener('hashchange', handleHash);
  handleHash();

  // Inject simple language selector into navbar
  const nav = document.getElementById('navbar');
  if (nav) {
    const sel = document.createElement('select');
    sel.className = 'ml-4 rounded px-2 py-1 text-sm';
    sel.innerHTML = `<option value=\"en\">EN</option><option value=\"id\">ID</option>`;
    sel.value = localStorage.getItem('lang') || 'en';
    sel.addEventListener('change', (e) => { changeLanguage(e.target.value); renderView(); });
    const container = document.createElement('div');
    container.className = 'hidden md:flex items-center';
    container.appendChild(sel);
    nav.querySelector('.max-w-7xl')?.appendChild(container);
  }

  // translate any static DOM after initial render
  translateDOM();
});
