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
      <div class="flex items-center gap-4 group cursor-default">
        <span class="text-sm font-bold text-slate-400 w-16 text-right block shrink-0 group-hover:text-primary transition-colors">${s.time}</span>
        <div class="flex-grow border border-white rounded-2xl p-4 bg-white/60 backdrop-blur-sm flex justify-between items-center relative pl-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div class="absolute left-0 top-0 bottom-0 w-1.5 ${barColorClass} rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
          <div>
              <h4 class="font-headline font-bold text-base text-slate-800">${s.type}</h4>
            <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
              <span class="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner">${clientInitials}</span>
              <span class="font-medium">${s.clientName}</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-md font-headline ${isConfirmed ? 'bg-green-100/80 text-green-700' : 'bg-amber-100/80 text-amber-700'} backdrop-blur-md">
                ${isConfirmed ? t('status_confirmed') : t('status_pending')}
              </span>
          </div>
        </div>
      </div>
    `;
  }).join('') : `
<div class="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
<span class="material-symbols-outlined text-[36px]" data-i18n="event_busy">event_busy</span>
<span class="text-xs font-semibold" data-i18n="admin_no_sessions_today">No training sessions scheduled for today.</span>
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
    <div class="border border-white bg-white/60 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div class="relative z-10">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <span class="w-9 h-9 rounded-full bg-slate-200/80 flex items-center justify-center font-bold text-xs shadow-inner text-slate-600">${a.initials}</span>
            <span class="font-headline font-bold text-sm text-slate-800">${a.name}</span>
          </div>
          <span class="font-headline text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${a.badgeClass} shadow-sm">${a.badge}</span>
        </div>
        <p class="text-sm text-slate-500 font-medium leading-relaxed">${a.message}</p>
      </div>
      <button onclick="${a.action}" class="mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${a.actionClass} shadow-sm group-hover:shadow-md relative z-10">${a.actionText}</button>
    </div>
  `).join('');

  container.innerHTML = `
<!-- Main Header section -->
<div class="flex justify-between items-center mb-8">
<div>
<h1 class="text-4xl font-headline font-extrabold text-slate-800 tracking-tight" data-i18n="admin_welcome_back">Welcome back, Coach!</h1>
<p class="text-base text-slate-500 mt-2 font-medium" data-i18n="admin_daily_summary">Here is your daily performance summary.</p>
</div>
<button class="bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold font-headline px-6 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-300" onclick="openCreateScheduleModal()">
<span class="material-symbols-outlined text-[20px]" data-i18n="add">add</span> New Session
      </button>
</div>
<!-- Layout Columns -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
<!-- Left Column: Quick stats list -->
<div class="lg:col-span-4 flex flex-col gap-6">
<div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
<div>
<span class="text-slate-500 font-bold text-[10px] tracking-wider block uppercase" data-i18n="admin_active_clients">Active Clients</span>
<span class="text-4xl font-headline font-extrabold text-slate-800 mt-2 block">${activeClientsCount}</span>
</div>
<div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
<span class="material-symbols-outlined text-[24px]" data-i18n="group">group</span>
</div>
</div>
<div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
<div>
<span class="text-slate-500 font-bold text-[10px] tracking-wider block uppercase" data-i18n="sessions_today">Sessions Today</span>
<span class="text-4xl font-headline font-extrabold text-slate-800 mt-2 block">${sessionsTodayCount}</span>
</div>
<div class="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
<span class="material-symbols-outlined text-[24px]" data-i18n="check_circle">check_circle</span>
</div>
</div>
<div class="bg-gradient-to-br from-primary/5 to-white/70 backdrop-blur-md rounded-2xl p-6 border border-primary/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>
<div>
<span class="text-primary/80 font-bold text-[10px] tracking-wider block uppercase" data-i18n="pending_assessments">Pending Assessments</span>
<span class="text-4xl font-headline font-extrabold text-primary mt-2 block">${pendingAssessmentsCount}</span>
</div>
<div class="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300 shadow-inner">
<span class="material-symbols-outlined text-[24px]" data-i18n="assignment_late">assignment_late</span>
</div>
</div>
<div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
<div>
<span class="text-slate-500 font-bold text-[10px] tracking-wider block uppercase" data-i18n="avg_compliance_rate">Avg Compliance Rate</span>
<span class="text-4xl font-headline font-extrabold text-green-600 mt-2 block">82%</span>
</div>
<div class="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-inner">
<span class="material-symbols-outlined text-[24px]" data-i18n="monitoring">monitoring</span>
</div>
</div>
</div>
<!-- Right Column: Today's Schedule -->
<div class="lg:col-span-8">
<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-sm h-full flex flex-col">
<div class="flex justify-between items-center mb-8">
<h3 class="font-headline font-bold text-2xl text-slate-800" data-i18n="today_s_schedule">Today's Schedule</h3>
<button class="text-sm font-bold text-primary hover:text-primary-container flex items-center gap-1 group transition-colors" onclick="navigateTo('calendar')">
              View Full Calendar <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform" data-i18n="arrow_right_alt">arrow_right_alt</span>
</button>
</div>
<!-- Schedule Blocks list -->
<div class="flex flex-col gap-5 flex-grow overflow-y-auto pr-2">
            ${sessionsHTML}
          </div>
</div>
</div>
</div>
<!-- Bottom: Client Alerts -->
<div class="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-sm">
<h3 class="font-headline font-bold text-2xl text-slate-800 mb-6 flex items-center gap-3">
<span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl" data-i18n="campaign">campaign</span>
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
