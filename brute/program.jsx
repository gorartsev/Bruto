// BRUTE — program engine: exercise catalog, 12-week seed, prescription logic.
// All weights in kg internally. Display rounds to 0.5.

// ─── Exercise catalog ───────────────────────────────────────────────────────
// Single source of truth for exercise definitions: name, cues, lift key for PRs,
// category, substitutions. Session templates reference by key.

const EXERCISES = {
  // main lifts
  squat:          { key: 'squat', lift: 'squat',    name: 'ПРИСЕД',         nameEn: 'SQUAT',         cat: 'main',  unit: 'kg' },
  bench:          { key: 'bench', lift: 'bench',    name: 'ЖИМ ЛЁЖА',       nameEn: 'BENCH PRESS',   cat: 'main',  unit: 'kg' },
  deadlift:       { key: 'deadlift', lift: 'deadlift', name: 'СТАНОВАЯ',     nameEn: 'DEADLIFT',      cat: 'main',  unit: 'kg' },
  ohp:            { key: 'ohp', lift: 'ohp',        name: 'ЖИМ СТОЯ',        nameEn: 'OVERHEAD PRESS', cat: 'main',  unit: 'kg' },
  // supplementary
  pausedBench:    { key: 'pausedBench', lift: null, name: 'ЖИМ С ПАУЗОЙ',   nameEn: 'PAUSED BENCH',  cat: 'supp',  unit: 'kg' },
  closeGrip:      { key: 'closeGrip',  lift: null,  name: 'УЗКИЙ ЖИМ',       nameEn: 'CLOSE-GRIP BENCH', cat: 'supp', unit: 'kg' },
  rdl:            { key: 'rdl',        lift: null,  name: 'РУМЫНКА',         nameEn: 'ROMANIAN DEADLIFT', cat: 'supp', unit: 'kg' },
  frontSquat:     { key: 'frontSquat', lift: null,  name: 'ФРОНТАЛЬНЫЙ ПРИСЕД', nameEn: 'FRONT SQUAT',  cat: 'supp', unit: 'kg' },
  // accessories
  pullup:         { key: 'pullup',     lift: 'pullup', name: 'ПОДТЯГИВАНИЯ', nameEn: 'WEIGHTED PULL-UP', cat: 'acc', unit: 'kgAdd' },
  chinup:         { key: 'chinup',     lift: null,  name: 'ПОДТЯГ. ОБР.',    nameEn: 'CHIN-UP',       cat: 'acc',  unit: 'bw' },
  ringRow:        { key: 'ringRow',    lift: null,  name: 'ТЯГА КОЛЕЦ',      nameEn: 'RING ROW',      cat: 'acc',  unit: 'bw' },
  ringDip:        { key: 'ringDip',    lift: null,  name: 'ОТЖИМ. КОЛЬЦА',   nameEn: 'RING DIP',      cat: 'acc',  unit: 'bw' },
  ringPushup:     { key: 'ringPushup', lift: null,  name: 'ОТЖИМ. КОЛЬЦА',   nameEn: 'RING PUSH-UP',  cat: 'acc',  unit: 'bw' },
  ringSupport:    { key: 'ringSupport', lift: null, name: 'УПОР НА КОЛЬЦАХ', nameEn: 'RING SUPPORT',  cat: 'acc',  unit: 'sec' },
  dbBench:        { key: 'dbBench',    lift: null,  name: 'ЖИМ ГАНТЕЛЕЙ',    nameEn: 'DUMBBELL BENCH', cat: 'acc', unit: 'kg' },
  dbRow:          { key: 'dbRow',      lift: null,  name: 'ТЯГА ГАНТЕЛИ',    nameEn: 'DUMBBELL ROW',  cat: 'acc',  unit: 'kg' },
  bbRow:          { key: 'bbRow',      lift: null,  name: 'ТЯГА ШТАНГИ',     nameEn: 'BARBELL ROW',   cat: 'acc',  unit: 'kg' },
  facePull:       { key: 'facePull',   lift: null,  name: 'ТЯГА К ЛИЦУ',     nameEn: 'FACE PULL',     cat: 'acc',  unit: 'kg' },
  pullApart:      { key: 'pullApart',  lift: null,  name: 'РАЗВЕДЕНИЕ РЕЗИН.', nameEn: 'BAND PULL-APART', cat: 'acc', unit: 'band' },
  kbSwing:        { key: 'kbSwing',    lift: null,  name: 'МАХИ ГИРЕЙ',      nameEn: 'KB SWING',      cat: 'acc',  unit: 'kg' },
  gobletSquat:    { key: 'gobletSquat', lift: null, name: 'ГОБЛЕТ',          nameEn: 'GOBLET SQUAT',  cat: 'acc',  unit: 'kg' },
  tgu:            { key: 'tgu',        lift: null,  name: 'TURKISH GET-UP',  nameEn: 'TURKISH GET-UP', cat: 'acc', unit: 'kg' },
  prowler:        { key: 'prowler',    lift: null,  name: 'ПРОУЛЕР',         nameEn: 'PROWLER',       cat: 'cond', unit: 'kg' },
  farmerCarry:    { key: 'farmerCarry', lift: null, name: 'ФЕРМЕРСКАЯ',      nameEn: 'FARMER CARRY',  cat: 'acc',  unit: 'kg' },
  suitcaseCarry:  { key: 'suitcaseCarry', lift: null, name: 'ЧЕМОДАН',        nameEn: 'SUITCASE CARRY', cat: 'acc', unit: 'kg' },
  plank:          { key: 'plank',      lift: null,  name: 'ПЛАНКА',          nameEn: 'WEIGHTED PLANK', cat: 'acc', unit: 'kg' },
  hangingLeg:     { key: 'hangingLeg', lift: null,  name: 'УГОЛОК В ВИСЕ',   nameEn: 'HANGING LEG RAISE', cat: 'acc', unit: 'bw' },
  bikeZ2:         { key: 'bikeZ2',     lift: null,  name: 'БАЙК Z2',         nameEn: 'BIKE Z2',       cat: 'cond', unit: 'min' },
};

// cues per lift (main lifts only — accessories display generic tips)
const CUES = {
  squat: [
    'Поставь стойку чуть ниже плеч — гриф ложится на задние дельты',
    'Ноги на ширину плеч, носки слегка наружу',
    'Сделай ВДОХ, напряги пресс, держи корсет всю амплитуду',
    'Колени идут по линии носков, не заваливаются внутрь',
    'Таз уходит назад-вниз, как на унитаз с ящиком',
    'Глубина: складка бедра ниже верха коленной чашечки',
  ],
  bench: [
    'Лопатки свёл и опустил ДО снятия штанги со стоек',
    'Стопы под тазом, пятки в пол — ноги толкают тебя К МАКУШКЕ скамьи',
    'Мост — подъём грудины, НЕ поясницы',
    'Вдох полный, держи воздух весь подход',
    'Локти ~45° от корпуса, предплечья вертикально в нижней точке',
    'Касание грифа в нижней части груди, под соском',
  ],
  deadlift: [
    'Гриф над серединой стопы, голень касается грифа',
    'Хват чуть шире коленей, "погну штангу"',
    'Грудь вверх, поясница ровная — НЕ горбишься',
    'Вдох в живот, напряги корпус — "защитный пояс из мышц"',
    'Толкай пол, как жим ногами — штанга поднимется сама',
    'В верхней точке таз вперёд, ягодицы в замке, БЕЗ переразгиба',
  ],
  ohp: [
    'Гриф на передних дельтах, локти чуть впереди грифа',
    'Ягодицы и пресс в замке — не провалился в поясницу',
    'В момент жима голова уходит назад, потом проскакивает ПОД гриф',
    'Гриф идёт ПО ВЕРТИКАЛИ над серединой стопы',
    'В верхней точке трапеции включены, локти полностью выпрямлены',
  ],
};

// ─── Week structure ─────────────────────────────────────────────────────────
// Each phase has 5 training-day templates (Mon..Fri) + Sat/Sun rest.
// Templates are identical within a phase; only percentages change by week via 5/3/1 wave.

// Phase 1 — Novice LP
const P1_MON = {
  theme: 'ТЯЖЁЛЫЙ ПРИСЕД',
  subtheme: '+ ДОПОЛНИТЕЛЬНЫЙ ЖИМ',
  exercises: [
    { ex: 'squat',         sets: 3, reps: 5, rest: 240, rule: 'lp-main',     lift: 'squat'  },
    { ex: 'pausedBench',   sets: 4, reps: 5, rest: 150, rule: 'pct1rm',      lift: 'bench', pct: 0.60 },
    { ex: 'bbRow',         sets: 4, reps: 8, rest: 90,  rule: 'pct1rm',      lift: 'bench', pct: 0.55 },
    { ex: 'ringSupport',   sets: 3, reps: 20, rest: 60, rule: 'bodyweight',  note: 'секунды' },
    { ex: 'hangingLeg',    sets: 3, reps: 10, rest: 60, rule: 'bodyweight'   },
  ],
};
const P1_TUE = {
  theme: 'ТЯЖЁЛЫЙ ЖИМ',
  subtheme: '+ ПОДТЯГИВАНИЯ С ВЕСОМ',
  exercises: [
    { ex: 'bench',         sets: 3, reps: 5, rest: 210, rule: 'lp-main',     lift: 'bench'  },
    { ex: 'pullup',        sets: 5, reps: 3, rest: 150, rule: 'lp-pullup',   lift: 'pullup' },
    { ex: 'dbBench',       sets: 3, reps: 10, rest: 90, rule: 'moderate'    },
    { ex: 'ringRow',       sets: 3, reps: 12, rest: 75, rule: 'bodyweight'  },
    { ex: 'pullApart',     sets: 4, reps: 25, rest: 45, rule: 'band'        },
  ],
};
const P1_WED = {
  theme: 'ЛЁГКИЙ ДЕНЬ',
  subtheme: 'GPP · КОЛЬЦА · ПРОУЛЕР',
  light: true,
  exercises: [
    { ex: 'frontSquat',    sets: 3, reps: 5, rest: 120, rule: 'pct1rm', lift: 'squat', pct: 0.50 },
    { ex: 'gobletSquat',   sets: 3, reps: 8, rest: 90,  rule: 'moderate' },
    { ex: 'prowler',       sets: 8, reps: 1, rest: 75,  rule: 'custom',  note: '20м · вперёд / назад · тяжёлый' },
    { ex: 'farmerCarry',   sets: 3, reps: 1, rest: 75,  rule: 'heavy',   note: '40м' },
    { ex: 'tgu',           sets: 3, reps: 1, rest: 60,  rule: 'moderate', note: 'каждая сторона' },
    { ex: 'ringPushup',    sets: 3, reps: 10, rest: 60, rule: 'bodyweight', note: 'AMRAP − 2' },
  ],
};
const P1_THU = {
  theme: 'ТЯЖЁЛАЯ ТЯГА',
  subtheme: '+ ГИРИ · ЗАДНЯЯ ЦЕПЬ',
  exercises: [
    { ex: 'deadlift',      sets: 1, reps: 5, rest: 300, rule: 'lp-main',     lift: 'deadlift' },
    { ex: 'rdl',           sets: 3, reps: 8, rest: 150, rule: 'pct-of-working', lift: 'deadlift', pct: 0.60 },
    { ex: 'kbSwing',       sets: 10, reps: 10, rest: 50, rule: 'heavy', note: 'EMOM' },
    { ex: 'chinup',        sets: 4, reps: 5, rest: 90, rule: 'bodyweight' },
    { ex: 'suitcaseCarry', sets: 3, reps: 1, rest: 60, rule: 'heavy', note: '30м каждая сторона' },
  ],
};
const P1_FRI = {
  theme: 'ТЯЖЁЛЫЙ ЖИМ СТОЯ',
  subtheme: '+ УЗКИЙ ЖИМ · КОЛЬЦА',
  exercises: [
    { ex: 'ohp',           sets: 3, reps: 5, rest: 210, rule: 'lp-main',     lift: 'ohp'    },
    { ex: 'closeGrip',     sets: 4, reps: 6, rest: 150, rule: 'pct1rm',      lift: 'bench', pct: 0.60 },
    { ex: 'ringDip',       sets: 4, reps: 7, rest: 120, rule: 'bodyweight',  note: 'с весом когда 3×10 чисто' },
    { ex: 'dbRow',         sets: 3, reps: 10, rest: 75, rule: 'moderate'    },
    { ex: 'facePull',      sets: 4, reps: 25, rest: 45, rule: 'moderate'    },
  ],
};

// Phase 2 — 5/3/1 FSL
const P2_MON = {
  theme: 'ПРИСЕД · 5/3/1',
  subtheme: '+ FSL 5×5',
  exercises: [
    { ex: 'squat',         rule: '531',          lift: 'squat' },
    { ex: 'squat',         rule: '531-fsl-5x5', lift: 'squat', labelKey: 'fsl' },
    { ex: 'kbSwing',       sets: 5, reps: 10, rest: 60, rule: 'heavy' },
    { ex: 'plank',         sets: 3, reps: 1, rest: 60, rule: 'bodyweight', note: '45 сек' },
    { ex: 'ringRow',       sets: 4, reps: 10, rest: 75, rule: 'bodyweight' },
  ],
};
const P2_TUE = {
  theme: 'ЖИМ · 5/3/1',
  subtheme: '+ FSL 5×5 + ПАУЗА',
  exercises: [
    { ex: 'bench',         rule: '531',          lift: 'bench' },
    { ex: 'bench',         rule: '531-fsl-5x5', lift: 'bench', labelKey: 'fsl' },
    { ex: 'pausedBench',   sets: 3, reps: 3, rest: 120, rule: 'pct-tm', lift: 'bench', pct: 0.70 },
    { ex: 'pullup',        sets: 5, reps: 4, rest: 120, rule: 'lp-pullup', lift: 'pullup' },
    { ex: 'dbBench',       sets: 3, reps: 10, rest: 75, rule: 'moderate' },
    { ex: 'pullApart',     sets: 4, reps: 25, rest: 45, rule: 'band' },
  ],
};
const P2_WED = P1_WED;
const P2_THU = {
  theme: 'ТЯГА · 5/3/1',
  subtheme: '+ FSL 3×5 · ГИРИ',
  exercises: [
    { ex: 'deadlift',      rule: '531',          lift: 'deadlift' },
    { ex: 'deadlift',      rule: '531-fsl-3x5', lift: 'deadlift', labelKey: 'fsl' },
    { ex: 'rdl',           sets: 3, reps: 8, rest: 120, rule: 'pct-tm', lift: 'deadlift', pct: 0.65 },
    { ex: 'kbSwing',       sets: 10, reps: 10, rest: 50, rule: 'heavy', note: 'EMOM' },
    { ex: 'chinup',        sets: 4, reps: 6, rest: 90, rule: 'bodyweight', note: 'максимум' },
    { ex: 'farmerCarry',   sets: 3, reps: 1, rest: 60, rule: 'heavy', note: '40м' },
  ],
};
const P2_FRI = {
  theme: 'ЖИМ СТОЯ · 5/3/1',
  subtheme: '+ FSL 5×5 · УЗКИЙ',
  exercises: [
    { ex: 'ohp',           rule: '531',          lift: 'ohp' },
    { ex: 'ohp',           rule: '531-fsl-5x5', lift: 'ohp', labelKey: 'fsl' },
    { ex: 'closeGrip',     sets: 4, reps: 6, rest: 120, rule: 'pct-tm', lift: 'bench', pct: 0.65 },
    { ex: 'ringDip',       sets: 4, reps: 7, rest: 90, rule: 'bodyweight' },
    { ex: 'dbRow',         sets: 4, reps: 10, rest: 75, rule: 'moderate' },
    { ex: 'facePull',      sets: 3, reps: 20, rest: 45, rule: 'moderate' },
  ],
};

// Phase 3 — Intensification (same structure as P2 but wave swapped + Joker singles)
const P3_MON = { ...P2_MON, theme: 'ПРИСЕД · ИНТЕНСИФ.' };
const P3_TUE = { ...P2_TUE, theme: 'ЖИМ · ИНТЕНСИФ.' };
const P3_WED = P2_WED;
const P3_THU = { ...P2_THU, theme: 'ТЯГА · ИНТЕНСИФ.' };
const P3_FRI = { ...P2_FRI, theme: 'ЖИМ СТОЯ · ИНТЕНСИФ.' };

const TEMPLATES = {
  p1: { mon: P1_MON, tue: P1_TUE, wed: P1_WED, thu: P1_THU, fri: P1_FRI },
  p2: { mon: P2_MON, tue: P2_TUE, wed: P2_WED, thu: P2_THU, fri: P2_FRI },
  p3: { mon: P3_MON, tue: P3_TUE, wed: P3_WED, thu: P3_THU, fri: P3_FRI },
};

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEKDAY_NAMES_RU = {
  mon: 'ПОНЕДЕЛЬНИК', tue: 'ВТОРНИК', wed: 'СРЕДА', thu: 'ЧЕТВЕРГ', fri: 'ПЯТНИЦА', sat: 'СУББОТА', sun: 'ВОСКРЕСЕНЬЕ',
};
const WEEKDAY_SHORT_RU = {
  mon: 'ПН', tue: 'ВТ', wed: 'СР', thu: 'ЧТ', fri: 'ПТ', sat: 'СБ', sun: 'ВС',
};
const MONTH_SHORT_RU = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];

// ─── Date utilities ─────────────────────────────────────────────────────────
function dateToISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function daysBetween(isoA, isoB) {
  const a = isoToDate(isoA), b = isoToDate(isoB);
  return Math.round((b - a) / 86400000);
}
function weekdayKey(d) {
  return WEEKDAY_KEYS[d.getDay()];
}
function formatShort(iso) {
  const d = isoToDate(iso);
  return `${WEEKDAY_SHORT_RU[weekdayKey(d)]} · ${d.getDate()} ${MONTH_SHORT_RU[d.getMonth()]}`;
}

// Resolve program coordinates from start date + today.
// Returns { phase, week, dayInWeek (1=Mon..5=Fri, 6=Sat, 7=Sun), weekday, totalDay, rest: bool }.
function programCoords(startISO, todayISO) {
  const start = isoToDate(startISO);
  // snap start back to Monday of that week
  const dow = start.getDay(); // 0=Sun..6=Sat
  const toMonOffset = dow === 0 ? -6 : 1 - dow;
  const startMon = new Date(start.getFullYear(), start.getMonth(), start.getDate() + toMonOffset);
  const today = isoToDate(todayISO);
  const daysFromStart = Math.round((today - startMon) / 86400000);

  if (daysFromStart < 0) {
    return { before: true, weekdayName: WEEKDAY_NAMES_RU[weekdayKey(today)] };
  }

  const totalDay = daysFromStart + 1;
  const week0 = Math.floor(daysFromStart / 7); // 0-based week
  const dowToday = daysFromStart % 7; // 0=Mon..6=Sun (relative to snapped startMon)
  const week = week0 + 1;
  const phase = week <= 4 ? 1 : week <= 8 ? 2 : 3;
  const weekday = ['mon','tue','wed','thu','fri','sat','sun'][dowToday];
  const rest = weekday === 'sat' || weekday === 'sun';
  const after = week > 12;
  return { phase, week, weekday, totalDay, rest, after, weekdayName: WEEKDAY_NAMES_RU[weekday] };
}

// ─── 5/3/1 wave ─────────────────────────────────────────────────────────────
// Week-of-phase wave (1..4). Returns sets: [{pct,reps,amrap?}]
function fiveThreeOneWave(weekOfPhase, phase) {
  // Phase 3: swap week 1 and week 2 (3s first, then 5s)
  const swap = phase === 3;
  const w = swap && weekOfPhase === 1 ? 2
          : swap && weekOfPhase === 2 ? 1
          : weekOfPhase;
  if (w === 1) return [ {pct:0.65,reps:5}, {pct:0.75,reps:5}, {pct:0.85,reps:5,amrap:true} ];
  if (w === 2) return [ {pct:0.70,reps:3}, {pct:0.80,reps:3}, {pct:0.90,reps:3,amrap:true} ];
  if (w === 3) return [ {pct:0.75,reps:5}, {pct:0.85,reps:3}, {pct:0.95,reps:1,amrap:true} ];
  // week 4 deload
  return [ {pct:0.40,reps:5}, {pct:0.50,reps:5}, {pct:0.60,reps:5} ];
}

// ─── Rounding ───────────────────────────────────────────────────────────────
function roundPlate(kg, step = 2.5) {
  return Math.round(kg / step) * step;
}

// ─── Resolve one template into a session with concrete loads ───────────────
// Inputs:
//   template: P{1..3}_{MON..FRI}
//   coords:   { phase, week, weekday, ... }
//   profile:  { trainingMax, estimatedOneRM, ... }
//   history:  array of past logged sessions (for LP working-weight calc)
// Returns:
//   { theme, subtheme, light, exercises: [{ ex, exDef, sets, reps, prescribedKg, amrap, rest, rule, note, labelKey, lift }] }
function resolveSession(template, coords, profile, history) {
  const { phase, week } = coords;
  const weekOfPhase = ((week - 1) % 4) + 1;
  const tm = profile.trainingMax || {};
  const oneRM = profile.estimatedOneRM || {};

  const out = { theme: template.theme, subtheme: template.subtheme, light: !!template.light, exercises: [] };

  template.exercises.forEach((spec) => {
    const exDef = EXERCISES[spec.ex];
    const pushed = [];

    if (spec.rule === 'lp-main') {
      // Phase 1 LP: working weight from last session of this lift + standard jump.
      // Start = 0.65 × 1RM for squat/deadlift, 0.75 × 1RM for bench/OHP.
      const lift = spec.lift;
      const startPct = (lift === 'squat' || lift === 'deadlift') ? 0.65 : 0.75;
      const startKg = roundPlate((oneRM[lift] || 60) * startPct);
      // find last logged set for this exercise & lift in Phase 1
      let lastKg = null, missedLast = false;
      for (let i = history.length - 1; i >= 0; i--) {
        const s = history[i];
        if (!s.loggedSets) continue;
        const ls = s.loggedSets.find((x) => x.exerciseKey === spec.ex && x.isMain);
        if (ls) {
          lastKg = ls.actualWeightKg;
          missedLast = ls.missedPrescribed;
          break;
        }
      }
      let target;
      if (lastKg == null) {
        target = startKg;
      } else {
        const jump = (lift === 'squat' || lift === 'deadlift') ? 5 : 2.5;
        target = missedLast ? lastKg : lastKg + jump;
      }
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets, reps: spec.reps, prescribedKg: target,
        amrap: false, rest: spec.rest, rule: spec.rule, lift, isMain: true,
      });

    } else if (spec.rule === '531') {
      // Three 5/3/1 sets at %TM
      const wave = fiveThreeOneWave(weekOfPhase, phase);
      const tmKg = tm[spec.lift] || 0;
      wave.forEach((w, idx) => {
        pushed.push({
          ex: spec.ex, exDef, sets: 1, reps: w.reps, prescribedKg: roundPlate(tmKg * w.pct),
          amrap: !!w.amrap, rest: idx === wave.length - 1 ? 300 : 180, rule: spec.rule, lift: spec.lift,
          isMain: true, setLabel: `${Math.round(w.pct * 100)}%`,
        });
      });

    } else if (spec.rule === '531-fsl-5x5' || spec.rule === '531-fsl-3x5') {
      const fslSets = spec.rule === '531-fsl-5x5' ? 5 : 3;
      const wave = fiveThreeOneWave(weekOfPhase, phase);
      const firstPct = wave[0].pct;
      const tmKg = tm[spec.lift] || 0;
      pushed.push({
        ex: spec.ex, exDef, sets: fslSets, reps: 5, prescribedKg: roundPlate(tmKg * firstPct),
        amrap: false, rest: 120, rule: spec.rule, lift: spec.lift, labelKey: spec.labelKey, isMain: false,
      });

    } else if (spec.rule === 'pct-tm') {
      const tmKg = tm[spec.lift] || 0;
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets, reps: spec.reps, prescribedKg: roundPlate(tmKg * spec.pct),
        amrap: false, rest: spec.rest, rule: spec.rule, lift: spec.lift, isMain: false,
      });

    } else if (spec.rule === 'pct1rm') {
      const kg = oneRM[spec.lift] || 0;
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets, reps: spec.reps, prescribedKg: roundPlate(kg * spec.pct),
        amrap: false, rest: spec.rest, rule: spec.rule, lift: spec.lift, isMain: false,
      });

    } else if (spec.rule === 'pct-of-working') {
      // of previous-session actual working weight for spec.lift
      let baseKg = (oneRM[spec.lift] || 60) * 0.55;
      for (let i = history.length - 1; i >= 0; i--) {
        const s = history[i];
        const ls = s.loggedSets && s.loggedSets.find((x) => x.lift === spec.lift && x.isMain);
        if (ls) { baseKg = ls.actualWeightKg; break; }
      }
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets, reps: spec.reps, prescribedKg: roundPlate(baseKg * spec.pct),
        amrap: false, rest: spec.rest, rule: spec.rule, lift: spec.lift, isMain: false,
      });

    } else if (spec.rule === 'lp-pullup') {
      // bodyweight until 3×8 clean, then +1.25 kg per successful session.
      let addedKg = 0, hitCleanThree = false;
      for (let i = 0; i < history.length; i++) {
        const s = history[i];
        if (!s.loggedSets) continue;
        const pullSets = s.loggedSets.filter((x) => x.exerciseKey === 'pullup');
        if (pullSets.length >= 3 && pullSets.slice(0, 3).every((x) => x.actualReps >= 8)) {
          hitCleanThree = true;
        }
        if (hitCleanThree) {
          const anyAdded = pullSets.find((x) => (x.actualAddedKg || 0) > 0);
          if (anyAdded) addedKg = Math.max(addedKg, anyAdded.actualAddedKg);
        }
      }
      // if clean three and some added exists, bump by 1.25
      const target = hitCleanThree ? addedKg + 1.25 : 0;
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets, reps: spec.reps, prescribedKg: target,
        amrap: false, rest: spec.rest, rule: spec.rule, lift: spec.lift, isMain: false,
      });

    } else if (spec.rule === 'moderate' || spec.rule === 'heavy' || spec.rule === 'band' ||
               spec.rule === 'bodyweight' || spec.rule === 'custom') {
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets, reps: spec.reps, prescribedKg: 0,
        amrap: false, rest: spec.rest, rule: spec.rule, lift: null, note: spec.note, isMain: false,
      });

    } else {
      pushed.push({
        ex: spec.ex, exDef, sets: spec.sets || 1, reps: spec.reps || 1, prescribedKg: 0,
        amrap: false, rest: spec.rest || 60, rule: spec.rule, lift: null, note: spec.note, isMain: false,
      });
    }

    out.exercises.push(...pushed);
  });

  return out;
}

// ─── Epley 1RM ──────────────────────────────────────────────────────────────
function epley1RM(weightKg, reps) {
  if (!weightKg || !reps) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

// ─── Get today's session given state ────────────────────────────────────────
function getTodaySession(profile, history, todayISO) {
  const coords = programCoords(profile.startDateISO, todayISO);
  if (coords.before) return { kind: 'before', coords };
  if (coords.after) return { kind: 'after', coords };
  if (coords.rest) return { kind: 'rest', coords };
  const t = TEMPLATES['p' + coords.phase][coords.weekday];
  if (!t) return { kind: 'rest', coords };
  const session = resolveSession(t, coords, profile, history);
  return { kind: 'training', coords, session };
}

// Get a session for arbitrary (phase,week,weekday) — used by PROGRAM view
function getSessionFor(phase, week, weekday, profile, history) {
  const t = TEMPLATES['p' + phase][weekday];
  if (!t) return null;
  const coords = { phase, week, weekday };
  return { coords, session: resolveSession(t, coords, profile, history) };
}

// Volume for a session (sum of weight × reps completed)
function sessionVolumeKg(loggedSets) {
  return loggedSets.reduce((acc, s) => acc + (s.actualWeightKg || 0) * (s.actualReps || 0), 0);
}

Object.assign(window, {
  EXERCISES, CUES, TEMPLATES, WEEKDAY_KEYS, WEEKDAY_NAMES_RU, WEEKDAY_SHORT_RU, MONTH_SHORT_RU,
  dateToISO, isoToDate, daysBetween, weekdayKey, formatShort,
  programCoords, fiveThreeOneWave, roundPlate, resolveSession,
  epley1RM, getTodaySession, getSessionFor, sessionVolumeKg,
});
