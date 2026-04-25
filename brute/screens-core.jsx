// BRUTE — core screens: Onboarding, Today, ActiveWorkout, PRCelebration, SessionComplete.

// ─── Onboarding ─────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [oneRM, setOneRM] = React.useState({ squat: 70, bench: 75, deadlift: 90, ohp: 45 });
  const [bw, setBW] = React.useState(80);
  // default to next Monday
  const defaultStart = () => {
    const d = new Date();
    const delta = (8 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + delta);
    return dateToISO(d);
  };
  const [startISO, setStartISO] = React.useState(defaultStart);

  const next = () => {
    hapticLight();
    if (step === 3) {
      onDone({
        name: name.trim() || 'БОЕЦ',
        estimatedOneRM: { ...oneRM, pullup: 0 },
        bodyweightKg: bw,
        startDateISO: startISO,
      });
    } else {
      setStep(step + 1);
    }
  };
  const back = () => { hapticLight(); setStep(Math.max(0, step - 1)); };

  const steps = [
    {
      title: 'КАК ТЕБЯ ЗОВУТ?',
      body: (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="ИМЯ"
            style={onbInput}/>
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 12 }}>
            Это нигде не светится. Просто как тебя позвать.
          </div>
        </div>
      ),
    },
    {
      title: 'СКОЛЬКО ЖЕЛЕЗА?',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { k: 'squat',    l: 'ПРИСЕД' },
            { k: 'bench',    l: 'ЖИМ ЛЁЖА' },
            { k: 'deadlift', l: 'СТАНОВАЯ' },
            { k: 'ohp',      l: 'ЖИМ СТОЯ' },
          ].map(({ k, l }) => (
            <div key={k}>
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>{l} · РМ</div>
              <Stepper value={oneRM[k]} onChange={(v) => setOneRM({ ...oneRM, [k]: v })}
                min={20} max={400} step={2.5} onHaptic={hapticLight} unit="КГ"/>
            </div>
          ))}
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 4 }}>
            Прикидочно — ок. Точные проверим на 12-й неделе.
          </div>
        </div>
      ),
    },
    {
      title: 'ВЗВЕШИВАНИЕ.',
      body: (
        <div>
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>ВЕС ТЕЛА</div>
          <Stepper value={bw} onChange={setBW} min={40} max={200} step={0.5} onHaptic={hapticLight} unit="КГ" big/>
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 14 }}>
            Нужен чтобы считать подтягивания и отжимания с весом, и тренды.
          </div>
        </div>
      ),
    },
    {
      title: 'КОГДА СТАРТ?',
      body: (
        <div>
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>ПЕРВЫЙ ДЕНЬ</div>
          <input type="date" value={startISO} onChange={(e) => setStartISO(e.target.value)}
            style={onbInput}/>
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 12 }}>
            Программа привяжется к понедельнику этой недели. 12 недель, 5 дней в неделю.
          </div>
        </div>
      ),
    },
  ];

  const s = steps[step];

  return (
    <PhoneScreen background={BRUTE.bg}>
      <TopBar
        left={step > 0 ? <BackButton onClick={back}/> : <div/>}
        center={<div className="brute-caption" style={{ color: BRUTE.textFaint }}>{step + 1} / 4</div>}
        right={<div/>}/>

      <ScrollArea padding="24px 24px 120px">
        <div className="brute-display" style={{
          fontSize: 44, lineHeight: 0.95, color: BRUTE.text,
          letterSpacing: '-0.02em', marginBottom: 24,
        }}>{s.title}</div>

        <BruteCard tone="bone" padding={20} grit={1}>
          <div style={{ color: BRUTE.ink }}>{s.body}</div>
        </BruteCard>
      </ScrollArea>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 28px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
        background: `linear-gradient(to top, ${BRUTE.bg} 60%, transparent)`,
      }}>
        <BrushButton onClick={next} variant="slab" color={BRUTE.blood} fontSize={28}>
          {step === 3 ? 'ЗАЖИГАЙ' : 'ДАЛЬШЕ'}
        </BrushButton>
      </div>
    </PhoneScreen>
  );
}

const onbInput = {
  width: '100%', padding: '14px 14px',
  background: BRUTE.paper, border: `1px solid ${BRUTE.ink}`,
  fontFamily: "'Bebas Neue', Impact, sans-serif",
  fontSize: 28, letterSpacing: '0.02em', color: BRUTE.ink,
  borderRadius: 8, boxSizing: 'border-box',
};

// ─── TODAY ──────────────────────────────────────────────────────────────────
function TodayScreenApp({ onStartSession, onOpenLog }) {
  const { state } = useBrute();
  const todayISO = useTodayISO();
  const { profile, sessions, prs } = state;

  const today = getTodaySession(profile, sessions, todayISO);
  const streak = computeStreak(sessions, profile.startDateISO);
  const bestRM = bestOneRMs(prs, profile);
  const coords = today.coords || {};

  const weekHeader = today.kind === 'before'
    ? `СТАРТ · ${formatShort(profile.startDateISO)}`
    : today.kind === 'after'
    ? `ПРОГРАММА ОКОНЧЕНА · ПЕРЕЗАПУСК В НАСТРОЙКАХ`
    : `НЕДЕЛЯ ${String(coords.week).padStart(2,'0')} · ${coords.weekdayName}`;

  const last = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 20px 110px">
        {/* header strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="brute-display" style={{ fontSize: 28, color: BRUTE.text, letterSpacing: '0.04em' }}>BRUTE</span>
            <span style={{ width: 6, height: 6, background: BRUTE.blood, borderRadius: '50%' }}/>
          </div>
          {streak > 0 && <StreakBadge count={streak}/>}
        </div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 4 }}>{weekHeader}</div>

        {/* Main content by state */}
        {today.kind === 'before' && <BeforeStartCard startISO={profile.startDateISO}/>}
        {today.kind === 'after' && <ProgramCompleteCard/>}
        {today.kind === 'rest' && <RestDayCard/>}
        {today.kind === 'training' && (
          <TrainingCard today={today} onStart={() => onStartSession(today)}/>
        )}

        {/* quick stats: est 1RMs */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {['squat','bench','deadlift','ohp'].map((k) => (
            <StatChip key={k} label={liftNameRu(k)} value={bestRM[k] ? `${Math.round(bestRM[k])}` : '—'}/>
          ))}
        </div>

        {/* last session recap */}
        {last && (
          <div style={{ marginTop: 20 }} onClick={onOpenLog}>
            <LastSessionRecap session={last}/>
          </div>
        )}
      </ScrollArea>
    </PhoneScreen>
  );
}

function liftNameRu(k) {
  return { squat: 'ПРИСЕД', bench: 'ЖИМ', deadlift: 'ТЯГА', ohp: 'ЖИМ СТОЯ', pullup: 'ПОДТЯГ.' }[k] || k.toUpperCase();
}

function StatChip({ label, value }) {
  return (
    <div style={{
      flex: '0 0 auto', minWidth: 86,
      background: BRUTE.surfaceAlt, borderRadius: 12, padding: '10px 12px',
    }}>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 9 }}>{label}</div>
      <div className="brute-mono" style={{ color: BRUTE.text, fontSize: 22, fontWeight: 700, marginTop: 4 }}>
        {value}<span style={{ color: BRUTE.textFaint, fontSize: 11, marginLeft: 3 }}>КГ</span>
      </div>
    </div>
  );
}

function BeforeStartCard({ startISO }) {
  return (
    <div style={{ marginTop: 20 }}>
      <BruteCard tone="bone" padding={20} grit={1}>
        <div className="brute-caption" style={{ color: BRUTE.bruise }}>ДО СТАРТА</div>
        <div className="brute-display" style={{
          fontSize: 42, lineHeight: 0.9, color: BRUTE.ink, marginTop: 8, letterSpacing: '-0.02em',
        }}>ЖДЁМ<br/>ПОНЕДЕЛЬНИКА.</div>
        <div className="brute-body" style={{ color: BRUTE.smoke, marginTop: 12, fontSize: 14 }}>
          Программа начнётся {formatShort(startISO)}. До этого — ешь, спи, отдыхай.
        </div>
      </BruteCard>
    </div>
  );
}

function ProgramCompleteCard() {
  return (
    <div style={{ marginTop: 20 }}>
      <BruteCard tone="bone" padding={20} grit={1}>
        <div className="brute-caption" style={{ color: BRUTE.bruise }}>12 НЕДЕЛЬ ЗАКРЫТЫ</div>
        <div className="brute-display" style={{
          fontSize: 42, lineHeight: 0.9, color: BRUTE.ink, marginTop: 8, letterSpacing: '-0.02em',
        }}>ВОЛНА<br/>ОКОНЧЕНА.</div>
        <div className="brute-body" style={{ color: BRUTE.smoke, marginTop: 12, fontSize: 14 }}>
          Обнови РМ в "ПРОФИЛЕ" → "ПЕРЕСЧИТАТЬ" и запусти новый цикл.
        </div>
      </BruteCard>
    </div>
  );
}

function RestDayCard() {
  return (
    <div style={{ marginTop: 20 }}>
      <BruteCard tone="bone" padding={20} grit={1}>
        <div className="brute-caption" style={{ color: BRUTE.bruise }}>ВЫХОДНОЙ</div>
        <div className="brute-display" style={{
          fontSize: 36, lineHeight: 0.9, color: BRUTE.ink, marginTop: 8, letterSpacing: '-0.02em',
        }}>ВОССТАНАВЛИВАЙСЯ.<br/>ЭТО ТОЖЕ РАБОТА.</div>
        <div className="brute-body" style={{ color: BRUTE.smoke, marginTop: 12, fontSize: 14 }}>
          День ничего не крадёт — он делает тебя сильнее пока ты отдыхаешь.
        </div>
      </BruteCard>
    </div>
  );
}

function TrainingCard({ today, onStart }) {
  const { session, coords } = today;
  const phaseLabel = coords.phase === 1 ? 'ФАЗА 01 · ЛИНЕЙНАЯ ПРОГРЕССИЯ'
                   : coords.phase === 2 ? 'ФАЗА 02 · 5/3/1 FSL'
                   : 'ФАЗА 03 · ИНТЕНСИФИКАЦИЯ';

  // headline: split theme by first space for two-line typography punch
  const headline = session.theme;
  const mainRows = session.exercises.filter((e) => e.isMain || e.rule === '531' || e.rule.startsWith('531'));
  const compact = dedupeByExercise(mainRows).slice(0, 4);

  return (
    <div style={{ marginTop: 20 }}>
      <BruteCard tone="bone" padding={22} grit={2}>
        <div style={{ position: 'absolute', top: -8, right: -8, opacity: 0.08 }}>
          <FlashBarbell size={130} color={BRUTE.ink}/>
        </div>
        <div style={{ position: 'relative' }}>
          <div className="brute-caption" style={{ color: BRUTE.bruise }}>{phaseLabel}</div>
          <div className="brute-display" style={{
            fontSize: 48, lineHeight: 0.88, color: BRUTE.ink, marginTop: 6, letterSpacing: '-0.02em',
          }}>{headline}</div>
          <div className="brute-display" style={{
            fontSize: 18, color: BRUTE.bruise, marginTop: 10, letterSpacing: '0.02em',
          }}>{session.subtheme}</div>

          <div style={{ height: 12, margin: '16px 0' }}>
            <Brush variant="rule" color={BRUTE.ink} style={{ width: '100%', height: '100%', opacity: 0.7 }}/>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {compact.map((ex, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ExerciseArt exerciseKey={ex.ex} size={36} color={BRUTE.ink}/>
                <span className="brute-display" style={{ color: BRUTE.ink, fontSize: 18, letterSpacing: '0.03em', flex: 1 }}>
                  {ex.exDef.name}
                </span>
                <span className="brute-mono" style={{ color: BRUTE.ink, fontSize: 15, fontWeight: 600 }}>
                  {exerciseScheme(ex)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <BrushButton onClick={onStart} variant="slab" color={BRUTE.blood} fontSize={28}>
              НАЧАТЬ
            </BrushButton>
          </div>
        </div>
      </BruteCard>
    </div>
  );
}

function dedupeByExercise(rows) {
  const seen = new Set();
  const out = [];
  rows.forEach((r) => {
    if (seen.has(r.ex)) return;
    seen.add(r.ex);
    out.push(r);
  });
  return out;
}

function exerciseScheme(ex) {
  if (ex.prescribedKg > 0) {
    return `${ex.prescribedKg} × ${ex.sets || 1}/${ex.reps || 1}`;
  }
  if (ex.exDef.unit === 'bw') return `${ex.sets}×${ex.reps} · BW`;
  return `${ex.sets || 1} × ${ex.reps || 1}`;
}

function LastSessionRecap({ session }) {
  const date = formatShort(session.dateISO);
  // pull top set per main lift
  const topByLift = {};
  (session.loggedSets || []).forEach((ls) => {
    if (!ls.lift || !ls.isMain) return;
    const one = ls.computed1RM || 0;
    if (!topByLift[ls.lift] || topByLift[ls.lift].computed1RM < one) topByLift[ls.lift] = ls;
  });
  const rows = Object.keys(topByLift).map((lift) => {
    const ls = topByLift[lift];
    const isPR = (session.prs || []).includes(lift);
    return { lift: liftNameRu(lift), value: `${ls.actualWeightKg} × ${ls.actualReps}`, pr: isPR };
  });

  return (
    <BruteCard tone="ink" padding={16} grit={1} style={{ border: `1px solid ${BRUTE.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="brute-caption" style={{ color: BRUTE.textFaint }}>ВЧЕРА · {date}</div>
        <div className="brute-display" style={{ color: BRUTE.text, fontSize: 16 }}>{session.theme}</div>
      </div>
      {rows.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: BRUTE.text, fontFamily: 'Inter, system-ui', fontSize: 13 }}>{r.lift}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="brute-mono" style={{ color: BRUTE.text, fontSize: 14, fontWeight: 600 }}>{r.value}</span>
                {r.pr && <span className="brute-caption" style={{ color: BRUTE.blood, fontSize: 10 }}>РМ</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </BruteCard>
  );
}

// ─── ACTIVE WORKOUT ─────────────────────────────────────────────────────────
function ActiveWorkoutApp({ onExit, onPR, onSessionComplete }) {
  const { state, actions } = useBrute();
  const a = state.activeSession;
  const [showWeightSheet, setShowWeightSheet] = React.useState(false);
  const [showRPESheet, setShowRPESheet] = React.useState(false);
  const [showNoteSheet, setShowNoteSheet] = React.useState(false);
  const [showPlateSheet, setShowPlateSheet] = React.useState(false);
  const [exitConfirm, setExitConfirm] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [barKg, setBarKg] = React.useState(20);

  // current exercise + set
  const ex = a && a.plannedExercises[a.currentIdx];
  const totalSets = ex ? (ex.sets || 1) : 0;

  // working values for the current set (override weight if needed)
  const [weightOverride, setWeightOverride] = React.useState(null);
  const [repsCompleted, setRepsCompleted] = React.useState(0);
  const [rpe, setRpe] = React.useState(null);
  const [formBreak, setFormBreak] = React.useState(false);
  const [setNote, setSetNote] = React.useState('');

  // reset per-set state when exercise/set changes
  React.useEffect(() => {
    setWeightOverride(null); setRepsCompleted(0); setRpe(null); setFormBreak(false); setSetNote('');
  }, [a && a.currentIdx, a && a.currentSetIdx]);

  // rest ticker
  useTicker(!!(a && a.restStartedAt), 1000);
  const restRemaining = (() => {
    if (!a || !a.restStartedAt) return 0;
    const elapsed = Math.floor((Date.now() - a.restStartedAt) / 1000);
    return Math.max(0, a.restDurationSec - elapsed);
  })();
  React.useEffect(() => {
    if (a && a.restStartedAt && restRemaining === 0) {
      soundRestEnd(state.profile.soundPack);
      hapticTriple();
      actions.stopRest();
    }
  }, [restRemaining, a && a.restStartedAt]);

  // elapsed session timer
  useTicker(!!a, 1000);
  const elapsed = a ? Math.floor((Date.now() - a.startedAt) / 1000) : 0;

  if (!a || !ex) return null;

  const prescribedKg = ex.prescribedKg || 0;
  const actualKg = weightOverride != null ? weightOverride : prescribedKg;
  const targetReps = ex.reps || 1;
  const setLabel = ex.setLabel ? `${ex.setLabel} · ${ex.reps}${ex.amrap ? '+' : ''}` :
                   `${a.currentSetIdx + 1} / ${totalSets}`;

  const logSet = () => {
    if (repsCompleted <= 0) { hapticLight(); return; }
    const setData = {
      exerciseKey: ex.ex,
      setIdx: a.currentSetIdx,
      prescribedWeightKg: prescribedKg,
      actualWeightKg: actualKg,
      prescribedReps: targetReps,
      actualReps: repsCompleted,
      rpe: rpe,
      note: setNote || '',
      formBreak,
      lift: ex.lift,
      isMain: !!ex.isMain,
      missedPrescribed: repsCompleted < targetReps,
      actualAddedKg: ex.exDef.unit === 'kgAdd' ? actualKg : undefined,
    };
    actions.logSet(setData);
    hapticMedium();
    soundSetLogged(state.profile.soundPack);

    // check immediate PR
    if (ex.lift && ex.isMain) {
      const est = epley1RM(actualKg, repsCompleted);
      const prevPR = Math.max(0, ...state.prs.filter((p) => p.lift === ex.lift).map((p) => p.est1RMKg));
      if (est > prevPR && prevPR > 0) {
        hapticTriple();
        soundPR(state.profile.soundPack);
        onPR({
          lift: ex.lift,
          weight: actualKg,
          reps: repsCompleted,
          new1RM: est,
          prev: prevPR,
        });
      }
    }

    // advance
    const isLastSet = a.currentSetIdx + 1 >= totalSets;
    if (isLastSet) {
      const nextIdx = a.currentIdx + 1;
      if (nextIdx >= a.plannedExercises.length) {
        // end of session — finalize
        actions.finishSession();
        onSessionComplete();
        return;
      }
      actions.advanceSet(nextIdx, 0);
    } else {
      actions.advanceSet(a.currentIdx, a.currentSetIdx + 1);
    }
    // start rest
    actions.startRest(ex.rest || 90);
  };

  const nextPreview = a.plannedExercises.slice(a.currentIdx + 1, a.currentIdx + 3);

  return (
    <PhoneScreen background={BRUTE.bg}>
      <TopBar
        left={<CloseXButton onClick={() => setExitConfirm(true)}/>}
        center={<div className="brute-display" style={{ color: BRUTE.text, fontSize: 20, letterSpacing: '0.04em' }}>
          {a.theme}
        </div>}
        right={<SessionTimer seconds={elapsed}/>}
      />

      <ScrollArea padding="8px 16px 24px">
        {/* exercise card */}
        <BruteCard tone="bone" padding={18} grit={2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>
                УПР. {a.currentIdx + 1} / {a.plannedExercises.length}
              </div>
              <div className="brute-display" style={{
                fontSize: 34, lineHeight: 0.9, color: BRUTE.ink, marginTop: 6, letterSpacing: '-0.01em',
              }}>{ex.exDef.name}</div>
            </div>
            <ExerciseArt exerciseKey={ex.ex} size={72} color={BRUTE.ink}/>
          </div>

          {ex.note && (
            <div className="brute-body" style={{ color: BRUTE.smoke, fontSize: 12, marginTop: 4 }}>{ex.note}</div>
          )}

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="brute-caption" style={{ color: BRUTE.bruise }}>ПОДХОД {setLabel}</div>
            <div className="brute-caption" style={{ color: BRUTE.bruise }}>ОТДЫХ {Math.round((ex.rest || 90) / 60)}:{String((ex.rest || 90) % 60).padStart(2,'0')}</div>
          </div>

          {/* hero weight */}
          {prescribedKg > 0 ? (
            <button onClick={() => setShowWeightSheet(true)} className="brute-press brute-no-select"
              style={{ background: 'transparent', border: 0, padding: 0, marginTop: 6, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <div className="brute-mono" style={{ color: BRUTE.ink, fontSize: 62, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {actualKg}<span style={{ color: BRUTE.bruise, fontSize: 20, marginLeft: 8 }}>КГ × {targetReps}{ex.amrap ? '+' : ''}</span>
              </div>
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 4 }}>
                {ex.amrap ? 'КАК МОЖНО БОЛЬШЕ' : 'НАЖМИ ЧТОБЫ ИЗМЕНИТЬ ВЕС'}
              </div>
            </button>
          ) : (
            <div className="brute-mono" style={{ color: BRUTE.ink, fontSize: 36, fontWeight: 700, marginTop: 8 }}>
              {ex.sets} × {ex.reps}{ex.exDef.unit === 'bw' ? ' · СВОЙ ВЕС' : ''}
            </div>
          )}

          {/* rep cells */}
          <div style={{ marginTop: 14 }}>
            <RepCells target={targetReps} completed={repsCompleted}
              onTap={(i) => { setRepsCompleted(i + 1 === repsCompleted ? i : i + 1); hapticLight(); }}
              color={BRUTE.blood}/>
            {ex.amrap && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => { setRepsCompleted((r) => Math.max(0, r - 1)); hapticLight(); }} style={repBtnStyle}>−</button>
                <span className="brute-mono" style={{ color: BRUTE.ink, fontSize: 18, minWidth: 40, textAlign: 'center' }}>{repsCompleted}</span>
                <button onClick={() => { setRepsCompleted((r) => r + 1); hapticLight(); }} style={repBtnStyle}>+</button>
                <span className="brute-caption" style={{ color: BRUTE.bruise, marginLeft: 4 }}>AMRAP</span>
              </div>
            )}
          </div>

          {/* minor buttons row */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MiniBtn label={rpe ? `RPE ${rpe}` : 'RPE'} onClick={() => setShowRPESheet(true)} active={rpe != null}/>
            <MiniBtn label={setNote ? 'ЗАМЕТКА ✓' : 'ЗАМЕТКА'} onClick={() => { setNoteDraft(setNote); setShowNoteSheet(true); }} active={!!setNote}/>
            <MiniBtn label={formBreak ? 'СРЫВ ТЕХНИКИ ✓' : 'СРЫВ ТЕХНИКИ'} onClick={() => { setFormBreak(!formBreak); hapticLight(); }} active={formBreak}/>
            {prescribedKg > 0 && <MiniBtn label="БЛИНЫ" onClick={() => setShowPlateSheet(true)}/>}
          </div>
        </BruteCard>

        {/* log set */}
        <div style={{ marginTop: 12 }}>
          <BrushButton onClick={logSet} variant="slab" color={BRUTE.blood} fontSize={26}>
            ЗАПИСАТЬ
          </BrushButton>
        </div>

        {/* up-next strip */}
        {nextPreview.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>ДАЛЕЕ →</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {nextPreview.map((e, i) => (
                <div key={i} style={{
                  flex: '0 0 auto', background: BRUTE.surfaceAlt,
                  padding: '10px 14px', borderRadius: 10, minWidth: 140,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <ExerciseArt exerciseKey={e.ex} size={32} color={BRUTE.text}/>
                  <div>
                    <div className="brute-display" style={{ color: BRUTE.text, fontSize: 14, letterSpacing: '0.02em' }}>
                      {e.exDef.name}
                    </div>
                    <div className="brute-mono" style={{ color: BRUTE.textFaint, fontSize: 11, marginTop: 2 }}>
                      {exerciseScheme(e)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* rest overlay */}
      {a.restStartedAt && restRemaining > 0 && (
        <RestOverlay
          seconds={restRemaining}
          total={a.restDurationSec}
          onSkip={() => actions.stopRest()}
          onAdjust={(delta) => {
            // reduce/increase by delta seconds by adjusting restStartedAt or restDurationSec
            actions.updateActiveSession({
              restDurationSec: Math.max(5, a.restDurationSec + delta),
            });
            hapticLight();
          }}
        />
      )}

      {/* weight sheet */}
      <Sheet open={showWeightSheet} onClose={() => setShowWeightSheet(false)} title="ФАКТИЧЕСКИЙ ВЕС" height="60%">
        <Stepper value={actualKg} onChange={setWeightOverride}
          min={ex.exDef.unit === 'kgAdd' ? 0 : 20} max={400} step={2.5} onHaptic={hapticLight} unit="КГ" big/>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => setWeightOverride(prescribedKg)} style={sheetBtnStyle}>ПРЕДПИСАНО {prescribedKg}</button>
        </div>
        <div style={{ marginTop: 20 }}>
          <BrushButton onClick={() => setShowWeightSheet(false)} variant="slab" color={BRUTE.blood} fontSize={22}>
            ПРИНЯТЬ
          </BrushButton>
        </div>
      </Sheet>

      {/* RPE sheet */}
      <Sheet open={showRPESheet} onClose={() => setShowRPESheet(false)} title="RPE · ОЦЕНКА" height="50%">
        <RPEPicker value={rpe} onChange={(v) => { setRpe(v); hapticLight(); setTimeout(() => setShowRPESheet(false), 250); }}/>
      </Sheet>

      {/* note sheet */}
      <Sheet open={showNoteSheet} onClose={() => setShowNoteSheet(false)} title="ЗАМЕТКА" height="60%">
        <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Быстро зафиксируй — что было в подходе"
          rows={5}
          style={{
            width: '100%', padding: 12, background: BRUTE.surfaceAlt,
            border: `1px solid ${BRUTE.border}`, borderRadius: 8,
            color: BRUTE.text, fontFamily: 'Inter, system-ui', fontSize: 15,
            boxSizing: 'border-box', resize: 'vertical',
          }}/>
        <div style={{ marginTop: 20 }}>
          <BrushButton onClick={() => { setSetNote(noteDraft); setShowNoteSheet(false); }} variant="slab" color={BRUTE.blood} fontSize={22}>
            СОХРАНИТЬ
          </BrushButton>
        </div>
      </Sheet>

      {/* plate sheet */}
      <Sheet open={showPlateSheet} onClose={() => setShowPlateSheet(false)} title="БЛИНЫ" height="65%">
        <PlateCalc targetKg={actualKg} barKg={barKg} onBarChange={setBarKg}/>
      </Sheet>

      {/* exit confirm */}
      <Sheet open={exitConfirm} onClose={() => setExitConfirm(false)} title="ВЫЙТИ?" height="45%">
        <div style={{ color: BRUTE.textFaint, marginBottom: 20 }}>
          Записанные подходы сохранятся. Незаконченная тренировка не зачтётся в стрик.
        </div>
        <BrushButton onClick={() => { actions.cancelSession(); onExit(); }} variant="slab" color={BRUTE.blood} fontSize={22}>
          ДА, ВЫЙТИ
        </BrushButton>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setExitConfirm(false)} style={{
            width: '100%', padding: '14px', background: 'transparent',
            border: `1px solid ${BRUTE.border}`, borderRadius: 10,
            color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 20, cursor: 'pointer',
          }}>ОТМЕНА</button>
        </div>
      </Sheet>
    </PhoneScreen>
  );
}

const repBtnStyle = {
  width: 36, height: 36, borderRadius: 8,
  background: BRUTE.surface, border: `1px solid ${BRUTE.text}`,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 22, cursor: 'pointer',
};
const sheetBtnStyle = {
  flex: 1, padding: '12px', background: BRUTE.surfaceAlt, border: 0,
  color: BRUTE.text, borderRadius: 8, fontFamily: "'Bebas Neue', Impact", fontSize: 16, cursor: 'pointer',
};

function MiniBtn({ label, onClick, active }) {
  return (
    <button onClick={onClick} className="brute-press brute-no-select"
      style={{
        background: active ? BRUTE.text : 'transparent',
        border: `1px solid ${active ? BRUTE.text : BRUTE.border}`,
        color: active ? BRUTE.surface : BRUTE.text,
        padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
        fontFamily: "'Bebas Neue', Impact", fontSize: 14, letterSpacing: '0.04em',
      }}>{label}</button>
  );
}

function RestOverlay({ seconds, total, onSkip, onAdjust }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '20px 20px 30px',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
      background: `linear-gradient(to top, ${BRUTE.bg} 70%, transparent)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      zIndex: 80,
    }}>
      <RestTimerRing seconds={seconds} total={total} color={BRUTE.blood}/>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onAdjust(-30)} style={restAdj}>−30</button>
        <button onClick={onSkip} style={{ ...restAdj, background: BRUTE.blood }}>ПРОПУСК</button>
        <button onClick={() => onAdjust(30)} style={restAdj}>+30</button>
      </div>
    </div>
  );
}
const restAdj = {
  padding: '10px 18px', background: BRUTE.surfaceAlt, border: 0,
  color: BRUTE.text, borderRadius: 8,
  fontFamily: "'Bebas Neue', Impact", fontSize: 16, cursor: 'pointer',
};

// ─── PR CELEBRATION ─────────────────────────────────────────────────────────
function PRCelebrationApp({ pr, onDismiss }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRUTE.bg, zIndex: 900,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'env(safe-area-inset-top) 24px env(safe-area-inset-bottom)',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: halftoneBg('#fff', 1), opacity: 0.2 }}/>

      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <div style={{ position: 'absolute', inset: '-24px -40px' }}>
            <Brush variant="splat" color={BRUTE.blood} style={{ width: '100%', height: '100%' }}/>
          </div>
          <div style={{ position: 'relative' }}>
            <FlashMedallion size={140} lift={liftNameRu(pr.lift)} weight={`${Math.round(pr.new1RM)}`}/>
          </div>
        </div>

        <div className="brute-caption" style={{ color: BRUTE.blood, fontSize: 13 }}>★ ЛИЧНЫЙ РЕКОРД ★</div>
        <div className="brute-display" style={{ fontSize: 64, color: BRUTE.text, letterSpacing: '-0.02em', marginTop: 4 }}>
          НОВЫЙ РМ.
        </div>
        <div className="brute-mono" style={{ fontSize: 72, color: BRUTE.text, fontWeight: 700, marginTop: 6 }}>
          {Math.round(pr.new1RM)}<span style={{ fontSize: 24, color: BRUTE.textFaint, marginLeft: 8 }}>КГ</span>
        </div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 8 }}>
          РМ · ЭПЛИ · {pr.weight} × {pr.reps}
        </div>
        {pr.prev > 0 && (
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 4 }}>
            БЫЛО · {pr.prev} КГ
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 40 }}>
        <BrushButton onClick={onDismiss} variant="slab" color={BRUTE.blood} fontSize={26}>
          ЗА РАБОТУ
        </BrushButton>
      </div>
    </div>
  );
}

// ─── SESSION COMPLETE ───────────────────────────────────────────────────────
function SessionCompleteApp({ lastSession, onClose }) {
  if (!lastSession) return null;
  const durationMin = Math.round(lastSession.durationSec / 60);
  const mm = String(Math.floor(lastSession.durationSec / 60)).padStart(2, '0');
  const ss = String(lastSession.durationSec % 60).padStart(2, '0');
  const duration = `${Math.floor(lastSession.durationSec / 3600).toString().padStart(2,'0')}:${mm}:${ss}`;
  const sets = (lastSession.loggedSets || []).length;
  const totalVolume = Math.round(lastSession.totalVolumeKg);
  const prsCount = (lastSession.prs || []).length;
  const week = lastSession.coords ? lastSession.coords.week : 1;

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="50px 24px 120px">
        <div style={{ textAlign: 'center' }}>
          <FlashTombstone size={140} color={BRUTE.bone} liftLabel={`НЕДЕЛЯ ${String(week).padStart(2,'0')}`} topText="ПЕЧАТЬ" subText="НЕДЕЛИ"/>
          <div className="brute-display" style={{ fontSize: 48, color: BRUTE.text, marginTop: 16, letterSpacing: '-0.02em', lineHeight: 0.9 }}>
            ТРЕНИРОВКА<br/>ЗАКРЫТА.
          </div>
          <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 10 }}>
            НЕДЕЛЯ {String(week).padStart(2, '0')} · {lastSession.theme}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="brute-caption" style={{ color: BRUTE.textFaint }}>ЖУРНАЛ</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <LedgerRow label="ПРОДОЛЖИТ." value={duration}/>
            <LedgerRow label="ОБЩИЙ ТОННАЖ" value={`${totalVolume} КГ`}/>
            <LedgerRow label="ПОДХОДОВ" value={String(sets)}/>
            <LedgerRow label="РЕКОРДОВ" value={String(prsCount)} highlight={prsCount > 0}/>
          </div>
        </div>
      </ScrollArea>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 28px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
      }}>
        <BrushButton onClick={onClose} variant="slab" color={BRUTE.blood} fontSize={26}>
          ЗАКРЫТЬ
        </BrushButton>
      </div>
    </PhoneScreen>
  );
}

function LedgerRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      background: BRUTE.surfaceAlt, borderRadius: 8, padding: '10px 14px',
      border: highlight ? `1px solid ${BRUTE.blood}` : 'none',
    }}>
      <span className="brute-caption" style={{ color: BRUTE.textFaint }}>{label}</span>
      <span className="brute-mono" style={{ color: highlight ? BRUTE.blood : BRUTE.text, fontSize: 16, fontWeight: 700 }}>
        {value}
      </span>
    </div>
  );
}

Object.assign(window, {
  Onboarding, TodayScreenApp, ActiveWorkoutApp, PRCelebrationApp, SessionCompleteApp,
  liftNameRu,
});
