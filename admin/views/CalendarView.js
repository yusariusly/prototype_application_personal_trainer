import { getSchedule, validateSession, addSchedule } from '../../src/models/ScheduleModel.js';
import { getClients } from '../../src/models/ClientModel.js';
export function renderCalendarView(container) {
  const schedule = getSchedule();

  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-headline font-extrabold text-[#0b1c30]">Training Schedule</h1>
        <p class="text-sm text-slate-500 mt-1">Manage weekly slots and validate client session attendance.</p>
      </div>
      <button onclick="window.openCreateScheduleModal()" class="bg-primary hover:bg-[#8f3200] text-white text-xs font-bold font-headline px-5 py-3.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all">
        <span class="material-symbols-outlined text-[18px]">add</span> + Add New Schedule
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Calendar Matrix Grid -->
      <div class="lg:col-span-8">
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 class="font-headline font-bold text-sm text-slate-800">Monthly Calendar</h3>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">July 2026</span>
          </div>

          <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-2 text-slate-400 uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="grid grid-cols-7 gap-2 text-center text-xs mt-3">
            ${Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = new Date();
              dateStr.setDate(dayNum);
              const dateIso = dateStr.toISOString().split('T')[0];
              
              const daySessions = schedule.filter(s => s.date === dateIso);
              return `
                <div class="min-h-24 p-1.5 border border-slate-100 hover:bg-slate-50/50 rounded-lg flex flex-col justify-between">
                  <span class="font-bold text-slate-400 self-start text-[10px]">${dayNum}</span>
                  <div class="flex flex-col gap-1.5 w-full mt-1.5">
                    ${daySessions.map(s => {
                      let pillColor = 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100';
                      if (s.type && s.type.includes('Streaming')) {
                        pillColor = 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100';
                      } else if (s.type && s.type.includes('Studio')) {
                        pillColor = 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100';
                      } else if (s.type && (s.type.includes('Beban') || s.type.includes('Weights'))) {
                        pillColor = 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100';
                      }
                      
                      const dotColor = s.status === 'Confirmed' ? 'bg-green-500' : 'bg-amber-500';
                      return `
                        <button onclick="window.openSessionValidationModal('${s.id}')" class="${pillColor} text-[8px] font-bold p-1 rounded text-left truncate w-full transition-colors flex items-center gap-1.5 focus:outline-none">
                          <span class="w-1.5 h-1.5 rounded-full ${dotColor} shrink-0"></span>
                          <span class="truncate">${s.time} - ${s.clientName}</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Legend sidebar -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Session Status Legend</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-green-100 border border-green-300 block"></span> 
              <span class="font-medium text-slate-700">Confirmed (Attended & Deducted)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 block"></span> 
              <span class="font-medium text-slate-700">Pending Trainer Validation</span>
            </div>
          </div>
        </section>
      </div>

    </div>
  `;
}

export function setupCalendarGlobalHandlers(renderView, showToast, closeModal) {
  window.openSessionValidationModal = function(schedId) {
    const sched = getSchedule().find(s => s.id === schedId);
    if (!sched) return;
  
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">Attendance Validation Details</h2>
          <p class="text-xs text-slate-500 mb-4">Validate attendance to deduct 1 session from client package.</p>
          
          <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs mb-6 text-slate-700">
            <div class="flex justify-between"><span>Client Name:</span> <span class="font-bold text-slate-800">${sched.clientName}</span></div>
            <div class="flex justify-between"><span>Session Time:</span> <span class="font-bold text-slate-800">${sched.date} @ ${sched.time}</span></div>
            <div class="flex justify-between"><span>Workout Type:</span> <span class="font-bold text-[#00677f]">${sched.type}</span></div>
            <div class="flex justify-between border-t border-slate-200/60 pt-2.5"><span>Attendance Status:</span> <span class="font-bold uppercase ${sched.validated ? 'text-green-600' : 'text-amber-500'}">${sched.validated ? 'Validated' : 'Pending Validation'}</span></div>
          </div>
  
          <div class="flex gap-3">
            <button onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Back</button>
            ${!sched.validated ? `
              <button onclick="window.validateSessionProcess('${sched.id}')" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Validate Attendance</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  };

  window.validateSessionProcess = function(schedId) {
    const success = validateSession(schedId);
    closeModal();
    renderView();
    if (success) {
      showToast('Attendance validated successfully. Session package quota updated!', 'success');
    }
  };

  window.openCreateScheduleModal = function() {
    const clients = getClients();
    const modalRoot = document.getElementById('modal-root');
    
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 class="text-lg font-headline font-bold text-slate-800 mb-2">Create Schedule Slot</h2>
          <p class="text-xs text-slate-500 mb-4">Create a scheduled training slot for your active clients.</p>
  
          <form id="create-sched-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Select Client</label>
              <select id="sched-client-id" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
                ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Date</label>
                <input type="date" id="sched-date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Start Time</label>
                <input type="time" id="sched-time" required class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              </div>
            </div>
  
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Workout Type / Location</label>
              <select id="sched-type" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
                <option value="Free Weights (Gym)">Free Weights (Main Gym Barbell Area)</option>
                <option value="Studio Class">Studio Class (Floor 2)</option>
                <option value="Online Streaming">Online Streaming (Zoom)</option>
              </select>
            </div>
  
            <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Slot</button>
            </div>
          </form>
        </div>
      </div>
    `;
  
    document.getElementById('create-sched-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const clientId = document.getElementById('sched-client-id').value;
      const client = clients.find(c => c.id === clientId);
      const date = document.getElementById('sched-date').value;
      const time = document.getElementById('sched-time').value;
      const type = document.getElementById('sched-type').value;
      
      try {
        addSchedule({
          clientId,
          clientName: client.name,
          date,
          time,
          duration: 60,
          type,
          location: type === 'Online Streaming' ? 'Zoom Meeting' : 'Main Gym Barbell Area',
          status: 'Confirmed'
        });
  
        closeModal();
        renderView();
        showToast('Session schedule saved successfully!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };
}
