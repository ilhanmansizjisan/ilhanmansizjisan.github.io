// ============================================================
// ফসলের মূল্য ট্র্যাকার — নির্ধারিত নমুনা তথ্য + ক্যানভাস চার্ট
// ============================================================
(() => {
  "use strict";

  // ---- ফসলের সংজ্ঞা: ভিত্তি পাইকারি দাম (টাকা/কেজি) + মৌসুমি ওঠানামা ----
  const CROPS = [
    { key: "rice_coarse", name: "চাল (মোটা)",     base: 42,  swing: 6,  unit: "কেজি" },
    { key: "rice_miniket", name: "চাল (মিনিকেট)", base: 62,  swing: 8,  unit: "কেজি" },
    { key: "potato",      name: "আলু",            base: 28,  swing: 16, unit: "কেজি" },
    { key: "onion",       name: "পেঁয়াজ",         base: 55,  swing: 30, unit: "কেজি" },
    { key: "garlic",      name: "রসুন",           base: 130, swing: 35, unit: "কেজি" },
    { key: "tomato",      name: "টমেটো",          base: 40,  swing: 28, unit: "কেজি" },
    { key: "brinjal",     name: "বেগুন",          base: 35,  swing: 18, unit: "কেজি" },
    { key: "chilli",      name: "কাঁচা মরিচ",     base: 90,  swing: 60, unit: "কেজি" },
    { key: "jute",        name: "পাট (কাঁচা)",     base: 30,  swing: 10, unit: "কেজি" },
    { key: "wheat",       name: "গম",             base: 38,  swing: 5,  unit: "কেজি" },
    { key: "mustard",     name: "সরিষা",          base: 70,  swing: 12, unit: "কেজি" },
    { key: "sugarcane",   name: "আখ",             base: 5,   swing: 2,  unit: "কেজি" },
  ];

  // ---- বাজার: নাম + আঞ্চলিক মূল্য গুণক ----
  const MARKETS = [
    { key: "tangail",    name: "টাঙ্গাইল",              mult: 0.97 },
    { key: "dhaka",      name: "ঢাকা (কারওয়ান বাজার)", mult: 1.05 },
    { key: "sherpur",    name: "শেরপুর",                mult: 0.95 },
    { key: "bogura",     name: "বগুড়া",                mult: 0.99 },
    { key: "chattogram", name: "চট্টগ্রাম",            mult: 1.03 },
  ];

  const MONTHS = ["জানু","ফেব্রু","মার্চ","এপ্রি","মে","জুন","জুলা","আগ","সেপ্টে","অক্টো","নভে","ডিসে"];

  // নির্ধারিত ছদ্ম-এলোমেলো (স্থিতিশীল, রিলোড-এর পরও একই)
  function seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  }

  // শেষ ১২ মাসের তথ্য তৈরি (এই মাসে শেষ)
  function buildSeries(market, crop) {
    const now = new Date();
    const endMonth = now.getMonth();
    const out = [];
    for (let i = 11; i >= 0; i--) {
      let m = (endMonth - i + 12) % 12;
      const season = Math.sin(((m + 3) / 12) * Math.PI * 2); // -1..1
      const noise = (seeded(`${market.key}:${crop.key}:${m}`) - 0.5) * 2; // -1..1
      const price = crop.base * market.mult
        + (season * crop.swing)
        + (noise * crop.swing * 0.4);
      out.push({
        month: MONTHS[m],
        mIndex: m,
        price: Math.max(1, Math.round(price * 10) / 10),
      });
    }
    return out;
  }

  // ---- DOM ----
  const marketSel = document.getElementById("market");
  const cropSel   = document.getElementById("crop");
  const chart     = document.getElementById("chart");
  const ctx       = chart.getContext("2d");

  MARKETS.forEach((m) => {
    const o = document.createElement("option"); o.value = m.key; o.textContent = m.name; marketSel.appendChild(o);
  });
  CROPS.forEach((c) => {
    const o = document.createElement("option"); o.value = c.key; o.textContent = c.name; cropSel.appendChild(o);
  });

  function getSel() {
    return {
      market: MARKETS.find((m) => m.key === marketSel.value),
      crop: CROPS.find((c) => c.key === cropSel.value),
    };
  }

  function update() {
    const { market, crop } = getSel();
    const data = buildSeries(market, crop);
    const prices = data.map((d) => d.price);
    const latest = prices[prices.length - 1];
    const first = prices[0];
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const delta = latest - first;
    const pct = (delta / first) * 100;

    document.getElementById("latest").textContent = `৳${latest.toFixed(1)}`;
    document.getElementById("latest-month").textContent = `${data[data.length - 1].month} · প্রতি ${crop.unit}`;
    document.getElementById("avg").textContent = `৳${avg.toFixed(1)}`;
    document.getElementById("avg-sub").textContent = `প্রতি ${crop.unit}`;
    document.getElementById("range").textContent = `৳${min.toFixed(0)}–${max.toFixed(0)}`;

    const trendEl = document.getElementById("trend");
    trendEl.textContent = `${delta >= 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}%`;
    trendEl.classList.toggle("up", delta >= 0);
    trendEl.classList.toggle("down", delta < 0);
    document.getElementById("trend-sub").textContent = `${first.toFixed(0)} → ${latest.toFixed(0)} টাকা`;

    drawChart(data, crop);
    document.title = `${crop.name} · ${market.name} — ফসলের মূল্য ট্র্যাকার`;
  }

  // ---- ক্যানভাস লাইন চার্ট (কোনো লাইব্রেরি ছাড়া) ----
  function drawChart(data, crop) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = chart.clientWidth, cssH = 320;
    chart.width = cssW * dpr;
    chart.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const padL = 48, padR = 16, padT = 18, padB = 34;
    const w = cssW - padL - padR;
    const h = cssH - padT - padB;
    const prices = data.map((d) => d.price);
    let lo = Math.min(...prices), hi = Math.max(...prices);
    const span = (hi - lo) || 1;
    lo -= span * 0.15; hi += span * 0.15;

    const x = (i) => padL + (w * i) / (data.length - 1);
    const y = (v) => padT + h - ((v - lo) / (hi - lo)) * h;

    ctx.font = "11px ui-monospace, monospace";
    ctx.textBaseline = "middle";
    const steps = 4;
    for (let s = 0; s <= steps; s++) {
      const v = lo + ((hi - lo) * s) / steps;
      const yy = y(v);
      ctx.strokeStyle = "rgba(159,180,183,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(cssW - padR, yy); ctx.stroke();
      ctx.fillStyle = "rgba(159,180,183,0.7)";
      ctx.textAlign = "right";
      ctx.fillText("৳" + v.toFixed(0), padL - 8, yy);
    }

    ctx.fillStyle = "rgba(159,180,183,0.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    data.forEach((d, i) => {
      if (i % 2 === 0 || i === data.length - 1) {
        ctx.fillText(d.month, x(i), cssH - padB + 8);
      }
    });

    const grad = ctx.createLinearGradient(0, padT, 0, padT + h);
    grad.addColorStop(0, "rgba(255,140,0,0.35)");
    grad.addColorStop(1, "rgba(255,140,0,0.0)");
    ctx.beginPath();
    ctx.moveTo(x(0), y(prices[0]));
    prices.forEach((p, i) => ctx.lineTo(x(i), y(p)));
    ctx.lineTo(x(prices.length - 1), padT + h);
    ctx.lineTo(x(0), padT + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    prices.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p)) : ctx.moveTo(x(i), y(p))));
    ctx.strokeStyle = "#ff8c00";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    prices.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(x(i), y(p), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#0a181b";
      ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#00d4c8"; ctx.stroke();
    });

    const lastPrice = prices[prices.length - 1];
    const lx = x(prices.length - 1), ly = y(lastPrice);
    ctx.fillStyle = "#00d4c8";
    ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("৳" + lastPrice.toFixed(1), lx - 6, ly - 6);
  }

  marketSel.addEventListener("change", update);
  cropSel.addEventListener("change", update);
  window.addEventListener("resize", () => { const s = getSel(); drawChart(buildSeries(s.market, s.crop), s.crop); });

  update();
})();
