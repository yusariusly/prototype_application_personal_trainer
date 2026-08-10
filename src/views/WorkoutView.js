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
        <span class="material-symbols-outlined text-[48px] text-slate-300">fitness_center</span>
        <h2 data-i18n="workout_no_program" class="text-lg font-headline font-bold text-slate-800 mt-2">No active program</h2>
        <p data-i18n="workout_no_program_sub" class="text-xs text-slate-500 mt-1">Contact your Personal Trainer to create a workout program.</p>
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
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 data-i18n="workout_title" class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]">Workout Program</h1>
          <p data-i18n="workout_sub" class="text-xs text-slate-500 mt-1">Complete your scheduled workout checklist or track your lifting history.</p>
        </div>
        
        <!-- Tab selector -->
        <div class="flex bg-slate-100 p-1 rounded-lg self-stretch sm:self-auto">
          <button onclick="window.switchWorkoutSubTab('active')" class="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-bold rounded-md transition-all ${activeWorkoutSubTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}" data-i18n="workout_tab_active">
            Active Program
          </button>
          <button onclick="window.switchWorkoutSubTab('history')" class="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-bold rounded-md transition-all ${activeWorkoutSubTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}" data-i18n="workout_tab_history">
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
            <span data-i18n="workout_progress_today">TODAY'S WORKOUT PROGRESS</span>
            <span>${completedCount} / ${totalCount} ${t('label_completed')}</span>
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
                  <button onclick="window.toggleExerciseCheck('${ex.id}')" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${isDone ? 'bg-primary border-primary text-white' : 'border-slate-300 text-transparent hover:border-primary'}">
                    <span class="material-symbols-outlined text-[16px] font-bold">check</span>
                  </button>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-headline font-bold text-sm text-slate-800 ${isDone ? 'line-through text-slate-400' : ''}">${ex.name}</h4>
                      <button onclick="window.openExerciseGuideModal('${ex.id}')" class="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 rounded transition-all" data-i18n="btn_visual_guide">
                        <span class="material-symbols-outlined text-[13px]">smart_display</span> Visual Guide
                      </button>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-4 text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                      <div data-i18n="label_sets">Sets: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.sets}</span></div>
                      <div data-i18n="label_reps">Reps: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.reps}</span></div>
                      <div data-i18n="label_target_wt">Target Wt: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.weight} kg</span></div>
                      <div data-i18n="label_rest">Rest: <span class="text-slate-700 font-semibold text-[11px] font-headline block mt-0.5">${ex.rest}s</span></div>
                    </div>

                    ${ex.actual.length ? `
                      <p class="text-xs text-primary font-medium mt-2" data-i18n="label_actual">
                          Actual: ${ex.actual.map(set => `${set.weight}kg x ${set.reps}r`).join(', ')}
                        </p>
                    ` : ''}
                  </div>
                </div>
                
                  <div class="text-right shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
                  <span data-i18n="label_previous_wt" class="text-[9px] text-slate-400 block uppercase font-bold">Previous Wt</span>
                  <span class="text-xs font-semibold text-slate-600 font-headline">${ex.history ? `${ex.history.weight} kg x ${ex.history.reps}` : '10 kg x 10'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <button onclick="window.finishWorkout()" class="mt-6 w-full bg-primary text-white font-headline text-xs font-bold py-4 rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2" data-i18n="btn_complete_workout">
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
          <h2 data-i18n="workout_no_history" class="text-lg font-headline font-bold text-slate-800 mt-2">No workout history yet</h2>
          <p data-i18n="workout_no_history_sub" class="text-xs text-slate-500 mt-1">Complete your first workout session to log your history.</p>
        </div>
      `;

    container.innerHTML += `
      <div class="flex flex-col gap-4 mt-6">
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
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 data-i18n="modal_log_title" class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Log Workout Performance</h2>
          <p data-i18n="modal_log_sub" class="text-xs text-slate-500 mb-4">Record the actual reps and weight you lifted for each set.</p>
          
          <div class="mb-4">
            <label data-i18n="label_exercise" class="block text-xs font-bold text-slate-600 mb-1">Exercise: <span class="text-primary font-headline">${ex.name}</span></label>
            <div data-i18n="label_pt_target" class="text-[10px] text-slate-400">PT Target: ${ex.sets} Sets x ${ex.reps} Reps | ${ex.weight} kg</div>
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
              <button type="button" onclick="window.closeModal()" data-i18n="btn_cancel" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" data-i18n="btn_save_continue" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save & Continue</button>
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
