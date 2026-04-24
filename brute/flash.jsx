// BRUTE — flash illustrations (hand-authored SVG etchings)
// Restrained horror. Subjects from the spec: anatomical heart, skull, tombstone
// with lift name, fist + barbell, PR medallion. Black ink, 2.5pt stroke,
// imperfect curves, crosshatching for shading, no gradients.

function FlashSkull({ size = 160, color = '#0A0A0A' }) {
  const S = { stroke: color, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      {/* cranium */}
      <path d="M40,68 C38,40 55,22 80,22 C105,22 122,40 120,68 C120,78 118,86 114,94 L108,94 L108,110 L100,110 L100,120 L60,120 L60,110 L52,110 L52,94 L46,94 C42,86 40,78 40,68 Z" {...S}/>
      {/* eye sockets */}
      <ellipse cx="64" cy="72" rx="10" ry="12" fill={color}/>
      <ellipse cx="96" cy="72" rx="10" ry="12" fill={color}/>
      {/* nasal cavity */}
      <path d="M80,82 L76,96 L80,100 L84,96 Z" fill={color}/>
      {/* teeth */}
      <path d="M60,110 L62,120 M68,110 L68,120 M76,110 L76,120 M84,110 L84,120 M92,110 L92,120 M100,110 L98,120" {...S}/>
      <path d="M58,110 L102,110" {...S}/>
      {/* crosshatch shading right temple */}
      <path d="M104,50 L114,56 M106,56 L115,62 M108,62 L116,68" {...S} strokeWidth="1.2"/>
      {/* crack */}
      <path d="M72,26 L76,36 L72,44 L78,52" {...S} strokeWidth="1.5"/>
    </svg>
  );
}

function FlashHeart({ size = 160, color = '#0A0A0A', accent = '#B3121A' }) {
  const S = { stroke: color, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      {/* main heart body */}
      <path d="M80,130 C60,115 30,95 28,65 C28,48 42,36 58,40 C68,42 76,50 80,60 C84,50 92,42 102,40 C118,36 132,48 132,65 C130,95 100,115 80,130 Z" {...S} fill={accent} fillOpacity="0.15"/>
      {/* aorta */}
      <path d="M72,42 C68,30 74,18 82,16 C88,14 94,20 92,30" {...S}/>
      <path d="M88,42 C92,32 100,28 106,32" {...S}/>
      {/* vessels */}
      <path d="M60,54 C55,60 50,62 44,60 M64,62 C58,68 52,70 46,68 M100,54 C105,60 112,62 118,60 M98,62 C104,68 110,70 116,68" {...S} strokeWidth="1.5"/>
      {/* drip */}
      <path d="M80,130 L80,142 M80,148 L80,152" {...S}/>
      <circle cx="80" cy="156" r="3" fill={accent}/>
      {/* hatching */}
      <path d="M50,80 L58,86 M48,88 L56,94 M46,96 L54,102" {...S} strokeWidth="1" opacity="0.6"/>
    </svg>
  );
}

function FlashTombstone({ size = 160, color = '#0A0A0A', liftLabel = 'BENCH', topText = 'R.I.P.', subText = 'OLD 1RM' }) {
  const S = { stroke: color, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      {/* ground */}
      <path d="M10,140 C40,138 80,142 120,138 C140,136 150,140 152,142" {...S}/>
      <path d="M20,146 L22,150 M36,146 L38,150 M52,148 L54,152 M80,148 L82,152 M108,148 L110,152 M128,146 L130,150" {...S} strokeWidth="1.2"/>
      {/* stone */}
      <path d="M42,140 L42,60 C42,40 58,24 80,24 C102,24 118,40 118,60 L118,140 Z" {...S} fill={color} fillOpacity="0.06"/>
      {/* cross */}
      <path d="M80,38 L80,54 M72,46 L88,46" {...S} strokeWidth="2"/>
      {/* text bands */}
      <text x="80" y="82" textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="18" fill={color} letterSpacing="1">{topText}</text>
      <path d="M52,94 L108,94" {...S} strokeWidth="1.2"/>
      <text x="80" y="114" textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="20" fontWeight="700" fill={color} letterSpacing="1.5">{liftLabel}</text>
      <text x="80" y="130" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="8" fill={color} letterSpacing="2">{subText}</text>
      {/* crosshatch shading left side */}
      <path d="M46,80 L52,86 M46,90 L52,96 M46,100 L52,106 M46,110 L52,116" {...S} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

function FlashMedallion({ size = 180, lift = 'BENCH', weight = '100' }) {
  const S = { stroke: BRUTE.ink, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {/* outer belt buckle */}
      <path d="M20,60 L180,60 L180,140 L20,140 Z" {...S} fill={BRUTE.bone}/>
      {/* inner oval */}
      <ellipse cx="100" cy="100" rx="62" ry="36" {...S} fill={BRUTE.blood}/>
      <ellipse cx="100" cy="100" rx="58" ry="32" stroke={BRUTE.paper} strokeWidth="1" fill="none"/>
      {/* laurels left */}
      <path d="M42,96 C36,94 32,100 34,108 M42,104 C36,104 32,110 36,118 M46,112 C40,114 38,120 44,126" {...S} strokeWidth="1.5" stroke={BRUTE.ink}/>
      {/* laurels right */}
      <path d="M158,96 C164,94 168,100 166,108 M158,104 C164,104 168,110 164,118 M154,112 C160,114 162,120 156,126" {...S} strokeWidth="1.5" stroke={BRUTE.ink}/>
      {/* text */}
      <text x="100" y="94" textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="14" fill={BRUTE.paper} letterSpacing="3">NEW PR</text>
      <text x="100" y="116" textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="20" fontWeight="700" fill={BRUTE.paper} letterSpacing="2">{lift}</text>
      {/* stars */}
      <path d="M30,50 L33,56 L39,56 L34,60 L36,66 L30,62 L24,66 L26,60 L21,56 L27,56 Z" fill={BRUTE.ink}/>
      <path d="M170,50 L173,56 L179,56 L174,60 L176,66 L170,62 L164,66 L166,60 L161,56 L167,56 Z" fill={BRUTE.ink}/>
      <path d="M30,150 L33,156 L39,156 L34,160 L36,166 L30,162 L24,166 L26,160 L21,156 L27,156 Z" fill={BRUTE.ink}/>
      <path d="M170,150 L173,156 L179,156 L174,160 L176,166 L170,162 L164,166 L166,160 L161,156 L167,156 Z" fill={BRUTE.ink}/>
      {/* ribbon bottom */}
      <path d="M60,140 L60,160 L80,152 L100,160 L120,152 L140,160 L140,140" {...S} fill={BRUTE.ink} fillOpacity="0.9"/>
    </svg>
  );
}

function FlashBarbell({ size = 40, color = BRUTE.ink }) {
  const S = { stroke: color, strokeWidth: 2, fill: color, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {/* bar */}
      <rect x="4" y="18" width="32" height="4" {...S}/>
      {/* inner plates */}
      <rect x="8" y="12" width="3" height="16" {...S}/>
      <rect x="29" y="12" width="3" height="16" {...S}/>
      {/* outer plates */}
      <rect x="13" y="8" width="4" height="24" {...S}/>
      <rect x="23" y="8" width="4" height="24" {...S}/>
      {/* collars */}
      <rect x="18" y="16" width="1.5" height="8" {...S}/>
      <rect x="20.5" y="16" width="1.5" height="8" {...S}/>
    </svg>
  );
}

function FlashFlame({ size = 22, color = BRUTE.blood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 24">
      <path d="M11,2 C9,7 5,9 4,14 C3,19 6,22 11,22 C16,22 19,19 18,14 C17,11 15,10 14,6 C13,8 12,9 11,8 C10,6 10,4 11,2 Z"
            fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round"/>
      {/* hatch inside */}
      <path d="M8,16 L13,12 M9,18 L14,14" stroke={BRUTE.ink} strokeWidth="0.8" opacity="0.4"/>
    </svg>
  );
}

function FlashPlates({ size = 120 }) {
  const S = { stroke: BRUTE.ink, strokeWidth: 2, fill: 'none' };
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 200 120">
      {/* bar going through */}
      <rect x="0" y="54" width="200" height="8" fill={BRUTE.ink}/>
      {/* plates stacked in profile */}
      {[
        { x: 20, h: 90, w: 8, label: '20' },
        { x: 32, h: 78, w: 7, label: '15' },
        { x: 43, h: 70, w: 6, label: '10' },
        { x: 53, h: 60, w: 5, label: '5' },
        { x: 61, h: 48, w: 4, label: '2.5' },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={60 - p.h/2} width={p.w} height={p.h} fill={BRUTE.bone} {...S}/>
        </g>
      ))}
      {/* mirror right side */}
      {[
        { x: 172, h: 90, w: 8 },
        { x: 161, h: 78, w: 7 },
        { x: 151, h: 70, w: 6 },
        { x: 142, h: 60, w: 5 },
        { x: 135, h: 48, w: 4 },
      ].map((p, i) => (
        <rect key={i} x={p.x} y={60 - p.h/2} width={p.w} height={p.h} fill={BRUTE.bone} {...S}/>
      ))}
      {/* collars */}
      <rect x="70" y="52" width="4" height="12" fill={BRUTE.ink}/>
      <rect x="126" y="52" width="4" height="12" fill={BRUTE.ink}/>
    </svg>
  );
}

// Placeholder: used where a hand-drawn flash isn't ready yet
function FlashPlaceholder({ size = 120, label = 'FLASH', tone = 'ink' }) {
  const fg = tone === 'ink' ? BRUTE.bone : BRUTE.ink;
  const bg = tone === 'ink' ? BRUTE.ink  : BRUTE.bone;
  return (
    <div style={{
      width: size, height: size,
      background: bg, color: fg,
      border: `1.5px dashed ${fg}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1.5,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(45deg, transparent 0, transparent 6px, ${fg}22 6px, ${fg}22 7px)`,
      }}/>
      <span style={{ position: 'relative' }}>[{label}]</span>
    </div>
  );
}

Object.assign(window, {
  FlashSkull, FlashHeart, FlashTombstone, FlashMedallion,
  FlashBarbell, FlashFlame, FlashPlates, FlashPlaceholder,
});
