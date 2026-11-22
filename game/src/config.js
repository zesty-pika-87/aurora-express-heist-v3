// The Masquerade Ball — shared tuning numbers for the whole ballroom.
// One job: every size, speed, colour and timer the other modules agree on.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const WALL = 26;
export const FLOOR = { x: WALL, y: WALL, w: VIEW_W - WALL * 2, h: VIEW_H - WALL * 2 };

export const DOOR = { x: 596, y: VIEW_H - WALL, w: 88, h: 26 };

export const PEDESTAL = { x: 640, y: 348, r: 34 };
export const SPOTLIGHT_R = 132;
export const LASER_R = 118;
export const ROPE_R = 178;

export const TIMER_START = 240;

export const THIEF_SPEED = 178;
export const THIEF_R = 13;

export const GUARD_SPEED = 62;
export const GUARD_CHASE_SPEED = 132;
export const CONE_LEN = 265;
export const CONE_HALF = 0.52;

export const CAMERA_LEN = 240;
export const CAMERA_HALF = 0.42;

export const CROWD_HIDE_R = 52;

export const SMOKE_R = 118;
export const SMOKE_SECS = 6;
export const EMP_SECS = 4;
export const LOCKPICK_SECS = 2;

export const ALARM_NAMES = ['CALM', 'SUSPICIOUS', 'HUNTED', 'LOCKDOWN'];
export const ALARM_TINTS = [
  'rgba(255, 196, 90, 0.05)',
  'rgba(255, 158, 44, 0.13)',
  'rgba(214, 32, 32, 0.20)',
  'rgba(120, 4, 12, 0.30)',
];
export const ALARM_GLOW = ['#ffd97a', '#ff9e2c', '#ff2e2e', '#ff2020'];

export const TABLES = [
  { x: 168, y: 168, r: 46 },
  { x: 168, y: 540, r: 46 },
  { x: 1112, y: 168, r: 46 },
  { x: 1112, y: 540, r: 46 },
  { x: 330, y: 640, r: 40 },
  { x: 950, y: 640, r: 40 },
];

export const COLUMNS = [
  { x: 316, y: 252 },
  { x: 964, y: 252 },
  { x: 316, y: 470 },
  { x: 964, y: 470 },
];

export const CHANDELIERS = [
  { x: 640, y: 150, r: 54 },
  { x: 330, y: 150, r: 40 },
  { x: 950, y: 150, r: 40 },
];

export const WINDOWS = [150, 330, 510, 770, 950, 1130];

export const PALMS = [
  { x: 78, y: 96 },
  { x: 1202, y: 96 },
  { x: 78, y: 624 },
  { x: 1202, y: 624 },
];
