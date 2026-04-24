// BRUTE — Week 3 Tuesday: Heavy Bench seed data
// All weights in kg. Training maxes plucked from a plausible intermediate lifter.

const TRAINING_MAX = {
  squat: 140,
  bench: 102.5,
  deadlift: 180,
  ohp: 67.5,
};

const BODYWEIGHT = 82;

// Phase 1 Week 3 Tuesday: Heavy Bench session
// Phase 1 logic: start 0.75 × bench 1RM, +2.5kg per successful session.
// Week 1 Tue: 77.5 × 5, Week 2 Tue: 80 × 5, Week 3 Tue: 82.5 × 5
// (Fresh start assumed; user made both jumps.)
// BUT: we want to showcase a PR moment, so push to 85 actual (AMRAP-ish extra rep).

const SESSION = {
  week: 3,
  day: 2,
  weekday: 'TUESDAY',
  phase: 1,
  theme: 'HEAVY BENCH',
  subtheme: '+ WEIGHTED PULL-UPS',
  exercises: [
    {
      id: 'warmup',
      name: 'WARM-UP',
      category: 'warmup',
      compact: true,
      rows: [
        { label: 'Bike Z2', value: '5:00' },
        { label: 'Ring push-up', value: '1 × 10' },
        { label: 'Band pull-apart', value: '2 × 15' },
        { label: 'Empty bar bench', value: '1 × 10' },
        { label: 'Ramp to working', value: '60 · 70 · 75' },
      ],
    },
    {
      id: 'bench',
      name: 'BENCH PRESS',
      category: 'main',
      sets: 3,
      reps: 5,
      prescribedWeight: 82.5,
      rest: 180,
      isAmrap: false,
      tempo: '2-1-X-0',
      cues: [
        'Scapula retracted & depressed before unrack',
        'Feet planted under hips, leg drive up the bench',
        'Arch by lifting sternum, NOT low back',
        'Full breath held through the rep',
        'Elbows ~45° from torso, forearm vertical at chest',
      ],
    },
    {
      id: 'pullup',
      name: 'WEIGHTED PULL-UP',
      category: 'main',
      sets: 5,
      reps: 3,
      prescribedWeight: 15,
      rest: 150,
      note: 'Bodyweight until 3×8 is clean, then +1.25kg',
    },
    {
      id: 'dbbench',
      name: 'DUMBBELL BENCH',
      category: 'supp',
      sets: 3,
      reps: 10,
      prescribedWeight: 32,
      rest: 90,
    },
    {
      id: 'ringrow',
      name: 'RING ROW',
      category: 'supp',
      sets: 3,
      reps: 12,
      prescribedWeight: 0,
      rest: 75,
      note: 'Bodyweight. Rings low, feet forward for harder.',
    },
    {
      id: 'facepull',
      name: 'FACE PULL',
      category: 'accessory',
      sets: 5,
      reps: 20,
      prescribedWeight: 22,
      rest: 60,
      note: '100 total reps across 3–5 sets',
    },
  ],
};

// Previous best 1RM for bench — for PR comparison
const PREV_PRS = {
  bench: { kg: 97.5, date: 'Feb 18' },
  squat: { kg: 135, date: 'Feb 14' },
  deadlift: { kg: 172.5, date: 'Feb 20' },
  ohp: { kg: 65, date: 'Feb 24' },
};

// Last completed session (Monday) for the Today screen recap
const LAST_SESSION = {
  date: 'MON · MAR 24',
  theme: 'HEAVY SQUAT',
  topSets: [
    { lift: 'SQUAT', value: '112.5 × 5', pr: false },
    { lift: 'PAUSED BENCH', value: '60 × 5', pr: false },
    { lift: 'BB ROW', value: '70 × 8', pr: true },
  ],
};

// 1RM estimates today (Epley-derived from recent logs)
const CURRENT_1RM = {
  squat: 131,
  bench: 96,
  deadlift: 168,
};

// Epley formula
function epley1RM(weight, reps) {
  return Math.round((weight * (1 + reps / 30)) * 10) / 10;
}

Object.assign(window, {
  TRAINING_MAX, BODYWEIGHT, SESSION, PREV_PRS, LAST_SESSION, CURRENT_1RM, epley1RM,
});
