// BRUTE — app state: profile, sessions, PRs, bodyweight, active-session resume.
// Persisted to localStorage under key `brute:v1`.

const BRUTE_STORE_KEY = 'brute:v1';

const INITIAL_STATE = {
  v: 3,
  profile: {
    onboarded: false,
    name: '',
    bodyweightKg: 80,
    usesKilograms: true,
    startDateISO: null,
    estimatedOneRM: { squat: 70, bench: 75, deadlift: 90, ohp: 45, pullup: 0 },
    trainingMax: { squat: 60, bench: 63, deadlift: 76, ohp: 38 },
    lang: 'ru',
    soundPack: 'machineshop',
    hapticsOn: true,
    theme: 'light',
    cleanSinceISO: null,
    cleanReasons: [],         // ["Девушка", "Спорт", "Деньги", ...]
    dailyCostUsd: 0,           // for money-saved counter ($, 0 = disabled)
    createdAtISO: null,
  },
  sessions: [],
  prs: [],
  bodyweight: [],
  moodLog: [],
  relapseDates: [],
  cleanRelapses: [],
  urgeLog: [],                  // [{ id, timestamp, dateISO, trigger?, action?, resolved: bool }]
  letters: [],                  // [{ id, writtenAtISO, openOnDay, body, opened: bool, openedAtISO? }]
  photoJournal: [],             // [{ id, dateISO, dataUrl, note? }]
  weeklyReviewsSeen: [],        // [weekStartISO]
  activeSession: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(BRUTE_STORE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    // shallow-merge profile defaults so new fields populate on upgrade
    parsed.profile = { ...INITIAL_STATE.profile, ...(parsed.profile || {}) };
    parsed.sessions = parsed.sessions || [];
    parsed.prs = parsed.prs || [];
    parsed.bodyweight = parsed.bodyweight || [];
    parsed.moodLog = parsed.moodLog || [];
    parsed.cleanRelapses = parsed.cleanRelapses || [];
    if (!parsed.relapseDates) {
      parsed.relapseDates = (parsed.cleanRelapses || []).map((r) => r.dateISO);
    }
    parsed.urgeLog = parsed.urgeLog || [];
    parsed.letters = parsed.letters || [];
    parsed.photoJournal = parsed.photoJournal || [];
    parsed.weeklyReviewsSeen = parsed.weeklyReviewsSeen || [];
    parsed.profile.cleanReasons = parsed.profile.cleanReasons || [];
    // migrate dailyCostRub → dailyCostUsd if needed
    if (parsed.profile.dailyCostUsd == null && parsed.profile.dailyCostRub != null) {
      parsed.profile.dailyCostUsd = Math.round((parsed.profile.dailyCostRub || 0) / 90);
    }
    parsed.profile.dailyCostUsd = parsed.profile.dailyCostUsd || 0;
    delete parsed.profile.dailyCostRub;
    parsed.activeSession = parsed.activeSession || null;
    return parsed;
  } catch (e) {
    console.warn('BRUTE state load failed, resetting.', e);
    return INITIAL_STATE;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(BRUTE_STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('BRUTE state save failed.', e);
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
const BruteCtx = React.createContext(null);

function useBrute() {
  const ctx = React.useContext(BruteCtx);
  if (!ctx) throw new Error('useBrute outside provider');
  return ctx;
}

function BruteProvider({ children }) {
  const [state, setState] = React.useState(loadState);

  // persist whenever state changes (synchronous — localStorage is cheap)
  React.useEffect(() => { saveState(state); }, [state]);

  // ── Actions ──
  const actions = React.useMemo(() => ({

    completeOnboarding(data) {
      setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          ...data,
          trainingMax: {
            squat:    roundPlate((data.estimatedOneRM.squat    || 0) * 0.85),
            bench:    roundPlate((data.estimatedOneRM.bench    || 0) * 0.85),
            deadlift: roundPlate((data.estimatedOneRM.deadlift || 0) * 0.85),
            ohp:      roundPlate((data.estimatedOneRM.ohp      || 0) * 0.85),
          },
          onboarded: true,
          createdAtISO: new Date().toISOString(),
        },
      }));
    },

    updateProfile(patch) {
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    },

    updateTrainingMax(lift, kg) {
      setState((s) => ({
        ...s,
        profile: { ...s.profile, trainingMax: { ...s.profile.trainingMax, [lift]: kg } },
      }));
    },

    logBodyweight(kg, source = 'manual') {
      setState((s) => ({
        ...s,
        bodyweight: [...s.bodyweight, { dateISO: dateToISO(new Date()), kg, source }],
        profile: { ...s.profile, bodyweightKg: kg },
      }));
    },

    startSession(templateCoords, resolvedSession) {
      setState((s) => ({
        ...s,
        activeSession: {
          coords: templateCoords,
          theme: resolvedSession.theme,
          subtheme: resolvedSession.subtheme,
          plannedExercises: resolvedSession.exercises,
          startedAt: Date.now(),
          currentIdx: 0,
          currentSetIdx: 0,
          loggedSets: [],
          restStartedAt: null,
          restDurationSec: 0,
          notes: '',
        },
      }));
    },

    updateActiveSession(patch) {
      setState((s) => {
        if (!s.activeSession) return s;
        return { ...s, activeSession: { ...s.activeSession, ...patch } };
      });
    },

    logSet(setData) {
      // setData: { exerciseKey, setIdx, prescribedWeightKg, actualWeightKg, prescribedReps, actualReps, rpe?, note?, formBreak?, lift?, isMain? }
      setState((s) => {
        if (!s.activeSession) return s;
        const ls = s.activeSession.loggedSets.slice();
        ls.push({
          ...setData,
          timestamp: Date.now(),
          computed1RM: epley1RM(setData.actualWeightKg, setData.actualReps),
        });
        return { ...s, activeSession: { ...s.activeSession, loggedSets: ls } };
      });
    },

    advanceSet(nextIdx, nextSetIdx) {
      setState((s) => {
        if (!s.activeSession) return s;
        return { ...s, activeSession: { ...s.activeSession, currentIdx: nextIdx, currentSetIdx: nextSetIdx } };
      });
    },

    startRest(durationSec) {
      setState((s) => {
        if (!s.activeSession) return s;
        return { ...s, activeSession: { ...s.activeSession, restStartedAt: Date.now(), restDurationSec: durationSec } };
      });
    },

    stopRest() {
      setState((s) => {
        if (!s.activeSession) return s;
        return { ...s, activeSession: { ...s.activeSession, restStartedAt: null, restDurationSec: 0 } };
      });
    },

    finishSession() {
      setState((s) => {
        if (!s.activeSession) return s;
        const a = s.activeSession;
        const duration = Math.round((Date.now() - a.startedAt) / 1000);
        const volume = sessionVolumeKg(a.loggedSets);

        // detect PRs: for every 'main' lift that appeared, find max computed1RM and compare to history
        const byLift = {};
        a.loggedSets.forEach((ls) => {
          if (!ls.lift) return;
          if (!byLift[ls.lift] || ls.computed1RM > byLift[ls.lift].computed1RM) {
            byLift[ls.lift] = ls;
          }
        });

        const newPRs = [];
        const existingPR = (lift) => {
          const hist = s.prs.filter((p) => p.lift === lift);
          if (hist.length === 0) return 0;
          return Math.max(...hist.map((p) => p.est1RMKg));
        };
        Object.keys(byLift).forEach((lift) => {
          const best = byLift[lift];
          const prev = existingPR(lift);
          if (best.computed1RM > prev) {
            newPRs.push({
              lift,
              est1RMKg: best.computed1RM,
              dateAchievedISO: dateToISO(new Date()),
              previousBestKg: prev,
              sourceSetIdx: best.setIdx,
              sourceWeightKg: best.actualWeightKg,
              sourceReps: best.actualReps,
            });
          }
        });

        const logged = {
          id: 'sess-' + a.startedAt,
          dateISO: dateToISO(new Date()),
          theme: a.theme,
          subtheme: a.subtheme,
          coords: a.coords,
          durationSec: duration,
          totalVolumeKg: volume,
          loggedSets: a.loggedSets,
          notes: a.notes || '',
          prs: newPRs.map((p) => p.lift),
        };

        return {
          ...s,
          sessions: [...s.sessions, logged],
          prs: [...s.prs, ...newPRs],
          activeSession: null,
        };
      });
    },

    cancelSession() {
      setState((s) => ({ ...s, activeSession: null }));
    },

    wipeEverything() {
      setState(INITIAL_STATE);
    },

    // ── Sobriety + mood ──
    setCleanSince(isoOrNull) {
      setState((s) => ({ ...s, profile: { ...s.profile, cleanSinceISO: isoOrNull } }));
    },

    relapse() {
      // shorthand for "I relapsed today"
      setState((s) => {
        const todayISO = dateToISO(new Date());
        const prev = s.profile.cleanSinceISO;
        const list = (s.relapseDates || []).slice();
        if (!list.includes(todayISO)) list.push(todayISO);
        list.sort();
        return {
          ...s,
          relapseDates: list,
          cleanRelapses: [...(s.cleanRelapses || []), { dateISO: todayISO, prevSinceISO: prev }],
        };
      });
    },

    toggleRelapse(dateISO) {
      setState((s) => {
        const list = (s.relapseDates || []).slice();
        const idx = list.indexOf(dateISO);
        if (idx >= 0) list.splice(idx, 1);
        else { list.push(dateISO); list.sort(); }
        return { ...s, relapseDates: list };
      });
    },

    logMood(score, note = '') {
      setState((s) => {
        const todayISO = dateToISO(new Date());
        const existing = (s.moodLog || []).filter((m) => m.dateISO !== todayISO);
        return {
          ...s,
          moodLog: [...existing, { dateISO: todayISO, score, note, timestamp: Date.now() }],
        };
      });
    },

    logMoodFor(dateISO, score, note = '') {
      setState((s) => {
        const existing = (s.moodLog || []).filter((m) => m.dateISO !== dateISO);
        return {
          ...s,
          moodLog: [...existing, { dateISO, score, note, timestamp: Date.now() }],
        };
      });
    },

    // ── Reasons + cost ──
    setCleanReasons(arr) {
      setState((s) => ({ ...s, profile: { ...s.profile, cleanReasons: arr } }));
    },
    setDailyCost(usd) {
      setState((s) => ({ ...s, profile: { ...s.profile, dailyCostUsd: usd } }));
    },

    // ── Urge log ──
    logUrge({ trigger, action, resolved }) {
      setState((s) => {
        const u = {
          id: 'urge-' + Date.now(),
          timestamp: Date.now(),
          dateISO: dateToISO(new Date()),
          trigger: trigger || '',
          action: action || '',
          resolved: !!resolved,
        };
        return { ...s, urgeLog: [...(s.urgeLog || []), u] };
      });
    },

    resolveUrge(id, resolved = true) {
      setState((s) => ({
        ...s,
        urgeLog: (s.urgeLog || []).map((u) => u.id === id ? { ...u, resolved } : u),
      }));
    },

    // ── Letters ──
    writeLetter({ openOnDay, body }) {
      setState((s) => {
        const l = {
          id: 'letter-' + Date.now(),
          writtenAtISO: dateToISO(new Date()),
          openOnDay,    // day-of-clean to unlock (e.g. 30, 90, 365)
          body,
          opened: false,
        };
        return { ...s, letters: [...(s.letters || []), l] };
      });
    },

    openLetter(id) {
      setState((s) => ({
        ...s,
        letters: (s.letters || []).map((l) => l.id === id ? { ...l, opened: true, openedAtISO: dateToISO(new Date()) } : l),
      }));
    },

    deleteLetter(id) {
      setState((s) => ({ ...s, letters: (s.letters || []).filter((l) => l.id !== id) }));
    },

    // ── Photo journal ──
    addPhoto({ dataUrl, note }) {
      setState((s) => {
        const p = {
          id: 'photo-' + Date.now(),
          dateISO: dateToISO(new Date()),
          dataUrl,
          note: note || '',
        };
        return { ...s, photoJournal: [...(s.photoJournal || []), p] };
      });
    },

    deletePhoto(id) {
      setState((s) => ({ ...s, photoJournal: (s.photoJournal || []).filter((p) => p.id !== id) }));
    },

    // ── Weekly review ──
    markWeekReviewed(weekStartISO) {
      setState((s) => ({
        ...s,
        weeklyReviewsSeen: [...new Set([...(s.weeklyReviewsSeen || []), weekStartISO])],
      }));
    },

    exportJSON() {
      return JSON.stringify(state, null, 2);
    },

    exportCSV() {
      const rows = [['date','theme','exercise','set','prescribedKg','actualKg','prescribedReps','actualReps','rpe','note','computed1RM']];
      state.sessions.forEach((s) => {
        (s.loggedSets || []).forEach((ls) => {
          rows.push([
            s.dateISO, s.theme, ls.exerciseKey, ls.setIdx + 1,
            ls.prescribedWeightKg, ls.actualWeightKg,
            ls.prescribedReps, ls.actualReps,
            ls.rpe || '', (ls.note || '').replace(/,/g, ';'),
            ls.computed1RM || '',
          ]);
        });
      });
      return rows.map((r) => r.join(',')).join('\n');
    },

  }), [state]);

  const value = React.useMemo(() => ({ state, actions }), [state, actions]);
  return <BruteCtx.Provider value={value}>{children}</BruteCtx.Provider>;
}

// ── Current streak: consecutive weeks with ≥4 sessions ──
function computeStreak(sessions, startDateISO) {
  if (!startDateISO || sessions.length === 0) return 0;
  const byWeek = {};
  sessions.forEach((s) => {
    const coords = s.coords;
    if (!coords) return;
    byWeek[coords.week] = (byWeek[coords.week] || 0) + 1;
  });
  const weeks = Object.keys(byWeek).map(Number).sort((a,b) => a - b);
  if (weeks.length === 0) return 0;
  // walk back from the highest week; streak = consecutive weeks where count ≥ 4
  let streak = 0;
  let expected = weeks[weeks.length - 1];
  while (byWeek[expected] >= 4) {
    streak++;
    expected--;
    if (expected < 1) break;
  }
  return streak;
}

// ── Sessions completed by week ──
function sessionsByWeek(sessions) {
  const map = {};
  sessions.forEach((s) => {
    if (!s.coords) return;
    const k = s.coords.week;
    map[k] = map[k] || [];
    map[k].push(s);
  });
  return map;
}

// ── Best 1RM per lift ever ──
function bestOneRMs(prs, profile) {
  const out = {};
  ['squat','bench','deadlift','ohp'].forEach((lift) => {
    const hist = prs.filter((p) => p.lift === lift);
    const best = hist.length ? Math.max(...hist.map((p) => p.est1RMKg)) : (profile.estimatedOneRM || {})[lift] || 0;
    out[lift] = best;
  });
  return out;
}

// ── Sobriety helpers ──
// daysClean returns the current streak: days since the last relapse on or before today.
// If no relapse yet, returns days since cleanSinceISO.
function daysClean(cleanSinceISO, todayISO, relapseDates = []) {
  if (!cleanSinceISO) return 0;
  // Find most recent relapse ≤ today
  const past = (relapseDates || []).filter((d) => d <= todayISO).sort();
  const lastRelapse = past.length > 0 ? past[past.length - 1] : null;
  if (lastRelapse) {
    if (lastRelapse === todayISO) return 0;
    return Math.max(0, daysBetween(lastRelapse, todayISO));
  }
  return Math.max(0, daysBetween(cleanSinceISO, todayISO));
}

// Status of a day: 'before' | 'relapse' | 'clean' | 'future' | 'today-clean' | 'today-relapse'
function dayStatus(dateISO, cleanSinceISO, todayISO, relapseDates = []) {
  if (!cleanSinceISO) return 'before';
  if (dateISO < cleanSinceISO) return 'before';
  if (dateISO > todayISO) return 'future';
  const isRelapse = (relapseDates || []).includes(dateISO);
  if (dateISO === todayISO) return isRelapse ? 'today-relapse' : 'today-clean';
  return isRelapse ? 'relapse' : 'clean';
}

// Longest clean streak ever recorded.
// Counts whole days FROM cleanSinceISO (exclusive start) TO today (inclusive).
// Matches daysClean semantics: a 31-day-old start with no relapse → 31.
function longestStreak(cleanSinceISO, todayISO, relapseDates = []) {
  if (!cleanSinceISO) return 0;
  const start = isoToDate(cleanSinceISO);
  const today = isoToDate(todayISO);
  const dayMs = 86400000;
  const total = Math.round((today - start) / dayMs);
  if (total <= 0) return 0;
  let best = 0, cur = 0;
  // i=1..total — count days AFTER start day (start day itself isn't a streak day yet)
  for (let i = 1; i <= total; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = dateToISO(d);
    if ((relapseDates || []).includes(iso)) {
      if (cur > best) best = cur;
      cur = 0;
    } else {
      cur++;
    }
  }
  return Math.max(best, cur);
}

function todayMood(moodLog, todayISO) {
  return (moodLog || []).find((m) => m.dateISO === todayISO) || null;
}

function moodAverage(moodLog, days = 7, todayISO) {
  if (!moodLog || moodLog.length === 0) return 0;
  const today = isoToDate(todayISO);
  const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  const cutoffISO = dateToISO(cutoff);
  const recent = moodLog.filter((m) => m.dateISO >= cutoffISO);
  if (recent.length === 0) return 0;
  return recent.reduce((a, m) => a + m.score, 0) / recent.length;
}

// ── Money saved ──
function moneySaved(profile, todayISO, relapseDates) {
  const days = daysClean(profile.cleanSinceISO, todayISO, relapseDates);
  return Math.max(0, days * (profile.dailyCostUsd || 0));
}

// ── Letter unlock check ──
function unlockedLetters(letters, currentDays) {
  return (letters || []).filter((l) => !l.opened && currentDays >= l.openOnDay);
}

// ── Tombstone unlock list ──
const TOMBSTONE_MILESTONES = [30, 60, 90, 180, 365, 730, 1000];
function tombstonesEarned(currentDays) {
  return TOMBSTONE_MILESTONES.filter((m) => currentDays >= m);
}

// ── Strength standards (per Lon Kilgore tables, kg / kg bodyweight) ──
// rough thresholds used in competitive lifting circles
const STRENGTH_STANDARDS = {
  // multiples of bodyweight (male intermediate-level proxies)
  squat:    { novice: 0.8, intermediate: 1.25, advanced: 1.75, elite: 2.25 },
  bench:    { novice: 0.6, intermediate: 1.0,  advanced: 1.4,  elite: 1.75 },
  deadlift: { novice: 1.0, intermediate: 1.5,  advanced: 2.0,  elite: 2.5  },
  ohp:      { novice: 0.4, intermediate: 0.65, advanced: 0.9,  elite: 1.15 },
};
function strengthLevel(lift, oneRMKg, bwKg) {
  if (!oneRMKg || !bwKg) return { ratio: 0, level: 'НЕТ ДАННЫХ' };
  const r = oneRMKg / bwKg;
  const t = STRENGTH_STANDARDS[lift];
  if (!t) return { ratio: r, level: '—' };
  const level = r >= t.elite ? 'ЭЛИТА'
              : r >= t.advanced ? 'ПРОДВИНУТЫЙ'
              : r >= t.intermediate ? 'СРЕДНИЙ'
              : r >= t.novice ? 'НАЧИНАЮЩИЙ'
              : 'НИЖЕ НОВИЧКА';
  return { ratio: r, level };
}

// ── Sunday detection ──
function lastSundayISO(todayISO) {
  const d = isoToDate(todayISO);
  // 0=Sun, 1=Mon..6=Sat
  const dow = d.getDay();
  // last Sunday on or before today (today if Sun)
  const offset = dow; // days since Sunday
  const sun = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
  return dateToISO(sun);
}

// Get the Monday of the week we just finished (last week's Mon → Sun cycle).
// Russian plural: pl(n, 'подход', 'подхода', 'подходов')
function pl(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return many;
  if (m10 === 1) return one;
  if (m10 >= 2 && m10 <= 4) return few;
  return many;
}

function lastWeekStartISO(todayISO) {
  const d = isoToDate(todayISO);
  const dow = d.getDay();   // 0=Sun..6=Sat
  // we want last week's Monday — i.e. 6 days before "this past Sunday" if today is Sun, else more
  const offsetToLastSun = dow;          // days since Sunday-just-passed (0 if today=Sun)
  const lastSun = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offsetToLastSun);
  const lastMon = new Date(lastSun.getFullYear(), lastSun.getMonth(), lastSun.getDate() - 6);
  return dateToISO(lastMon);
}

Object.assign(window, {
  BRUTE_STORE_KEY, INITIAL_STATE,
  loadState, saveState, BruteCtx, BruteProvider, useBrute,
  computeStreak, sessionsByWeek, bestOneRMs,
  daysClean, todayMood, moodAverage, dayStatus, longestStreak,
  moneySaved, unlockedLetters, TOMBSTONE_MILESTONES, tombstonesEarned,
  STRENGTH_STANDARDS, strengthLevel, lastSundayISO, lastWeekStartISO, pl,
});
