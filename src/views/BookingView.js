import { getActiveClient } from '../models/ClientModel.js';
import { saveState } from '../models/Store.js';
import { getSchedule, addSchedule } from '../models/ScheduleModel.js';

export function renderBookingView(container, client) {
  const schedule = getSchedule().filter(s => s.clientId === client.id);
  
  const defaultSlots = [
    { time: '08:00', type: 'Free Weights (Gym)' },
    { time: '10:00', type: 'Studio Class' },
    { time: '13:00', type: 'Free Weights (Gym)' },
    { time: '15:30', type: 'Online Streaming' },
    { time: '17:00', type: 'Studio Class' }
  ];

  if (!container.dataset.selectedDate) {
    container.dataset.selectedDate = new Date().toISOString().split('T')[0];
  }
  const selectedDate = container.dataset.selectedDate;

  container.innerHTML = `
    <div>
      <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-[#0b1c30]">Schedule Booking</h1>
      <p class="text-xs text-slate-500 mt-1">Book in-person personal training or virtual sessions.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: Calendar Picker & Available Slots -->
      <div class="lg:col-span-7 flex flex-col gap-6">
        
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-headline font-bold text-sm text-slate-800">Select Training Date</h3>
            <span class="text-xs font-bold text-slate-400 uppercase">July 2026</span>
          </div>
          
          <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-2 text-slate-400 uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="grid grid-cols-7 gap-2 text-center text-xs mt-3">
            ${Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const slotDate = new Date();
              slotDate.setDate(dayNum);
              const slotDateIso = slotDate.toISOString().split('T')[0];
              const isSelected = slotDateIso === selectedDate;
              
              const todayIso = new Date().toISOString().split('T')[0];
              const isPast = slotDateIso < todayIso;

              let btnClass = "";
              if (isSelected) {
                btnClass = "bg-primary text-white border-primary font-bold shadow-sm";
              } else if (isPast) {
                btnClass = "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50";
              } else {
                btnClass = "border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-primary/20";
              }

              return `
                <button ${isPast ? 'disabled' : ''} onclick="window.selectBookingDate(${dayNum})" class="py-2.5 rounded-lg border transition-all ${btnClass}" id="cal-day-${dayNum}">
                  ${dayNum}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="font-headline font-bold text-sm text-[#0b1c30]">Available Time Slots</h3>
            <span class="text-xs font-semibold text-primary font-headline" id="booking-selected-date">
              ${new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div class="flex flex-col gap-3" id="slots-container">
            ${defaultSlots.map(slot => {
              const isBooked = getSchedule().some(s => s.date === selectedDate && s.time === slot.time);
              
              if (isBooked) {
                return `
                  <div class="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-100 opacity-60">
                    <div>
                      <span class="text-xs font-bold text-slate-400 block">${slot.time}</span>
                      <span class="text-[10px] text-slate-400 mt-0.5 block">Slot Fully Booked</span>
                    </div>
                    <button class="bg-slate-200 text-slate-400 text-xs font-bold font-headline py-2 px-4 rounded-lg cursor-not-allowed" disabled>Fully Booked</button>
                  </div>
                `;
              }
              
              return `
                <div class="border border-slate-100 hover:border-primary/20 rounded-xl p-4 flex justify-between items-center bg-slate-50/50 transition-all">
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">${slot.time}</span>
                    <span class="text-[10px] text-slate-500 mt-0.5 block flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00677f]"></span> ${slot.type}</span>
                  </div>
                  <button onclick="window.confirmBookingSlot('${selectedDate}', '${slot.time}')" class="bg-primary hover:bg-[#8f3200] text-white text-xs font-bold font-headline py-2 px-4 rounded-lg transition-colors shadow-sm">Book Session</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Right Column: My Bookings Section -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h3 class="font-headline font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary">calendar_today</span>
            My Booked Sessions
          </h3>

          <div class="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
            ${schedule.length > 0 ? schedule.map(s => {
              const isConfirmed = s.status === 'Confirmed';
              return `
                <div class="border border-slate-100 rounded-xl p-4 flex flex-col gap-3 bg-slate-50/50 relative">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="text-xs font-bold text-slate-800 block">${s.time}</span>
                      <span class="text-[10px] text-slate-400 block mt-0.5">${s.date}</span>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded font-headline ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                      ${isConfirmed ? 'CONFIRMED' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div class="text-[10px] text-slate-500 font-medium">
                    <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00677f]"></span> Type: ${s.type}</div>
                    <div class="flex items-center gap-1 mt-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00677f]"></span> Location: ${s.location}</div>
                  </div>

                  ${!isConfirmed ? `
                    <button onclick="window.cancelBookingSlot('${s.id}')" class="w-full text-center border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold py-1.5 rounded transition-all mt-1">
                      Cancel Booking
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('') : `
              <div class="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
                <span class="material-symbols-outlined text-[32px]">event_busy</span>
                <span class="text-xs font-medium">No training sessions booked yet.</span>
              </div>
            `}
          </div>
        </section>
      </div>
    </div>
  `;
}

export function setupBookingGlobalHandlers(renderView, showToast, closeModal) {
  window.selectBookingDate = function(dayNum) {
    const container = document.getElementById('view-container');
    const d = new Date();
    d.setDate(dayNum);
    const dateIso = d.toISOString().split('T')[0];
    
    container.dataset.selectedDate = dateIso;
    renderView();
    
    showToast(`Showing schedule for ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`, 'info');
  };

  window.confirmBookingSlot = function(date, time) {
    const client = getActiveClient();
    const pkgRemaining = client.package.remaining;

    if (pkgRemaining <= 0) {
      showToast('Booking failed! Your session package quota is empty. Please buy a new package.', 'error');
      return;
    }

    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 class="text-lg font-headline font-bold text-slate-800 mb-2 font-headline">Confirm Booking</h2>
          <p class="text-xs text-slate-500 mb-4">Your session will be deducted from your package quota after check-in.</p>
          
          <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5 text-xs mb-6">
            <div class="flex justify-between"><span class="text-slate-500">Date:</span><span class="font-bold text-slate-800">${date}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Time:</span><span class="font-bold text-slate-800">${time}</span></div>
            
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Select Location & Session Type</label>
              <select id="booking-type-select" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-primary">
                <option value="Free Weights (Gym)|Main Gym Barbell Area">In-Person - Main Gym Area</option>
                <option value="Studio Class|Studio Class (Floor 2)">In-Person - Studio Class (Floor 2)</option>
                <option value="Online Streaming|Zoom Meeting">Virtual - Zoom Meeting</option>
              </select>
            </div>

            <div class="flex justify-between border-t border-slate-200/60 pt-2.5"><span class="text-slate-500">Estimated Deduction:</span><span class="font-bold text-primary">1 Session</span></div>
          </div>

          <div class="flex gap-3">
            <button onclick="window.closeModal()" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button onclick="const val = document.getElementById('booking-type-select').value.split('|'); window.bookSlotProcess('${date}', '${time}', val[0], val[1])" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Confirm Schedule</button>
          </div>
        </div>
      </div>
    `;
  };

  window.bookSlotProcess = function(date, time, type, location) {
    const client = getActiveClient();
    
    try {
      addSchedule({
        clientId: client.id,
        clientName: client.name,
        date,
        time,
        duration: 60,
        type,
        location,
        status: 'Pending'
      });

      closeModal();
      renderView();
      showToast('Session booked successfully! Awaiting PT confirmation.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.cancelBookingSlot = function(schedId) {
    if (!confirm('Are you sure you want to cancel this training session?')) return;
    
    const schedules = getSchedule();
    const idx = schedules.findIndex(s => s.id === schedId);
    if (idx !== -1) {
      schedules.splice(idx, 1);
      saveState();
      renderView();
      showToast('Session booking cancelled successfully.', 'info');
    }
  };
}
