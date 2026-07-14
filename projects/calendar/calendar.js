// ============================================================
// Seasonal Crop Calendar — Bangladesh (central belt)
// Each crop has sow/grow/harvest month sets (1-12). Filter by type.
// ============================================================
(() => {
  "use strict";

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const SEASONS = ["Winter", "Spring", "Summer", "Monsoon", "Autumn", "Late Autumn"];
  // season per month index (rough, central BD)
  const SEASON_OF = ["Winter","Winter","Spring","Spring","Summer","Summer","Monsoon","Monsoon","Monsoon","Autumn","Autumn","Late Autumn"];

  // type: cereal | veg | pulse | cash | fruit
  const CROPS = [
    { name: "Rice (Boro)",  type: "cereal", sow: [11,12,1],  grow: [1,2,3,4],  harvest: [4,5] },
    { name: "Rice (Aus)",   type: "cereal", sow: [2,3],       grow: [3,4,5,6],  harvest: [6,7] },
    { name: "Rice (Aman)",  type: "cereal", sow: [6,7],       grow: [7,8,9,10], harvest: [10,11] },
    { name: "Wheat",        type: "cereal", sow: [11,12],     grow: [12,1,2],   harvest: [2,3] },
    { name: "Maize",        type: "cereal", sow: [10,11,1,2], grow: [11,12,1,2,3,4], harvest: [3,4,5] },
    { name: "Potato",       type: "veg",    sow: [11,12],     grow: [12,1],     harvest: [1,2] },
    { name: "Onion",        type: "veg",    sow: [9,10],      grow: [10,11,12], harvest: [12,1,2] },
    { name: "Garlic",       type: "veg",    sow: [10,11],     grow: [11,12,1],  harvest: [1,2] },
    { name: "Tomato",       type: "veg",    sow: [9,10],      grow: [10,11,12], harvest: [12,1,2] },
    { name: "Brinjal",      type: "veg",    sow: [9,10],      grow: [10,11,12,1], harvest: [12,1,2,3] },
    { name: "Chilli",       type: "veg",    sow: [9,10,11],   grow: [10,11,12,1], harvest: [12,1,2,3] },
    { name: "Cabbage",      type: "veg",    sow: [10,11],     grow: [11,12],    harvest: [12,1] },
    { name: "Sweet gourd",  type: "veg",    sow: [10,11],     grow: [11,12,1],  harvest: [12,1,2] },
    { name: "Beans",        type: "veg",    sow: [10,11],     grow: [11,12],    harvest: [12,1] },
    { name: "Lentil (Masur)", type: "pulse", sow: [10,11],   grow: [11,12],    harvest: [1,2] },
    { name: "Mung bean",    type: "pulse",  sow: [2,3,6,7],   grow: [3,4,7,8],  harvest: [4,5,8,9] },
    { name: "Chickpea (Gram)", type: "pulse", sow: [10,11],  grow: [11,12,1],  harvest: [1,2] },
    { name: "Jute",         type: "cash",   sow: [3,4],       grow: [4,5,6,7],  harvest: [7,8] },
    { name: "Cotton",       type: "cash",   sow: [3,4],       grow: [4,5,6,7,8], harvest: [8,9] },
    { name: "Sugarcane",    type: "cash",   sow: [2,3],       grow: [3,4,5,6,7,8,9,10,11,12,1], harvest: [11,12,1,2] },
    { name: "Mustard",      type: "cash",   sow: [10,11],     grow: [11,12],    harvest: [1,2] },
    { name: "Sunflower",    type: "cash",   sow: [10,11],     grow: [11,12],    harvest: [1,2] },
    { name: "Mango",        type: "fruit",  sow: [6,7],       grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [5,6,7] },
    { name: "Banana",       type: "fruit",  sow: [3,4,5,6,7], grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [1,2,3,4,5,6,7,8,9,10,11,12] },
    { name: "Guava",        type: "fruit",  sow: [6,7],       grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [8,9,10,11,12] },
    { name: "Papaya",       type: "fruit",  sow: [2,3,4,5,6], grow: [1,2,3,4,5,6,7,8,9,10,11,12], harvest: [1,2,3,4,5,6,7,8,9,10,11,12] },
  ];

  const TYPES = [
    { key: "all",    label: "All" },
    { key: "cereal", label: "Cereals" },
    { key: "veg",    label: "Vegetables" },
    { key: "pulse",  label: "Pulses" },
    { key: "cash",   label: "Cash crops" },
    { key: "fruit",  label: "Fruits" },
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
        { key: "sow", label: "Sow" },
        { key: "grow", label: "Growing" },
        { key: "harvest", label: "Harvest" },
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
