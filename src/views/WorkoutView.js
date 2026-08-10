import { getActiveClient } from '../models/ClientModel.js';
import { saveState } from '../models/Store.js';
import { getPrograms } from '../models/ProgramModel.js';
import { getSchedule } from '../models/ScheduleModel.js';
import { updateProgram } from '../models/ProgramModel.js';
import { validateSession } from '../models/ScheduleModel.js';
import { t, translateDOM } from '../i18n.js';

let activeWorkoutSubTab = 'active';

export function renderWorkoutView(container, client) {
  const program = getPrograms()[client.id];
  
  if (!program) {
    container.innerHTML = `
<div class="text-center py-12 bg-white rounded-xl border border-slate-200">
<span class="material-symbols-outlined text-[48px] text-slate-300" data-i18n="fitness_center">fitness_center</span>
<h2 class="text-lg font-headline font-bold text-slate-800 mt-2" data-i18n="workout_no_program">No active program</h2>
<p class="text-xs text-slate-500 mt-1" data-i18n="workout_no_program_sub">Contact your Personal Trainer to create a workout program.</p>
</div>
`;
    translateDOM();
    return;
  }

  const completedCount = program.exercises.filter(ex => ex.completed).length;
  const totalCount = program.exercises.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  container.innerHTML = `
    <!-- Top header with toggle tabs -->
    <div class="flex flex-col gap-5">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 data-i18n="workout_title" class="text-3xl font-headline font-extrabold text-[#0b1c30]">Workout Program</h1>
          <p data-i18n="workout_sub" class="text-sm text-slate-500 mt-1.5 font-medium">Complete your scheduled workout checklist or track your lifting history.</p>
        </div>
        
        <!-- Tab selector - Larger for better tap targets -->
        <div class="flex bg-slate-100/80 p-1.5 rounded-xl self-stretch md:self-auto w-full md:w-auto shadow-inner">
          <button onclick="window.switchWorkoutSubTab('active')" class="flex-1 md:flex-initial text-center px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeWorkoutSubTab === 'active' ? 'bg-white text-primary shadow border border-slate-200' : 'text-slate-500 hover:text-slate-800'}" data-i18n="workout_tab_active">
            Active Program
          </button>
          <button onclick="window.switchWorkoutSubTab('history')" class="flex-1 md:flex-initial text-center px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeWorkoutSubTab === 'history' ? 'bg-white text-primary shadow border border-slate-200' : 'text-slate-500 hover:text-slate-800'}" data-i18n="workout_tab_history">
            Session History
          </button>
        </div>
      </div>
    </div>
  `;

  if (activeWorkoutSubTab === 'active') {
    container.innerHTML += `
      <!-- Workout Progress Tracker Box -->
      <div class="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mt-6">
        <div class="flex-grow w-full">
          <div class="flex justify-between items-end mb-2">
            <span data-i18n="workout_progress_today" class="text-sm font-bold text-slate-500 uppercase tracking-wider">Today's Progress</span>
            <span class="text-base font-extrabold text-slate-800">${completedCount} <span class="text-slate-400 font-medium text-sm">/ ${totalCount}</span></span>
          </div>
          <div class="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden shadow-inner">
            <div class="bg-primary h-full rounded-full transition-all duration-500 relative" style="width: ${pct}%">
               ${pct > 0 ? '<div class="absolute inset-0 bg-white/20"></div>' : ''}
            </div>
          </div>
        </div>
        <div class="text-center md:text-right shrink-0 w-full md:w-auto flex flex-col items-center md:items-end">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Target Focus</span>
          <span class="text-sm font-bold font-headline bg-primary/10 text-primary px-4 py-2 rounded-xl inline-block border border-primary/20">${program.focus}</span>
        </div>
      </div>

      <!-- Exercises checklist box -->
      <div class="flex flex-col gap-5 mt-8" id="exercises-list">
        ${program.exercises.map((ex, index) => {
          const isDone = ex.completed;
          return `
            <div class="bg-white rounded-2xl border ${isDone ? 'border-primary/40 bg-primary/5' : 'border-slate-200 shadow-sm'} p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all hover:border-primary/50 relative overflow-hidden group">
              
              <!-- Checkmark / Status Toggle (Fitts's Law: Large Tap Target) -->
              <button onclick="window.toggleExerciseCheck('${ex.id}')" class="absolute left-0 top-0 bottom-0 w-16 md:w-20 flex items-center justify-center transition-colors focus:outline-none focus:bg-slate-100 ${isDone ? 'bg-primary text-white hover:bg-[#8f3200]' : 'bg-slate-50 border-r border-slate-100 text-slate-300 hover:bg-slate-100 hover:text-primary'}">
                <span class="material-symbols-outlined text-3xl font-bold">${isDone ? 'check_circle' : 'radio_button_unchecked'}</span>
              </button>
              
              <!-- Main Exercise Info -->
              <div class="ml-16 md:ml-20 flex-grow w-full">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <div>
                    <h4 class="font-headline font-extrabold text-lg text-slate-800 ${isDone ? 'line-through text-slate-500' : ''}">${ex.name}</h4>
                  </div>
                  <button onclick="window.openExerciseGuideModal('${ex.id}')" class="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-primary/20" data-i18n="btn_visual_guide">
                    <span class="material-symbols-outlined text-[16px]">smart_display</span> Visual Guide
                  </button>
                </div>
                
                <!-- Metrics Grid (Gestalt: Proximity & Similarity) -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <div class="flex flex-col">
                    <span data-i18n="label_sets" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sets</span>
                    <span class="text-slate-800 font-extrabold text-sm font-headline">${ex.sets}</span>
                  </div>
                  <div class="flex flex-col">
                    <span data-i18n="label_reps" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reps</span>
                    <span class="text-slate-800 font-extrabold text-sm font-headline">${ex.reps}</span>
                  </div>
                  <div class="flex flex-col">
                    <span data-i18n="label_target_wt" class="text-[10px] font-bold text-primary uppercase tracking-widest">Target Wt</span>
                    <span class="text-primary font-extrabold text-sm font-headline">${ex.weight} kg</span>
                  </div>
                  <div class="flex flex-col">
                    <span data-i18n="label_rest" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rest</span>
                    <span class="text-slate-800 font-extrabold text-sm font-headline flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px] text-slate-400">timer</span> ${ex.rest}s
                    </span>
                  </div>
                </div>

                <!-- History & Actual Log -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mt-3 gap-3">
                  <div class="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <span class="material-symbols-outlined text-[14px]">history</span>
                    <span data-i18n="label_previous_wt" class="uppercase font-bold tracking-wider">Prev:</span> 
                    <span class="font-bold text-slate-700">${ex.history ? `${ex.history.weight} kg x ${ex.history.reps}` : 'N/A'}</span>
                  </div>

                  ${ex.actual.length ? `
                    <div class="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[14px]">done_all</span>
                      <span data-i18n="label_actual">Actual:</span> 
                      <span>${ex.actual.map(set => `${set.weight}kg x ${set.reps}r`).join(', ')}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <button class="mt-8 w-full bg-primary text-white font-headline text-sm font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-[#8f3200] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-primary/30 outline-none" data-i18n="btn_complete_workout" onclick="window.finishWorkout()">
        <span class="material-symbols-outlined text-xl" data-i18n="task_alt">task_alt</span> COMPLETE TODAY'S WORKOUT CHECK-IN
      </button>

`;
  } else {
    // Render Workout History Log List
    const historyHTML = (client.workoutHistory && client.workoutHistory.length > 0)
      ? client.workoutHistory.map(h => `
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-end border-b border-slate-100 pb-3 mb-4">
            <div>
              <span class="text-sm font-extrabold text-slate-800 flex items-center gap-2 font-headline">
                <span class="material-symbols-outlined text-primary text-[20px]" data-i18n="fitness_center">fitness_center</span>
                ${h.focus}
              </span>
            </div>
            <span class="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-lg">${h.date}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${h.exercises.map(ex => `
              <div class="flex flex-col bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-primary/20 transition-colors">
                <span class="font-bold text-slate-700 text-xs mb-1.5 truncate" title="${ex.name}">${ex.name}</span>
                <span class="text-primary font-extrabold text-sm font-headline bg-white border border-slate-200/60 px-2 py-1 rounded inline-block w-max">${ex.weight} kg x ${ex.reps} r</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')
      : `
        <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <span class="material-symbols-outlined text-[40px] text-slate-300" data-i18n="history">history</span>
          </div>
          <h2 class="text-xl font-headline font-extrabold text-slate-800" data-i18n="workout_no_history">No workout history yet</h2>
          <p class="text-sm text-slate-500 mt-2 font-medium" data-i18n="workout_no_history_sub">Complete your first workout session to log your history.</p>
        </div>
      `;

    container.innerHTML += `
      <div class="flex flex-col gap-5 mt-6">
        ${historyHTML}
      </div>
    `;
  }
  // translate inserted DOM for i18n
  translateDOM();
}

export function setupWorkoutGlobalHandlers(renderView, showToast, closeModal) {
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
      window.openWorkoutLogModal(exId);
    }
  };

  window.openWorkoutLogModal = function(exId) {
    const client = getActiveClient();
    const program = getPrograms()[client.id];
    const ex = program.exercises.find(e => e.id === exId);
    if (!ex) return;

    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-2xl p-7 border border-slate-100 shadow-2xl relative">
          <h2 data-i18n="modal_log_title" class="text-xl font-headline font-extrabold text-slate-800 mb-1.5 font-headline">Log Workout Performance</h2>
          <p data-i18n="modal_log_sub" class="text-sm text-slate-500 mb-5 font-medium">Record the actual reps and weight you lifted for each set.</p>
          
          <div class="mb-5 bg-primary/5 border border-primary/20 p-4 rounded-xl">
            <label data-i18n="label_exercise" class="block text-xs font-bold text-primary uppercase tracking-widest mb-1">Exercise:</label>
            <div class="font-headline font-bold text-lg text-slate-800 mb-1">${ex.name}</div>
            <div data-i18n="label_pt_target" class="text-xs font-semibold text-slate-500">PT Target: ${ex.sets} Sets x ${ex.reps} Reps | ${ex.weight} kg</div>
          </div>

          <form id="workout-log-form" class="space-y-4">
            <div class="max-h-56 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              ${Array.from({ length: ex.sets }).map((_, i) => `
                <div class="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-colors">
                  <span class="font-extrabold text-slate-400 w-12 text-sm uppercase tracking-wider">Set ${i+1}</span>
                  <div class="flex-grow grid grid-cols-2 gap-3">
                    <div class="flex items-center gap-2">
                      <input type="number" step="0.5" placeholder="Weight" value="${ex.weight}" class="w-full bg-white border border-slate-300 rounded-lg py-2 px-2 text-center text-sm font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required data-weight-set="${i}">
                      <span data-i18n="kg" class="text-xs font-bold text-slate-400 shrink-0">kg</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input type="number" placeholder="Reps" value="${ex.reps}" class="w-full bg-white border border-slate-300 rounded-lg py-2 px-2 text-center text-sm font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required data-reps-set="${i}">
                      <span data-i18n="reps" class="text-xs font-bold text-slate-400 shrink-0">reps</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="flex gap-4 mt-8 pt-5 border-t border-slate-100">
              <button type="button" onclick="window.closeModal()" data-i18n="btn_cancel" class="flex-1 border-2 border-slate-200 text-slate-600 py-3 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors">Cancel</button>
              <button type="submit" data-i18n="btn_save_continue" class="flex-1 bg-primary text-white py-3 text-sm font-bold rounded-xl hover:bg-[#8f3200] shadow-md shadow-primary/20 transition-all transform hover:-translate-y-0.5">Save & Continue</button>
            </div>
          </form>
        </div>
      </div>
    `;
    translateDOM();

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
      showToast(t('workout_log_saved'), 'success');
    });
  };

  window.openExerciseGuideModal = function(exId) {
    const client = getActiveClient();
    const program = getPrograms()[client.id];
    const ex = program.exercises.find(e => e.id === exId);
    if (!ex) return;

    const modalRoot = document.getElementById('modal-root');
    const mediaHTML = ex.videoUrl 
      ? `<iframe class="w-full aspect-video rounded-lg mb-3" src="${ex.videoUrl}" frameborder="0" allowfullscreen></iframe>`
      : (ex.imageUrl ? `<img src="${ex.imageUrl}" class="w-full rounded-lg mb-3 object-cover max-h-48" />` : '');

    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">${ex.name} ${t('guide_suffix')}</h2>
          ${mediaHTML}
          <div class="text-xs text-slate-600 mb-4 whitespace-pre-wrap">${ex.instructions || t('no_instructions')}</div>
          <div class="flex gap-3">
            <button onclick="window.closeModal()" data-i18n="btn_close" class="w-full bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Close</button>
          </div>
        </div>
      </div>
    `;
    translateDOM();
  };

  window.finishWorkout = function() {
    const client = getActiveClient();
    const program = getPrograms()[client.id];
    const pending = program.exercises.filter(ex => !ex.completed);
    
    if (pending.length > 0) {
      if (!confirm(t('finish_confirm_pending'))) {
        return;
      }
    }

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

    const scheduleList = getSchedule().filter(s => s.clientId === client.id && s.date === new Date().toISOString().split('T')[0]);
    const activeSched = scheduleList.find(s => !s.validated);
    
    if (activeSched) {
      validateSession(activeSched.id);
      showToast(t('workout_completed_remaining'), 'success');
    } else {
      if (client.package.remaining > 0) {
        client.package.remaining--;
        saveState();
        showToast(t('workout_completed_self'), 'success');
      } else {
        showToast(t('workout_completed_exhausted'), 'info');
      }
    }

    program.exercises.forEach(ex => {
      ex.completed = false;
    });
    updateProgram(client.id, program);
    saveState();
    window.navigateTo('home');
  };
}
