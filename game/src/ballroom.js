// The Masquerade Ball — the ballroom itself, drawn fresh every frame.
// Parquet wood with inlay, a wide red carpet, round candle tables, glowing
// chandeliers, marble columns, night windows, palms and the velvet ropes
// around the Crown of Aurelia. No tile grid anywhere: the floor is wood.

import { CHANDELIERS, COLUMNS, FLOOR, LASER_R, PALMS, PEDESTAL, ROPE_R, SPOTLIGHT_R, TABLES, WALL, WINDOWS } from './config.js';

function drawParquet(g, time) {
  g.save();
  g.beginPath();
  g.rect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  g.clip();
  g.fillStyle = '#6b4423';
  g.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  const tile = 64;
  for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
    for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += tile) {
      const odd = ((x - FLOOR.x) / tile + (y - FLOOR.y) / tile) % 2 === 0;
      g.fillStyle = odd ? '#7d5230' : '#6b4423';
      g.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      g.strokeStyle = 'rgba(40, 20, 6, 0.55)';
      g.lineWidth = 1;
      g.beginPath();
      if (odd) {
        g.moveTo(x + 1, y + 1);
        g.lineTo(x + tile - 1, y + tile - 1);
        g.moveTo(x + tile - 1, y + 1);
        g.lineTo(x + 1, y + tile - 1);
      } else {
        g.moveTo(x + tile / 2, y + 1);
        g.lineTo(x + tile / 2, y + tile - 1);
        g.moveTo(x + 1, y + tile / 2);
        g.lineTo(x + tile - 1, y + tile / 2);
      }
      g.stroke();
    }
  }
  // Gold inlay ring around the dance floor.
  g.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  g.lineWidth = 4;
  g.beginPath();
  g.ellipse(640, 360, 470, 300, 0, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(640, 360, 448, 282, 0, 0, Math.PI * 2);
  g.stroke();
  g.restore();
  void time;
}

function drawCarpet(g) {
  g.fillStyle = '#8e1420';
  g.fillRect(556, FLOOR.y, 168, FLOOR.h);
  g.fillStyle = '#a81c2c';
  g.fillRect(572, FLOOR.y, 136, FLOOR.h);
  g.strokeStyle = '#d4af37';
  g.lineWidth = 3;
  g.strokeRect(576, FLOOR.y + 4, 128, FLOOR.h - 8);
  g.fillStyle = '#d4af37';
  for (let y = FLOOR.y + 30; y < FLOOR.y + FLOOR.h; y += 90) {
    g.beginPath();
    g.moveTo(640, y);
    g.lineTo(656, y + 14);
    g.lineTo(640, y + 28);
    g.lineTo(624, y + 14);
    g.closePath();
    g.fill();
  }
}

function drawWallsAndWindows(g, time) {
  g.fillStyle = '#2c1a3e';
  g.fillRect(0, 0, 1280, WALL);
  g.fillRect(0, 720 - WALL, 1280, WALL);
  g.fillRect(0, 0, WALL, 720);
  g.fillRect(1280 - WALL, 0, WALL, 720);
  g.strokeStyle = '#d4af37';
  g.lineWidth = 3;
  g.strokeRect(WALL - 4, WALL - 4, 1280 - WALL * 2 + 8, 720 - WALL * 2 + 8);
  for (const wx of WINDOWS) {
    g.fillStyle = '#0a1030';
    g.fillRect(wx - 34, 4, 68, 20);
    g.fillStyle = '#ffe9a8';
    g.beginPath();
    g.arc(wx + 16, 12, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    for (let s = 0; s < 4; s++) {
      const sx = wx - 26 + ((s * 17 + 9) % 52);
      const sy = 8 + ((s * 11) % 10);
      g.fillRect(sx, sy, 2, 2);
    }
    g.strokeStyle = '#d4af37';
    g.lineWidth = 2;
    g.strokeRect(wx - 34, 4, 68, 20);
    g.beginPath();
    g.moveTo(wx, 4);
    g.lineTo(wx, 24);
    g.stroke();
  }
  void time;
}

function drawTables(g, time) {
  for (const t of TABLES) {
    g.fillStyle = 'rgba(0, 0, 0, 0.35)';
    g.beginPath();
    g.ellipse(t.x + 5, t.y + 7, t.r + 4, t.r * 0.55, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f3ead2';
    g.beginPath();
    g.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#c9a227';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = '#c9a227';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(t.x, t.y, t.r - 13, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#7d1f2b';
    g.beginPath();
    g.arc(t.x, t.y, 11, 0, Math.PI * 2);
    g.fill();
    const flick = 0.75 + Math.sin(time * 5 + t.x) * 0.25;
    const glow = g.createRadialGradient(t.x, t.y, 2, t.x, t.y, 26);
    glow.addColorStop(0, `rgba(255, 214, 120, ${0.85 * flick})`);
    glow.addColorStop(1, 'rgba(255, 180, 60, 0)');
    g.fillStyle = glow;
    g.beginPath();
    g.arc(t.x, t.y, 26, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff2c0';
    g.beginPath();
    g.arc(t.x, t.y - 2, 3, 0, Math.PI * 2);
    g.fill();
  }
}

function drawChandeliers(g, time) {
  for (const c of CHANDELIERS) {
    const pulse = 0.5 + Math.sin(time * 1.6 + c.x) * 0.08;
    const glow = g.createRadialGradient(c.x, c.y, 6, c.x, c.y, c.r * 2.4);
    glow.addColorStop(0, `rgba(255, 224, 130, ${0.55 * pulse})`);
    glow.addColorStop(1, 'rgba(255, 200, 90, 0)');
    g.fillStyle = glow;
    g.beginPath();
    g.arc(c.x, c.y, c.r * 2.4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#8a6d1f';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(c.x, 0);
    g.lineTo(c.x, c.y - c.r);
    g.stroke();
    g.fillStyle = '#d4af37';
    g.beginPath();
    g.arc(c.x, c.y, c.r * 0.55, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff3c4';
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      g.beginPath();
      g.arc(c.x + Math.cos(a) * c.r * 0.72, c.y + Math.sin(a) * c.r * 0.72, 4, 0, Math.PI * 2);
      g.fill();
    }
  }
}

function drawColumns(g) {
  for (const c of COLUMNS) {
    g.fillStyle = 'rgba(0, 0, 0, 0.4)';
    g.beginPath();
    g.ellipse(c.x + 6, c.y + 8, 26, 14, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e8e0cc';
    g.beginPath();
    g.arc(c.x, c.y, 22, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#b39b5e';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(c.x, c.y, 22, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#c9a227';
    g.beginPath();
    g.arc(c.x, c.y, 9, 0, Math.PI * 2);
    g.fill();
  }
}

function drawPalms(g) {
  for (const p of PALMS) {
    g.strokeStyle = '#1f6b2e';
    g.lineWidth = 7;
    g.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.5;
      g.beginPath();
      g.moveTo(p.x, p.y);
      g.quadraticCurveTo(p.x + Math.cos(a) * 26, p.y + Math.sin(a) * 26, p.x + Math.cos(a) * 46, p.y + Math.sin(a) * 46 + 12);
      g.stroke();
    }
    g.fillStyle = '#7a4a21';
    g.beginPath();
    g.arc(p.x, p.y + 6, 10, 0, Math.PI * 2);
    g.fill();
  }
}

function drawVelvetRopes(g) {
  g.strokeStyle = '#8e1420';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(PEDESTAL.x, PEDESTAL.y, ROPE_R, 0, Math.PI * 2);
  g.stroke();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const px = PEDESTAL.x + Math.cos(a) * ROPE_R;
    const py = PEDESTAL.y + Math.sin(a) * ROPE_R;
    g.fillStyle = '#d4af37';
    g.beginPath();
    g.arc(px, py, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#5c430a';
    g.beginPath();
    g.arc(px, py, 2.5, 0, Math.PI * 2);
    g.fill();
  }
}

function drawSpotlightAndCrown(g, time, laserOff, crownTaken) {
  const breathe = 1 + Math.sin(time * 2.2) * 0.04;
  const glow = g.createRadialGradient(PEDESTAL.x, PEDESTAL.y, 8, PEDESTAL.x, PEDESTAL.y, SPOTLIGHT_R * breathe);
  glow.addColorStop(0, 'rgba(255, 226, 130, 0.85)');
  glow.addColorStop(0.55, 'rgba(255, 204, 80, 0.30)');
  glow.addColorStop(1, 'rgba(255, 204, 80, 0)');
  g.fillStyle = glow;
  g.beginPath();
  g.arc(PEDESTAL.x, PEDESTAL.y, SPOTLIGHT_R * breathe, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#ffe9a0';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(PEDESTAL.x, PEDESTAL.y, SPOTLIGHT_R * 0.92, 0, Math.PI * 2);
  g.stroke();
  if (!laserOff && !crownTaken) {
    g.strokeStyle = 'rgba(255, 60, 60, 0.9)';
    g.lineWidth = 2;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + time * 0.4;
      g.beginPath();
      g.moveTo(PEDESTAL.x + Math.cos(a) * (LASER_R - 26), PEDESTAL.y + Math.sin(a) * (LASER_R - 26));
      g.lineTo(PEDESTAL.x + Math.cos(a) * LASER_R, PEDESTAL.y + Math.sin(a) * LASER_R);
      g.stroke();
    }
    g.strokeStyle = 'rgba(255, 60, 60, 0.55)';
    g.beginPath();
    g.arc(PEDESTAL.x, PEDESTAL.y, LASER_R, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = '#3a3a44';
  g.beginPath();
  g.ellipse(PEDESTAL.x, PEDESTAL.y + 16, PEDESTAL.r + 10, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#e8e0cc';
  g.fillRect(PEDESTAL.x - PEDESTAL.r, PEDESTAL.y - 8, PEDESTAL.r * 2, 26);
  g.fillStyle = '#c9a227';
  g.fillRect(PEDESTAL.x - PEDESTAL.r, PEDESTAL.y - 12, PEDESTAL.r * 2, 6);
  if (!crownTaken) {
    const bob = Math.sin(time * 2.4) * 3;
    const cy = PEDESTAL.y - 26 + bob;
    g.fillStyle = '#ffd700';
    g.beginPath();
    g.moveTo(PEDESTAL.x - 26, cy + 8);
    g.lineTo(PEDESTAL.x - 26, cy - 8);
    g.lineTo(PEDESTAL.x - 13, cy + 2);
    g.lineTo(PEDESTAL.x - 6, cy - 16);
    g.lineTo(PEDESTAL.x, cy + 2);
    g.lineTo(PEDESTAL.x + 6, cy - 16);
    g.lineTo(PEDESTAL.x + 13, cy + 2);
    g.lineTo(PEDESTAL.x + 26, cy - 8);
    g.lineTo(PEDESTAL.x + 26, cy + 8);
    g.closePath();
    g.fill();
    g.strokeStyle = '#a67c00';
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = '#ff3b6b';
    g.beginPath();
    g.arc(PEDESTAL.x, cy - 2, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#37c8ff';
    g.beginPath();
    g.arc(PEDESTAL.x - 14, cy - 1, 3, 0, Math.PI * 2);
    g.arc(PEDESTAL.x + 14, cy - 1, 3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff3c4';
    g.font = 'bold 15px Georgia, serif';
    g.textAlign = 'center';
    const label = 'THE CROWN OF AURELIA';
    const lw = g.measureText(label).width + 24;
    g.fillStyle = 'rgba(10, 8, 18, 0.78)';
    g.fillRect(PEDESTAL.x - lw / 2, PEDESTAL.y + 96, lw, 24);
    g.strokeStyle = '#d4af37';
    g.lineWidth = 1.5;
    g.strokeRect(PEDESTAL.x - lw / 2, PEDESTAL.y + 96, lw, 24);
    g.fillStyle = '#fff3c4';
    g.fillText(label, PEDESTAL.x, PEDESTAL.y + 113);
  }
}

function drawDoor(g) {
  g.fillStyle = '#1c0f2e';
  g.fillRect(596, 720 - WALL, 88, WALL);
  g.fillStyle = '#ffd97a';
  g.font = 'bold 15px Georgia, serif';
  g.textAlign = 'center';
  g.fillText('EXIT', 640, 712);
  g.strokeStyle = '#d4af37';
  g.lineWidth = 3;
  g.strokeRect(596, 720 - WALL, 88, WALL);
}

/** Draws the whole ballroom: floor, carpet, walls, tables, lights, ropes and the crown pedestal. */
export function drawBallroom(g, time, laserOff, crownTaken) {
  drawParquet(g, time);
  drawCarpet(g);
  drawWallsAndWindows(g, time);
  drawTables(g, time);
  drawColumns(g);
  drawPalms(g);
  drawVelvetRopes(g);
  drawSpotlightAndCrown(g, time, laserOff, crownTaken);
  drawChandeliers(g, time);
  drawDoor(g);
}
