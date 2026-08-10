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
    <div data-i18n="no_progress_photos_uploaded_ye" class="col-span-2 text-center py-6 text-slate-400 bg-slate-50 border border-slate-100 rounded-lg text-[10px]">
      No progress photos uploaded yet.
    </div>
  `;

  container.innerHTML = `
    <!-- Back Button -->
    <div class="mb-6">
      <button onclick="window.navigateTo('clients')" data-i18n="btn_back_to_clients" class="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors focus:outline-none bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white shadow-sm w-max hover:shadow-md hover:-translate-x-1">
        <span data-i18n="arrow_back" class="material-symbols-outlined text-[18px]">arrow_back</span> Back to Client Roster
      </button>
    </div>

    <!-- Main Container Card -->
    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-8 shadow-sm flex flex-col gap-8">
      
      <!-- Top Header Row -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white pb-8 gap-6">
        <div class="flex items-center gap-6">
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-primary-container rounded-full blur group-hover:blur-md transition-all duration-300 opacity-60"></div>
            <img class="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-md z-10" src="${client.avatar}">
          </div>
          <div>
            <h2 class="text-3xl font-headline font-extrabold text-slate-800 tracking-tight">${client.name}</h2>
            <div class="flex items-center gap-3 mt-2">
              <span class="bg-gradient-to-r from-green-400 to-green-500 text-white text-[10px] font-bold font-headline px-3 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-green-500/20">
                ${client.status === 'Active' ? 'Active Client' : client.status}
              </span>
              <span class="text-sm text-slate-500 font-medium">Joined ${client.joinedDate}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button data-i18n="workout_builder" onclick="window.navigateToBuilderForClient('${client.id}')" class="bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold font-headline py-3 px-6 rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50">
            Workout Builder
          </button>
        </div>
      </div>

      <!-- Two Columns Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 text-sm text-slate-600">
        
        <!-- Left Side: Bio & Physical Readiness -->
        <div class="lg:col-span-6 space-y-8">
          <div class="bg-white/60 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
            <h3 data-i18n="client_contact_info" class="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-white pb-3 mb-4">Contact Info & Profile</h3>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <span data-i18n="label_email" class="text-slate-400 font-medium block text-xs">Email Address:</span>
                <span class="font-bold text-slate-800 mt-1 block">${client.email}</span>
              </div>
              <div>
                <span data-i18n="label_phone" class="text-slate-400 font-medium block text-xs">Phone Number:</span>
                <span class="font-bold text-slate-800 mt-1 block">${client.phone}</span>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-slate-50 to-white border border-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h4 data-i18n="parq_title" class="font-headline font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-white pb-3 mb-4">
              <span data-i18n="medical_information" class="material-symbols-outlined text-[20px] text-primary">medical_information</span>
              PAR-Q Physical Readiness Questionnaire
            </h4>
            <div class="space-y-3 text-xs text-slate-600 font-medium">
              <div class="flex justify-between p-2 hover:bg-white/50 rounded-lg transition-colors"><span data-i18n="doctor_recommended_specific_ac">Doctor Recommended Specific Activity:</span><span class="font-bold text-slate-800">${client.assessment.parq.q1 === 'yes' ? 'Yes (Restrictions)' : 'No (Cleared)'}</span></div>
              <div class="flex justify-between p-2 hover:bg-white/50 rounded-lg transition-colors"><span data-i18n="chest_pain_during_activity">Chest Pain During Activity:</span><span class="font-bold text-slate-800">${client.assessment.parq.q2 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between p-2 hover:bg-white/50 rounded-lg transition-colors"><span data-i18n="chest_pain_at_rest">Chest Pain At Rest:</span><span class="font-bold text-slate-800">${client.assessment.parq.q3 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between p-2 hover:bg-white/50 rounded-lg transition-colors"><span data-i18n="dizziness_loss_of_balance">Dizziness / Loss of Balance:</span><span class="font-bold text-slate-800">${client.assessment.parq.q4 === 'yes' ? 'Yes' : 'No'}</span></div>
              <div class="flex justify-between p-2 hover:bg-white/50 rounded-lg transition-colors"><span data-i18n="chronic_bone_joint_issue">Chronic Bone / Joint Issue:</span><span class="font-bold text-slate-800">${client.assessment.parq.q5 === 'yes' ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          ${client.assessment.hasInjury ? `
            <div class="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100 p-6 rounded-2xl text-red-800 shadow-sm shadow-red-100/50">
              <h4 class="font-headline font-bold flex items-center gap-2 text-sm border-b border-red-200/50 pb-3 mb-3">
                <span class="material-symbols-outlined text-[20px]">warning</span> Medical Injury Notes (Red Flag)
              </h4>
              <p class="text-sm leading-relaxed font-medium">${client.assessment.injuryNotes}</p>
            </div>
          ` : ''}
        </div>

        <!-- Right Side: Goals & Photos -->
        <div class="lg:col-span-6 space-y-8">
          <div class="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-2xl flex justify-between items-center shadow-lg shadow-green-500/20 text-white relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            <div class="relative z-10">
               <h3 data-i18n="overall_compliance_rate" class="text-xs font-extrabold uppercase tracking-widest mb-1 text-green-50">Overall Compliance Rate</h3>
               <p data-i18n="diet_workout_adherence_last_30" class="text-xs font-medium text-green-100">Diet & Workout Adherence (Last 30 Days)</p>
            </div>
            <div class="text-5xl font-headline font-extrabold relative z-10 drop-shadow-sm">
               88%
            </div>
          </div>
          
          <div class="bg-white/60 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
            <h3 data-i18n="client_goals_posture" class="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-white pb-3 mb-5">Goals & Posture Analysis</h3>
            <form id="edit-client-posture-form" class="space-y-5" onsubmit="window.saveClientPosture(event, '${client.id}')">
              <div>
                <label data-i18n="primary_training_goal" class="text-slate-500 font-medium block mb-2 text-xs">Primary Training Goal:</label>
                <select id="edit-postural-focus" class="w-full bg-white/50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800 shadow-sm hover:border-slate-300">
                  <option data-i18n="hypertrophy_muscle_building" value="Hypertrophy / Muscle Building" ${client.assessment.postural.focus.startsWith('Hypertrophy') ? 'selected' : ''}>Hypertrophy / Muscle Building</option>
                  <option data-i18n="fat_loss_endurance" value="Fat Loss / Endurance" ${client.assessment.postural.focus.startsWith('Fat Loss') ? 'selected' : ''}>Fat Loss / Endurance</option>
                  <option data-i18n="sports_performance" value="Sports Performance" ${client.assessment.postural.focus.startsWith('Sports') ? 'selected' : ''}>Sports Performance</option>
                  <option data-i18n="mobility_rehabilitation" value="Mobility / Rehabilitation" ${client.assessment.postural.focus.startsWith('Mobility') ? 'selected' : ''}>Mobility / Rehabilitation</option>
                </select>
              </div>
              <div>
                <label data-i18n="client_posture_analysis" class="text-slate-500 font-medium block mb-2 text-xs">Client Posture Analysis:</label>
                <textarea id="edit-postural-analysis" class="w-full bg-white/50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] leading-relaxed text-slate-700 shadow-sm hover:border-slate-300">${client.assessment.postural.analysis || ''}</textarea>
              </div>
              <button type="submit" data-i18n="btn_save_assessment" class="bg-primary/10 text-primary text-xs font-bold font-headline py-3 px-5 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm w-full focus:outline-none">
                Save Assessment Changes
              </button>
            </form>
          </div>

          <div class="bg-white/60 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
            <h3 data-i18n="client_nutrition_targets" class="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-white pb-3 mb-5">Nutrition Targets</h3>
            <form id="edit-client-nutrition-form" class="space-y-5" onsubmit="window.saveClientNutrition(event, '${client.id}')">
              <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label data-i18n="target_calories_kcal" class="text-slate-500 font-medium block mb-2 text-xs">Target Calories (kcal):</label>
                    <input type="number" id="edit-nut-cal" value="${nutrition.targets.calories}" class="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800 shadow-sm hover:border-slate-300">
                  </div>
                  <div>
                    <label data-i18n="est_tdee_kcal" class="text-slate-500 font-medium block mb-2 text-xs">Est. TDEE (kcal):</label>
                    <input type="number" id="edit-nut-tdee" value="${nutrition.tdee}" class="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800 shadow-sm hover:border-slate-300">
                  </div>
              </div>
              <div class="grid grid-cols-3 gap-5">
                  <div>
                    <label data-i18n="protein_g" class="text-slate-500 font-medium block mb-2 text-xs">Protein (g):</label>
                    <input type="number" id="edit-nut-pro" value="${nutrition.targets.protein}" class="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800 shadow-sm hover:border-slate-300">
                  </div>
                  <div>
                    <label data-i18n="carbs_g" class="text-slate-500 font-medium block mb-2 text-xs">Carbs (g):</label>
                    <input type="number" id="edit-nut-carb" value="${nutrition.targets.carbs}" class="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800 shadow-sm hover:border-slate-300">
                  </div>
                  <div>
                    <label data-i18n="fat_g" class="text-slate-500 font-medium block mb-2 text-xs">Fat (g):</label>
                    <input type="number" id="edit-nut-fat" value="${nutrition.targets.fat}" class="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800 shadow-sm hover:border-slate-300">
                  </div>
              </div>
              <button type="submit" data-i18n="btn_save_nutrition" class="bg-primary/10 text-primary text-xs font-bold font-headline py-3 px-5 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm w-full focus:outline-none">
                Save Nutrition Targets
              </button>
            </form>
          </div>
          
          <div class="bg-white/60 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
            <h3 data-i18n="progress_photo_gallery" class="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-white pb-3 mb-5">Progress Photo Gallery</h3>
            <div class="grid grid-cols-2 gap-4">
              ${photoHTML}
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Row: Body Progress History Table -->
      <div class="border-t border-white pt-8 mt-4">
        <div class="bg-white/60 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
          <h3 data-i18n="client_body_history" class="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-white pb-3 mb-5">Body Composition Metrics History</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left border-collapse">
              <thead>
                <tr class="border-b-2 border-white text-slate-400">
                  <th data-i18n="date" class="py-3 px-4 font-semibold">Date</th>
                  <th data-i18n="weight" class="py-3 px-4 font-semibold">Weight</th>
                  <th data-i18n="body_fat" class="py-3 px-4 font-semibold">Body Fat</th>
                  <th data-i18n="muscle_mass" class="py-3 px-4 font-semibold">Muscle Mass</th>
                  <th data-i18n="waist_size" class="py-3 px-4 font-semibold">Waist Size</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/50">
                ${progressRows}
              </tbody>
            </table>
          </div>
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
