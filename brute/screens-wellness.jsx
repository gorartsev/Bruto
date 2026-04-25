// BRUTE — wellness screens: clean-days counter, mood scale, mood history,
// month calendar with per-day relapse + mood tracking.

const MOOD_FACES = [
  { score: 1, label: 'ХУЁВО' },
  { score: 2, label: 'СО ЗНАКОМ' },
  { score: 3, label: 'НИЧЕГО' },
  { score: 4, label: 'НОРМ' },
  { score: 5, label: 'ОГОНЬ' },
];
const RU_MONTHS = ['ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ','ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ'];
const RU_DOW_SHORT = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];

// SVG mood mark — abstract minimal face. score=1..5 frown→grin.
function MoodMark({ score, size = 34, color = BRUTE.text }) {
  const mouth = (score - 3) / 2;
  const cy = 26 + mouth * -4;
  const sweep = 14;
  const path = mouth >= 0
    ? `M ${50 - sweep} ${cy}  Q 50 ${cy + 12 * mouth + 6}  ${50 + sweep} ${cy}`
    : `M ${50 - sweep} ${cy}  Q 50 ${cy + 12 * mouth - 2}  ${50 + sweep} ${cy}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
      <circle cx="36" cy="14" r="3" fill={color}/>
      <circle cx="64" cy="14" r="3" fill={color}/>
      <path d={path} stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

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

// ─── Month Calendar ─────────────────────────────────────────────────────────
function MonthCalendar({ year, month, cleanSinceISO, relapseDates, moodLog, todayISO, onTapDay }) {
  // Build cells: Mon-first, leading blanks for offset, full month days.
  const firstOfMonth = new Date(year, month, 1);
  const dow = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const offset = dow === 0 ? 6 : dow - 1; // shift so Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push({ blank: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const iso = dateToISO(date);
    const status = dayStatus(iso, cleanSinceISO, todayISO, relapseDates);
    const mood = (moodLog || []).find((m) => m.dateISO === iso);
    cells.push({ d, iso, status, mood });
  }
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push({ blank: true });

  return (
    <div>
      {/* DOW header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {RU_DOW_SHORT.map((d) => (
          <div key={d} className="brute-caption"
            style={{ color: BRUTE.textFaint, fontSize: 9, textAlign: 'center' }}>{d}</div>
        ))}
      </div>
      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((c, i) => {
          if (c.blank) return <div key={i}/>;
          return <CalCell key={i} cell={c} onTap={onTapDay}/>;
        })}
      </div>
    </div>
  );
}

function CalCell({ cell, onTap }) {
  const { d, iso, status, mood } = cell;
  // visual rules
  const isClean = status === 'clean' || status === 'today-clean';
  const isRelapse = status === 'relapse' || status === 'today-relapse';
  const isToday = status === 'today-clean' || status === 'today-relapse';
  const isFuture = status === 'future';
  const isBefore = status === 'before';

  let bg = 'transparent', textColor = BRUTE.text, borderC = BRUTE.border;
  if (isClean) { bg = 'rgba(179,18,26,0.08)'; }
  if (isRelapse) { bg = BRUTE.blood; textColor = BRUTE.surface; borderC = BRUTE.blood; }
  if (isFuture) { textColor = BRUTE.textFaint; borderC = 'transparent'; }
  if (isBefore) { textColor = BRUTE.textFaint; borderC = 'transparent'; }

  const moodDot = mood ? (
    mood.score >= 4 ? BRUTE.blood :
    mood.score === 3 ? BRUTE.textFaint :
    '#7A0C12'
  ) : null;

  return (
    <button onClick={() => !isFuture && onTap(iso)} disabled={isFuture}
      className="brute-press brute-no-select"
      style={{
        aspectRatio: '1', minHeight: 36,
        position: 'relative', cursor: isFuture ? 'default' : 'pointer',
        background: bg, color: textColor,
        border: isToday ? `2px solid ${BRUTE.text}` : `1px solid ${borderC}`,
        borderRadius: 6, padding: 0,
        opacity: isBefore || isFuture ? 0.45 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
      <span className="brute-mono" style={{
        fontSize: 13, fontWeight: 600,
        color: textColor,
      }}>{d}</span>
      {moodDot && (
        <span style={{
          position: 'absolute', bottom: 3, right: 3,
          width: 5, height: 5, borderRadius: 5, background: moodDot,
        }}/>
      )}
    </button>
  );
}

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

// ─── CleanDays screen (the "ДНИ" tab) ───────────────────────────────────────
function CleanDaysScreen() {
  const { state, actions } = useBrute();
  const { profile, moodLog, relapseDates } = state;
  const todayISO = useTodayISO();
  const days = daysClean(profile.cleanSinceISO, todayISO, relapseDates);
  const longest = longestStreak(profile.cleanSinceISO, todayISO, relapseDates);
  const todayMoodEntry = todayMood(moodLog, todayISO);
  const avg7 = moodAverage(moodLog, 7, todayISO);

  const today = new Date();
  const [calCursor, setCalCursor] = React.useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [showStartSheet, setShowStartSheet] = React.useState(false);
  const [pickerISO, setPickerISO] = React.useState(profile.cleanSinceISO || todayISO);
  const [daySheetISO, setDaySheetISO] = React.useState(null);

  const goPrevMonth = () => {
    setCalCursor((c) => {
      const m = c.month - 1;
      return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m };
    });
  };
  const goNextMonth = () => {
    setCalCursor((c) => {
      const m = c.month + 1;
      return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m };
    });
  };

  const totalRelapses = (relapseDates || []).length;

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 20px 110px">
        <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>ДНИ</div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>
          ТРЕЗВОСТЬ · НАСТРОЕНИЕ · КАЛЕНДАРЬ
        </div>

        {/* ── Days clean hero ── */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={22} grit={2}>
            {profile.cleanSinceISO ? (
              <>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>ЧИСТЫХ ДНЕЙ ПОДРЯД</div>
                <div className="brute-mono" style={{
                  fontSize: 88, lineHeight: 0.9, color: BRUTE.text,
                  fontWeight: 700, letterSpacing: '-0.04em', marginTop: 8,
                }}>{days}</div>
                <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 6 }}>
                  СТАРТ {formatShort(profile.cleanSinceISO)} · РЕКОРД {longest} ДН. · СБРОСОВ {totalRelapses}
                </div>
                <div style={{ marginTop: 14 }}>
                  <CleanMilestone days={days}/>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setShowStartSheet(true)} style={lightBtn}>СМЕНИТЬ СТАРТ-ДАТУ</button>
                </div>
              </>
            ) : (
              <>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>СЧЁТЧИК</div>
                <div className="brute-display" style={{
                  fontSize: 36, lineHeight: 0.9, color: BRUTE.text, marginTop: 6, letterSpacing: '-0.02em',
                }}>ВКЛЮЧИ ОТСЧЁТ.</div>
                <div className="brute-body" style={{ color: BRUTE.textMuted, marginTop: 10, fontSize: 14 }}>
                  Поставь дату — день когда стал чистым. Дальше тапай по дням в календаре чтобы отмечать срывы.
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

        {/* ── Calendar ── */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={18} grit={1}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button onClick={goPrevMonth} style={navBtn}>‹</button>
              <div className="brute-display" style={{ color: BRUTE.text, fontSize: 18, letterSpacing: '0.04em' }}>
                {RU_MONTHS[calCursor.month]} {calCursor.year}
              </div>
              <button onClick={goNextMonth} style={navBtn}>›</button>
            </div>

            <MonthCalendar year={calCursor.year} month={calCursor.month}
              cleanSinceISO={profile.cleanSinceISO}
              relapseDates={relapseDates}
              moodLog={moodLog}
              todayISO={todayISO}
              onTapDay={(iso) => { setDaySheetISO(iso); hapticLight(); }}
            />

            <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 14, fontSize: 9, lineHeight: 1.6 }}>
              ТАП ПО ДНЮ = ОТМЕТИТЬ СРЫВ ИЛИ ПОСТАВИТЬ НАСТРОЕНИЕ.<br/>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: 'rgba(179,18,26,0.25)', borderRadius: 2, verticalAlign: 'middle' }}/> ЧИСТЫЙ
              {' · '}<span style={{ display: 'inline-block', width: 8, height: 8, background: BRUTE.blood, borderRadius: 2, verticalAlign: 'middle' }}/> СРЫВ
              {' · '}ПЯТНО — НАСТРОЕНИЕ
            </div>
          </BruteCard>
        </div>

        {/* ── 30-day mood history ── */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={20} grit={1}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>30 ДНЕЙ — НАСТРОЕНИЕ</div>
              {avg7 > 0 && (
                <div className="brute-caption" style={{ color: BRUTE.textFaint }}>
                  СРЕДНЕЕ 7Д · {avg7.toFixed(1)} / 5
                </div>
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <MoodSparkline moodLog={moodLog}/>
            </div>
          </BruteCard>
        </div>
      </ScrollArea>

      {/* ── Start-date sheet ── */}
      <Sheet open={showStartSheet} onClose={() => setShowStartSheet(false)} title="ЧИСТЫЙ С КАКОЙ ДАТЫ?" height="55%">
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>СТАРТ ОТСЧЁТА</div>
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

      {/* ── Day detail sheet ── */}
      {daySheetISO && (
        <DayDetailSheet
          dateISO={daySheetISO}
          state={state}
          actions={actions}
          onClose={() => setDaySheetISO(null)}
        />
      )}
    </PhoneScreen>
  );
}

function DayDetailSheet({ dateISO, state, actions, onClose }) {
  const isRelapse = (state.relapseDates || []).includes(dateISO);
  const moodEntry = (state.moodLog || []).find((m) => m.dateISO === dateISO);
  const d = isoToDate(dateISO);
  const dayLabel = `${d.getDate()} ${RU_MONTHS[d.getMonth()].toLowerCase()}`;
  const dow = WEEKDAY_NAMES_RU[WEEKDAY_KEYS[d.getDay()]];

  return (
    <Sheet open={true} onClose={onClose} title={`${dayLabel.toUpperCase()} · ${dow}`} height="65%">
      <div className="brute-caption" style={{ color: BRUTE.bruise, marginBottom: 8 }}>НАСТРОЕНИЕ ДНЯ</div>
      <MoodScale value={moodEntry?.score} onPick={(s) => {
        // log for THIS day, not today
        actions.logMoodFor(dateISO, s);
        hapticMedium();
      }}/>

      <div style={{ height: 14 }}/>

      <div className="brute-caption" style={{ color: BRUTE.bruise, marginBottom: 8 }}>ТРЕЗВОСТЬ</div>
      <button onClick={() => { actions.toggleRelapse(dateISO); hapticHeavy(); }}
        style={{
          width: '100%', padding: 14, borderRadius: 10, cursor: 'pointer',
          background: isRelapse ? 'transparent' : BRUTE.blood,
          border: `2px solid ${BRUTE.blood}`,
          color: isRelapse ? BRUTE.blood : BRUTE.surface,
          fontFamily: "'Bebas Neue', Impact", fontSize: 20, letterSpacing: '0.04em',
        }}>
        {isRelapse ? '✓ ОТМЕЧЕН СРЫВ — УБРАТЬ' : 'ОТМЕТИТЬ СРЫВ'}
      </button>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 10 }}>
        {isRelapse
          ? 'Этот день засчитан как срыв. Стрик считается от ближайшего срыва вниз.'
          : 'День считается чистым. Тапни если был срыв — стрик пересчитается автоматом.'}
      </div>

      <div style={{ marginTop: 24 }}>
        <button onClick={onClose} style={{
          width: '100%', padding: 12, background: 'transparent',
          border: `1px solid ${BRUTE.border}`, borderRadius: 10,
          color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 18, cursor: 'pointer',
        }}>ГОТОВО</button>
      </div>
    </Sheet>
  );
}

const lightBtn = {
  width: '100%', padding: '12px', background: BRUTE.surface,
  border: `1px solid ${BRUTE.border}`, borderRadius: 8,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 14, cursor: 'pointer',
  letterSpacing: '0.04em',
};
const navBtn = {
  width: 36, height: 36, borderRadius: 10,
  background: 'transparent', border: `1px solid ${BRUTE.border}`,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 22, cursor: 'pointer',
  lineHeight: 1, padding: 0,
};

Object.assign(window, { CleanDaysScreen, MoodScale, MoodMark, MoodSparkline, MonthCalendar, DayDetailSheet });
