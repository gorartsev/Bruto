// BRUTE — nav-tab screens: Program calendar, Logbook, Stats, Profile, plus ExerciseDetail modal.

// ─── PROGRAM (12-week calendar) ─────────────────────────────────────────────
function ProgramScreen({ onOpenSession }) {
  const { state } = useBrute();
  const todayISO = useTodayISO();
  const { profile, sessions } = state;
  const coords = programCoords(profile.startDateISO || todayISO, todayISO);

  const doneKeys = new Set((sessions || []).map((s) => `${s.coords?.week}:${s.coords?.weekday}`));

  const cellState = (week, weekday) => {
    const key = `${week}:${weekday}`;
    if (doneKeys.has(key)) return 'done';
    if (!coords.before && !coords.after && week === coords.week && weekday === coords.weekday) return 'today';
    if (!coords.before) {
      // past vs future
      const isPast = week < coords.week || (week === coords.week && dayIndex(weekday) < dayIndex(coords.weekday));
      if (isPast) return 'skipped';
    }
    return 'future';
  };

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 16px 110px">
        <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>ПРОГРАММА</div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>12 НЕДЕЛЬ · ПН–ПТ</div>

        {/* phase strip */}
        <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
          {[1, 2, 3].map((p) => {
            const active = coords.phase === p;
            return (
              <div key={p} style={{
                flex: 1, padding: '10px 8px', borderRadius: 8,
                background: active ? BRUTE.blood : BRUTE.surfaceAlt,
                color: active ? BRUTE.surface : BRUTE.text, textAlign: 'center',
              }}>
                <div className="brute-caption" style={{ fontSize: 9, opacity: 0.8 }}>ФАЗА {p}</div>
                <div className="brute-display" style={{ fontSize: 14, letterSpacing: '0.04em' }}>
                  {p === 1 ? 'ЛИНЕЙКА' : p === 2 ? '5/3/1 FSL' : 'ИНТЕНСИФ.'}
                </div>
              </div>
            );
          })}
        </div>

        {/* grid */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: 6 }}>
          <div/>
          {['ПН','ВТ','СР','ЧТ','ПТ'].map((d) => (
            <div key={d} className="brute-caption" style={{ color: BRUTE.textFaint, textAlign: 'center', fontSize: 10 }}>{d}</div>
          ))}
          {Array.from({ length: 12 }).map((_, wi) => {
            const week = wi + 1;
            return (
              <React.Fragment key={week}>
                <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {String(week).padStart(2, '0')}
                </div>
                {['mon','tue','wed','thu','fri'].map((wd) => {
                  const st = cellState(week, wd);
                  return (
                    <button key={wd} onClick={() => onOpenSession({ week, weekday: wd, phase: week <= 4 ? 1 : week <= 8 ? 2 : 3 })}
                      style={{
                        aspectRatio: 1, border: 0, cursor: 'pointer',
                        background: st === 'done' ? BRUTE.blood
                                  : st === 'today' ? BRUTE.surface
                                  : st === 'skipped' ? BRUTE.surfaceAlt
                                  : 'transparent',
                        borderRadius: 4,
                        color: st === 'done' ? BRUTE.surface : BRUTE.text,
                        outline: st === 'today' ? `2px solid ${BRUTE.blood}` : `1px solid ${BRUTE.border}`,
                        fontFamily: "'Bebas Neue', Impact", fontSize: 14,
                      }}>
                      {weekdayGlyph(wd)}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 16, fontSize: 10 }}>
          П = ПРИСЕД · Ж = ЖИМ · С = СТАНОВАЯ · О = ЖИМ СТОЯ · Л = ЛЁГКИЙ
        </div>

        {/* phase cards */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PhaseCard n={1} title="ФАЗА 1 · ЛИНЕЙНАЯ ПРОГРЕССИЯ" weeks="1–4" text="Каждую успешную тренировку добавляешь +2.5 верх, +5 низ. Стопор → 90%, накат заново. Это самый быстрый рост у новичка — выжимаем до отказа."/>
          <PhaseCard n={2} title="ФАЗА 2 · 5/3/1 FSL" weeks="5–8" text="Три волны по 4 недели: 5-5-5, 3-3-3, 5-3-1 + делоад. Последний подход — AMRAP. First Set Last 5×5 для объёма."/>
          <PhaseCard n={3} title="ФАЗА 3 · ИНТЕНСИФИКАЦИЯ + ТЕСТ" weeks="9–12" text="Те же волны с перестановкой + Joker-одиночники на присед и становую. Неделя 12 — настоящий РМ-тест."/>
        </div>
      </ScrollArea>
    </PhoneScreen>
  );
}

function dayIndex(wd) { return { mon:1,tue:2,wed:3,thu:4,fri:5,sat:6,sun:7 }[wd] || 0; }

function weekdayGlyph(wd) {
  // letter initial to hint at the day's theme
  return { mon: 'П', tue: 'Ж', wed: 'Л', thu: 'С', fri: 'О' }[wd] || '·';
}

function PhaseCard({ n, title, weeks, text }) {
  return (
    <BruteCard tone="bone" padding={16} grit={1}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="brute-caption" style={{ color: BRUTE.bruise }}>ФАЗА {n}</div>
        <div className="brute-caption" style={{ color: BRUTE.bruise }}>НЕДЕЛИ {weeks}</div>
      </div>
      <div className="brute-display" style={{ fontSize: 22, color: BRUTE.ink, marginTop: 6, lineHeight: 1 }}>{title}</div>
      <div className="brute-body" style={{ color: BRUTE.smoke, fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>{text}</div>
    </BruteCard>
  );
}

// ─── LOGBOOK ────────────────────────────────────────────────────────────────
function LogbookScreen({ onOpenSession }) {
  const { state } = useBrute();
  const [filter, setFilter] = React.useState('all'); // all | prs | squat | bench | deadlift | ohp
  const list = (state.sessions || []).slice().reverse();
  const filtered = list.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'prs') return (s.prs || []).length > 0;
    return (s.loggedSets || []).some((ls) => ls.lift === filter && ls.isMain);
  });

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 16px 110px">
        <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>ЖУРНАЛ</div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>
          {list.length} ТРЕНИРОВОК В ИСТОРИИ
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { k: 'all',       l: 'ВСЕ' },
            { k: 'prs',       l: 'РЕКОРДЫ' },
            { k: 'squat',     l: 'ПРИСЕД' },
            { k: 'bench',     l: 'ЖИМ' },
            { k: 'deadlift',  l: 'СТАНОВАЯ' },
            { k: 'ohp',       l: 'ЖИМ СТОЯ' },
          ].map((c) => (
            <button key={c.k} onClick={() => setFilter(c.k)}
              style={{
                flex: '0 0 auto',
                padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                background: filter === c.k ? BRUTE.blood : 'transparent',
                border: `1px solid ${filter === c.k ? BRUTE.blood : BRUTE.border}`,
                color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 14, letterSpacing: '0.04em',
              }}>{c.l}</button>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ color: BRUTE.textFaint, padding: '40px 0', textAlign: 'center' }}>Пока пусто.</div>
          )}
          {filtered.map((s) => {
            const mainKey = (s.loggedSets || []).find((ls) => ls.isMain)?.exerciseKey;
            return (
              <button key={s.id} onClick={() => onOpenSession(s)}
                style={{
                  background: BRUTE.surfaceAlt, border: 0, borderRadius: 10,
                  padding: '14px 14px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                {mainKey && <ExerciseArt exerciseKey={mainKey} size={44} color={BRUTE.text}/>}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="brute-caption" style={{ color: BRUTE.textFaint }}>{formatShort(s.dateISO)}</div>
                    {(s.prs || []).length > 0 && (
                      <div className="brute-caption" style={{ color: BRUTE.blood }}>★ {s.prs.length} РЕКОРД{s.prs.length > 1 ? 'А' : ''}</div>
                    )}
                  </div>
                  <div className="brute-display" style={{ fontSize: 20, color: BRUTE.text, marginTop: 2, letterSpacing: '0.02em' }}>
                    {s.theme}
                  </div>
                  <div className="brute-mono" style={{ color: BRUTE.textFaint, fontSize: 11, marginTop: 4 }}>
                    {(s.loggedSets || []).length} подходов · {Math.round(s.totalVolumeKg)} кг · {Math.round(s.durationSec / 60)} мин
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </PhoneScreen>
  );
}

// ─── STATS ──────────────────────────────────────────────────────────────────
function StatsScreen() {
  const { state } = useBrute();
  const { sessions, prs, profile, bodyweight } = state;

  const best = bestOneRMs(prs, profile);
  const streak = computeStreak(sessions, profile.startDateISO);
  const longestStreak = streak; // simple: use current (real longest would track per-save; good enough)

  // volume per week (last 12 weeks)
  const volumeByWeek = {};
  sessions.forEach((s) => {
    const w = s.coords?.week || 1;
    volumeByWeek[w] = (volumeByWeek[w] || 0) + (s.totalVolumeKg || 0);
  });
  const weekKeys = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxVolume = Math.max(1, ...Object.values(volumeByWeek));

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 16px 110px">
        <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>СТАТИСТИКА</div>

        {/* 1RMs */}
        <div style={{ marginTop: 16 }}>
          <BruteCard tone="bone" padding={18} grit={1}>
            <div className="brute-caption" style={{ color: BRUTE.bruise }}>ОЦЕНКА РМ</div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['squat','bench','deadlift','ohp'].map((k) => (
                <div key={k}>
                  <div className="brute-caption" style={{ color: BRUTE.smoke, fontSize: 10 }}>{liftNameRu(k)}</div>
                  <div className="brute-mono" style={{ color: BRUTE.ink, fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
                    {best[k] ? Math.round(best[k]) : '—'}
                    <span style={{ color: BRUTE.bruise, fontSize: 14, marginLeft: 4 }}>КГ</span>
                  </div>
                  <OneRMSparkline lift={k} sessions={sessions} prs={prs} width={120} height={30}/>
                </div>
              ))}
            </div>
          </BruteCard>
        </div>

        {/* Strength × bodyweight */}
        <div style={{ marginTop: 14 }}>
          <BruteCard tone="bone" padding={18} grit={1}>
            <div className="brute-caption" style={{ color: BRUTE.bruise }}>СИЛА × ВЕС ТЕЛА</div>
            <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 9, marginTop: 2 }}>
              ВЕС ТЕЛА · {profile.bodyweightKg} КГ
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['squat','bench','deadlift','ohp'].map((k) => {
                const oneRM = best[k] || 0;
                const { ratio, level } = strengthLevel(k, oneRM, profile.bodyweightKg);
                const tier = level === 'ЭЛИТА' ? 4
                           : level === 'ПРОДВИНУТЫЙ' ? 3
                           : level === 'СРЕДНИЙ' ? 2
                           : level === 'НАЧИНАЮЩИЙ' ? 1 : 0;
                const tierColor = tier >= 4 ? BRUTE.blood
                                : tier === 3 ? '#7A0C12'
                                : tier === 2 ? BRUTE.text
                                : tier === 1 ? BRUTE.textFaint
                                : BRUTE.textFaint;
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span className="brute-display" style={{ color: BRUTE.text, fontSize: 14 }}>{liftNameRu(k)}</span>
                        <span className="brute-mono" style={{ color: tierColor, fontSize: 16, fontWeight: 700 }}>
                          {ratio > 0 ? `${ratio.toFixed(2)}\u00d7` : '—'}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, height: 6, background: BRUTE.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (tier / 4) * 100)}%`, height: '100%',
                          background: tierColor, transition: 'width 400ms',
                        }}/>
                      </div>
                      <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 9, marginTop: 2 }}>
                        {level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 9, marginTop: 12, lineHeight: 1.5 }}>
              УРОВНИ ОТНОСИТЕЛЬНО ВЕСА ТЕЛА: НОВИЧОК / СРЕДНИЙ / ПРОДВИНУТЫЙ / ЭЛИТА.
            </div>
          </BruteCard>
        </div>

        {/* Volume per week */}
        <div style={{ marginTop: 14 }}>
          <BruteCard tone="ink" padding={16} grit={1} style={{ border: `1px solid ${BRUTE.border}` }}>
            <div className="brute-caption" style={{ color: BRUTE.textFaint }}>ОБЪЁМ ПО НЕДЕЛЯМ · КГ</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {weekKeys.map((w) => {
                const v = volumeByWeek[w] || 0;
                const h = (v / maxVolume) * 70;
                return (
                  <div key={w} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '70%', height: Math.max(2, h),
                      background: v > 0 ? BRUTE.blood : BRUTE.surfaceAlt, borderRadius: 2,
                    }}/>
                    <div className="brute-caption" style={{ color: BRUTE.textFaint, fontSize: 8, marginTop: 2 }}>{w}</div>
                  </div>
                );
              })}
            </div>
          </BruteCard>
        </div>

        {/* PR Board */}
        <div style={{ marginTop: 14 }}>
          <BruteCard tone="bone" padding={18} grit={1}>
            <div className="brute-caption" style={{ color: BRUTE.bruise }}>ТАБЛО РЕКОРДОВ</div>
            {(!prs || prs.length === 0) ? (
              <div style={{ color: BRUTE.smoke, marginTop: 10 }}>Пока ни одного. Будут.</div>
            ) : (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {prs.slice().reverse().slice(0, 6).map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span className="brute-display" style={{ color: BRUTE.ink, fontSize: 14 }}>{liftNameRu(p.lift)}</span>
                      <span className="brute-caption" style={{ color: BRUTE.smoke, marginLeft: 8, fontSize: 10 }}>{formatShort(p.dateAchievedISO)}</span>
                    </div>
                    <span className="brute-mono" style={{ color: BRUTE.blood, fontSize: 16, fontWeight: 700 }}>
                      {Math.round(p.est1RMKg)} кг
                      {p.previousBestKg > 0 && <span style={{ color: BRUTE.smoke, fontSize: 10, marginLeft: 4 }}>+{Math.round(p.est1RMKg - p.previousBestKg)}</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </BruteCard>
        </div>

        {/* Current phase progress */}
        <div style={{ marginTop: 14 }}>
          <BruteCard tone="ink" padding={16} grit={0} style={{ border: `1px solid ${BRUTE.border}` }}>
            <PhaseProgress/>
          </BruteCard>
        </div>

        {/* Bodyweight trend */}
        {bodyweight && bodyweight.length > 1 && (
          <div style={{ marginTop: 14 }}>
            <BruteCard tone="bone" padding={16} grit={1}>
              <div className="brute-caption" style={{ color: BRUTE.bruise }}>ВЕС ТЕЛА</div>
              <BodyweightChart entries={bodyweight}/>
            </BruteCard>
          </div>
        )}

        {/* Streak */}
        <div style={{ marginTop: 14 }}>
          <BruteCard tone="ink" padding={16} grit={0} style={{ border: `1px solid ${BRUTE.border}` }}>
            <div className="brute-caption" style={{ color: BRUTE.textFaint }}>СТРИК</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
              <FlashFlame size={40} color={BRUTE.blood}/>
              <div>
                <div className="brute-mono" style={{ color: BRUTE.text, fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{streak}</div>
                <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>
                  НЕДЕЛ ПОДРЯД · ВСЕГО {sessions.length} ТРЕНИРОВОК
                </div>
              </div>
            </div>
          </BruteCard>
        </div>
      </ScrollArea>
    </PhoneScreen>
  );
}

function OneRMSparkline({ lift, sessions, prs, width, height }) {
  // points = ordered est 1RM per session where this lift had a main set
  const pts = [];
  sessions.forEach((s) => {
    (s.loggedSets || []).forEach((ls) => {
      if (ls.lift === lift && ls.isMain && ls.computed1RM) pts.push(ls.computed1RM);
    });
  });
  // prepend baseline (estimated 1RM pre-start) if empty
  if (pts.length < 2) return <div style={{ height }}/>;
  const min = Math.min(...pts), max = Math.max(...pts);
  const span = Math.max(1, max - min);
  const stepX = width / Math.max(1, pts.length - 1);
  const toY = (v) => height - ((v - min) / span) * (height - 4) - 2;
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * stepX},${toY(v)}`).join(' ');
  return (
    <svg width={width} height={height} style={{ marginTop: 4 }}>
      <path d={d} fill="none" stroke={BRUTE.blood} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function PhaseProgress() {
  const { state } = useBrute();
  const todayISO = useTodayISO();
  const coords = programCoords(state.profile.startDateISO || todayISO, todayISO);
  const week = coords.before ? 0 : coords.after ? 12 : coords.week;
  const pct = (week / 12) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="brute-caption" style={{ color: BRUTE.textFaint }}>ТЕКУЩАЯ ФАЗА</span>
        <span className="brute-display" style={{ color: BRUTE.text, fontSize: 16 }}>
          ФАЗА {coords.phase || 1} · НЕДЕЛЯ {coords.week || 1}/12
        </span>
      </div>
      <div style={{ marginTop: 10, background: BRUTE.surfaceAlt, height: 10, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: BRUTE.blood, transition: 'width 400ms' }}/>
      </div>
    </div>
  );
}

function BodyweightChart({ entries }) {
  const sorted = entries.slice().sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const vals = sorted.map((e) => e.kg);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const W = 260, H = 60;
  const step = W / Math.max(1, sorted.length - 1);
  const d = sorted.map((e, i) => `${i === 0 ? 'M' : 'L'}${i * step},${H - ((e.kg - min) / span) * (H - 6) - 3}`).join(' ');
  return (
    <div style={{ marginTop: 10 }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path d={d} fill="none" stroke={BRUTE.ink} strokeWidth="1.5"/>
      </svg>
      <div className="brute-mono" style={{ color: BRUTE.ink, fontSize: 12, marginTop: 6 }}>
        {min} – {max} кг · {sorted.length} записей
      </div>
    </div>
  );
}

// ─── PROFILE / SETTINGS ─────────────────────────────────────────────────────
function ProfileScreen() {
  const { state, actions } = useBrute();
  const { profile } = state;
  const [showTMSheet, setShowTMSheet] = React.useState(false);
  const [showWipeSheet, setShowWipeSheet] = React.useState(false);
  const [bwInput, setBwInput] = React.useState(profile.bodyweightKg);

  return (
    <PhoneScreen background={BRUTE.bg}>
      <ScrollArea padding="12px 16px 110px">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="brute-display" style={{ fontSize: 36, color: BRUTE.text, letterSpacing: '-0.01em' }}>
              {profile.name || 'БОЕЦ'}
            </div>
            <div className="brute-caption" style={{ color: BRUTE.textFaint }}>
              {profile.bodyweightKg} КГ · СТАРТ {formatShort(profile.startDateISO || dateToISO(new Date()))}
            </div>
          </div>
          <FlashFlame size={36} color={BRUTE.blood}/>
        </div>

        <Section title="ПРОГРАММА">
          <Row label="ТРЕНИРОВОЧНЫЕ МАКСИМУМЫ" value="РЕДАКТИРОВАТЬ" onClick={() => setShowTMSheet(true)}/>
          <Row label="ФАЗА" value={`ФАЗА ${computePhase(profile)}`}/>
        </Section>

        <Section title="ВЕС ТЕЛА">
          <div style={{ padding: '12px 14px', background: BRUTE.surfaceAlt, borderRadius: 10 }}>
            <Stepper value={bwInput} onChange={setBwInput} min={40} max={200} step={0.5} onHaptic={hapticLight} unit="КГ"/>
            <button onClick={() => { actions.logBodyweight(bwInput); hapticMedium(); }}
              style={{
                marginTop: 10, width: '100%', padding: 12,
                background: BRUTE.blood, border: 0, borderRadius: 8,
                color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 18, cursor: 'pointer',
              }}>СОХРАНИТЬ ВЕС</button>
          </div>
        </Section>

        <Section title="ВНЕШНИЙ ВИД · ЗВУК">
          <Row label="ЗВУКОВОЙ ПАК"
            value={profile.soundPack === 'silent' ? 'ТИХО' : 'МАШИННЫЙ ЦЕХ'}
            onClick={() => actions.updateProfile({ soundPack: profile.soundPack === 'silent' ? 'machineshop' : 'silent' })}/>
          <Row label="ВИБРАЦИЯ"
            value={profile.hapticsOn ? 'ВКЛ' : 'ВЫКЛ'}
            onClick={() => actions.updateProfile({ hapticsOn: !profile.hapticsOn })}/>
          <Row label="ЯЗЫК"
            value={profile.lang === 'ru' ? 'РУССКИЙ' : 'ENGLISH'}
            onClick={() => actions.updateProfile({ lang: profile.lang === 'ru' ? 'en' : 'ru' })}/>
        </Section>

        <Section title="ДАННЫЕ">
          <Row label="ЭКСПОРТ · JSON" value="СОХРАНИТЬ ФАЙЛ" onClick={() => downloadFile('brute-data.json', 'application/json', actions.exportJSON())}/>
          <Row label="ЭКСПОРТ · CSV" value="СОХРАНИТЬ ФАЙЛ" onClick={() => downloadFile('brute-sets.csv', 'text/csv', actions.exportCSV())}/>
          <Row label="ПОЛНЫЙ СБРОС" value="СТЕРЕТЬ ВСЁ" onClick={() => setShowWipeSheet(true)} danger/>
        </Section>

        <div className="brute-caption" style={{ color: BRUTE.smoke, marginTop: 30, textAlign: 'center' }}>
          BRUTE · V1.0 · LOCAL-ONLY · GITHUB.COM/GORARTSEV/BRUTO
        </div>
      </ScrollArea>

      <Sheet open={showTMSheet} onClose={() => setShowTMSheet(false)} title="ТМ · РЕДАКТИРОВАТЬ" height="80%">
        {['squat','bench','deadlift','ohp'].map((k) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 4 }}>{liftNameRu(k)}</div>
            <Stepper value={profile.trainingMax[k] || 0}
              onChange={(v) => actions.updateTrainingMax(k, v)}
              min={20} max={300} step={2.5} onHaptic={hapticLight} unit="КГ"/>
          </div>
        ))}
        <BrushButton onClick={() => setShowTMSheet(false)} variant="slab" color={BRUTE.blood} fontSize={22}>
          ПРИНЯТЬ
        </BrushButton>
      </Sheet>

      <Sheet open={showWipeSheet} onClose={() => setShowWipeSheet(false)} title="СТЕРЕТЬ ВСЁ?" height="45%">
        <div style={{ color: BRUTE.textFaint, marginBottom: 20 }}>
          Это удалит все тренировки, РМ, вес и онбординг. Откат невозможен.
        </div>
        <BrushButton onClick={() => { actions.wipeEverything(); hapticHeavy(); setShowWipeSheet(false); }}
          variant="slab" color={BRUTE.blood} fontSize={20}>
          ДА, СТЕРЕТЬ
        </BrushButton>
      </Sheet>
    </PhoneScreen>
  );
}

function computePhase(profile) {
  if (!profile.startDateISO) return 1;
  const c = programCoords(profile.startDateISO, dateToISO(new Date()));
  return c.phase || 1;
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function Row({ label, value, onClick, danger }) {
  const body = (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 14px', background: BRUTE.surfaceAlt, borderRadius: 10,
    }}>
      <span style={{ color: danger ? BRUTE.blood : BRUTE.text, fontFamily: 'Inter, system-ui', fontSize: 13 }}>{label}</span>
      <span className="brute-caption" style={{ color: danger ? BRUTE.blood : BRUTE.textFaint }}>{value}</span>
    </div>
  );
  if (onClick) {
    return <button onClick={onClick} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}>{body}</button>;
  }
  return body;
}

function downloadFile(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── EXERCISE DETAIL (sheet from active workout / logbook) ──────────────────
function ExerciseDetail({ exerciseKey, onClose }) {
  const { state } = useBrute();
  const exDef = EXERCISES[exerciseKey];
  const [tab, setTab] = React.useState('form');
  const cues = CUES[exDef.lift] || ['Разогревайся медленно','Дыши в корсет','Движение ТЕХНИКА → ВЕС'];

  // history: collect all sets of this exercise across sessions
  const history = [];
  state.sessions.forEach((s) => {
    (s.loggedSets || []).forEach((ls) => {
      if (ls.exerciseKey === exerciseKey) history.push({ ...ls, dateISO: s.dateISO });
    });
  });
  history.reverse();

  return (
    <Sheet open={true} onClose={onClose} title={exDef.name} height="85%">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <ExerciseArt exerciseKey={exerciseKey} size={140} color={BRUTE.text}/>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['form','ТЕХНИКА'], ['history','ИСТОРИЯ'], ['progress','ПРОГРЕСС']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{
              flex: 1, padding: '8px 6px', border: 0, cursor: 'pointer',
              background: tab === k ? BRUTE.blood : 'transparent',
              borderBottom: `2px solid ${tab === k ? BRUTE.blood : BRUTE.border}`,
              color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 14, letterSpacing: '0.04em',
            }}>{l}</button>
        ))}
      </div>

      {tab === 'form' && (
        <div>
          {cues.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span className="brute-mono" style={{ color: BRUTE.blood, minWidth: 20 }}>{String(i + 1).padStart(2,'0')}</span>
              <span style={{ color: BRUTE.text, fontSize: 14, lineHeight: 1.5 }}>{c}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 && <div style={{ color: BRUTE.textFaint }}>Пока не делал.</div>}
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 0',
              borderBottom: `1px solid ${BRUTE.border}`,
            }}>
              <span className="brute-caption" style={{ color: BRUTE.textFaint }}>{formatShort(h.dateISO)}</span>
              <span className="brute-mono" style={{ color: BRUTE.text }}>
                {h.actualWeightKg}кг × {h.actualReps}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'progress' && (
        <ProgressChart sets={history}/>
      )}
    </Sheet>
  );
}

function ProgressChart({ sets }) {
  if (sets.length < 2) return <div style={{ color: BRUTE.textFaint }}>Накопим историю — появится график.</div>;
  const vals = sets.slice().reverse().map((s) => s.computed1RM || epley1RM(s.actualWeightKg, s.actualReps));
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const W = 280, H = 120;
  const step = W / Math.max(1, vals.length - 1);
  const d = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step},${H - ((v - min) / span) * (H - 6) - 3}`).join(' ');
  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path d={d} fill="none" stroke={BRUTE.blood} strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 8 }}>
        РМ · {Math.round(min)} → {Math.round(max)} КГ · {vals.length} ТОЧЕК
      </div>
    </div>
  );
}

Object.assign(window, {
  ProgramScreen, LogbookScreen, StatsScreen, ProfileScreen, ExerciseDetail,
});
