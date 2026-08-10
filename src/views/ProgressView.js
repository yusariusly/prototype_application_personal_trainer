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
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-lg rounded-2xl p-7 border border-slate-100 shadow-2xl relative overflow-hidden">
          <div id="ai-scan-header">
            <h2 data-i18n="modal_ai_scan_title" class="text-xl font-headline font-bold text-indigo-900 mb-2">AI Posture & Body Scan</h2>
            <p data-i18n="modal_ai_scan_sub" class="text-xs text-slate-500 mb-6">Upload or capture a photo to analyze your body posture and shape using AI.</p>
          </div>
          
          <div id="ai-scan-content" class="space-y-5">
            <div>
              <label data-i18n="ai_scan_category" class="block text-xs font-bold text-slate-600 mb-2">Analysis Category</label>
              <select id="ai-scan-category" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-0">
                <option data-i18n="ai_cat_posture" value="posture">Posture Alignment</option>
                <option data-i18n="ai_cat_muscle" value="muscle">Muscle Symmetry</option>
                <option data-i18n="ai_cat_shape" value="shape">Body Shape Analysis</option>
              </select>
            </div>

            <div id="ai-preview-container" class="relative">
              <div class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm animate-pulse flex items-center gap-1 z-10">
                <span class="w-2 h-2 rounded-full bg-white block"></span> REC
              </div>
              <img id="ai-photo-preview" src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" class="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-inner">
            </div>

            <div class="w-full">
              <button type="button" class="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl p-4 flex items-center justify-center gap-2 transition-colors text-indigo-700" onclick="document.getElementById('ai-photo-upload').click()">
                <span class="material-symbols-outlined text-xl">upload_file</span>
                <span data-i18n="ai_scan_upload" class="font-bold text-sm">Upload Photo</span>
              </button>
            </div>
            <input type="file" id="ai-photo-upload" accept="image/*" class="hidden" onchange="document.getElementById('ai-photo-preview').src = URL.createObjectURL(this.files[0]); document.querySelector('#ai-preview-container .absolute')?.classList.add('hidden');">

            <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onclick="window.closeModal()" data-i18n="btn_cancel" class="flex-1 border border-slate-200 text-slate-600 py-3 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="button" onclick="window.startAiScan()" data-i18n="btn_start_ai_scan" class="flex-1 bg-indigo-600 text-white py-3 text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">Start AI Scan</button>
            </div>
          </div>

          <!-- Loading State -->
          <div id="ai-scan-loading" class="hidden flex flex-col items-center justify-center py-10">
            <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h3 data-i18n="ai_analyzing" class="text-indigo-900 font-bold font-headline animate-pulse">AI is analyzing your photo...</h3>
          </div>

          <!-- Result State -->
          <div id="ai-scan-result" class="hidden space-y-4">
            <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <h3 data-i18n="ai_result_title" class="font-headline font-bold text-indigo-900 mb-2 text-lg">Analysis Result</h3>
              
              <div class="mb-3">
                <h4 data-i18n="ai_finding" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Finding</h4>
                <p id="ai-result-finding" class="text-sm text-slate-700 font-medium"></p>
              </div>
              
              <div>
                <h4 data-i18n="ai_solution" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Suggested Solution</h4>
                <p id="ai-result-solution" class="text-sm text-slate-700 font-medium"></p>
              </div>
            </div>

            <div class="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
              <span class="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
              <p data-i18n="ai_disclaimer" class="text-xs text-amber-800 font-medium leading-relaxed">
                Disclaimer: This analysis is generated by AI and may not be 100% accurate. Please share these results with your trainer for professional validation and advice.
              </p>
            </div>

            <div class="flex pt-2">
              <button type="button" onclick="window.closeModal()" class="w-full bg-slate-800 text-white py-3 text-sm font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-md">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    translateDOM();
  };


  window.startAiScan = function() {
    const previewContainer = document.getElementById('ai-preview-container');
    if (previewContainer.classList.contains('hidden')) {
      showToast('Please upload or capture a photo first.', 'error');
      return;
    }

    const category = document.getElementById('ai-scan-category').value;
    
    document.getElementById('ai-scan-header').classList.add('hidden');
    document.getElementById('ai-scan-content').classList.add('hidden');
    document.getElementById('ai-scan-loading').classList.remove('hidden');

    // Simulate AI Processing Delay
    setTimeout(() => {
      document.getElementById('ai-scan-loading').classList.add('hidden');
      document.getElementById('ai-scan-result').classList.remove('hidden');

      // Mock AI Responses based on category
      let finding = "";
      let solution = "";
      
      if (category === 'posture') {
        finding = "Mild forward head posture and slight rounded shoulders detected. Pelvic tilt appears neutral.";
        solution = "Incorporate chin tucks, wall angels, and chest stretches daily. Strengthen the mid and lower trapezius.";
      } else if (category === 'muscle') {
        finding = "Left shoulder sits slightly higher than the right. Possible overactive right latissimus dorsi or left upper trapezius.";
        solution = "Focus on unilateral pulling exercises. Stretch the left upper trap and mobilize the thoracic spine.";
      } else {
        finding = "Upper body development is progressing well. Slightly disproportionate development between anterior and posterior deltoids.";
        solution = "Increase volume on face pulls and rear delt flyes to improve posterior shoulder development.";
      }

      document.getElementById('ai-result-finding').innerText = finding;
      document.getElementById('ai-result-solution').innerText = solution;
    }, 3500);
  };
}
