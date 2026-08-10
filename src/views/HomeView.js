import { getActiveClient } from '../models/ClientModel.js';
import { saveState } from '../models/Store.js';
import { getPrograms } from '../models/ProgramModel.js';
import { getSchedule } from '../models/ScheduleModel.js';
import { updateProgram } from '../models/ProgramModel.js';

export function renderHomeView(container, client) {
  const schedule = getSchedule().filter(s => s.clientId === client.id);
  const nextSession = schedule.find(s => !s.validated && s.status === 'Confirmed') || schedule[0];
  
  const pkgRemaining = client.package.remaining;
  const pkgTotal = client.package.total;
  const pct = (pkgRemaining / pkgTotal) * 100;
  const program = getPrograms()[client.id];
  const habits = client.habits;

  const lastProgress = client.bodyProgress && client.bodyProgress.length > 0 ? client.bodyProgress[client.bodyProgress.length - 1] : null;
  const currentWeight = lastProgress ? lastProgress.weight : 70;
  const estimatedBMR = Math.round(10 * currentWeight + 6.25 * 175 - 5 * 28 + 5);
  const estimatedTDEE = Math.round(estimatedBMR * 1.55);

  const upcomingHTML = nextSession ? `
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full z-0"></div>
      <div class="z-10 relative">
        <span data-i18n="your_next_session" class="inline-block bg-tertiary-container/10 text-[#00677f] font-headline text-[10px] px-2 py-0.5 rounded uppercase tracking-wider mb-2">Your Next Session</span>
        <h3 class="font-headline font-bold text-lg text-slate-800">${nextSession.type}</h3>
        <p class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">schedule</span> ${nextSession.time} | ${nextSession.date}
        </p>
        <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">location_on</span> ${nextSession.location}
        </p>
      </div>
      <button onclick="window.openSessionDetailModal('${nextSession.id}')" data-i18n="checkin_attendance" class="mt-6 w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-headline text-xs font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">location_on</span> Check-in Attendance
      </button>
    </article>
  ` : `
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
      <span class="material-symbols-outlined text-[48px] text-slate-300">event_busy</span>
      <p data-i18n="no_upcoming_confirmed" class="text-sm font-semibold text-slate-500 mt-2">No upcoming confirmed sessions</p>
      <button onclick="window.navigateTo('booking')" data-i18n="book_new_session" class="mt-4 bg-primary text-white text-xs font-bold font-headline px-4 py-2.5 rounded-lg">Book New Session</button>
    </article>
  `;

  const workoutPreviewHTML = program ? `
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 z-0"></div>
      <div class="flex justify-between items-start z-10 relative mb-4">
        <div>
          <span class="inline-block bg-[#eff4ff] text-[#00677f] font-headline text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">SCHEDULED</span>
          <h2 class="font-headline font-bold text-xl text-[#0b1c30] mt-1.5">${program.focus}</h2>
          <p class="text-xs text-slate-500 mt-1">${program.mesocycle}</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-[#f8f9ff] flex items-center justify-center text-primary">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">fitness_center</span>
        </div>
      </div>
      
      <div class="flex flex-col gap-2 z-10 relative">
        ${program.exercises.slice(0, 3).map(ex => `
          <div class="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-xs">
            <span class="font-medium text-slate-800">${ex.name}</span>
            <span class="text-slate-400 font-semibold">${ex.sets} sets x ${ex.reps} reps</span>
          </div>
        `).join('')}
      </div>
      
      <button onclick="window.navigateTo('workout')" data-i18n="start_workout" class="mt-6 w-full bg-primary text-white font-headline text-xs font-bold py-3.5 rounded-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 z-10 relative">
        Start Workout <span class="material-symbols-outlined text-[16px]">play_arrow</span>
      </button>
    </article>
  ` : '';

  container.innerHTML = `
    <!-- Top greeting and Red Flags -->
    <div class="flex flex-col gap-4">
      <div>
        <h1 id="welcome-heading" data-i18n="welcome_back" class="text-3xl font-headline font-extrabold text-[#0b1c30]">Welcome back, ${client.name}!</h1>
        <p data-i18n="ready_to_crush" class="text-sm text-slate-500 mt-1">Ready to crush it today?</p>
      </div>
      
      ${client.assessment.hasInjury ? `
        <div class="bg-error-container text-error rounded-xl p-4 flex gap-3 border border-red-200 shadow-sm">
          <span class="material-symbols-outlined text-[20px] shrink-0">warning</span>
          <div>
            <h4 class="text-xs font-headline font-bold">Medical Injury Warning (Red Flag)</h4>
            <p class="text-xs mt-0.5">${client.assessment.injuryNotes}</p>
          </div>
        </div>
      ` : ''}
    </div>
    <!-- Gamification Widget -->
    <article class="bg-gradient-to-r from-[#00677f] to-primary rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 text-white shadow-md">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shrink-0">
          <span class="material-symbols-outlined text-[32px] text-yellow-300" style="font-variation-settings: 'FILL' 1;">military_tech</span>
        </div>
        <div class="flex-grow w-full md:w-auto">
          <h3 class="text-[10px] font-bold uppercase tracking-wider text-white/80">Current Rank</h3>
          <div class="text-xl font-headline font-extrabold flex items-baseline gap-2">
            Elite Spartan <span class="text-xs font-medium text-white/70">Level 12</span>
          </div>
          <div class="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
             <div class="h-full bg-yellow-400 rounded-full" style="width: 75%"></div>
          </div>
          <p class="text-[9px] mt-1 text-white/70">450 pts to next rank</p>
        </div>
      </div>
      <div class="flex gap-2 shrink-0">
        <div class="bg-white/10 rounded-lg px-3 py-2 text-center border border-white/20 backdrop-blur-sm min-w-[70px]">
          <span class="material-symbols-outlined text-yellow-300 text-[18px]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
          <div class="text-sm font-bold mt-0.5">14 Day</div>
          <div class="text-[8px] uppercase">Streak</div>
        </div>
        <div class="bg-white/10 rounded-lg px-3 py-2 text-center border border-white/20 backdrop-blur-sm min-w-[70px]">
          <span class="material-symbols-outlined text-green-300 text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
          <div class="text-sm font-bold mt-0.5">1,250</div>
          <div class="text-[8px] uppercase">Total Pts</div>
        </div>
      </div>
    </article>

    <!-- Package Session Quota Widget -->
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
      <div class="flex-1 w-full">
        <h3 data-i18n="active_package" class="text-xs font-headline font-bold text-slate-400 uppercase tracking-wider">ACTIVE PACKAGE</h3>
        <h2 class="text-lg font-headline font-bold text-slate-800 mt-1">${client.package.name}</h2>
        <div class="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden relative">
          <div class="h-full bg-primary rounded-full" style="width: ${pct}%"></div>
        </div>
        <p id="remaining-quota" class="text-xs text-slate-500 mt-2 font-medium">Remaining Session Quota: <span class="text-primary font-bold">${pkgRemaining}</span> of ${pkgTotal} Sessions</p>
      </div>
      <div class="shrink-0 flex flex-wrap gap-2.5 w-full md:w-auto">
        <button onclick="window.openBuyPackageModal()" data-i18n="buy_package" class="flex-1 md:flex-initial bg-primary text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg whitespace-nowrap hover:bg-[#8f3200] transition-colors shadow-sm">
          Buy Package
        </button>
        <button onclick="window.navigateTo('booking')" data-i18n="book_schedule" class="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-headline px-5 py-3.5 rounded-lg whitespace-nowrap border border-slate-200">
          Book Schedule
        </button>
        <button onclick="window.navigateTo('chat')" data-i18n="chat_trainer" class="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-headline px-5 py-3.5 rounded-lg whitespace-nowrap border border-slate-200">
          Chat Trainer
        </button>
      </div>
    </article>

    <!-- Today's Schedule & Program Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${upcomingHTML}
      ${workoutPreviewHTML}
    </div>

    <!-- Bento Grid section for Habits & Nutrition calculator -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Habits Tracker Widget -->
      <div class="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
        <h3 class="font-headline font-bold text-xs text-slate-400 uppercase tracking-wider">Daily Habits</h3>
        
        <div class="flex flex-col gap-3">
          <!-- Water -->
          <div class="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 text-xs">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-[20px]">water_drop</span>
              <div>
                <span class="font-bold block text-slate-800">Water Intake</span>
                <span class="text-[10px] text-slate-400">Target: ${habits.water.target} L | Actual: ${habits.water.current} L</span>
              </div>
            </div>
            <button onclick="window.adjustHabit('water', 0.25)" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold hover:bg-primary hover:text-white transition-colors">+</button>
          </div>

          <!-- Sleep -->
          <div class="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 text-xs">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-[20px]">bedtime</span>
              <div>
                <span class="font-bold block text-slate-800">Sleep Duration</span>
                <span class="text-[10px] text-slate-400">Target: ${habits.sleep.target} hrs | Actual: ${habits.sleep.current} hrs</span>
              </div>
            </div>
            <button onclick="window.adjustHabit('sleep', 0.5)" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold hover:bg-primary hover:text-white transition-colors">+</button>
          </div>

          <!-- Steps -->
          <div class="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 text-xs">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-[20px]">directions_run</span>
              <div>
                <span class="font-bold block text-slate-800">Daily Steps</span>
                <span class="text-[10px] text-slate-400">Target: ${habits.steps.target} | Actual: ${habits.steps.current}</span>
              </div>
            </div>
            <button onclick="window.adjustHabit('steps', 1000)" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold hover:bg-primary hover:text-white transition-colors">+</button>
          </div>
        </div>
      </div>

      <!-- Basic Nutrition Target Calculator -->
      <div class="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <h3 class="font-headline font-bold text-xs text-slate-400 uppercase tracking-wider">Daily Nutrition & Calorie Calculator (TDEE)</h3>
          <span class="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase font-headline">${client.assessment.postural.focus.includes('Fat Loss') ? 'Calorie Deficit' : 'Calorie Surplus'}</span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
            <span class="text-[9px] text-slate-400 block font-bold uppercase">BMR (Resting Metabolism)</span>
            <span class="text-xl font-headline font-extrabold text-[#0b1c30] mt-1 block">${estimatedBMR.toLocaleString('en-US')} <span class="text-[10px] font-body font-normal text-slate-500">kcal</span></span>
          </div>
          <div class="bg-primary/5 border border-primary/10 p-4 rounded-xl text-center">
            <span class="text-[9px] text-primary block font-bold uppercase">TDEE (Calorie Needs)</span>
            <span class="text-xl font-headline font-extrabold text-primary mt-1 block">${estimatedTDEE.toLocaleString('en-US')} <span class="text-[10px] font-body font-normal text-primary">kcal</span></span>
          </div>
        </div>
        
        <div class="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
          <span class="text-[10px] text-slate-500">Calculated from latest weight (${currentWeight} kg)</span>
          <button onclick="window.navigateTo('progress')" class="font-bold text-primary hover:underline flex items-center gap-1 text-[11px]">
            Progress Details <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Coach Info Card -->
    <article onclick="window.navigateTo('chat')" class="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer shadow-sm mt-6">
      <div class="flex items-center gap-4">
        <div class="relative">
          <img class="w-12 h-12 rounded-full object-cover border" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80" alt="Trainer">
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <h4 id="message-coach" class="font-headline font-bold text-xs text-slate-800">Message Coach ${client.coach?.name || 'Coach'}</h4>
          <span data-i18n="typically_replies" class="text-[10px] text-slate-400">Typically replies in 1 hr</span>
        </div>
      </div>
      <button class="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-colors shrink-0">
        <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
      </button>
    </article>
  `;

  // Apply dynamic translations for interpolated strings and translate static keys
  if (typeof window !== 'undefined' && window.t) {
    const welcomeEl = document.getElementById('welcome-heading');
    if (welcomeEl) welcomeEl.innerHTML = window.t('welcome_back', { name: client.name });

    const remEl = document.getElementById('remaining-quota');
    if (remEl) remEl.innerHTML = window.t('remaining_session_quota', { remaining: pkgRemaining, total: pkgTotal });

    const coachEl = document.getElementById('message-coach');
    if (coachEl) coachEl.innerHTML = window.t('message_coach', { name: client.coach?.name || 'Coach' });

    if (window.translateDOM) window.translateDOM();
  }
}
