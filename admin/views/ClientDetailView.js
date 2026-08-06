import { getClients } from '../../src/models/ClientModel.js';
import { saveState } from '../../src/models/Store.js';
import { saveClient } from '../../src/models/ClientModel.js';

export function renderClientDetailView(container, activeClientDetailId) {
  const clients = getClients();
  const client = clients.find(c => c.id === activeClientDetailId);
  if (!client) {
    container.innerHTML = `
      <div class="bg-white rounded-xl border p-6 text-center text-slate-500">
        Client not found.
        <button onclick="window.navigateTo('clients')" class="mt-4 bg-primary text-white px-4 py-2 rounded text-xs font-bold block mx-auto">Back</button>
      </div>
    `;
    return;
  }

  const progressRows = client.bodyProgress.map(bp => `
    <tr class="border-b border-slate-100 last:border-0 text-slate-700">
      <td class="py-2.5 font-medium">${bp.date}</td>
      <td class="py-2.5">${bp.weight} kg</td>
      <td class="py-2.5">${bp.bodyFat}%</td>
      <td class="py-2.5">${bp.muscleMass} kg</td>
      <td class="py-2.5">${bp.waist} cm</td>
    </tr>
  `).join('');

  const photoHTML = client.photos.length > 0 ? client.photos.map(p => `
    <div class="flex flex-col gap-1.5">
      <img class="w-full h-32 rounded-lg object-cover border" src="${p.url}" alt="${p.type}">
      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">${p.type} (${p.date})</span>
    </div>
  `).join('') : `
    <div class="col-span-2 text-center py-6 text-slate-400 bg-slate-50 border border-slate-100 rounded-lg text-[10px]">
      No progress photos uploaded yet.
    </div>
  `;

  container.innerHTML = `
    <!-- Back Button -->
    <div class="mb-4">
      <button onclick="window.navigateTo('clients')" class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-[#8f3200] transition-colors focus:outline-none">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Client Roster
      </button>
    </div>

    <!-- Main Container Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
      
      <!-- Top Header Row -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
        <div class="flex items-center gap-4">
          <img class="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm" src="${client.avatar}">
          <div>
            <h2 class="text-2xl font-headline font-extrabold text-slate-800">${client.name}</h2>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="bg-green-100 text-green-700 text-[10px] font-bold font-headline px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ${client.status === 'Active' ? 'Active Client' : client.status}
              </span>
              <span class="text-xs text-slate-400 font-medium">Joined ${client.joinedDate}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button onclick="window.navigateToBuilderForClient('${client.id}')" class="bg-primary text-white text-xs font-bold font-headline py-2.5 px-4 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm">
            Workout Builder
          </button>
        </div>
      </div>

      <!-- Two Columns Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-slate-600">
        
        <!-- Left Side: Bio & Physical Readiness -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Contact Info & Profile</h3>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-400 font-semibold block">Email Address:</span>
                <span class="font-bold text-slate-800 mt-0.5 block">${client.email}</span>
              </div>
              <div>
                <span class="text-slate-400 font-semibold block">Phone Number:</span>
                <span class="font-bold text-slate-800 mt-0.5 block">${client.phone}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            <h4 class="font-headline font-bold text-slate-800 text-[11px] flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
              <span class="material-symbols-outlined text-[18px] text-primary">medical_information</span>
              PAR-Q Physical Readiness Questionnaire
            </h4>
            <div class="space-y-2 text-[11px] text-slate-600">
              <div class="flex justify-between"><span>Doctor Recommended Specific Activity:</span><span class="font-bold text-slate-800">${client.assessment.parq.q1 === 'yes' ? 'Yes (Restrictions)' : 'No (Cleared)'}</span></div>
              <div class="flex justify-between"><span>Chest Pain During Activity:</span><span class="font-bold text-slate-800">${client.assessment.parq.q2 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between"><span>Chest Pain At Rest:</span><span class="font-bold text-slate-800">${client.assessment.parq.q3 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between"><span>Dizziness / Loss of Balance:</span><span class="font-bold text-slate-800">${client.assessment.parq.q4 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between"><span>Chronic Bone / Joint Issue:</span><span class="font-bold text-slate-800">${client.assessment.parq.q5 === 'yes' ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          ${client.assessment.hasInjury ? `
            <div class="bg-red-50 border border-red-100 p-5 rounded-xl text-red-700">
              <h4 class="font-headline font-bold flex items-center gap-1.5 text-[11px] border-b border-red-200/40 pb-2 mb-2">
                <span class="material-symbols-outlined text-[18px]">warning</span> Medical Injury Notes (Red Flag)
              </h4>
              <p class="text-xs leading-relaxed font-medium">${client.assessment.injuryNotes}</p>
            </div>
          ` : ''}
        </div>

        <!-- Right Side: Goals & Photos -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Goals & Posture Analysis</h3>
            <form id="edit-client-posture-form" class="space-y-4" onsubmit="window.saveClientPosture(event, '${client.id}')">
              <div>
                <label class="text-slate-400 font-semibold block mb-1">Primary Training Goal:</label>
                <select id="edit-postural-focus" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  <option value="Hypertrophy / Muscle Building" ${client.assessment.postural.focus.startsWith('Hypertrophy') ? 'selected' : ''}>Hypertrophy / Muscle Building</option>
                  <option value="Fat Loss / Endurance" ${client.assessment.postural.focus.startsWith('Fat Loss') ? 'selected' : ''}>Fat Loss / Endurance</option>
                  <option value="Sports Performance" ${client.assessment.postural.focus.startsWith('Sports') ? 'selected' : ''}>Sports Performance</option>
                  <option value="Mobility / Rehabilitation" ${client.assessment.postural.focus.startsWith('Mobility') ? 'selected' : ''}>Mobility / Rehabilitation</option>
                </select>
              </div>
              <div>
                <label class="text-slate-400 font-semibold block mb-1">Client Posture Analysis:</label>
                <textarea id="edit-postural-analysis" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white min-h-[80px] leading-relaxed text-slate-700">${client.assessment.postural.analysis || ''}</textarea>
              </div>
              <button type="submit" class="bg-primary text-white text-[10px] font-bold font-headline py-2 px-4 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm focus:outline-none">
                Save Assessment Changes
              </button>
            </form>
          </div>

          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Progress Photo Gallery</h3>
            <div class="grid grid-cols-2 gap-4">
              ${photoHTML}
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Row: Body Progress History Table -->
      <div class="border-t border-slate-100 pt-6">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Body Composition Metrics History</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-slate-400">
                <th class="py-2.5 font-semibold">Date</th>
                <th class="py-2.5 font-semibold">Weight</th>
                <th class="py-2.5 font-semibold">Body Fat</th>
                <th class="py-2.5 font-semibold">Muscle Mass</th>
                <th class="py-2.5 font-semibold">Waist Size</th>
              </tr>
            </thead>
            <tbody>
              ${progressRows}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

export function setupClientDetailGlobalHandlers(renderView, showToast) {
  window.saveClientPosture = function(event, clientId) {
    event.preventDefault();
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
  
    const focus = document.getElementById('edit-postural-focus').value;
    const analysis = document.getElementById('edit-postural-analysis').value;
  
    client.assessment.postural.focus = focus;
    client.assessment.postural.analysis = analysis;
  
    saveClient(client);
    renderView();
    showToast('Postural assessment & training goals updated successfully!', 'success');
  };
}
