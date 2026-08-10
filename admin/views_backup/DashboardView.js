import { getClients } from '../../src/models/ClientModel.js';
import { getSchedule } from '../../src/models/ScheduleModel.js';
import { t, translateDOM } from '../../src/i18n.js';

export function renderDashboardView(container) {
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
                ${isConfirmed ? t('status_confirmed') : t('status_pending')}
              </span>
          </div>
        </div>
      </div>
    `;
  }).join('') : `
    <div class="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
      <span class="material-symbols-outlined text-[36px]">event_busy</span>
        <span data-i18n="admin_no_sessions_today" class="text-xs font-semibold">No training sessions scheduled for today.</span>
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
        <h1 data-i18n="admin_welcome_back" class="text-3xl font-headline font-extrabold text-[#0b1c30]">Welcome back, Coach!</h1>
      <p data-i18n="admin_daily_summary" class="text-sm text-slate-500 mt-1">Here is your daily performance summary.</p>
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
            <span data-i18n="admin_active_clients" class="text-slate-400 font-bold text-[10px] tracking-wider block">Active Clients</span>
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
            <span class="text-4xl font-headline font-extrabold text-[#0b1c30] mt-1 block">${pendingAssessmentsCount}</span>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">assignment_late</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-slate-400 font-bold text-[10px] tracking-wider block">Avg Compliance Rate</span>
            <span class="text-4xl font-headline font-extrabold text-green-600 mt-1 block">82%</span>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <span class="material-symbols-outlined">monitoring</span>
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
  // translate dynamic content
  translateDOM();
}
