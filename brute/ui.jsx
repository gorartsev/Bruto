// BRUTE — extended UI primitives specific to the functional app.
// Builds on primitives.jsx (BruteCard, BrushButton, RepCells, WeightDrum, BruteTabBar, etc.)

// ─── Haptics (Web Vibration API — iOS Safari PWA has no support, but no-op is fine) ──
function hapticLight() { try { navigator.vibrate && navigator.vibrate(10); } catch (_) {} }
function hapticMedium() { try { navigator.vibrate && navigator.vibrate([20]); } catch (_) {} }
function hapticHeavy() { try { navigator.vibrate && navigator.vibrate([30, 30, 60]); } catch (_) {} }
function hapticTriple() { try { navigator.vibrate && navigator.vibrate([50, 40, 50, 40, 80]); } catch (_) {} }

// ─── Simple synth beeps via Web Audio (machine-shop pack) ──
let _ac = null;
function getAC() {
  try {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    return _ac;
  } catch (_) { return null; }
}
function beep({ freq = 220, durMs = 80, type = 'square', gain = 0.05 } = {}) {
  const ac = getAC(); if (!ac) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ac.destination);
    const now = ac.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
    o.start(now); o.stop(now + durMs / 1000);
  } catch (_) {}
}
function soundSetLogged(pack) {
  if (pack === 'silent') return;
  beep({ freq: 160, durMs: 90, type: 'square', gain: 0.04 });
  setTimeout(() => beep({ freq: 120, durMs: 110, type: 'square', gain: 0.04 }), 50);
}
function soundRestEnd(pack) {
  if (pack === 'silent') return;
  beep({ freq: 880, durMs: 120, type: 'triangle', gain: 0.05 });
  setTimeout(() => beep({ freq: 660, durMs: 180, type: 'triangle', gain: 0.05 }), 140);
}
function soundPR(pack) {
  if (pack === 'silent') return;
  beep({ freq: 110, durMs: 150, type: 'sawtooth', gain: 0.06 });
  setTimeout(() => beep({ freq: 220, durMs: 150, type: 'sawtooth', gain: 0.06 }), 120);
  setTimeout(() => beep({ freq: 330, durMs: 250, type: 'sawtooth', gain: 0.06 }), 260);
}

// ─── Phone screen wrapper with iOS safe-area handling ──────────────────────
// Fills its container. Children that want the full viewport should set their
// own backgrounds; this wrapper just provides safe-area padding helpers.
function PhoneScreen({ children, background = BRUTE.bg, padTop = true, padBottom = true, style = {} }) {
  // max() ensures clearance for both mobile standalone (env var) AND desktop preview iPhone status bar
  return (
    <div style={{
      position: 'absolute', inset: 0, background,
      color: BRUTE.text, overflow: 'hidden',
      paddingTop: padTop ? 'max(54px, env(safe-area-inset-top))' : 0,
      paddingBottom: padBottom ? 'max(34px, env(safe-area-inset-bottom))' : 0,
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      display: 'flex', flexDirection: 'column',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Scrollable body inside PhoneScreen (fills remaining height).
function ScrollArea({ children, padding = 0, style = {} }) {
  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch', padding, ...style,
    }}>{children}</div>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────
function TopBar({ left, right, center, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 8px', minHeight: 44, ...style,
    }}>
      <div style={{ minWidth: 44, display: 'flex', alignItems: 'center' }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center' }}>{center}</div>
      <div style={{ minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="brute-press brute-no-select"
      style={{ background: 'transparent', border: 0, padding: 8, cursor: 'pointer', color: BRUTE.text }}>
      <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
        <path d="M12 2L2 11L12 20" stroke={BRUTE.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function CloseXButton({ onClick }) {
  return (
    <button onClick={onClick} className="brute-press brute-no-select"
      style={{ background: 'transparent', border: 0, padding: 8, cursor: 'pointer', color: BRUTE.text }}>
      <svg width="22" height="22" viewBox="0 0 22 22"><path d="M4 4L18 18M18 4L4 18" stroke={BRUTE.text} strokeWidth="2.2" strokeLinecap="round"/></svg>
    </button>
  );
}

// ─── Modal sheet (bottom, 70% height) ──────────────────────────────────────
function Sheet({ open, onClose, title, children, height = '75%', tone = 'paper' }) {
  if (!open) return null;
  const bg = tone === 'paper' ? BRUTE.surface : BRUTE.bg;
  const fg = BRUTE.text;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.35)',
        animation: 'bruteFade 160ms ease-out',
      }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height,
        background: bg, color: fg, borderRadius: '24px 24px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom)',
        animation: 'bruteSlideUp 200ms ease-out',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 -8px 24px rgba(10,10,10,0.12)',
      }}>
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 4, background: BRUTE.border, borderRadius: 2 }}/>
        </div>
        {title && (
          <div className="brute-display" style={{
            padding: '0 20px 12px', fontSize: 26, letterSpacing: '0.02em',
          }}>{title}</div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 20px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Numeric stepper (±2.5 kg) ──────────────────────────────────────────────
function Stepper({ value, onChange, min = 0, max = 500, step = 2.5, onHaptic, unit = 'кг', big = false }) {
  const bump = (delta) => {
    const v = Math.min(max, Math.max(min, Math.round((value + delta) / step) * step));
    if (v !== value) { onChange(v); onHaptic && onHaptic(); }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => bump(-step)} className="brute-press brute-no-select"
        style={stepBtnStyle}>−</button>
      <div className="brute-mono" style={{
        flex: 1, textAlign: 'center', color: BRUTE.text,
        fontSize: big ? 44 : 28, fontWeight: 700, letterSpacing: '-0.02em',
      }}>{value}<span style={{ color: BRUTE.textFaint, fontSize: big ? 18 : 13, marginLeft: 6 }}>{unit}</span></div>
      <button onClick={() => bump(step)} className="brute-press brute-no-select"
        style={stepBtnStyle}>+</button>
    </div>
  );
}
const stepBtnStyle = {
  width: 48, height: 48, borderRadius: 12,
  background: 'transparent', border: `1px solid ${BRUTE.border}`,
  color: BRUTE.text, fontFamily: "'Bebas Neue', Impact", fontSize: 28, fontWeight: 700,
  cursor: 'pointer',
};

// ─── RPE picker ────────────────────────────────────────────────────────────
function RPEPicker({ value, onChange }) {
  const LABELS = {
    6:  'лёгко, быстрая штанга',
    7:  'умеренно, 3 в запасе',
    8:  'тяжело, 2 в запасе',
    9:  'почти макс, 1 в запасе',
    10: 'максимум, 0 в запасе',
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[6,7,8,9,10].map((n) => (
          <button key={n} onClick={() => onChange(n)}
            style={{
              flex: 1, aspectRatio: 1, border: 0, cursor: 'pointer',
              background: value === n ? BRUTE.blood : BRUTE.surfaceAlt,
              color: BRUTE.text, borderRadius: 10,
              fontFamily: "'Bebas Neue', Impact", fontSize: 28, fontWeight: 700,
            }}>{n}</button>
        ))}
      </div>
      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 10, textAlign: 'center' }}>
        {value != null ? `RPE ${value} — ${LABELS[value]}` : 'ВЫБЕРИ ОЦЕНКУ'}
      </div>
    </div>
  );
}

// ─── Plate calculator ──────────────────────────────────────────────────────
// Given target kg and bar weight, returns per-side plate stack (from heaviest).
function computePlates(totalKg, barKg = 20) {
  const perSide = (totalKg - barKg) / 2;
  if (perSide <= 0) return { impossible: true };
  const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  let remain = perSide;
  const out = [];
  for (const p of PLATES) {
    while (remain + 0.001 >= p) {
      out.push(p);
      remain -= p;
    }
  }
  return { perSide, stack: out, leftover: Math.round(remain * 100) / 100 };
}

function PlateCalc({ targetKg, barKg = 20, onBarChange }) {
  const res = computePlates(targetKg, barKg);
  return (
    <div>
      <div className="brute-caption" style={{ color: BRUTE.textFaint }}>ЦЕЛЬ</div>
      <div className="brute-mono" style={{ fontSize: 40, color: BRUTE.text, fontWeight: 700 }}>
        {targetKg}<span style={{ color: BRUTE.textFaint, fontSize: 18, marginLeft: 8 }}>КГ</span>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {[20, 15].map((b) => (
          <button key={b} onClick={() => onBarChange && onBarChange(b)}
            style={{
              flex: 1, height: 44, border: 0,
              background: barKg === b ? BRUTE.blood : BRUTE.surfaceAlt,
              color: BRUTE.text, borderRadius: 8,
              fontFamily: "'Bebas Neue', Impact", fontSize: 18, cursor: 'pointer',
            }}>ГРИФ {b}КГ</button>
        ))}
      </div>

      <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 20 }}>
        НА КАЖДУЮ СТОРОНУ · {res.perSide || 0} КГ
      </div>

      {res.impossible ? (
        <div style={{ color: BRUTE.blood, marginTop: 10 }}>Меньше чем пустой гриф</div>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {res.stack.map((p, i) => (
            <div key={i} style={{
              background: BRUTE.blood, color: BRUTE.text,
              padding: '12px 10px', borderRadius: 4,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700,
              minWidth: 44, textAlign: 'center',
            }}>{p}</div>
          ))}
          {res.leftover > 0 && (
            <div style={{ color: BRUTE.textFaint, marginLeft: 8, alignSelf: 'center' }}>
              + {res.leftover} кг не хватает
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Rest timer ring (circular brushstroke) ─────────────────────────────────
function RestTimerRing({ seconds, total, color = BRUTE.blood }) {
  const R = 72;
  const C = 2 * Math.PI * R;
  // Progress = remaining time / total. Ring starts FULL and drains to 0.
  const pct = Math.max(0, Math.min(1, seconds / Math.max(1, total)));
  const offset = C * (1 - pct);
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div style={{ position: 'relative', width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={R} fill="none" stroke={BRUTE.border} strokeWidth="10"/>
        <circle cx="90" cy="90" r={R} fill="none" stroke={color}
          strokeWidth="10" strokeLinecap="butt"
          strokeDasharray={`${C}`} strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 800ms linear' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      }}>
        <div className="brute-mono" style={{ fontSize: 42, color: BRUTE.text, fontWeight: 700 }}>
          {mm}:{ss}
        </div>
        <div className="brute-caption" style={{ color: BRUTE.textFaint, marginTop: 2 }}>ОТДЫХ</div>
      </div>
    </div>
  );
}

// ─── Live elapsed-seconds hook ─────────────────────────────────────────────
function useTicker(active, ms = 1000) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return tick;
}

// ─── Today ISO (recomputed daily) ──────────────────────────────────────────
function useTodayISO() {
  const [iso, setIso] = React.useState(dateToISO(new Date()));
  React.useEffect(() => {
    const check = () => setIso(dateToISO(new Date()));
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);
  return iso;
}

// ─── Stamped label (the "SET OF / SET №" style) ─────────────────────────────
function Stamp({ children, color = BRUTE.bruise, bg = 'transparent', size = 11 }) {
  return (
    <span className="brute-caption" style={{
      color, background: bg, padding: bg === 'transparent' ? 0 : '2px 6px',
      fontSize: size, letterSpacing: '0.08em',
    }}>{children}</span>
  );
}

Object.assign(window, {
  hapticLight, hapticMedium, hapticHeavy, hapticTriple,
  soundSetLogged, soundRestEnd, soundPR,
  PhoneScreen, ScrollArea, TopBar, BackButton, CloseXButton, Sheet,
  Stepper, RPEPicker, computePlates, PlateCalc,
  RestTimerRing, useTicker, useTodayISO, Stamp,
});
