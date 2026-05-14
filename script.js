const canvas = document.querySelector("#night-scene");
const ctx = canvas.getContext("2d");

const palette = {
  skyTop: "#09080d",
  skyMid: "#151324",
  skyLow: "#231a27",
  ridgeFar: "#1b1823",
  ridgeNear: "#0d0b10",
  tower: "#08070a",
  towerEdge: "#2b2530",
  ember: "#d95e2b",
  lava: "#f2a43d",
  star: "#d8cba9",
  cloak: "#3a392e",
  pack: "#8e6e44",
};

let width = 0;
let height = 0;
let pixel = 4;
let stars = [];
let last = 0;

function rand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function rebuildStars() {
  const count = Math.max(42, Math.floor((width * height) / 14000));
  stars = Array.from({ length: count }, (_, index) => ({
    x: Math.floor(rand(index + 2) * width),
    y: Math.floor(rand(index + 80) * height * 0.46),
    size: rand(index + 160) > 0.86 ? 2 : 1,
    phase: rand(index + 320) * Math.PI * 2,
  }));
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  pixel = width < 640 ? 3 : 4;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  rebuildStars();
}

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x / pixel) * pixel,
    Math.round(y / pixel) * pixel,
    Math.round(w / pixel) * pixel,
    Math.round(h / pixel) * pixel,
  );
}

function poly(points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const px = Math.round(x / pixel) * pixel;
    const py = Math.round(y / pixel) * pixel;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
}

function drawSky(time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.skyTop);
  gradient.addColorStop(0.52, palette.skyMid);
  gradient.addColorStop(1, palette.skyLow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  stars.forEach((star) => {
    const pulse = Math.sin(time * 0.0016 + star.phase) > 0.28;
    rect(star.x, star.y, star.size * pixel, star.size * pixel, pulse ? palette.star : "#786f65");
  });
}

function drawMoon() {
  const moonX = width * 0.72;
  const moonY = height * 0.18;
  rect(moonX, moonY, pixel * 9, pixel * 9, "#d5c5a3");
  rect(moonX + pixel * 2, moonY - pixel, pixel * 5, pixel, "#d5c5a3");
  rect(moonX + pixel * 2, moonY + pixel * 9, pixel * 5, pixel, "#bba981");
  rect(moonX + pixel * 6, moonY + pixel * 2, pixel * 3, pixel * 6, palette.skyTop);
}

function drawTower(time) {
  const baseX = width * 0.62;
  const ground = height * 0.74;
  const towerH = Math.min(height * 0.58, 430);
  const towerW = Math.max(46, width * 0.05);

  rect(baseX, ground - towerH, towerW, towerH, palette.tower);
  rect(baseX + towerW * 0.82, ground - towerH + 18, pixel * 2, towerH - 24, palette.towerEdge);
  rect(baseX - towerW * 0.16, ground - towerH + towerH * 0.32, towerW * 1.28, pixel * 3, palette.towerEdge);
  rect(baseX + towerW * 0.15, ground - towerH - pixel * 8, towerW * 0.68, pixel * 8, palette.tower);

  const eyeY = ground - towerH - pixel * 8;
  const glow = 0.68 + Math.sin(time * 0.003) * 0.2;
  rect(baseX + towerW * 0.13, eyeY + pixel * 2, towerW * 0.76, pixel * 3, palette.ember);
  rect(baseX + towerW * 0.29, eyeY + pixel * 3, towerW * 0.46, pixel, glow > 0.72 ? "#ffd17b" : palette.lava);
  rect(baseX + towerW * 0.45, eyeY + pixel * 3, towerW * 0.12, pixel, "#2d100c");
}

function drawLandscape(time) {
  poly(
    [
      [0, height * 0.62],
      [width * 0.18, height * 0.5],
      [width * 0.42, height * 0.62],
      [width * 0.68, height * 0.48],
      [width, height * 0.6],
      [width, height],
      [0, height],
    ],
    palette.ridgeFar,
  );
  poly(
    [
      [0, height * 0.74],
      [width * 0.16, height * 0.61],
      [width * 0.35, height * 0.76],
      [width * 0.48, height * 0.66],
      [width * 0.64, height * 0.78],
      [width * 0.86, height * 0.64],
      [width, height * 0.72],
      [width, height],
      [0, height],
    ],
    palette.ridgeNear,
  );

  for (let i = 0; i < 8; i += 1) {
    const x = width * 0.52 + i * pixel * 7;
    const y = height * 0.78 + Math.sin(time * 0.001 + i) * pixel;
    rect(x, y, pixel * 3, pixel, i % 2 ? palette.ember : palette.lava);
  }
}

function drawTravelers() {
  const y = height * 0.73;
  const left = width * 0.25;
  const gap = pixel * 7;

  rect(left, y, pixel * 3, pixel * 8, palette.cloak);
  rect(left + pixel, y - pixel * 2, pixel * 2, pixel * 2, "#c4a37b");
  rect(left - pixel, y + pixel * 3, pixel * 2, pixel * 4, palette.pack);
  rect(left + pixel, y + pixel * 8, pixel, pixel * 3, "#17120f");

  rect(left + gap, y + pixel, pixel * 3, pixel * 7, "#2a3427");
  rect(left + gap + pixel, y - pixel, pixel * 2, pixel * 2, "#b99470");
  rect(left + gap + pixel * 3, y + pixel * 3, pixel * 2, pixel * 4, palette.pack);
  rect(left + gap + pixel, y + pixel * 8, pixel, pixel * 3, "#17120f");
}

function draw(time = 0) {
  drawSky(time);
  drawMoon();
  drawTower(time);
  drawLandscape(time);
  drawTravelers();
  last = window.requestAnimationFrame(draw);
}

resize();
draw();

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(last);
  resize();
  draw();
});
