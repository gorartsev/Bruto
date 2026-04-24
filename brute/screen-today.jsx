// BRUTE — TODAY screen
// Week 3 · Day 2 · Tuesday · Bench Day

function TodayScreen({ onStartSession, grit = 2, accent = BRUTE.blood, lang = 'en' }) {
  const S = STRINGS[lang] || STRINGS.en;
  return (
    <div style={{
      minHeight: '100%', background: BRUTE.ink, color: BRUTE.paper,
      paddingBottom: 100, position: 'relative',
    }}>
      {/* halftone over the whole screen */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: halftoneBg('#fff', grit === 3 ? 2 : 1),
        opacity: 0.25,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, padding: '60px 20px 0' }}>
        {/* header strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="brute-display" style={{ fontSize: 28, color: BRUTE.paper, letterSpacing: '0.04em' }}>{S.appName}</span>
            <span style={{ width: 6, height: 6, background: accent, borderRadius: '50%' }}/>
          </div>
          <StreakBadge count={11}/>
        </div>
        <div className="brute-caption" style={{ color: BRUTE.ash, marginTop: 2 }}>
          {S.weekDay}
        </div>

        {/* main Today card */}
        <div style={{ marginTop: 20 }}>
          <BruteCard tone="bone" grit={grit}>
            {/* corner flash motif */}
            <div style={{ position: 'absolute', top: -6, right: -6, opacity: 0.08, zIndex: 0 }}>
              <FlashBarbell size={120} color={BRUTE.ink}/>
            </div>

            <div style={{ position: 'relative' }}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>{S.phaseLabel}</div>
              <div className="brute-display" style={{
                fontSize: lang === 'ru' ? 46 : 54, lineHeight: 0.9, marginTop: 6,
                color: BRUTE.ink, letterSpacing: '-0.02em',
              }}>{S.heavyBench[0]}<br/>{S.heavyBench[1]}</div>
              <div className="brute-display" style={{
                fontSize: 20, color: BRUTE.bruise, marginTop: 8, letterSpacing: '0.02em',
              }}>{S.subtheme}</div>

              <div style={{ height: 12, margin: '16px 0' }}>
                <Brush variant="rule" color={BRUTE.ink} style={{ width: '100%', height: '100%', opacity: 0.8 }}/>
              </div>

              {/* exercise preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {S.todayRows.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="brute-display" style={{ fontSize: 20, color: BRUTE.ink, letterSpacing: '0.02em' }}>{ex.name}</span>
                    <span className="brute-mono" style={{ fontSize: 16, color: BRUTE.smoke, fontWeight: 500 }}>{ex.scheme}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22 }}>
                <BrushButton variant="slab" color={accent} onClick={onStartSession} height={64} fontSize={lang === 'ru' ? 34 : 30}>
                  {S.startSession}
                </BrushButton>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <span className="brute-caption" style={{ color: BRUTE.ash }}>{S.estTime}</span>
                <span className="brute-caption" style={{ color: BRUTE.ash }}>{S.restRange}</span>
              </div>
            </div>
          </BruteCard>
        </div>

        {/* Quick stats strip */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, overflowX: 'auto', padding: '0 0 4px' }}>
          {[
            { key: 'SQUAT',    val: CURRENT_1RM.squat, trend: '↑' },
            { key: 'BENCH',    val: CURRENT_1RM.bench, trend: '↑' },
            { key: 'DEADLIFT', val: CURRENT_1RM.deadlift, trend: '→' },
          ].map((s) => (
            <div key={s.key} style={{
              flex: 1, minWidth: 100,
              background: BRUTE.smoke, padding: '10px 12px',
              borderRadius: 14, border: `1px solid #333`,
            }}>
              <div className="brute-caption" style={{ color: BRUTE.ash, fontSize: 9 }}>{S.est1RM} · {S.lifts[s.key]}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <span className="brute-mono" style={{ color: BRUTE.paper, fontSize: 22, fontWeight: 700 }}>{s.val}</span>
                <span className="brute-caption" style={{ color: BRUTE.ash, fontSize: 9 }}>{S.kg}</span>
                <span style={{ marginLeft: 'auto', color: s.trend === '↑' ? accent : BRUTE.ash, fontSize: 14, fontWeight: 700 }}>{s.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Last session recap */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" grit={grit - 1} padding={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="brute-caption" style={{ color: BRUTE.bruise }}>{S.yesterday} · {S.yesterdayDate}</span>
              <span className="brute-display" style={{ fontSize: 18, color: BRUTE.ink, letterSpacing: '0.02em' }}>{S.heavySquat}</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {S.topSets.map((t, i) => (
                <div key={i} style={{
                  position: 'relative',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: t.pr ? '4px 8px' : '4px 0',
                }}>
                  {t.pr && (
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.22 }}>
                      <Brush variant="dash" color={accent} style={{ width: '100%', height: '100%' }}/>
                    </div>
                  )}
                  <span className="brute-display" style={{ position: 'relative', fontSize: 16, color: BRUTE.ink, letterSpacing: '0.02em' }}>
                    {t.lift} {t.pr && <span style={{ color: accent, marginLeft: 6, fontSize: 12 }}>★ {S.pr}</span>}
                  </span>
                  <span className="brute-mono" style={{ position: 'relative', fontSize: 14, fontWeight: 500, color: BRUTE.smoke }}>{t.value}</span>
                </div>
              ))}
            </div>
          </BruteCard>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TodayScreen });
