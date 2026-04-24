// BRUTE — ACTIVE WORKOUT screen
// Full interactive: tap reps, log set, live rest timer, drum-roll weight, auto-advance.

function ActiveWorkoutScreen({ onExit, onPR, onSessionComplete, grit = 2, accent = BRUTE.blood, forceState = 'normal', lang = 'en' }) {
  const S = STRINGS[lang] || STRINGS.en;
  const exercises = SESSION.exercises.filter((e) => e.category !== 'warmup');
  const [exIdx, setExIdx] = React.useState(0);
  const ex = exercises[exIdx];

  const [setIdx, setSetIdx] = React.useState(0);           // current set number
  const [reps, setReps] = React.useState(0);               // reps tapped this set
  const [actualWeight, setActualWeight] = React.useState(ex?.prescribedWeight ?? 0);
  const [resting, setResting] = React.useState(forceState === 'resting');
  const [restLeft, setRestLeft] = React.useState(ex?.rest ?? 0);
  const [elapsed, setElapsed] = React.useState(1843);       // mock session clock
  const [drum, setDrum] = React.useState(false);

  // reset input when exercise changes
  React.useEffect(() => {
    setSetIdx(0); setReps(0);
    setActualWeight(ex?.prescribedWeight ?? 0);
  }, [exIdx]);

  // session elapsed clock
  React.useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // rest countdown
  React.useEffect(() => {
    if (!resting) return;
    if (restLeft <= 0) { setResting(false); return; }
    const t = setTimeout(() => setRestLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, restLeft]);

  const logSet = () => {
    // Check for PR on bench main lift
    if (ex.id === 'bench' && setIdx === 0 && actualWeight >= 85 && reps >= 5) {
      onPR && onPR({ lift: 'BENCH', weight: actualWeight, reps, new1RM: Math.round(epley1RM(actualWeight, reps)) });
    }
    const nextSet = setIdx + 1;
    if (nextSet >= ex.sets) {
      // advance exercise
      if (exIdx + 1 >= exercises.length) {
        onSessionComplete && onSessionComplete();
        return;
      }
      setExIdx(exIdx + 1);
    } else {
      setSetIdx(nextSet);
      setReps(0);
      setResting(true);
      setRestLeft(ex.rest);
    }
  };

  const skipRest = () => { setResting(false); setRestLeft(ex.rest); };
  const adjustRest = (d) => setRestLeft((s) => Math.max(0, s + d));

  return (
    <div style={{
      minHeight: '100%', background: BRUTE.ink, color: BRUTE.paper,
      position: 'relative', paddingBottom: 30,
    }}>
      {/* halftone */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: halftoneBg('#fff', grit === 3 ? 2 : 1), opacity: 0.25 }}/>

      <div style={{ position: 'relative', zIndex: 1, padding: '58px 16px 0' }}>
        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={onExit} style={{
            background: 'transparent', border: 0, color: BRUTE.ash,
            fontSize: 22, padding: 4, cursor: 'pointer', fontFamily: 'monospace',
          }}>✕</button>
          <span className="brute-display" style={{ fontSize: 22, color: BRUTE.paper, letterSpacing: '0.04em' }}>
            {S.theme}
          </span>
          <SessionTimer seconds={elapsed}/>
        </div>

        {/* exercise card */}
        <BruteCard tone="bone" grit={grit} padding={20} radius={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>
                {S.exerciseOf(String(exIdx + 1).padStart(2, '0'), String(exercises.length).padStart(2, '0'))}
              </div>
              <div className="brute-display" style={{ fontSize: 36, color: BRUTE.ink, letterSpacing: '-0.01em', lineHeight: 0.95, marginTop: 2 }}>
                {(S.exercises && S.exercises[ex.id]) || ex.name}
              </div>
            </div>
            <FlashBarbell size={44} color={BRUTE.ink}/>
          </div>

          {/* set counter + prescribed */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
            <span className="brute-display" style={{ fontSize: 20, color: BRUTE.bruise, letterSpacing: '0.02em' }}>
              {S.setOf(setIdx + 1, ex.sets)}
            </span>
            <span className="brute-caption" style={{ color: BRUTE.ash, marginLeft: 'auto' }}>
              {S.restMin(Math.round(ex.rest / 60))}
            </span>
          </div>

          {/* HERO weight × reps */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <button onClick={() => setDrum(true)}
              className="brute-mono brute-press"
              style={{
                background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
                fontSize: 72, fontWeight: 700, color: BRUTE.ink, lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
              {actualWeight}
            </button>
            <span className="brute-caption" style={{ color: BRUTE.smoke, fontSize: 14 }}>{S.kg}</span>
            <span className="brute-display" style={{ fontSize: 40, color: BRUTE.smoke, margin: '0 4px' }}>×</span>
            <span className="brute-mono" style={{ fontSize: 44, fontWeight: 700, color: BRUTE.ink }}>
              {ex.reps}{ex.isAmrap ? '+' : ''}
            </span>
          </div>

          {/* rep cells */}
          <div style={{ marginTop: 14 }}>
            <RepCells target={ex.reps} completed={reps} color={accent}
                      onTap={(i) => setReps(reps === i + 1 ? i : i + 1)}/>
          </div>

          {/* utility buttons */}
          <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
            {[S.note, S.rpe, S.formBreak].map((b) => (
              <button key={b} className="brute-caption brute-press" style={{
                background: 'transparent', border: `1px dashed ${BRUTE.smoke}`, color: BRUTE.smoke,
                padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
                fontSize: 9,
              }}>{b}</button>
            ))}
          </div>

          {/* LOG SET */}
          <div style={{ marginTop: 16 }}>
            <BrushButton onClick={logSet} color={accent} height={58} fontSize={lang === 'ru' ? 30 : 28}
                         disabled={reps === 0}>
              {S.logSet}
            </BrushButton>
          </div>
        </BruteCard>

        {/* rest timer */}
        {resting && (
          <div style={{ marginTop: 14 }}>
            <BruteCard tone="ink" grit={1} padding={18} radius={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* circular brush ring */}
                <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                  <svg width="96" height="96" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke={BRUTE.smoke} strokeWidth="6"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke={accent}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            strokeDashoffset={2 * Math.PI * 42 * (1 - restLeft / ex.rest)}
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}/>
                  </svg>
                  <div className="brute-mono" style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700, color: BRUTE.paper,
                  }}>
                    {Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, '0')}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="brute-caption" style={{ color: BRUTE.ash }}>{S.rest}</div>
                  <div className="brute-display" style={{ fontSize: 22, color: BRUTE.paper, letterSpacing: '0.02em' }}>
                    {S.breatheLine}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => adjustRest(-30)} className="brute-press" style={{
                      background: BRUTE.smoke, border: 0, color: BRUTE.paper, borderRadius: 6,
                      padding: '6px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, cursor: 'pointer',
                    }}>−30s</button>
                    <button onClick={() => adjustRest(30)} className="brute-press" style={{
                      background: BRUTE.smoke, border: 0, color: BRUTE.paper, borderRadius: 6,
                      padding: '6px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, cursor: 'pointer',
                    }}>+30s</button>
                    <button onClick={skipRest} className="brute-caption brute-press" style={{
                      background: 'transparent', border: `1px solid ${accent}`, color: accent, borderRadius: 6,
                      padding: '6px 10px', fontSize: 10, marginLeft: 'auto', cursor: 'pointer',
                    }}>{S.skip}</button>
                  </div>
                </div>
              </div>
            </BruteCard>
          </div>
        )}

        {/* up-next strip */}
        {!resting && exIdx + 1 < exercises.length && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <span className="brute-caption" style={{ color: BRUTE.ash, alignSelf: 'center' }}>{S.upNext}</span>
            {exercises.slice(exIdx + 1, exIdx + 3).map((u) => (
              <div key={u.id} style={{
                flex: 1, padding: '8px 10px', background: BRUTE.smoke,
                borderRadius: 8, border: `1px solid #333`,
              }}>
                <div className="brute-display" style={{ fontSize: 14, color: BRUTE.paper, letterSpacing: '0.02em' }}>
                  {(S.exercises && S.exercises[u.id]) || u.name}
                </div>
                <div className="brute-mono" style={{ fontSize: 11, color: BRUTE.ash, marginTop: 2 }}>
                  {u.prescribedWeight > 0 ? `${u.prescribedWeight} × ${u.reps} · ${u.sets}` : `BW × ${u.reps} · ${u.sets}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight drum modal */}
      {drum && (
        <div onClick={() => setDrum(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: BRUTE.ink, padding: 20, borderRadius: 18,
            border: `1px solid ${BRUTE.smoke}`, width: 260,
          }}>
            <div className="brute-caption" style={{ color: BRUTE.ash, textAlign: 'center' }}>{S.actualWeight}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <WeightDrum value={actualWeight} onChange={setActualWeight} min={20} max={200} step={2.5}/>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setActualWeight(ex.prescribedWeight)} className="brute-caption brute-press" style={{
                flex: 1, background: 'transparent', border: `1px dashed ${BRUTE.ash}`, color: BRUTE.ash,
                padding: 10, borderRadius: 6, cursor: 'pointer', fontSize: 10,
              }}>{S.resetTo(ex.prescribedWeight)}</button>
              <button onClick={() => setDrum(false)} className="brute-press" style={{
                flex: 1, background: accent, border: 0, color: BRUTE.paper,
                padding: 10, borderRadius: 6, cursor: 'pointer',
                fontFamily: "'Bebas Neue', Impact", fontSize: 16, letterSpacing: '0.04em',
              }}>{S.lock}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ActiveWorkoutScreen });
