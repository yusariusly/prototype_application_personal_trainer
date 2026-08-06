import { renderDashboardView } from '../views/DashboardView.js';
import { renderClientsView } from '../views/ClientsView.js';
import { renderClientDetailView, setupClientDetailGlobalHandlers } from '../views/ClientDetailView.js';
import { renderBuilderView, setupBuilderGlobalHandlers } from '../views/BuilderView.js';
import { renderCalendarView, setupCalendarGlobalHandlers } from '../views/CalendarView.js';
import { renderPackagesView } from '../views/PackagesView.js';
import { renderMessagesView, setupMessagesGlobalHandlers } from '../views/MessagesView.js';
import { updateHeaderSelection, setupAdminAppGlobalHandlers } from '../views/AdminAppView.js';

// Redirect to login if not logged in as trainer
if (localStorage.getItem('elite_pt_role') !== 'trainer') {
  window.location.href = '../login.html';
}

window.activeTab = 'dashboard';
let activeBuilderClientId = '';
let activeClientDetailId = '';
let activeChatClientId = '';

export function getActiveBuilderClientId() { return activeBuilderClientId; }
export function setActiveBuilderClientId(id) { activeBuilderClientId = id; }

window.navigateTo = function(tab) {
  window.activeTab = tab;
  window.location.hash = `#\${tab}`;
  updateHeaderSelection(window.activeTab);
  renderView();
};

window.navigateToBuilderForClient = function(clientId) {
  activeBuilderClientId = clientId;
  window.navigateTo('builder');
};

window.viewClientProfile = function(clientId) {
  activeClientDetailId = clientId;
  window.navigateTo('client-detail');
};

function renderView() {
  const container = document.getElementById('admin-view-container');
  if (!container) return;

  if (window.activeTab === 'dashboard') {
    renderDashboardView(container);
  } else if (window.activeTab === 'clients') {
    renderClientsView(container);
  } else if (window.activeTab === 'client-detail') {
    renderClientDetailView(container, activeClientDetailId);
  } else if (window.activeTab === 'builder') {
    renderBuilderView(container, activeBuilderClientId);
  } else if (window.activeTab === 'calendar') {
    renderCalendarView(container);
  } else if (window.activeTab === 'packages') {
    renderPackagesView(container);
  } else if (window.activeTab === 'messages') {
    renderMessagesView(container, activeChatClientId);
  }
}

window.renderView = renderView;

document.addEventListener('DOMContentLoaded', () => {
  setupAdminAppGlobalHandlers(renderView);
  setupClientDetailGlobalHandlers(renderView, window.showToast);
  setupBuilderGlobalHandlers(renderView, window.showToast, window.closeModal, getActiveBuilderClientId, setActiveBuilderClientId);
  setupCalendarGlobalHandlers(renderView, window.showToast, window.closeModal);
  
  setupMessagesGlobalHandlers(renderView, (id) => { activeChatClientId = id; });

  const handleHash = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    window.navigateTo(hash);
  };
  window.addEventListener('hashchange', handleHash);
  handleHash();
});
