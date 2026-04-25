// BRUTE — app state: profile, sessions, PRs, bodyweight, active-session resume.
// Persisted to localStorage under key `brute:v1`.

const BRUTE_STORE_KEY = 'brute:v1';

const INITIAL_STATE = {
  v: 2,
  profile: {
    onboarded: false,
    name: '',
    bodyweightKg: 80,
    usesKilograms: true,
    startDateISO: null,
    estimatedOneRM: { squat: 70, bench: 75, deadlift: 90, ohp: 45, pullup: 0 },
    trainingMax: { squat: 60, bench: 63, deadlift: 76, ohp: 38 },
    lang: 'ru',
    soundPack: 'machineshop', // 'machineshop' | 'silent'
    hapticsOn: true,
    theme: 'light',
    cleanSinceISO: null, // ISO date when sobriety counter started; null = not tracked
    createdAtISO: null,
  },
  sessions: [],       // LoggedSession[]
  prs: [],            // PRRecord[]
  bodyweight: [],     // BodyweightEntry[]
  moodLog: [],        // [{ dateISO, score: 1..5, note: '' }]
  cleanRelapses: [],  // [{ dateISO, prevSinceISO }] — history of resets
  activeSession: null, // { templateKey, startedAt, currentIdx, currentSetIdx, loggedSets[], restStartedAt, restDurationSec }
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
      setState((s) => {
        const todayISO = dateToISO(new Date());
        const prev = s.profile.cleanSinceISO;
        return {
          ...s,
          profile: { ...s.profile, cleanSinceISO: todayISO },
          cleanRelapses: [...(s.cleanRelapses || []), { dateISO: todayISO, prevSinceISO: prev }],
        };
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
function daysClean(cleanSinceISO, todayISO) {
  if (!cleanSinceISO) return 0;
  return Math.max(0, daysBetween(cleanSinceISO, todayISO));
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

Object.assign(window, {
  BRUTE_STORE_KEY, INITIAL_STATE,
  loadState, saveState, BruteCtx, BruteProvider, useBrute,
  computeStreak, sessionsByWeek, bestOneRMs,
  daysClean, todayMood, moodAverage,
});
