// ============================================================
// মৌসুমি ফসলের ক্যালেন্ডার — বাংলাদেশ (মধ্য অঞ্চল)
// প্রতিটি ফসলের বুনন/বেড়ে ওঠা/তোলার মাস-সেট (১-১২)। ধরন অনুযায়ী ছাঁকুন।
// ============================================================
(() => {
  "use strict";

  const MONTHS = [
    "জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন",
    "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে",
  ];
  const SEASON_OF = ["শীত","শীত","বসন্ত","বসন্ত","গ্রীষ্ম","গ্রীষ্ম","বর্ষা","বর্ষা","বর্ষা","শরৎ","শরৎ","হেমন্ত"];

  // type: cereal | veg | pulse | cash | fruit
  const CROPS = [
    { name: "ধান (বোরো)",   type: "cereal", sow: [11,12,1],  grow: [1,2,3,4],  harvest: [4,5] },
    { name: "ধান (আউশ)",    type: "cereal", sow: [2,3],       grow: [3,4,5,6],  harvest: [6,7] },
    { name: "ধান (আমন)",    type: "cereal", sow: [6,7],       grow: [7,8,9,10], harvest: [10,11] },
    { name: "গম",           type: "cereal", sow: [11,12],     grow: [12,1,2],   harvest: [2,3] },
    { name: "ভুট্টা",        type: "cereal", sow: [10,11,1,2], grow: [11,12,1,2,3,4], harvest: [3,4,5] },
    { name: "আলু",          type: "veg",    sow: [11,12],     grow: [12,1],     harvest: [1,2] },
    { name: "পেঁয়াজ",        type: "veg",    sow: [9,10],      grow: [10,11,12], harvest: [12,1,2] },
    { name: "রসুন",         type: "veg",    sow: [10,11],     grow: [11,12,1],  harvest: [1,2] },
    { name: "টমেটো",        type: "veg",    sow: [9,10],      grow: [10,11,12], harvest: [12,1,2] },
    { name: "বেগুন",         type: "veg",    sow: [9,10],      grow: [10,11,12,1], harvest: [12,1,2,3] },
    { name: "কাঁচা মরিচ",     type: "veg",    sow: [9,10,11],   grow: [10,11,12,1], harvest: [12,1,2,3] },
    { name: "বাঁধাকপি",      type: "veg",    sow: [10,11],     grow: [11,12],    harvest: [12,1] },
    { name: "মিষ্টি কুমড়া",   type: "veg",    sow: [10,11],     grow: [11,12,1],  harvest: [12,1,2] },
    { name: "শিম",          type: "veg",    sow: [10,11],     grow: [11,12],    harvest: [12,1] },
    { name: "মসুর ডাল",      type: "pulse",  sow: [10,11],     grow: [11,12],    harvest: [1,2] },
    { name: "মুগ ডাল",       type: "pulse",  sow: [2,3,6,7],   grow: [3,4,7,8],  harvest: [4,5,8,9] },
    { name: "ছোলা",         type: "pulse",  sow: [10,11],     grow: [11,12,1],  harvest: [1,2] },
    { name: "পাট",          type: "cash",   sow: [3,4],       grow: [4,5,6,7],  harvest: [7,8] },
    { name: "তুলা",         type: "cash",   sow: [3,4],       grow: [4,5,6,7,8], harvest: [8,9] },
    { name: "আখ",          type: "cash",   sow: [2,3],       grow: [3,4,5,6,7,8,9,10,11,12,1], harvest: [11,12,1,2] },
    { name: "সরিষা",        type: "cash",   sow: [10,11],     grow: [11,12],    harvest: [1,2] },
    { name: "সূর্যমুখী",      type: "cash",   sow: [10,11],     grow: [11,12],    harvest: [1,2] },
    { name: "আম",           type: "fruit",  sow: [6,7],       grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [5,6,7] },
    { name: "কলা",          type: "fruit",  sow: [3,4,5,6,7], grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [1,2,3,4,5,6,7,8,9,10,11,12] },
    { name: "পেয়ারা",        type: "fruit",  sow: [6,7],       grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [8,9,10,11,12] },
    { name: "পপেয়া",       type: "fruit",  sow: [2,3,4,5,6], grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [1,2,3,4,5,6,7,8,9,10,11,12] },
  ];

  const TYPES = [
    { key: "all",    label: "সব" },
    { key: "cereal", label: "শস্য" },
    { key: "veg",    label: "সবজি" },
    { key: "pulse",  label: "ডাল" },
    { key: "cash",   label: "নগদ ফসল" },
    { key: "fruit",  label: "ফল" },
  ];

  const filtersEl = document.getElementById("filters");
  const monthsEl  = document.getElementById("months");
  const nowMonth  = new Date().getMonth();
  let activeType = "all";

  TYPES.forEach((t) => {
    const b = document.createElement("button");
    b.className = "filter-btn" + (t.key === "all" ? " active" : "");
    b.textContent = t.label;
    b.dataset.type = t.key;
    b.addEventListener("click", () => {
      activeType = t.key;
      document.querySelectorAll(".filter-btn").forEach((x) => x.classList.toggle("active", x.dataset.type === t.key));
      render();
    });
    filtersEl.appendChild(b);
  });

  function cropsForPhase(monthIdx, phase) {
    return CROPS.filter((c) => c.type === activeType || activeType === "all")
                .filter((c) => (c[phase] || []).includes(monthIdx))
                .map((c) => c.name);
  }

  function render() {
    monthsEl.innerHTML = "";
    MONTHS.forEach((m, i) => {
      const sow = cropsForPhase(i, "sow");
      const grow = cropsForPhase(i, "grow");
      const harvest = cropsForPhase(i, "harvest");

      const card = document.createElement("article");
      card.className = "month-card" + (i === nowMonth ? " now" : "");

      const phases = [
        { key: "sow", label: "বুনুন" },
        { key: "grow", label: "বড় হচ্ছে" },
        { key: "harvest", label: "তুলুন" },
      ];

      let groups = "";
      phases.forEach((ph) => {
        const list = (ph.key === "sow" ? sow : ph.key === "grow" ? grow : harvest);
        groups += `<div class="phase-group">
          <div class="phase-label ${ph.key}">${ph.label}</div>`;
        if (list.length) {
          groups += `<ul class="crop-list">` +
            list.map((n) => `<li class="crop-chip">${n}</li>`).join("") +
            `</ul>`;
        } else {
          groups += `<p class="crop-empty">—</p>`;
        }
        groups += `</div>`;
      });

      card.innerHTML = `
        <div class="month-head">
          <span class="month-name">${m}</span>
          <span class="month-season">${SEASON_OF[i]}</span>
        </div>
        ${groups}`;
      monthsEl.appendChild(card);
    });
  }

  render();
})();
