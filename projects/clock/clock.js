// ============================================================
// Cinematic Clock + Google-style Tasks
// ============================================================

// ---------- Live clock ----------
(() => {
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const tzEl   = document.getElementById("tz");
  const locEl  = document.getElementById("location");

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";

  function tick() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    dateEl.textContent = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  tick();
  setInterval(tick, 1000);

  // Timezone label + a friendly offset, e.g. "Asia/Dhaka · GMT+6"
  const offMin = -new Date().getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const oh = Math.floor(Math.abs(offMin) / 60);
  const om = Math.abs(offMin) % 60;
  const gmt = `GMT${sign}${oh}${om ? ":" + String(om).padStart(2, "0") : ""}`;
  tzEl.textContent = `${tz} · ${gmt}`;

  // Location: derive city from timezone, then refine via reverse-geocode if allowed.
  const cityFromTz = tz.includes("/") ? tz.split("/").pop().replace(/_/g, " ") : tz;
  locEl.textContent = cityFromTz;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { "Accept-Language": "en" } }
          );
          const d = await r.json();
          const a = d.address || {};
          const city = a.city || a.town || a.village || a.state_district || a.county || cityFromTz;
          const country = a.country || "";
          locEl.textContent = country ? `${city}, ${country}` : city;
        } catch {
          /* keep timezone-derived city */
        }
      },
      () => { /* denied — keep timezone-derived city */ },
      { timeout: 8000 }
    );
  }
})();

// ---------- Google-style tasks ----------
(() => {
  const KEY = "imj.clock.tasks";
  const form  = document.getElementById("add-form");
  const input = document.getElementById("add-input");
  const list  = document.getElementById("list");
  const empty = document.getElementById("empty");
  const count = document.getElementById("count");

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#04100f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  let tasks = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(tasks)); }

  function render() {
    list.innerHTML = "";
    tasks.forEach((t) => {
      const li = document.createElement("li");
      li.className = "task-item" + (t.done ? " done" : "");

      const check = document.createElement("span");
      check.className = "task-check";
      check.setAttribute("role", "checkbox");
      check.setAttribute("aria-checked", String(t.done));
      check.innerHTML = CHECK;
      check.addEventListener("click", () => { t.done = !t.done; save(); render(); });

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = t.text;

      const del = document.createElement("button");
      del.className = "task-del";
      del.type = "button";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";
      del.addEventListener("click", () => { tasks = tasks.filter((x) => x !== t); save(); render(); });

      li.append(check, text, del);
      list.appendChild(li);
    });

    const open = tasks.filter((t) => !t.done).length;
    count.textContent = `${open} open`;
    empty.classList.toggle("hidden", tasks.length > 0);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    tasks.push({ text: v, done: false });
    input.value = "";
    save();
    render();
  });

  render();
})();
