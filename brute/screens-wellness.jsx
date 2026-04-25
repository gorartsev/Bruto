// BRUTE — wellness screens: clean-days counter, mood scale, mood history.
// Tab "ДНИ" — sobriety + daily mood tracking.

const MOOD_FACES = [
  { score: 1, label: 'ХУЁВО',     emoji: '⚫' },
  { score: 2, label: 'СО ЗНАКОМ', emoji: '⬛' },
  { score: 3, label: 'НИЧЕГО',    emoji: '◼' },
  { score: 4, label: 'НОРМ',      emoji: '◾' },
  { score: 5, label: 'ОГОНЬ',     emoji: '▪' },
];

// SVG mood mark — abstract minimal face. score=1..5 rotates frown→grin.
function MoodMark({ score, size = 34, color = BRUTE.text }) {
  // mouth control: -1=frown, 0=flat, 1=grin
  const mouth = (score - 3) / 2; // -1..+1
  const cy = 26 + mouth * -4;
  const sweep = 14;
  const path = mouth >= 0
    ? `M ${50 - sweep} ${cy}  Q 50 ${cy + 12 * mouth + 6}  ${50 + sweep} ${cy}`
    : `M ${50 - sweep} ${cy}  Q 50 ${cy + 12 * mouth - 2}  ${50 + sweep} ${cy}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
      {/* eyes — two thick dots */}
      <circle cx="36" cy="14" r="3" fill={color}/>
      <circle cx="64" cy="14" r="3" fill={color}/>
      {/* mouth */}
      <path d={path} stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ─── Mood scale row (5 buttons, today's value highlighted in red) ──────────
function MoodScale({ value, onPick, size = 56 }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
      {MOOD_FACES.map((m) => {
        const active = value === m.score;
        return (
          <button key={m.score} onClick={() => { onPick(m.score); hapticMedium(); }}
            className="brute-press brute-no-select"
            style={{
              flex: 1, height: size, borderRadius: 12, cursor: 'pointer',
              background: active ? BRUTE.blood : BRUTE.surface,
              border: active ? `2px solid ${BRUTE.blood}` : `1px solid ${BRUTE.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 6,
            }}>
            <MoodMark score={m.score} size={size - 18} color={active ? BRUTE.surface : BRUTE.text}/>
          </button>
        );
      })}
    </div>
  );
}

// ─── Mood history sparkline (last 30 days) ─────────────────────────────────
function MoodSparkline({ moodLog, days = 30 }) {
  if (!moodLog || moodLog.length === 0) {
    return <div style={{ color: BRUTE.textFaint, fontSize: 13 }}>Накопим записи — появится график.</div>;
  }
  const today = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const iso = dateToISO(d);
    const m = moodLog.find((x) => x.dateISO === iso);
    cells.push({ iso, score: m ? m.score : null });
  }
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 60 }}>
      {cells.map((c, i) => {
        const h = c.score ? c.score * 10 : 4;
        const color = c.score == null ? BRUTE.surfaceAlt
                    : c.score <= 2  ? '#7A0C12'
                    : c.score === 3 ? BRUTE.textFaint
                    : c.score === 4 ? '#3E5A2C'
                    :                 BRUTE.blood;
        return (
          <div key={i} style={{
            flex: 1, height: h, background: color, borderRadius: 1.5,
            opacity: c.score == null ? 0.5 : 1,
          }}/>
        );
      })}
    </div>
  );
}

// ─── CleanDays screen (the "ДНИ" tab) ───────────────────────────────────────
function CleanDaysScreen() {
  const { state, actions } = useBrute();
  const { profile, moodLog, cleanRelapses } = state;
  const todayISO = useTodayISO();
  const days = daysClean(profile.cleanSinceISO, todayISO);
  const todayMoodEntry = todayMood(moodLog, todayISO);
  const avg7 = moodAverage(moodLog, 7, todayISO);

  const [showResetSheet, setShowResetSheet] = React.useState(false);
  const [showStartSheet, setShowStartSheet] = React.useState(false);
  const [pickerISO, setPickerISO] = React.useState(profile.cleanSinceISO || todayISO);

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 20px 110px">
        <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>ДНИ</div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>
          ТРЕЗВОСТЬ · НАСТРОЕНИЕ · ЕЖЕДНЕВНО
        </div>

        {/* ── Days clean hero card ── */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={24} grit={2}>
            {profile.cleanSinceISO ? (
              <>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>ЧИСТЫХ ДНЕЙ</div>
                <div className="brute-mono" style={{
                  fontSize: 96, lineHeight: 0.9, color: BRUTE.text,
                  fontWeight: 700, letterSpacing: '-0.04em', marginTop: 8,
                }}>{days}</div>
                <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 6 }}>
                  С {formatShort(profile.cleanSinceISO)}
                </div>

                {/* milestone */}
                <div style={{ marginTop: 14 }}>
                  <CleanMilestone days={days}/>
                </div>

                {/* actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                  <button onClick={() => setShowStartSheet(true)} style={lightBtn}>СМЕНИТЬ ДАТУ</button>
                  <button onClick={() => setShowResetSheet(true)} style={dangerBtn}>СБРОСИТЬ</button>
                </div>
              </>
            ) : (
              <>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>СЧЁТЧИК</div>
                <div className="brute-display" style={{
                  fontSize: 36, lineHeight: 0.9, color: BRUTE.text, marginTop: 6, letterSpacing: '-0.02em',
                }}>ВКЛЮЧИ ОТСЧЁТ.</div>
                <div className="brute-body" style={{ color: BRUTE.textMuted, marginTop: 10, fontSize: 14 }}>
                  Поставь дату — день когда был чистый последний раз. Считать буду я.
                </div>
                <div style={{ marginTop: 16 }}>
                  <BrushButton onClick={() => setShowStartSheet(true)} variant="slab" color={BRUTE.blood} fontSize={22}>
                    ВКЛЮЧИТЬ
                  </BrushButton>
                </div>
              </>
            )}
          </BruteCard>
        </div>

        {/* ── Today mood ── */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={20} grit={1}>
            <div className="brute-caption" style={{ color: BRUTE.bruise }}>СЕГОДНЯ ПО ОЩУЩЕНИЯМ</div>
            <div style={{ marginTop: 12 }}>
              <MoodScale value={todayMoodEntry?.score} onPick={(s) => actions.logMood(s)}/>
            </div>
            {todayMoodEntry && (
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 10, textAlign: 'center' }}>
                {MOOD_FACES.find((m) => m.score === todayMoodEntry.score)?.label}
              </div>
            )}
          </BruteCard>
        </div>

        {/* ── 30-day mood history ── */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={20} grit={1}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>30 ДНЕЙ</div>
              {avg7 > 0 && (
                <div className="brute-caption" style={{ color: BRUTE.textFaint }}>
                  СРЕДНЕЕ 7Д · {avg7.toFixed(1)} / 5
                </div>
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <MoodSparkline moodLog={moodLog}/>
            </div>
            {(moodLog || []).length > 0 && (
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 8, fontSize: 9 }}>
                {(moodLog || []).length} ОТМЕТОК · НИЖЕ ЛУЧШЕ ВЫШЕ
              </div>
            )}
          </BruteCard>
        </div>

        {/* ── Relapse history ── */}
        {cleanRelapses && cleanRelapses.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <BruteCard tone="bone" padding={20} grit={1}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>СБРОСЫ</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cleanRelapses.slice().reverse().map((r, i) => {
                  const between = r.prevSinceISO ? daysBetween(r.prevSinceISO, r.dateISO) : 0;
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: BRUTE.textMuted, fontSize: 13 }}>{formatShort(r.dateISO)}</span>
                      <span className="brute-mono" style={{ color: BRUTE.text, fontSize: 13 }}>
                        {between > 0 ? `${between} дн.` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </BruteCard>
          </div>
        )}
      </ScrollArea>

      {/* sheet: pick start date */}
      <Sheet open={showStartSheet} onClose={() => setShowStartSheet(false)} title="ЧИСТЫЙ С КАКОЙ ДАТЫ?" height="55%">
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>ДАТА</div>
        <input type="date" value={pickerISO} onChange={(e) => setPickerISO(e.target.value)}
          style={{
            width: '100%', padding: '14px',
            background: BRUTE.surface, border: `1px solid ${BRUTE.border}`,
            fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 24,
            color: BRUTE.text, borderRadius: 8, boxSizing: 'border-box',
          }}/>
        <div style={{ marginTop: 18 }}>
          <BrushButton onClick={() => { actions.setCleanSince(pickerISO); setShowStartSheet(false); hapticMedium(); }}
            variant="slab" color={BRUTE.blood} fontSize={22}>
            СОХРАНИТЬ
          </BrushButton>
        </div>
        {profile.cleanSinceISO && (
          <button onClick={() => { actions.setCleanSince(null); setShowStartSheet(false); }}
            style={{
              width: '100%', marginTop: 10, padding: 12, background: 'transparent',
              border: `1px solid ${BRUTE.border}`, borderRadius: 10,
              color: BRUTE.textFaint, fontFamily: "'Bebas Neue', Impact", fontSize: 16, cursor: 'pointer',
            }}>ОТКЛЮЧИТЬ ОТСЧЁТ</button>
        )}
      </Sheet>

      {/* sheet: relapse confirmation */}
      <Sheet open={showResetSheet} onClose={() => setShowResetSheet(false)} title="СБРОСИТЬ?" height="50%">
        <div style={{ color: BRUTE.textMuted, marginBottom: 16 }}>
          Сегодняшний день станет новым "днём 0". Прошлый счётчик ({days} дн.) уйдёт в историю сбросов.
        </div>
        <BrushButton onClick={() => { actions.relapse(); setShowResetSheet(false); hapticHeavy(); }}
          variant="slab" color={BRUTE.blood} fontSize={20}>
          ДА, ОБНУЛИТЬ
        </BrushButton>
        <button onClick={() => setShowResetSheet(false)} style={{
          width: '100%', marginTop: 10, padding: 14, background: 'transparent',
          border: `1px solid ${BRUTE.border}`, borderRadius: 10,
          color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 18, cursor: 'pointer',
        }}>ОТМЕНА</button>
      </Sheet>
    </PhoneScreen>
  );
}

const lightBtn = {
  flex: 1, padding: '12px', background: BRUTE.surface,
  border: `1px solid ${BRUTE.border}`, borderRadius: 8,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 14, cursor: 'pointer',
  letterSpacing: '0.04em',
};
const dangerBtn = {
  flex: 1, padding: '12px', background: 'transparent',
  border: `1px solid ${BRUTE.blood}`, borderRadius: 8,
  color: BRUTE.blood, fontFamily: "'Bebas Neue', Impact", fontSize: 14, cursor: 'pointer',
  letterSpacing: '0.04em',
};

// Show the next milestone the user is heading toward.
function CleanMilestone({ days }) {
  const MILES = [1, 7, 14, 30, 60, 90, 180, 365, 730, 1000];
  const next = MILES.find((m) => m > days) || (days + 1);
  const prev = [...MILES].reverse().find((m) => m <= days) || 0;
  const span = next - prev;
  const pct = Math.min(100, Math.round(((days - prev) / span) * 100));
  return (
    <div>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 10 }}>
        ДО {next} ДНЕЙ — {next - days} ДН.
      </div>
      <div style={{ marginTop: 6, height: 8, background: BRUTE.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: BRUTE.blood, transition: 'width 400ms' }}/>
      </div>
    </div>
  );
}

Object.assign(window, { CleanDaysScreen, MoodScale, MoodMark, MoodSparkline });
