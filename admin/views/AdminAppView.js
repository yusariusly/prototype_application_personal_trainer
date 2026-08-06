import { saveState } from '../../src/models/Store.js';
import { getPrograms } from '../../src/models/ProgramModel.js';
import { saveClient } from '../../src/models/ClientModel.js';
import { updateProgram } from '../../src/models/ProgramModel.js';

let currentOnboardingStep = 1;
let onboardingData = {};

export function updateHeaderSelection(activeTab) {
  const tabs = ['dashboard', 'clients', 'calendar', 'builder', 'packages', 'messages'];
  tabs.forEach(t => {
    const el = document.getElementById(`nav-${t}`);
    if (el) {
      const isTabActive = t === activeTab || (t === 'clients' && activeTab === 'client-detail');
      if (isTabActive) {
        el.className = "h-full px-4 text-sm font-headline font-semibold text-primary border-b-2 border-primary transition-all";
      } else {
        el.className = "h-full px-4 text-sm font-headline font-semibold text-secondary hover:text-primary transition-all";
      }
    }
  });
}

export function setupAdminAppGlobalHandlers(renderView) {
  window.handleLogout = function() {
    localStorage.removeItem('elite_pt_role');
    window.location.href = '../index.html';
  };

  window.closeModal = function() {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = '';
    }
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

  window.toggleProfileDropdown = function() {
    const drop = document.getElementById('profile-dropdown');
    if (drop) {
      drop.classList.toggle('hidden');
    }
  };

  window.toggleLanguage = function(e) {
    if (e) e.stopPropagation();
    const isEn = localStorage.getItem('elite_pt_lang') !== 'id';
    localStorage.setItem('elite_pt_lang', isEn ? 'id' : 'en');
    updateLanguageIndicator();
    if(window.renderView) window.renderView();
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

  window.openOnboardingWizard = function() {
    currentOnboardingStep = 1;
    onboardingData = {
      name: '', email: '', phone: '', packageTotal: 12,
      hasInjury: 'no', injuryNotes: '',
      posturalFocus: 'Hypertrophy / Muscle Building', posturalAnalysis: ''
    };
    renderOnboardingModal(renderView);
  };

  window.navigateOnboardingStep = function(amount) {
    currentOnboardingStep = Math.max(1, currentOnboardingStep + amount);
    renderOnboardingModal(renderView);
  };

  updateLanguageIndicator();
}

function updateLanguageIndicator() {
  const isId = localStorage.getItem('elite_pt_lang') === 'id';
  const langEl = document.getElementById('lang-indicator');
  if (langEl) langEl.textContent = isId ? 'ID' : 'EN';
  
  // Basic Nav Translations
  const navKeys = ['dashboard', 'clients', 'calendar', 'builder', 'packages', 'messages'];
  const textEn = ['Dashboard', 'Clients', 'Schedule', 'Workouts', 'Sales', 'Messages'];
  const textId = ['Dasbor', 'Klien', 'Jadwal', 'Latihan', 'Penjualan', 'Obrolan'];
  
  navKeys.forEach((key, index) => {
    const el = document.getElementById(`nav-${key}`);
    if (el) el.textContent = isId ? textId[index] : textEn[index];
  });
}

function renderOnboardingModal(renderView) {
  const modalRoot = document.getElementById('modal-root');
  
  let stepHTML = '';
  if (currentOnboardingStep === 1) {
    stepHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-headline font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Step 1: Personal Details & Session Package</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Client Name</label>
            <input type="text" id="wizard-name" value="${onboardingData.name}" required placeholder="Marcus Johnson" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
            <input type="email" id="wizard-email" value="${onboardingData.email}" required placeholder="marcus.j@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
            <input type="text" id="wizard-phone" value="${onboardingData.phone}" required placeholder="+62 812-xxxx-xxxx" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Training Package (Sessions)</label>
            <select id="wizard-package" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              <option value="10" ${onboardingData.packageTotal === 10 ? 'selected' : ''}>10-Session Package</option>
              <option value="12" ${onboardingData.packageTotal === 12 ? 'selected' : ''}>12-Session Package</option>
              <option value="20" ${onboardingData.packageTotal === 20 ? 'selected' : ''}>20-Session Package</option>
              <option value="30" ${onboardingData.packageTotal === 30 ? 'selected' : ''}>30-Session Package</option>
            </select>
          </div>
        </div>
      </div>
    `;
  } else if (currentOnboardingStep === 2) {
    stepHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-headline font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Step 2: Medical Questionnaire (PAR-Q)</h3>
        
        <div class="bg-error-container text-error rounded-lg p-3 text-[10px] mb-4 flex gap-2 border border-red-200">
          <span class="material-symbols-outlined text-[16px] shrink-0">warning</span>
          <p class="font-medium">Marking "Yes" triggers a visual Red Flag warning badge on client profile.</p>
        </div>

        <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
          <div class="flex items-start justify-between text-xs gap-3">
            <span>1. Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?</span>
            <select id="parq-q1" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>2. Do you feel pain in your chest when you perform physical activity?</span>
            <select id="parq-q2" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>3. In the past month, have you had chest pain when you were not doing physical activity?</span>
            <select id="parq-q3" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>4. Do you lose your balance because of dizziness or do you ever lose consciousness?</span>
            <select id="parq-q4" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          <div class="flex items-start justify-between text-xs gap-3">
            <span>5. Do you have a bone or joint problem that could be made worse by a change in your physical activity?</span>
            <select id="parq-q5" class="bg-slate-50 border border-slate-200 rounded text-xs py-0.5 px-1.5"><option value="no">No</option><option value="yes">Yes</option></select>
          </div>
          
          <div class="border-t border-slate-100 pt-3">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Medical Injury Notes (Red Flag Notes)</label>
            <textarea id="wizard-injury-notes" placeholder="Write specific injury details here if any..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary h-16">${onboardingData.injuryNotes}</textarea>
          </div>
        </div>
      </div>
    `;
  } else if (currentOnboardingStep === 3) {
    stepHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-headline font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Step 3: Training Goals & Posture</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Primary Training Focus</label>
            <select id="wizard-focus" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              <option value="Hypertrophy / Muscle Building" ${onboardingData.posturalFocus.includes('Hypertrophy') ? 'selected' : ''}>Hypertrophy / Muscle Building</option>
              <option value="Fat Loss / Weight Loss" ${onboardingData.posturalFocus.includes('Fat Loss') ? 'selected' : ''}>Fat Loss / Weight Loss</option>
              <option value="Strength / Power" ${onboardingData.posturalFocus.includes('Strength') ? 'selected' : ''}>Strength / Maximal Power</option>
              <option value="Rehabilitation" ${onboardingData.posturalFocus.includes('Rehabilitation') ? 'selected' : ''}>Injury Rehabilitation</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Posture Analysis (Postural Analysis)</label>
            <textarea id="wizard-postural" placeholder="Write initial posture screening or squat test results..." class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary h-24">${onboardingData.posturalAnalysis}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-xl p-6 border border-slate-100 shadow-2xl relative">
        <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">New Client Onboarding</h2>
        <p class="text-xs text-slate-500 mb-6">Complete the registration form to build the client profile.</p>
        
        <!-- Steps Stepper -->
        <div class="flex items-center justify-between mb-6 relative">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentOnboardingStep >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}">1</div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentOnboardingStep >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}">2</div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentOnboardingStep >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}">3</div>
        </div>

        <form id="onboarding-form" class="space-y-4">
          ${stepHTML}
          
          <div class="flex gap-3 pt-4 border-t border-slate-100">
            ${currentOnboardingStep > 1 ? `
              <button type="button" onclick="window.navigateOnboardingStep(-1)" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Previous</button>
            ` : `
              <button type="button" onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            `}
            
            ${currentOnboardingStep < 3 ? `
              <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Next</button>
            ` : `
              <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Client</button>
            `}
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentOnboardingStep === 1) {
      onboardingData.name = document.getElementById('wizard-name').value;
      onboardingData.email = document.getElementById('wizard-email').value;
      onboardingData.phone = document.getElementById('wizard-phone').value;
      onboardingData.packageTotal = parseInt(document.getElementById('wizard-package').value);
      
      currentOnboardingStep = 2;
      renderOnboardingModal(renderView);
    } else if (currentOnboardingStep === 2) {
      const q1 = document.getElementById('parq-q1').value;
      const q2 = document.getElementById('parq-q2').value;
      const q3 = document.getElementById('parq-q3').value;
      const q4 = document.getElementById('parq-q4').value;
      const q5 = document.getElementById('parq-q5').value;
      onboardingData.injuryNotes = document.getElementById('wizard-injury-notes').value;
      
      onboardingData.hasInjury = (q1 === 'yes' || q2 === 'yes' || q3 === 'yes' || q4 === 'yes' || q5 === 'yes' || onboardingData.injuryNotes.trim() !== '');
      onboardingData.parq = { q1, q2, q3, q4, q5, q6: 'no', q7: 'no' };

      currentOnboardingStep = 3;
      renderOnboardingModal(renderView);
    } else if (currentOnboardingStep === 3) {
      onboardingData.posturalFocus = document.getElementById('wizard-focus').value;
      onboardingData.posturalAnalysis = document.getElementById('wizard-postural').value;

      const newClientId = `client-${Date.now()}`;
      const newClient = {
        id: newClientId,
        name: onboardingData.name,
        email: onboardingData.email,
        phone: onboardingData.phone,
        avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Active',
        package: {
          name: `${onboardingData.packageTotal}-Session Package`,
          total: onboardingData.packageTotal,
          remaining: onboardingData.packageTotal
        },
        assessment: {
          hasInjury: onboardingData.hasInjury,
          injuryNotes: onboardingData.injuryNotes,
          medicalCleared: true,
          parq: onboardingData.parq,
          postural: {
            focus: onboardingData.posturalFocus,
            analysis: onboardingData.posturalAnalysis
          }
        },
        bodyProgress: [
          { date: 'Initial', weight: 80.0, bodyFat: 25.0, muscleMass: 30.0, waist: 90 }
        ],
        photos: [],
        habits: {
          water: { current: 0, target: 3.0 },
          sleep: { current: 0, target: 8.0 },
          steps: { current: 0, target: 10000 },
          completedToday: []
        }
      };

      const programs = getPrograms();
      programs[newClientId] = {
        focus: onboardingData.posturalFocus,
        mesocycle: 'Phase 1: Initial Conditioning',
        exercises: []
      };

      saveClient(newClient);
      window.closeModal();
      renderView();
      window.showToast('New client onboarding completed successfully!', 'success');
    }
  });
}
