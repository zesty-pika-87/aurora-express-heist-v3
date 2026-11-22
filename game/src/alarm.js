// The Masquerade Ball — the alarm: four stages that repaint the whole room.
// CALM gold, SUSPICIOUS amber, HUNTED red, LOCKDOWN dark flashing red. The
// tall four-stage gauge on the right wall shows the stage at a glance, with
// labels big enough to read when the screenshot shrinks.

import { ALARM_GLOW, ALARM_NAMES, ALARM_TINTS } from './config.js';

export function makeAlarm() {
  return { stage: 0, suspicion: 0, chaseGuard: -1, chaseLeft: 0, flash: 0 };
}

/** Raises suspicion while the thief is seen; it cools when they break sight. */
export function updateAlarm(alarm, seen, dt) {
  if (seen) {
    alarm.suspicion += dt * 1.4;
  } else {
    alarm.suspicion -= dt * 0.5;
  }
  alarm.suspicion = Math.max(0, Math.min(1, alarm.suspicion));
  if (alarm.suspicion >= 1) {
    alarm.suspicion = 0.35;
    raiseStage(alarm);
  }
  if (alarm.chaseLeft > 0) alarm.chaseLeft -= dt;
  if (alarm.chaseLeft <= 0) alarm.chaseGuard = -1;
  alarm.flash += dt;
}

export function raiseStage(alarm) {
  if (alarm.stage < 3) alarm.stage++;
  return alarm.stage;
}

/** The thief trips the lockdown by grabbing the crown in plain sight. */
export function crownGrabbedAlarm(alarm) {
  alarm.stage = 3;
  alarm.suspicion = 0.6;
}

/** The full-room lighting tint for the current stage. */
export function stageTint(alarm, time) {
  if (alarm.stage === 3) {
    const blink = 0.22 + Math.sin(time * 6) * 0.1;
    return `rgba(120, 4, 12, ${blink})`;
  }
  return ALARM_TINTS[alarm.stage];
}

/** Draws the tall four-stage alarm gauge on the right wall. */
export function drawAlarmGauge(g, alarm) {
  const x = 1150;
  const y = 120;
  const w = 96;
  const h = 320;
  g.fillStyle = 'rgba(10, 8, 18, 0.82)';
  g.fillRect(x - 12, y - 46, w + 24, h + 92);
  g.strokeStyle = '#d4af37';
  g.lineWidth = 3;
  g.strokeRect(x - 12, y - 46, w + 24, h + 92);
  g.fillStyle = '#ffd97a';
  g.font = 'bold 19px Georgia, serif';
  g.textAlign = 'center';
  g.fillText('ALARM', x + w / 2, y - 22);
  const segH = h / 4;
  for (let i = 0; i < 4; i++) {
    const sy = y + (3 - i) * segH;
    const lit = alarm.stage === i;
    g.fillStyle = lit ? ALARM_GLOW[i] : 'rgba(120, 110, 90, 0.4)';
    g.fillRect(x, sy + 4, w, segH - 8);
    g.strokeStyle = lit ? '#ffffff' : '#8a7a55';
    g.lineWidth = lit ? 3 : 1.5;
    g.strokeRect(x, sy + 4, w, segH - 8);
    g.fillStyle = lit ? '#ffffff' : '#cbbd8f';
    g.font = lit ? 'bold 17px Georgia, serif' : '17px Georgia, serif';
    g.fillText(ALARM_NAMES[i], x + w / 2, sy + segH / 2 + 6);
  }
  g.fillStyle = '#ffd97a';
  g.font = 'bold 17px Georgia, serif';
  g.fillText('STAGE ' + (alarm.stage + 1) + ' / 4', x + w / 2, y + h + 30);
}

/** Draws the suspicion meter at the bottom-left, clear of the HUD and the door. */
export function drawSuspicionBar(g, alarm) {
  const x = 18;
  const y = 656;
  const w = 268;
  const h = 40;
  g.fillStyle = 'rgba(10, 8, 18, 0.85)';
  g.fillRect(x - 8, y - 8, w + 16, h + 16);
  g.strokeStyle = '#d4af37';
  g.lineWidth = 2;
  g.strokeRect(x - 8, y - 8, w + 16, h + 16);
  g.fillStyle = '#cbbd8f';
  g.font = 'bold 16px Georgia, serif';
  g.textAlign = 'left';
  g.fillText('SUSPICION', x, y + 15);
  g.fillStyle = '#3a2a12';
  g.fillRect(x + 118, y + 2, w - 118, 16);
  g.fillStyle = alarm.suspicion > 0.66 ? '#ff2e2e' : '#ffb020';
  g.fillRect(x + 118, y + 2, (w - 118) * alarm.suspicion, 16);
}
