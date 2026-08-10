import { getNutrition, addMealLog } from '../models/NutritionModel.js';
import { getActiveClient } from '../models/ClientModel.js';
import { t, translateDOM } from '../i18n.js';

export function renderNutritionView(container, client) {
  const nutrition = getNutrition(client.id);
  const consumed = nutrition.diary.reduce((acc, curr) => {
    acc.calories += curr.calories;
    acc.protein += curr.protein;
    acc.carbs += curr.carbs;
    acc.fat += curr.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const progress = {
    calories: Math.min(100, Math.round((consumed.calories / nutrition.targets.calories) * 100)),
    protein: Math.min(100, Math.round((consumed.protein / nutrition.targets.protein) * 100)),
    carbs: Math.min(100, Math.round((consumed.carbs / nutrition.targets.carbs) * 100)),
    fat: Math.min(100, Math.round((consumed.fat / nutrition.targets.fat) * 100))
  };

  container.innerHTML = `
<!-- Header -->
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined text-[28px]" data-i18n="restaurant">restaurant</span>
</div>
<div>
<h1 class="text-xl md:text-3xl font-headline font-extrabold text-slate-800" data-i18n="nutrition_title">Nutrition Plan</h1>
<p class="text-sm text-slate-500 font-medium" data-i18n="nutrition_sub">Daily Macro & Calorie Tracking</p>
</div>
</div>
<!-- TDEE & Calories Summary -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
<div class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2" data-i18n="label_est_tdee">Est. TDEE</div>
<div class="text-3xl font-headline font-extrabold text-slate-800">${nutrition.tdee} <span class="text-sm font-body text-slate-400" data-i18n="kcal">kcal</span></div>
<p class="text-xs text-slate-400 mt-2" data-i18n="tdee_sub">Maintenance calories based on activity level</p>
</div>
<div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
<div class="flex justify-between items-end mb-4">
<div>
<div class="text-sm font-bold text-slate-500 uppercase tracking-wide" data-i18n="label_calories_consumed">Calories Consumed</div>
<div class="text-3xl font-headline font-extrabold text-primary">${consumed.calories} <span class="text-sm font-body text-slate-400">/ ${nutrition.targets.calories} kcal</span></div>
</div>
</div>
<div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
<div class="bg-primary h-full rounded-full transition-all duration-1000" style="width: ${progress.calories}%"></div>
</div>
</div>
</div>
<!-- Macros -->
<div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
<h3 class="text-sm font-headline font-bold text-slate-800 mb-4" data-i18n="macros_title">Daily Macronutrients</h3>
<div class="grid grid-cols-3 gap-4">
<!-- Protein -->
<div class="flex flex-col items-center">
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
<div class="bg-red-500 h-full rounded-full" style="width: ${progress.protein}%"></div>
</div>
<div class="text-[10px] font-bold text-slate-500 uppercase" data-i18n="label_protein">Protein</div>
<div class="text-sm font-bold text-slate-800">${consumed.protein}g <span class="text-[10px] text-slate-400">/ ${nutrition.targets.protein}g</span></div>
</div>
<!-- Carbs -->
<div class="flex flex-col items-center">
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
<div class="bg-blue-500 h-full rounded-full" style="width: ${progress.carbs}%"></div>
</div>
<div class="text-[10px] font-bold text-slate-500 uppercase" data-i18n="label_carbs">Carbs</div>
<div class="text-sm font-bold text-slate-800">${consumed.carbs}g <span class="text-[10px] text-slate-400">/ ${nutrition.targets.carbs}g</span></div>
</div>
<!-- Fat -->
<div class="flex flex-col items-center">
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
<div class="bg-yellow-500 h-full rounded-full" style="width: ${progress.fat}%"></div>
</div>
<div class="text-[10px] font-bold text-slate-500 uppercase" data-i18n="label_fat">Fat</div>
<div class="text-sm font-bold text-slate-800">${consumed.fat}g <span class="text-[10px] text-slate-400">/ ${nutrition.targets.fat}g</span></div>
</div>
</div>
</div>
<!-- Food Diary -->
<div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col h-full">
<div class="flex justify-between items-center mb-4">
<h3 class="text-sm font-headline font-bold text-slate-800" data-i18n="diary_title">Today's Food Diary</h3>
<button class="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-1" data-i18n="btn_add_meal" onclick="window.openAddMealModal()">
<span class="material-symbols-outlined text-[14px]" data-i18n="add">add</span> Add Meal
            </button>
</div>
<div class="flex-grow flex flex-col gap-3">
            ${nutrition.diary.map(meal => `
                <div class="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                        <div class="text-[10px] font-bold text-slate-400 mb-0.5">${meal.time}</div>
                        <div class="text-xs font-bold text-slate-700">${meal.name}</div>
                        <div class="text-[10px] text-slate-500 mt-1 flex gap-2">
                            <span>${meal.protein}g P</span> &bull; 
                            <span>${meal.carbs}g C</span> &bull; 
                            <span>${meal.fat}g F</span>
                        </div>
                    </div>
                    <div class="text-sm font-headline font-bold text-primary">${meal.calories} kcal</div>
                </div>
            `).join('')}
            ${nutrition.diary.length === 0 ? `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-200 mb-2">restaurant_menu</span>
            <p data-i18n="no_meals_logged" class="text-sm font-bold text-slate-400">No meals logged today</p>
                </div>
            ` : ''}
        </div>
    </div>
  `;
  // translate DOM after render
  translateDOM();
}

export function setupNutritionGlobalHandlers(renderView, showToast, closeModal) {
  window.openAddMealModal = function() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl p-6 border border-slate-100 shadow-2xl relative">
          <h2 data-i18n="modal_log_meal" class="text-lg font-headline font-bold text-slate-800 mb-4 font-headline">Log a Meal</h2>
          <form id="add-meal-form" class="space-y-4">
            <div>
              <label data-i18n="label_meal_name" class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Meal Name</label>
              <input type="text" id="meal-name" required class="w-full border-slate-200 rounded-lg text-sm p-2.5 focus:border-primary focus:ring-primary outline-none" placeholder="e.g. Chicken Salad">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                  <label data-i18n="label_calories" class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Calories (kcal)</label>
                  <input type="number" id="meal-cal" required class="w-full border-slate-200 rounded-lg text-sm p-2.5 focus:border-primary focus:ring-primary outline-none">
                </div>
                <div>
                  <label data-i18n="label_time" class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time</label>
                  <input type="time" id="meal-time" required value="12:00" class="w-full border-slate-200 rounded-lg text-sm p-2.5 focus:border-primary focus:ring-primary outline-none">
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div>
                  <label data-i18n="label_protein" class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Protein (g)</label>
                  <input type="number" id="meal-pro" required class="w-full border-slate-200 rounded-lg text-sm p-2.5 focus:border-primary focus:ring-primary outline-none">
                </div>
                <div>
                  <label data-i18n="label_carbs" class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Carbs (g)</label>
                  <input type="number" id="meal-carb" required class="w-full border-slate-200 rounded-lg text-sm p-2.5 focus:border-primary focus:ring-primary outline-none">
                </div>
                <div>
                  <label data-i18n="label_fat" class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fat (g)</label>
                  <input type="number" id="meal-fat" required class="w-full border-slate-200 rounded-lg text-sm p-2.5 focus:border-primary focus:ring-primary outline-none">
                </div>
            </div>
            <div class="flex gap-3 mt-6 pt-2">
              <button type="button" onclick="window.closeModal()" data-i18n="btn_cancel" class="flex-1 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" data-i18n="btn_save_meal" class="flex-1 bg-primary text-white py-2.5 text-xs font-bold rounded-lg hover:bg-[#8f3200] transition-colors">Save Meal</button>
            </div>
          </form>
        </div>
      </div>
    `;
    // translate modal content
    translateDOM();

    document.getElementById('add-meal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const meal = {
        name: document.getElementById('meal-name').value,
        time: document.getElementById('meal-time').value,
        calories: parseInt(document.getElementById('meal-cal').value),
        protein: parseInt(document.getElementById('meal-pro').value),
        carbs: parseInt(document.getElementById('meal-carb').value),
        fat: parseInt(document.getElementById('meal-fat').value)
      };
      
      const client = getActiveClient();
      addMealLog(client.id, meal);
      
      closeModal();
      renderView();
      showToast(t('meal_logged_success'), 'success');
    });
  };
}
