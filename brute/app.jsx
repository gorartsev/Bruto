// BRUTE — app root with tab router, active-session overlay, PR celebration overlay.

function BruteApp({ mobile = true }) {
  const { state, actions } = useBrute();
  const { profile, activeSession } = state;
  const [tab, setTab] = React.useState('today');
  const [prOverlay, setPrOverlay] = React.useState(null);
  const [sessionCompleteOverlay, setSessionCompleteOverlay] = React.useState(null);
  const [programSheetSession, setProgramSheetSession] = React.useState(null); // { week, weekday, phase }
  const [logbookSheetSession, setLogbookSheetSession] = React.useState(null); // LoggedSession

  // Onboarding gate
  if (!profile.onboarded) {
    return (
      <Onboarding onDone={(data) => {
        actions.completeOnboarding(data);
      }}/>
    );
  }

  // Active workout overrides tabs
  if (activeSession) {
    return (
      <>
        <ActiveWorkoutApp
          onExit={() => { /* handled internally */ }}
          onPR={(pr) => setPrOverlay(pr)}
          onSessionComplete={() => {
            // read the just-finished session from state inside the setter
            setSessionCompleteOverlay('pending');
          }}
        />
        {prOverlay && (
          <PRCelebrationApp pr={prOverlay} onDismiss={() => setPrOverlay(null)}/>
        )}
      </>
    );
  }

  // Session-complete full-screen (shown after finishSession cleared activeSession)
  if (sessionCompleteOverlay) {
    const last = sessionCompleteOverlay === 'pending'
      ? state.sessions[state.sessions.length - 1]
      : sessionCompleteOverlay;
    return (
      <>
        <SessionCompleteApp lastSession={last}
          onClose={() => { setSessionCompleteOverlay(null); setPrOverlay(null); setTab('today'); }}/>
        {prOverlay && (
          <PRCelebrationApp pr={prOverlay} onDismiss={() => setPrOverlay(null)}/>
        )}
      </>
    );
  }

  // Tab content
  const content = (() => {
    switch (tab) {
      case 'today':
        return <TodayScreenApp
          onStartSession={(today) => {
            actions.startSession(today.coords, today.session);
          }}
          onOpenLog={() => setTab('log')}/>;
      case 'program':
        return <ProgramScreen
          onOpenSession={(coords) => setProgramSheetSession(coords)}/>;
      case 'log':
        return <LogbookScreen onOpenSession={(s) => setLogbookSheetSession(s)}/>;
      case 'days':
        return <CleanDaysScreen/>;
      case 'stats':
        return <StatsScreen/>;
      case 'profile':
        return <ProfileScreen/>;
      default: return null;
    }
  })();

  return (
    <>
      {content}
      <BruteTabBar active={tab} onChange={(t) => { hapticLight(); setTab(t); }}/>

      {programSheetSession && (
        <ProgramSessionSheet
          coords={programSheetSession}
          onClose={() => setProgramSheetSession(null)}
          onStart={() => {
            // generate session for today from these coords if it's "today"
            const todayISO = dateToISO(new Date());
            const coords = programCoords(profile.startDateISO, todayISO);
            if (coords.week === programSheetSession.week && coords.weekday === programSheetSession.weekday) {
              const got = getSessionFor(programSheetSession.phase, programSheetSession.week, programSheetSession.weekday, profile, state.sessions);
              if (got) {
                actions.startSession(got.coords, got.session);
                setProgramSheetSession(null);
              }
            } else {
              setProgramSheetSession(null);
            }
          }}
        />
      )}

      {logbookSheetSession && (
        <LogbookSessionSheet session={logbookSheetSession}
          onClose={() => setLogbookSheetSession(null)}/>
      )}
    </>
  );
}

// Program cell tap → preview session details, plus START if it's today
function ProgramSessionSheet({ coords, onClose, onStart }) {
  const { state } = useBrute();
  const { profile, sessions } = state;
  const got = getSessionFor(coords.phase, coords.week, coords.weekday, profile, sessions);
  if (!got) return null;
  const todayISO = dateToISO(new Date());
  const todayCoords = programCoords(profile.startDateISO, todayISO);
  const isToday = todayCoords.week === coords.week && todayCoords.weekday === coords.weekday;
  const session = got.session;

  return (
    <Sheet open={true} onClose={onClose} title={session.theme} height="80%">
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>
        НЕДЕЛЯ {String(coords.week).padStart(2,'0')} · {WEEKDAY_NAMES_RU[coords.weekday]} · ФАЗА {coords.phase}
      </div>
      <div className="brute-display" style={{ color: BRUTE.text, fontSize: 18, marginBottom: 16 }}>
        {session.subtheme}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {session.exercises.map((ex, i) => (
          <div key={i} style={{
            padding: '10px 12px', background: BRUTE.surfaceAlt, borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <ExerciseArt exerciseKey={ex.ex} size={40} color={BRUTE.text}/>
            <div style={{ flex: 1 }}>
              <div className="brute-display" style={{ color: BRUTE.text, fontSize: 14, letterSpacing: '0.02em' }}>{ex.exDef.name}</div>
              {ex.note && <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 9, marginTop: 2 }}>{ex.note}</div>}
            </div>
            <div className="brute-mono" style={{ color: BRUTE.text, fontSize: 13, fontWeight: 600 }}>
              {ex.prescribedKg > 0 ? `${ex.prescribedKg} × ${ex.sets}/${ex.reps}${ex.amrap ? '+' : ''}` : `${ex.sets}×${ex.reps}`}
            </div>
          </div>
        ))}
      </div>

      {isToday && (
        <div style={{ marginTop: 18 }}>
          <BrushButton onClick={onStart} variant="slab" color={BRUTE.blood} fontSize={22}>
            НАЧАТЬ СЕЙЧАС
          </BrushButton>
        </div>
      )}
    </Sheet>
  );
}

function LogbookSessionSheet({ session, onClose }) {
  return (
    <Sheet open={true} onClose={onClose} title={session.theme} height="80%">
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 14 }}>
        {formatShort(session.dateISO)} · {Math.round(session.durationSec / 60)} МИН · {Math.round(session.totalVolumeKg)} КГ
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groupByExercise(session.loggedSets || []).map((grp, i) => (
          <div key={i} style={{ background: BRUTE.surfaceAlt, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ExerciseArt exerciseKey={grp.key} size={36} color={BRUTE.text}/>
              <div className="brute-display" style={{ color: BRUTE.text, fontSize: 16, letterSpacing: '0.02em' }}>
                {EXERCISES[grp.key]?.name || grp.key}
              </div>
            </div>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {grp.sets.map((ls, si) => (
                <div key={si} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="brute-caption" style={{ color: BRUTE.textFaint }}>ПОДХОД {ls.setIdx + 1}</span>
                  <span className="brute-mono" style={{ color: BRUTE.text, fontSize: 13 }}>
                    {ls.actualWeightKg}кг × {ls.actualReps}
                    {ls.rpe ? ` · RPE ${ls.rpe}` : ''}
                    {ls.formBreak ? ' · СРЫВ' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(session.prs || []).length > 0 && (
        <div style={{ marginTop: 16, padding: 14, border: `1px solid ${BRUTE.blood}`, borderRadius: 10 }}>
          <div className="brute-caption" style={{ color: BRUTE.blood }}>★ РЕКОРДЫ ЭТОЙ ТРЕНИРОВКИ</div>
          <div style={{ marginTop: 4, color: BRUTE.text }}>
            {session.prs.map((l) => liftNameRu(l)).join(' · ')}
          </div>
        </div>
      )}
    </Sheet>
  );
}

function groupByExercise(sets) {
  const byKey = {};
  sets.forEach((s) => {
    byKey[s.exerciseKey] = byKey[s.exerciseKey] || { key: s.exerciseKey, sets: [] };
    byKey[s.exerciseKey].sets.push(s);
  });
  return Object.values(byKey);
}

Object.assign(window, { BruteApp });
