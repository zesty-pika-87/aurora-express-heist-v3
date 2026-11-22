// The Masquerade Ball — the dancing crowd, the new "crowd cover" mechanic.
// Fourteen masked guests waltz in seven pairs across the dance floor. A thief
// standing inside a pair is hidden: guard cones sweep straight past them.
// The crowd is visible in every still frame, so the mechanic reads at once.

import { CROWD_HIDE_R } from './config.js';

const GOWNS = ['#b3123f', '#1f4e79', '#2e7d4f', '#6a1fa2', '#c97b12', '#0f766e', '#8e2a5e'];
const MASKS = ['#ffd700', '#e8e8e8', '#37c8ff', '#ff7ab8', '#9dff57', '#ffb347', '#c9a0ff'];

const PAIRS = [
  { cx: 470, cy: 250, r: 52, speed: 0.55, phase: 0.0 },
  { cx: 810, cy: 250, r: 52, speed: 0.5, phase: 1.1 },
  { cx: 420, cy: 470, r: 56, speed: 0.62, phase: 2.2 },
  { cx: 860, cy: 470, r: 56, speed: 0.58, phase: 3.0 },
  { cx: 640, cy: 560, r: 48, speed: 0.66, phase: 4.1 },
  { cx: 250, cy: 360, r: 44, speed: 0.48, phase: 5.2 },
  { cx: 1030, cy: 360, r: 44, speed: 0.52, phase: 0.7 },
];

/** The seven dancing pairs, each with its live centre and spin angle. */
export function crowdPairs(time) {
  return PAIRS.map((p, i) => {
    const a = time * p.speed + p.phase;
    return {
      index: i,
      x: p.cx + Math.cos(a * 0.5) * 14,
      y: p.cy + Math.sin(a * 0.5) * 10,
      angle: a,
      r: p.r,
      gown: GOWNS[i % GOWNS.length],
      mask: MASKS[i % MASKS.length],
    };
  });
}

function drawGuest(g, x, y, gown, mask, facing, spin, lead) {
  const sway = Math.sin(spin + (lead ? 0 : Math.PI)) * 4;
  g.fillStyle = 'rgba(0, 0, 0, 0.35)';
  g.beginPath();
  g.ellipse(x + 3, y + 16, 13, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = gown;
  g.beginPath();
  g.moveTo(x - 9, y + 14);
  g.quadraticCurveTo(x - 15, y + sway, x - 6, y - 6);
  g.lineTo(x + 6, y - 6);
  g.quadraticCurveTo(x + 15, y + sway, x + 9, y + 14);
  g.closePath();
  g.fill();
  g.fillStyle = '#f2c9a0';
  g.beginPath();
  g.arc(x, y - 12, 7, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = mask;
  g.beginPath();
  g.ellipse(x, y - 13, 8, 3.5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#2c1a3e';
  g.beginPath();
  g.arc(x - 3, y - 13, 1.4, 0, Math.PI * 2);
  g.arc(x + 3, y - 13, 1.4, 0, Math.PI * 2);
  g.fill();
  if (lead) {
    g.strokeStyle = '#f2c9a0';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x + 8 * Math.cos(facing), y - 4 + 8 * Math.sin(facing));
    g.lineTo(x + 20 * Math.cos(facing), y - 4 + 20 * Math.sin(facing));
    g.stroke();
  }
}

/** Draws all fourteen guests as seven waltzing pairs. */
export function drawCrowd(g, time) {
  for (const pair of crowdPairs(time)) {
    const dx = Math.cos(pair.angle) * 20;
    const dy = Math.sin(pair.angle) * 20;
    drawGuest(g, pair.x - dx, pair.y - dy, pair.gown, pair.mask, pair.angle, time * 2 + pair.index, false);
    drawGuest(g, pair.x + dx, pair.y + dy, '#23232e', pair.mask, pair.angle + Math.PI, time * 2 + pair.index, true);
    g.strokeStyle = 'rgba(255, 215, 120, 0.5)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(pair.x, pair.y, pair.r, 0, Math.PI * 2);
    g.stroke();
  }
}

/** True when the thief stands inside a dancing pair and the crowd hides them. */
export function hiddenInCrowd(thiefX, thiefY, time) {
  for (const pair of crowdPairs(time)) {
    const dx = thiefX - pair.x;
    const dy = thiefY - pair.y;
    if (dx * dx + dy * dy < CROWD_HIDE_R * CROWD_HIDE_R) return true;
  }
  return false;
}
