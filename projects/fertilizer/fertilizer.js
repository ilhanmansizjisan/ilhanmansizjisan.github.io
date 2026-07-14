// ============================================================
// Fertilizer & Dose Calculator
// Indicative N-P-K recommendation per hectare, scaled to area,
// then converted to common bag counts.
// ============================================================
(() => {
  "use strict";

  // Nutrient recommendation per hectare (kg/ha of N, P2O5, K2O)
  // Approximate common Bangladeshi practice for a medium soil.
  const CROPS = [
    { key: "rice_aman",  name: "Rice (Aman)",        n: 80,  p: 28,  k: 50,  note: "Apply 1/3 N as basal, 1/3 at tillering, 1/3 at panicle initiation. Use TSP basal, MoP split." },
    { key: "rice_boro",  name: "Rice (Boro)",        n: 110, p: 30,  k: 60,  note: "Boro is nutrient-hungry — split N into 3–4 doses with irrigation. Top-dress Zn if deficient." },
    { key: "rice_aus",   name: "Rice (Aus)",         n: 60,  p: 20,  k: 35,  note: "Lower doses suit Aus under rainfed conditions." },
    { key: "wheat",      name: "Wheat",              n: 100, p: 25,  k: 45,  note: "Apply 1/2 N at crown root, 1/2 at tillering. Gypsum supplies S." },
    { key: "potato",     name: "Potato",             n: 150, p: 60,  k: 120, note: "Very K-responsive — don't skip MoP. Apply P & K basal, split N." },
    { key: "maize",      name: "Maize",              n: 120, p: 35,  k: 50,  note: "Split N: basal, V6, and tasseling. Good response to Zn." },
    { key: "jute",       name: "Jute",               n: 60,  p: 30,  k: 40,  note: "Basal TSP + MoP, top-dress N at 4–6 weeks. Avoid waterlogging." },
    { key: "mustard",    name: "Mustard / Rapeseed", n: 80,  p: 30,  k: 40,  note: "Basal application works well; sulphur (gypsum) improves oil content." },
    { key: "sugarcane",  name: "Sugarcane",          n: 200, p: 70,  k: 110, note: "High N demand — split across tillering, elongation. Trash mulching helps." },
    { key: "tomato",     name: "Tomato",             n: 120, p: 70,  k: 90,  note: "Fertigate in splits; K boosts fruit set and quality. Avoid excess N at flowering." },
    { key: "brinjal",    name: "Brinjal",            n: 110, p: 60,  k: 80,  note: "Split dose, side-dress after each major pick. Keep soil moist." },
    { key: "chilli",     name: "Chilli",             n: 100, p: 55,  k: 75,  note: "Split N; K supports pungency & yield. Mulch to retain moisture." },
    { key: "onion",      name: "Onion",              n: 90,  p: 45,  k: 70,  note: "Apply P & K basal; split N. Stop N near bulb maturity." },
    { key: "pulse",      name: "Pulses (lentil/mung)", n: 20, p: 40, k: 30,  note: "Low N need (fixed biologically) but responsive to P, S & Mo." },
  ];

  // Soil-status multiplier on N-P-K
  const SOIL = { low: 1.15, med: 1.0, high: 0.85 };

  // Area conversion to hectares
  const TO_HA = { acre: 0.4047, hectare: 1, bigha: 0.1338, decimal: 0.000405 }; // 1 decimal = 1/100 acre

  // Fertilizer products -> nutrient %, bag size kg
  const PRODUCTS = [
    { key: "urea", name: "Urea",     sub: "46% N",        bag: 50, nutrient: "N",  pct: 0.46 },
    { key: "tsp",  name: "TSP",      sub: "20% P₂O₅",     bag: 50, nutrient: "P",  pct: 0.20 },
    { key: "mop",  name: "MoP",      sub: "60% K₂O",      bag: 50, nutrient: "K",  pct: 0.60 },
    { key: "gypsum", name: "Gypsum", sub: "18% S",        bag: 25, nutrient: "S",  pct: 0.18 },
  ];

  const cropSel = document.getElementById("crop");
  const areaIn  = document.getElementById("area");
  const unitSel = document.getElementById("unit");
  const soilSel = document.getElementById("soil");
  const bagsUl  = document.getElementById("bags");
  const cropNote = document.getElementById("crop-note");

  CROPS.forEach((c) => {
    const o = document.createElement("option"); o.value = c.key; o.textContent = c.name; cropSel.appendChild(o);
  });

  function getCrop() { return CROPS.find((c) => c.key === cropSel.value); }

  function update() {
    const crop = getCrop();
    const areaHa = (parseFloat(areaIn.value) || 0) * (TO_HA[unitSel.value] || 1);
    const sm = SOIL[soilSel.value] || 1;

    const nPerHa = crop.n * sm;
    const pPerHa = crop.p * sm;
    const kPerHa = crop.k * sm;

    document.getElementById("n-val").textContent = Math.round(nPerHa).toString();
    document.getElementById("p-val").textContent = Math.round(pPerHa).toString();
    document.getElementById("k-val").textContent = Math.round(kPerHa).toString();

    // Total kg of each nutrient for the area
    const need = { N: nPerHa * areaHa, P: pPerHa * areaHa, K: kPerHa * areaHa };

    // Gypsum/S estimate: ~20 kg S/ha medium (scaled with soil multiplier modestly)
    const sPerHa = 20 * (soilSel.value === "low" ? 1.1 : soilSel.value === "high" ? 0.9 : 1);
    need.S = sPerHa * areaHa;

    bagsUl.innerHTML = "";
    PRODUCTS.forEach((pr) => {
      const kgNeeded = need[pr.nutrient] / pr.pct;       // pure nutrient -> product kg
      const bags = Math.ceil(kgNeeded / pr.bag);
      const li = document.createElement("li");
      li.className = "bag-item";
      li.innerHTML = `<span class="bag-name">${pr.name}<small>${pr.sub} · ${pr.bag} kg bag</small></span>` +
                     `<span class="bag-count">${bags} bag${bags === 1 ? "" : "s"}</span>`;
      bagsUl.appendChild(li);
    });

    cropNote.textContent = crop.note;
    const unitLabel = unitSel.options[unitSel.selectedIndex].text;
    document.title = `${crop.name} · ${areaIn.value} ${unitLabel} — Fertilizer Calculator`;
  }

  [cropSel, unitSel, soilSel].forEach((el) => el.addEventListener("change", update));
  areaIn.addEventListener("input", update);

  update();
})();
