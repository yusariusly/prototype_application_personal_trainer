import { getClients } from '../../src/models/ClientModel.js';
import { getPrograms } from '../../src/models/ProgramModel.js';
import { updateProgram } from '../../src/models/ProgramModel.js';
import { getExerciseLibrary } from '../../src/models/ExerciseModel.js';

export function renderBuilderView(container, activeBuilderClientId) {
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
            <select id="builder-client-select" onchange="window.switchBuilderClient(this.value)" class="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none font-bold text-slate-800 pr-8">
              ${clients.map(c => `<option value="${c.id}" ${c.id === client.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
          </div>
          <button onclick="window.saveActiveProgram()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-headline px-4 py-2.5 rounded-lg border border-slate-200 whitespace-nowrap">Save Draft</button>
          <button onclick="window.saveActiveProgram()" class="bg-primary text-white text-xs font-bold font-headline px-4 py-2.5 rounded-lg hover:bg-primary-container transition-all whitespace-nowrap shadow-sm">Assign Workout</button>
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
          <input type="text" onclick="window.openExerciseLibraryModal()" placeholder="Type to add exercise (e.g., Barbell Squat)..." class="w-full bg-transparent border-0 text-xs outline-none focus:ring-0 p-0 placeholder-slate-400">
          <button onclick="window.openExerciseLibraryModal()" class="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shrink-0">
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
                <button onclick="window.openEditMediaModal(${idx})" title="Edit Panduan Video/Foto" class="px-2 py-1 rounded bg-slate-50 hover:bg-primary/10 text-slate-600 hover:text-primary text-[10px] font-bold flex items-center gap-1 border border-slate-200"><span class="material-symbols-outlined text-[14px]">movie</span> Media</button>
                <button onclick="window.copyBuilderExercise(${idx})" title="Duplikasi Gerakan" class="w-8 h-8 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">content_copy</span></button>
                <button onclick="window.removeBuilderExercise(${idx})" title="Hapus Gerakan" class="w-8 h-8 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
          `).join('') : ''}
        </div>

        <button onclick="window.openExerciseLibraryModal()" class="w-full border-2 border-dashed border-slate-200 hover:border-primary text-slate-500 hover:text-primary font-headline text-xs font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 bg-white">
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

export function setupBuilderGlobalHandlers(renderView, showToast, closeModal, getActiveBuilderClientId, setActiveBuilderClientId) {
  window.switchBuilderClient = function(clientId) {
    setActiveBuilderClientId(clientId);
    renderView();
  };

  window.copyBuilderExercise = function(idx) {
    const activeBuilderClientId = getActiveBuilderClientId();
    const program = getPrograms()[activeBuilderClientId];
    const copy = JSON.parse(JSON.stringify(program.exercises[idx]));
    copy.id = `ex-${Date.now()}`;
    program.exercises.splice(idx + 1, 0, copy);
    updateProgram(activeBuilderClientId, program);
    renderView();
    showToast('Exercise duplicated successfully.', 'success');
  };

  window.removeBuilderExercise = function(idx) {
    const activeBuilderClientId = getActiveBuilderClientId();
    const program = getPrograms()[activeBuilderClientId];
    program.exercises.splice(idx, 1);
    updateProgram(activeBuilderClientId, program);
    renderView();
    showToast('Exercise removed from program.', 'info');
  };

  window.saveActiveProgram = function() {
    const activeBuilderClientId = getActiveBuilderClientId();
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

  window.openExerciseLibraryModal = function() {
    const activeBuilderClientId = getActiveBuilderClientId();
    const library = getExerciseLibrary();
    const modalRoot = document.getElementById('modal-root');
    
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative max-h-[80vh] overflow-y-auto">
          <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">Exercise Library</h2>
          <p class="text-xs text-slate-500 mb-4">Search and select exercises to add to the client program.</p>
  
          <div class="mb-4 relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">search</span>
            <input type="text" id="lib-search-input" onkeyup="window.filterExerciseLib()" placeholder="Search exercises..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary">
          </div>
  
          <div class="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1" id="lib-list-container">
            ${library.map(ex => `
              <div onclick="window.addExerciseToBuilder('${ex.name}')" class="border border-slate-100 hover:border-primary/20 rounded-lg p-3 bg-slate-50/50 hover:bg-primary/5 transition-all flex justify-between items-center cursor-pointer">
                <span class="text-xs font-bold text-slate-800">${ex.name}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">${ex.category}</span>
              </div>
            `).join('')}
          </div>
  
          <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button onclick="window.closeModal()" class="w-full bg-slate-800 text-white py-2.5 text-xs font-bold rounded-lg">Close</button>
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
      <div onclick="window.addExerciseToBuilder('${ex.name}')" class="border border-slate-100 hover:border-primary/20 rounded-lg p-3 bg-slate-50/50 hover:bg-primary/5 transition-all flex justify-between items-center cursor-pointer">
        <span class="text-xs font-bold text-slate-800">${ex.name}</span>
        <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">${ex.category}</span>
      </div>
    `).join('');
  };

  window.addExerciseToBuilder = function(exName) {
    const activeBuilderClientId = getActiveBuilderClientId();
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

  window.openEditMediaModal = function(idx) {
    const activeBuilderClientId = getActiveBuilderClientId();
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
            <button onclick="window.closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined text-[18px]">close</span></button>
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
              <button type="button" onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" class="flex-1 bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm">Save Visual Guide</button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  window.saveExerciseMedia = function(event, idx) {
    event.preventDefault();
    const activeBuilderClientId = getActiveBuilderClientId();
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
}
