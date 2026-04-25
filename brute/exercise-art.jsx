// BRUTE — animated exercise icon library. Hand-drawn SVG + CSS @keyframes.
// Each SVG wraps its "moving" group in a <g className="ex-*"> picked up by
// keyframes defined in design-tokens BRUTE_CSS. Dispatcher = ExerciseArt.

function exStyle(color = '#0A0A0A') {
  return { stroke: color, strokeWidth: 3.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
}
const fillOf = (color) => ({ fill: color });

// ─── Big 4 ──────────────────────────────────────────────────────────────────
function ArtSquat({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <line x1="8" y1="94" x2="92" y2="94" {...S}/>
      <g className="ex-move">
        <line x1="12" y1="30" x2="88" y2="30" {...S}/>
        <rect x="8" y="25" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="84" y="25" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="16" y="22" width="6" height="16" {...fillOf(color)}/>
        <rect x="78" y="22" width="6" height="16" {...fillOf(color)}/>
        <circle cx="50" cy="22" r="6" {...S}/>
        <path d="M50 28 L50 48 M50 48 L38 70 L38 85 M50 48 L62 70 L62 85 M40 30 L50 40 L60 30" {...S}/>
      </g>
    </svg>
  );
}

function ArtBench({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* bench + body static */}
      <rect x="18" y="62" width="64" height="6" rx="1" {...fillOf(color)}/>
      <line x1="22" y1="68" x2="22" y2="82" {...S}/>
      <line x1="78" y1="68" x2="78" y2="82" {...S}/>
      <circle cx="24" cy="56" r="5" {...S}/>
      <path d="M30 58 L70 58 M70 58 L76 74 L72 82 M66 58 L72 74 L68 82" {...S}/>
      {/* bar+arms press up */}
      <g className="ex-press">
        <path d="M50 58 L50 38 M46 58 L46 38" {...S}/>
        <line x1="28" y1="32" x2="72" y2="32" {...S}/>
        <rect x="22" y="27" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="70" y="27" width="8" height="10" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtDeadlift({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="8" y1="94" x2="92" y2="94" {...S}/>
      <g className="ex-hinge">
        <circle cx="54" cy="22" r="6" {...S}/>
        <path d="M54 28 L42 52 M42 52 L40 80 M44 52 L52 80 M42 52 L36 70 M44 52 L56 70" {...S}/>
        <line x1="18" y1="85" x2="78" y2="85" {...S}/>
        <rect x="14" y="78" width="10" height="14" rx="1" {...fillOf(color)}/>
        <rect x="72" y="78" width="10" height="14" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtOHP({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* static body */}
      <circle cx="50" cy="38" r="6" {...S}/>
      <path d="M50 44 L50 74 M50 74 L42 92 M50 74 L58 92" {...S}/>
      {/* bar + arms go up */}
      <g className="ex-press">
        <path d="M46 44 L42 20 M54 44 L58 20" {...S}/>
        <line x1="20" y1="15" x2="80" y2="15" {...S}/>
        <rect x="14" y="10" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="78" y="10" width="8" height="10" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

// ─── Bench variants ─────────────────────────────────────────────────────────
function ArtPausedBench({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="18" y="62" width="64" height="6" rx="1" {...fillOf(color)}/>
      <line x1="22" y1="68" x2="22" y2="82" {...S}/>
      <line x1="78" y1="68" x2="78" y2="82" {...S}/>
      <circle cx="24" cy="56" r="5" {...S}/>
      <path d="M30 58 L70 58 M70 58 L76 74 M66 58 L72 74" {...S}/>
      {/* bar paused at chest — subtle up/down but slower + deeper pause */}
      <g className="ex-press" style={{ animationDuration: '3s' }}>
        <path d="M50 58 L50 38 M46 58 L46 38" {...S}/>
        <line x1="28" y1="32" x2="72" y2="32" {...S}/>
        <rect x="22" y="27" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="70" y="27" width="8" height="10" rx="1" {...fillOf(color)}/>
      </g>
      {/* PAUSE glyph */}
      <circle cx="86" cy="20" r="9" {...S}/>
      <line x1="83" y1="16" x2="83" y2="24" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="89" y1="16" x2="89" y2="24" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function ArtCloseGrip({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="18" y="62" width="64" height="6" rx="1" {...fillOf(color)}/>
      <line x1="22" y1="68" x2="22" y2="82" {...S}/>
      <line x1="78" y1="68" x2="78" y2="82" {...S}/>
      <circle cx="24" cy="56" r="5" {...S}/>
      <path d="M30 58 L70 58" {...S}/>
      <g className="ex-press">
        <path d="M54 58 L50 38 M50 58 L46 38" {...S}/>
        <line x1="34" y1="32" x2="66" y2="32" {...S}/>
        <rect x="28" y="27" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="64" y="27" width="8" height="10" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtFrontSquat({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="8" y1="94" x2="92" y2="94" {...S}/>
      <g className="ex-move">
        <circle cx="50" cy="22" r="6" {...S}/>
        <path d="M50 28 L50 48 M50 48 L38 70 L38 85 M50 48 L62 70 L62 85" {...S}/>
        <line x1="20" y1="35" x2="80" y2="35" {...S}/>
        <path d="M40 32 L54 38 M60 32 L46 38" {...S}/>
        <rect x="14" y="30" width="8" height="10" rx="1" {...fillOf(color)}/>
        <rect x="78" y="30" width="8" height="10" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtRDL({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="8" y1="94" x2="92" y2="94" {...S}/>
      <g className="ex-hinge">
        <circle cx="54" cy="26" r="6" {...S}/>
        <path d="M54 32 L44 56 M44 56 L44 86 M48 56 L54 86 M44 56 L38 68 M46 56 L58 68" {...S}/>
        <line x1="22" y1="68" x2="72" y2="68" {...S}/>
        <rect x="16" y="62" width="8" height="12" rx="1" {...fillOf(color)}/>
        <rect x="72" y="62" width="8" height="12" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

// ─── Pull-up family ─────────────────────────────────────────────────────────
function ArtPullup({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="12" y1="14" x2="88" y2="14" {...S}/>
      <line x1="12" y1="14" x2="12" y2="4" {...S}/>
      <line x1="88" y1="14" x2="88" y2="4" {...S}/>
      <g className="ex-move">
        <path d="M40 14 L40 34 M60 14 L60 34" {...S}/>
        <circle cx="50" cy="42" r="6" {...S}/>
        <path d="M50 48 L50 72 M50 72 L44 88 M50 72 L56 88" {...S}/>
      </g>
    </svg>
  );
}

function ArtChinup({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="12" y1="14" x2="88" y2="14" {...S}/>
      <line x1="12" y1="14" x2="12" y2="4" {...S}/>
      <line x1="88" y1="14" x2="88" y2="4" {...S}/>
      <g className="ex-move">
        <path d="M44 14 Q 40 24 46 34 M56 14 Q 60 24 54 34" {...S}/>
        <circle cx="50" cy="42" r="6" {...S}/>
        <path d="M50 48 L50 72 M50 72 L44 88 M50 72 L56 88" {...S}/>
      </g>
    </svg>
  );
}

// ─── Ring family ────────────────────────────────────────────────────────────
function ArtRingRow({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="70" y1="8" x2="70" y2="22" {...S}/>
      <circle cx="70" cy="27" r="5" {...S}/>
      <line x1="72" y1="32" x2="72" y2="46" {...S}/>
      <circle cx="72" cy="51" r="5" {...S}/>
      <line x1="10" y1="94" x2="90" y2="94" {...S}/>
      <g className="ex-pullx">
        <circle cx="18" cy="68" r="5" {...S}/>
        <path d="M24 68 L68 68 M68 68 L78 90 M68 68 L72 90 M58 66 L70 54 M60 68 L72 56" {...S}/>
      </g>
    </svg>
  );
}

function ArtRingDip({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="30" y1="6" x2="30" y2="28" {...S}/>
      <line x1="70" y1="6" x2="70" y2="28" {...S}/>
      <circle cx="30" cy="32" r="5" {...S}/>
      <circle cx="70" cy="32" r="5" {...S}/>
      <g className="ex-move">
        <circle cx="50" cy="34" r="5" {...S}/>
        <path d="M50 40 L50 72 M50 72 L44 90 M50 72 L56 90 M46 40 L34 36 M54 40 L66 36" {...S}/>
      </g>
    </svg>
  );
}

function ArtRingPushup({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="30" y1="6" x2="30" y2="48" {...S}/>
      <line x1="70" y1="6" x2="70" y2="48" {...S}/>
      <circle cx="30" cy="52" r="4" {...S}/>
      <circle cx="70" cy="52" r="4" {...S}/>
      <line x1="4" y1="82" x2="96" y2="82" {...S}/>
      <g className="ex-push">
        <circle cx="18" cy="58" r="5" {...S}/>
        <path d="M24 60 L76 60 M76 60 L82 78 M76 60 L86 78 M30 58 L30 56 M70 58 L70 56" {...S}/>
      </g>
    </svg>
  );
}

function ArtRingSupport({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="30" y1="6" x2="30" y2="28" {...S}/>
      <line x1="70" y1="6" x2="70" y2="28" {...S}/>
      <circle cx="30" cy="32" r="4" {...S}/>
      <circle cx="70" cy="32" r="4" {...S}/>
      <g className="ex-plank">
        <path d="M30 36 L30 46 M70 36 L70 46" {...S}/>
        <circle cx="50" cy="36" r="5" {...S}/>
        <path d="M50 42 L50 74 M30 46 L48 46 M70 46 L52 46 M50 74 L42 92 M50 74 L58 92" {...S}/>
      </g>
    </svg>
  );
}

// ─── Row family ─────────────────────────────────────────────────────────────
function ArtBBRow({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="16" y1="94" x2="84" y2="94" {...S}/>
      <circle cx="60" cy="26" r="6" {...S}/>
      <path d="M60 32 L48 56 M48 56 L44 86 M50 56 L58 86" {...S}/>
      <g className="ex-pullx">
        <path d="M48 56 L36 50 M50 56 L62 50" {...S}/>
        <line x1="20" y1="48" x2="78" y2="48" {...S}/>
        <rect x="14" y="42" width="8" height="12" rx="1" {...fillOf(color)}/>
        <rect x="78" y="42" width="8" height="12" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtDBRow({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="50" y1="72" x2="86" y2="72" {...S}/>
      <circle cx="38" cy="30" r="6" {...S}/>
      <path d="M38 36 L54 58 M54 58 L52 86 M54 58 L64 86" {...S}/>
      <path d="M38 36 L50 72" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="3 3"/>
      <g className="ex-pullx">
        <path d="M50 48 L38 58" {...S}/>
        <line x1="30" y1="58" x2="46" y2="58" {...S}/>
        <rect x="24" y="52" width="8" height="12" rx="1" {...fillOf(color)}/>
        <rect x="44" y="52" width="8" height="12" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtDBBench({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="18" y="62" width="64" height="6" rx="1" {...fillOf(color)}/>
      <line x1="22" y1="68" x2="22" y2="82" {...S}/>
      <line x1="78" y1="68" x2="78" y2="82" {...S}/>
      <circle cx="24" cy="56" r="5" {...S}/>
      <path d="M30 58 L70 58" {...S}/>
      <g className="ex-press">
        <path d="M42 58 L38 34 M58 58 L62 34" {...S}/>
        <line x1="30" y1="30" x2="46" y2="30" {...S}/>
        <line x1="54" y1="30" x2="70" y2="30" {...S}/>
        <rect x="26" y="26" width="6" height="8" {...fillOf(color)}/>
        <rect x="44" y="26" width="6" height="8" {...fillOf(color)}/>
        <rect x="50" y="26" width="6" height="8" {...fillOf(color)}/>
        <rect x="68" y="26" width="6" height="8" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

// ─── Band / cable ───────────────────────────────────────────────────────────
function ArtFacePull({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="12" cy="30" r="3" {...fillOf(color)}/>
      <circle cx="64" cy="30" r="6" {...S}/>
      <path d="M64 36 L64 70 M64 70 L56 90 M64 70 L72 90" {...S}/>
      <g className="ex-pullx">
        <path d="M14 30 Q 30 38 40 40 M14 30 Q 30 28 40 30" {...S}/>
        <path d="M58 38 L44 40 M60 32 L44 30" {...S}/>
      </g>
    </svg>
  );
}

function ArtPullApart({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="24" r="6" {...S}/>
      <path d="M50 30 L50 70 M50 70 L42 90 M50 70 L58 90" {...S}/>
      <g className="ex-spread">
        <path d="M46 36 L18 42 M54 36 L82 42" {...S}/>
        <path d="M18 40 Q 50 52 82 40 M18 42 Q 50 48 82 42" {...S}/>
      </g>
    </svg>
  );
}

// ─── KB / Carries ───────────────────────────────────────────────────────────
function ArtKBSwing({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <circle cx="34" cy="30" r="6" {...S}/>
      <path d="M34 36 L40 62 M40 62 L38 88 M42 62 L50 88" {...S}/>
      <g className="ex-swing">
        <path d="M36 42 L72 52 M38 44 L70 56" {...S}/>
        <path d="M70 46 L74 46 L74 52 Q 78 52 78 58 Q 78 68 70 68 Q 62 68 62 58 Q 62 52 66 52 L66 46 Z" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtGobletSquat({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="8" y1="94" x2="92" y2="94" {...S}/>
      <g className="ex-move">
        <circle cx="50" cy="22" r="6" {...S}/>
        <path d="M50 28 L50 50 M50 50 L38 72 L38 88 M50 50 L62 72 L62 88" {...S}/>
        <path d="M44 36 L46 48 M56 36 L54 48" {...S}/>
        <path d="M46 36 L54 36 L54 34 Q 58 34 58 30 Q 58 22 50 22 Q 42 22 42 30 Q 42 34 46 34 Z" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtTGU({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="10" y1="94" x2="90" y2="94" {...S}/>
      <circle cx="40" cy="34" r="6" {...S}/>
      <path d="M40 40 L38 62 M38 62 L28 88 M40 62 L54 80 L54 88" {...S}/>
      <g className="ex-press" style={{ transformOrigin: 'center bottom' }}>
        <path d="M40 40 L38 14" {...S}/>
        <path d="M30 10 L46 10 L46 14 Q 50 14 50 18 Q 50 22 42 22 Q 34 22 34 18 Q 34 14 30 14 Z" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtFarmerCarry({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <g className="ex-walk">
        <circle cx="50" cy="20" r="6" {...S}/>
        <path d="M50 26 L50 66 M50 66 L42 90 M50 66 L58 90 M44 34 L34 62 M56 34 L66 62" {...S}/>
        <rect x="24" y="60" width="20" height="8" rx="1" {...fillOf(color)}/>
        <rect x="56" y="60" width="20" height="8" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtSuitcaseCarry({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <g className="ex-walk">
        <circle cx="50" cy="20" r="6" {...S}/>
        <path d="M50 26 L50 66 M50 66 L42 90 M50 66 L58 90 M46 34 L44 52 M54 34 L70 62" {...S}/>
        <rect x="60" y="60" width="20" height="8" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtPlank({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="8" y1="86" x2="96" y2="86" {...S}/>
      <g className="ex-plank">
        <circle cx="18" cy="58" r="5" {...S}/>
        <path d="M24 60 L82 60 M14 74 L28 74 M22 60 L22 74 M82 60 L88 82 M82 60 L92 82" {...S}/>
      </g>
    </svg>
  );
}

function ArtHangingLeg({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="12" y1="12" x2="88" y2="12" {...S}/>
      <path d="M40 12 L40 30 M60 12 L60 30" {...S}/>
      <circle cx="50" cy="38" r="6" {...S}/>
      <path d="M50 44 L50 66" {...S}/>
      <g className="ex-legraise" style={{ transformOrigin: '50px 66px' }}>
        <path d="M50 66 L74 62 M50 66 L78 66" {...S}/>
      </g>
    </svg>
  );
}

function ArtProwler({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="8" y1="88" x2="92" y2="88" {...S}/>
      <g className="ex-walk">
        <path d="M18 72 L82 72 L78 84 L22 84 Z" {...S}/>
        <line x1="28" y1="72" x2="28" y2="48" {...S}/>
        <line x1="72" y1="72" x2="72" y2="48" {...S}/>
        <line x1="28" y1="48" x2="72" y2="48" {...S}/>
        <circle cx="50" cy="22" r="6" {...S}/>
        <path d="M50 28 L50 48 M50 48 L40 44 M50 48 L60 44" {...S}/>
      </g>
    </svg>
  );
}

function ArtBike({ color }) {
  const S = exStyle(color);
  const spokes = (cx, cy) => (
    <g className="ex-wheel" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} {...S}/>
      <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} {...S}/>
      <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} {...S}/>
      <line x1={cx - 10} y1={cy + 10} x2={cx + 10} y2={cy - 10} {...S}/>
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {spokes(28, 68)}
      {spokes(74, 68)}
      <circle cx="28" cy="68" r="16" {...S}/>
      <circle cx="74" cy="68" r="16" {...S}/>
      <line x1="28" y1="68" x2="50" y2="50" {...S}/>
      <line x1="50" y1="50" x2="74" y2="68" {...S}/>
      <line x1="50" y1="50" x2="60" y2="28" {...S}/>
      <line x1="52" y1="28" x2="68" y2="28" {...S}/>
      <circle cx="50" cy="50" r="3" {...fillOf(color)}/>
    </svg>
  );
}

// ─── Curl family (dumbbell biceps work) ─────────────────────────────────────
function ArtDBCurl({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <circle cx="50" cy="22" r="6" {...S}/>
      <path d="M50 28 L50 66 M50 66 L42 90 M50 66 L58 90" {...S}/>
      <g className="ex-press" style={{ transformOrigin: 'center bottom' }}>
        {/* upper arms static, forearms curl up */}
        <path d="M44 36 L42 56" {...S}/>
        <path d="M42 56 L52 38" {...S}/>
        <path d="M56 36 L58 56" {...S}/>
        <path d="M58 56 L48 38" {...S}/>
        {/* dumbbells at wrists (top-of-curl pose) */}
        <line x1="44" y1="34" x2="56" y2="34" {...S}/>
        <rect x="40" y="30" width="6" height="8" rx="1" {...fillOf(color)}/>
        <rect x="54" y="30" width="6" height="8" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtHammerCurl({ color }) {
  // Same body, dumbbells held vertically (neutral grip)
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <circle cx="50" cy="22" r="6" {...S}/>
      <path d="M50 28 L50 66 M50 66 L42 90 M50 66 L58 90" {...S}/>
      <g className="ex-press" style={{ transformOrigin: 'center bottom' }}>
        <path d="M44 36 L40 56 L42 38" {...S}/>
        <path d="M56 36 L60 56 L58 38" {...S}/>
        {/* vertical dumbbells */}
        <rect x="38" y="30" width="6" height="14" rx="1" {...fillOf(color)}/>
        <rect x="56" y="30" width="6" height="14" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtZottmanCurl({ color }) {
  // Curl with rotating wrist — show one arm pronated, one supinated
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <circle cx="50" cy="22" r="6" {...S}/>
      <path d="M50 28 L50 66 M50 66 L42 90 M50 66 L58 90" {...S}/>
      <g className="ex-press" style={{ transformOrigin: 'center bottom' }}>
        <path d="M44 36 L40 56" {...S}/>
        <path d="M40 56 L52 40" {...S}/>
        <path d="M56 36 L60 56" {...S}/>
        <path d="M60 56 L48 36" {...S}/>
        <line x1="44" y1="36" x2="56" y2="36" {...S}/>
        <rect x="40" y="32" width="6" height="8" rx="1" {...fillOf(color)}/>
        <rect x="54" y="32" width="6" height="8" rx="1" {...fillOf(color)}/>
        {/* rotation arrow */}
        <path d="M50 24 q 8 -2 6 6" {...S}/>
        <path d="M54 32 L56 30 L58 32" {...S}/>
      </g>
    </svg>
  );
}

// ─── Triceps / forearm finishers ────────────────────────────────────────────
function ArtSkullCrusher({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* bench */}
      <rect x="18" y="62" width="64" height="6" rx="1" {...fillOf(color)}/>
      <line x1="22" y1="68" x2="22" y2="82" {...S}/>
      <line x1="78" y1="68" x2="78" y2="82" {...S}/>
      {/* lying */}
      <circle cx="24" cy="56" r="5" {...S}/>
      <path d="M30 58 L70 58 M70 58 L76 74 M66 58 L72 74" {...S}/>
      {/* upper arms static vertical, forearms move (animation pivot at elbow) */}
      <path d="M50 58 L50 38" {...S}/>
      <path d="M46 58 L46 38" {...S}/>
      <g className="ex-press" style={{ transformOrigin: '48px 38px' }}>
        <path d="M50 38 L40 26" {...S}/>
        <path d="M46 38 L36 26" {...S}/>
        <line x1="32" y1="22" x2="44" y2="22" {...S}/>
        <rect x="28" y="18" width="6" height="8" rx="1" {...fillOf(color)}/>
        <rect x="42" y="18" width="6" height="8" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtReverseCurl({ color }) {
  // Pronated grip (palms down) curl with barbell
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <circle cx="50" cy="22" r="6" {...S}/>
      <path d="M50 28 L50 66 M50 66 L42 90 M50 66 L58 90" {...S}/>
      <g className="ex-press" style={{ transformOrigin: 'center bottom' }}>
        {/* arms forearms curl up */}
        <path d="M44 36 L42 56 L46 38" {...S}/>
        <path d="M56 36 L58 56 L54 38" {...S}/>
        {/* barbell — pronated grip (knuckles up) */}
        <line x1="22" y1="36" x2="78" y2="36" {...S}/>
        <rect x="16" y="30" width="6" height="14" {...fillOf(color)}/>
        <rect x="78" y="30" width="6" height="14" {...fillOf(color)}/>
        {/* knuckle dots above bar */}
        <circle cx="44" cy="34" r="1.5" fill={color}/>
        <circle cx="56" cy="34" r="1.5" fill={color}/>
      </g>
    </svg>
  );
}

function ArtReverseFly({ color }) {
  // Bent over, arms wide like wings
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="14" y1="94" x2="86" y2="94" {...S}/>
      <circle cx="50" cy="34" r="6" {...S}/>
      <path d="M50 40 L50 60" {...S}/>
      <path d="M50 60 L42 88" {...S}/>
      <path d="M50 60 L58 88" {...S}/>
      <g className="ex-spread" style={{ transformOrigin: '50px 50px' }}>
        {/* arms out wide with DBs */}
        <path d="M48 46 L20 50" {...S}/>
        <path d="M52 46 L80 50" {...S}/>
        <rect x="10" y="46" width="14" height="8" rx="1" {...fillOf(color)}/>
        <rect x="76" y="46" width="14" height="8" rx="1" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

function ArtBearCrawl({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <line x1="6" y1="84" x2="94" y2="84" {...S}/>
      <g className="ex-walk">
        {/* head + horizontal back */}
        <circle cx="20" cy="50" r="6" {...S}/>
        <path d="M26 52 L78 50" {...S}/>
        {/* front arms (planted) */}
        <path d="M28 52 L30 78" {...S}/>
        <path d="M34 52 L40 78" {...S}/>
        {/* rear legs (knees off ground) */}
        <path d="M70 50 L60 78" {...S}/>
        <path d="M76 50 L78 78" {...S}/>
        {/* motion lines behind */}
        <path d="M82 60 L92 60 M82 66 L96 66" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ─── Placeholder ────────────────────────────────────────────────────────────
function ArtPlaceholder({ color }) {
  const S = exStyle(color);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <g className="ex-press">
        <line x1="12" y1="56" x2="88" y2="56" {...S}/>
        <rect x="6" y="48" width="10" height="16" rx="1" {...fillOf(color)}/>
        <rect x="84" y="48" width="10" height="16" rx="1" {...fillOf(color)}/>
        <rect x="18" y="44" width="6" height="24" {...fillOf(color)}/>
        <rect x="76" y="44" width="6" height="24" {...fillOf(color)}/>
      </g>
    </svg>
  );
}

const ART_MAP = {
  squat:          ArtSquat,
  bench:          ArtBench,
  deadlift:       ArtDeadlift,
  ohp:            ArtOHP,
  pausedBench:    ArtPausedBench,
  closeGrip:      ArtCloseGrip,
  frontSquat:     ArtFrontSquat,
  rdl:            ArtRDL,
  pullup:         ArtPullup,
  chinup:         ArtChinup,
  ringRow:        ArtRingRow,
  ringDip:        ArtRingDip,
  ringPushup:     ArtRingPushup,
  ringSupport:    ArtRingSupport,
  bbRow:          ArtBBRow,
  dbRow:          ArtDBRow,
  dbBench:        ArtDBBench,
  facePull:       ArtFacePull,
  pullApart:      ArtPullApart,
  kbSwing:        ArtKBSwing,
  gobletSquat:    ArtGobletSquat,
  tgu:            ArtTGU,
  farmerCarry:    ArtFarmerCarry,
  suitcaseCarry:  ArtSuitcaseCarry,
  plank:          ArtPlank,
  hangingLeg:     ArtHangingLeg,
  prowler:        ArtProwler,
  bikeZ2:         ArtBike,
  bearCrawl:      ArtBearCrawl,
  // ── New finisher art (v4) ──
  dbCurl:         ArtDBCurl,
  hammerCurl:     ArtHammerCurl,
  zottmanCurl:    ArtZottmanCurl,
  skullCrusher:   ArtSkullCrusher,
  reverseCurl:    ArtReverseCurl,
  reverseFly:     ArtReverseFly,
  ringFacePull:   ArtFacePull,
};

function ExerciseArt({ exerciseKey, size = 48, color = BRUTE.ink, bg = null, rounded = true, pad = 0 }) {
  const Comp = ART_MAP[exerciseKey] || ArtPlaceholder;
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: bg || 'transparent',
      borderRadius: rounded ? Math.round(size * 0.18) : 0,
      padding: pad, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Comp color={color}/>
    </div>
  );
}

Object.assign(window, { ExerciseArt, ART_MAP });
