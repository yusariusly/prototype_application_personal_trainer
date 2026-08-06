import { state, saveState } from './Store.js';

export function getExerciseLibrary() {
  return state.exerciseLibrary;
}

export function addExerciseToLibrary(name, category) {
  if (!state.exerciseLibrary.some(ex => ex.name.toLowerCase() === name.toLowerCase())) {
    state.exerciseLibrary.push({ name, category });
    saveState();
  }
}
