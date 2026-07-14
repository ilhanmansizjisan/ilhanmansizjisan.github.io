// ============================================================
// সার ও মাত্রা ক্যালকুলেটর
// হেক্টরপ্রতি সূচনামূলক এন-পি-কে সুপারিশ, আয়তন অনুযায়ী,
// তারপর সাধারণ বস্তার সংখ্যায় রূপান্তর।
// ============================================================
(() => {
  "use strict";

  // হেক্টরপ্রতি পুষ্টি সুপারিশ (কেজি/হেক্টর এন, পি২ও৫, কে২ও)
  // মাঝারি মাটির জন্য বাংলাদেশের প্রচলিত পদ্ধতির আনুমানিক।
  const CROPS = [
    { key: "rice_aman",  name: "ধান (আমন)",      n: 80,  p: 28,  k: 50,  note: "নাইট্রোজেনের ১/৩ ভিত্তি, ১/৩ চারার বিস্তার ও ১/৩ শীষ বের হওয়ার সময় প্রয়োগ করুন। টিএসপি ভিত্তিতে, এমওপি ভাগ করে দিন।" },
    { key: "rice_boro",  name: "ধান (বোরো)",     n: 110, p: 30,  k: 60,  note: "বোরো পুষ্টি-প্রিয় — নাইট্রোজেন ৩–৪ ভাগে সেচের সাথে ভাগ করুন। সালফার কম থাকলে জিঙ্ক দিন।" },
    { key: "rice_aus",   name: "ধান (আউশ)",      n: 60,  p: 20,  k: 35,  note: "বৃষ্টিনির্ভর আউশে কম মাত্রা ভালো।" },
    { key: "wheat",      name: "গম",            n: 100, p: 25,  k: 45,  note: "নাইট্রোজেনের ১/২ মুকুল গজানোর সময়, বাকি ১/২ চারা বিস্তারে। জিপসাম সালফার দেয়।" },
    { key: "potato",     name: "আলু",           n: 150, p: 60,  k: 120, note: "পটাশ-সংবেদনশীল — এমওপি কোনোভাবেই বাদ দেবেন না। পি ও কে ভিত্তিতে, নাইট্রোজেন ভাগ করে দিন।" },
    { key: "maize",      name: "ভুট্টা",         n: 120, p: 35,  k: 50,  note: "নাইট্রোজেন ভাগ করুন: ভিত্তি, ভি৬ ও রেশমগুচ্ছ সময়ে। জিঙ্কে ভালো সাড়া দেয়।" },
    { key: "jute",       name: "পাট",            n: 60,  p: 30,  k: 40,  note: "টিএসপি + এমওপি ভিত্তিতে, নাইট্রোজেন ৪–৬ সপ্তাহে ওপরে দিন। জলাবদ্ধতা এড়িয়ে চলুন।" },
    { key: "mustard",    name: "সরিষা",          n: 80,  p: 30,  k: 40,  note: "ভিত্তি প্রয়োগ ভালো কাজ করে; সালফার (জিপসাম) তেলের পরিমাণ বাড়ায়।" },
    { key: "sugarcane",  name: "আখ",            n: 200, p: 70,  k: 110, note: "নাইট্রোজেনের চাহিদা বেশি — চারা বিস্তার ও লম্বা হওয়ার সময় ভাগ করুন। খড় মালচ সাহায্য করে।" },
    { key: "tomato",     name: "টমেটো",          n: 120, p: 70,  k: 90,  note: "সেচসহ কয়েক ভাগে দিন; পটাশ ফুল ও ফলের গুণমান বাড়ায়। ফুল আসার সময় নাইট্রোজেন কমিয়ে দিন।" },
    { key: "brinjal",    name: "বেগুন",          n: 110, p: 60,  k: 80,  note: "নাইট্রোজেন ভাগ করুন; প্রতিবার তোলার পর পাশে দিন। মাটি ভেজা রাখুন।" },
    { key: "chilli",     name: "কাঁচা মরিচ",     n: 100, p: 55,  k: 75,  note: "নাইট্রোজেন ভাগ করুন; পটাশ ঝাল ও ফলন বাড়ায়। মালচ দিয়ে রস ধরে রাখুন।" },
    { key: "onion",      name: "পেঁয়াজ",         n: 90,  p: 45,  k: 70,  note: "পি ও কে ভিত্তিতে; নাইট্রোজেন ভাগ করুন। পাতা পাকার আগে নাইট্রোজেন বন্ধ করুন।" },
    { key: "pulse",      name: "ডাল (মসুর/মুগ)", n: 20,  p: 40,  k: 30,  note: "নাইট্রোজেন কম লাগে (জীবাণু স্থির করে), তবে পি, সালফার ও মলিবডেনামে ভালো সাড়া দেয়।" },
  ];

  // মাটির অবস্থা অনুযায়ী গুণক
  const SOIL = { low: 1.15, med: 1.0, high: 0.85 };

  // আয়তনকে হেক্টরে রূপান্তর
  const TO_HA = { acre: 0.4047, hectare: 1, bigha: 0.1338, decimal: 0.000405 };

  // সারজাতীয় পণ্য -> পুষ্টির শতকরা, বস্তার ওজন কেজি
  const PRODUCTS = [
    { key: "urea", name: "ইউরিয়া", sub: "৪৬% নাইট্রোজেন", bag: 50, nutrient: "N", pct: 0.46 },
    { key: "tsp",  name: "টিএসপি",  sub: "২০% পি২ও৫",     bag: 50, nutrient: "P", pct: 0.20 },
    { key: "mop",  name: "এমওপি",  sub: "৬০% কে২ও",      bag: 50, nutrient: "K", pct: 0.60 },
    { key: "gypsum", name: "জিপসাম", sub: "১৮% সালফার",   bag: 25, nutrient: "S", pct: 0.18 },
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

    const need = { N: nPerHa * areaHa, P: pPerHa * areaHa, K: kPerHa * areaHa };

    const sPerHa = 20 * (soilSel.value === "low" ? 1.1 : soilSel.value === "high" ? 0.9 : 1);
    need.S = sPerHa * areaHa;

    bagsUl.innerHTML = "";
    PRODUCTS.forEach((pr) => {
      const kgNeeded = need[pr.nutrient] / pr.pct;
      const bags = Math.ceil(kgNeeded / pr.bag);
      const li = document.createElement("li");
      li.className = "bag-item";
      li.innerHTML = `<span class="bag-name">${pr.name}<small>${pr.sub} · ${pr.bag} কেজি বস্তা</small></span>` +
                     `<span class="bag-count">${bags} বস্তা</span>`;
      bagsUl.appendChild(li);
    });

    cropNote.textContent = crop.note;
    const unitLabel = unitSel.options[unitSel.selectedIndex].text;
    document.title = `${crop.name} · ${areaIn.value} ${unitLabel} — সার ক্যালকুলেটর`;
  }

  [cropSel, unitSel, soilSel].forEach((el) => el.addEventListener("change", update));
  areaIn.addEventListener("input", update);

  update();
})();
