// The Masquerade Ball — guards and wall cameras, the eyes of the ballroom.
// Four guards walk patrol loops with big filled wedge vision cones; three wall
// cameras sweep wide arcs. A cone that touches the thief fills the suspicion
// meter unless smoke, crowd cover or an EMP freeze is in the way.

import { CAMERA_HALF, CAMERA_LEN, COLUMNS, CONE_HALF, CONE_LEN, GUARD_CHASE_SPEED, GUARD_SPEED, TABLES } from './config.js';

export const GUARD_ROUTES = [
  { pts: [[180, 130], [470, 130], [470, 330], [180, 330]], phase: 0.0 },
  { pts: [[1100, 130], [810, 130], [810, 330], [1100, 330]], phase: 0.35 },
  { pts: [[180, 590], [470, 590], [470, 430], [180, 430]], phase: 0.6 },
  { pts: [[1100, 590], [810, 590], [810, 430], [1100, 430]], phase: 0.85 },
];

export const CAMERAS = [
  { x: 60, y: 40, base: Math.PI / 2, sweep: 0.85, speed: 0.55, phase: 0 },
  { x: 1220, y: 40, base: Math.PI / 2, sweep: 0.85, speed: 0.5, phase: 2 },
  { x: 1220, y: 360, base: Math.PI, sweep: 0.7, speed: 0.62, phase: 4 },
];

function routePoint(route, t) {
  const pts = route.pts;
  const segs = pts.length;
  const total = segs;
  let u = ((t + route.phase) % 1 + 1) % 1 * total;
  const i = Math.floor(u) % segs;
  const f = u - Math.floor(u);
  const a = pts[i];
  const b = pts[(i + 1) % segs];
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, nx: b[0] - a[0], ny: b[1] - a[1] };
}

function blockedByFurniture(x0, y0, x1, y1) {
  for (const t of TABLES) {
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const dx = mx - t.x;
    const dy = my - t.y;
    if (dx * dx + dy * dy < (t.r + 6) * (t.r + 6)) return true;
  }
  for (const c of COLUMNS) {
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const dx = mx - c.x;
    const dy = my - c.y;
    if (dx * dx + dy * dy < 26 * 26) return true;
  }
  return false;
}

function inWedge(x0, y0, dir, half, len, tx, ty) {
  const dx = tx - x0;
  const dy = ty - y0;
  const d = Math.hypot(dx, dy);
  if (d > len || d < 4) return false;
  let diff = Math.atan2(dy, dx) - dir;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > half) return false;
  return !blockedByFurniture(x0, y0, tx, ty);
}

/** Where each guard stands and looks right now; chase overrides the patrol. */
export function guardStates(time, chase, thiefX, thiefY) {
  return GUARD_ROUTES.map((route, i) => {
    const p = routePoint(route, time * 0.045);
    let x = p.x;
    let y = p.y;
    let dir = Math.atan2(p.ny, p.nx);
    let chasing = false;
    if (chase && chase.guard === i) {
      chasing = true;
      const dx = thiefX - x;
      const dy = thiefY - y;
      const d = Math.hypot(dx, dy) || 1;
      x += (dx / d) * 2.2;
      y += (dy / d) * 2.2;
      dir = Math.atan2(dy, dx);
    }
    return { index: i, x, y, dir, chasing };
  });
}

function drawCone(g, x, y, dir, half, len, color, edge) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y);
  g.arc(x, y, len, dir - half, dir + half);
  g.closePath();
  g.fill();
  g.strokeStyle = edge;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + Math.cos(dir - half) * len, y + Math.sin(dir - half) * len);
  g.moveTo(x, y);
  g.lineTo(x + Math.cos(dir + half) * len, y + Math.sin(dir + half) * len);
  g.stroke();
  g.strokeStyle = edge;
  g.lineWidth = 2;
  g.beginPath();
  g.arc(x, y, len, dir - half, dir + half);
  g.stroke();
}

function drawGuardBody(g, s, alert) {
  g.fillStyle = 'rgba(0, 0, 0, 0.4)';
  g.beginPath();
  g.ellipse(s.x + 3, s.y + 14, 14, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = alert ? '#8e1420' : '#1d3557';
  g.beginPath();
  g.arc(s.x, s.y, 13, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#d4af37';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(s.x, s.y, 13, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#f2c9a0';
  g.beginPath();
  g.arc(s.x + Math.cos(s.dir) * 6, s.y + Math.sin(s.dir) * 6 - 4, 6, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#1d3557';
  g.beginPath();
  g.arc(s.x + Math.cos(s.dir) * 6, s.y + Math.sin(s.dir) * 6 - 8, 6.5, Math.PI, 0);
  g.fill();
  if (alert) {
    g.fillStyle = '#ff2e2e';
    g.font = 'bold 20px Georgia, serif';
    g.textAlign = 'center';
    g.fillText('!', s.x, s.y - 20);
  }
}

/** Draws every guard with its cone, and every camera with its sweep arc. */
export function drawGuardsAndCameras(g, time, chase, empLeft, alarmStage) {
  const guards = guardStates(time, chase, 0, 0);
  const coneColor = alarmStage >= 2 ? 'rgba(255, 46, 46, 0.34)' : 'rgba(255, 214, 90, 0.30)';
  const coneEdge = alarmStage >= 2 ? 'rgba(255, 120, 120, 0.95)' : 'rgba(255, 232, 150, 0.95)';
  for (const s of guards) {
    drawCone(g, s.x, s.y, s.dir, CONE_HALF, CONE_LEN, coneColor, coneEdge);
  }
  for (const cam of CAMERAS) {
    const frozen = empLeft > 0;
    const dir = cam.base + (frozen ? 0 : Math.sin(time * cam.speed + cam.phase) * cam.sweep);
    drawCone(g, cam.x, cam.y, dir, CAMERA_HALF, CAMERA_LEN, frozen ? 'rgba(120, 200, 255, 0.16)' : 'rgba(255, 90, 90, 0.26)', frozen ? 'rgba(140, 210, 255, 0.8)' : 'rgba(255, 120, 120, 0.9)');
    g.fillStyle = '#2b2b33';
    g.beginPath();
    g.arc(cam.x, cam.y, 11, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#d4af37';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cam.x, cam.y, 11, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = frozen ? '#7fd4ff' : '#ff2e2e';
    g.beginPath();
    g.arc(cam.x + Math.cos(dir) * 6, cam.y + Math.sin(dir) * 6, 4, 0, Math.PI * 2);
    g.fill();
  }
  for (const s of guards) drawGuardBody(g, s, alarmStage >= 2 || s.chasing);
}

/** True when any guard cone touches the thief right now. */
export function guardSeesThief(time, chase, thiefX, thiefY) {
  for (const s of guardStates(time, chase, thiefX, thiefY)) {
    if (inWedge(s.x, s.y, s.dir, CONE_HALF, CONE_LEN, thiefX, thiefY)) return s.index;
  }
  return -1;
}

/** True when any camera sweep touches the thief right now. */
export function cameraSeesThief(time, empLeft, thiefX, thiefY) {
  if (empLeft > 0) return false;
  for (const cam of CAMERAS) {
    const dir = cam.base + Math.sin(time * cam.speed + cam.phase) * cam.sweep;
    if (inWedge(cam.x, cam.y, dir, CAMERA_HALF, CAMERA_LEN, thiefX, thiefY)) return true;
  }
  return false;
}

export { GUARD_SPEED };
