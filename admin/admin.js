import {
  getClients,
  saveClient,
  getPrograms,
  updateProgram,
  getSchedule,
  addSchedule,
  validateSession,
  getExerciseLibrary,
  addExerciseToLibrary,
  getMessages,
  addMessage,
  saveState
} from '../src/state.js';

// Redirect to login if not logged in as trainer
if (localStorage.getItem('elite_pt_role') !== 'trainer') {
  window.location.href = '../login.html';
}

// Global Variables
let activeTab = 'dashboard';
let currentOnboardingStep = 1;
let onboardingData = {};
let activeBuilderClientId = '';
let activeClientDetailId = '';

document.addEventListener('DOMContentLoaded', () => {
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash);
  };
  window.addEventListener('hashchange', handleHash);
  handleHash();
});

window.navigateTo = function(tab) {
  activeTab = tab;
  window.location.hash = `#${tab}`;
  updateHeaderSelection();
  renderView();
};

window.handleLogout = function() {
  localStorage.removeItem('elite_pt_role');
  window.location.href = '../login.html';
};

function updateHeaderSelection() {
  const tabs = ['dashboard', 'clients', 'calendar', 'builder', 'packages', 'messages'];
  tabs.forEach(t => {
    const el = document.getElementById(`nav-${t}`);
    if (el) {
      const isTabActive = t === activeTab || (t === 'clients' && activeTab === 'client-detail');
      if (isTabActive) {
        el.className = "h-full px-4 text-sm font-headline font-semibold text-primary border-b-2 border-primary transition-all";
      } else {
        el.className = "h-full px-4 text-sm font-headline font-semibold text-secondary hover:text-primary transition-all";
      }
    }
  });
}

function renderView() {
  const container = document.getElementById('admin-view-container');
  if (!container) return;

  if (activeTab === 'dashboard') {
    renderDashboardView(container);
  } else if (activeTab === 'clients') {
    renderClientsView(container);
  } else if (activeTab === 'client-detail') {
    renderClientDetailView(container);
  } else if (activeTab === 'builder') {
    renderBuilderView(container);
  } else if (activeTab === 'calendar') {
    renderCalendarView(container);
  } else if (activeTab === 'packages') {
    renderPackagesView(container);
  } else if (activeTab === 'messages') {
    renderMessagesView(container);
  }
}

// ----------------------------------------------------
// 1. TRAINER DASHBOARD VIEW (matching trainer_dashboard/screen.png)
// ----------------------------------------------------
function renderDashboardView(container) {
  const clients = getClients();
  const activeClientsCount = clients.length;
  
  const todayIso = new Date().toISOString().split('T')[0];
  const allSchedules = getSchedule();
  const sessionsToday = allSchedules.filter(s => s.date === todayIso);
  const sessionsTodayCount = sessionsToday.length;
  
  // Pending Assessments: clients with no postural focus set or cleared = false
  const pendingAssessmentsCount = clients.filter(c => !c.assessment || !c.assessment.postural || !c.assessment.postural.focus).length;

  // Sort sessions
  const sortedSessions = [...sessionsToday].sort((a, b) => a.time.localeCompare(b.time));

  const sessionsHTML = sortedSessions.length > 0 ? sortedSessions.map(s => {
    const isConfirmed = s.status === 'Confirmed';
    
    let barColorClass = "bg-primary";
    if (s.type === 'Online Streaming') {
      barColorClass = "bg-tertiary-container";
    } else if (s.type === 'Kelas Studio') {
      barColorClass = "bg-primary-container";
    }
    
    const clientInitials = s.clientName ? s.clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CL';
    
    return `
      <div class="flex items-center gap-4">
        <span class="text-xs font-bold text-[#0b1c30] w-16 text-right block shrink-0">${s.time}</span>
        <div class="flex-grow border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center relative pl-6">
          <div class="absolute left-0 top-0 bottom-0 w-1.5 ${barColorClass} rounded-tl-xl rounded-bl-xl"></div>
          <div>
            <h4 class="font-headline font-bold text-sm text-slate-800">${s.type}</h4>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span class="bg-[#eff4ff] text-primary w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold">${clientInitials}</span>
              ${s.clientName}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold px-2 py-0.5 rounded font-headline ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
              ${isConfirmed ? 'CONFIRMED' : 'PENDING'}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('') : `
    <div class="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
      <span class="material-symbols-outlined text-[36px]">event_busy</span>
      <span class="text-xs font-semibold">No training sessions scheduled for today.</span>
    </div>
  `;

  // Build client alerts dynamically
  const alertsList = [];
  
  // 1. Low Session Alert
  clients.forEach(c => {
    if (c.package && c.package.remaining <= 3) {
      alertsList.push({
        name: c.name,
        initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        badge: 'LOW SESSION QUOTA',
        badgeClass: 'bg-[#eff4ff] text-[#00677f]',
        message: `Remaining package session quota is ${c.package.remaining} sessions left. Contact client to renew package.`,
        actionText: 'Send Reminder',
        actionClass: 'border border-slate-300 text-slate-700 hover:bg-slate-100',
        action: `window.showToast('Package renewal reminder sent!', 'success')`
      });
    }
  });

  // 2. Pending Assessment Alert
  clients.forEach(c => {
    if (!c.assessment || !c.assessment.postural || !c.assessment.postural.focus) {
      alertsList.push({
        name: c.name,
        initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        badge: 'INCOMPLETE ASSESSMENT',
        badgeClass: 'bg-error-container text-error',
        message: `Initial medical PAR-Q / posture screening is incomplete.`,
        actionText: 'Complete Now',
        actionClass: 'bg-primary text-white hover:bg-[#8f3200]',
        action: `navigateTo('clients')`
      });
    }
  });

  // 3. New Progress Log Alert
  clients.forEach(c => {
    if (c.bodyProgress && c.bodyProgress.length > 1) {
      const lastProgress = c.bodyProgress[c.bodyProgress.length - 1];
      if (lastProgress.date !== 'Awal') {
        alertsList.push({
          name: c.name,
          initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          badge: 'NEW PROGRESS METRIC',
          badgeClass: 'bg-slate-800 text-white',
          message: `Client logged new body weight: ${lastProgress.weight} kg (${lastProgress.date}).`,
          actionText: 'Open Chat',
          actionClass: 'border border-slate-300 text-slate-700 hover:bg-slate-100',
          action: `navigateTo('messages')`
        });
      }
    }
  });

  if (alertsList.length === 0) {
    alertsList.push({
      name: 'Emily Torres',
      initials: 'ET',
      badge: 'SESSION QUOTA',
      badgeClass: 'bg-[#eff4ff] text-[#00677f]',
      message: 'Approaching session limit. Only 2 sessions remaining in current package.',
      actionText: 'Send Reminder',
      actionClass: 'border border-slate-300 text-slate-700 hover:bg-slate-100',
      action: `window.showToast('Package renewal reminder sent!', 'success')`
    });
  }

  const alertsHTML = alertsList.slice(0, 3).map(a => `
    <div class="border border-slate-100 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50">
      <div>
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">${a.initials}</span>
            <span class="font-headline font-bold text-xs text-slate-800">${a.name}</span>
          </div>
          <span class="font-headline text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${a.badgeClass}">${a.badge}</span>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">${a.message}</p>
      </div>
      <button onclick="${a.action}" class="mt-4 w-full py-2 rounded text-xs font-bold transition-colors ${a.actionClass}">${a.actionText}</button>
    </div>
  `).join('');

  container.innerHTML = `
    <!-- Main Header section -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-headline font-extrabold text-[#0b1c30]">Welcome back, Coach!</h1>
        <p class="text-sm text-slate-500 mt-1">Here is your daily performance summary.</p>
      </div>
      <button onclick="openCreateScheduleModal()" class="bg-primary text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg flex items-center gap-1.5 shadow-md hover:bg-primary-container transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span> + New Session
      </button>
    </div>

    <!-- Layout Columns -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: Quick stats list -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-slate-400 font-bold text-[10px] tracking-wider block">Active Clients</span>
            <span class="text-4xl font-headline font-extrabold text-[#0b1c30] mt-1 block">${activeClientsCount}</span>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">group</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-slate-400 font-bold text-[10px] tracking-wider block">Sessions Today</span>
            <span class="text-4xl font-headline font-extrabold text-[#0b1c30] mt-1 block">${sessionsTodayCount}</span>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between border-l-4 border-l-primary">
          <div>
            <span class="text-slate-400 font-bold text-[10px] tracking-wider block">Pending Assessments</span>
            <span class="text-4xl font-headline font-extrabold text-primary mt-1 block">${pendingAssessmentsCount}</span>
          </div>
          <div class="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">assignment</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Today's Schedule -->
      <div class="lg:col-span-8">
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-headline font-bold text-lg text-[#0b1c30]">Today's Schedule</h3>
            <button onclick="navigateTo('calendar')" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View Full Calendar <span class="material-symbols-outlined text-[16px]">arrow_right_alt</span>
            </button>
          </div>

          <!-- Schedule Blocks list -->
          <div class="flex flex-col gap-4">
            ${sessionsHTML}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom: Client Alerts -->
    <div class="mt-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 class="font-headline font-bold text-lg text-[#0b1c30] mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">campaign</span>
        Client Alerts & Updates
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${alertsHTML}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. CLIENTS VIEW / CLIENT ROSTER (matching all_clients_directory/screen.png)
// ----------------------------------------------------
function renderClientsView(container) {
  const clients = getClients();

  const totalClientsCount = clients.length + 1;
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const inactiveCount = clients.filter(c => c.status === 'Inactive' || c.status === 'Onboarding').length + 1;

  container.innerHTML = `
    <!-- Header Client Roster -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-headline font-extrabold text-[#0b1c30]">Client Roster</h1>
        <p class="text-sm text-slate-500 mt-1">Manage and monitor all your active client profiles.</p>
      </div>
      <button onclick="openOnboardingWizard()" class="bg-primary hover:bg-[#8f3200] text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span> + New Client
      </button>
    </div>

    <!-- Filter chips -->
    <div class="flex gap-2.5 mb-6 overflow-x-auto pb-1.5 shrink-0">
      <button class="bg-[#0b1c30] text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">All Clients (${totalClientsCount})</button>
      <button class="bg-white border border-slate-200 text-slate-600 hover:border-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">Active (${activeCount})</button>
      <button class="bg-white border border-slate-200 text-slate-600 hover:border-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">Inactive (${inactiveCount})</button>
    </div>

    <!-- Grid Client Roster -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Render dynamic clients from state -->
      ${clients.map(c => {
        const isFlagged = c.assessment.hasInjury;
        const remaining = c.package.remaining;
        const total = c.package.total;
        const pct = (remaining / total) * 100;
        
        return `
          <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
            ${isFlagged ? `<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-error rounded-tl-xl rounded-bl-xl"></div>` : ''}
            <div>
              <!-- Client avatar, name, badge -->
              <div class="flex items-center gap-3 mb-6">
                <img class="w-14 h-14 rounded-full object-cover border" src="${c.avatar}" alt="Avatar">
                <div>
                  <h3 class="font-headline font-bold text-lg text-slate-800">${c.name}</h3>
                  <span class="bg-[#eff4ff] text-primary font-headline text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 w-max mt-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> ${c.status === 'Active' ? 'Active' : c.status}
                  </span>
                </div>
              </div>

              <!-- Metrics -->
              <div class="grid grid-cols-2 gap-4 mb-6 text-xs border-b border-slate-100 pb-4">
                <div>
                  <span class="text-slate-400 font-semibold block">Primary Goal</span>
                  <span class="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span>
                    ${c.assessment.postural.focus.split('/')[0]}
                  </span>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block">Last Session</span>
                  <span class="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                    ${c.bodyProgress[c.bodyProgress.length - 1].date}
                  </span>
                </div>
              </div>

              <!-- Package progress bar -->
              <div class="mb-4">
                <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Package Status</span>
                  <span>${remaining} / ${total}</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-primary h-full rounded-full" style="width: ${pct}%"></div>
                </div>
                <span class="text-[10px] text-slate-400 block mt-1.5">${remaining} sessions remaining</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2.5 mt-6 border-t border-slate-100 pt-4">
              <button onclick="viewClientProfile('${c.id}')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-headline text-xs font-bold py-2 rounded-lg transition-colors">Profile</button>
              <button onclick="navigateToBuilderForClient('${c.id}')" class="flex-1 bg-primary text-white font-headline text-xs font-bold py-2 rounded-lg hover:bg-[#8f3200] transition-colors">Workout Builder</button>
            </div>
          </div>
        `;
      }).join('')}

      <!-- Static Mock Client 3 (Elena Woods - Inactive) -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative">
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-300 rounded-tl-xl rounded-bl-xl"></div>
        <div>
          <div class="flex items-center gap-3 mb-6">
            <span class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-headline font-bold text-lg text-slate-600">EW</span>
            <div>
              <h3 class="font-headline font-bold text-lg text-slate-800">Elena Woods</h3>
              <span class="bg-slate-100 text-slate-600 font-headline text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 w-max mt-1">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> INACTIVE
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6 text-xs border-b border-slate-100 pb-4">
            <div>
              <span class="text-slate-400 font-semibold block">Primary Goal</span>
              <span class="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <span class="material-symbols-outlined text-[14px]">sports_accessibility</span>
                Mobility
              </span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block">Last Session</span>
              <span class="font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                12 May 2026
              </span>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Package Status</span>
              <span>0 / 12</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-slate-300 h-full rounded-full" style="width: 0%"></div>
            </div>
            <span class="text-[10px] text-slate-400 block mt-1.5">0 sessions remaining</span>
          </div>
        </div>

        <div class="flex gap-2.5 mt-6 border-t border-slate-100 pt-4">
          <button class="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 font-headline text-xs font-bold py-2 rounded-lg transition-colors">Profile</button>
          <button class="flex-grow bg-primary text-white font-headline text-xs font-bold py-2 rounded-lg hover:bg-[#8f3200] transition-colors">Workout Builder</button>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 3. WORKOUT BUILDER VIEW (matching workout_builder_progressive_overload/screen.png)
// ----------------------------------------------------
function renderBuilderView(container) {
  const clients = getClients();
  if (clients.length === 0) return;

  if (!activeBuilderClientId) {
    activeBuilderClientId = clients[0].id;
  }

  const client = clients.find(c => c.id === activeBuilderClientId) || clients[0];
  const program = getPrograms()[client.id];

  // Calculate volume totals
  const totalSets = program ? program.exercises.reduce((sum, ex) => sum + ex.sets, 0) : 0;
  const volLoad = program ? program.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0) : 0;

  container.innerHTML = `
    <!-- Subtitle Client Name -->
    <div class="mb-4">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">CLIENT: ${client.name.toUpperCase()}</span>
      
      <!-- Layout Title + Action buttons -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1.5 gap-4">
        <h1 class="text-3xl font-headline font-extrabold text-[#0b1c30]">${program?.focus || 'Workout Program'}</h1>
        
        <div class="flex gap-2 w-full sm:w-auto">
          <!-- Client select dropdown -->
          <div class="relative w-full sm:w-48">
            <select id="builder-client-select" onchange="switchBuilderClient(this.value)" class="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none font-bold text-slate-800 pr-8">
              ${clients.map(c => `<option value="${c.id}" ${c.id === client.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
          </div>
          <button onclick="saveActiveProgram()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-headline px-4 py-2.5 rounded-lg border border-slate-200 whitespace-nowrap">Save Draft</button>
          <button onclick="saveActiveProgram()" class="bg-primary text-white text-xs font-bold font-headline px-4 py-2.5 rounded-lg hover:bg-primary-container transition-all whitespace-nowrap shadow-sm">Assign Workout</button>
        </div>
      </div>
    </div>

    <!-- Workspace columns layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Main Builder list -->
      <div class="lg:col-span-8 flex flex-col gap-4">
        
        <!-- Search bar inside builder -->
        <div class="relative bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-slate-400 text-sm pl-2">add</span>
          <input type="text" onclick="openExerciseLibraryModal()" placeholder="Type to add exercise (e.g., Barbell Squat)..." class="w-full bg-transparent border-0 text-xs outline-none focus:ring-0 p-0 placeholder-slate-400">
          <button onclick="openExerciseLibraryModal()" class="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shrink-0">
            <span class="material-symbols-outlined text-sm">filter_list</span>
          </button>
        </div>

        <div class="flex flex-col gap-4" id="builder-exercises-list">
          ${program && program.exercises.length > 0 ? program.exercises.map((ex, idx) => `
            <div class="border border-slate-200 rounded-xl p-6 bg-white flex items-center gap-4 relative shadow-sm" data-builder-index="${idx}">
              <!-- Drag handles -->
              <div class="flex flex-col gap-0.5 text-slate-300 cursor-move shrink-0">
                <span class="material-symbols-outlined text-[16px]">drag_indicator</span>
              </div>
              
              <!-- Exercise Info fields -->
              <div class="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div class="md:col-span-4 min-w-0">
                  <span class="inline-block bg-[#e5eeff] text-[#00677f] font-headline text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1">${idx === 0 ? 'COMPOUND' : 'ACCESSORY'}</span>
                  <h4 class="font-headline font-bold text-sm text-slate-800 truncate">${ex.name}</h4>
                  <span class="text-[10px] text-slate-400">Quads, Glutes</span>
                </div>
                
                <div class="md:col-span-8 grid grid-cols-4 gap-2 items-end">
                  <div>
                    <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Sets</label>
                    <input type="number" value="${ex.sets}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-semibold outline-none focus:bg-white focus:border-primary" data-ex-sets="${idx}">
                  </div>
                  <div>
                    <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Reps</label>
                    <input type="text" value="${ex.reps}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-semibold outline-none focus:bg-white focus:border-primary" data-ex-reps="${idx}">
                  </div>
                  <div>
                    <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Target Wt (kg)</label>
                    <input type="number" step="0.5" value="${ex.weight}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-semibold outline-none focus:bg-white focus:border-primary" data-ex-weight="${idx}">
                  </div>
                  <div>
                    <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Rest (s)</label>
                    <input type="number" value="${ex.rest}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-semibold outline-none focus:bg-white focus:border-primary" data-ex-rest="${idx}">
                  </div>
                </div>
              </div>

              <!-- Actions on right side -->
              <div class="flex items-center gap-1.5 shrink-0 border-l border-slate-100 pl-4 ml-2">
                <button onclick="openEditMediaModal(${idx})" title="Edit Panduan Video/Foto" class="px-2 py-1 rounded bg-slate-50 hover:bg-primary/10 text-slate-600 hover:text-primary text-[10px] font-bold flex items-center gap-1 border border-slate-200"><span class="material-symbols-outlined text-[14px]">movie</span> Media</button>
                <button onclick="copyBuilderExercise(${idx})" title="Duplikasi Gerakan" class="w-8 h-8 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">content_copy</span></button>
                <button onclick="removeBuilderExercise(${idx})" title="Hapus Gerakan" class="w-8 h-8 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
          `).join('') : ''}
        </div>

        <button onclick="openExerciseLibraryModal()" class="w-full border-2 border-dashed border-slate-200 hover:border-primary text-slate-500 hover:text-primary font-headline text-xs font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 bg-white">
          <span class="material-symbols-outlined text-[18px]">add</span> Add Custom Block (Superset / Circuit)
        </button>
      </div>

      <!-- Right Column: Volume Overview & Client Info Card -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        
        <!-- Volume Overview -->
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-[#0b1c30]">Volume Overview</h3>
          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Total Sets</span>
              <span>${totalSets} / 20</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-primary h-full rounded-full" style="width: ${(totalSets / 20) * 100}%"></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-2">
            <div class="bg-slate-50 p-4 border border-slate-100 rounded-lg">
              <span class="text-[9px] text-slate-400 font-bold block uppercase">Est. Time</span>
              <span class="text-lg font-headline font-extrabold text-[#0b1c30] mt-1 block">${totalSets * 6} <span class="text-xs font-body font-normal text-slate-500">min</span></span>
            </div>
            <div class="bg-slate-50 p-4 border border-slate-100 rounded-lg">
              <span class="text-[9px] text-slate-400 font-bold block uppercase">Volume Load</span>
              <span class="text-lg font-headline font-extrabold text-[#00677f] mt-1 block">~${(volLoad / 1000).toFixed(1)}k <span class="text-xs font-body font-normal text-slate-500">kg</span></span>
            </div>
          </div>
        </section>

        <!-- Client Highlight Card -->
        <section class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col relative">
          <div class="h-16 bg-slate-50 border-b border-slate-100 relative shrink-0">
            <!-- Overlap Avatar -->
            <img class="w-14 h-14 rounded-full object-cover border-2 border-white absolute bottom-[-20px] left-6 shadow-md" src="${client.avatar}" alt="Avatar">
          </div>
          
          <div class="p-6 pt-8 flex flex-col gap-4">
            <div>
              <h4 class="font-headline font-bold text-lg text-slate-800">${client.name}</h4>
              ${client.assessment.hasInjury ? `
                <span class="inline-flex items-center gap-1 bg-red-100 text-red-700 font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider mt-1">
                  <span class="material-symbols-outlined text-[10px]">warning</span> RIGHT SHOULDER MOD
                </span>
              ` : ''}
            </div>

            <div class="border-t border-slate-100 pt-4 text-xs">
              <span class="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">CURRENT GOAL</span>
              <p class="text-slate-600 mt-1 leading-relaxed">${client.assessment.postural.analysis || 'Lower body hypertrophy with upper body maintenance. Avoid overhead pressing.'}</p>
            </div>
          </div>
        </section>

        <!-- Historical Lift Comparison Card -->
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-[#0b1c30] border-b border-slate-100 pb-2">Previous Lift Comparison</h3>
          <div class="space-y-3 text-xs text-slate-600">
            ${program && program.exercises.length > 0 ? program.exercises.map(ex => `
              <div class="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0 gap-2">
                <span class="font-bold text-slate-800 truncate">${ex.name}</span>
                <span class="text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border shrink-0">
                  Last Session: <span class="text-primary font-extrabold">${ex.history ? `${ex.history.weight} kg x ${ex.history.reps}` : '10 kg x 10'}</span>
                </span>
              </div>
            `).join('') : '<span class="text-slate-400 block text-center py-2">No exercises added yet.</span>'}
          </div>
        </section>
      </div>

    </div>
  `;
}

window.switchBuilderClient = function(clientId) {
  activeBuilderClientId = clientId;
  renderView();
};

window.copyBuilderExercise = function(idx) {
  const program = getPrograms()[activeBuilderClientId];
  const copy = JSON.parse(JSON.stringify(program.exercises[idx]));
  copy.id = `ex-${Date.now()}`;
  program.exercises.splice(idx + 1, 0, copy);
  updateProgram(activeBuilderClientId, program);
  renderView();
  showToast('Exercise duplicated successfully.', 'success');
};

window.removeBuilderExercise = function(idx) {
  const program = getPrograms()[activeBuilderClientId];
  program.exercises.splice(idx, 1);
  updateProgram(activeBuilderClientId, program);
  renderView();
  showToast('Exercise removed from program.', 'info');
};

window.saveActiveProgram = function() {
  const program = getPrograms()[activeBuilderClientId];
  if (!program) return;

  program.exercises.forEach((ex, idx) => {
    ex.sets = parseInt(document.querySelector(`[data-ex-sets="${idx}"]`).value) || 3;
    ex.reps = document.querySelector(`[data-ex-reps="${idx}"]`).value || '10';
    ex.weight = parseFloat(document.querySelector(`[data-ex-weight="${idx}"]`).value) || 0;
    ex.rest = parseInt(document.querySelector(`[data-ex-rest="${idx}"]`).value) || 60;
  });

  updateProgram(activeBuilderClientId, program);
  showToast('Workout program saved & updated for Client!', 'success');
};

// Exercise Library Selection Modal
window.openExerciseLibraryModal = function() {
  const library = getExerciseLibrary();
  const modalRoot = document.getElementById('modal-root');
  
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative max-h-[80vh] overflow-y-auto">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">Exercise Library</h2>
        <p class="text-xs text-slate-500 mb-4">Search and select exercises to add to the client program.</p>

        <div class="mb-4 relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">search</span>
          <input type="text" id="lib-search-input" onkeyup="filterExerciseLib()" placeholder="Search exercises..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary">
        </div>

        <div class="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1" id="lib-list-container">
          ${library.map(ex => `
            <div onclick="addExerciseToBuilder('${ex.name}')" class="border border-slate-100 hover:border-primary/20 rounded-lg p-3 bg-slate-50/50 hover:bg-primary/5 transition-all flex justify-between items-center cursor-pointer">
              <span class="text-xs font-bold text-slate-800">${ex.name}</span>
              <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">${ex.category}</span>
            </div>
          `).join('')}
        </div>

        <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onclick="closeModal()" class="w-full bg-slate-800 text-white py-2.5 text-xs font-bold rounded-lg">Close</button>
        </div>
      </div>
    </div>
  `;
};

window.filterExerciseLib = function() {
  const query = document.getElementById('lib-search-input').value.toLowerCase();
  const library = getExerciseLibrary();
  const container = document.getElementById('lib-list-container');
  
  const filtered = library.filter(ex => ex.name.toLowerCase().includes(query));
  container.innerHTML = filtered.map(ex => `
    <div onclick="addExerciseToBuilder('${ex.name}')" class="border border-slate-100 hover:border-primary/20 rounded-lg p-3 bg-slate-50/50 hover:bg-primary/5 transition-all flex justify-between items-center cursor-pointer">
      <span class="text-xs font-bold text-slate-800">${ex.name}</span>
      <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">${ex.category}</span>
    </div>
  `).join('');
};

window.addExerciseToBuilder = function(exName) {
  const program = getPrograms()[activeBuilderClientId];
  if (!program) return;

  const newEx = {
    id: `ex-${Date.now()}`,
    name: exName,
    sets: 3,
    reps: '10',
    weight: 10,
    rest: 60,
    completed: false,
    history: { weight: 8, reps: 10 },
    actual: []
  };

  program.exercises.push(newEx);
  updateProgram(activeBuilderClientId, program);
  closeModal();
  renderView();
  showToast(`Exercise ${exName} added successfully!`, 'success');
};

// ----------------------------------------------------
// 4. SCHEDULING MATRIX (PT SCHEDULE)
// ----------------------------------------------------
function renderCalendarView(container) {
  const schedule = getSchedule();

  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-headline font-extrabold text-[#0b1c30]">Training Schedule</h1>
        <p class="text-sm text-slate-500 mt-1">Manage weekly slots and validate client session attendance.</p>
      </div>
      <button onclick="openCreateScheduleModal()" class="bg-primary hover:bg-[#8f3200] text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span> + Add New Schedule
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Calendar Matrix Grid -->
      <div class="lg:col-span-8">
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 class="font-headline font-bold text-sm text-slate-800">Monthly Calendar</h3>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">July 2026</span>
          </div>

          <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-2 text-slate-400 uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="grid grid-cols-7 gap-2 text-center text-xs mt-3">
            ${Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = new Date();
              dateStr.setDate(dayNum);
              const dateIso = dateStr.toISOString().split('T')[0];
              
              const daySessions = schedule.filter(s => s.date === dateIso);
              return `
                <div class="min-h-24 p-1.5 border border-slate-100 hover:bg-slate-50/50 rounded-lg flex flex-col justify-between">
                  <span class="font-bold text-slate-400 self-start text-[10px]">${dayNum}</span>
                  <div class="flex flex-col gap-1.5 w-full mt-1.5">
                    ${daySessions.map(s => {
                      let pillColor = 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100';
                      if (s.type && s.type.includes('Streaming')) {
                        pillColor = 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100';
                      } else if (s.type && s.type.includes('Studio')) {
                        pillColor = 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100';
                      } else if (s.type && (s.type.includes('Beban') || s.type.includes('Weights'))) {
                        pillColor = 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100';
                      }
                      
                      const dotColor = s.status === 'Confirmed' ? 'bg-green-500' : 'bg-amber-500';
                      return `
                        <button onclick="openSessionValidationModal('${s.id}')" class="${pillColor} text-[8px] font-bold p-1 rounded text-left truncate w-full transition-colors flex items-center gap-1.5 focus:outline-none">
                          <span class="w-1.5 h-1.5 rounded-full ${dotColor} shrink-0"></span>
                          <span class="truncate">${s.time} - ${s.clientName}</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Legend sidebar -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Session Status Legend</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-green-100 border border-green-300 block"></span> 
              <span class="font-medium text-slate-700">Confirmed (Attended & Deducted)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 block"></span> 
              <span class="font-medium text-slate-700">Pending Trainer Validation</span>
            </div>
          </div>
        </section>
      </div>

    </div>
  `;
}

window.openSessionValidationModal = function(schedId) {
  const sched = getSchedule().find(s => s.id === schedId);
  if (!sched) return;

  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">Attendance Validation Details</h2>
        <p class="text-xs text-slate-500 mb-4">Validate attendance to deduct 1 session from client package.</p>
        
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs mb-6 text-slate-700">
          <div class="flex justify-between"><span>Client Name:</span> <span class="font-bold text-slate-800">${sched.clientName}</span></div>
          <div class="flex justify-between"><span>Session Time:</span> <span class="font-bold text-slate-800">${sched.date} @ ${sched.time}</span></div>
          <div class="flex justify-between"><span>Workout Type:</span> <span class="font-bold text-[#00677f]">${sched.type}</span></div>
          <div class="flex justify-between border-t border-slate-200/60 pt-2.5"><span>Attendance Status:</span> <span class="font-bold uppercase ${sched.validated ? 'text-green-600' : 'text-amber-500'}">${sched.validated ? 'Validated' : 'Pending Validation'}</span></div>
        </div>

        <div class="flex gap-3">
          <button onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Back</button>
          ${!sched.validated ? `
            <button onclick="validateSessionProcess('${sched.id}')" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Validate Attendance</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

window.validateSessionProcess = function(schedId) {
  const success = validateSession(schedId);
  closeModal();
  renderView();
  if (success) {
    showToast('Attendance validated successfully. Session package quota updated!', 'success');
  }
};

window.openCreateScheduleModal = function() {
  const clients = getClients();
  const modalRoot = document.getElementById('modal-root');
  
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">Create Schedule Slot</h2>
        <p class="text-xs text-slate-500 mb-4">Create a scheduled training slot for your active clients.</p>

        <form id="create-sched-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Select Client</label>
            <select id="sched-client-id" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Date</label>
              <input type="date" id="sched-date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Start Time</label>
              <input type="time" id="sched-time" required class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Workout Type / Location</label>
            <select id="sched-type" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              <option value="Free Weights (Gym)">Free Weights (Main Gym Barbell Area)</option>
              <option value="Studio Class">Studio Class (Floor 2)</option>
              <option value="Online Streaming">Online Streaming (Zoom)</option>
            </select>
          </div>

          <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Slot</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('create-sched-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const clientId = document.getElementById('sched-client-id').value;
    const client = clients.find(c => c.id === clientId);
    const date = document.getElementById('sched-date').value;
    const time = document.getElementById('sched-time').value;
    const type = document.getElementById('sched-type').value;
    
    try {
      addSchedule({
        clientId,
        clientName: client.name,
        date,
        time,
        duration: 60,
        type,
        location: type === 'Online Streaming' ? 'Zoom Meeting' : 'Main Gym Barbell Area',
        status: 'Confirmed'
      });

      closeModal();
      renderView();
      showToast('Session schedule saved successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
};

// ----------------------------------------------------
// 5. PACKAGES & SALES VIEW
// ----------------------------------------------------
function renderPackagesView(container) {
  const clients = getClients();
  
  let totalRevenue = 0;
  const salesRows = clients.map(c => {
    if (!c.package || !c.package.total) return '';
    
    const price = c.package.total * 100;
    totalRevenue += price;
    
    return `
      <tr class="text-slate-700">
        <td class="py-3 px-2">${c.joinedDate || '28 Jul 2026'}</td>
        <td class="py-3 px-2 font-bold">${c.name}</td>
        <td class="py-3 px-2">${c.package.name || `${c.package.total}-Session Package`}</td>
        <td class="py-3 px-2 text-right text-green-600 font-bold">PAID</td>
        <td class="py-3 px-2 text-right font-semibold">S$ ${price.toLocaleString('en-SG')}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
      <div class="border-b border-slate-100 pb-3 mb-4">
        <h2 class="font-headline font-bold text-lg text-slate-800">Package Sales Report</h2>
        <p class="text-xs text-slate-500 mt-0.5">List of session package purchase transactions by active clients.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 font-bold uppercase">
              <th class="py-3 px-2">Joined Date</th>
              <th class="py-3 px-2">Client Name</th>
              <th class="py-3 px-2">Package Name</th>
              <th class="py-3 px-2 text-right">Payment Status</th>
              <th class="py-3 px-2 text-right">Total Paid</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${salesRows}
            <tr class="bg-slate-50/50">
              <td class="py-3.5 px-2 font-bold text-slate-800" colspan="4">Total Sales Revenue</td>
              <td class="py-3.5 px-2 text-right font-extrabold text-primary text-sm">S$ ${totalRevenue.toLocaleString('en-SG')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. MESSAGES / CHAT CENTER VIEW
// ----------------------------------------------------
let activeChatClientId = '';

function renderMessagesView(container) {
  const clients = getClients();
  if (clients.length === 0) return;

  if (!activeChatClientId) {
    activeChatClientId = clients[0].id;
  }

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
            <div onclick="switchActiveChat('${c.id}')" class="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors ${c.id === client.id ? 'bg-primary/5 border-l-4 border-primary' : ''}">
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
    renderMessagesView(container);
  });
}

window.switchActiveChat = function(clientId) {
  activeChatClientId = clientId;
  renderView();
};

// ----------------------------------------------------
// PT MODULE HELPERS
// ----------------------------------------------------
window.closeModal = function() {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = '';
};

// Custom toast notification system
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

// Multi-step Wizard for Client Onboarding
window.openOnboardingWizard = function() {
  currentOnboardingStep = 1;
  onboardingData = {
    name: '', email: '', phone: '', packageTotal: 12,
    hasInjury: 'no', injuryNotes: '',
    posturalFocus: 'Hypertrophy / Muscle Building', posturalAnalysis: ''
  };
  renderOnboardingModal();
};

function renderOnboardingModal() {
  const modalRoot = document.getElementById('modal-root');
  
  let stepHTML = '';
  if (currentOnboardingStep === 1) {
    stepHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-headline font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Step 1: Personal Details & Session Package</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Client Name</label>
            <input type="text" id="wizard-name" value="${onboardingData.name}" required placeholder="Marcus Johnson" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
            <input type="email" id="wizard-email" value="${onboardingData.email}" required placeholder="marcus.j@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
            <input type="text" id="wizard-phone" value="${onboardingData.phone}" required placeholder="+62 812-xxxx-xxxx" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Training Package (Sessions)</label>
            <select id="wizard-package" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              <option value="10" ${onboardingData.packageTotal === 10 ? 'selected' : ''}>10-Session Package</option>
              <option value="12" ${onboardingData.packageTotal === 12 ? 'selected' : ''}>12-Session Package</option>
              <option value="20" ${onboardingData.packageTotal === 20 ? 'selected' : ''}>20-Session Package</option>
              <option value="30" ${onboardingData.packageTotal === 30 ? 'selected' : ''}>30-Session Package</option>
            </select>
          </div>
        </div>
      </div>
    `;
  } else if (currentOnboardingStep === 2) {
    stepHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-headline font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Step 2: Medical Questionnaire (PAR-Q)</h3>
        
        <div class="bg-error-container text-error rounded-lg p-3 text-[10px] mb-4 flex gap-2 border border-red-200">
          <span class="material-symbols-outlined text-[16px] shrink-0">warning</span>
          <p class="font-medium">Marking "Yes" triggers a visual Red Flag warning badge on client profile.</p>
        </div>

        <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
          <div class="flex items-start justify-between text-xs gap-3">
            <span>1. Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?</span>
            <select id="parq-q1" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>2. Do you feel pain in your chest when you perform physical activity?</span>
            <select id="parq-q2" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>3. In the past month, have you had chest pain when you were not doing physical activity?</span>
            <select id="parq-q3" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>4. Do you lose your balance because of dizziness or do you ever lose consciousness?</span>
            <select id="parq-q4" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>5. Do you have a bone or joint problem that could be made worse by a change in your physical activity?</span>
            <select id="parq-q5" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          
          <div class="border-t border-slate-100 pt-3">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Medical Injury Notes (Red Flag Notes)</label>
            <textarea id="wizard-injury-notes" placeholder="Write specific injury details here if any..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary h-16">${onboardingData.injuryNotes}</textarea>
          </div>
        </div>
      </div>
    `;
  } else if (currentOnboardingStep === 3) {
    stepHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-headline font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Step 3: Training Goals & Posture</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Primary Training Focus</label>
            <select id="wizard-focus" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              <option value="Hypertrophy / Muscle Building" ${onboardingData.posturalFocus.includes('Hypertrophy') ? 'selected' : ''}>Hypertrophy / Muscle Building</option>
              <option value="Fat Loss / Weight Loss" ${onboardingData.posturalFocus.includes('Fat Loss') ? 'selected' : ''}>Fat Loss / Weight Loss</option>
              <option value="Strength / Power" ${onboardingData.posturalFocus.includes('Strength') ? 'selected' : ''}>Strength / Maximal Power</option>
              <option value="Rehabilitation" ${onboardingData.posturalFocus.includes('Rehabilitation') ? 'selected' : ''}>Injury Rehabilitation</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Posture Analysis (Postural Analysis)</label>
            <textarea id="wizard-postural" placeholder="Write initial posture screening or squat test results..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary h-24">${onboardingData.posturalAnalysis}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">New Client Onboarding</h2>
        <p class="text-xs text-slate-500 mb-6">Complete the registration form to build the client profile.</p>
        
        <!-- Steps Stepper -->
        <div class="flex items-center justify-between mb-6 relative">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentOnboardingStep >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}">1</div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentOnboardingStep >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}">2</div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentOnboardingStep >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}">3</div>
        </div>

        <form id="onboarding-form" class="space-y-4">
          ${stepHTML}
          
          <div class="flex gap-3 pt-4 border-t border-slate-100">
            ${currentOnboardingStep > 1 ? `
              <button type="button" onclick="navigateOnboardingStep(-1)" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Previous</button>
            ` : `
              <button type="button" onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            `}
            
            ${currentOnboardingStep < 3 ? `
              <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Next</button>
            ` : `
              <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Client</button>
            `}
          </div>
        </form>
      </div>
    </div>
  `;

  // Bind submit event
  document.getElementById('onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentOnboardingStep === 1) {
      onboardingData.name = document.getElementById('wizard-name').value;
      onboardingData.email = document.getElementById('wizard-email').value;
      onboardingData.phone = document.getElementById('wizard-phone').value;
      onboardingData.packageTotal = parseInt(document.getElementById('wizard-package').value);
      
      currentOnboardingStep = 2;
      renderOnboardingModal();
    } else if (currentOnboardingStep === 2) {
      const q1 = document.getElementById('parq-q1').value;
      const q2 = document.getElementById('parq-q2').value;
      const q3 = document.getElementById('parq-q3').value;
      const q4 = document.getElementById('parq-q4').value;
      const q5 = document.getElementById('parq-q5').value;
      onboardingData.injuryNotes = document.getElementById('wizard-injury-notes').value;
      
      onboardingData.hasInjury = (q1 === 'yes' || q2 === 'yes' || q3 === 'yes' || q4 === 'yes' || q5 === 'yes' || onboardingData.injuryNotes.trim() !== '');
      onboardingData.parq = { q1, q2, q3, q4, q5, q6: 'no', q7: 'no' };

      currentOnboardingStep = 3;
      renderOnboardingModal();
    } else if (currentOnboardingStep === 3) {
      onboardingData.posturalFocus = document.getElementById('wizard-focus').value;
      onboardingData.posturalAnalysis = document.getElementById('wizard-postural').value;

      const newClientId = `client-${Date.now()}`;
      const newClient = {
        id: newClientId,
        name: onboardingData.name,
        email: onboardingData.email,
        phone: onboardingData.phone,
        avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Active',
        package: {
          name: `${onboardingData.packageTotal}-Session Package`,
          total: onboardingData.packageTotal,
          remaining: onboardingData.packageTotal
        },
        assessment: {
          hasInjury: onboardingData.hasInjury,
          injuryNotes: onboardingData.injuryNotes,
          medicalCleared: true,
          parq: onboardingData.parq,
          postural: {
            focus: onboardingData.posturalFocus,
            analysis: onboardingData.posturalAnalysis
          }
        },
        bodyProgress: [
          { date: 'Initial', weight: 80.0, bodyFat: 25.0, muscleMass: 30.0, waist: 90 }
        ],
        photos: [],
        habits: {
          water: { current: 0, target: 3.0 },
          sleep: { current: 0, target: 8.0 },
          steps: { current: 0, target: 10000 },
          completedToday: []
        }
      };

      const programs = getPrograms();
      programs[newClientId] = {
        focus: onboardingData.posturalFocus,
        mesocycle: 'Phase 1: Initial Conditioning',
        exercises: []
      };

      saveClient(newClient);
      closeModal();
      renderView();
      showToast('New client onboarding completed successfully!', 'success');
    }
  });
}

window.navigateOnboardingStep = function(amount) {
  currentOnboardingStep = Math.max(1, currentOnboardingStep + amount);
  renderOnboardingModal();
};

window.toggleProfileDropdown = function() {
  const drop = document.getElementById('profile-dropdown');
  if (drop) {
    drop.classList.toggle('hidden');
  }
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

window.navigateToBuilderForClient = function(clientId) {
  activeBuilderClientId = clientId;
  navigateTo('builder');
};

window.viewClientProfile = function(clientId) {
  activeClientDetailId = clientId;
  navigateTo('client-detail');
};

function renderClientDetailView(container) {
  const clients = getClients();
  const client = clients.find(c => c.id === activeClientDetailId);
  if (!client) {
    container.innerHTML = `
      <div class="bg-white rounded-xl border p-6 text-center text-slate-500">
        Client not found.
        <button onclick="navigateTo('clients')" class="mt-4 bg-primary text-white px-4 py-2 rounded text-xs font-bold block mx-auto">Back</button>
      </div>
    `;
    return;
  }

  const progressRows = client.bodyProgress.map(bp => `
    <tr class="border-b border-slate-100 last:border-0 text-slate-700">
      <td class="py-2.5 font-medium">${bp.date}</td>
      <td class="py-2.5">${bp.weight} kg</td>
      <td class="py-2.5">${bp.bodyFat}%</td>
      <td class="py-2.5">${bp.muscleMass} kg</td>
      <td class="py-2.5">${bp.waist} cm</td>
    </tr>
  `).join('');

  const photoHTML = client.photos.length > 0 ? client.photos.map(p => `
    <div class="flex flex-col gap-1.5">
      <img class="w-full h-32 rounded-lg object-cover border" src="${p.url}" alt="${p.type}">
      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">${p.type} (${p.date})</span>
    </div>
  `).join('') : `
    <div class="col-span-2 text-center py-6 text-slate-400 bg-slate-50 border border-slate-100 rounded-lg text-[10px]">
      No progress photos uploaded yet.
    </div>
  `;

  container.innerHTML = `
    <!-- Back Button -->
    <div class="mb-4">
      <button onclick="navigateTo('clients')" class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-[#8f3200] transition-colors focus:outline-none">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Client Roster
      </button>
    </div>

    <!-- Main Container Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
      
      <!-- Top Header Row -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
        <div class="flex items-center gap-4">
          <img class="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm" src="${client.avatar}">
          <div>
            <h2 class="text-2xl font-headline font-extrabold text-slate-800">${client.name}</h2>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="bg-green-100 text-green-700 text-[10px] font-bold font-headline px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ${client.status === 'Active' ? 'Active Client' : client.status}
              </span>
              <span class="text-xs text-slate-400 font-medium">Joined ${client.joinedDate}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button onclick="navigateToBuilderForClient('${client.id}')" class="bg-primary text-white text-xs font-bold font-headline py-2.5 px-4 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm">
            Workout Builder
          </button>
        </div>
      </div>

      <!-- Two Columns Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-slate-600">
        
        <!-- Left Side: Bio & Physical Readiness -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Contact Info & Profile</h3>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-400 font-semibold block">Email Address:</span>
                <span class="font-bold text-slate-800 mt-0.5 block">${client.email}</span>
              </div>
              <div>
                <span class="text-slate-400 font-semibold block">Phone Number:</span>
                <span class="font-bold text-slate-800 mt-0.5 block">${client.phone}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            <h4 class="font-headline font-bold text-slate-800 text-[11px] flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
              <span class="material-symbols-outlined text-[18px] text-primary">medical_information</span>
              PAR-Q Physical Readiness Questionnaire
            </h4>
            <div class="space-y-2 text-[11px] text-slate-600">
              <div class="flex justify-between"><span>Doctor Recommended Specific Activity:</span><span class="font-bold text-slate-800">${client.assessment.parq.q1 === 'yes' ? 'Yes (Restrictions)' : 'No (Cleared)'}</span></div>
              <div class="flex justify-between"><span>Chest Pain During Activity:</span><span class="font-bold text-slate-800">${client.assessment.parq.q2 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between"><span>Chest Pain At Rest:</span><span class="font-bold text-slate-800">${client.assessment.parq.q3 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between"><span>Dizziness / Loss of Balance:</span><span class="font-bold text-slate-800">${client.assessment.parq.q4 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between"><span>Chronic Bone / Joint Issue:</span><span class="font-bold text-slate-800">${client.assessment.parq.q5 === 'yes' ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          ${client.assessment.hasInjury ? `
            <div class="bg-red-50 border border-red-100 p-5 rounded-xl text-red-700">
              <h4 class="font-headline font-bold flex items-center gap-1.5 text-[11px] border-b border-red-200/40 pb-2 mb-2">
                <span class="material-symbols-outlined text-[18px]">warning</span> Medical Injury Notes (Red Flag)
              </h4>
              <p class="text-xs leading-relaxed font-medium">${client.assessment.injuryNotes}</p>
            </div>
          ` : ''}
        </div>

        <!-- Right Side: Goals & Photos -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Goals & Posture Analysis</h3>
            <form id="edit-client-posture-form" class="space-y-4" onsubmit="window.saveClientPosture(event, '${client.id}')">
              <div>
                <label class="text-slate-400 font-semibold block mb-1">Primary Training Goal:</label>
                <select id="edit-postural-focus" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  <option value="Hypertrophy / Muscle Building" ${client.assessment.postural.focus.startsWith('Hypertrophy') ? 'selected' : ''}>Hypertrophy / Muscle Building</option>
                  <option value="Fat Loss / Endurance" ${client.assessment.postural.focus.startsWith('Fat Loss') ? 'selected' : ''}>Fat Loss / Endurance</option>
                  <option value="Sports Performance" ${client.assessment.postural.focus.startsWith('Sports') ? 'selected' : ''}>Sports Performance</option>
                  <option value="Mobility / Rehabilitation" ${client.assessment.postural.focus.startsWith('Mobility') ? 'selected' : ''}>Mobility / Rehabilitation</option>
                </select>
              </div>
              <div>
                <label class="text-slate-400 font-semibold block mb-1">Client Posture Analysis:</label>
                <textarea id="edit-postural-analysis" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white min-h-[80px] leading-relaxed text-slate-700">${client.assessment.postural.analysis || ''}</textarea>
              </div>
              <button type="submit" class="bg-primary text-white text-[10px] font-bold font-headline py-2 px-4 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm focus:outline-none">
                Save Assessment Changes
              </button>
            </form>
          </div>

          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Progress Photo Gallery</h3>
            <div class="grid grid-cols-2 gap-4">
              ${photoHTML}
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Row: Body Progress History Table -->
      <div class="border-t border-slate-100 pt-6">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Body Composition Metrics History</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-slate-400">
                <th class="py-2.5 font-semibold">Date</th>
                <th class="py-2.5 font-semibold">Weight</th>
                <th class="py-2.5 font-semibold">Body Fat</th>
                <th class="py-2.5 font-semibold">Muscle Mass</th>
                <th class="py-2.5 font-semibold">Waist Size</th>
              </tr>
            </thead>
            <tbody>
              ${progressRows}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

window.saveClientPosture = function(event, clientId) {
  event.preventDefault();
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return;

  const focus = document.getElementById('edit-postural-focus').value;
  const analysis = document.getElementById('edit-postural-analysis').value;

  client.assessment.postural.focus = focus;
  client.assessment.postural.analysis = analysis;

  saveClient(client);
  renderView();
  showToast('Postural assessment & training goals updated successfully!', 'success');
};

window.openEditMediaModal = function(idx) {
  const program = getPrograms()[activeBuilderClientId];
  const ex = program ? program.exercises[idx] : null;
  if (!ex) return;

  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-xl p-6 border border-slate-100 shadow-2xl relative space-y-4">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 class="text-base font-headline font-bold text-slate-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">movie</span>
            Visual & Video Guide: ${ex.name}
          </h2>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined text-[18px]">close</span></button>
        </div>
        <p class="text-xs text-slate-500">Enter demo video URL or photo URL so clients can view exercise technique instructions.</p>

        <form id="edit-media-form" class="space-y-4" onsubmit="window.saveExerciseMedia(event, ${idx})">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Demo Video URL (Youtube Embed / MP4)</label>
            <input type="url" id="media-video-url" value="${ex.videoUrl || ''}" placeholder="https://www.youtube.com/embed/..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Posture Demo Photo URL</label>
            <input type="url" id="media-image-url" value="${ex.imageUrl || ''}" placeholder="https://images.unsplash.com/..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Technical Guide & Coach Notes</label>
            <textarea id="media-instructions" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary min-h-[80px]" placeholder="e.g. Position feet shoulder-width apart, exhale when pushing weight...">${ex.instructions || ''}</textarea>
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" class="flex-1 bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm">Save Visual Guide</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

window.saveExerciseMedia = function(event, idx) {
  event.preventDefault();
  const program = getPrograms()[activeBuilderClientId];
  const ex = program ? program.exercises[idx] : null;
  if (!ex) return;

  ex.videoUrl = document.getElementById('media-video-url').value.trim();
  ex.imageUrl = document.getElementById('media-image-url').value.trim();
  ex.instructions = document.getElementById('media-instructions').value.trim();

  updateProgram(activeBuilderClientId, program);
  closeModal();
  renderView();
  showToast(`Visual guide for ${ex.name} updated successfully!`, 'success');
};
