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
