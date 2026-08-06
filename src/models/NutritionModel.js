import { state, saveState } from './Store.js';

export const DEFAULT_NUTRITION_DATA = {
  'client-1': {
    tdee: 2400,
    targets: {
      calories: 2800,
      protein: 160,
      carbs: 350,
      fat: 85
    },
    diary: [
      { id: 'meal-1', time: '08:00', name: 'Oatmeal & Whey Protein', calories: 450, protein: 40, carbs: 55, fat: 8 },
      { id: 'meal-2', time: '13:00', name: 'Chicken Breast & Brown Rice', calories: 650, protein: 55, carbs: 70, fat: 12 }
    ]
  },
  'client-2': {
    tdee: 1800,
    targets: {
      calories: 1500,
      protein: 120,
      carbs: 130,
      fat: 55
    },
    diary: [
      { id: 'meal-1', time: '09:00', name: 'Greek Yogurt & Berries', calories: 250, protein: 20, carbs: 30, fat: 5 }
    ]
  }
};

export function getNutrition(clientId) {
  if (!state.nutrition) {
    state.nutrition = { ...DEFAULT_NUTRITION_DATA };
    saveState();
  }
  if (!state.nutrition[clientId]) {
    state.nutrition[clientId] = {
      tdee: 2000,
      targets: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
      diary: []
    };
    saveState();
  }
  return state.nutrition[clientId];
}

export function updateNutrition(clientId, data) {
  if (!state.nutrition) state.nutrition = { ...DEFAULT_NUTRITION_DATA };
  state.nutrition[clientId] = data;
  saveState();
}

export function addMealLog(clientId, meal) {
  const nut = getNutrition(clientId);
  meal.id = 'meal-' + Date.now();
  nut.diary.push(meal);
  updateNutrition(clientId, nut);
}
