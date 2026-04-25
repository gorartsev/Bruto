// BRUTE — wellness: clean tracker, mood, calendar, urge button, reasons,
// money-saved, letters to self, tombstone gallery, photo journal.

const MOOD_FACES = [
  { score: 1, label: 'ХУЁВО' },
  { score: 2, label: 'СО ЗНАКОМ' },
  { score: 3, label: 'НИЧЕГО' },
  { score: 4, label: 'НОРМ' },
  { score: 5, label: 'ОГОНЬ' },
];
const RU_MONTHS = ['ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ','ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ'];
const RU_DOW_SHORT = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];

// ─── Mood mark + scale ──────────────────────────────────────────────────────
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
  const firstOfMonth = new Date(year, month, 1);
  const dow = firstOfMonth.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
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
  while (cells.length % 7 !== 0) cells.push({ blank: true });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {RU_DOW_SHORT.map((d) => (
          <div key={d} className="brute-caption"
            style={{ color: BRUTE.textFaint, fontSize: 9, textAlign: 'center' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((c, i) => c.blank ? <div key={i}/> : <CalCell key={i} cell={c} onTap={onTapDay}/>)}
      </div>
    </div>
  );
}

function CalCell({ cell, onTap }) {
  const { d, iso, status, mood } = cell;
  const isClean = status === 'clean' || status === 'today-clean';
  const isRelapse = status === 'relapse' || status === 'today-relapse';
  const isToday = status === 'today-clean' || status === 'today-relapse';
  const isFuture = status === 'future';
  const isBefore = status === 'before';

  let bg = 'transparent', textColor = BRUTE.text, borderC = BRUTE.border;
  if (isClean) bg = 'rgba(179,18,26,0.08)';
  if (isRelapse) { bg = BRUTE.blood; textColor = BRUTE.surface; borderC = BRUTE.blood; }
  if (isFuture || isBefore) { textColor = BRUTE.textFaint; borderC = 'transparent'; }

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
      }}>
      <span className="brute-mono" style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{d}</span>
      {moodDot && (
        <span style={{
          position: 'absolute', bottom: 3, right: 3,
          width: 5, height: 5, borderRadius: 5, background: moodDot,
        }}/>
      )}
    </button>
  );
}

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

// ─── CleanDays main screen ──────────────────────────────────────────────────
function CleanDaysScreen() {
  const { state, actions } = useBrute();
  const { profile, moodLog, relapseDates, urgeLog, letters, photoJournal } = state;
  const todayISO = useTodayISO();
  const days = daysClean(profile.cleanSinceISO, todayISO, relapseDates);
  const longest = longestStreak(profile.cleanSinceISO, todayISO, relapseDates);
  const todayMoodEntry = todayMood(moodLog, todayISO);
  const avg7 = moodAverage(moodLog, 7, todayISO);
  const saved = moneySaved(profile, todayISO, relapseDates);
  const earned = tombstonesEarned(days);
  const unlocked = unlockedLetters(letters, days);

  const today = new Date();
  const [calCursor, setCalCursor] = React.useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [showStartSheet, setShowStartSheet] = React.useState(false);
  const [pickerISO, setPickerISO] = React.useState(profile.cleanSinceISO || todayISO);
  const [daySheetISO, setDaySheetISO] = React.useState(null);
  const [showRelapseConfirm, setShowRelapseConfirm] = React.useState(false);
  const [showReasonsSheet, setShowReasonsSheet] = React.useState(false);
  const [showCostSheet, setShowCostSheet] = React.useState(false);
  const [showUrgeSheet, setShowUrgeSheet] = React.useState(false);
  const [showLetterWriter, setShowLetterWriter] = React.useState(false);
  const [openingLetter, setOpeningLetter] = React.useState(null);
  const [showPhotoSheet, setShowPhotoSheet] = React.useState(false);
  const [showTombstoneSheet, setShowTombstoneSheet] = React.useState(null);

  const goPrevMonth = () => setCalCursor((c) => c.month - 1 < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
  const goNextMonth = () => setCalCursor((c) => c.month + 1 > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });

  const totalRelapses = (relapseDates || []).length;
  const todayUrges = (urgeLog || []).filter((u) => u.dateISO === todayISO).length;

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 20px 110px">
        {/* HEADER */}
        <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>ДНИ</div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>
          ТРЕЗВОСТЬ · НАСТРОЕНИЕ · КАЛЕНДАРЬ
        </div>

        {/* HERO COUNTER */}
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
                <div style={{ marginTop: 14 }}><CleanMilestone days={days}/></div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowStartSheet(true)} style={lightBtn}>СТАРТ-ДАТА</button>
                  <button onClick={() => setShowCostSheet(true)} style={lightBtn}>СТОИМ. ДНЯ</button>
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

        {/* MONEY SAVED — only if dailyCostRub set */}
        {profile.cleanSinceISO && profile.dailyCostRub > 0 && (
          <div style={{ marginTop: 12 }}>
            <BruteCard tone="bone" padding={18} grit={1}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>ДЕНЕГ НЕ СПУЩЕНО</div>
              <div className="brute-mono" style={{
                fontSize: 36, color: BRUTE.text, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em',
              }}>
                {saved.toLocaleString('ru-RU')}<span style={{ color: BRUTE.textFaint, fontSize: 16, marginLeft: 6 }}>₽</span>
              </div>
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 4 }}>
                {days} ДН × {profile.dailyCostRub} ₽ В ДЕНЬ
              </div>
            </BruteCard>
          </div>
        )}

        {/* URGE BUTTON — prominent red CTA */}
        {profile.cleanSinceISO && (
          <div style={{ marginTop: 16 }}>
            <BrushButton onClick={() => { setShowUrgeSheet(true); hapticHeavy(); }}
              variant="slab" color={BRUTE.blood} fontSize={26} height={64}>
              ПОТЯНУЛО? ЖМИ
            </BrushButton>
            {todayUrges > 0 && (
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 6, textAlign: 'center' }}>
                СЕГОДНЯ ЖАЛ {todayUrges} {todayUrges === 1 ? 'РАЗ' : 'РАЗА'} · ВЫСТОЯЛ
              </div>
            )}
          </div>
        )}

        {/* REASONS */}
        {profile.cleanSinceISO && (
          <div style={{ marginTop: 16 }}>
            <BruteCard tone="bone" padding={18} grit={1}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>ЗАЧЕМ Я ЧИСТЫЙ</div>
                <button onClick={() => setShowReasonsSheet(true)} style={editLink}>
                  {(profile.cleanReasons || []).length === 0 ? 'ДОБАВИТЬ' : 'РЕДАКТ.'}
                </button>
              </div>
              {(profile.cleanReasons || []).length === 0 ? (
                <div className="brute-body" style={{ color: BRUTE.textFaint, marginTop: 8, fontSize: 13 }}>
                  Запиши 3-7 причин. Когда захочешь сорваться — увидишь свои слова.
                </div>
              ) : (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {profile.cleanReasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span className="brute-mono" style={{ color: BRUTE.blood, minWidth: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ color: BRUTE.text, fontSize: 14, lineHeight: 1.4 }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </BruteCard>
          </div>
        )}

        {/* TODAY MOOD */}
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

        {/* CALENDAR */}
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
              ТАП ПО ДНЮ = ОТМЕТИТЬ СРЫВ ИЛИ ПОСТАВИТЬ НАСТРОЕНИЕ.
            </div>
          </BruteCard>
        </div>

        {/* LETTERS */}
        {profile.cleanSinceISO && (
          <div style={{ marginTop: 16 }}>
            <BruteCard tone="bone" padding={18} grit={1}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>ПИСЬМА СЕБЕ</div>
                <button onClick={() => setShowLetterWriter(true)} style={editLink}>НАПИСАТЬ</button>
              </div>
              {unlocked.length > 0 && (
                <div style={{ marginTop: 10, padding: 12, background: BRUTE.blood, borderRadius: 8 }}>
                  <div className="brute-caption" style={{ color: BRUTE.surface }}>★ ЖДЁТ ВСКРЫТИЯ</div>
                  {unlocked.map((l) => (
                    <button key={l.id} onClick={() => setOpeningLetter(l)}
                      style={{
                        marginTop: 6, width: '100%', padding: '10px 12px',
                        background: BRUTE.surface, border: 0, borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                      }}>
                      <span className="brute-display" style={{ color: BRUTE.text, fontSize: 16 }}>
                        ПИСЬМО · {l.openOnDay} ДЕНЬ
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {(letters || []).length === 0 && (
                <div className="brute-body" style={{ color: BRUTE.textFaint, marginTop: 8, fontSize: 13 }}>
                  Напиши себе письмо. Оно запечатается до 30/90/365 дня. Откроешь — прочитаешь свой голос из прошлого.
                </div>
              )}
              {(letters || []).filter((l) => !unlocked.includes(l)).length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(letters || []).filter((l) => !unlocked.includes(l)).map((l) => (
                    <div key={l.id} style={{
                      padding: '8px 12px', background: BRUTE.surface, borderRadius: 6,
                      display: 'flex', justifyContent: 'space-between',
                      border: l.opened ? `1px solid ${BRUTE.border}` : `1px dashed ${BRUTE.border}`,
                      opacity: l.opened ? 0.6 : 1,
                    }}>
                      <span className="brute-caption" style={{ color: BRUTE.textFaint }}>
                        {l.opened ? '✓ ПРОЧИТАНО' : `🔒 ДО ${l.openOnDay} ДНЯ`}
                      </span>
                      <span className="brute-mono" style={{ color: BRUTE.textFaint, fontSize: 11 }}>
                        {formatShort(l.writtenAtISO)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </BruteCard>
          </div>
        )}

        {/* TOMBSTONE GALLERY */}
        {profile.cleanSinceISO && (
          <div style={{ marginTop: 16 }}>
            <BruteCard tone="bone" padding={18} grit={1}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>КЛАДБИЩЕ СТАРОГО ТЕБЯ</div>
              <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 4, fontSize: 9 }}>
                {earned.length} / {TOMBSTONE_MILESTONES.length} ВЕХ ЗАКРЫТО
              </div>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {TOMBSTONE_MILESTONES.map((m) => {
                  const isEarned = earned.includes(m);
                  return (
                    <button key={m} disabled={!isEarned} onClick={() => isEarned && setShowTombstoneSheet(m)}
                      style={{
                        aspectRatio: '1', border: 0, padding: 6,
                        background: isEarned ? BRUTE.surface : 'transparent',
                        border: isEarned ? `1px solid ${BRUTE.border}` : `1px dashed ${BRUTE.border}`,
                        borderRadius: 8, cursor: isEarned ? 'pointer' : 'default',
                        opacity: isEarned ? 1 : 0.35,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <FlashMiniTombstone size={56} color={BRUTE.text} days={m}/>
                    </button>
                  );
                })}
              </div>
            </BruteCard>
          </div>
        )}

        {/* PHOTO JOURNAL */}
        {profile.cleanSinceISO && (
          <div style={{ marginTop: 16 }}>
            <BruteCard tone="bone" padding={18} grit={1}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="brute-caption" style={{ color: BRUTE.bruise }}>ФОТО-ЖУРНАЛ</div>
                <button onClick={() => setShowPhotoSheet(true)} style={editLink}>СНЯТЬ</button>
              </div>
              {(photoJournal || []).length === 0 ? (
                <div className="brute-body" style={{ color: BRUTE.textFaint, marginTop: 8, fontSize: 13 }}>
                  Раз в неделю селфи без фильтра. Через 12 недель скроллишь — видишь как ты изменился.
                </div>
              ) : (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {(photoJournal || []).slice().reverse().slice(0, 12).map((p) => (
                    <div key={p.id} style={{
                      aspectRatio: '1', borderRadius: 6, overflow: 'hidden',
                      backgroundImage: `url(${p.dataUrl})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      border: `1px solid ${BRUTE.border}`,
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        color: '#fff', padding: '6px 4px 3px', fontSize: 8, textAlign: 'center',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>{p.dateISO.slice(5)}</div>
                    </div>
                  ))}
                </div>
              )}
            </BruteCard>
          </div>
        )}

        {/* 30-DAY MOOD */}
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
            <div style={{ marginTop: 10 }}><MoodSparkline moodLog={moodLog}/></div>
          </BruteCard>
        </div>
      </ScrollArea>

      {/* ── Sheets ── */}
      <Sheet open={showStartSheet} onClose={() => setShowStartSheet(false)} title="ЧИСТЫЙ С КАКОЙ ДАТЫ?" height="55%">
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>СТАРТ ОТСЧЁТА</div>
        <input type="date" value={pickerISO} onChange={(e) => setPickerISO(e.target.value)} style={dateInput}/>
        <div style={{ marginTop: 18 }}>
          <BrushButton onClick={() => { actions.setCleanSince(pickerISO); setShowStartSheet(false); hapticMedium(); }}
            variant="slab" color={BRUTE.blood} fontSize={22}>СОХРАНИТЬ</BrushButton>
        </div>
        {profile.cleanSinceISO && (
          <button onClick={() => { actions.setCleanSince(null); setShowStartSheet(false); }} style={ghostBtn}>
            ОТКЛЮЧИТЬ ОТСЧЁТ
          </button>
        )}
      </Sheet>

      <CostSheet open={showCostSheet} onClose={() => setShowCostSheet(false)} value={profile.dailyCostRub} onSave={(v) => actions.setDailyCost(v)}/>
      <ReasonsEditorSheet open={showReasonsSheet} onClose={() => setShowReasonsSheet(false)} reasons={profile.cleanReasons || []} onSave={(arr) => actions.setCleanReasons(arr)}/>
      <UrgeSheet open={showUrgeSheet} onClose={() => setShowUrgeSheet(false)} reasons={profile.cleanReasons || []} actions={actions}/>
      <LetterWriterSheet open={showLetterWriter} onClose={() => setShowLetterWriter(false)} actions={actions} currentDays={days}/>
      {openingLetter && <LetterRevealSheet letter={openingLetter} onClose={() => setOpeningLetter(null)} actions={actions}/>}
      <PhotoSheet open={showPhotoSheet} onClose={() => setShowPhotoSheet(false)} actions={actions} existing={photoJournal || []}/>
      {showTombstoneSheet != null && <TombstoneSheet days={showTombstoneSheet} earnedDate={profile.cleanSinceISO} onClose={() => setShowTombstoneSheet(null)}/>}

      {daySheetISO && (
        <DayDetailSheet
          dateISO={daySheetISO}
          state={state}
          actions={actions}
          onConfirmRelapse={() => setShowRelapseConfirm(true)}
          onClose={() => setDaySheetISO(null)}
        />
      )}
      {showRelapseConfirm && daySheetISO && (
        <RelapseConfirmSheet
          dateISO={daySheetISO}
          reasons={profile.cleanReasons || []}
          onCancel={() => setShowRelapseConfirm(false)}
          onConfirm={() => {
            actions.toggleRelapse(daySheetISO);
            hapticHeavy();
            setShowRelapseConfirm(false);
            setDaySheetISO(null);
          }}
        />
      )}
    </PhoneScreen>
  );
}

// ─── Day detail sheet ──────────────────────────────────────────────────────
function DayDetailSheet({ dateISO, state, actions, onClose, onConfirmRelapse }) {
  const isRelapse = (state.relapseDates || []).includes(dateISO);
  const moodEntry = (state.moodLog || []).find((m) => m.dateISO === dateISO);
  const d = isoToDate(dateISO);
  const dayLabel = `${d.getDate()} ${RU_MONTHS[d.getMonth()].toLowerCase()}`;
  const dow = WEEKDAY_NAMES_RU[WEEKDAY_KEYS[d.getDay()]];

  const handleRelapseTap = () => {
    if (isRelapse) {
      // un-marking is harmless, do directly
      actions.toggleRelapse(dateISO);
      hapticLight();
    } else {
      // marking adds a relapse — confirm first
      onConfirmRelapse();
    }
  };

  return (
    <Sheet open={true} onClose={onClose} title={`${dayLabel.toUpperCase()} · ${dow}`} height="65%">
      <div className="brute-caption" style={{ color: BRUTE.bruise, marginBottom: 8 }}>НАСТРОЕНИЕ ДНЯ</div>
      <MoodScale value={moodEntry?.score} onPick={(s) => { actions.logMoodFor(dateISO, s); hapticMedium(); }}/>

      <div style={{ height: 14 }}/>

      <div className="brute-caption" style={{ color: BRUTE.bruise, marginBottom: 8 }}>ТРЕЗВОСТЬ</div>
      <button onClick={handleRelapseTap}
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
          : 'Тапни если был срыв. Я переспрошу — увидишь свои причины.'}
      </div>

      <div style={{ marginTop: 24 }}>
        <button onClick={onClose} style={greyBtn}>ГОТОВО</button>
      </div>
    </Sheet>
  );
}

// ─── Relapse confirm sheet — surfaces user's own reasons ────────────────────
function RelapseConfirmSheet({ dateISO, reasons, onCancel, onConfirm }) {
  const [waited, setWaited] = React.useState(false);
  React.useEffect(() => {
    const id = setTimeout(() => setWaited(true), 4000);
    return () => clearTimeout(id);
  }, []);

  return (
    <Sheet open={true} onClose={onCancel} title="ПРОЧИТАЙ ПЕРЕД ТЕМ КАК НАЖАТЬ" height="80%">
      <div className="brute-display" style={{ color: BRUTE.text, fontSize: 30, letterSpacing: '-0.01em', lineHeight: 1, marginBottom: 12 }}>
        ЗАЧЕМ ТЫ БЫЛ ЧИСТЫМ
      </div>

      {reasons.length === 0 ? (
        <div className="brute-body" style={{ color: BRUTE.textMuted, fontSize: 14, marginBottom: 16 }}>
          Ты ещё не записал причины. Может стоит вернуться и записать — а потом решать?
        </div>
      ) : (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reasons.map((r, i) => (
            <div key={i} style={{
              padding: 14, background: BRUTE.surface,
              borderLeft: `4px solid ${BRUTE.blood}`, borderRadius: 4,
            }}>
              <span className="brute-mono" style={{ color: BRUTE.blood, marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ color: BRUTE.text, fontSize: 16, lineHeight: 1.4 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>
        {waited ? 'СЕЙЧАС МОЖНО.' : 'КНОПКА ОТКРОЕТСЯ ЧЕРЕЗ 4 СЕК.'}
      </div>
      <button onClick={onConfirm} disabled={!waited}
        style={{
          width: '100%', padding: 14, borderRadius: 10,
          background: waited ? BRUTE.blood : BRUTE.surfaceAlt,
          border: 0, color: waited ? BRUTE.surface : BRUTE.textFaint,
          fontFamily: "'Bebas Neue', Impact", fontSize: 20, letterSpacing: '0.04em',
          cursor: waited ? 'pointer' : 'not-allowed',
          opacity: waited ? 1 : 0.7,
        }}>
        ВСЁ РАВНО ОТМЕТИТЬ СРЫВ
      </button>
      <button onClick={onCancel} style={{ ...greyBtn, marginTop: 10 }}>ОТМЕНА — Я СПРАВЛЮСЬ</button>
    </Sheet>
  );
}

// ─── Reasons editor sheet ───────────────────────────────────────────────────
function ReasonsEditorSheet({ open, onClose, reasons, onSave }) {
  const [draft, setDraft] = React.useState(reasons.join('\n'));
  React.useEffect(() => { if (open) setDraft(reasons.join('\n')); }, [open, reasons]);
  if (!open) return null;
  return (
    <Sheet open={true} onClose={onClose} title="ЗАЧЕМ Я ЧИСТЫЙ" height="80%">
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>
        ОДНА ПРИЧИНА — ОДНА СТРОКА
      </div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
        placeholder={"Девушка / отношения\nСтать сильнее\nПрожить дольше\nДеньги в кармане\nМать гордилась бы"}
        rows={9}
        style={{
          width: '100%', padding: 12,
          background: BRUTE.surface, color: BRUTE.text,
          border: `1px solid ${BRUTE.border}`, borderRadius: 8,
          fontFamily: 'Inter, system-ui', fontSize: 15, lineHeight: 1.5,
          boxSizing: 'border-box', resize: 'vertical',
        }}/>
      <div style={{ marginTop: 16 }}>
        <BrushButton onClick={() => {
          const arr = draft.split('\n').map((l) => l.trim()).filter(Boolean);
          onSave(arr); hapticMedium(); onClose();
        }} variant="slab" color={BRUTE.blood} fontSize={22}>СОХРАНИТЬ</BrushButton>
      </div>
    </Sheet>
  );
}

// ─── Cost sheet (rubles per day) ────────────────────────────────────────────
function CostSheet({ open, onClose, value, onSave }) {
  const [v, setV] = React.useState(value || 0);
  React.useEffect(() => { if (open) setV(value || 0); }, [open, value]);
  if (!open) return null;
  return (
    <Sheet open={true} onClose={onClose} title="СКОЛЬКО ОБЫЧНО ТРАТИЛ В ДЕНЬ?" height="55%">
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>СТОИМОСТЬ ОДНОГО ДНЯ В РУБЛЯХ</div>
      <Stepper value={v} onChange={setV} min={0} max={20000} step={50} unit="₽" big onHaptic={hapticLight}/>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 10 }}>
        Грубая прикидка — что ты обычно спускал. Поставь 0 чтоб скрыть счётчик денег.
      </div>
      <div style={{ marginTop: 18 }}>
        <BrushButton onClick={() => { onSave(v); hapticMedium(); onClose(); }}
          variant="slab" color={BRUTE.blood} fontSize={22}>СОХРАНИТЬ</BrushButton>
      </div>
    </Sheet>
  );
}

// ─── Urge sheet — breathing + plan + record ────────────────────────────────
function UrgeSheet({ open, onClose, reasons, actions }) {
  const [step, setStep] = React.useState(0);
  // step 0 = your reasons, step 1 = breathing 4-7-8, step 2 = action plan, step 3 = log result
  const [phase, setPhase] = React.useState('inhale');
  const [phaseSec, setPhaseSec] = React.useState(4);
  const [cycle, setCycle] = React.useState(0);
  const [trigger, setTrigger] = React.useState('');
  const [actionTaken, setActionTaken] = React.useState('');

  React.useEffect(() => { if (open) { setStep(0); setCycle(0); setTrigger(''); setActionTaken(''); } }, [open]);

  // breathing timer
  React.useEffect(() => {
    if (step !== 1) return;
    const id = setInterval(() => {
      setPhaseSec((s) => {
        if (s > 1) return s - 1;
        // advance phase
        if (phase === 'inhale') { setPhase('hold'); return 7; }
        if (phase === 'hold')   { setPhase('exhale'); return 8; }
        // exhale → next cycle or done
        if (cycle + 1 >= 3) { setStep(2); return 4; }
        setCycle(cycle + 1);
        setPhase('inhale');
        return 4;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, phase, cycle]);

  if (!open) return null;

  return (
    <Sheet open={true} onClose={onClose} title="ПОТЯНУЛО — ВЫСТАИВАЕМ" height="90%">
      {step === 0 && (
        <div>
          <div className="brute-display" style={{ fontSize: 28, color: BRUTE.text, lineHeight: 1, marginBottom: 12 }}>
            ШАГ 1 · ПРОЧИТАЙ.
          </div>
          {reasons.length === 0 ? (
            <div className="brute-body" style={{ color: BRUTE.textMuted, fontSize: 14, marginBottom: 16 }}>
              Ты не записывал причины. Это пройдёт и без них — но запиши потом.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {reasons.map((r, i) => (
                <div key={i} style={{
                  padding: 12, background: BRUTE.surface,
                  borderLeft: `4px solid ${BRUTE.blood}`, borderRadius: 4,
                  color: BRUTE.text, fontSize: 15, lineHeight: 1.4,
                }}>{r}</div>
              ))}
            </div>
          )}
          <BrushButton onClick={() => setStep(1)} variant="slab" color={BRUTE.blood} fontSize={22}>
            ДЫХАНИЕ 4-7-8
          </BrushButton>
        </div>
      )}

      {step === 1 && (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="brute-caption" style={{ color: BRUTE.bruise }}>ЦИКЛ {cycle + 1} / 3</div>
          <div className="brute-display" style={{
            fontSize: 64, color: BRUTE.text, marginTop: 8, letterSpacing: '-0.02em',
          }}>
            {phase === 'inhale' ? 'ВДОХ' : phase === 'hold' ? 'ДЕРЖИ' : 'ВЫДОХ'}
          </div>
          <div style={{ marginTop: 28, position: 'relative', width: 180, height: 180, margin: '28px auto' }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="72" fill="none" stroke={BRUTE.surfaceAlt} strokeWidth="10"/>
              <circle cx="90" cy="90" r="72" fill="none" stroke={BRUTE.blood}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 72}`}
                strokeDashoffset={`${(2 * Math.PI * 72) * (1 - phaseSec / (phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8))}`}
                style={{ transition: 'stroke-dashoffset 800ms linear' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="brute-mono" style={{ fontSize: 56, color: BRUTE.text, fontWeight: 700 }}>{phaseSec}</span>
            </div>
          </div>
          <button onClick={() => setStep(2)} style={greyBtn}>ПРОПУСТИТЬ → ПЛАН</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="brute-display" style={{ fontSize: 28, color: BRUTE.text, lineHeight: 1, marginBottom: 12 }}>
            ШАГ 3 · СДЕЛАЙ ОДНО.
          </div>
          <div className="brute-body" style={{ color: BRUTE.textMuted, fontSize: 14, marginBottom: 14 }}>
            Тяга превратится в действие. Выбери что сделаешь — это сразу:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              '50 ОТЖИМАНИЙ ИЛИ 30 БЁРПИ',
              'ВЫЙТИ ИЗ ДОМА НА 15 МИН',
              'ХОЛОДНЫЙ ДУШ 60 СЕК',
              'ПОЗВОНИТЬ КОМУ-ТО',
              'ДРУГОЕ — ОПИШУ САМ',
            ].map((opt) => (
              <button key={opt} onClick={() => { setActionTaken(opt); hapticLight(); }}
                style={{
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: actionTaken === opt ? BRUTE.blood : BRUTE.surface,
                  border: `1px solid ${actionTaken === opt ? BRUTE.blood : BRUTE.border}`,
                  color: actionTaken === opt ? BRUTE.surface : BRUTE.text,
                  fontFamily: "'Bebas Neue', Impact", fontSize: 16, letterSpacing: '0.04em',
                }}>{opt}</button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>ЧТО ЗАПУСТИЛО? (НЕОБЯЗАТЕЛЬНО)</div>
            <input value={trigger} onChange={(e) => setTrigger(e.target.value)}
              placeholder="стресс, скука, тусовка, фото, музыка..."
              style={{
                width: '100%', padding: 12,
                background: BRUTE.surface, color: BRUTE.text,
                border: `1px solid ${BRUTE.border}`, borderRadius: 8,
                fontFamily: 'Inter, system-ui', fontSize: 15, boxSizing: 'border-box',
              }}/>
          </div>

          <div style={{ marginTop: 18 }}>
            <BrushButton onClick={() => {
              actions.logUrge({ trigger, action: actionTaken, resolved: true });
              hapticHeavy();
              onClose();
            }} variant="slab" color={BRUTE.blood} fontSize={22}>
              ВЫСТОЯЛ. ЗАПИСАТЬ.
            </BrushButton>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ─── Letter writer ──────────────────────────────────────────────────────────
function LetterWriterSheet({ open, onClose, actions, currentDays }) {
  const MILES = [30, 60, 90, 180, 365];
  const [openOnDay, setOpenOnDay] = React.useState(30);
  const [body, setBody] = React.useState('');
  React.useEffect(() => { if (open) { setOpenOnDay(MILES.find((m) => m > currentDays) || 30); setBody(''); } }, [open, currentDays]);
  if (!open) return null;
  return (
    <Sheet open={true} onClose={onClose} title="ПИСЬМО СЕБЕ — ПРОЧТЁШЬ ПОТОМ" height="85%">
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>ОТКРОЕТСЯ НА ДЕНЬ</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {MILES.map((m) => (
          <button key={m} onClick={() => setOpenOnDay(m)}
            style={{
              flex: 1, padding: '8px 4px', cursor: 'pointer', borderRadius: 8,
              background: openOnDay === m ? BRUTE.blood : BRUTE.surface,
              border: `1px solid ${openOnDay === m ? BRUTE.blood : BRUTE.border}`,
              color: openOnDay === m ? BRUTE.surface : BRUTE.text,
              fontFamily: "'Bebas Neue', Impact", fontSize: 15,
            }}>{m}</button>
        ))}
      </div>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 6 }}>ТЕКСТ ПИСЬМА</div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)}
        rows={10} placeholder="Если ты это читаешь — ты дошёл до 30 дней. Помни почему ты начал..."
        style={{
          width: '100%', padding: 12,
          background: BRUTE.surface, color: BRUTE.text,
          border: `1px solid ${BRUTE.border}`, borderRadius: 8,
          fontFamily: 'Inter, system-ui', fontSize: 15, lineHeight: 1.5,
          boxSizing: 'border-box', resize: 'vertical',
        }}/>
      <div style={{ marginTop: 16 }}>
        <BrushButton onClick={() => {
          if (!body.trim()) return;
          actions.writeLetter({ openOnDay, body });
          hapticMedium(); onClose();
        }} variant="slab" color={BRUTE.blood} fontSize={22}>ЗАПЕЧАТАТЬ</BrushButton>
      </div>
    </Sheet>
  );
}

// ─── Letter reveal ──────────────────────────────────────────────────────────
function LetterRevealSheet({ letter, onClose, actions }) {
  React.useEffect(() => {
    if (!letter.opened) actions.openLetter(letter.id);
  }, [letter.id, letter.opened]);
  return (
    <Sheet open={true} onClose={onClose} title={`ПИСЬМО · ${letter.openOnDay} ДЕНЬ`} height="85%">
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 12 }}>
        НАПИСАНО {formatShort(letter.writtenAtISO)}
      </div>
      <div style={{
        padding: 18, background: BRUTE.surface,
        borderLeft: `4px solid ${BRUTE.blood}`, borderRadius: 4,
        color: BRUTE.text, fontSize: 16, lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>{letter.body}</div>
      <div style={{ marginTop: 24 }}>
        <button onClick={onClose} style={greyBtn}>ЗАКРЫТЬ</button>
      </div>
    </Sheet>
  );
}

// ─── Photo journal sheet ────────────────────────────────────────────────────
function PhotoSheet({ open, onClose, actions, existing }) {
  const inputRef = React.useRef(null);
  if (!open) return null;

  const handlePick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      // shrink a bit to keep localStorage size reasonable (max ~5MB total)
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = c.toDataURL('image/jpeg', 0.7);
        actions.addPhoto({ dataUrl });
        hapticMedium();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <Sheet open={true} onClose={onClose} title="ФОТО-ЖУРНАЛ" height="80%">
      <input ref={inputRef} type="file" accept="image/*" capture="user" onChange={handlePick}
        style={{ display: 'none' }}/>
      <BrushButton onClick={() => inputRef.current && inputRef.current.click()}
        variant="slab" color={BRUTE.blood} fontSize={22}>
        СНЯТЬ СЕЙЧАС
      </BrushButton>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 10, fontSize: 11, lineHeight: 1.5 }}>
        Все фото локально, никуда не уходят. Для размера сжимаются до 600px по большей стороне.
      </div>

      {existing.length > 0 && (
        <>
          <div className="brute-caption" style={{ color: BRUTE.bruise, marginTop: 22, marginBottom: 10 }}>
            ВСЕГО {existing.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {existing.slice().reverse().map((p) => (
              <div key={p.id} style={{ position: 'relative' }}>
                <div style={{
                  aspectRatio: '1', borderRadius: 6, overflow: 'hidden',
                  backgroundImage: `url(${p.dataUrl})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: `1px solid ${BRUTE.border}`,
                }}/>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: '#fff', padding: '8px 6px 4px', fontSize: 9, textAlign: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>{p.dateISO.slice(5)}</span>
                  <button onClick={() => { if (confirm('Удалить фото?')) actions.deletePhoto(p.id); }}
                    style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', padding: 0, fontSize: 12 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}

// ─── Tombstone milestone sheet ──────────────────────────────────────────────
function TombstoneSheet({ days, earnedDate, onClose }) {
  return (
    <Sheet open={true} onClose={onClose} title={`${days} ДНЕЙ ЗАКРЫТО`} height="80%">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <FlashTombstone size={200} color={BRUTE.text}
          liftLabel={`${days} ДНЕЙ`}
          topText="ЗДЕСЬ ЛЕЖИТ"
          subText={earnedDate ? `СТАРТ ${formatShort(earnedDate).slice(5).toUpperCase()}` : ''}/>
      </div>
      <div className="brute-display" style={{ fontSize: 24, color: BRUTE.text, lineHeight: 1.1, textAlign: 'center', marginTop: 8 }}>
        ТО ЧТО БЫЛО — НЕ ВЕРНЁТСЯ.
      </div>
      <div className="brute-body" style={{ color: BRUTE.textMuted, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
        Эта веха закрыта. Этот ты больше не возвращается. Идём за следующим надгробием.
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={onClose} style={greyBtn}>ЗАКРЫТЬ</button>
      </div>
    </Sheet>
  );
}

// ─── shared styles ──────────────────────────────────────────────────────────
const lightBtn = {
  flex: 1, padding: '12px', background: BRUTE.surface,
  border: `1px solid ${BRUTE.border}`, borderRadius: 8,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 14, cursor: 'pointer',
  letterSpacing: '0.04em',
};
const greyBtn = {
  width: '100%', padding: 12, background: 'transparent',
  border: `1px solid ${BRUTE.border}`, borderRadius: 10,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 18, cursor: 'pointer',
};
const ghostBtn = {
  width: '100%', marginTop: 10, padding: 12, background: 'transparent',
  border: `1px solid ${BRUTE.border}`, borderRadius: 10,
  color: BRUTE.textFaint, fontFamily: "'Bebas Neue', Impact", fontSize: 16, cursor: 'pointer',
};
const navBtn = {
  width: 36, height: 36, borderRadius: 10,
  background: 'transparent', border: `1px solid ${BRUTE.border}`,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 22, cursor: 'pointer',
  lineHeight: 1, padding: 0,
};
const editLink = {
  background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
  color: BRUTE.blood, fontFamily: "'Bebas Neue', Impact", fontSize: 13, letterSpacing: '0.06em',
};
const dateInput = {
  width: '100%', padding: '14px',
  background: BRUTE.surface, border: `1px solid ${BRUTE.border}`,
  fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 24,
  color: BRUTE.text, borderRadius: 8, boxSizing: 'border-box',
};

Object.assign(window, {
  CleanDaysScreen, MoodScale, MoodMark, MoodSparkline, MonthCalendar, DayDetailSheet,
  RelapseConfirmSheet, ReasonsEditorSheet, CostSheet, UrgeSheet,
  LetterWriterSheet, LetterRevealSheet, PhotoSheet, TombstoneSheet,
});
