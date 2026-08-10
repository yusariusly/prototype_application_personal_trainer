import { getClients } from '../../src/models/ClientModel.js';
import { t, translateDOM } from '../../src/i18n.js';

export function renderClientsView(container) {
  const clients = getClients();

  const totalClientsCount = clients.length + 1;
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const inactiveCount = clients.filter(c => c.status === 'Inactive' || c.status === 'Onboarding').length + 1;

  container.innerHTML = `
    <!-- Header Client Roster -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 data-i18n="clients_title" class="text-3xl font-headline font-extrabold text-[#0b1c30]">Client Roster</h1>
        <p data-i18n="clients_sub" class="text-sm text-slate-500 mt-1">Manage and monitor all your active client profiles.</p>
      </div>
      <button onclick="openOnboardingWizard()" data-i18n="btn_new_client" class="bg-primary hover:bg-[#8f3200] text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span> + New Client
      </button>
    </div>

    <!-- Filter chips -->
    <div class="flex gap-2.5 mb-6 overflow-x-auto pb-1.5 shrink-0">
      <button data-i18n="filter_all_clients" class="bg-[#0b1c30] text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">All Clients (${totalClientsCount})</button>
      <button data-i18n="filter_active_clients" class="bg-white border border-slate-200 text-slate-600 hover:border-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">Active (${activeCount})</button>
      <button data-i18n="filter_inactive_clients" class="bg-white border border-slate-200 text-slate-600 hover:border-primary px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">Inactive (${inactiveCount})</button>
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
                  <span data-i18n="label_primary_goal" class="text-slate-400 font-semibold block">Primary Goal</span>
                  <span class="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span>
                    ${c.assessment.postural.focus.split('/')[0]}
                  </span>
                </div>
                <div>
                  <span data-i18n="label_last_session" class="text-slate-400 font-semibold block">Last Session</span>
                  <span class="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                    ${c.bodyProgress[c.bodyProgress.length - 1].date}
                  </span>
                </div>
              </div>

              <!-- Package progress bar -->
              <div class="mb-4">
                <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span data-i18n="label_package_status">Package Status</span>
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
              <button onclick="window.viewClientProfile('${c.id}')" data-i18n="btn_profile" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-headline text-xs font-bold py-2 rounded-lg transition-colors">Profile</button>
              <button onclick="window.navigateToBuilderForClient('${c.id}')" data-i18n="btn_workout_builder" class="flex-1 bg-primary text-white font-headline text-xs font-bold py-2 rounded-lg hover:bg-[#8f3200] transition-colors">Workout Builder</button>
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

  // translate DOM after render
  translateDOM();
}
