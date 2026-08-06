import { state, saveState } from './Store.js';

export function getPrograms() {
  return state.programs;
}

export function updateProgram(clientId, program) {
  state.programs[clientId] = program;
  saveState();
}
