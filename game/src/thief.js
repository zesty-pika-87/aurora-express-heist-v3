// The Masquerade Ball — the thief: movement, the three tools and the steal.
// WASD or arrows to slip through the ballroom, click to walk somewhere, Q for
// a smoke bomb, E for an EMP that freezes the cameras, hold F by the pedestal
// to pick the laser lock, then grab the Crown and run for the exit door.

import { DOOR, FLOOR, LASER_R, LOCKPICK_SECS, PEDESTAL, SMOKE_R, THIEF_R, THIEF_SPEED } from './config.js';

export function makeThief() {
  return {
    x: 640,
    y: 648,
    dir: -Math.PI / 2,
    moving: false,
    clickX: -1,
    clickY: -1,
    smoke: 2,
    emp: 2,
    lockpick: 0,
    laserOff: false,
    hasCrown: false,
    stepTick: 0,
  };
}

function clampToFloor(t) {
  t.x = Math.max(FLOOR.x + THIEF_R, Math.min(FLOOR.x + FLOOR.w - THIEF_R, t.x));
  t.y = Math.max(FLOOR.y + THIEF_R, Math.min(FLOOR.y + FLOOR.h - THIEF_R, t.y));
}

function blockedByTable(x, y) {
  return false;
}

/** Moves the thief one frame from the keys or a click target; returns true on a footstep. */
export function moveThief(t, keys, dt, time) {
  let mx = 0;
  let my = 0;
  if (keys['arrowup'] || keys['w']) my -= 1;
  if (keys['arrowdown'] || keys['s']) my += 1;
  if (keys['arrowleft'] || keys['a']) mx -= 1;
  if (keys['arrowright'] || keys['d']) mx += 1;
  if (mx === 0 && my === 0 && t.clickX >= 0) {
    const dx = t.clickX - t.x;
    const dy = t.clickY - t.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      t.clickX = -1;
      t.clickY = -1;
    } else {
      mx = dx / d;
      my = dy / d;
    }
  }
  const len = Math.hypot(mx, my);
  t.moving = len > 0;
  if (len > 0) {
    t.dir = Math.atan2(my / len, mx / len);
    t.x += (mx / len) * THIEF_SPEED * dt;
    t.y += (my / len) * THIEF_SPEED * dt;
    clampToFloor(t);
    void blockedByTable;
    t.stepTick += dt;
    if (t.stepTick > 0.34) {
      t.stepTick = 0;
      return true;
    }
  }
  void time;
  return false;
}

/** True when the thief stands close enough to the pedestal to pick its lock. */
export function nearPedestal(t) {
  const dx = t.x - PEDESTAL.x;
  const dy = t.y - PEDESTAL.y;
  return Math.hypot(dx, dy) < LASER_R + 34;
}

/** Advances the lockpick while F is held; true the moment the laser dies. */
export function holdLockpick(t, holding, dt) {
  if (!nearPedestal(t) || t.laserOff || t.hasCrown) {
    t.lockpick = 0;
    return false;
  }
  if (!holding) {
    t.lockpick = 0;
    return false;
  }
  t.lockpick += dt;
  if (t.lockpick >= LOCKPICK_SECS) {
    t.laserOff = true;
    t.lockpick = 0;
    return true;
  }
  return false;
}

/** True when the thief touches the pedestal with the lasers down: the crown is theirs. */
export function tryGrabCrown(t) {
  if (t.hasCrown || !t.laserOff) return false;
  const dx = t.x - PEDESTAL.x;
  const dy = t.y - PEDESTAL.y;
  if (Math.hypot(dx, dy) < PEDESTAL.r + THIEF_R + 4) {
    t.hasCrown = true;
    return true;
  }
  return false;
}

/** True when the thief, crown in hand, reaches the exit door. */
export function reachedExit(t) {
  if (!t.hasCrown) return false;
  return t.x > DOOR.x - 6 && t.x < DOOR.x + DOOR.w + 6 && t.y > 640;
}

export function dropSmoke(smokes, t) {
  if (t.smoke <= 0) return false;
  t.smoke--;
  smokes.push({ x: t.x, y: t.y, r: SMOKE_R, left: 6 });
  return true;
}

export function fireEmp(t) {
  if (t.emp <= 0) return false;
  t.emp--;
  return true;
}

/** True when the thief stands inside any live smoke cloud. */
export function insideSmoke(smokes, t) {
  for (const s of smokes) {
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    if (dx * dx + dy * dy < s.r * s.r) return true;
  }
  return false;
}

function drawThiefFigure(g, t, time) {
  const bob = t.moving ? Math.sin(time * 12) * 2 : Math.sin(time * 2) * 1;
  g.fillStyle = 'rgba(0, 0, 0, 0.45)';
  g.beginPath();
  g.ellipse(t.x + 3, t.y + 15, 13, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#14141c';
  g.beginPath();
  g.moveTo(t.x - 10, t.y + 13);
  g.quadraticCurveTo(t.x - 13, t.y + bob, t.x - 6, t.y - 7);
  g.lineTo(t.x + 6, t.y - 7);
  g.quadraticCurveTo(t.x + 13, t.y + bob, t.x + 10, t.y + 13);
  g.closePath();
  g.fill();
  g.strokeStyle = '#d4af37';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(t.x - 6, t.y + 12);
  g.lineTo(t.x + 6, t.y + 12);
  g.stroke();
  g.fillStyle = '#f2c9a0';
  g.beginPath();
  g.arc(t.x, t.y - 12, 7, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#14141c';
  g.beginPath();
  g.ellipse(t.x, t.y - 13, 8.5, 4, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffd700';
  g.beginPath();
  g.arc(t.x - 3, t.y - 13, 1.5, 0, Math.PI * 2);
  g.arc(t.x + 3, t.y - 13, 1.5, 0, Math.PI * 2);
  g.fill();
  if (t.hasCrown) {
    g.fillStyle = '#ffd700';
    g.beginPath();
    g.moveTo(t.x - 9, t.y - 24);
    g.lineTo(t.x - 9, t.y - 30);
    g.lineTo(t.x - 4, t.y - 26);
    g.lineTo(t.x, t.y - 32);
    g.lineTo(t.x + 4, t.y - 26);
    g.lineTo(t.x + 9, t.y - 30);
    g.lineTo(t.x + 9, t.y - 24);
    g.closePath();
    g.fill();
  }
  const fx = t.x + Math.cos(t.dir) * 20;
  const fy = t.y + Math.sin(t.dir) * 20;
  g.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(t.x, t.y);
  g.lineTo(fx, fy);
  g.stroke();
}

/** Draws the thief, the smoke clouds and the lockpick progress ring. */
export function drawThief(g, t, smokes, time) {
  for (const s of smokes) {
    const a = Math.min(0.75, s.left / 6 + 0.25);
    const grad = g.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
    grad.addColorStop(0, `rgba(210, 210, 220, ${a})`);
    grad.addColorStop(1, 'rgba(210, 210, 220, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    g.fill();
  }
  drawThiefFigure(g, t, time);
  if (t.lockpick > 0) {
    g.strokeStyle = '#37c8ff';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(t.x, t.y, 24, -Math.PI / 2, -Math.PI / 2 + (t.lockpick / LOCKPICK_SECS) * Math.PI * 2);
    g.stroke();
    g.fillStyle = '#bfe9ff';
    g.font = 'bold 15px Georgia, serif';
    g.textAlign = 'center';
    g.fillText('PICKING LOCK…', t.x, t.y - 32);
  }
}
