import {
  getActiveClient,
  setActiveClient,
  getClients,
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
} from './state.js';

// Redirect to login if not logged in
if (localStorage.getItem('elite_pt_role') !== 'client') {
  window.location.href = './login.html';
}

// Global Variables
let activeTab = 'home';
let activeWorkoutSubTab = 'active';
let chartInstance = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  
  // Hash Routing
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  };
  window.addEventListener('hashchange', handleHash);
  handleHash();
});

window.navigateTo = function(tab) {
  activeTab = tab;
  window.location.hash = `#${tab}`;
  updateNavIndicators();
  renderView();
};

function setupUserHeader() {
  const client = getActiveClient();
  const avatar = client.avatar;
  const name = client.name;
  
  const userAvatarEl = document.getElementById('user-avatar');
  const userAvatarElMobile = document.getElementById('user-avatar-mobile');
  const userNameEl = document.getElementById('user-name');
  
  if (userAvatarEl) userAvatarEl.src = avatar;
  if (userAvatarElMobile) userAvatarElMobile.src = avatar;
  if (userNameEl) userNameEl.textContent = name;
}

window.handleLogout = function() {
  localStorage.removeItem('elite_pt_role');
  localStorage.removeItem('elite_pt_client_id');
  window.location.href = './login.html';
};

function updateNavIndicators() {
  const tabs = ['home', 'workout', 'progress', 'booking', 'chat'];
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

function renderView() {
  const container = document.getElementById('view-container');
  if (!container) return;
  
  const client = getActiveClient();
  
  if (activeTab === 'home') {
    renderHomeView(container, client);
  } else if (activeTab === 'workout') {
    renderWorkoutView(container, client);
  } else if (activeTab === 'progress') {
    renderProgressView(container, client);
  } else if (activeTab === 'booking') {
    renderBookingView(container, client);
  } else if (activeTab === 'chat') {
    renderChatView(container, client);
  }
}

// ----------------------------------------------------
// 1. TODAY / HOME VIEW (matching specs & screenshots)
// ----------------------------------------------------
function renderHomeView(container, client) {
  const schedule = getSchedule().filter(s => s.clientId === client.id);
  const nextSession = schedule.find(s => !s.validated && s.status === 'Confirmed') || schedule[0];
  
  const pkgRemaining = client.package.remaining;
  const pkgTotal = client.package.total;
  const pct = (pkgRemaining / pkgTotal) * 100;
  const program = getPrograms()[client.id];
  const habits = client.habits;

  // BMR & TDEE dynamic calculation based on latest weight log
  const lastProgress = client.bodyProgress && client.bodyProgress.length > 0 ? client.bodyProgress[client.bodyProgress.length - 1] : null;
  const currentWeight = lastProgress ? lastProgress.weight : 70;
  const estimatedBMR = Math.round(10 * currentWeight + 6.25 * 175 - 5 * 28 + 5);
  const estimatedTDEE = Math.round(estimatedBMR * 1.55);

  // Upcomming session card styled as requested
  const upcomingHTML = nextSession ? `
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full z-0"></div>
      <div class="z-10 relative">
        <span class="inline-block bg-tertiary-container/10 text-[#00677f] font-headline text-[10px] px-2 py-0.5 rounded uppercase tracking-wider mb-2">Your Next Session</span>
        <h3 class="font-headline font-bold text-lg text-slate-800">${nextSession.type}</h3>
        <p class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">schedule</span> ${nextSession.time} | ${nextSession.date}
        </p>
        <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">location_on</span> ${nextSession.location}
        </p>
      </div>
      <button onclick="openSessionDetailModal('${nextSession.id}')" class="mt-6 w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-headline text-xs font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">location_on</span> Check-in Attendance
      </button>
    </article>
  ` : `
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
      <span class="material-symbols-outlined text-[48px] text-slate-300">event_busy</span>
      <p class="text-sm font-semibold text-slate-500 mt-2">No upcoming confirmed sessions</p>
      <button onclick="navigateTo('booking')" class="mt-4 bg-primary text-white text-xs font-bold font-headline px-4 py-2.5 rounded-lg">Book New Session</button>
    </article>
  `;

  // Workout Program preview
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
      
      <button onclick="navigateTo('workout')" class="mt-6 w-full bg-primary text-white font-headline text-xs font-bold py-3.5 rounded-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 z-10 relative">
        Start Workout <span class="material-symbols-outlined text-[16px]">play_arrow</span>
      </button>
    </article>
  ` : '';

  container.innerHTML = `
    <!-- Top greeting and Red Flags -->
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-3xl font-headline font-extrabold text-[#0b1c30]">Welcome back, ${client.name}!</h1>
        <p class="text-sm text-slate-500 mt-1">Ready to crush it today?</p>
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

    <!-- Package Session Quota Widget -->
    <article class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
      <div class="flex-1 w-full">
        <h3 class="text-xs font-headline font-bold text-slate-400 uppercase tracking-wider">ACTIVE PACKAGE</h3>
        <h2 class="text-lg font-headline font-bold text-slate-800 mt-1">${client.package.name}</h2>
        <div class="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden relative">
          <div class="h-full bg-primary rounded-full" style="width: ${pct}%"></div>
        </div>
        <p class="text-xs text-slate-500 mt-2 font-medium">Remaining Session Quota: <span class="text-primary font-bold">${pkgRemaining}</span> of ${pkgTotal} Sessions</p>
      </div>
      <div class="shrink-0 flex flex-wrap gap-2.5 w-full md:w-auto">
        <button onclick="window.openBuyPackageModal()" class="flex-1 md:flex-initial bg-primary text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg whitespace-nowrap hover:bg-[#8f3200] transition-colors shadow-sm">
          Buy Package
        </button>
        <button onclick="navigateTo('booking')" class="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-headline px-5 py-3.5 rounded-lg whitespace-nowrap border border-slate-200">
          Book Schedule
        </button>
        <button onclick="navigateTo('chat')" class="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-headline px-5 py-3.5 rounded-lg whitespace-nowrap border border-slate-200">
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
      
      <!-- Habits Tracker Widget (Left on Desktop) -->
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
            <button onclick="adjustHabit('water', 0.25)" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold hover:bg-primary hover:text-white transition-colors">+</button>
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
            <button onclick="adjustHabit('sleep', 0.5)" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold hover:bg-primary hover:text-white transition-colors">+</button>
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
            <button onclick="adjustHabit('steps', 1000)" class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold hover:bg-primary hover:text-white transition-colors">+</button>
          </div>
        </div>
      </div>

      <!-- Basic Nutrition Target Calculator (Right on Desktop) -->
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
          <button onclick="navigateTo('progress')" class="font-bold text-primary hover:underline flex items-center gap-1 text-[11px]">
            Progress Details <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Coach Info Card -->
    <article onclick="navigateTo('chat')" class="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer shadow-sm">
      <div class="flex items-center gap-4">
        <div class="relative">
          <img class="w-12 h-12 rounded-full object-cover border" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80" alt="Trainer">
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <h4 class="font-headline font-bold text-xs text-slate-800">Message Coach Bobby</h4>
          <span class="text-[10px] text-slate-400">Typically replies in 1 hr</span>
        </div>
      </div>
      <button class="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-colors shrink-0">
        <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
      </button>
    </article>
  `;
}

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
  showToast(`Successfully added ${habitKey === 'water' ? 'water (+0.25L)' : habitKey === 'sleep' ? 'sleep (+0.5 hrs)' : 'steps (+1,000 steps)'}!`, 'success');
};

// ----------------------------------------------------
// 2. WORKOUT VIEW / PROGRAM LATIHAN (matching specs)
// ----------------------------------------------------
function renderWorkoutView(container, client) {
  const program = getPrograms()[client.id];
  
  if (!program) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-xl border border-slate-200">
        <span class="material-symbols-outlined text-[48px] text-slate-300">fitness_center</span>
        <h2 class="text-lg font-headline font-bold text-slate-800 mt-2">No active program</h2>
        <p class="text-xs text-slate-500 mt-1">Contact your Personal Trainer to create a workout program.</p>
      </div>
    `;
    return;
  }

  const completedCount = program.exercises.filter(ex => ex.completed).length;
  const totalCount = program.exercises.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  container.innerHTML = `
    <!-- Top header with toggle tabs -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]">Workout Program</h1>
          <p class="text-xs text-slate-500 mt-1">Complete your scheduled workout checklist or track your lifting history.</p>
        </div>
        
        <!-- Tab selector -->
        <div class="flex bg-slate-100 p-1 rounded-lg self-stretch sm:self-auto">
          <button onclick="window.switchWorkoutSubTab('active')" class="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-bold rounded-md transition-all ${activeWorkoutSubTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            Active Program
          </button>
          <button onclick="window.switchWorkoutSubTab('history')" class="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-bold rounded-md transition-all ${activeWorkoutSubTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            Session History
          </button>
        </div>
      </div>
    </div>
  `;

  if (activeWorkoutSubTab === 'active') {
    container.innerHTML += `
      <!-- Latihan Progress Tracker Box -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div class="flex-grow w-full">
          <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>TODAY'S WORKOUT PROGRESS</span>
            <span>${completedCount} / ${totalCount} Completed</span>
          </div>
          <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>
        <span class="text-xs font-bold font-headline bg-[#eff4ff] text-primary px-3 py-1.5 rounded-lg shrink-0">${program.focus}</span>
      </div>

      <!-- Exercises checklist box -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 mt-6">
        <div class="flex flex-col gap-4" id="exercises-list">
          ${program.exercises.map((ex, index) => {
            const isDone = ex.completed;
            return `
              <div class="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all ${isDone ? 'bg-slate-50 opacity-75' : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]'}">
                <div class="flex items-center gap-3">
                  <button onclick="toggleExerciseCheck('${ex.id}')" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${isDone ? 'bg-primary border-primary text-white' : 'border-slate-300 text-transparent hover:border-primary'}">
                    <span class="material-symbols-outlined text-[16px] font-bold">check</span>
                  </button>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-headline font-bold text-sm text-slate-800 ${isDone ? 'line-through text-slate-400' : ''}">${ex.name}</h4>
                      <button onclick="window.openExerciseGuideModal('${ex.id}')" class="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 rounded transition-all">
                        <span class="material-symbols-outlined text-[13px]">smart_display</span> Visual Guide
                      </button>
                    </div>
                    
                    <!-- Target columns layout with exact names -->
                    <div class="grid grid-cols-4 gap-4 text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                      <div>Sets: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.sets}</span></div>
                      <div>Reps: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.reps}</span></div>
                      <div>Target Wt: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.weight} kg</span></div>
                      <div>Rest: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.rest}s</span></div>
                    </div>

                    ${ex.actual.length ? `
                      <p class="text-xs text-primary font-medium mt-2">
                        Actual: ${ex.actual.map(set => `${set.weight}kg x ${set.reps}r`).join(', ')}
                      </p>
                    ` : ''}
                  </div>
                </div>
                
                <div class="text-right shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
                  <span class="text-[9px] text-slate-400 block uppercase font-bold">Previous Wt</span>
                  <span class="text-xs font-semibold text-slate-600 font-headline">${ex.history ? `${ex.history.weight} kg x ${ex.history.reps}` : '10 kg x 10'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <button onclick="finishWorkout()" class="mt-6 w-full bg-primary text-white font-headline text-xs font-bold py-4 rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">done_all</span> COMPLETE TODAY'S WORKOUT CHECK-IN
        </button>
      </div>
    `;
  } else {
    // Render Workout History Log List
    const historyHTML = (client.workoutHistory && client.workoutHistory.length > 0)
      ? client.workoutHistory.map(h => `
        <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-3">
          <div class="flex justify-between items-center border-b border-slate-100 pb-2">
            <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[16px]">fitness_center</span>
              ${h.focus}
            </span>
            <span class="text-[10px] text-slate-400 font-bold font-headline">${h.date}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${h.exercises.map(ex => `
              <div class="flex justify-between items-center bg-slate-50 border border-slate-100/60 px-3 py-2.5 rounded-lg text-xs">
                <span class="font-bold text-slate-700 truncate max-w-[120px]">${ex.name}</span>
                <span class="text-primary font-bold font-headline shrink-0 bg-white border border-slate-200/60 px-2 py-0.5 rounded">${ex.weight} kg x ${ex.reps} r</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')
      : `
        <div class="text-center py-12 bg-white rounded-xl border border-slate-200">
          <span class="material-symbols-outlined text-[48px] text-slate-300">history</span>
          <h2 class="text-lg font-headline font-bold text-slate-800 mt-2">No workout history yet</h2>
          <p class="text-xs text-slate-500 mt-1">Complete your first workout session to log your history.</p>
        </div>
      `;

    container.innerHTML += `
      <div class="flex flex-col gap-4 mt-6">
        ${historyHTML}
      </div>
    `;
  }
}

window.switchWorkoutSubTab = function(subTab) {
  activeWorkoutSubTab = subTab;
  renderView();
};

window.toggleExerciseCheck = function(exId) {
  const client = getActiveClient();
  const program = getPrograms()[client.id];
  const ex = program.exercises.find(e => e.id === exId);
  if (!ex) return;

  if (ex.completed) {
    ex.completed = false;
    ex.actual = [];
    updateProgram(client.id, program);
    renderView();
  } else {
    openWorkoutLogModal(exId);
  }
};

function openWorkoutLogModal(exId) {
  const client = getActiveClient();
  const program = getPrograms()[client.id];
  const ex = program.exercises.find(e => e.id === exId);
  if (!ex) return;

  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Log Workout Performance</h2>
        <p class="text-xs text-slate-500 mb-4">Record the actual reps and weight you lifted for each set.</p>
        
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-600 mb-1">Exercise: <span class="text-primary font-headline">${ex.name}</span></label>
          <div class="text-[10px] text-slate-400">PT Target: ${ex.sets} Sets x ${ex.reps} Reps | ${ex.weight} kg</div>
        </div>

        <form id="workout-log-form" class="space-y-3">
          <div class="max-h-48 overflow-y-auto pr-1 space-y-2">
            ${Array.from({ length: ex.sets }).map((_, i) => `
              <div class="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                <span class="font-bold text-slate-500 w-10">Set ${i+1}</span>
                <div class="flex-grow grid grid-cols-2 gap-2">
                  <div class="flex items-center gap-1.5">
                    <input type="number" step="0.5" placeholder="Weight" value="${ex.weight}" class="w-full bg-white border border-slate-200 rounded py-1 px-1.5 text-center text-xs font-semibold focus:border-primary focus:ring-0 outline-none" required data-weight-set="${i}">
                    <span class="text-[10px] text-slate-400 shrink-0">kg</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <input type="number" placeholder="Reps" value="${ex.reps}" class="w-full bg-white border border-slate-200 rounded py-1 px-1.5 text-center text-xs font-semibold focus:border-primary focus:ring-0 outline-none" required data-reps-set="${i}">
                    <span class="text-[10px] text-slate-400 shrink-0">reps</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save & Continue</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('workout-log-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const actual = [];
    for (let i = 0; i < ex.sets; i++) {
      const weight = parseFloat(document.querySelector(`[data-weight-set="${i}"]`).value);
      const reps = parseInt(document.querySelector(`[data-reps-set="${i}"]`).value);
      actual.push({ weight, reps });
    }
    ex.completed = true;
    ex.actual = actual;
    updateProgram(client.id, program);
    closeModal();
    renderView();
    showToast('Workout log saved successfully!', 'success');
  });
}

window.finishWorkout = function() {
  const client = getActiveClient();
  const program = getPrograms()[client.id];
  const pending = program.exercises.filter(ex => !ex.completed);
  
  if (pending.length > 0) {
    if (!confirm('You have unchecked exercises remaining. Are you sure you want to finish this session?')) {
      return;
    }
  }

  // Save completed session details to history logs
  const completedExercises = program.exercises.map(ex => ({
    name: ex.name,
    weight: ex.weight,
    reps: ex.reps
  }));
  if (!client.workoutHistory) client.workoutHistory = [];
  client.workoutHistory.unshift({
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    focus: program.focus,
    exercises: completedExercises
  });

  const schedule = getSchedule().filter(s => s.clientId === client.id && s.date === new Date().toISOString().split('T')[0]);
  const activeSched = schedule.find(s => !s.validated);
  
  if (activeSched) {
    validateSession(activeSched.id);
    showToast('Workout completed! Remaining package sessions updated.', 'success');
  } else {
    if (client.package.remaining > 0) {
      client.package.remaining--;
      saveState();
      showToast('Self workout completed! Session package updated.', 'success');
    } else {
      showToast('Workout completed! (Session quota exhausted)', 'info');
    }
  }

  program.exercises.forEach(ex => {
    ex.completed = false;
  });
  updateProgram(client.id, program);
  saveState();
  navigateTo('home');
};

// ----------------------------------------------------
// 3. PROGRESS TRACKER VIEW (matching specs)
// ----------------------------------------------------
function renderProgressView(container, client) {
  const lastProgress = client.bodyProgress[client.bodyProgress.length - 1];

  container.innerHTML = `
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]">Physical Progress Chart</h1>
        <p class="text-xs text-slate-500 mt-1">Track your body composition progress week by week.</p>
      </div>
      <button onclick="openAddProgressModal()" class="bg-primary text-white text-xs font-bold font-headline px-4 py-3 rounded-lg flex items-center gap-1.5 shadow-md hover:bg-primary-container transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span> Log New Metrics
      </button>
    </div>

    <!-- Weight highlight card -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm border-l-4 border-l-primary max-w-sm">
      <span class="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Latest Body Weight</span>
      <span class="text-2xl font-headline font-extrabold text-[#0b1c30] mt-1 block">${lastProgress.weight} kg</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Chart Card -->
      <div class="lg:col-span-8 flex flex-col gap-6">
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 class="font-headline font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">show_chart</span>
            Body Weight & Body Fat % Trend
          </h3>
          <div class="h-64 md:h-80 w-full relative">
            <canvas id="progress-chart" class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Metric logs listing -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 class="font-headline font-bold text-sm text-slate-800 mb-4">Metrics History Log</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-100 text-slate-400 font-bold uppercase bg-slate-50/50">
                  <th class="py-3 px-3">Date</th>
                  <th class="py-3 px-3 text-right">Weight</th>
                  <th class="py-3 px-3 text-right">Body Fat %</th>
                  <th class="py-3 px-3 text-right">Muscle Mass</th>
                  <th class="py-3 px-3 text-right">Waist Size</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-slate-700">
                ${[...client.bodyProgress].reverse().map(log => `
                  <tr>
                    <td class="py-3 px-3 font-medium">${log.date}</td>
                    <td class="py-3 px-3 text-right font-semibold font-headline text-slate-800">${log.weight} kg</td>
                    <td class="py-3 px-3 text-right">${log.bodyFat} %</td>
                    <td class="py-3 px-3 text-right text-slate-500">${log.muscleMass} kg</td>
                    <td class="py-3 px-3 text-right text-slate-500">${log.waist} cm</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Photos Gallery -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-slate-800">Body Photo Timeline</h3>
          <div class="grid grid-cols-2 gap-4">
            ${client.photos.map(p => `
              <div class="flex flex-col gap-1 border border-slate-100 rounded-lg p-2 bg-slate-50">
                <img class="w-full h-36 object-cover rounded shadow-sm" src="${p.url}" alt="${p.type}">
                <div class="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span class="font-bold uppercase tracking-wider text-primary">${p.type}</span>
                  <span>${p.date}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>

    </div>

    <!-- Floating Action Button for Adding Data (Stitch spec) -->
    <div class="fixed bottom-20 right-6 md:bottom-10 md:right-10 z-40">
      <button onclick="openAddProgressModal()" class="bg-primary text-white hover:bg-[#8f3200] font-headline text-xs font-bold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-1.5 transition-transform active:scale-95 duration-100">
        <span class="material-symbols-outlined text-[18px]">add</span> Add Data
      </button>
    </div>
  `;

  setTimeout(() => {
    drawProgressChart(client);
  }, 100);
}

window.openAddProgressModal = function() {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Add Progress Log</h2>
        <p class="text-xs text-slate-500 mb-4">Record your periodic body metrics to monitor your transformation.</p>
        
        <form id="progress-log-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Body Weight (kg)</label>
              <input type="number" step="0.1" required id="log-weight" placeholder="e.g. 82.5" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Body Fat (%)</label>
              <input type="number" step="0.1" required id="log-fat" placeholder="e.g. 19.2" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Muscle Mass (kg)</label>
              <input type="number" step="0.1" required id="log-muscle" placeholder="e.g. 39.5" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Waist Size (cm)</label>
              <input type="number" required id="log-waist" placeholder="e.g. 88" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Upload Progress Photo (Optional)</label>
            <input type="file" id="log-photo-file" accept="image/*" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-primary focus:ring-0">
          </div>

          <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Progress</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('progress-log-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('log-photo-file');
    const file = fileInput.files[0];

    const saveProgressData = (photoDataUrl) => {
      const client = getActiveClient();
      const weight = parseFloat(document.getElementById('log-weight').value);
      const fat = parseFloat(document.getElementById('log-fat').value);
      const muscle = parseFloat(document.getElementById('log-muscle').value);
      const waist = parseInt(document.getElementById('log-waist').value);

      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      
      client.bodyProgress.push({
        date: dateStr,
        weight,
        bodyFat: fat,
        muscleMass: muscle,
        waist
      });

      if (photoDataUrl) {
        client.photos.push({
          date: dateStr,
          type: 'after',
          url: photoDataUrl
        });
      }

      saveState();
      closeModal();
      renderView();
      showToast('Progress log saved successfully!', 'success');
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        saveProgressData(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      saveProgressData(null);
    }
  });
}

// ----------------------------------------------------
// 4. BOOKING CALENDAR VIEW (matching specs)
// ----------------------------------------------------
function renderBookingView(container, client) {
  const schedule = getSchedule().filter(s => s.clientId === client.id);
  
  // Available slots for the day
  const defaultSlots = [
    { time: '08:00', type: 'Free Weights (Gym)' },
    { time: '10:00', type: 'Studio Class' },
    { time: '13:00', type: 'Free Weights (Gym)' },
    { time: '15:30', type: 'Online Streaming' },
    { time: '17:00', type: 'Studio Class' }
  ];

  if (!container.dataset.selectedDate) {
    container.dataset.selectedDate = new Date().toISOString().split('T')[0];
  }
  const selectedDate = container.dataset.selectedDate;

  // Render HTML structure
  container.innerHTML = `
    <div>
      <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]">Schedule Booking</h1>
      <p class="text-xs text-slate-500 mt-1">Book in-person personal training or virtual sessions.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: Calendar Picker & Available Slots -->
      <div class="lg:col-span-7 flex flex-col gap-6">
        
        <!-- Calendar Date Selector Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-headline font-bold text-sm text-slate-800">Select Training Date</h3>
            <span class="text-xs font-bold text-slate-400 uppercase">July 2026</span>
          </div>
          
          <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-2 text-slate-400 uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="grid grid-cols-7 gap-2 text-center text-xs mt-3">
            ${Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              
              const slotDate = new Date();
              slotDate.setDate(dayNum);
              const slotDateIso = slotDate.toISOString().split('T')[0];
              const isSelected = slotDateIso === selectedDate;
              
              const todayIso = new Date().toISOString().split('T')[0];
              const isPast = slotDateIso < todayIso;

              let btnClass = "";
              if (isSelected) {
                btnClass = "bg-primary text-white border-primary font-bold shadow-sm";
              } else if (isPast) {
                btnClass = "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50";
              } else {
                btnClass = "border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-primary/20";
              }

              return `
                <button ${isPast ? 'disabled' : ''} onclick="window.selectBookingDate(${dayNum})" class="py-2.5 rounded-lg border transition-all ${btnClass}" id="cal-day-${dayNum}">
                  ${dayNum}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Time Slots Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="font-headline font-bold text-sm text-[#0b1c30]">Available Time Slots</h3>
            <span class="text-xs font-semibold text-primary font-headline" id="booking-selected-date">
              ${new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div class="flex flex-col gap-3" id="slots-container">
            ${defaultSlots.map(slot => {
              const isBooked = getSchedule().some(s => s.date === selectedDate && s.time === slot.time);
              
              if (isBooked) {
                return `
                  <div class="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-100 opacity-60">
                    <div>
                      <span class="text-xs font-bold text-slate-400 block">${slot.time}</span>
                      <span class="text-[10px] text-slate-400 mt-0.5 block">Slot Fully Booked</span>
                    </div>
                    <button class="bg-slate-200 text-slate-400 text-xs font-bold font-headline py-2 px-4 rounded-lg cursor-not-allowed" disabled>Fully Booked</button>
                  </div>
                `;
              }
              
              return `
                <div class="border border-slate-100 hover:border-primary/20 rounded-xl p-4 flex justify-between items-center bg-slate-50/50 transition-all">
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">${slot.time}</span>
                    <span class="text-[10px] text-slate-500 mt-0.5 block flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00677f]"></span> ${slot.type}</span>
                  </div>
                  <button onclick="window.confirmBookingSlot('${selectedDate}', '${slot.time}')" class="bg-primary hover:bg-[#8f3200] text-white text-xs font-bold font-headline py-2 px-4 rounded-lg transition-colors shadow-sm">Book Session</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Right Column: My Bookings Section -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary">calendar_today</span>
            My Booked Sessions
          </h3>

          <div class="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
            ${schedule.length > 0 ? schedule.map(s => {
              const isConfirmed = s.status === 'Confirmed';
              return `
                <div class="border border-slate-100 rounded-xl p-4 flex flex-col gap-3 bg-slate-50/50 relative">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="text-xs font-bold text-slate-800 block">${s.time}</span>
                      <span class="text-[10px] text-slate-400 block mt-0.5">${s.date}</span>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded font-headline ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                      ${isConfirmed ? 'CONFIRMED' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div class="text-[10px] text-slate-500 font-medium">
                    <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00677f]"></span> Type: ${s.type}</div>
                    <div class="flex items-center gap-1 mt-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00677f]"></span> Location: ${s.location}</div>
                  </div>

                  ${!isConfirmed ? `
                    <button onclick="window.cancelBookingSlot('${s.id}')" class="w-full text-center border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold py-1.5 rounded transition-all mt-1">
                      Cancel Booking
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('') : `
              <div class="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
                <span class="material-symbols-outlined text-[32px]">event_busy</span>
                <span class="text-xs font-medium">No training sessions booked yet.</span>
              </div>
            `}
          </div>
        </section>
      </div>

    </div>
  `;
}

window.selectBookingDate = function(dayNum) {
  const container = document.getElementById('view-container');
  const d = new Date();
  d.setDate(dayNum);
  const dateIso = d.toISOString().split('T')[0];
  
  // Update state and render again
  container.dataset.selectedDate = dateIso;
  renderView();
  
  showToast(`Showing schedule for ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`, 'info');
};

window.confirmBookingSlot = function(date, time) {
  const client = getActiveClient();
  const pkgRemaining = client.package.remaining;

  if (pkgRemaining <= 0) {
    showToast('Booking failed! Your session package quota is empty. Please buy a new package.', 'error');
    return;
  }

  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Confirm Booking</h2>
        <p class="text-xs text-slate-500 mb-4">Your session will be deducted from your package quota after check-in.</p>
        
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5 text-xs mb-6">
          <div class="flex justify-between"><span class="text-slate-500">Date:</span><span class="font-bold text-slate-800">${date}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Time:</span><span class="font-bold text-slate-800">${time}</span></div>
          
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Select Location & Session Type</label>
            <select id="booking-type-select" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
              <option value="Free Weights (Gym)|Main Gym Barbell Area">In-Person - Main Gym Area</option>
              <option value="Studio Class|Studio Class (Floor 2)">In-Person - Studio Class (Floor 2)</option>
              <option value="Online Streaming|Zoom Meeting">Virtual - Zoom Meeting</option>
            </select>
          </div>

          <div class="flex justify-between border-t border-slate-200/60 pt-2.5"><span class="text-slate-500">Estimated Deduction:</span><span class="font-bold text-primary">1 Session</span></div>
        </div>

        <div class="flex gap-3">
          <button onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onclick="const val = document.getElementById('booking-type-select').value.split('|'); window.bookSlotProcess('${date}', '${time}', val[0], val[1])" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Confirm Schedule</button>
        </div>
      </div>
    </div>
  `;
};

window.bookSlotProcess = function(date, time, type, location) {
  const client = getActiveClient();
  
  try {
    addSchedule({
      clientId: client.id,
      clientName: client.name,
      date,
      time,
      duration: 60,
      type,
      location,
      status: 'Pending'
    });

    closeModal();
    renderView(); // Render in place
    showToast('Session booked successfully! Awaiting PT confirmation.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.cancelBookingSlot = function(schedId) {
  if (!confirm('Are you sure you want to cancel this training session?')) return;
  
  // Access state schedules directly to delete the slot
  const schedules = getSchedule();
  const idx = schedules.findIndex(s => s.id === schedId);
  if (idx !== -1) {
    schedules.splice(idx, 1);
    saveState();
    renderView();
    showToast('Session booking cancelled successfully.', 'info');
  }
};

// ----------------------------------------------------
// 5. MESSAGING / CHAT VIEW
// ----------------------------------------------------
function renderChatView(container, client) {
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

    const newMsg = addMessage(client.id, 'client', text);
    textEl.value = '';
    renderChatView(container, client);

    setTimeout(() => {
      addMessage(client.id, 'trainer', 'Got it! I will check your squat form again tonight to maximize performance.');
      if (activeTab === 'chat') {
        renderChatView(container, client);
      }
    }, 1500);
  });
}

// ----------------------------------------------------
// GLOBAL HELPERS
// ----------------------------------------------------
window.openSessionDetailModal = function(schedId) {
  const sched = getSchedule().find(s => s.id === schedId);
  if (!sched) return;

  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Session Details</h2>
        <p class="text-xs text-slate-500 mb-4">Check in your attendance once you arrive at the training location.</p>
        
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs mb-6 font-medium text-slate-700">
          <div class="flex justify-between"><span class="text-slate-500">Coach:</span><span class="font-bold text-slate-800">Coach Bobby</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Date:</span><span class="font-bold text-slate-800">${sched.date}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Session Time:</span><span class="font-bold text-slate-800">${sched.time} (60 mins)</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Workout Type:</span><span class="font-bold text-[#00677f]">${sched.type}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Location:</span><span class="font-bold text-slate-800">${sched.location}</span></div>
        </div>

        <div class="flex gap-3">
          <button onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Back</button>
          <button onclick="checkInProcess('${sched.id}')" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">done</span> Check-in Attendance
          </button>
        </div>
      </div>
    </div>
  `;
};

window.checkInProcess = function(schedId) {
  validateSession(schedId);
  closeModal();
  renderView();
  showToast('Check-in successful! 1 session deducted from your package quota.', 'success');
};

window.closeModal = function() {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = '';
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

function drawProgressChart(client) {
  const ctx = document.getElementById('progress-chart');
  if (!ctx) return;

  const labels = client.bodyProgress.map(p => p.date);
  const weights = client.bodyProgress.map(p => p.weight);
  const bodyFats = client.bodyProgress.map(p => p.bodyFat);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Body Weight (kg)',
          data: weights,
          borderColor: '#a73b00',
          backgroundColor: 'rgba(167, 59, 0, 0.05)',
          borderWidth: 2.5,
          tension: 0.15,
          yAxisID: 'y'
        },
        {
          label: 'Body Fat (%)',
          data: bodyFats,
          borderColor: '#585e6f',
          backgroundColor: 'rgba(88, 94, 111, 0.05)',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.15,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Weight (kg)',
            font: { size: 10, weight: 'bold' }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: {
            display: true,
            text: 'Fat (%)',
            font: { size: 10, weight: 'bold' }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 10 } }
        }
      }
    }
  });
}

window.openBuyPackageModal = function() {
  const modalRoot = document.getElementById('modal-root');
  
  let selectedOption = { count: 10, price: 1000000, name: '10-Session Package' };

  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Buy Session Package</h2>
        <p class="text-xs text-slate-500 mb-4">Select the personal training session package you wish to purchase.</p>

        <div class="space-y-3">
          <!-- Option 1 -->
          <div onclick="window.selectBuyOption(10, 1000, '10-Session Package')" id="opt-10" class="border-2 border-primary/20 hover:border-primary rounded-xl p-4 bg-primary/5 cursor-pointer transition-all flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-slate-800 block">10-Session Package</span>
              <span class="text-[9px] text-slate-500 mt-1 block">3 Months Validity | Main Gym Area</span>
            </div>
            <span class="text-xs font-bold text-primary font-headline">S$ 1,000</span>
          </div>

          <!-- Option 2 -->
          <div onclick="window.selectBuyOption(20, 1800, '20-Session Package')" id="opt-20" class="border border-slate-100 hover:border-primary rounded-xl p-4 bg-slate-50/50 cursor-pointer transition-all flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-slate-800 block">20-Session Package</span>
              <span class="text-[9px] text-slate-500 mt-1 block">6 Months Validity | Free Studio Class</span>
            </div>
            <span class="text-xs font-bold text-primary font-headline">S$ 1,800</span>
          </div>

          <!-- Option 3 -->
          <div onclick="window.selectBuyOption(30, 2500, '30-Session Package')" id="opt-30" class="border border-slate-100 hover:border-primary rounded-xl p-4 bg-slate-50/50 cursor-pointer transition-all flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-slate-800 block">30-Session Package</span>
              <span class="text-[9px] text-slate-500 mt-1 block">12 Months Validity | Free VIP Lounge</span>
            </div>
            <span class="text-xs font-bold text-primary font-headline">S$ 2,500</span>
          </div>
        </div>

        <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onclick="closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onclick="window.processPackagePurchase()" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Confirm Payment</button>
        </div>
      </div>
    </div>
  `;

  window.selectBuyOption = function(count, price, name) {
    [10, 20, 30].forEach(c => {
      const el = document.getElementById(`opt-${c}`);
      if (el) {
        el.className = "border border-slate-100 hover:border-primary rounded-xl p-4 bg-slate-50/50 cursor-pointer transition-all flex justify-between items-center";
      }
    });

    const activeEl = document.getElementById(`opt-${count}`);
    if (activeEl) {
      activeEl.className = "border-2 border-primary/20 hover:border-primary rounded-xl p-4 bg-primary/5 cursor-pointer transition-all flex justify-between items-center";
    }

    selectedOption = { count, price, name };
  };

  window.processPackagePurchase = function() {
    const client = getActiveClient();
    
    client.package.remaining += selectedOption.count;
    client.package.total += selectedOption.count;
    client.package.name = selectedOption.name;
    
    saveState();
    closeModal();
    renderView();
    showToast(`Successfully purchased ${selectedOption.name}. Session quota increased by +${selectedOption.count}!`, 'success');
  };
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

window.openExerciseGuideModal = function(exId) {
  const client = getActiveClient();
  const program = getPrograms()[client.id];
  const ex = program ? program.exercises.find(e => e.id === exId) : null;
  if (!ex) return;

  const modalRoot = document.getElementById('modal-root');
  
  let mediaDisplay = '';
  if (ex.videoUrl) {
    if (ex.videoUrl.includes('youtube.com') || ex.videoUrl.includes('youtu.be')) {
      mediaDisplay = `<iframe class="w-full h-64 rounded-xl border border-slate-200 shadow-sm" src="${ex.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      mediaDisplay = `<video src="${ex.videoUrl}" controls class="w-full h-64 rounded-xl object-cover bg-black shadow-sm"></video>`;
    }
  } else if (ex.imageUrl) {
    mediaDisplay = `<img src="${ex.imageUrl}" class="w-full h-64 rounded-xl object-cover border border-slate-200 shadow-sm" alt="${ex.name}">`;
  } else {
    mediaDisplay = `<div class="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold">No visual media available for this exercise</div>`;
  }

  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-xl p-6 border border-slate-100 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 class="text-base font-headline font-bold text-slate-800 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
              ${ex.name}
            </h2>
            <span class="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Target: ${ex.sets} Sets x ${ex.reps} Reps (${ex.weight} kg)</span>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined text-[18px]">close</span></button>
        </div>

        <div>
          ${mediaDisplay}
        </div>

        <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <span class="material-symbols-outlined text-primary text-[16px]">info</span> Technical Guide from Coach:
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed font-medium">${ex.instructions || 'Follow the posture form above and maintain steady breathing.'}</p>
        </div>

        <button onclick="closeModal()" class="w-full bg-primary text-white text-xs font-bold font-headline py-3 rounded-xl hover:bg-[#8f3200] transition-colors shadow-sm">
          Got it, Start Workout
        </button>
      </div>
    </div>
  `;
};
