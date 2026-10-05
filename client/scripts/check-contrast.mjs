// client/scripts/check-contrast.mjs
// Calculates relative luminance and contrast ratio according to WCAG 2.1 specifications.

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const PALETTES = {
  light: {
    background: '#fffce1',
    foreground: '#0e100f',
    card: '#f4f0d0',
    cardForeground: '#0e100f',
    mutedForeground: '#4a4a3c',
    border: '#96916b',
    primary: '#0e100f',
    primaryForeground: '#fffce1',
    destructive: '#a61f1f',
    ring: '#0e100f',
    categorySources: '#006f90',
    categoryChat: '#0a7a29',
    categoryArtifacts: '#b34f00',
    categoryMemories: '#a3158f',
    categoryWorkspaces: '#4f44c4',
    statusPending: '#4a4a3c',
    statusProcessing: '#8a6100',
    statusReady: '#0a7a29',
    statusFailed: '#a61f1f',
  },
  dark: {
    background: '#0e100f',
    foreground: '#fffce1',
    card: '#191919',
    cardForeground: '#fffce1',
    mutedForeground: '#a8a898',
    border: '#60615a',
    primary: '#fffce1',
    primaryForeground: '#0e100f',
    destructive: '#e05a5a',
    ring: '#fffce1',
    categorySources: '#00bae2',
    categoryChat: '#0ae448',
    categoryArtifacts: '#ff8709',
    categoryMemories: '#fec5fb',
    categoryWorkspaces: '#9d95ff',
    statusPending: '#a8a898',
    statusProcessing: '#f5c542',
    statusReady: '#0ae448',
    statusFailed: '#e05a5a',
  }
};

const CHECKS = [
  { name: 'foreground on background', fg: 'foreground', bg: 'background', target: 4.5 },
  { name: 'cardForeground on card', fg: 'cardForeground', bg: 'card', target: 4.5 },
  { name: 'mutedForeground on background', fg: 'mutedForeground', bg: 'background', target: 4.5 },
  { name: 'mutedForeground on card', fg: 'mutedForeground', bg: 'card', target: 4.5 },
  { name: 'border on background', fg: 'border', bg: 'background', target: 3.0 },
  { name: 'primaryForeground on primary', fg: 'primaryForeground', bg: 'primary', target: 4.5 },
  { name: 'destructive on background', fg: 'destructive', bg: 'background', target: 4.5 },
  { name: 'destructive on card', fg: 'destructive', bg: 'card', target: 4.5 },
  { name: 'ring on background', fg: 'ring', bg: 'background', target: 3.0 },
  { name: 'cat.sources on background', fg: 'categorySources', bg: 'background', target: 4.5 },
  { name: 'cat.sources on card', fg: 'categorySources', bg: 'card', target: 4.5 },
  { name: 'cat.chat on background', fg: 'categoryChat', bg: 'background', target: 4.5 },
  { name: 'cat.chat on card', fg: 'categoryChat', bg: 'card', target: 4.5 },
  { name: 'cat.artifacts on background', fg: 'categoryArtifacts', bg: 'background', target: 4.5 },
  { name: 'cat.artifacts on card', fg: 'categoryArtifacts', bg: 'card', target: 4.5 },
  { name: 'cat.memories on background', fg: 'categoryMemories', bg: 'background', target: 4.5 },
  { name: 'cat.memories on card', fg: 'categoryMemories', bg: 'card', target: 4.5 },
  { name: 'cat.workspaces on background', fg: 'categoryWorkspaces', bg: 'background', target: 4.5 },
  { name: 'cat.workspaces on card', fg: 'categoryWorkspaces', bg: 'card', target: 4.5 },
  { name: 'status.pending on card', fg: 'statusPending', bg: 'card', target: 4.5 },
  { name: 'status.processing on card', fg: 'statusProcessing', bg: 'card', target: 4.5 },
  { name: 'status.ready on card', fg: 'statusReady', bg: 'card', target: 4.5 },
  { name: 'status.failed on card', fg: 'statusFailed', bg: 'card', target: 4.5 },
];

let allPassed = true;

for (const [theme, colors] of Object.entries(PALETTES)) {
  console.log(`\n================== ${theme.toUpperCase()} THEME ==================`);
  console.log('Pair'.padEnd(35) + 'Values'.padEnd(20) + 'Ratio'.padEnd(10) + 'Target'.padEnd(8) + 'Result');
  console.log('-'.repeat(80));

  for (const check of CHECKS) {
    const fgHex = colors[check.fg];
    const bgHex = colors[check.bg];
    const ratio = getContrast(fgHex, bgHex);
    const passed = ratio >= check.target;
    if (!passed) allPassed = false;
    const ratioStr = ratio.toFixed(2) + ':1';
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(
      check.name.padEnd(35) +
      `${fgHex}/${bgHex}`.padEnd(20) +
      ratioStr.padEnd(10) +
      `${check.target}:1`.padEnd(8) +
      status
    );
  }
}

if (!allPassed) {
  console.error('\n❌ Contrast check failed!');
  process.exit(1);
} else {
  console.log('\n✅ All contrast checks passed!');
}
