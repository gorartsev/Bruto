// BRUTE — design tokens, brush SVGs, halftone utilities
// Punk tattoo-zine aesthetic. No gradients, no glass blur, no bouncy springs.

const BRUTE = {
  // Raw palette (kept for backward compat)
  ink:    '#0A0A0A',
  bone:   '#F4ECD8',
  blood:  '#B3121A',
  paper:  '#FFFFFF',
  smoke:  '#2A2A2A',
  ash:    '#6B6B6B',
  bruise: '#4A1518',
  orange: '#E85C2C',

  // ─── Light-theme semantic tokens ───
  // Page bg = bone (warm cream), card surface = paper white, text = ink.
  bg:         '#F4ECD8',
  surface:    '#FFFFFF',
  surfaceAlt: '#EBE2CB',     // chip / secondary fill
  text:       '#0A0A0A',
  textMuted:  '#2A2A2A',
  textFaint:  '#6B6B6B',
  accent:     '#B3121A',     // alias for blood
  border:     'rgba(10,10,10,0.14)',
  separator:  'rgba(10,10,10,0.08)',
};

// ─── Brushstroke SVG library ────────────────────────────────────────────────
// Six hand-authored irregular shapes. Each is a closed path with dry-brush
// tapered ends. Use <Brush variant="..." color="..." /> as a background.

const BRUSH_PATHS = {
  // Wide button shape — tapered left, heavy bleed right
  slab: "M8,18 C40,8 90,6 180,9 C260,12 340,7 410,11 C430,12 445,15 450,22 C452,30 448,40 435,44 C360,50 250,52 160,49 C100,47 45,48 18,44 C6,42 2,36 4,28 C5,24 6,20 8,18 Z",
  // Narrow CTA — more ragged
  dash: "M6,14 C30,8 80,6 140,9 C180,11 220,8 260,11 C275,13 282,18 280,26 C278,32 270,36 255,38 C200,42 130,42 70,40 C40,39 18,38 8,34 C1,32 -1,25 3,20 C4,17 5,15 6,14 Z",
  // Splat — chaotic blob for PR moments
  splat: "M60,20 C40,15 20,25 15,45 C10,70 15,100 35,115 C20,125 18,145 35,155 C55,168 85,165 105,155 C135,170 175,168 195,150 C215,135 220,110 210,90 C225,75 225,50 210,35 C195,22 170,18 150,28 C130,10 90,8 60,20 Z",
  // Horizontal rough rule — section divider
  rule: "M2,8 C40,4 80,10 140,6 C200,2 260,10 320,7 C360,5 400,9 438,6 C445,6 448,9 446,12 C444,15 440,16 430,15 C380,13 310,17 240,14 C160,11 80,15 18,13 C8,13 2,12 2,10 Z",
  // Underline — wobbly
  underline: "M4,6 C30,2 70,8 120,5 C170,2 220,7 270,4 C280,4 286,6 284,9 C282,12 275,13 260,12 C200,10 140,13 80,11 C40,10 12,12 4,10 C1,9 1,7 4,6 Z",
  // Thick circular progress stroke segment (flat ring)
  ringArc: "M10,30 C10,15 25,2 50,2 C75,2 90,15 90,30", // decorative, not used for true arcs
  // Flame — wide flat with ink bleed
  flame: "M50,8 C45,20 35,28 30,42 C25,55 28,70 40,78 C32,82 28,92 36,100 C45,108 62,108 72,100 C82,92 82,82 74,78 C85,72 90,58 84,46 C78,35 68,32 62,22 C58,15 55,10 50,8 Z",
  // Tombstone — simple arched rectangle for phase-complete
  tomb: "M20,95 L20,40 C20,20 35,6 50,6 C65,6 80,20 80,40 L80,95 Z",
};

function Brush({ variant = 'slab', color = BRUTE.blood, style = {}, className, paintIn = false, delay = 0 }) {
  const d = BRUSH_PATHS[variant];
  const vb = variant === 'splat' ? '0 0 225 180'
          : variant === 'flame' ? '0 0 110 115'
          : variant === 'tomb'  ? '0 0 100 100'
          : variant === 'rule'  ? '0 0 450 20'
          : variant === 'dash'  ? '0 0 285 46'
          : variant === 'underline' ? '0 0 290 16'
          : '0 0 460 56';
  return (
    <svg viewBox={vb} preserveAspectRatio="none" className={className}
         style={{ display: 'block', ...style }}>
      <path d={d} fill={color}
            style={paintIn ? {
              strokeDasharray: 2000, strokeDashoffset: 2000,
              stroke: color, strokeWidth: 2, fill: color,
              animation: `brutePaint 420ms ${delay}ms ease-out forwards`,
            } : undefined} />
    </svg>
  );
}

// Pure-CSS halftone dot texture. Intensity: 0=off, 1=subtle, 2=medium, 3=loud.
function halftoneBg(color = '#000', intensity = 2) {
  if (intensity <= 0) return 'none';
  const op = [0, 0.06, 0.12, 0.2][Math.min(3, intensity)];
  const size = [0, 10, 8, 6][Math.min(3, intensity)];
  return `radial-gradient(circle at 1px 1px, ${color}${Math.round(op*255).toString(16).padStart(2,'0')} 1px, transparent 1.5px) 0 0 / ${size}px ${size}px`;
}

// Paper-grain noise via CSS (a tiny inline SVG tile)
const PAPER_NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.04 0 0 0 0 0.04 0 0 0 0 0.03 0 0 0 0.5 0'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.35'/></svg>")`;

// Rough ink hatching for icons — 2.5pt stroke, imperfect curves
const INK_STROKE = { stroke: BRUTE.ink, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

// Global CSS: fonts, keyframes, resets
const BRUTE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

  .brute-display { font-family: 'Bebas Neue', 'Oswald', Impact, sans-serif; letter-spacing: -0.01em; }
  .brute-body    { font-family: 'Inter', -apple-system, system-ui, sans-serif; }
  .brute-mono    { font-family: 'JetBrains Mono', 'SF Mono', Menlo, monospace; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum'; }
  .brute-caption { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }

  @keyframes brutePaint { to { stroke-dashoffset: 0; } }
  @keyframes bruteStamp {
    0%   { transform: scale(1.6) rotate(-8deg); opacity: 0; }
    60%  { transform: scale(0.95) rotate(1deg);  opacity: 1; }
    100% { transform: scale(1) rotate(0deg);     opacity: 1; }
  }
  @keyframes bruteBleed {
    0%   { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }
  @keyframes brutePulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.04); }
  }
  @keyframes brutePressDown {
    0%   { transform: scale(1); }
    50%  { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  .brute-press:active { animation: brutePressDown 80ms ease-out; }
  .brute-no-select { user-select: none; -webkit-user-select: none; }

  /* hide scrollbars app-wide (Safari-on-iOS already hides; this is for preview/Chrome) */
  ::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
  * { scrollbar-width: none; }

  @keyframes bruteFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes bruteSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  /* ── Exercise animations — loop the rep ──
     Target duration ~1.6-2.2s. Pause at top + bottom with cubic-bezier ease. */
  @keyframes brute-rep-v {  /* vertical up-down: squat, ohp, pullup, dip */
    0%, 100% { transform: translateY(0); }
    45%, 55% { transform: translateY(14%); }
  }
  @keyframes brute-rep-v-up {  /* bottom-to-top: bench press (bar pushes up) */
    0%, 100% { transform: translateY(18%); }
    45%, 55% { transform: translateY(0); }
  }
  @keyframes brute-rep-hinge {  /* deadlift / RDL hinge motion */
    0%, 100% { transform: translateY(10%) scaleY(0.94); transform-origin: 50% 100%; }
    45%, 55% { transform: translateY(0) scaleY(1); }
  }
  @keyframes brute-rep-swing {  /* kettlebell swing arc */
    0%, 100% { transform: rotate(-24deg); transform-origin: 30% 50%; }
    50%      { transform: rotate(18deg);  transform-origin: 30% 50%; }
  }
  @keyframes brute-rep-pull-x {  /* horizontal pull: row, face pull */
    0%, 100% { transform: translateX(12%); }
    45%, 55% { transform: translateX(0); }
  }
  @keyframes brute-rep-spread {  /* band pull-apart: hands spread */
    0%, 100% { transform: scaleX(0.7); }
    45%, 55% { transform: scaleX(1); }
  }
  @keyframes brute-rep-hang {  /* gentle sway for hanging exercises */
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6%); }
  }
  @keyframes brute-rep-push {  /* ring push-up: body goes down + up horizontally */
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(8%); }
  }
  @keyframes brute-rep-wheel {  /* bike wheel spin */
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes brute-rep-walk {  /* subtle bob for carries */
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-3%); }
  }
  @keyframes brute-rep-plank {  /* nearly still, tiny tremor */
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-1.5%); }
  }
  @keyframes brute-rep-legraise {  /* hanging leg raise */
    0%, 100% { transform: rotate(0deg); transform-origin: 50% 40%; }
    45%, 55% { transform: rotate(-70deg); transform-origin: 50% 40%; }
  }

  [class^="ex-"] { transform-box: fill-box; transform-origin: center; }
  .ex-move   { animation: brute-rep-v 2s ease-in-out infinite; }
  .ex-press  { animation: brute-rep-v-up 2s ease-in-out infinite; }
  .ex-hinge  { animation: brute-rep-hinge 2.2s ease-in-out infinite; }
  .ex-swing  { animation: brute-rep-swing 1.8s ease-in-out infinite; }
  .ex-pullx  { animation: brute-rep-pull-x 1.8s ease-in-out infinite; }
  .ex-spread { animation: brute-rep-spread 2s ease-in-out infinite; }
  .ex-hang   { animation: brute-rep-hang 2.4s ease-in-out infinite; }
  .ex-push   { animation: brute-rep-push 1.8s ease-in-out infinite; }
  .ex-wheel  { animation: brute-rep-wheel 2.2s linear infinite; }
  .ex-walk   { animation: brute-rep-walk 1.2s ease-in-out infinite; }
  .ex-plank  { animation: brute-rep-plank 2.6s ease-in-out infinite; }
  .ex-legraise { animation: brute-rep-legraise 2.2s ease-in-out infinite; }

  /* Respect reduced-motion preference */
  @media (prefers-reduced-motion: reduce) {
    [class^="ex-"] { animation: none !important; }
  }
`;

Object.assign(window, { BRUTE, BRUSH_PATHS, Brush, halftoneBg, PAPER_NOISE, INK_STROKE, BRUTE_CSS });
