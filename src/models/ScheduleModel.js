import { state, saveState } from './Store.js';

export function getSchedule() {
  return state.schedule;
}

export function addSchedule(item) {
  const isConflict = state.schedule.some(s => s.date === item.date && s.time === item.time);
  if (isConflict) {
    throw new Error('Schedule conflict! Another training session is already scheduled at the same date and time.');
  }

  state.schedule.push({
    id: `sched-${Date.now()}`,
    validated: false,
    ...item
  });
  saveState();
  return true;
}

export function validateSession(scheduleId) {
  const item = state.schedule.find(s => s.id === scheduleId);
  if (item && !item.validated) {
    item.validated = true;
    item.status = 'Confirmed';
    
    const client = state.clients.find(c => c.id === item.clientId);
    if (client && client.package && client.package.remaining > 0) {
      client.package.remaining--;
    }
    saveState();
    return true;
  }
  return false;
}
