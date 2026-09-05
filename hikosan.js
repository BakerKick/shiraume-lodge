/* ============================================================
   英彦山 — the ascent to Hikosan Jingū
   ------------------------------------------------------------
   A scroll-driven climb: bronze torii → 824 steps → stone torii
   → Hōheiden. Geometry follows documented dimensions and the
   reference photographs; see docs/hikosan-reference.md.

   One unit is one metre.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

/* ── Quality tier ────────────────────────────────────────────
   Desktop gets shadows and the full instance counts; phones and
   weak GPUs get a lighter scene rather than a slideshow. */

const coarse = matchMedia('(pointer: coarse)').matches;
const cores  = navigator.hardwareConcurrency || 4;
const HIGH   = !coarse && cores >= 8 && innerWidth >= 900;

const Q = HIGH
  ? { shadows: true,  dpr: 2,   cedars: 1100, steps: 824, posts: 64, terrain: 320, roofSeg: 40, shide: true }
  : { shadows: false, dpr: 1.5, cedars: 380,  steps: 480, posts: 34, terrain: 180, roofSeg: 22, shide: false };

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Palette, eyedropped from the references ─────────────── */

const CO = {
  bronzeDark:  0x4c4c44,
  bronzePatina:0x6d8272,
  bronzeStreak:0x7a7568,
  kasagiTop:   0x62806b,
  plaqueGold:  0xc9a54a,

  stepStone:   0x77766e,
  stepMoss:    0x4a5a3a,
  granite:     0xa8a49c,
  lichen:      0xb9a89c,
  gravel:      0xb5b0a6,

  vermilion:   0xc8452a,
  postRed:     0xd94525,
  lanternMint: 0xb8d4c0,

  roofShingle: 0x5b4e44,
  timberGrey:  0x8a8076,
  renji:       0x1a1a18,
  ridgeGold:   0xc9a54a,
  ridgeVerd:   0x7fa896,
  rope:        0xc9b183,

  bark:        0x4a3b32,
  cedar:       0x2e4230,
  copper:      0x7a9a8c,
  blossom:     0xf2e2e2,
  autumn:      0xc89a6a,
  earth:       0x3f4733
};

/* ── Canvas textures ─────────────────────────────────────── */

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function finish(c, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  return t;
}
const hex = n => '#' + n.toString(16).padStart(6, '0');

/* Bronze: near-black metal, banded by the stacked cylinder joints,
   with verdigris pooling and pale mineral streaks running down. */
function bronzeTexture() {
  const c = canvas(256, 1024), x = c.getContext('2d');
  x.fillStyle = hex(CO.bronzeDark);
  x.fillRect(0, 0, 256, 1024);

  for (let i = 0; i < 220; i++) {                    // vertical mineral streaks
    const px = Math.random() * 256, w = 1 + Math.random() * 9;
    const g = x.createLinearGradient(px, 0, px + w, 0);
    g.addColorStop(0, 'rgba(122,117,104,0)');
    g.addColorStop(0.5, 'rgba(122,117,104,' + (0.06 + Math.random() * 0.3) + ')');
    g.addColorStop(1, 'rgba(122,117,104,0)');
    x.fillStyle = g;
    x.fillRect(px, Math.random() * 500, w, 400 + Math.random() * 520);
  }
  for (let i = 0; i < 70; i++) {                     // verdigris pooling
    const bx = Math.random() * 256, by = Math.random() * 1024, r = 10 + Math.random() * 60;
    const g = x.createRadialGradient(bx, by, 0, bx, by, r);
    g.addColorStop(0, 'rgba(109,130,114,' + (0.1 + Math.random() * 0.34) + ')');
    g.addColorStop(1, 'rgba(109,130,114,0)');
    x.fillStyle = g;
    x.beginPath(); x.arc(bx, by, r, 0, 6.3); x.fill();
  }
  for (let b = 0; b < 11; b++) {                     // the casting joints
    const y = 40 + b * 90;
    x.fillStyle = 'rgba(20,20,18,0.55)'; x.fillRect(0, y, 256, 5);
    x.fillStyle = 'rgba(150,146,132,0.20)'; x.fillRect(0, y + 5, 256, 2);
  }
  return finish(c);
}

/* Weathered stone. `moss` controls how much green sits in the pits. */
function stoneTexture(base, moss, speckle) {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < speckle; i++) {
    const s = 1 + Math.random() * 5;
    x.fillStyle = 'rgba(' + (90 + Math.random() * 80 | 0) + ',' +
                            (88 + Math.random() * 76 | 0) + ',' +
                            (80 + Math.random() * 68 | 0) + ',' + (0.08 + Math.random() * 0.4) + ')';
    x.fillRect(Math.random() * 256, Math.random() * 256, s, s);
  }
  for (let m = 0; m < moss; m++) {
    const mx = Math.random() * 256, my = Math.random() * 256, r = 5 + Math.random() * 26;
    const g = x.createRadialGradient(mx, my, 0, mx, my, r);
    g.addColorStop(0, 'rgba(74,90,58,' + (0.14 + Math.random() * 0.42) + ')');
    g.addColorStop(1, 'rgba(74,90,58,0)');
    x.fillStyle = g;
    x.beginPath(); x.arc(mx, my, r, 0, 6.3); x.fill();
  }
  return finish(c);
}

/* Granite for the stone torii: pale, with pink and orange lichen. */
function graniteTexture() {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = hex(CO.granite);
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const v = 150 + Math.random() * 60 | 0;
    x.fillStyle = 'rgba(' + v + ',' + (v - 4) + ',' + (v - 12) + ',' + (0.2 + Math.random() * 0.5) + ')';
    x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  const lichen = ['rgba(185,168,156,', 'rgba(196,150,120,', 'rgba(150,158,138,'];
  for (let i = 0; i < 90; i++) {
    const lx = Math.random() * 256, ly = Math.random() * 256, r = 4 + Math.random() * 20;
    const g = x.createRadialGradient(lx, ly, 0, lx, ly, r);
    g.addColorStop(0, lichen[i % 3] + (0.15 + Math.random() * 0.4) + ')');
    g.addColorStop(1, lichen[i % 3] + '0)');
    x.fillStyle = g;
    x.beginPath(); x.arc(lx, ly, r, 0, 6.3); x.fill();
  }
  return finish(c);
}

/* Kokerabuki — thin sawara shingles, laid in overlapping courses. */
function shingleTexture() {
  const c = canvas(512, 512), x = c.getContext('2d');
  x.fillStyle = hex(CO.roofShingle);
  x.fillRect(0, 0, 512, 512);
  const rows = 46, rh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rh, off = (r % 2) * 7;
    x.fillStyle = 'rgba(0,0,0,0.26)';                 // shadow under each course
    x.fillRect(0, y, 512, 1.6);
    for (let s = 0; s < 40; s++) {
      const sx = off + s * 13 + (Math.random() - 0.5) * 2.2;
      const v = 0.03 + Math.random() * 0.1;
      x.fillStyle = 'rgba(150,132,116,' + v + ')';
      x.fillRect(sx, y + 1.6, 12, rh - 1.6);
      x.fillStyle = 'rgba(0,0,0,0.14)';
      x.fillRect(sx + 12, y + 1.6, 1, rh - 1.6);
    }
  }
  return finish(c, 1, 1);
}

/* 連子窓 — the rows of fine black lattice on the Hōheiden. */
function renjiTexture() {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = hex(CO.renji);
  x.fillRect(0, 0, 256, 256);
  x.strokeStyle = 'rgba(74,68,60,0.75)';
  x.lineWidth = 2;
  for (let i = 0; i <= 14; i++) {
    const p = i * (256 / 14);
    x.beginPath(); x.moveTo(p, 0); x.lineTo(p, 256); x.stroke();
    x.beginPath(); x.moveTo(0, p); x.lineTo(256, p); x.stroke();
  }
  return finish(c);
}

/* The 1734 plaque: gold tablet, 英彦山 read top to bottom. */
function plaqueTexture() {
  const c = canvas(256, 320), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#d8b45c');
  g.addColorStop(0.5, hex(CO.plaqueGold));
  g.addColorStop(1, '#a8863a');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 320);
  x.strokeStyle = 'rgba(70,58,30,0.55)'; x.lineWidth = 7;
  x.strokeRect(10, 10, 236, 300);
  x.fillStyle = '#3d3218';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '400 68px "Shippori Mincho", "Noto Serif JP", serif';
  x.fillText('英', 128, 62); x.fillText('彦', 128, 160); x.fillText('山', 128, 258);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Forest floor: needle litter, moss and grit. Deliberately near-white —
   the terrain tints it per-vertex, so this only supplies the break-up. */
function groundTexture() {
  const c = canvas(512, 512), x = c.getContext('2d');
  x.fillStyle = '#c9c6bb';
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {                       // broad mottling
    const mx = Math.random() * 512, my = Math.random() * 512, r = 30 + Math.random() * 110;
    const g = x.createRadialGradient(mx, my, 0, mx, my, r);
    const tone = Math.random() < 0.5 ? '150,146,128' : '186,180,164';
    g.addColorStop(0, 'rgba(' + tone + ',' + (0.2 + Math.random() * 0.4) + ')');
    g.addColorStop(1, 'rgba(' + tone + ',0)');
    x.fillStyle = g;
    x.beginPath(); x.arc(mx, my, r, 0, 6.3); x.fill();
  }
  for (let i = 0; i < 5000; i++) {                     // needle litter
    const a = Math.random() * 6.3, len = 3 + Math.random() * 9;
    const px = Math.random() * 512, py = Math.random() * 512;
    x.strokeStyle = 'rgba(' + (110 + Math.random() * 60 | 0) + ',' +
                              (92 + Math.random() * 46 | 0) + ',' +
                              (66 + Math.random() * 36 | 0) + ',' + (0.1 + Math.random() * 0.35) + ')';
    x.lineWidth = 0.9;
    x.beginPath();
    x.moveTo(px, py); x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len);
    x.stroke();
  }
  for (let i = 0; i < 1400; i++) {                     // grit
    const v = 90 + Math.random() * 110 | 0;
    x.fillStyle = 'rgba(' + v + ',' + v + ',' + (v - 12) + ',' + (0.1 + Math.random() * 0.3) + ')';
    x.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  return finish(c, 88, 88);
}

/* Vertical board siding for the Hōheiden's weathered outer walls. */
function boardTexture() {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = hex(CO.timberGrey);
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 18; i++) {
    const bx = i * (256 / 18);
    const v = 0.05 + Math.random() * 0.16;
    x.fillStyle = 'rgba(60,52,44,' + v + ')';
    x.fillRect(bx, 0, 256 / 18 - 1.5, 256);
    x.fillStyle = 'rgba(30,26,22,0.35)';
    x.fillRect(bx + 256 / 18 - 1.5, 0, 1.5, 256);
  }
  for (let i = 0; i < 300; i++) {                      // grain
    x.fillStyle = 'rgba(40,34,28,' + (0.03 + Math.random() * 0.08) + ')';
    x.fillRect(Math.random() * 256, Math.random() * 256, 1, 8 + Math.random() * 40);
  }
  return finish(c);
}

/* ── Renderer, scene, camera ─────────────────────────────── */

const renderer = new THREE.WebGLRenderer({ antialias: HIGH, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q.dpr));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
if (Q.shadows) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
document.getElementById('scene').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 900);

/* ── Materials ───────────────────────────────────────────── */

const texBronze  = bronzeTexture();
const texStep    = stoneTexture('#77766e', 70, 900);
const texWall    = stoneTexture('#6b6a62', 90, 700);
const texGranite = graniteTexture();
const texShingle = shingleTexture();
const texRenji   = renjiTexture();
const texBoard   = boardTexture();
const texGravel  = stoneTexture('#b5b0a6', 10, 1200);
texGravel.repeat.set(14, 14);

const M = {
  bronze:  new THREE.MeshStandardMaterial({ map: texBronze, roughness: 0.5, metalness: 0.22 }),
  verdi:   new THREE.MeshStandardMaterial({ color: CO.kasagiTop, roughness: 0.72, metalness: 0.12 }),
  step:    new THREE.MeshStandardMaterial({ map: texStep, roughness: 0.96 }),
  wall:    new THREE.MeshStandardMaterial({ map: texWall, roughness: 0.97 }),
  granite: new THREE.MeshStandardMaterial({ map: texGranite, roughness: 0.9 }),
  gravel:  new THREE.MeshStandardMaterial({ map: texGravel, roughness: 1 }),
  earth:   new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1, vertexColors: true }),

  postRed: new THREE.MeshStandardMaterial({ color: CO.postRed, roughness: 0.58 }),
  mint:    new THREE.MeshStandardMaterial({ color: CO.lanternMint, roughness: 0.4,
             emissive: CO.lanternMint, emissiveIntensity: 0.25 }),

  shingle: new THREE.MeshStandardMaterial({ map: texShingle, roughness: 0.93 }),
  timber:  new THREE.MeshStandardMaterial({ map: texBoard, roughness: 0.9 }),
  vermil:  new THREE.MeshStandardMaterial({ color: CO.vermilion, roughness: 0.7 }),
  renji:   new THREE.MeshStandardMaterial({ map: texRenji, roughness: 0.85 }),
  gold:    new THREE.MeshStandardMaterial({ color: CO.ridgeGold, roughness: 0.45, metalness: 0.3 }),
  ridgeV:  new THREE.MeshStandardMaterial({ color: CO.ridgeVerd, roughness: 0.66, metalness: 0.12 }),
  rope:    new THREE.MeshStandardMaterial({ color: CO.rope, roughness: 1 }),
  paper:   new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 1, side: THREE.DoubleSide }),
  dark:    new THREE.MeshStandardMaterial({ color: 0x241f1a, roughness: 0.8 }),
  waniguchi: new THREE.MeshStandardMaterial({ color: 0x5a5344, roughness: 0.55, metalness: 0.25 }),

  bark:  new THREE.MeshStandardMaterial({ color: CO.bark, roughness: 0.95 }),
  cedar: new THREE.MeshStandardMaterial({ color: CO.cedar, roughness: 0.9 }),
  autumn:new THREE.MeshStandardMaterial({ color: CO.autumn, roughness: 0.9, flatShading: true }),
  bloom: new THREE.MeshStandardMaterial({ color: CO.blossom, roughness: 0.95, flatShading: true }),
  copper:new THREE.MeshStandardMaterial({ color: CO.copper, roughness: 0.6, metalness: 0.3 }),
  plaster:new THREE.MeshStandardMaterial({ color: 0xe4e0d6, roughness: 0.95 })
};

/* ── The sandō ───────────────────────────────────────────────
   ~500 m of stair climbing ~150 m, the documented gradient from
   the bronze torii up to the Hōheiden court. */

const sando = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  0,   0,   34),
  new THREE.Vector3(  0,   0,    8),
  new THREE.Vector3(  0,   0.6, -12),
  new THREE.Vector3(  2,   9,   -62),
  new THREE.Vector3( -1,  23,  -122),
  new THREE.Vector3(  3,  41,  -192),
  new THREE.Vector3( -2,  63,  -262),
  new THREE.Vector3(  1,  89,  -332),
  new THREE.Vector3( -1, 113,  -396),
  new THREE.Vector3(  0, 135,  -446),
  new THREE.Vector3(  0, 150,  -484)
], false, 'catmullrom', 0.3);

const TORII_T = 0.045;      // the bronze gate stands here
const STAIR_T = 0.075;      // steps begin just above it
const STONE_T = 0.775;      // the stone torii
const SHRINE_T = 1.0;

/* The court is a level shelf cut into the slope behind the last step. */
const COURT = (() => {
  const e = sando.getPointAt(1);
  const t2 = sando.getTangentAt(1);
  const yaw = Math.atan2(t2.x, t2.z);
  const ax = Math.sin(yaw), az = Math.cos(yaw);          // up-slope direction
  return {
    x: e.x + ax * 30, y: e.y + 1.7, z: e.z + az * 30, r: 105,
    ex: e.x, ez: e.z, ax, az
  };
})();

/* Path width tapers as the climb narrows. */
const pathWidth = t => THREE.MathUtils.lerp(5.0, 3.4, THREE.MathUtils.smoothstep(t, 0.05, 0.9));

const _tan = new THREE.Vector3();
function frameAt(t) {
  const p = sando.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
  _tan.copy(sando.getTangentAt(THREE.MathUtils.clamp(t, 0, 1)));
  const yaw = Math.atan2(_tan.x, _tan.z);
  return { p, yaw, nx: Math.cos(yaw), nz: -Math.sin(yaw) };
}

/* Coarse samples for terrain lookup. */
const SAMPLES = [];
for (let i = 0; i <= 240; i++) SAMPLES.push(sando.getPointAt(i / 240));

function nearestPath(x, z) {
  let best = 1e9, bi = 0;
  for (let i = 0; i < SAMPLES.length; i++) {
    const dx = x - SAMPLES[i].x, dz = z - SAMPLES[i].z;
    const d = dx * dx + dz * dz;
    if (d < best) { best = d; bi = i; }
  }
  return { d: Math.sqrt(best), y: SAMPLES[bi].y };
}

/* The valley floor: rises away from the path so the stair reads as
   cut into the hillside rather than laid on a plain. */
function terrainSample(x, z) {
  const n = nearestPath(x, z);

  /* Ridges and gullies, scaled up away from the path so the valley walls
     break into spurs instead of reading as one smooth sheet. */
  const spur = THREE.MathUtils.smoothstep(n.d, 18, 78);
  const relief =
      Math.sin(x * 0.021 - z * 0.052 + 2.0) * 9.5 * spur
    + Math.sin(x * 0.045 + z * 0.030) * 5.5 * spur
    + Math.sin(x * 0.088 + z * 0.071 + 0.7) * 2.2 * spur
    + Math.sin(x * 0.07) * Math.cos(z * 0.05) * 3.2
    + Math.sin(x * 0.19 + 1.3) * Math.cos(z * 0.16) * 1.5
    + Math.sin(x * 0.42) * Math.sin(z * 0.37 + 2.1) * 0.7;

  let y = n.y - 0.6 + Math.min(n.d * n.d * 0.028, 60) + relief;

  /* The court shelf: level near the shrine, easing into the hillside over a
     long apron so the slope behind is something trees can stand on rather
     than a wall. Only applied up-slope of the last step. */
  const cd = Math.hypot(x - COURT.x, z - COURT.z);
  const along = (x - COURT.ex) * COURT.ax + (z - COURT.ez) * COURT.az;
  const flat = (1 - THREE.MathUtils.smoothstep(cd, COURT.r * 0.30, COURT.r))
             * THREE.MathUtils.smoothstep(along, -4, 10);
  if (flat > 0) y = THREE.MathUtils.lerp(y, COURT.y - 0.15, flat);

  return { y, d: n.d, court: cd };
}

const terrainAt = (x, z) => terrainSample(x, z).y;

(function buildTerrain() {
  const SPAN = 1000, MID = -300;      // covers the whole climb and the court apron
  const g = new THREE.PlaneGeometry(SPAN, SPAN, Q.terrain, Q.terrain);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  const dist = new Float32Array(p.count);

  for (let v = 0; v < p.count; v++) {
    const sample = terrainSample(p.getX(v), p.getZ(v) + MID);
    p.setY(v, sample.y);
    dist[v] = sample.d;
  }
  g.translate(0, 0, MID);
  g.computeVertexNormals();

  /* Tint per vertex: rock on the steep faces, moss in the hollows, needle
     litter near the path. Without this the whole hillside is one colour. */
  const MOSS  = new THREE.Color(0x53603c);
  const DEEP  = new THREE.Color(0x38472f);   // shaded forest floor, far out
  const ROCK  = new THREE.Color(0x7b7466);
  const LITTER= new THREE.Color(0x6d5c42);
  const nrm = g.attributes.normal;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();

  for (let v = 0; v < p.count; v++) {
    const x = p.getX(v), z = p.getZ(v);
    const steep = 1 - THREE.MathUtils.clamp((nrm.getY(v) - 0.55) / 0.42, 0, 1);
    const far = THREE.MathUtils.clamp(dist[v] / 55, 0, 1);

    c.copy(MOSS).lerp(DEEP, far * 0.8);
    c.lerp(LITTER, (1 - far) * 0.28);              // litter gathers by the path
    c.lerp(ROCK, steep * 0.6);                      // and rock breaks through

    /* Break up any remaining flatness. */
    const n = Math.sin(x * 0.13) * Math.cos(z * 0.11)
            + Math.sin(x * 0.31 + 1.7) * Math.sin(z * 0.27) * 0.5;
    c.offsetHSL(n * 0.012, n * 0.03, n * 0.045);

    col[v * 3] = c.r; col[v * 3 + 1] = c.g; col[v * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const m = new THREE.Mesh(g, M.earth);
  m.receiveShadow = Q.shadows;
  scene.add(m);
})();

/* Ridges beyond the valley, so there is a horizon above the near walls
   instead of the hillside running straight into sky. */
(function buildHorizon() {
  const f = frameAt(1);
  const ahead = new THREE.Vector3(Math.sin(f.yaw), 0, Math.cos(f.yaw));
  const mat = new THREE.MeshStandardMaterial({ color: 0x6a7a72, roughness: 1, flatShading: true });

  const bands = [
    { dist: 210, h: 120, w: 560, tint: 0x6f7f76 },
    { dist: 300, h: 170, w: 760, tint: 0x83918a },
    { dist: 400, h: 215, w: 980, tint: 0x97a29a }
  ];

  bands.forEach((b, bi) => {
    const seg = 26;
    const verts = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, u = (t - 0.5) * b.w;
      const peak = b.h
        * (0.62 + 0.38 * Math.sin(t * 9.1 + bi * 2.3))
        * (0.8 + 0.2 * Math.sin(t * 21 + bi));
      verts.push(u, 0, 0, u, peak, 0);
    }
    for (let i = 0; i < seg; i++) {
      const a = i * 2, bq = a + 1, cq = a + 2, d = a + 3;
      idx.push(a, cq, d, a, d, bq);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.material.color.setHex(b.tint);
    mesh.position.set(COURT.x + ahead.x * b.dist, COURT.y - 40, COURT.z + ahead.z * b.dist);
    mesh.rotation.y = f.yaw;
    scene.add(mesh);
  });
})();

/* ── The 824 steps ───────────────────────────────────────────
   Each tread is two or three irregular slabs, as in the photographs —
   never a single cut block. */

function roughSlab() {
  const g = new THREE.BoxGeometry(1, 1, 1, 2, 1, 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i,
      p.getX(i) + (Math.random() - 0.5) * 0.16,
      p.getY(i) + (Math.random() - 0.5) * 0.1,
      p.getZ(i) + (Math.random() - 0.5) * 0.16);
  }
  g.computeVertexNormals();
  return g;
}

const RISER = 150 / 824;                       // real rise spread over the real count

(function buildStair() {
  const perTread = 3;
  const total = Q.steps * perTread;
  const mesh = new THREE.InstancedMesh(roughSlab(), M.step, total);
  mesh.castShadow = mesh.receiveShadow = Q.shadows;

  const mtx = new THREE.Matrix4(), qt = new THREE.Quaternion();
  const pos = new THREE.Vector3(), scl = new THREE.Vector3(), eu = new THREE.Euler();
  let n = 0;

  for (let s = 0; s < Q.steps; s++) {
    const t = STAIR_T + (1 - STAIR_T) * (s / Q.steps);
    const f = frameAt(t);
    const w = pathWidth(t);
    const y = Math.round(f.p.y / RISER) * RISER;

    for (let k = 0; k < perTread; k++) {
      const lat = (k / (perTread - 1) - 0.5) * w * 0.74 + (Math.random() - 0.5) * 0.3;
      pos.set(f.p.x + f.nx * lat, y - 0.09, f.p.z + f.nz * lat);
      eu.set((Math.random() - 0.5) * 0.05, f.yaw + (Math.random() - 0.5) * 0.16, (Math.random() - 0.5) * 0.04);
      qt.setFromEuler(eu);
      scl.set(w / perTread * (0.95 + Math.random() * 0.22), 0.2 + Math.random() * 0.08, 0.62 + Math.random() * 0.16);
      mesh.setMatrixAt(n++, mtx.compose(pos, qt, scl));
    }
  }
  mesh.count = n;
  scene.add(mesh);
})();

/* Rough retaining walls, and the 坊跡 terraces stepping up behind them. */
(function buildWalls() {
  const blocks = Math.floor(Q.steps * 0.9);
  const mesh = new THREE.InstancedMesh(roughSlab(), M.wall, blocks * 2 + 300);
  mesh.castShadow = mesh.receiveShadow = Q.shadows;
  const mtx = new THREE.Matrix4(), qt = new THREE.Quaternion();
  const pos = new THREE.Vector3(), scl = new THREE.Vector3(), eu = new THREE.Euler();
  let n = 0;

  for (let i = 0; i < blocks; i++) {
    const t = STAIR_T + (1 - STAIR_T) * (i / blocks);
    const f = frameAt(t);
    const w = pathWidth(t), y = Math.round(f.p.y / RISER) * RISER;
    for (let k = 0; k < 2; k++) {
      const sg = k ? 1 : -1, lat = sg * (w / 2 + 0.55);
      pos.set(f.p.x + f.nx * lat, y + 0.2, f.p.z + f.nz * lat);
      eu.set(0, f.yaw + (Math.random() - 0.5) * 0.2, 0); qt.setFromEuler(eu);
      scl.set(1.15 + Math.random() * 0.35, 0.5 + Math.random() * 0.45, 0.72);
      mesh.setMatrixAt(n++, mtx.compose(pos, qt, scl));
    }
  }

  /* Terraced lodging platforms — the ruins that line the whole climb. */
  for (let i = 0; i < 300 && n < mesh.instanceCount; i++) {
    const t = 0.1 + Math.random() * 0.82;
    const f = frameAt(t);
    const sg = Math.random() < 0.5 ? 1 : -1;
    const lat = sg * (pathWidth(t) / 2 + 4.5 + Math.random() * 9);
    const x = f.p.x + f.nx * lat, z = f.p.z + f.nz * lat;
    pos.set(x, terrainAt(x, z) + 0.6 + Math.random() * 1.4, z);
    eu.set(0, f.yaw + (Math.random() - 0.5) * 0.4, 0); qt.setFromEuler(eu);
    scl.set(1.4 + Math.random() * 2.2, 0.5 + Math.random() * 0.9, 0.8 + Math.random() * 0.5);
    mesh.setMatrixAt(n++, mtx.compose(pos, qt, scl));
  }
  mesh.count = n;
  scene.add(mesh);
})();

/* ── Shared shapes ───────────────────────────────────────── */

function chamferShape(w, h, ch) {
  const s = new THREE.Shape(), x = w / 2, y = h / 2;
  s.moveTo(-x + ch, -y); s.lineTo(x - ch, -y); s.lineTo(x, -y + ch); s.lineTo(x, y - ch);
  s.lineTo(x - ch, y); s.lineTo(-x + ch, y); s.lineTo(-x, y - ch); s.lineTo(-x, -y + ch);
  s.closePath();
  return s;
}
function chamferBox(w, h, d, ch) {
  const g = new THREE.ExtrudeGeometry(chamferShape(w, h, ch), { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return g;
}

/* A 反り curve — flat through the middle, lifting toward the ends. */
function soriCurve(y, span, lift, power) {
  const pts = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    pts.push(new THREE.Vector3(
      THREE.MathUtils.lerp(-span, span, t),
      y + Math.pow(Math.abs(t - 0.5) * 2, power || 2.3) * lift, 0));
  }
  return new THREE.CatmullRomCurve3(pts);
}
function sweepAlong(w, h, curve) {
  return new THREE.ExtrudeGeometry(chamferShape(w, h, 0.03),
    { extrudePath: curve, steps: HIGH ? 40 : 22, bevelEnabled: false });
}

function place(obj, t, lateral, lift) {
  const f = frameAt(t);
  const y = Math.round(f.p.y / RISER) * RISER;
  obj.position.set(f.p.x + f.nx * (lateral || 0), y + (lift || 0), f.p.z + f.nz * (lateral || 0));
  obj.rotation.y = f.yaw;
  return obj;
}
function shadowed(o) {
  o.traverse(n => { if (n.isMesh) { n.castShadow = Q.shadows; n.receiveShadow = Q.shadows; } });
  return o;
}

/* ── 銅の鳥居 — the bronze torii, 1637 ───────────────────────
   7 m tall, pillars just over 3 m around. Built as stacked cylinder
   sections, so the banding in the texture is the casting joints. */

function bronzeTorii() {
  const g = new THREE.Group();
  const H = 5.55, PX = 2.3, LEAN = 0.038, R0 = 0.50, R1 = 0.40;

  for (let i = 0; i < 2; i++) {
    const sg = i ? 1 : -1;

    const col = new THREE.Mesh(new THREE.CylinderGeometry(R1, R0, H, 28), M.bronze);
    col.position.set(sg * PX, H / 2, 0);
    col.rotation.z = -sg * LEAN;
    g.add(col);

    /* The bulbous flared moulding where the column meets the ground. */
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 1.12, R0 * 1.62, 0.34, 24), M.bronze);
    foot.position.set(sg * PX, 0.17, 0);
    g.add(foot);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(R0 * 1.2, 0.1, 8, 24), M.bronze);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(sg * PX, 0.36, 0);
    g.add(collar);

    const plinth = new THREE.Mesh(chamferBox(1.7, 0.26, 1.7, 0.05), M.granite);
    plinth.position.set(sg * PX, 0.13, 0);
    g.add(plinth);

    /* Daiwa — the block under the lintel. */
    const daiwa = new THREE.Mesh(new THREE.CylinderGeometry(R1 * 1.42, R1 * 1.46, 0.22, 20), M.bronze);
    daiwa.position.set(sg * PX - sg * LEAN * H * 0.5, H - 0.09, 0);
    g.add(daiwa);
  }

  /* Kasagi over shimagi. Verdigris sits on the top face only. */
  const shimagi = new THREE.Mesh(sweepAlong(0.78, 0.30, soriCurve(H + 0.22, 3.95, 0.46)), M.bronze);
  g.add(shimagi);
  const kasagi = new THREE.Mesh(sweepAlong(0.92, 0.34, soriCurve(H + 0.56, 4.15, 0.50)), M.bronze);
  g.add(kasagi);
  const cap = new THREE.Mesh(sweepAlong(0.96, 0.09, soriCurve(H + 0.76, 4.17, 0.50)), M.verdi);
  g.add(cap);

  /* Nuki, passing through and protruding both sides. */
  const nuki = new THREE.Mesh(chamferBox(6.2, 0.34, 0.46, 0.03), M.bronze);
  nuki.position.set(0, H - 1.15, 0);
  g.add(nuki);

  /* Gakuzuka and the 1734 plaque in its scrollwork frame. */
  const zuka = new THREE.Mesh(chamferBox(0.42, 1.02, 0.34, 0.02), M.bronze);
  zuka.position.set(0, H - 0.55, 0);
  g.add(zuka);

  const FACE = 0.2;                                    // local +z faces the approach
  const frame = new THREE.Mesh(chamferBox(1.16, 1.36, 0.16, 0.04), M.verdi);
  frame.position.set(0, H - 0.52, FACE);
  g.add(frame);
  for (let i = 0; i < 2; i++) {                        // the curled scroll ends on top
    const sg = i ? 1 : -1;
    const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.06, 6, 14), M.verdi);
    scroll.position.set(sg * 0.5, H + 0.2, FACE);
    g.add(scroll);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.0, 10), M.verdi);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, H + 0.2, FACE);
  g.add(bar);

  const tablet = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.02),
    new THREE.MeshStandardMaterial({ map: plaqueTexture(), roughness: 0.5, metalness: 0.15 }));
  tablet.position.set(0, H - 0.52, FACE + 0.085);
  g.add(tablet);

  return shadowed(g);
}

/* Komainu on tall pedestals, flanking the gate. */
function komainu(flip) {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(chamferBox(0.9, 2.0, 0.9, 0.05), M.granite);
  ped.position.y = 1.0;
  g.add(ped);
  const cap = new THREE.Mesh(chamferBox(1.15, 0.16, 1.15, 0.04), M.granite);
  cap.position.y = 2.08;
  g.add(cap);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), M.granite);
  body.scale.set(1, 0.86, 1.5);
  body.position.set(0, 2.46, -0.06);
  g.add(body);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.6, 8), M.granite);
  chest.position.set(0, 2.6, 0.3);
  g.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), M.granite);
  head.position.set(0, 3.0, 0.34);
  g.add(head);
  const mane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), M.granite);
  mane.position.set(0, 2.96, 0.24);
  g.add(mane);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 6), M.granite);
  tail.position.set(0, 2.82, -0.44);
  tail.rotation.x = -0.5;
  g.add(tail);

  g.rotation.y = flip ? Math.PI : 0;
  return shadowed(g);
}

/* ── 二の鳥居 — the stone gate ───────────────────────────────
   Granite, lichen-mottled, with a bamboo pole and four shide. */

function stoneTorii() {
  const g = new THREE.Group();
  const H = 3.9, PX = 1.75, R0 = 0.30, R1 = 0.26;

  for (let i = 0; i < 2; i++) {
    const sg = i ? 1 : -1;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(R1, R0, H, 20), M.granite);
    col.position.set(sg * PX, H / 2, 0);
    col.rotation.z = -sg * 0.032;
    g.add(col);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 1.5, R0 * 1.7, 0.22, 18), M.granite);
    base.position.set(sg * PX, 0.11, 0);
    g.add(base);
    const daiwa = new THREE.Mesh(new THREE.CylinderGeometry(R1 * 1.5, R1 * 1.5, 0.24, 16), M.granite);
    daiwa.position.set(sg * PX, H - 0.1, 0);
    g.add(daiwa);
  }

  g.add(new THREE.Mesh(sweepAlong(0.5, 0.28, soriCurve(H + 0.16, 2.72, 0.26, 2.6)), M.granite));
  g.add(new THREE.Mesh(sweepAlong(0.6, 0.26, soriCurve(H + 0.44, 2.86, 0.28, 2.6)), M.granite));

  const nuki = new THREE.Mesh(chamferBox(4.35, 0.28, 0.34, 0.03), M.granite);
  nuki.position.set(0, H - 0.78, 0);
  g.add(nuki);

  const zuka = new THREE.Mesh(chamferBox(0.62, 0.78, 0.2, 0.03), M.granite);
  zuka.position.set(0, H - 0.28, 0.02);
  g.add(zuka);

  /* Bamboo pole slung between the columns, with paper shide. */
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, PX * 2, 10), M.rope);
  pole.rotation.z = Math.PI / 2;
  pole.position.set(0, H - 1.5, 0.1);
  g.add(pole);
  if (Q.shide) {
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.46), M.paper);
      s.position.set(-0.95 + i * 0.63, H - 1.76, 0.12);
      g.add(s);
    }
  }
  return shadowed(g);
}

/* ── Lanterns ────────────────────────────────────────────────
   The vermilion posts are modern donations and they dominate the
   stair in every photograph; the stone ones are older and sparser. */

function stoneLantern(scale) {
  const g = new THREE.Group();
  const add = (geo, y) => { const m = new THREE.Mesh(geo, M.granite); m.position.y = y; g.add(m); };
  add(new THREE.CylinderGeometry(0.34, 0.42, 0.28, 8), 0.14);
  add(new THREE.CylinderGeometry(0.15, 0.17, 0.86, 8), 0.71);
  add(new THREE.CylinderGeometry(0.36, 0.28, 0.18, 8), 1.23);
  add(new THREE.CylinderGeometry(0.26, 0.26, 0.44, 6), 1.54);
  add(new THREE.ConeGeometry(0.48, 0.32, 6), 1.92);
  add(new THREE.SphereGeometry(0.09, 8, 6), 2.13);
  g.scale.setScalar(scale || 1);
  return shadowed(g);
}

(function buildLanternPosts() {
  const N = Q.posts;
  const postG = new THREE.BoxGeometry(0.11, 2.5, 0.11);
  const boxG  = new THREE.BoxGeometry(0.42, 0.4, 0.42);
  const capG  = new THREE.ConeGeometry(0.42, 0.2, 4);
  const paneG = new THREE.PlaneGeometry(0.3, 0.28);

  const posts = new THREE.InstancedMesh(postG, M.postRed, N * 2);
  const boxes = new THREE.InstancedMesh(boxG, M.postRed, N * 2);
  const caps  = new THREE.InstancedMesh(capG, M.postRed, N * 2);
  const panes = new THREE.InstancedMesh(paneG, M.mint, N * 2);
  [posts, boxes, caps].forEach(m => { m.castShadow = Q.shadows; });

  const mtx = new THREE.Matrix4(), qt = new THREE.Quaternion();
  const pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), eu = new THREE.Euler();
  let n = 0;

  for (let i = 0; i < N; i++) {
    const t = 0.09 + (i / N) * 0.84;
    const f = frameAt(t);
    const y = Math.round(f.p.y / RISER) * RISER;
    const lat = pathWidth(t) / 2 + 0.75;
    const fx = Math.sin(f.yaw), fz = Math.cos(f.yaw);      // down-path direction
    for (let k = 0; k < 2; k++) {
      const sg = k ? 1 : -1;
      const x = f.p.x + f.nx * sg * lat, z = f.p.z + f.nz * sg * lat;
      eu.set(0, f.yaw, 0); qt.setFromEuler(eu);

      pos.set(x, y + 1.25, z); posts.setMatrixAt(n, mtx.compose(pos, qt, one));
      pos.set(x, y + 2.62, z); boxes.setMatrixAt(n, mtx.compose(pos, qt, one));
      pos.set(x, y + 2.92, z); caps .setMatrixAt(n, mtx.compose(pos, qt, one));

      /* the lit pane faces back down the stair, at whoever is climbing */
      eu.set(0, f.yaw + Math.PI, 0); qt.setFromEuler(eu);
      pos.set(x - fx * 0.215, y + 2.62, z - fz * 0.215);
      panes.setMatrixAt(n, mtx.compose(pos, qt, one));
      n++;
    }
  }
  [posts, boxes, caps, panes].forEach(m => { m.count = n; scene.add(m); });
})();

/* Stone lanterns interspersed along the climb. */
for (let i = 0; i < (HIGH ? 18 : 10); i++) {
  const t = 0.12 + (i / (HIGH ? 18 : 10)) * 0.8;
  const sg = i % 2 ? 1 : -1;
  scene.add(place(stoneLantern(1), t, sg * (pathWidth(t) / 2 + 2.0), 0));
}

/* ── 奉幣殿 — the Hōheiden, rebuilt 1616 ─────────────────────
   About 33 m across and 16 m tall. The roof is the building: a
   kokerabuki shingle irimoya with a deep concave 反り, carried on
   an outer colonnade of bare weathered timber. Only the inner core
   is vermilion — the outer posts are unpainted, which is what the
   photographs show and what the written sources get wrong. */

/* Lower hip: concentric rings from the eave up to the inner rectangle,
   rising on a sori profile so the sweep is shallow at the eave and
   steep near the ridge. */
const TILE = 2.0;   // metres covered by one shingle texture tile

function hipSurface(A, B, ia, ib, eaveY, midY, rings, flare) {
  const cols = 4 * 12;
  const verts = [], uvs = [], idx = [];
  const perim = 2 * (A + B), slope = Math.hypot(A - ia, midY - eaveY);

  for (let r = 0; r <= rings; r++) {
    const s = r / rings;
    const a = THREE.MathUtils.lerp(A, ia, s), b = THREE.MathUtils.lerp(B, ib, s);
    const base = THREE.MathUtils.lerp(eaveY, midY, Math.pow(s, 2.2));

    for (let c = 0; c < cols; c++) {
      /* walk the rectangle perimeter */
      const u = (c / cols) * 4, side = Math.floor(u), f = u - side;
      let x, z;
      if (side === 0)      { x = THREE.MathUtils.lerp(-a, a, f); z = -b; }
      else if (side === 1) { x = a; z = THREE.MathUtils.lerp(-b, b, f); }
      else if (side === 2) { x = THREE.MathUtils.lerp(a, -a, f); z = b; }
      else                 { x = -a; z = THREE.MathUtils.lerp(b, -b, f); }

      /* the eave edge tips up, and more so toward the corners */
      const corner = Math.min(Math.abs(x) / a, 1) * Math.min(Math.abs(z) / b, 1);
      const lift = flare * Math.pow(Math.max(0, 1 - s / 0.22), 2) * (0.45 + corner * 1.5);
      verts.push(x, base + lift, z);
      uvs.push((c / cols) * perim / TILE, s * slope / TILE);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let c = 0; c < cols; c++) {
      const c2 = (c + 1) % cols;
      const a0 = r * cols + c, a1 = r * cols + c2;
      const b0 = (r + 1) * cols + c, b1 = (r + 1) * cols + c2;
      idx.push(a0, b0, b1, a0, b1, a1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* Upper gable: two curved slopes to the ridge, with the vertical
   triangular ends that make it irimoya rather than a plain hip. */
function gableSurface(ia, ib, midY, ridgeY, steps) {
  const verts = [], uvs = [], idx = [], cols = steps, rows = steps;
  const slope = Math.hypot(ib, ridgeY - midY);
  for (let half = 0; half < 2; half++) {
    const sgz = half ? -1 : 1;
    for (let r = 0; r <= rows; r++) {
      const s = r / rows;
      const z0 = THREE.MathUtils.lerp(sgz * ib, 0, s);
      const y = THREE.MathUtils.lerp(midY, ridgeY, Math.pow(s, 0.62));
      for (let c = 0; c <= cols; c++) {
        verts.push(THREE.MathUtils.lerp(-ia, ia, c / cols), y, z0);
        uvs.push((c / cols) * (2 * ia) / TILE, s * slope / TILE);
      }
    }
  }
  const front = (rows + 1) * (cols + 1);
  for (let half = 0; half < 2; half++) {
    const o = half * front;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a0 = o + r * (cols + 1) + c, a1 = a0 + 1;
        const b0 = a0 + (cols + 1), b1 = b0 + 1;
        if (half === 0) idx.push(a0, b0, b1, a0, b1, a1);
        else            idx.push(a0, b1, b0, a0, a1, b1);
      }
    }
  }
  /* Vertical triangular ends — this is what makes it irimoya and not a hip. */
  for (const sx of [-ia, ia]) {
    const o = verts.length / 3;
    verts.push(sx, midY, ib, sx, midY, -ib, sx, ridgeY, 0);
    uvs.push(0, 0, 2 * ib / TILE, 0, ib / TILE, slope / TILE);
    if (sx < 0) idx.push(o, o + 1, o + 2);
    else        idx.push(o, o + 2, o + 1);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function hoheiden() {
  const g = new THREE.Group();

  const RA = 16.5, RB = 14;            // roof half-extents — the 33 m span
  const BW = 25, BD = 17;              // body footprint, 7 bays by 5
  const COL_H = 5.4;
  const EAVE = COL_H + 0.9, MID = EAVE + 6.4, RIDGE = MID + 3.4;   // ~16 m overall

  /* Stone terrace and the veranda deck. */
  const terrace = new THREE.Mesh(chamferBox(BW + 5, 1.7, BD + 5, 0.15), M.granite);
  terrace.position.y = -0.85;
  g.add(terrace);
  const deck = new THREE.Mesh(chamferBox(BW + 2.6, 0.42, BD + 2.6, 0.06), M.timber);
  deck.position.y = 0.21;
  g.add(deck);

  /* Outer colonnade — bare weathered timber, seven bays. */
  const bayX = BW / 7, bayZ = BD / 5;
  for (let i = 0; i <= 7; i++) {
    for (let k = 0; k < 2; k++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.32, COL_H, 12), M.timber);
      col.position.set(-BW / 2 + i * bayX, COL_H / 2 + 0.4, (k ? 1 : -1) * BD / 2);
      g.add(col);
    }
  }
  for (let i = 1; i < 5; i++) {
    for (let k = 0; k < 2; k++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.32, COL_H, 12), M.timber);
      col.position.set((k ? 1 : -1) * BW / 2, COL_H / 2 + 0.4, -BD / 2 + i * bayZ);
      g.add(col);
    }
  }

  /* Grey boarding above the colonnade, and the white frieze under the eave. */
  const upper = new THREE.Mesh(chamferBox(BW + 0.3, 1.5, BD + 0.3, 0.04), M.timber);
  upper.position.y = COL_H + 0.3;
  g.add(upper);
  const frieze = new THREE.Mesh(chamferBox(BW + 0.6, 0.34, BD + 0.6, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9 }));
  frieze.position.y = COL_H + 1.16;
  g.add(frieze);
  for (let i = 0; i < 46; i++) {                       // the black dashes along it
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.08), M.dark);
    const p = (i / 46) * 4, side = Math.floor(p), f = p - side;
    if (side === 0)      dash.position.set(THREE.MathUtils.lerp(-BW / 2, BW / 2, f), COL_H + 1.16, BD / 2 + 0.32);
    else if (side === 1) { dash.position.set(BW / 2 + 0.32, COL_H + 1.16, THREE.MathUtils.lerp(BD / 2, -BD / 2, f)); dash.rotation.y = Math.PI / 2; }
    else if (side === 2) dash.position.set(THREE.MathUtils.lerp(BW / 2, -BW / 2, f), COL_H + 1.16, -BD / 2 - 0.32);
    else                 { dash.position.set(-BW / 2 - 0.32, COL_H + 1.16, THREE.MathUtils.lerp(-BD / 2, BD / 2, f)); dash.rotation.y = Math.PI / 2; }
    g.add(dash);
  }

  /* The vermilion core, set in behind the colonnade. */
  const CW = BW - 7, CD = BD - 6;
  const core = new THREE.Mesh(chamferBox(CW, COL_H - 0.5, CD, 0.05), M.vermil);
  core.position.set(0, (COL_H - 0.5) / 2 + 0.45, -0.6);
  g.add(core);
  const base = new THREE.Mesh(chamferBox(CW + 0.3, 1.1, CD + 0.3, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xd4502c, roughness: 0.68 }));
  base.position.set(0, 0.95, -0.6);
  g.add(base);

  /* Rows of black renji lattice — the strongest pattern on the facade. */
  for (let i = 0; i < 6; i++) {
    const w = CW / 6 - 0.35;
    const fr = new THREE.Mesh(chamferBox(w + 0.3, 2.4, 0.12, 0.02), M.vermil);
    fr.position.set(-CW / 2 + (i + 0.5) * (CW / 6), 3.5, -0.6 + CD / 2 + 0.02);
    g.add(fr);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.1), M.renji);
    win.position.set(fr.position.x, 3.5, -0.6 + CD / 2 + 0.1);   // in front of its frame
    g.add(win);
  }

  /* Centre bay: shimenawa, shide, and the waniguchi gong beneath it. */
  const shime = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.4, 12), M.rope);
  shime.rotation.z = Math.PI / 2;
  shime.position.set(0, 4.5, -0.6 + CD / 2 + 0.5);
  g.add(shime);
  if (Q.shide) {
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.6), M.paper);
      s.position.set(-1.7 + i * 0.85, 4.05, -0.6 + CD / 2 + 0.52);
      g.add(s);
    }
  }
  const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.34, 16), M.waniguchi);
  gong.rotation.x = Math.PI / 2;
  gong.position.set(0, 3.6, -0.6 + CD / 2 + 0.55);
  g.add(gong);
  for (let k = 0; k < 2; k++) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 8), M.paper);
    rope.position.set((k ? 1 : -1) * 1.5, 2.5, -0.6 + CD / 2 + 0.5);
    g.add(rope);
  }

  /* Vermilion balustrade around the veranda. */
  for (let i = 0; i < 40; i++) {
    const p = (i / 40) * 4, side = Math.floor(p), f = p - side;
    const bal = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), M.vermil);
    if (side === 0)      bal.position.set(THREE.MathUtils.lerp(-BW / 2 - 1, BW / 2 + 1, f), 0.82, BD / 2 + 1.2);
    else if (side === 1) bal.position.set(BW / 2 + 1.2, 0.82, THREE.MathUtils.lerp(BD / 2, -BD / 2, f));
    else if (side === 2) bal.position.set(THREE.MathUtils.lerp(BW / 2, -BW / 2, f), 0.82, -BD / 2 - 1.2);
    else                 bal.position.set(-BW / 2 - 1.2, 0.82, THREE.MathUtils.lerp(-BD / 2, BD / 2, f));
    g.add(bal);
  }

  /* The roof. */
  const lower = new THREE.Mesh(hipSurface(RA, RB, RA * 0.5, RB * 0.4, EAVE, MID, Q.roofSeg, 1.8), M.shingle);
  g.add(lower);
  const upperRoof = new THREE.Mesh(gableSurface(RA * 0.5, RB * 0.4, MID, RIDGE, Q.roofSeg), M.shingle);
  g.add(upperRoof);

  /* Ridge, with its gold crests and verdigris end caps. */
  const ridge = new THREE.Mesh(chamferBox(RA * 1.02, 0.5, 0.9, 0.06), M.dark);
  ridge.position.y = RIDGE + 0.12;
  g.add(ridge);
  for (let i = 0; i < 5; i++) {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.36, 4), M.gold);
    crest.position.set(-RA * 0.4 + i * (RA * 0.2), RIDGE + 0.5, 0);
    g.add(crest);
  }
  for (let k = 0; k < 2; k++) {
    const capV = new THREE.Mesh(chamferBox(0.5, 0.8, 1.1, 0.06), M.ridgeV);
    capV.position.set((k ? 1 : -1) * RA * 0.52, RIDGE + 0.28, 0);
    g.add(capV);
  }

  /* Front steps up from the court. */
  for (let i = 0; i < 4; i++) {
    const st = new THREE.Mesh(chamferBox(7 - i * 0.4, 0.3, 1.0, 0.04), M.granite);
    st.position.set(0, -1.55 + i * 0.34, BD / 2 + 3.4 - i * 0.9);
    g.add(st);
  }

  return shadowed(g);
}

/* Place the shrine, its court, and what stands around it. */
(function placeShrine() {
  const f = frameAt(SHRINE_T);
  const baseY = Math.round(f.p.y / RISER) * RISER;

  const ahead = new THREE.Vector3(Math.sin(f.yaw), 0, Math.cos(f.yaw));   // up-slope
  const at = (fwd, side) => new THREE.Vector3(
    COURT.x + ahead.x * fwd + f.nx * side,
    COURT.y,
    COURT.z + ahead.z * fwd + f.nz * side);
  void baseY;

  const court = new THREE.Mesh(new THREE.CircleGeometry(40, 48), M.gravel);
  court.rotation.x = -Math.PI / 2;
  court.position.copy(at(0, 0)).setY(COURT.y + 0.02);
  court.receiveShadow = Q.shadows;
  scene.add(court);

  const shrine = hoheiden();
  shrine.position.copy(at(19, 0));
  shrine.rotation.y = f.yaw + Math.PI;
  scene.add(shrine);

  for (let k = 0; k < 2; k++) {
    const l = stoneLantern(1.5);
    l.position.copy(at(-1, k ? 6 : -6));
    scene.add(l);
  }

  const st = stoneTorii();
  st.scale.setScalar(1.35);
  st.position.copy(at(4, 20));
  st.rotation.y = f.yaw + Math.PI / 2;
  scene.add(st);

  /* A sacred cedar, roped, on the slope behind the shrine. */
  const cedarAt = at(46, 40);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 34, 10), M.bark);
  trunk.position.copy(cedarAt).setY(COURT.y + 15);
  scene.add(trunk);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(3.2, 30, 8), M.cedar);
  crown.position.copy(cedarAt).setY(COURT.y + 32);
  scene.add(crown);
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(4.6, 18, 8), M.cedar);
  skirt.position.copy(cedarAt).setY(COURT.y + 21);
  scene.add(skirt);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.22, 0.7, 12), M.rope);
  band.position.copy(cedarAt).setY(COURT.y + 5);
  scene.add(band);
})();

/* The bronze gate, its komainu, and the paved apron before the climb. */
(function placeGate() {
  scene.add(place(bronzeTorii(), TORII_T, 0, 0));
  scene.add(place(komainu(false), TORII_T, -4.4, 0));
  scene.add(place(komainu(true),  TORII_T,  4.4, 0));

  const f = frameAt(TORII_T);
  const apron = new THREE.Mesh(new THREE.CircleGeometry(9, 24), M.step);
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(f.p.x, Math.round(f.p.y / RISER) * RISER + 0.02, f.p.z + 2);
  apron.receiveShadow = Q.shadows;
  scene.add(apron);

  /* A shukubō beside the gate — white plaster, verdigris copper roof. */
  const bo = new THREE.Group();
  bo.add(new THREE.Mesh(chamferBox(9, 5, 7, 0.1), M.plaster).translateY(2.5));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 2.4, 4, 1), M.copper);
  roof.scale.set(8, 1, 6.2);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 5.6;
  bo.add(roof);
  const boPlaced = place(shadowed(bo), TORII_T + 0.03, -19, 0);
  boPlaced.position.y = terrainAt(boPlaced.position.x, boPlaced.position.z) - 2.2;
  scene.add(boPlaced);
})();

/* The stone gate partway up. */
scene.add(place(stoneTorii(), STONE_T, 0, 0));

/* ── The forest ──────────────────────────────────────────────
   Cherry and coppery deciduous low down where the lodgings were,
   giving way to cedar as the climb steepens. */

(function buildForest() {
  const BEHIND = HIGH ? 420 : 140;         // reserved for the slope behind the court
  const N = Q.cedars, CAP = N + BEHIND;
  const trunkG = new THREE.CylinderGeometry(0.3, 0.75, 26, 6);
  const coneG  = new THREE.ConeGeometry(1.9, 32, 7);
  const cone2G = new THREE.ConeGeometry(2.8, 20, 7);
  const blobG  = new THREE.IcosahedronGeometry(2.6, 0);

  const trunks = new THREE.InstancedMesh(trunkG, M.bark, CAP);
  const crowns = new THREE.InstancedMesh(coneG, M.cedar, CAP);
  const skirts = new THREE.InstancedMesh(cone2G, M.cedar, CAP);
  const low    = new THREE.InstancedMesh(blobG, M.autumn, Math.floor(N * 0.3));
  const bloom  = new THREE.InstancedMesh(blobG, M.bloom, Math.floor(N * 0.18));
  trunks.castShadow = crowns.castShadow = skirts.castShadow = Q.shadows;

  const mtx = new THREE.Matrix4(), qt = new THREE.Quaternion();
  const pos = new THREE.Vector3(), scl = new THREE.Vector3(), eu = new THREE.Euler();
  let n = 0, nl = 0, nb = 0, guard = 0;

  while (n < N && guard++ < N * 24) {
    /* Cluster along the corridor rather than scattering over the whole map. */
    const t = Math.random();
    const f = frameAt(t);
    const sg = Math.random() < 0.5 ? 1 : -1;
    /* Weighted toward the path so the ravine walls are wooded, not empty. */
    const lat = sg * (pathWidth(t) / 2 + 3.2 + Math.pow(Math.random(), 1.7) * 52);
    const x = f.p.x + f.nx * lat + (Math.random() - 0.5) * 10;
    const z = f.p.z + f.nz * lat + (Math.random() - 0.5) * 10;
    if (nearestPath(x, z).d < pathWidth(t) / 2 + 2.4) continue;
    if (Math.hypot(x - COURT.x, z - COURT.z) < 40) continue;   // keep the court clear

    const gy = terrainAt(x, z), hs = 0.7 + Math.random() * 1.0;
    eu.set(0, Math.random() * 6.3, 0); qt.setFromEuler(eu); scl.set(hs, hs, hs);

    pos.set(x, gy + 11 * hs, z);    trunks.setMatrixAt(n, mtx.compose(pos, qt, scl));
    pos.set(x, gy + 28 * hs, z);    crowns.setMatrixAt(n, mtx.compose(pos, qt, scl));
    pos.set(x, gy + 17 * hs, z);    skirts.setMatrixAt(n, mtx.compose(pos, qt, scl));
    n++;

    /* Low canopy near the gate and the lodging ruins. */
    if (t < 0.4 && nl < low.instanceCount && Math.random() < 0.55) {
      const s2 = 0.7 + Math.random() * 0.7;
      scl.set(s2, s2 * 0.8, s2);
      pos.set(x + (Math.random() - 0.5) * 8, gy + 5 * s2, z + (Math.random() - 0.5) * 8);
      low.setMatrixAt(nl++, mtx.compose(pos, qt, scl));
    }
    if (t < 0.3 && nb < bloom.instanceCount && Math.random() < 0.4) {
      const s3 = 0.55 + Math.random() * 0.5;
      scl.set(s3, s3 * 0.85, s3);
      pos.set(x + (Math.random() - 0.5) * 9, gy + 4.6 * s3, z + (Math.random() - 0.5) * 9);
      bloom.setMatrixAt(nb++, mtx.compose(pos, qt, scl));
    }
  }
  /* The slope rising behind the court, which the path never reaches. */
  const behind = BEHIND;
  for (let i = 0; i < behind; i++) {
    const a = Math.random() * Math.PI * 2;
    const rad = 42 + Math.pow(Math.random(), 0.8) * 130;
    const x = COURT.x + Math.cos(a) * rad, z = COURT.z + Math.sin(a) * rad;
    const gy = terrainAt(x, z), hs = 0.8 + Math.random() * 1.1;
    eu.set(0, Math.random() * 6.3, 0); qt.setFromEuler(eu); scl.set(hs, hs, hs);
    /* Sunk slightly: the terrain mesh samples every ~3 m, so an exactly
       seated trunk can still hang over a dip between samples. */
    pos.set(x, gy + 10 * hs, z);  trunks.setMatrixAt(n, mtx.compose(pos, qt, scl));
    pos.set(x, gy + 26 * hs, z);  crowns.setMatrixAt(n, mtx.compose(pos, qt, scl));
    pos.set(x, gy + 15 * hs, z);  skirts.setMatrixAt(n, mtx.compose(pos, qt, scl));
    n++;
  }

  trunks.count = crowns.count = skirts.count = n;
  low.count = nl; bloom.count = nb;
  scene.add(trunks, crowns, skirts, low, bloom);
})();

/* ── Light and air ───────────────────────────────────────── */

const SKY = {
  low:  new THREE.Color(0x97a89d),   // hazy green light under the trees
  mid:  new THREE.Color(0xbfc7bc),   // sun coming down the axis of the stair
  high: new THREE.Color(0xe9e9e3)    // overcast white at the court
};

scene.background = SKY.low.clone();
scene.fog = new THREE.Fog(SKY.low.clone(), 16, 135);

const hemi = new THREE.HemisphereLight(0xc6d6da, 0x5c5c3e, 1.7);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0d8, 2.2);
sun.position.set(-55, 62, 78);
if (Q.shadows) {
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 220;
  const S = 48;
  sun.shadow.camera.left = -S; sun.shadow.camera.right = S;
  sun.shadow.camera.top = S;   sun.shadow.camera.bottom = -S;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.05;
}
scene.add(sun, sun.target);

const bounce = new THREE.DirectionalLight(0x86a06c, 0.34);
bounce.position.set(10, -6, 12);
scene.add(bounce);

/* ── Camera choreography ─────────────────────────────────────
   Sixteen framed shots. Each is resolved to absolute positions up
   front, so a shot can look back down the stair or hold on the
   shrine without fighting the path tangent. */

const shrineAnchor = (() => {
  const f = frameAt(SHRINE_T);
  const ahead = new THREE.Vector3(Math.sin(f.yaw), 0, Math.cos(f.yaw));
  return new THREE.Vector3(COURT.x + ahead.x * 19, COURT.y + 8, COURT.z + ahead.z * 19);
})();

/* A point on the court, `fwd` metres up-slope and `side` metres across. */
function onCourt(fwd, side, h) {
  const f = frameAt(SHRINE_T);
  const ahead = new THREE.Vector3(Math.sin(f.yaw), 0, Math.cos(f.yaw));
  return new THREE.Vector3(
    COURT.x + ahead.x * fwd + f.nx * side,
    COURT.y + h,
    COURT.z + ahead.z * fwd + f.nz * side);
}

function onPath(t, lat, h) {
  const f = frameAt(t);
  return new THREE.Vector3(f.p.x + f.nx * lat, f.p.y + h, f.p.z + f.nz * lat);
}

const SHOTS = [
  /* Act I — the bronze gate */
  { p: 0.000, from: onPath(0.002, 0,    1.7),  to: onPath(0.050, 0,  3.4) },
  { p: 0.055, from: onPath(0.026, 0,    1.15), to: onPath(0.046, 0,  5.6) },
  { p: 0.105, from: onPath(0.034, 0,    1.45), to: onPath(0.048, 0,  4.9) },
  { p: 0.155, from: onPath(0.058, 0,    1.9),  to: onPath(0.030, 0,  3.2) },

  /* Act II — the 824 steps */
  { p: 0.205, from: onPath(0.095, 0,    1.75), to: onPath(0.140, 0,  2.4) },
  { p: 0.265, from: onPath(0.165, 6.4,  3.4),  to: onPath(0.205, 0,  1.6) },
  { p: 0.325, from: onPath(0.255, 0,    1.0),  to: onPath(0.310, 0,  6.5) },
  { p: 0.385, from: onPath(0.370, 0,    3.6),  to: onPath(0.295, 0, -1.2) },
  { p: 0.445, from: onPath(0.470, -6.0, 2.6),  to: onPath(0.525, 0,  2.2) },
  { p: 0.505, from: onPath(0.580, 0,    1.8),  to: onPath(0.640, 0,  2.6) },

  /* Act III — the stone gate */
  { p: 0.575, from: onPath(0.690, 5.6,  2.4),  to: onPath(0.775, 0,  3.6) },
  { p: 0.645, from: onPath(0.752, 0,    1.55), to: onPath(0.778, 0,  3.0) },
  { p: 0.705, from: onPath(0.792, 0,    1.75), to: onPath(0.865, 0,  3.2) },

  /* Act IV — the Hōheiden */
  { p: 0.775, from: onPath(0.94, 0, 1.9),      to: shrineAnchor.clone() },
  { p: 0.855, from: onCourt(-26, 3,   1.8),    to: shrineAnchor.clone().setY(COURT.y + 6) },
  { p: 0.925, from: onCourt(-15, 0,   1.6),    to: shrineAnchor.clone().setY(COURT.y + 12) },
  { p: 1.000, from: onCourt(-30, -26, 13),     to: shrineAnchor.clone().setY(COURT.y + 7) }
];

function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function placeCamera(pr, time) {
  let i = 0;
  while (i < SHOTS.length - 2 && pr > SHOTS[i + 1].p) i++;
  const a = SHOTS[i], b = SHOTS[i + 1];
  const k = easeInOut(THREE.MathUtils.clamp((pr - a.p) / (b.p - a.p), 0, 1));

  camPos.lerpVectors(a.from, b.from, k);
  camLook.lerpVectors(a.to, b.to, k);

  if (!REDUCED) {                                   // a walker's footfall
    const climbing = THREE.MathUtils.smoothstep(pr, 0.19, 0.26) * (1 - THREE.MathUtils.smoothstep(pr, 0.72, 0.8));
    camPos.y += Math.sin(time * 3.1) * 0.045 * climbing;
    camPos.x += Math.sin(time * 1.55) * 0.03 * climbing;
  }
  camera.position.copy(camPos);
  camera.lookAt(camLook);
  sun.target.position.copy(camPos);
  sun.target.updateMatrixWorld();
}

/* ── Scroll ──────────────────────────────────────────────── */

let targetPr = 0, currentPr = 0;
function readScroll() {
  const max = document.body.scrollHeight - innerHeight;
  targetPr = max > 0 ? THREE.MathUtils.clamp(scrollY / max, 0, 1) : 0;
}
addEventListener('scroll', readScroll, { passive: true });
readScroll();

/* ── Copy ────────────────────────────────────────────────── */

const panels = [...document.querySelectorAll('.panel')].map(el => ({
  el, in: parseFloat(el.dataset.in), out: parseFloat(el.dataset.out)
}));
const tategaki = document.getElementById('tategaki');
const stepsEl  = document.getElementById('steps');
const hintEl   = document.getElementById('hint');
const PHRASES  = ['英彦山', '銅の鳥居', '八百二十四段', '二の鳥居', '奉幣殿'];

function updateCopy(pr) {
  let active = -1;
  panels.forEach((pn, i) => {
    const local = (pr - pn.in) / (pn.out - pn.in);
    let o = 0;
    if (local >= -0.25 && local <= 1.25) {
      if (local < 0.18)      o = THREE.MathUtils.clamp(local / 0.18, 0, 1);
      else if (local > 0.82) o = THREE.MathUtils.clamp((1 - local) / 0.18, 0, 1);
      else                   o = 1;
    }
    pn.el.style.opacity = o.toFixed(3);
    pn.el.style.transform = 'translateY(calc(-50% + ' + ((1 - o) * 14).toFixed(1) + 'px))';
    pn.el.setAttribute('aria-hidden', o < 0.05 ? 'true' : 'false');
    if (o > 0.5) active = i;
  });
  if (active >= 0 && tategaki.textContent !== PHRASES[active]) tategaki.textContent = PHRASES[active];
  tategaki.style.opacity = (pr > 0.02 && pr < 0.985) ? 0.7 : 0;

  /* The counter tracks the real climb: 824 steps between the gates. */
  const climbed = THREE.MathUtils.clamp((pr - 0.19) / 0.65, 0, 1);
  stepsEl.textContent = Math.round(climbed * 824) + ' / 824';
  stepsEl.style.opacity = (pr > 0.19 && pr < 0.95) ? 0.55 : 0;
  hintEl.classList.toggle('gone', pr > 0.015);
}

/* ── Frame ───────────────────────────────────────────────── */

const clock = new THREE.Clock();
const skyNow = new THREE.Color();

function frame() {
  requestAnimationFrame(frame);
  const time = clock.getElapsedTime();
  currentPr += (targetPr - currentPr) * (REDUCED ? 1 : 0.075);
  const pr = currentPr;

  placeCamera(pr, time);

  /* Climbing out of the trees into open overcast light. */
  if (pr < 0.5) skyNow.copy(SKY.low).lerp(SKY.mid, pr / 0.5);
  else          skyNow.copy(SKY.mid).lerp(SKY.high, (pr - 0.5) / 0.5);
  scene.background.copy(skyNow);
  scene.fog.color.copy(skyNow);
  scene.fog.near = THREE.MathUtils.lerp(16, 30, pr);
  scene.fog.far  = THREE.MathUtils.lerp(135, 430, pr);

  sun.intensity  = THREE.MathUtils.lerp(2.5, 3.0, pr);
  hemi.intensity = THREE.MathUtils.lerp(1.75, 2.2, pr);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.08, 1.16, pr);

  /* The lantern panes catch light once you are among them. */
  M.mint.emissiveIntensity = 0.2 + THREE.MathUtils.smoothstep(pr, 0.2, 0.4) * 0.5;

  updateCopy(pr);
  renderer.render(scene, camera);
}

frame();
document.getElementById('loading').classList.add('done');

/* iOS fires resize when the URL bar hides; only react to real width changes. */
let lastW = innerWidth;
addEventListener('resize', () => {
  readScroll();
  if (innerWidth === lastW) return;
  lastW = innerWidth;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
