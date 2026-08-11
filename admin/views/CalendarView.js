import { getSchedule, validateSession, addSchedule } from '../../src/models/ScheduleModel.js';
import { getClients } from '../../src/models/ClientModel.js';
export function renderCalendarView(container) {
  const schedule = getSchedule();

  container.innerHTML = `
<div class="flex justify-between items-center mb-8">
<div>
<h1 class="text-4xl font-headline font-extrabold text-slate-800 tracking-tight" data-i18n="training_schedule">Training Schedule</h1>
<p class="text-base text-slate-500 mt-2 font-medium" data-i18n="manage_weekly_slots_and_valida">Manage weekly slots and validate client session attendance.</p>
</div>
<button class="bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold font-headline px-6 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-300" onclick="window.openCreateScheduleModal()">
<span class="material-symbols-outlined text-[20px]" data-i18n="add">add</span> Add New Schedule
      </button>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
<!-- Calendar Matrix Grid -->
<div class="lg:col-span-8">
<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-8 shadow-sm">
<div class="flex justify-between items-center mb-6 pb-4 border-b border-white">
<h3 class="font-headline font-bold text-lg text-slate-800" data-i18n="monthly_calendar">Monthly Calendar</h3>
<span class="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-lg uppercase tracking-wider" data-i18n="july_2026">July 2026</span>
</div>
<div class="grid grid-cols-7 gap-2 text-center text-xs font-extrabold border-b border-white pb-3 text-slate-500 uppercase tracking-widest">
<span data-i18n="sun">Sun</span><span data-i18n="mon">Mon</span><span data-i18n="tue">Tue</span><span data-i18n="wed">Wed</span><span data-i18n="thu">Thu</span><span data-i18n="fri">Fri</span><span data-i18n="sat">Sat</span>
</div>
<div class="grid grid-cols-7 gap-3 text-center text-xs mt-4">
            ${Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = new Date();
              dateStr.setDate(dayNum);
              const dateIso = dateStr.toISOString().split('T')[0];
              
              const daySessions = schedule.filter(s => s.date === dateIso);
              return `
                <div class="min-h-[100px] p-2 bg-white/50 border border-white hover:border-primary/30 hover:bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col justify-between group cursor-default">
                  <span class="font-bold text-slate-400 group-hover:text-primary transition-colors self-start text-xs bg-slate-100/50 group-hover:bg-primary/10 w-6 h-6 flex items-center justify-center rounded-full">${dayNum}</span>
                  <div class="flex flex-col gap-2 w-full mt-2">
                    ${daySessions.map(s => {
                      let pillColor = 'bg-white text-slate-700 border-white hover:border-slate-200';
                      if (s.type && s.type.includes('Streaming')) {
                        pillColor = 'bg-cyan-50/80 text-cyan-700 border-cyan-100 hover:border-cyan-300';
                      } else if (s.type && s.type.includes('Studio')) {
                        pillColor = 'bg-purple-50/80 text-purple-700 border-purple-100 hover:border-purple-300';
                      } else if (s.type && (s.type.includes('Beban') || s.type.includes('Weights'))) {
                        pillColor = 'bg-orange-50/80 text-orange-700 border-orange-100 hover:border-orange-300';
                      }
                      
                      const dotColor = s.status === 'Confirmed' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-amber-500';
                      return `
                        <button onclick="window.openSessionValidationModal('${s.id}')" class="${pillColor} shadow-sm border border-transparent text-[9px] font-bold p-1.5 rounded-lg text-left truncate w-full transition-all flex items-center gap-1.5 hover:-translate-y-0.5 focus:outline-none">
                          <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
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
      <div class="lg:col-span-4 flex flex-col gap-8">
        <section class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div class="relative z-10">
            <h3 data-i18n="session_status_legend" class="font-headline font-bold text-lg text-slate-800 border-b border-white pb-3 mb-4">Session Status Legend</h3>
            <div class="space-y-4 text-sm">
              <div class="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-white shadow-sm">
                <span class="w-4 h-4 rounded-full bg-green-100 border-2 border-green-400 block shadow-[0_0_8px_rgba(34,197,94,0.3)]"></span> 
                <span data-i18n="confirmed_attended_deducted" class="font-bold text-slate-700">Confirmed (Attended & Deducted)</span>
              </div>
              <div class="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-white shadow-sm">
                <span class="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-400 block"></span> 
                <span data-i18n="pending_trainer_validation" class="font-bold text-slate-700">Pending Trainer Validation</span>
              </div>
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
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative animate-pop-in">
          <h2 data-i18n="attendance_validation_details" class="text-lg font-headline font-bold text-slate-800 mb-2">Attendance Validation Details</h2>
          <p data-i18n="validate_attendance_to_deduct" class="text-xs text-slate-500 mb-4">Validate attendance to deduct 1 session from client package.</p>
          
          <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs mb-6 text-slate-700">
            <div class="flex justify-between"><span data-i18n="client_name">Client Name:</span> <span class="font-bold text-slate-800">${sched.clientName}</span></div>
            <div class="flex justify-between"><span data-i18n="session_time">Session Time:</span> <span class="font-bold text-slate-800">${sched.date} @ ${sched.time}</span></div>
            <div class="flex justify-between"><span data-i18n="workout_type">Workout Type:</span> <span class="font-bold text-[#00677f]">${sched.type}</span></div>
            <div class="flex justify-between border-t border-slate-200/60 pt-2.5"><span data-i18n="attendance_status">Attendance Status:</span> <span class="font-bold uppercase ${sched.validated ? 'text-green-600' : 'text-amber-500'}">${sched.validated ? 'Validated' : 'Pending Validation'}</span></div>
          </div>
  
          <div class="flex gap-3">
            <button data-i18n="back" onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Back</button>
            ${!sched.validated ? `
              <button data-i18n="validate_attendance" onclick="window.validateSessionProcess('${sched.id}')" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Validate Attendance</button>
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
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative animate-pop-in">
          <h2 data-i18n="create_schedule_slot" class="text-lg font-headline font-bold text-slate-800 mb-2">Create Schedule Slot</h2>
          <p data-i18n="create_a_scheduled_training_sl" class="text-xs text-slate-500 mb-4">Create a scheduled training slot for your active clients.</p>
  
          <form id="create-sched-form" class="space-y-4">
            <div>
              <label data-i18n="select_client" class="block text-xs font-bold text-slate-600 mb-1">Select Client</label>
              <select id="sched-client-id" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
                ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label data-i18n="date" class="block text-xs font-bold text-slate-600 mb-1">Date</label>
                <input type="date" id="sched-date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              </div>
              <div>
                <label data-i18n="start_time" class="block text-xs font-bold text-slate-600 mb-1">Start Time</label>
                <input type="time" id="sched-time" required class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
              </div>
            </div>
  
            <div>
              <label data-i18n="workout_type_location" class="block text-xs font-bold text-slate-600 mb-1">Workout Type / Location</label>
              <select id="sched-type" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none">
                <option data-i18n="free_weights_main_gym_barbell" value="Free Weights (Gym)">Free Weights (Main Gym Barbell Area)</option>
                <option data-i18n="studio_class_floor_2" value="Studio Class">Studio Class (Floor 2)</option>
                <option data-i18n="online_streaming_zoom" value="Online Streaming">Online Streaming (Zoom)</option>
              </select>
            </div>
  
            <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button data-i18n="cancel" type="button" onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button data-i18n="save_slot" type="submit" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Slot</button>
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
