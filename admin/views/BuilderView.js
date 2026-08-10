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
    <div class="mb-6">
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
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" data-i18n="expand_more">expand_more</span>
          </div>

          <button class="bg-white/80 backdrop-blur-md hover:bg-slate-50 text-slate-700 text-xs font-bold font-headline px-5 py-2.5 rounded-xl border border-white hover:border-primary/30 whitespace-nowrap shadow-sm hover:shadow-md transition-all" data-i18n="save_draft" onclick="window.saveActiveProgram()">Save Draft</button>
          <button class="bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold font-headline px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all whitespace-nowrap shadow-sm" data-i18n="assign_workout" onclick="window.saveActiveProgram()">Assign Workout</button>
        </div>
      </div>
    </div>

    <!-- Workspace columns layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
<!-- Main Builder list -->
<div class="lg:col-span-8 flex flex-col gap-4">
<!-- Search bar inside builder -->
<div class="relative bg-white/70 backdrop-blur-md border border-white rounded-2xl p-4 shadow-sm flex items-center gap-3 group hover:shadow-md transition-all">
<span class="material-symbols-outlined text-primary/70 text-lg pl-2 group-hover:scale-110 transition-transform" data-i18n="add">add</span>
<input class="w-full bg-transparent border-0 text-sm outline-none focus:ring-0 p-0 placeholder-slate-400 font-medium" onclick="window.openExerciseLibraryModal()" placeholder="Type to add exercise (e.g., Barbell Squat)..." type="text"/>
<button class="w-10 h-10 rounded-xl bg-white/80 border border-white flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors shrink-0 shadow-sm" onclick="window.openExerciseLibraryModal()">
<span class="material-symbols-outlined text-base" data-i18n="filter_list">filter_list</span>
</button>
</div>
<div class="flex flex-col gap-4" id="builder-exercises-list">
          ${program && program.exercises.length > 0 ? program.exercises.map((ex, idx) => `
            <div class="border border-white rounded-2xl p-6 bg-white/60 backdrop-blur-sm flex items-center gap-5 relative shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group" data-builder-index="${idx}">
              <div class="absolute left-0 top-0 bottom-0 w-1.5 ${idx === 0 ? 'bg-primary' : 'bg-blue-400'} rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Drag handles -->
              <div class="flex flex-col gap-0.5 text-slate-300 cursor-move shrink-0 pl-2 hover:text-primary transition-colors">
                <span data-i18n="drag_indicator" class="material-symbols-outlined text-[20px]">drag_indicator</span>
              </div>
              
              <!-- Exercise Info fields -->
              <div class="flex-grow grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div class="md:col-span-4 min-w-0">
                  <span class="inline-block ${idx === 0 ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'} font-headline text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 shadow-sm">${idx === 0 ? 'COMPOUND' : 'ACCESSORY'}</span>
                  <h4 class="font-headline font-bold text-base text-slate-800 truncate tracking-tight">${ex.name}</h4>
                  <span data-i18n="quads_glutes" class="text-xs font-medium text-slate-400 mt-0.5 block">Quads, Glutes</span>
                </div>
                
                <div class="md:col-span-8 grid grid-cols-4 gap-3 items-end">
                  <div>
                    <label data-i18n="sets" class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Sets</label>
                    <input type="number" value="${ex.sets}" class="w-full bg-white/50 border border-white/80 rounded-xl py-2 px-2 text-center text-sm font-semibold outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" data-ex-sets="${idx}">
                  </div>
                  <div>
                    <label data-i18n="reps" class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Reps</label>
                    <input type="text" value="${ex.reps}" class="w-full bg-white/50 border border-white/80 rounded-xl py-2 px-2 text-center text-sm font-semibold outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" data-ex-reps="${idx}">
                  </div>
                  <div>
                    <label data-i18n="target_wt_kg" class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Wt (kg)</label>
                    <input type="number" step="0.5" value="${ex.weight}" class="w-full bg-white/50 border border-white/80 rounded-xl py-2 px-2 text-center text-sm font-semibold outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" data-ex-weight="${idx}">
                  </div>
                  <div>
                    <label data-i18n="rest_s" class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Rest (s)</label>
                    <input type="number" value="${ex.rest}" class="w-full bg-white/50 border border-white/80 rounded-xl py-2 px-2 text-center text-sm font-semibold outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" data-ex-rest="${idx}">
                  </div>
                </div>
              </div>

              <!-- Actions on right side -->
              <div class="flex items-center gap-2 shrink-0 border-l border-white/50 pl-5 ml-2">
                <button onclick="window.openEditMediaModal(${idx})" title="Edit Panduan Video/Foto" class="px-3 py-2 rounded-xl bg-white border border-white hover:border-primary/30 text-slate-500 hover:text-primary text-[11px] font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"><span data-i18n="movie" class="material-symbols-outlined text-[16px]">movie</span> Media</button>
                <button onclick="window.copyBuilderExercise(${idx})" title="Duplikasi Gerakan" class="w-9 h-9 rounded-xl bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center shadow-sm transition-all"><span data-i18n="content_copy" class="material-symbols-outlined text-[18px]">content_copy</span></button>
                <button onclick="window.removeBuilderExercise(${idx})" title="Hapus Gerakan" class="w-9 h-9 rounded-xl bg-white border border-transparent hover:border-red-200 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm transition-all"><span data-i18n="delete" class="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
          `).join('') : ''}
        
        <button class="w-full border-2 border-dashed border-white/60 bg-white/30 backdrop-blur-sm hover:border-primary hover:bg-white/60 text-slate-500 hover:text-primary font-headline text-sm font-bold py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm" onclick="window.openExerciseLibraryModal()">
          <span class="material-symbols-outlined text-[20px]" data-i18n="add">add</span> Add Custom Block (Superset / Circuit)
        </button>
      </div>

<!-- Right Column: Volume Overview & Client Info Card -->
<div class="lg:col-span-4 flex flex-col gap-6">
<!-- Volume Overview -->
<section class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-7 shadow-sm flex flex-col gap-5 relative overflow-hidden group">
  <div class="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
  <div class="relative z-10">
    <h3 class="font-headline font-bold text-lg text-slate-800 mb-4" data-i18n="volume_overview">Volume Overview</h3>
    <div>
    <div class="flex justify-between text-xs font-bold text-slate-600 mb-2">
    <span data-i18n="total_sets" class="uppercase tracking-wide">Total Sets</span>
    <span class="bg-slate-100 px-2 py-0.5 rounded">${totalSets} / 20</span>
    </div>
    <div class="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden shadow-inner">
    <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full relative" style="width: ${(totalSets / 20) * 100}%">
      <div class="absolute inset-0 bg-white/20 w-full h-full rounded-full"></div>
    </div>
    </div>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-6">
    <div class="bg-white/60 p-5 border border-white rounded-2xl shadow-sm">
    <span class="text-[10px] text-slate-500 font-bold block uppercase tracking-wider" data-i18n="est_time">Est. Time</span>
    <span class="text-2xl font-headline font-extrabold text-slate-800 mt-2 block">${totalSets * 6} <span class="text-xs font-body font-normal text-slate-500" data-i18n="min">min</span></span>
    </div>
    <div class="bg-white/60 p-5 border border-white rounded-2xl shadow-sm">
    <span class="text-[10px] text-slate-500 font-bold block uppercase tracking-wider" data-i18n="volume_load">Volume Load</span>
    <span class="text-2xl font-headline font-extrabold text-blue-600 mt-2 block">~${(volLoad / 1000).toFixed(1)}k <span class="text-xs font-body font-normal text-slate-500" data-i18n="kg">kg</span></span>
    </div>
    </div>
  </div>
</section>
<!-- Client Highlight Card -->
<section class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white overflow-hidden shadow-sm flex flex-col relative group">
<div class="h-20 bg-gradient-to-r from-primary/10 to-primary-container/10 border-b border-white relative shrink-0">
<!-- Overlap Avatar -->
<img alt="Avatar" class="w-20 h-20 rounded-2xl object-cover border-4 border-white absolute bottom-[-24px] left-6 shadow-lg group-hover:scale-105 transition-transform duration-500" src="${client.avatar}"/>
</div>
<div class="p-7 pt-10 flex flex-col gap-4">
<div>
<h4 class="font-headline font-extrabold text-2xl text-slate-800 tracking-tight">${client.name}</h4>
              ${client.assessment.hasInjury ? `
                <span class="inline-flex items-center gap-1.5 bg-red-100/80 text-red-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider mt-2 shadow-sm border border-red-200/50">
                  <span class="material-symbols-outlined text-[14px]">warning</span> RIGHT SHOULDER MOD
                </span>
              ` : ''}
            </div>

            <div class="border-t border-white pt-5 mt-2 text-sm">
              <span data-i18n="current_goal" class="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-2">CURRENT GOAL</span>
              <p class="text-slate-600 font-medium leading-relaxed bg-white/60 p-4 rounded-xl border border-white shadow-sm">${client.assessment.postural.analysis || 'Lower body hypertrophy with upper body maintenance. Avoid overhead pressing.'}</p>
            </div>
          </div>
        </section>

        <!-- Historical Lift Comparison Card -->
        <section class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-7 shadow-sm flex flex-col gap-5">
          <h3 data-i18n="previous_lift_comparison" class="font-headline font-bold text-lg text-slate-800 border-b border-white pb-3">Previous Lift Comparison</h3>
          <div class="space-y-4 text-sm text-slate-600">
            ${program && program.exercises.length > 0 ? program.exercises.map(ex => `
              <div class="flex justify-between items-center border-b border-white pb-3 last:border-0 last:pb-0 gap-3 group/item">
                <span class="font-bold text-slate-700 truncate group-hover/item:text-primary transition-colors">${ex.name}</span>
                <span class="text-slate-600 font-semibold bg-white px-3 py-1.5 rounded-lg border border-white shadow-sm shrink-0">
                  Last Session: <span class="text-primary font-extrabold ml-1">${ex.history ? `${ex.history.weight} kg x ${ex.history.reps}` : '10 kg x 10'}</span>
                </span>
              </div>
            `).join('') : '<span data-i18n="no_exercises_added_yet" class="text-slate-400 font-medium block text-center py-4 bg-white/50 rounded-xl border border-white">No exercises added yet.</span>'}
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
          <h2 data-i18n="exercise_library" class="text-lg font-headline font-bold text-slate-800 mb-2">Exercise Library</h2>
          <p data-i18n="search_and_select_exercises_to" class="text-xs text-slate-500 mb-4">Search and select exercises to add to the client program.</p>
  
          <div class="mb-4 relative">
            <span data-i18n="search" class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">search</span>
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
            <button data-i18n="close" onclick="window.closeModal()" class="w-full bg-slate-800 text-white py-2.5 text-xs font-bold rounded-lg">Close</button>
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
              <span data-i18n="movie" class="material-symbols-outlined text-primary text-[20px]">movie</span>
              Visual & Video Guide: ${ex.name}
            </h2>
            <button onclick="window.closeModal()" class="text-slate-400 hover:text-slate-600"><span data-i18n="close" class="material-symbols-outlined text-[18px]">close</span></button>
          </div>
          <p data-i18n="enter_demo_video_url_or_photo" class="text-xs text-slate-500">Enter demo video URL or photo URL so clients can view exercise technique instructions.</p>
  
          <form id="edit-media-form" class="space-y-4" onsubmit="window.saveExerciseMedia(event, ${idx})">
            <div>
              <label data-i18n="demo_video_url_youtube_embed_m" class="block text-xs font-bold text-slate-600 mb-1">Demo Video URL (Youtube Embed / MP4)</label>
              <input type="url" id="media-video-url" value="${ex.videoUrl || ''}" placeholder="https://www.youtube.com/embed/..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
            </div>
  
            <div>
              <label data-i18n="posture_demo_photo_url" class="block text-xs font-bold text-slate-600 mb-1">Posture Demo Photo URL</label>
              <input type="url" id="media-image-url" value="${ex.imageUrl || ''}" placeholder="https://images.unsplash.com/..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
            </div>
  
            <div>
              <label data-i18n="technical_guide_coach_notes" class="block text-xs font-bold text-slate-600 mb-1">Technical Guide & Coach Notes</label>
              <textarea id="media-instructions" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary min-h-[80px]" placeholder="e.g. Position feet shoulder-width apart, exhale when pushing weight...">${ex.instructions || ''}</textarea>
            </div>
  
            <div class="flex gap-2 pt-2">
              <button data-i18n="cancel" type="button" onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button data-i18n="save_visual_guide" type="submit" class="flex-1 bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm">Save Visual Guide</button>
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
