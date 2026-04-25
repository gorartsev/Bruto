// BRUTE — shared UI primitives: BrushButton, Card, Divider, RepCells, etc.

function BrushButton({ children, onClick, variant = 'slab', color = BRUTE.blood, textColor = BRUTE.paper, width = '100%', height = 56, fontSize = 26, disabled = false, style = {} }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className="brute-press brute-no-select"
      style={{
        position: 'relative', width, height,
        border: 0, background: 'transparent', padding: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}>
      <Brush variant={variant} color={color}
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <span className="brute-display" style={{
        position: 'relative', color: textColor,
        fontSize, letterSpacing: '0.02em', lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: '0 12px',
      }}>{children}</span>
    </button>
  );
}

function BruteDivider({ color = BRUTE.ink, width = '100%', opacity = 1 }) {
  return (
    <div style={{ width, height: 14, opacity }}>
      <Brush variant="rule" color={color} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

function BruteCard({ tone = 'bone', children, style = {}, grit = 2, padding = 20, radius = 24 }) {
  // In light theme: bone tone = primary cream card; ink/smoke tones map to white/alt cards.
  const bg = tone === 'bone' ? BRUTE.surface
           : tone === 'ink'  ? BRUTE.bone
                             : BRUTE.surfaceAlt;
  const fg = BRUTE.text;
  return (
    <div style={{
      background: bg, color: fg,
      borderRadius: radius, padding,
      position: 'relative', overflow: 'hidden',
      border: tone === 'bone' ? `1px solid ${BRUTE.separator}` : 'none',
      ...style,
    }}>
      {grit > 0 && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: halftoneBg('#000', grit === 3 ? 2 : 1),
          opacity: 0.4,
          mixBlendMode: 'multiply',
        }} />
      )}
      {grit >= 2 && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: PAPER_NOISE,
          mixBlendMode: 'multiply',
        }}/>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// Rep cells — tap to complete a rep. Completed = filled with red brush.
function RepCells({ target, completed, onTap, color = BRUTE.blood }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {Array.from({ length: target }).map((_, i) => {
        const done = i < completed;
        return (
          <button key={i} onClick={() => onTap(i)}
            className="brute-press brute-no-select"
            style={{
              position: 'relative', flex: 1, aspectRatio: '1',
              background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
            }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: `2px solid ${BRUTE.ink}`,
              borderRadius: 8,
              background: done ? 'transparent' : BRUTE.bone,
            }}/>
            {done && (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                   style={{ position: 'absolute', inset: 2, width: 'calc(100% - 4px)', height: 'calc(100% - 4px)',
                            animation: 'bruteBleed 180ms ease-out forwards' }}>
                <path d="M6,14 C25,6 55,8 80,10 C88,11 94,18 93,30 C92,50 95,70 90,82 C88,89 78,92 60,90 C40,88 20,92 10,85 C4,80 5,65 7,50 C8,35 4,22 6,14 Z"
                      fill={color}/>
              </svg>
            )}
            <span className="brute-mono" style={{
              position: 'relative',
              color: done ? BRUTE.paper : BRUTE.ink,
              fontSize: 18, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%',
            }}>{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}

// Drum-roll weight picker — vertical, tactile, haptic ticks every 2.5kg
function WeightDrum({ value, onChange, min = 20, max = 300, step = 2.5, onHaptic }) {
  const listRef = React.useRef(null);
  const isDragging = React.useRef(false);
  const ITEM_H = 44;

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const target = ((value - min) / step) * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target;
  }, [value, min, step]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const v = min + idx * step;
    if (v !== value) {
      onChange(v);
      onHaptic && onHaptic();
    }
  };

  const count = Math.round((max - min) / step) + 1;
  const items = Array.from({ length: count }, (_, i) => min + i * step);

  return (
    <div style={{
      position: 'relative', width: 140, height: ITEM_H * 3,
      background: BRUTE.surface, borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${BRUTE.border}`,
    }}>
      {/* center highlight band */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: ITEM_H, height: ITEM_H,
        borderTop: `1px solid ${BRUTE.blood}`,
        borderBottom: `1px solid ${BRUTE.blood}`,
        pointerEvents: 'none', zIndex: 2,
      }}/>
      {/* fade mask */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: `linear-gradient(to bottom, ${BRUTE.surface} 0%, transparent 30%, transparent 70%, ${BRUTE.surface} 100%)`,
      }}/>
      <div ref={listRef} onScroll={onScroll}
           style={{
             height: '100%', overflowY: 'scroll',
             scrollSnapType: 'y mandatory',
             scrollbarWidth: 'none',
           }}>
        <style>{`.drumList::-webkit-scrollbar{display:none}`}</style>
        <div style={{ height: ITEM_H }}/>
        {items.map((v) => (
          <div key={v} className="brute-mono" style={{
            height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
            scrollSnapAlign: 'center',
            color: v === value ? BRUTE.text : BRUTE.textFaint,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: v === value ? 28 : 18,
            fontWeight: v === value ? 700 : 400,
            transition: 'color 80ms, font-size 80ms',
          }}>
            {v}
          </div>
        ))}
        <div style={{ height: ITEM_H }}/>
      </div>
    </div>
  );
}

// Streak flame + number
function StreakBadge({ count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <FlashFlame size={22} color={BRUTE.blood}/>
      <span className="brute-display" style={{ fontSize: 24, color: BRUTE.text, letterSpacing: 0 }}>{count}</span>
    </div>
  );
}

// Bottom tab bar
function BruteTabBar({ active = 'today', onChange }) {
  const tabs = [
    { id: 'today',   label: 'ДЕНЬ' },
    { id: 'program', label: 'ПРОГ.' },
    { id: 'log',     label: 'ЖУРН.' },
    { id: 'days',    label: 'ДНИ' },
    { id: 'stats',   label: 'СТАТС' },
    { id: 'profile', label: 'ПРОФ.' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: BRUTE.surface,
      paddingTop: 10, paddingBottom: 34,
      borderTop: `1px solid ${BRUTE.separator}`,
      display: 'flex', justifyContent: 'space-around',
      zIndex: 40,
    }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange && onChange(t.id)}
            style={{
              background: 'transparent', border: 0, padding: '6px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer', position: 'relative', minWidth: 52,
            }}>
            <TabIcon id={t.id} active={isActive} />
            <span className="brute-caption" style={{
              color: isActive ? BRUTE.text : BRUTE.textFaint,
              fontSize: 9, marginTop: 3,
            }}>{t.label}</span>
            {isActive && (
              <div style={{ position: 'absolute', bottom: -2, width: 24, height: 6 }}>
                <Brush variant="underline" color={BRUTE.blood}
                       style={{ width: '100%', height: '100%' }}/>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TabIcon({ id, active }) {
  const c = active ? BRUTE.text : BRUTE.textFaint;
  const S = { stroke: c, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const size = 22;
  if (id === 'today') {
    return <svg width={size} height={size} viewBox="0 0 22 22"><rect x="3" y="5" width="16" height="14" {...S}/><path d="M7 3v4M15 3v4M3 10h16" {...S}/><rect x="7" y="13" width="4" height="3" fill={c} stroke="none"/></svg>;
  }
  if (id === 'program') {
    return <svg width={size} height={size} viewBox="0 0 22 22"><rect x="3" y="4" width="16" height="15" {...S}/><path d="M3 9h16M8 9v10M14 9v10" {...S}/></svg>;
  }
  if (id === 'log') {
    return <svg width={size} height={size} viewBox="0 0 22 22"><path d="M4 4h14v14H4zM7 8h8M7 11h8M7 14h5" {...S}/></svg>;
  }
  if (id === 'days') {
    return <svg width={size} height={size} viewBox="0 0 22 22"><circle cx="11" cy="11" r="7" {...S}/><circle cx="8" cy="9" r="0.8" fill={c}/><circle cx="14" cy="9" r="0.8" fill={c}/><path d="M8 14 Q 11 16 14 14" {...S}/></svg>;
  }
  if (id === 'stats') {
    return <svg width={size} height={size} viewBox="0 0 22 22"><path d="M3 18L8 12L12 15L19 5" {...S}/><circle cx="19" cy="5" r="2" fill={c} stroke="none"/></svg>;
  }
  return <svg width={size} height={size} viewBox="0 0 22 22"><circle cx="11" cy="8" r="4" {...S}/><path d="M3 19c0-4 4-6 8-6s8 2 8 6" {...S}/></svg>;
}

// Section elapsed timer display
function SessionTimer({ seconds }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <span className="brute-mono" style={{ color: BRUTE.ash, fontSize: 13 }}>{mm}:{ss}</span>
  );
}

Object.assign(window, {
  BrushButton, BruteDivider, BruteCard, RepCells, WeightDrum,
  StreakBadge, BruteTabBar, TabIcon, SessionTimer,
});
