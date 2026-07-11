// Year stamp
document.getElementById("year").textContent = new Date().getFullYear();

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Aurora background layer (extra motion over the looping video)
(() => {
  const canvas = document.getElementById("bgfx");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  const blobs = [
    { x: 0.25, y: 0.30, r: 320, c: [56, 189, 248] },
    { x: 0.75, y: 0.55, r: 360, c: [37, 99, 235] },
    { x: 0.55, y: 0.85, r: 300, c: [168, 85, 247] },
  ];
  let t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function step() {
    t += 0.0035;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const cx = (b.x + Math.sin(t + i) * 0.06) * w;
      const cy = (b.y + Math.cos(t * 0.8 + i) * 0.06) * h;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.55)`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(step);
  }
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  resize();
  step();
  window.addEventListener("resize", resize);
})();

// Custom cursor follower (dot + trailing ring)
(() => {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;
  // Skip on touch / coarse-pointer devices
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
    dot.style.display = ring.style.display = "none";
    return;
  }
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  // Ring trails behind with easing for a smooth "follow" effect
  function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  }
  follow();

  // Grow the ring when hovering interactive elements
  const interactive = "a, button, .btn, .socials a, .inline-link, .chip-list li";
  document.querySelectorAll(interactive).forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("active"));
    el.addEventListener("mouseleave", () => ring.classList.remove("active"));
  });
})();

// Animated grid background (subtle cybersec-ish)
(() => {
  const canvas = document.getElementById("grid");
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  const dots = [];
  const COUNT = 60;
  const LINK_DIST = 130;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    dots.length = 0;
    for (let i = 0; i < COUNT; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    // dots
    ctx.fillStyle = "rgba(125, 211, 252, 0.6)";
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.fillRect(d.x, d.y, 1.4, 1.4);
    }
    // links
    ctx.strokeStyle = "rgba(125, 211, 252, 0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          ctx.globalAlpha = 1 - dist / LINK_DIST;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  // Respect reduced-motion: skip the canvas animation entirely
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  resize();
  init();
  step();
  window.addEventListener("resize", () => {
    resize();
    init();
  });
})();

// Magical star cursor trail
// Draws geometric star/diamond particles that spawn at the pointer, swirl,
// rotate and fade out — a glowing constellation that follows the cursor.
(() => {
  const canvas = document.getElementById("star-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Skip on touch / coarse-pointer devices (no cursor to follow)
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
  // Respect reduced-motion
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // Pointer state (lerped toward for a smooth trailing swarm)
  const pointer = { x: w / 2, y: h / 2, px: w / 2, py: h / 2, speed: 0 };

  window.addEventListener("mousemove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  // Particle pool
  const stars = [];
  const MAX = 140;
  const palette = ["#7dd3fc", "#38bdf8", "#a78bfa", "#f0abfc", "#e0f2fe"];

  function spawn() {
    // Emit a burst proportional to how fast the cursor is moving
    const count = 1 + Math.min(4, Math.floor(pointer.speed / 6));
    for (let i = 0; i < count && stars.length < MAX; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * 2.2;
      stars.push({
        x: pointer.x,
        y: pointer.y,
        vx: Math.cos(ang) * spd + (pointer.x - pointer.px) * 0.12,
        vy: Math.sin(ang) * spd + (pointer.y - pointer.py) * 0.12,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        size: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        spikes: Math.random() > 0.5 ? 4 : 5, // 4-point star or 5-point star
        color: palette[(Math.random() * palette.length) | 0],
      });
    }
  }

  // Draw a small star/diamond shape centered at (x,y)
  function drawStar(s) {
    const spikes = s.spikes;
    const outer = s.size;
    const inner = s.size * 0.42;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.fill();
    ctx.restore();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(32, now - last) / 16.67; // normalize to ~60fps
    last = now;

    // Trailing fade: clear with a slight alpha so motion leaves a soft ghost
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    // velocity of the pointer (for spawn rate + initial drift)
    pointer.speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    spawn();

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.96;            // friction
      s.vy *= 0.96;
      s.rot += s.spin * dt;    // swirl/rotate
      s.vy += 0.02 * dt;       // gentle gravity for a magical float
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        stars.splice(i, 1);
        continue;
      }
      drawStar(s);
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

// Journey: horizontal story carousel
// Prev/next buttons, dot indicators, keyboard arrows, and dot-sync on scroll.
(() => {
  const track = document.getElementById("jcarousel");
  const dotsWrap = document.getElementById("jdots");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.children);
  const prev = document.querySelector(".jprev");
  const next = document.querySelector(".jnext");

  // Build dot indicators
  const dots = cards.map((_, i) => {
    const d = document.createElement("span");
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", () => scrollTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  function indexOfClosest() {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    cards.forEach((c, i) => {
      const cMid = c.offsetLeft + c.offsetWidth / 2;
      const dist = Math.abs(cMid - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  function syncDots() {
    const i = indexOfClosest();
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
  }

  function scrollTo(i) {
    const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: "smooth" });
  }

  prev && prev.addEventListener("click", () => scrollTo(indexOfClosest() - 1));
  next && next.addEventListener("click", () => scrollTo(indexOfClosest() + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollTo(indexOfClosest() + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollTo(indexOfClosest() - 1); }
  });
  track.addEventListener("scroll", () => requestAnimationFrame(syncDots), { passive: true });
  window.addEventListener("resize", syncDots);
})();
