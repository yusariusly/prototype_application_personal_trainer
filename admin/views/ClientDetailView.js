import { getClients } from '../../src/models/ClientModel.js';
import { saveState } from '../../src/models/Store.js';
import { saveClient } from '../../src/models/ClientModel.js';
import { getNutrition, updateNutrition } from '../../src/models/NutritionModel.js';
import { t, translateDOM } from '../../src/i18n.js';

export function renderClientDetailView(container, activeClientDetailId) {
  const clients = getClients();
  const client = clients.find(c => c.id === activeClientDetailId);
  if (!client) {
    container.innerHTML = `
      <div class="bg-white rounded-xl border p-6 text-center text-slate-500">
        <div data-i18n="client_not_found">Client not found.</div>
        <button onclick="window.navigateTo('clients')" data-i18n="btn_back_to_clients" class="mt-4 bg-primary text-white px-4 py-2 rounded text-xs font-bold block mx-auto">Back</button>
      </div>
    `;
    return;
  }
  const nutrition = getNutrition(client.id);

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
      <button onclick="window.navigateTo('clients')" data-i18n="btn_back_to_clients" class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-[#8f3200] transition-colors focus:outline-none">
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
            <h3 data-i18n="client_contact_info" class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Contact Info & Profile</h3>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span data-i18n="label_email" class="text-slate-400 font-semibold block">Email Address:</span>
                <span class="font-bold text-slate-800 mt-0.5 block">${client.email}</span>
              </div>
              <div>
                <span data-i18n="label_phone" class="text-slate-400 font-semibold block">Phone Number:</span>
                <span class="font-bold text-slate-800 mt-0.5 block">${client.phone}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            <h4 data-i18n="parq_title" class="font-headline font-bold text-slate-800 text-[11px] flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
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
          <div class="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
            <div>
               <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Overall Compliance Rate</h3>
               <p class="text-[10px] text-slate-500 font-medium">Diet & Workout Adherence (Last 30 Days)</p>
            </div>
            <div class="text-3xl font-headline font-extrabold text-green-700">
               88%
            </div>
          </div>
          
          <div>
            <h3 data-i18n="client_goals_posture" class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Goals & Posture Analysis</h3>
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
              <button type="submit" data-i18n="btn_save_assessment" class="bg-primary text-white text-[10px] font-bold font-headline py-2 px-4 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm focus:outline-none">
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
          
          <div>
            <h3 data-i18n="client_nutrition_targets" class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Nutrition Targets</h3>
            <form id="edit-client-nutrition-form" class="space-y-4" onsubmit="window.saveClientNutrition(event, '${client.id}')">
              <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-slate-400 font-semibold block mb-1">Target Calories (kcal):</label>
                    <input type="number" id="edit-nut-cal" value="${nutrition.targets.calories}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  </div>
                  <div>
                    <label class="text-slate-400 font-semibold block mb-1">Est. TDEE (kcal):</label>
                    <input type="number" id="edit-nut-tdee" value="${nutrition.tdee}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="text-slate-400 font-semibold block mb-1">Protein (g):</label>
                    <input type="number" id="edit-nut-pro" value="${nutrition.targets.protein}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  </div>
                  <div>
                    <label class="text-slate-400 font-semibold block mb-1">Carbs (g):</label>
                    <input type="number" id="edit-nut-carb" value="${nutrition.targets.carbs}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  </div>
                  <div>
                    <label class="text-slate-400 font-semibold block mb-1">Fat (g):</label>
                    <input type="number" id="edit-nut-fat" value="${nutrition.targets.fat}" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:bg-white font-bold text-slate-800">
                  </div>
              </div>
              <button type="submit" data-i18n="btn_save_nutrition" class="bg-primary text-white text-[10px] font-bold font-headline py-2 px-4 rounded-lg hover:bg-[#8f3200] transition-colors shadow-sm focus:outline-none">
                Save Nutrition Targets
              </button>
            </form>
          </div>
        </div>

      </div>

      <!-- Bottom Row: Body Progress History Table -->
      <div class="border-t border-slate-100 pt-6">
        <h3 data-i18n="client_body_history" class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Body Composition Metrics History</h3>
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

  // translate DOM after render
  translateDOM();
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
    if(showToast) showToast(t('client_posture_updated'), 'success');
  };

  window.saveClientNutrition = function(event, clientId) {
    event.preventDefault();
    const nutrition = getNutrition(clientId);
    nutrition.tdee = parseInt(document.getElementById('edit-nut-tdee').value);
    nutrition.targets.calories = parseInt(document.getElementById('edit-nut-cal').value);
    nutrition.targets.protein = parseInt(document.getElementById('edit-nut-pro').value);
    nutrition.targets.carbs = parseInt(document.getElementById('edit-nut-carb').value);
    nutrition.targets.fat = parseInt(document.getElementById('edit-nut-fat').value);
    
    updateNutrition(clientId, nutrition);
    
    renderView();
    if(showToast) showToast(t('nutrition_targets_updated'), 'success');
  };
}
