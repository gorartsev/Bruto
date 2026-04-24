// BRUTE — PR Celebration + Session Complete screens

function PRCelebration({ pr, prev, onDismiss, accent = BRUTE.blood, lang = 'en' }) {
  const S = STRINGS[lang] || STRINGS.en;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRUTE.ink, zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflow: 'hidden',
    }}>
      {/* halftone */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: halftoneBg('#fff', 2), opacity: 0.3 }}/>

      {/* splash behind medallion */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%) scale(2.2)',
        width: 300, height: 240, opacity: 0.9,
        animation: 'bruteStamp 500ms ease-out forwards',
      }}>
        <Brush variant="splat" color={accent} style={{ width: '100%', height: '100%' }}/>
      </div>

      {/* medallion */}
      <div style={{ position: 'relative', zIndex: 2, animation: 'bruteStamp 600ms 200ms ease-out both' }}>
        <FlashMedallion size={180} lift={pr.lift}/>
      </div>

      <div style={{ position: 'relative', zIndex: 2, marginTop: 24, textAlign: 'center' }}>
        <div className="brute-caption" style={{ color: accent, fontSize: 12, letterSpacing: '0.3em' }}>{S.prBanner}</div>
        <div className="brute-display" style={{ fontSize: 56, color: BRUTE.paper, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
          {S.newPr}
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center' }}>
          <span className="brute-mono" style={{ fontSize: 72, color: BRUTE.paper, fontWeight: 700, lineHeight: 1 }}>
            {pr.new1RM}
          </span>
          <span className="brute-caption" style={{ color: BRUTE.ash, fontSize: 14 }}>{S.kg}</span>
        </div>
        <div className="brute-caption" style={{ color: BRUTE.ash, marginTop: 6, fontSize: 11 }}>
          {S.eplyLine(pr.weight, pr.reps)}
        </div>
        <div style={{ height: 10, width: 200, margin: '16px auto' }}>
          <Brush variant="rule" color={BRUTE.smoke} style={{ width: '100%', height: '100%' }}/>
        </div>
        <div className="brute-body" style={{ color: BRUTE.ash, fontSize: 13 }}>
          {S.upFrom} <span className="brute-mono" style={{ color: BRUTE.paper }}>{prev.kg} {S.kg}</span>
          <span style={{ margin: '0 8px', color: BRUTE.smoke }}>·</span>
          <span className="brute-mono" style={{ color: BRUTE.paper }}>{prev.date}</span>
        </div>
        <div style={{ marginTop: 24 }}>
          <BrushButton onClick={onDismiss} color={accent} height={56} fontSize={lang === 'ru' ? 28 : 26} width={240}>
            {S.backToWork}
          </BrushButton>
        </div>
      </div>
    </div>
  );
}

function SessionComplete({ onClose, accent = BRUTE.blood, totalVolume = 4_287, setsDone = 18, prCount = 1, duration = '01:08:42', lang = 'en' }) {
  const S = STRINGS[lang] || STRINGS.en;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRUTE.ink, zIndex: 90,
      display: 'flex', flexDirection: 'column', padding: '60px 24px 32px',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: halftoneBg('#fff', 2), opacity: 0.25 }}/>

      {/* header */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div className="brute-caption" style={{ color: accent, fontSize: 11, letterSpacing: '0.3em' }}>
          {S.weekDayDone}
        </div>
        <div className="brute-display" style={{ fontSize: lang === 'ru' ? 52 : 64, color: BRUTE.paper, lineHeight: 0.9, marginTop: 6, letterSpacing: '-0.02em' }}>
          {S.sessionComplete[0]}<br/>{S.sessionComplete[1]}
        </div>
        <div style={{ height: 12, width: 180, margin: '14px auto' }}>
          <Brush variant="rule" color={accent} style={{ width: '100%', height: '100%' }}/>
        </div>
      </div>

      {/* stamp */}
      <div style={{ position: 'relative', margin: '10px auto 20px', animation: 'bruteStamp 500ms ease-out both' }}>
        <div style={{
          position: 'relative', width: 200, height: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brush variant="splat" color={accent}
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.85 }}/>
          <div style={{ position: 'relative', color: BRUTE.paper, textAlign: 'center', transform: 'rotate(-6deg)' }}>
            <div className="brute-caption" style={{ fontSize: 10, letterSpacing: '0.3em' }}>{S.weekStamp}</div>
            <div className="brute-display" style={{ fontSize: 64, lineHeight: 0.9, margin: '4px 0' }}>03</div>
            <div className="brute-caption" style={{ fontSize: 10, letterSpacing: '0.3em' }}>{S.of12}</div>
          </div>
        </div>
      </div>

      {/* ledger table */}
      <div style={{ position: 'relative', padding: '0 4px', flex: 1 }}>
        <div className="brute-caption" style={{ color: BRUTE.ash, marginBottom: 10 }}>{S.ledger}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { k: S.duration, v: duration, unit: '' },
            { k: S.totalVolume, v: totalVolume.toLocaleString(), unit: S.kg },
            { k: S.setsLogged, v: setsDone, unit: '' },
            { k: S.prsNotched, v: prCount, unit: '', highlight: prCount > 0 },
          ].map((r, i) => (
            <div key={i} style={{
              position: 'relative',
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '10px 12px',
              background: BRUTE.smoke, borderRadius: 8,
              border: `1px solid ${r.highlight ? accent : '#333'}`,
            }}>
              {r.highlight && (
                <div style={{ position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none' }}>
                  <Brush variant="dash" color={accent} style={{ width: '100%', height: '100%' }}/>
                </div>
              )}
              <span className="brute-caption" style={{ position: 'relative', color: r.highlight ? accent : BRUTE.ash, fontSize: 10 }}>
                {r.k}
              </span>
              <span style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="brute-mono" style={{ color: BRUTE.paper, fontSize: 22, fontWeight: 700 }}>{r.v}</span>
                {r.unit && <span className="brute-caption" style={{ color: BRUTE.ash, fontSize: 10 }}>{r.unit}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 14 }}>
        <BrushButton onClick={onClose} color={accent} height={60} fontSize={lang === 'ru' ? 30 : 28}>
          {S.closeOut}
        </BrushButton>
      </div>
    </div>
  );
}

Object.assign(window, { PRCelebration, SessionComplete });
