import { getActiveClient } from '../models/ClientModel.js';
import { saveState } from '../models/Store.js';
import { t, translateDOM } from '../i18n.js';

let chartInstance = null;

export function renderProgressView(container, client) {
  const lastProgress = client.bodyProgress[client.bodyProgress.length - 1];

  container.innerHTML = `
<div class="flex justify-between items-center">
<div>
<h1 class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]" data-i18n="progress_title">Physical Progress Chart</h1>
<p class="text-xs text-slate-500 mt-1" data-i18n="progress_sub">Track your body composition progress week by week.</p>
</div>
<div class="flex gap-2">
<button class="bg-indigo-600 text-white text-xs font-bold font-headline px-4 py-3 rounded-lg flex items-center gap-1.5 shadow-md hover:bg-indigo-700 transition-all" data-i18n="btn_ai_scan" onclick="window.openAiScanModal()">
<span class="material-symbols-outlined text-[18px]">document_scanner</span> AI Scan
      </button>
<button class="bg-primary text-white text-xs font-bold font-headline px-4 py-3 rounded-lg flex items-center gap-1.5 shadow-md hover:bg-primary-container transition-all" data-i18n="btn_log_new_metrics" onclick="window.openAddProgressModal()">
<span class="material-symbols-outlined text-[18px]" data-i18n="add">add</span> Log New Metrics
      </button>
</div>
</div>
<!-- Weight highlight card -->
<div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm border-l-4 border-l-primary max-w-sm">
<span class="text-slate-400 font-bold text-[9px] uppercase tracking-wider block" data-i18n="latest_body_weight">Latest Body Weight</span>
<span class="text-2xl font-headline font-extrabold text-[#0b1c30] mt-1 block">${lastProgress.weight} kg</span>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
<!-- Chart Card -->
<div class="lg:col-span-8 flex flex-col gap-6">
<div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
<h3 class="font-headline font-bold text-sm text-slate-800 mb-4 flex items-center gap-2" data-i18n="trend_title">
<span class="material-symbols-outlined text-primary text-[20px]" data-i18n="show_chart">show_chart</span>
            Body Weight & Body Fat % Trend
          </h3>
<div class="h-64 md:h-80 w-full relative">
<canvas class="w-full h-full" id="progress-chart"></canvas>
</div>
</div>
<!-- Metric logs listing -->
<div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
<h3 class="font-headline font-bold text-sm text-slate-800 mb-4" data-i18n="metrics_history_title">Metrics History Log</h3>
<div class="overflow-x-auto">
<table class="w-full text-left text-xs border-collapse">
<thead>
<tr class="border-b border-slate-100 text-slate-400 font-bold uppercase bg-slate-50/50">
<th class="py-3 px-3" data-i18n="table_date">Date</th>
<th class="py-3 px-3 text-right" data-i18n="table_weight">Weight</th>
<th class="py-3 px-3 text-right" data-i18n="table_bodyfat">Body Fat %</th>
<th class="py-3 px-3 text-right" data-i18n="table_muscle">Muscle Mass</th>
<th class="py-3 px-3 text-right" data-i18n="table_waist">Waist Size</th>
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
          <h3 data-i18n="photos_timeline" class="font-headline font-bold text-sm text-slate-800">Body Photo Timeline</h3>
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
          


`;

  // translate DOM after render
  translateDOM();

  setTimeout(() => {
    drawProgressChart(client);
  }, 100);
}

function drawProgressChart(client) {
  const ctx = document.getElementById('progress-chart');
  if (!ctx || !window.Chart) return;

  const labels = client.bodyProgress.map(p => p.date);
  const weights = client.bodyProgress.map(p => p.weight);
  const bodyFats = client.bodyProgress.map(p => p.bodyFat);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new window.Chart(ctx, {
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

export function setupProgressGlobalHandlers(renderView, showToast, closeModal) {
  window.openAddProgressModal = function() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 data-i18n="modal_add_progress_title" class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Add Progress Log</h2>
          <p data-i18n="modal_add_progress_sub" class="text-xs text-slate-500 mb-4">Record your periodic body metrics to monitor your transformation.</p>
          
          <form id="progress-log-form" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label data-i18n="label_body_weight" class="block text-xs font-bold text-slate-600 mb-1">Body Weight (kg)</label>
                <input type="number" step="0.1" required id="log-weight" placeholder="e.g. 82.5" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
              </div>
              <div>
                <label data-i18n="label_body_fat" class="block text-xs font-bold text-slate-600 mb-1">Body Fat (%)</label>
                <input type="number" step="0.1" required id="log-fat" placeholder="e.g. 19.2" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label data-i18n="label_muscle_mass" class="block text-xs font-bold text-slate-600 mb-1">Muscle Mass (kg)</label>
                <input type="number" step="0.1" required id="log-muscle" placeholder="e.g. 39.5" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
              </div>
              <div>
                <label data-i18n="label_waist_size" class="block text-xs font-bold text-slate-600 mb-1">Waist Size (cm)</label>
                <input type="number" required id="log-waist" placeholder="e.g. 88" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary focus:ring-0">
              </div>
            </div>

            <div>
              <label data-i18n="label_upload_photo" class="block text-xs font-bold text-slate-600 mb-1">Upload Progress Photo (Optional)</label>
              <input type="file" id="log-photo-file" accept="image/*" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-primary focus:ring-0">
            </div>

            <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onclick="window.closeModal()" data-i18n="btn_cancel" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" data-i18n="btn_save_progress" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Progress</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // translate modal content
    translateDOM();

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
        showToast(t('progress_saved_success'), 'success');
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
  };

  window.openAiScanModal = function() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="bg-primary text-white p-5 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[28px] animate-pulse">document_scanner</span>
              <div>
                <h3 data-i18n="ai_posture_scanner" class="text-base font-bold font-headline">AI Posture Scanner</h3>
                <p data-i18n="ai_scan_subtitle" class="text-[10px] text-white/80 font-medium mt-0.5 tracking-wide">Real-time AI Body Analysis</p>
              </div>
            </div>
            <button onclick="window.closeModal()" class="text-white/80 hover:text-white transition-colors"><span class="material-symbols-outlined text-[24px]">close</span></button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6 flex-grow bg-slate-50/50">
            <!-- Camera Simulator -->
            <div id="ai-preview-container" class="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex flex-col items-center justify-center group">
              <!-- Scanner Laser Overlay -->
              <div id="scanner-laser" class="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#a73b00] z-20 hidden animate-[scan_2.5s_ease-in-out_infinite]" style="top: 0%;"></div>
              <style>
                  @keyframes scan {
                      0% { top: 0%; opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { top: 100%; opacity: 0; }
                  }
              </style>

              <img id="ai-photo-preview" src="" class="w-full h-full object-cover hidden z-0 absolute inset-0">
              
              <div id="scanner-ui-overlay" class="absolute inset-0 flex flex-col items-center justify-center p-5 text-center gap-3 bg-slate-950/80 z-10">
                <span data-i18n="ai_camera_sim" class="text-xs font-bold text-white tracking-widest uppercase">AI Camera Simulator</span>
                <p data-i18n="modal_ai_scan_sub" class="text-[11px] text-slate-300 max-w-xs leading-relaxed">Upload a body posture photo from your device or pick a posture sample below to scan.</p>
                <button type="button" class="mt-2 bg-primary hover:bg-[#8f3200] text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95" onclick="document.getElementById('ai-photo-upload').click()">
                  <span class="material-symbols-outlined text-[18px]">add_a_photo</span> <span data-i18n="btn_upload_scan_photo">Upload & Scan Photo</span>
                </button>
              </div>
              <input type="file" id="ai-photo-upload" accept="image/*" class="hidden" onchange="window.handleAiPhotoUpload(event)">
            </div>

            <!-- Samples Section -->
            <div id="ai-samples-section" class="flex flex-col gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 data-i18n="posture_samples_title" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Posture Samples (Synced from Specialist)</h4>
              <div class="flex flex-wrap gap-2 mt-1">
                <button type="button" onclick="window.selectPostureSample('Forward Head', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">accessibility_new</span> <span data-i18n="sample_forward_head">Forward Head</span>
                </button>
                <button type="button" onclick="window.selectPostureSample('Rounded Shoulders', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">accessibility_new</span> <span data-i18n="sample_rounded_shoulders">Rounded Shoulders</span>
                </button>
                <button type="button" onclick="window.selectPostureSample('Anterior Pelvic Tilt', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">accessibility_new</span> <span data-i18n="sample_apt">Anterior Pelvic Tilt</span>
                </button>
                <button type="button" onclick="window.selectPostureSample('Neutral Posture', 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">accessibility_new</span> <span data-i18n="sample_neutral">Neutral Posture</span>
                </button>
              </div>
            </div>

            <!-- Analysis Category (Hidden but required for logic) -->
            <select id="ai-scan-category" class="hidden">
              <option value="posture">Posture Alignment</option>
            </select>

            <!-- Loading State Logs -->
            <div id="ai-scan-loading" class="hidden bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-inner">
              <div id="log-step-1" class="flex items-center gap-3 text-slate-400 text-xs font-bold transition-all"><span class="material-symbols-outlined text-[18px]">document_scanner</span> <span data-i18n="log_identifying_joints">Identifying body joints...</span></div>
              <div id="log-step-2" class="flex items-center gap-3 text-slate-400 text-xs font-bold transition-all"><span class="material-symbols-outlined text-[18px]">straighten</span> <span data-i18n="log_estimating_angles">Estimating joint angles...</span></div>
              <div id="log-step-3" class="flex items-center gap-3 text-slate-400 text-xs font-bold transition-all"><span class="material-symbols-outlined text-[18px]">psychology</span> <span data-i18n="log_extracting_metrics">Extracting posture metrics...</span></div>
            </div>

            <!-- Result State -->
            <div id="ai-scan-result" class="hidden space-y-4">
              <div class="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                <div class="flex justify-between items-start mb-4 border-b border-primary/10 pb-3">
                  <div>
                    <h3 data-i18n="ai_result_title" class="font-headline font-bold text-primary text-sm">Analysis Result</h3>
                    <p data-i18n="ai_cat_posture" class="text-[10px] text-slate-500 mt-0.5 font-semibold">Posture Alignment</p>
                  </div>
                  <span data-i18n="ai_confidence" class="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold border border-primary/20">89% confidence</span>
                </div>
                
                <div class="mb-4">
                  <h4 data-i18n="ai_finding" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">AI Finding</h4>
                  <p id="ai-result-finding" class="text-xs text-slate-700 font-medium leading-relaxed"></p>
                </div>
                
                <div>
                  <h4 data-i18n="ai_solution" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Suggested Solution</h4>
                  <p id="ai-result-solution" class="text-xs text-slate-700 font-medium leading-relaxed"></p>
                </div>
              </div>

              <div class="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3 shadow-sm">
                <span class="material-symbols-outlined text-amber-500 mt-0.5 text-[20px]">warning</span>
                <p data-i18n="ai_disclaimer" class="text-[10px] text-amber-800 font-medium leading-relaxed">
                  Disclaimer: This analysis is generated by AI and may not be 100% accurate. Please share these results with your trainer for professional validation.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <button type="button" onclick="window.closeModal()" data-i18n="btn_cancel" class="border border-slate-300 bg-white text-slate-600 py-2 px-5 text-xs font-bold rounded-full hover:bg-slate-100 transition-colors">Cancel</button>
            <button id="btn-log-scanned" type="button" onclick="window.closeModal()" data-i18n="btn_log_scanned_result" class="bg-slate-300 text-slate-500 py-2 px-5 text-xs font-bold rounded-full shadow-sm cursor-not-allowed transition-colors" disabled>Log Scanned Result</button>
          </div>
        </div>
      </div>
    `;
    translateDOM();
  };

  window.handleAiPhotoUpload = function(event) {
    if (event.target.files && event.target.files[0]) {
      const url = URL.createObjectURL(event.target.files[0]);
      window.startAiScanSimulation(url);
    }
  };

  window.selectPostureSample = function(name, url) {
    window.startAiScanSimulation(url, name);
  };

  window.startAiScanSimulation = function(imageUrl, sampleName = "") {
    const preview = document.getElementById('ai-photo-preview');
    const overlay = document.getElementById('scanner-ui-overlay');
    const laser = document.getElementById('scanner-laser');
    const loading = document.getElementById('ai-scan-loading');
    const result = document.getElementById('ai-scan-result');
    const samples = document.getElementById('ai-samples-section');
    const logBtn = document.getElementById('btn-log-scanned');
    
    // Hide UI overlay, show image and laser
    preview.src = imageUrl;
    preview.classList.remove('hidden');
    overlay.classList.add('hidden');
    laser.classList.remove('hidden');
    samples.classList.add('hidden');
    
    // Show loading logs
    loading.classList.remove('hidden');
    result.classList.add('hidden');
    
    // Reset logs
    const step1 = document.getElementById('log-step-1');
    const step2 = document.getElementById('log-step-2');
    const step3 = document.getElementById('log-step-3');
    
    step1.className = "flex items-center gap-3 text-slate-400 text-xs font-bold transition-all opacity-50";
    step2.className = "flex items-center gap-3 text-slate-400 text-xs font-bold transition-all opacity-50";
    step3.className = "flex items-center gap-3 text-slate-400 text-xs font-bold transition-all opacity-50";

    // Simulate analysis steps
    setTimeout(() => {
        step1.className = "flex items-center gap-3 text-primary text-xs font-bold transition-all";
    }, 500);
    
    setTimeout(() => {
        step2.className = "flex items-center gap-3 text-primary text-xs font-bold transition-all";
    }, 1500);
    
    setTimeout(() => {
        step3.className = "flex items-center gap-3 text-primary text-xs font-bold transition-all";
    }, 2500);

    // Show result
    setTimeout(() => {
      laser.classList.add('hidden');
      loading.classList.add('hidden');
      result.classList.remove('hidden');
      
      // Enable log button
      logBtn.disabled = false;
      logBtn.className = "bg-primary text-white py-2 px-5 text-xs font-bold rounded-full shadow-md hover:bg-[#8f3200] transition-colors";
      
      // Mock AI Responses based on sample name or fallback
      let finding = t('ai_finding_1');
      let solution = t('ai_solution_1');
      
      if (sampleName.includes('Anterior Pelvic Tilt')) {
          finding = t('ai_finding_2');
          solution = t('ai_solution_2');
      } else if (sampleName.includes('Neutral')) {
          finding = t('ai_finding_3');
          solution = t('ai_solution_3');
      }

      document.getElementById('ai-result-finding').innerHTML = finding;
      document.getElementById('ai-result-solution').innerHTML = solution;
    }, 3500);
  };
}
