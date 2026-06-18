const canvas = document.getElementById('rain');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

// create drops
const drops = Array.from({ length: 90 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  len: 8 + Math.random() * 20,
  speed: 2 + Math.random() * 5,
  opacity: 0.08 + Math.random() * 0.3,
  width: 0.4 + Math.random() * 0.7,
  neon: Math.random() < 0.12
    ? (Math.random() < 0.5 ? '#5dd4f0' : '#b464ff')
    : null
}));

// create stuck droplets
const droplets = Array.from({ length: 30 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: 1.5 + Math.random() * 4,
  slideY: 0,
  slideSpeed: 0,
  stuck: Math.random() > 0.4,
  opacity: 0.15 + Math.random() * 0.35,
  neon: Math.random() < 0.1
    ? (Math.random() < 0.5 ? '#5dd4f0' : '#b464ff')
    : null
}));

let lastTime = 0;

function animate(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 16, 3);
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw streaks
  for (const d of drops) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 0.5, d.y + d.len);
    ctx.strokeStyle = d.neon
      ? d.neon + '55'
      : `rgba(130, 170, 210, ${d.opacity})`;
    ctx.lineWidth = d.width;
    ctx.stroke();

    d.y += d.speed * dt;
    if (d.y > canvas.height + 30) {
      d.y = -30;
      d.x = Math.random() * canvas.width;
    }
  }

  // draw droplets
  for (const s of droplets) {
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + s.slideY, s.r * 0.65, s.r, 0, 0, Math.PI * 2);
    ctx.fillStyle = s.neon
      ? s.neon + '44'
      : `rgba(150, 190, 225, ${s.opacity})`;
    ctx.fill();
    ctx.strokeStyle = s.neon
      ? s.neon + '33'
      : `rgba(200, 225, 255, ${s.opacity * 0.6})`;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    if (!s.stuck) {
      s.slideSpeed += 0.02 * dt;
      s.slideY += s.slideSpeed * dt;
      if (s.y + s.slideY > canvas.height + 20) {
        s.slideY = 0;
        s.slideSpeed = 0;
        s.y = Math.random() * 60;
        s.x = Math.random() * canvas.width;
        s.stuck = Math.random() > 0.4;
      }
    } else {
      if (Math.random() < 0.001 * dt) s.stuck = false;
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);