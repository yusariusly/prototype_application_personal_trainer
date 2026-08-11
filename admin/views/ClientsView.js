import { getClients } from '../../src/models/ClientModel.js';
import { t, translateDOM } from '../../src/i18n.js';

export function renderClientsView(container) {
  const clients = getClients();

  const totalClientsCount = clients.length + 1;
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const inactiveCount = clients.filter(c => c.status === 'Inactive' || c.status === 'Onboarding').length + 1;

  container.innerHTML = `
<!-- Header Client Roster -->
<div class="flex justify-between items-center mb-8">
<div>
<h1 class="text-4xl font-headline font-extrabold text-slate-800 tracking-tight" data-i18n="clients_title">Client Roster</h1>
<p class="text-base text-slate-500 mt-2 font-medium" data-i18n="clients_sub">Manage and monitor all your active client profiles.</p>
</div>
<button class="bg-gradient-to-r from-primary to-primary-container hover:from-primary-hover hover:to-primary text-white text-sm font-bold font-headline px-6 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-300" data-i18n="btn_new_client" onclick="openOnboardingWizard()">
<span class="material-symbols-outlined text-[20px]" data-i18n="add">add</span> New Client
      </button>
</div>
<!-- Filter chips -->
<div class="flex gap-3 mb-8 overflow-x-auto pb-2 shrink-0">
<button class="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shadow-md hover:bg-slate-700 transition-colors" data-i18n="filter_all_clients">All Clients (${totalClientsCount})</button>
<button class="bg-white/80 backdrop-blur-md border border-white text-slate-600 hover:text-primary hover:border-primary/30 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shadow-sm hover:shadow-md transition-all" data-i18n="filter_active_clients">Active (${activeCount})</button>
<button class="bg-white/80 backdrop-blur-md border border-white text-slate-600 hover:text-primary hover:border-primary/30 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shadow-sm hover:shadow-md transition-all" data-i18n="filter_inactive_clients">Inactive (${inactiveCount})</button>
</div>
<!-- Grid Client Roster -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
<!-- Render dynamic clients from state -->
      ${clients.map((c, index) => {
        const isFlagged = c.assessment.hasInjury;
        const remaining = c.package.remaining;
        const total = c.package.total;
        const pct = (remaining / total) * 100;
        
        return `
          <div class="bg-white/60 backdrop-blur-xl rounded-3xl border border-white p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden opacity-0 animate-slide-up" style="animation-delay: ${index * 0.1}s;">
            ${isFlagged ? `<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-error rounded-l-3xl shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>` : ''}
            
            <!-- Soft glow effect behind card -->
            <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none"></div>

            <div class="relative z-10">
              <!-- Client avatar, name, badge -->
              <div class="flex items-center gap-4 mb-6">
                <div class="relative">
                  <img class="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500" src="${c.avatar}" alt="Avatar">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 class="font-headline font-extrabold text-xl text-slate-800 tracking-tight">${c.name}</h3>
                  <span class="bg-primary/10 text-primary font-headline text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 w-max mt-2 shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(230,81,0,0.8)]"></span> ${c.status === 'Active' ? 'Active' : c.status}
                  </span>
                </div>
              </div>

              <!-- Metrics -->
              <div class="grid grid-cols-2 gap-4 mb-6 text-sm border-b border-slate-200/60 pb-5">
                <div>
                  <span data-i18n="label_primary_goal" class="text-slate-400 font-semibold block text-xs tracking-wide uppercase">Primary Goal</span>
                  <span class="font-bold text-slate-700 flex items-center gap-1.5 mt-1.5">
                    <span data-i18n="trending_up" class="material-symbols-outlined text-[16px] text-primary">trending_up</span>
                    ${c.assessment.postural.focus.split('/')[0]}
                  </span>
                </div>
                <div>
                  <span data-i18n="label_last_session" class="text-slate-400 font-semibold block text-xs tracking-wide uppercase">Last Session</span>
                  <span class="font-bold text-slate-700 flex items-center gap-1.5 mt-1.5">
                    <span class="material-symbols-outlined text-[16px] text-blue-500">calendar_today</span>
                    ${c.bodyProgress[c.bodyProgress.length - 1].date}
                  </span>
                </div>
              </div>

              <!-- Package progress bar -->
              <div class="mb-2">
                <div class="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span data-i18n="label_package_status" class="uppercase tracking-wide">Package Status</span>
                  <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-700">${remaining} / ${total}</span>
                </div>
                <div class="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full relative" style="width: ${pct}%">
                    <div class="absolute inset-0 bg-white/20 w-full h-full rounded-full"></div>
                  </div>
                </div>
                <span class="text-[11px] font-medium text-slate-500 block mt-2">${remaining} sessions remaining</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 mt-6 border-t border-slate-200/60 pt-5 relative z-10">
              <button onclick="window.viewClientProfile('${c.id}')" data-i18n="btn_profile" class="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm text-slate-700 font-headline text-sm font-bold py-3 rounded-xl transition-all">Profile</button>
              <button onclick="window.navigateToBuilderForClient('${c.id}')" data-i18n="btn_workout_builder" class="flex-1 bg-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 font-headline text-sm font-bold py-3 rounded-xl hover:bg-primary-hover transition-all">Workout Builder</button>
            </div>
          </div>
        `;
      }).join('')}

      <!-- Static Mock Client 3 (Elena Woods - Inactive) -->
      <div class="bg-white/40 backdrop-blur-md rounded-3xl border border-white p-7 flex flex-col justify-between shadow-sm relative group overflow-hidden opacity-0 hover:opacity-100 transition-all animate-slide-up" style="animation-delay: ${clients.length * 0.1}s;">
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-300 rounded-l-3xl"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-6">
            <span data-i18n="ew" class="w-16 h-16 rounded-2xl bg-slate-200/80 shadow-inner flex items-center justify-center font-headline font-bold text-xl text-slate-500 border-2 border-white">EW</span>
            <div>
              <h3 data-i18n="elena_woods" class="font-headline font-extrabold text-xl text-slate-700 tracking-tight">Elena Woods</h3>
              <span class="bg-slate-200/50 text-slate-600 font-headline text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 w-max mt-2">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> INACTIVE
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6 text-sm border-b border-slate-200/60 pb-5">
            <div>
              <span data-i18n="primary_goal" class="text-slate-400 font-semibold block text-xs tracking-wide uppercase">Primary Goal</span>
              <span class="font-bold text-slate-600 flex items-center gap-1.5 mt-1.5">
                <span data-i18n="sports_accessibility" class="material-symbols-outlined text-[16px]">sports_accessibility</span>
                Mobility
              </span>
            </div>
            <div>
              <span data-i18n="last_session" class="text-slate-400 font-semibold block text-xs tracking-wide uppercase">Last Session</span>
              <span data-i18n="12_may_2026" class="font-bold text-slate-500 flex items-center gap-1.5 mt-1.5">
                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                12 May 2026
              </span>
            </div>
          </div>

          <div class="mb-2">
            <div class="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span data-i18n="package_status" class="uppercase tracking-wide">Package Status</span>
              <span class="bg-slate-200/50 px-2 py-0.5 rounded">0 / 12</span>
            </div>
            <div class="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div class="bg-slate-300 h-full rounded-full" style="width: 0%"></div>
            </div>
            <span data-i18n="0_sessions_remaining" class="text-[11px] font-medium text-slate-400 block mt-2">0 sessions remaining</span>
          </div>
        </div>

        <div class="flex gap-3 mt-6 border-t border-slate-200/60 pt-5 relative z-10">
          <button data-i18n="profile" class="flex-grow bg-white border border-slate-200 hover:bg-slate-50 shadow-sm text-slate-500 font-headline text-sm font-bold py-3 rounded-xl transition-all">Profile</button>
          <button data-i18n="workout_builder" class="flex-grow bg-primary/80 text-white font-headline text-sm font-bold py-3 rounded-xl hover:bg-primary transition-all shadow-sm">Workout Builder</button>
        </div>
      </div>

    </div>
  `;

  // translate DOM after render
  translateDOM();
}
