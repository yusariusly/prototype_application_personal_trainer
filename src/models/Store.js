// Core Store for Elite Personal Trainer Management App
const tenantId = 'elite_pt';
export const STATE_KEY = `${tenantId}_app_state`;

export const DEFAULT_CLIENTS = [
  {
    id: 'client-1',
    name: 'Marcus Reid',
    email: 'm.reid@email.com',
    phone: '+62 812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
    joinedDate: '10 Jun 2026',
    status: 'Active',
    package: {
      name: '12-Session Package',
      total: 12,
      remaining: 7
    },
    assessment: {
      hasInjury: true,
      injuryNotes: 'Had ACL knee surgery 1 year ago, avoid excessive load on extreme knee flexion.',
      medicalCleared: true,
      parq: {
        q1: 'yes',
        q2: 'no',
        q3: 'no',
        q4: 'yes',
        q5: 'no',
        q6: 'no',
        q7: 'no'
      },
      postural: {
        focus: 'Hypertrophy / Muscle Building',
        analysis: 'Right shoulder slightly lower, right hamstring tight during squats.'
      }
    },
    bodyProgress: [
      { date: '01 Jul 2026', weight: 85.0, bodyFat: 21.5, muscleMass: 38.2, waist: 92 },
      { date: '08 Jul 2026', weight: 84.2, bodyFat: 20.8, muscleMass: 38.5, waist: 91 },
      { date: '15 Jul 2026', weight: 83.5, bodyFat: 20.1, muscleMass: 38.9, waist: 90 },
      { date: '22 Jul 2026', weight: 82.6, bodyFat: 19.5, muscleMass: 39.2, waist: 89 }
    ],
    photos: [
      { date: '01 Jul 2026', type: 'before', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' },
      { date: '22 Jul 2026', type: 'after', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80' }
    ],
    habits: {
      water: { current: 1.8, target: 3.0 },
      sleep: { current: 7.5, target: 8.0 },
      steps: { current: 8400, target: 10000 },
      completedToday: ['water', 'sleep']
    },
    workoutHistory: [
      {
        date: '25 Jul 2026',
        focus: 'Leg Day - Hypertrophy',
        exercises: [
          { name: 'Barbell Squats', weight: 80, reps: 8 },
          { name: 'Romanian Deadlifts', weight: 60, reps: 10 },
          { name: 'Leg Press', weight: 120, reps: 12 }
        ]
      },
      {
        date: '18 Jul 2026',
        focus: 'Leg Day - Hypertrophy',
        exercises: [
          { name: 'Barbell Squats', weight: 75, reps: 8 },
          { name: 'Romanian Deadlifts', weight: 55, reps: 10 },
          { name: 'Leg Press', weight: 110, reps: 12 }
        ]
      }
    ]
  },
  {
    id: 'client-2',
    name: 'Eleanor Vance',
    email: 'eleanor.v@example.com',
    phone: '+62 811-9876-5432',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=150&q=80',
    joinedDate: '18 Jul 2026',
    status: 'Active',
    package: {
      name: '20-Session Package',
      total: 20,
      remaining: 18
    },
    assessment: {
      hasInjury: false,
      injuryNotes: '',
      medicalCleared: true,
      parq: {
        q1: 'no', q2: 'no', q3: 'no', q4: 'no', q5: 'no', q6: 'no', q7: 'no'
      },
      postural: {
        focus: 'Fat Loss / Endurance',
        analysis: 'Mild anterior pelvic tilt postural condition.'
      }
    },
    bodyProgress: [
      { date: '18 Jul 2026', weight: 68.0, bodyFat: 28.5, muscleMass: 24.1, waist: 78 },
      { date: '25 Jul 2026', weight: 67.2, bodyFat: 27.8, muscleMass: 24.3, waist: 77 }
    ],
    photos: [
      { date: '18 Jul 2026', type: 'before', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=300&q=80' }
    ],
    habits: {
      water: { current: 2.2, target: 2.5 },
      sleep: { current: 6.0, target: 7.5 },
      steps: { current: 11000, target: 10000 },
      completedToday: ['steps']
    },
    workoutHistory: [
      {
        date: '25 Jul 2026',
        focus: 'Full Body Conditioning',
        exercises: [
          { name: 'Dumbbell Goblet Squats', weight: 12, reps: 15 },
          { name: 'Push Ups (Incline)', weight: 0, reps: 12 },
          { name: 'Dumbbell Rows', weight: 8, reps: 12 }
        ]
      }
    ]
  }
];

export const DEFAULT_PROGRAMS = {
  'client-1': {
    focus: 'Leg Day - Hypertrophy',
    mesocycle: 'Phase 1: Hypertrophy & Muscle Building',
    exercises: [
      {
        id: 'ex-1',
        name: 'Barbell Squats',
        sets: 4,
        reps: 8,
        weight: 80,
        rest: 90,
        completed: false,
        history: { weight: 75, reps: 8 },
        actual: [],
        videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
        instructions: 'Place the barbell over the trapezius muscles. Feet shoulder-width apart. Lower hips slowly until thighs are parallel to the floor with chest up.'
      },
      {
        id: 'ex-2',
        name: 'Romanian Deadlifts',
        sets: 3,
        reps: 10,
        weight: 60,
        rest: 60,
        completed: false,
        history: { weight: 55, reps: 10 },
        actual: [],
        videoUrl: 'https://www.youtube.com/embed/JCXUYuzwvgM',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        instructions: 'Hinge hips backward while sliding the bar down close to thighs. Keep spine neutral and feel the hamstring stretch.'
      },
      {
        id: 'ex-3',
        name: 'Leg Press',
        sets: 3,
        reps: 12,
        weight: 120,
        rest: 60,
        completed: false,
        history: { weight: 110, reps: 12 },
        actual: [],
        videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
        instructions: 'Place feet shoulder-width in middle of platform. Press weight without locking knees at top.'
      }
    ]
  },
  'client-2': {
    focus: 'Full Body Conditioning',
    mesocycle: 'Phase 1: Fat Loss & Endurance',
    exercises: [
      {
        id: 'ex-4',
        name: 'Dumbbell Goblet Squats',
        sets: 3,
        reps: 15,
        weight: 12,
        rest: 45,
        completed: false,
        history: { weight: 10, reps: 15 },
        actual: [],
        videoUrl: 'https://www.youtube.com/embed/MeIiIdhvKL4',
        imageUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=600&q=80',
        instructions: 'Hold dumbbell vertically in front of chest. Squat down keeping elbows inside knees at bottom.'
      },
      {
        id: 'ex-5',
        name: 'Push Ups (Incline)',
        sets: 3,
        reps: 12,
        weight: 0,
        rest: 45,
        completed: false,
        history: { weight: 0, reps: 10 },
        actual: [],
        videoUrl: 'https://www.youtube.com/embed/WDIpL0pmy0U',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        instructions: 'Place hands on elevated bench. Engage core and lower chest towards bench.'
      },
      {
        id: 'ex-6',
        name: 'Dumbbell Rows',
        sets: 3,
        reps: 12,
        weight: 8,
        rest: 45,
        completed: false,
        history: { weight: 8, reps: 10 },
        actual: []
      }
    ]
  }
};

export const DEFAULT_SCHEDULE = [
  {
    id: 'sched-1',
    clientId: 'client-1',
    clientName: 'Marcus Reid',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    duration: 60,
    type: 'Free Weights (Gym)',
    location: 'Main Gym Barbell Area',
    status: 'Confirmed',
    validated: false
  },
  {
    id: 'sched-2',
    clientId: 'client-2',
    clientName: 'Eleanor Vance',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    type: 'Online Streaming',
    location: 'Zoom Meeting',
    status: 'Pending',
    validated: false
  },
  {
    id: 'sched-3',
    clientId: 'client-1',
    clientName: 'Marcus Reid',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    type: 'Studio Class',
    location: 'Studio A (Floor 2)',
    status: 'Confirmed',
    validated: false
  }
];

export const DEFAULT_EXERCISE_LIBRARY = [
  { name: 'Barbell Squats', category: 'Legs' },
  { name: 'Romanian Deadlifts', category: 'Hamstrings' },
  { name: 'Leg Press', category: 'Legs' },
  { name: 'Dumbbell Goblet Squats', category: 'Legs' },
  { name: 'Push Ups', category: 'Chest' },
  { name: 'Dumbbell Rows', category: 'Back' },
  { name: 'Bench Press', category: 'Chest' },
  { name: 'Deadlift (Conventional)', category: 'Full Body' },
  { name: 'Overhead Press', category: 'Shoulders' },
  { name: 'Bicep Curls', category: 'Arms' },
  { name: 'Tricep Pushdowns', category: 'Arms' },
  { name: 'Plank', category: 'Core' }
];

export const DEFAULT_MESSAGES = [
  {
    id: 'msg-1',
    clientId: 'client-1',
    sender: 'trainer',
    text: "Hello Marcus! Today's Leg Day program is ready. Focus on progressive overload on squats.",
    time: '07:30'
  },
  {
    id: 'msg-2',
    clientId: 'client-1',
    sender: 'client',
    text: "Got it Coach! Knee feels good, I will arrive at the gym at 8 AM sharp.",
    time: '07:45'
  }
];

export let state = {
  clients: [...DEFAULT_CLIENTS],
  programs: { ...DEFAULT_PROGRAMS },
  schedule: [...DEFAULT_SCHEDULE],
  exerciseLibrary: [...DEFAULT_EXERCISE_LIBRARY],
  messages: [...DEFAULT_MESSAGES],
  activeClientId: 'client-1',
  activeTrainerName: 'Coach Bobby'
};

function sanitizeStateToEnglish(st) {
  if (!st) return;

  if (Array.isArray(st.clients)) {
    st.clients.forEach(c => {
      if (c.package && c.package.name) {
        c.package.name = c.package.name
          .replace(/Paket (\d+) Sesi/gi, '$1-Session Package')
          .replace(/Paket 12 Sesi/gi, '12-Session Package')
          .replace(/Paket 10 Sesi/gi, '10-Session Package')
          .replace(/Paket 20 Sesi/gi, '20-Session Package')
          .replace(/Paket 30 Sesi/gi, '30-Session Package');
      }
      if (c.assessment && c.assessment.injuryNotes) {
        if (c.assessment.injuryNotes.includes('operasi lutut') || c.assessment.injuryNotes.includes('ACL')) {
          c.assessment.injuryNotes = 'Had ACL knee surgery 1 year ago, avoid excessive load on extreme knee flexion.';
        }
      }
      if (c.assessment && c.assessment.postural && c.assessment.postural.analysis) {
        if (c.assessment.postural.analysis.includes('Bahu kanan') || c.assessment.postural.analysis.includes('kaku') || c.assessment.postural.analysis.includes('sedikit')) {
          c.assessment.postural.analysis = 'Right shoulder slightly lower, right hamstring tight during squats.';
        }
      }
      if (c.status === 'Aktif') c.status = 'Active';
      if (c.status === 'Onboarding') c.status = 'Inactive';
    });
  }

  if (Array.isArray(st.schedule)) {
    st.schedule.forEach(s => {
      if (s.type === 'Kelas Studio') s.type = 'Studio Class';
      if (s.type === 'Beban Bebas (Gym)') s.type = 'Free Weights (Gym)';
      if (s.location === 'Studio A (Lantai 2)') s.location = 'Studio A (Floor 2)';
      if (s.location === 'Studio Class (Lantai 2)') s.location = 'Studio Class (Floor 2)';
      if (s.location === 'Area Barbell Gym Utama' || s.location === 'Area Gym Utama') s.location = 'Main Gym Barbell Area';
    });
  }

  if (Array.isArray(st.messages)) {
    st.messages.forEach(m => {
      if (m.text.includes('Halo Marcus!') || m.text.includes('gue siapin')) {
        m.text = "Hello Marcus! Today's Leg Day program is ready. Focus on progressive overload on squats.";
      }
      if (m.text.includes('Siap coach!') || m.text.includes('nyampe gym')) {
        m.text = "Got it Coach! Knee feels good, I will arrive at the gym at 8 AM sharp.";
      }
    });
  }

  if (st.programs) {
    Object.keys(st.programs).forEach(k => {
      const p = st.programs[k];
      if (p.mesocycle && p.mesocycle.includes('Fase 1')) {
        p.mesocycle = 'Phase 1: Hypertrophy & Muscle Building';
      }
    });
  }
}

export function loadState() {
  const saved = localStorage.getItem(STATE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = {
        clients: parsed.clients || [...DEFAULT_CLIENTS],
        programs: parsed.programs || { ...DEFAULT_PROGRAMS },
        schedule: parsed.schedule || [...DEFAULT_SCHEDULE],
        exerciseLibrary: parsed.exerciseLibrary || [...DEFAULT_EXERCISE_LIBRARY],
        messages: parsed.messages || [...DEFAULT_MESSAGES],
        activeClientId: parsed.activeClientId || 'client-1',
        activeTrainerName: parsed.activeTrainerName || 'Coach Bobby'
      };
      sanitizeStateToEnglish(state);
      saveState();
    } catch (e) {
      console.error('Failed to parse localStorage state:', e);
    }
  } else {
    saveState();
  }
}

export function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// Initial load
loadState();
