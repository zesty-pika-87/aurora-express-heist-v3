// The Masquerade Ball — the game itself: loop, states, HUD and staging.
// One top-down grand ballroom, 1280x720. Slip past four patrolling guards and
// three sweeping cameras, hide inside the dancing crowd, pick the laser lock
// on the Crown of Aurelia, and escape through the exit before the party ends.
// ?shot=start|cover|mid|end freezes a staged moment for screenshots.

import { ALARM_GLOW, ALARM_NAMES, EMP_SECS, TIMER_START, VIEW_H, VIEW_W } from './config.js';
import { drawBallroom } from './ballroom.js';
import { drawCrowd, hiddenInCrowd } from './crowd.js';
import { cameraSeesThief, drawGuardsAndCameras, guardSeesThief } from './guards.js';
import { dropSmoke, drawThief, fireEmp, holdLockpick, insideSmoke, makeThief, moveThief, nearPedestal, reachedExit, tryGrabCrown } from './thief.js';
import { crownGrabbedAlarm, drawAlarmGauge, drawSuspicionBar, makeAlarm, raiseStage, stageTint, updateAlarm } from './alarm.js';
import { ensureAudio, playAlarmSting, playCaught, playClick, playCrownChime, playEmp, playEscape, playLockpickTick, playSmoke, playStep, startWaltz, stopMusic } from './audio.js';

const canvas = document.getElementById('game');
const g = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot') || '';

const thief = makeThief();
const alarm = makeAlarm();
let smokes = [];
let empLeft = 0;
let time = 0;
let timeLeft = TIMER_START;
let state = 'title';
let keys = {};
let lastTick = 0;
let seenNow = false;
let message = '';
let messageLeft = 0;
let lockpickSoundTick = 0;

function stageShot(name) {
  state = 'play';
  if (name === 'start') {
    time = 2.0;
    thief.x = 640;
    thief.y = 648;
    alarm.stage = 0;
    message = 'Slip in with the guests. Reach the Crown.';
    messageLeft = 999;
  } else if (name === 'mid') {
    time = 8.0;
    thief.x = 470;
    thief.y = 252;
    alarm.stage = 1;
    alarm.suspicion = 0.55;
    message = 'Hidden in the crowd — the cone sweeps past.';
    messageLeft = 999;
  } else if (name === 'cover') {
    time = 8.0;
    thief.x = 640;
    thief.y = 306;
    thief.laserOff = true;
    alarm.stage = 1;
    alarm.suspicion = 0.6;
    message = 'The Crown of Aurelia — grab it and run!';
    messageLeft = 999;
  } else if (name === 'end') {
    time = 12.0;
    thief.x = 640;
    thief.y = 612;
    thief.laserOff = true;
    thief.hasCrown = true;
    alarm.stage = 2;
    alarm.suspicion = 0.8;
    message = 'Crown stolen — run for the EXIT!';
    messageLeft = 999;
  }
}

function fmtTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const r = Math.floor(Math.max(0, s) % 60);
  return m + ':' + String(r).padStart(2, '0');
}

function drawHud() {
  g.fillStyle = 'rgba(12, 8, 20, 0.88)';
  g.fillRect(0, 0, VIEW_W, 58);
  g.strokeStyle = '#d4af37';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 58);
  g.lineTo(VIEW_W, 58);
  g.stroke();
  g.textAlign = 'left';
  g.fillStyle = '#ffd97a';
  g.font = 'bold 22px Georgia, serif';
  g.fillText('THE MASQUERADE BALL', 18, 26);
  g.fillStyle = '#ffffff';
  g.font = '19px Georgia, serif';
  const objective = thief.hasCrown ? 'ESCAPE through the EXIT door!' : 'Steal THE CROWN OF AURELIA';
  g.fillText(objective, 18, 50);
  g.textAlign = 'center';
  g.fillStyle = timeLeft < 60 ? '#ff5a5a' : '#ffffff';
  g.font = 'bold 26px Georgia, serif';
  g.fillText(fmtTime(timeLeft), 640, 34);
  g.fillStyle = '#cbbd8f';
  g.font = '16px Georgia, serif';
  g.fillText('until the party ends', 640, 53);
  g.textAlign = 'right';
  g.fillStyle = '#ffffff';
  g.font = 'bold 19px Georgia, serif';
  g.fillText('Q smoke x' + thief.smoke + '    E EMP x' + thief.emp + '    hold F pick lock', 1262, 26);
  g.fillStyle = ALARM_GLOW[alarm.stage];
  g.font = 'bold 19px Georgia, serif';
  g.fillText('ALARM: ' + ALARM_NAMES[alarm.stage], 1262, 50);
  if (messageLeft > 0) {
    g.textAlign = 'center';
    g.fillStyle = 'rgba(12, 8, 20, 0.85)';
    const w = g.measureText(message).width + 36;
    g.fillRect(640 - w / 2, 66, w, 30);
    g.strokeStyle = '#d4af37';
    g.lineWidth = 2;
    g.strokeRect(640 - w / 2, 66, w, 30);
    g.fillStyle = '#ffe9a0';
    g.font = 'bold 18px Georgia, serif';
    g.fillText(message, 640, 87);
  }
  if (nearPedestal(thief) && !thief.laserOff && !thief.hasCrown) {
    g.textAlign = 'center';
    g.fillStyle = '#bfe9ff';
    g.font = 'bold 19px Georgia, serif';
    g.fillText('HOLD F — PICK THE LASER LOCK', 640, 640);
  }
  if (thief.hasCrown) {
    g.textAlign = 'center';
    g.fillStyle = '#ffd700';
    g.font = 'bold 20px Georgia, serif';
    g.fillText('★ YOU HOLD THE CROWN — RUN TO THE EXIT ★', 640, 640);
  }
}

function drawOverlay(title, lines, color) {
  g.fillStyle = 'rgba(8, 4, 14, 0.78)';
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  g.textAlign = 'center';
  g.fillStyle = color;
  g.font = 'bold 52px Georgia, serif';
  g.fillText(title, 640, 300);
  g.fillStyle = '#ffffff';
  g.font = '22px Georgia, serif';
  lines.forEach((line, i) => g.fillText(line, 640, 352 + i * 34));
  g.fillStyle = '#ffd97a';
  g.font = 'bold 20px Georgia, serif';
  g.fillText('Press R to play again', 640, 352 + lines.length * 34 + 22);
}

function drawTitle() {
  drawBallroom(g, time, thief.laserOff, thief.hasCrown);
  drawCrowd(g, time);
  drawGuardsAndCameras(g, time, null, 0, 0);
  drawThief(g, thief, smokes, time);
  drawAlarmGauge(g, alarm);
  g.fillStyle = 'rgba(8, 4, 14, 0.72)';
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  g.textAlign = 'center';
  g.fillStyle = '#ffd700';
  g.font = 'bold 64px Georgia, serif';
  g.fillText('THE MASQUERADE BALL', 640, 220);
  g.fillStyle = '#ffffff';
  g.font = '28px Georgia, serif';
  g.fillText('Steal the Crown of Aurelia — and waltz out alive.', 640, 272);
  g.fillStyle = '#ffe9a0';
  g.font = '21px Georgia, serif';
  g.fillText('Hide inside the dancing crowd. Read the cones. Pick the lock. Run.', 640, 330);
  g.fillStyle = '#ffd97a';
  g.font = 'bold 26px Georgia, serif';
  g.fillText('Click or press ENTER to begin', 640, 410);
  g.fillStyle = '#cbbd8f';
  g.font = '19px Georgia, serif';
  g.fillText('WASD / arrows move  •  Q smoke bomb (x2)  •  E EMP freezes cameras (x2)  •  hold F to pick the lock', 640, 460);
  g.fillText('Four guards patrol with wide vision cones. Three cameras sweep the walls. Four minutes until the party ends.', 640, 492);
}

function update(dt) {
  time += dt;
  if (state !== 'play') return;
  if (timeLeft > 0) timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    state = 'timeup';
    stopMusic();
    return;
  }
  if (moveThief(thief, keys, dt, time)) playStep();
  const hidden = hiddenInCrowd(thief.x, thief.y, time) || insideSmoke(smokes, thief);
  const guardHit = guardSeesThief(time, alarm.chaseGuard >= 0 ? { guard: alarm.chaseGuard } : null, thief.x, thief.y);
  const camHit = cameraSeesThief(time, empLeft, thief.x, thief.y);
  seenNow = !hidden && (guardHit >= 0 || camHit);
  const before = alarm.stage;
  updateAlarm(alarm, seenNow, dt);
  if (alarm.stage > before) {
    playAlarmSting(alarm.stage);
    if (guardHit >= 0) {
      alarm.chaseGuard = guardHit;
      alarm.chaseLeft = 4;
    }
    message = 'SPOTTED! Alarm rises — break line of sight!';
    messageLeft = 3;
  }
  if (messageLeft > 0 && messageLeft < 900) messageLeft -= dt;
  if (empLeft > 0) empLeft -= dt;
  for (const s of smokes) s.left -= dt;
  smokes = smokes.filter((s) => s.left > 0);
  const picking = keys['f'] === true;
  if (picking && nearPedestal(thief) && !thief.laserOff) {
    lockpickSoundTick += dt;
    if (lockpickSoundTick > 0.3) {
      lockpickSoundTick = 0;
      playLockpickTick(thief.lockpick / 2);
    }
  }
  if (holdLockpick(thief, picking, dt)) {
    playClick();
    message = 'Laser grid down — grab the Crown!';
    messageLeft = 3;
  }
  if (tryGrabCrown(thief)) {
    playCrownChime();
    crownGrabbedAlarm(alarm);
    playAlarmSting(3);
    message = 'THE CROWN IS YOURS — RUN!';
    messageLeft = 4;
  }
  if (seenNow && alarm.stage >= 2 && guardHit >= 0) {
    const gx = thief.x;
    const gy = thief.y;
    void gx;
    void gy;
  }
  if (alarm.stage === 3 && seenNow && guardHit >= 0) {
    const d = Math.hypot(thief.x - 640, thief.y - 348);
    void d;
  }
  if (reachedExit(thief)) {
    state = 'escaped';
    playEscape();
    stopMusic();
  }
}

function caughtCheck() {
  if (state !== 'play') return;
  if (alarm.stage >= 3 && seenNow) {
    state = 'caught';
    playCaught();
    stopMusic();
  }
}

function render() {
  g.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state === 'title') {
    drawTitle();
    return;
  }
  drawBallroom(g, time, thief.laserOff, thief.hasCrown);
  drawCrowd(g, time);
  drawGuardsAndCameras(g, time, alarm.chaseGuard >= 0 ? { guard: alarm.chaseGuard } : null, empLeft, alarm.stage);
  drawThief(g, thief, smokes, time);
  g.fillStyle = stageTint(alarm, time);
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  drawAlarmGauge(g, alarm);
  drawSuspicionBar(g, alarm);
  drawHud();
  if (state === 'caught') {
    drawOverlay('CAUGHT!', ['A guard closed in while the alarm was at LOCKDOWN.', 'The crowd could have hidden you — try the dance floor.'], '#ff4a4a');
  } else if (state === 'escaped') {
    drawOverlay('CLEAN GETAWAY!', ['The Crown of Aurelia is yours.', 'The ballroom never knew you were there.'], '#ffd700');
  } else if (state === 'timeup') {
    drawOverlay('THE PARTY ENDED', ['The guests went home and the Crown stayed behind.', 'Four minutes is all a thief ever gets.'], '#ffb020');
  }
}

function frame(ts) {
  const dt = Math.min(0.05, (ts - lastTick) / 1000 || 0.016);
  lastTick = ts;
  if (!shot) {
    update(dt);
    caughtCheck();
  }
  render();
  if (!shot) window.requestAnimationFrame(frame);
}

function resetGame() {
  const fresh = makeThief();
  thief.x = fresh.x;
  thief.y = fresh.y;
  thief.dir = fresh.dir;
  thief.smoke = fresh.smoke;
  thief.emp = fresh.emp;
  thief.lockpick = 0;
  thief.laserOff = false;
  thief.hasCrown = false;
  thief.clickX = -1;
  thief.clickY = -1;
  alarm.stage = 0;
  alarm.suspicion = 0;
  alarm.chaseGuard = -1;
  alarm.chaseLeft = 0;
  smokes = [];
  empLeft = 0;
  timeLeft = TIMER_START;
  state = 'play';
  message = 'Slip in with the guests. Reach the Crown.';
  messageLeft = 3;
}

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  ensureAudio();
  keys[k] = true;
  if (state === 'title' && (k === 'enter' || k === ' ')) {
    resetGame();
    startWaltz();
    return;
  }
  if ((state === 'caught' || state === 'escaped' || state === 'timeup') && k === 'r') {
    resetGame();
    startWaltz();
    return;
  }
  if (state !== 'play') return;
  if (k === 'q' && dropSmoke(smokes, thief)) {
    playSmoke();
    message = 'Smoke! The guards cannot see through it.';
    messageLeft = 2;
  }
  if (k === 'e' && fireEmp(thief)) {
    empLeft = EMP_SECS;
    playEmp();
    message = 'EMP! The cameras are frozen for 4 seconds.';
    messageLeft = 2;
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousedown', (e) => {
  ensureAudio();
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * VIEW_W;
  const y = ((e.clientY - rect.top) / rect.height) * VIEW_H;
  if (state === 'title') {
    resetGame();
    startWaltz();
    return;
  }
  if (state === 'play') {
    thief.clickX = x;
    thief.clickY = y;
  }
});

if (shot) {
  stageShot(shot);
  render();
  window.__shotReady = true;
} else {
  window.requestAnimationFrame(frame);
}
