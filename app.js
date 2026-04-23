// HBS EC Schedule Planner — app logic

// ---------- Persistence: multi-schedule ----------
const SCHEDULES_KEY = "hbs_schedules_v1";
const ACTIVE_KEY    = "hbs_active_v1";

function loadSchedules() {
  const raw = localStorage.getItem(SCHEDULES_KEY);
  if (raw) return JSON.parse(raw);
  // First run — migrate any existing single-schedule data
  const legacy = {
    id: `sched-${Date.now()}`,
    name: "Schedule 1",
    enrolled: JSON.parse(localStorage.getItem("hbs_enrolled_v1") || "[]"),
    customCourses: JSON.parse(localStorage.getItem("hbs_custom_v1") || "[]"),
  };
  return [legacy];
}

let schedules = loadSchedules();
let activeId  = localStorage.getItem(ACTIVE_KEY) || schedules[0].id;
// Guard: active id might not exist after a delete
if (!schedules.find(s => s.id === activeId)) activeId = schedules[0].id;

function getActive() { return schedules.find(s => s.id === activeId) || schedules[0]; }

let enrolled      = new Set(getActive().enrolled);
let customCourses = [...(getActive().customCourses || [])];

function persist() {
  getActive().enrolled      = [...enrolled];
  getActive().customCourses = customCourses;
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  localStorage.setItem(ACTIVE_KEY, activeId);
}
// Alias so existing call-sites still work
function saveEnrolled()      { persist(); }
function saveCustomCourses() { persist(); }

function allCourses() { return [...COURSES, ...customCourses]; }

// --- Schedule operations ---
function switchSchedule(id) {
  persist(); // save current before leaving
  activeId      = id;
  enrolled      = new Set(getActive().enrolled);
  customCourses = [...(getActive().customCourses || [])];
  persist();
  renderScheduleSelector();
  updateAll();
}

function createSchedule(name) {
  persist();
  const s = { id: `sched-${Date.now()}`, name, enrolled: [], customCourses: [] };
  schedules.push(s);
  activeId      = s.id;
  enrolled      = new Set();
  customCourses = [];
  persist();
  renderScheduleSelector();
  updateAll();
  toast(`Created "${name}"`);
}

function renameSchedule(newName) {
  getActive().name = newName;
  persist();
  renderScheduleSelector();
  toast(`Renamed to "${newName}"`);
}

function duplicateSchedule() {
  const src = getActive();
  const name = prompt("Name for duplicate:", `${src.name} (copy)`);
  if (!name || !name.trim()) return;
  persist();

  // Give each custom course a new ID and build a remapping table
  const idMap = new Map();
  const newCustomCourses = src.customCourses.map(c => {
    const newId = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    idMap.set(c.id, newId);
    return { ...c, id: newId };
  });

  // Remap enrolled: catalog IDs stay the same, custom IDs get their new counterpart
  const newEnrolled = src.enrolled.map(id => idMap.get(id) || id);

  const s = {
    id: `sched-${Date.now()}`,
    name: name.trim(),
    enrolled: newEnrolled,
    customCourses: newCustomCourses,
  };
  schedules.push(s);
  activeId      = s.id;
  enrolled      = new Set(s.enrolled);
  customCourses = [...s.customCourses];
  persist();
  renderScheduleSelector();
  updateAll();
  toast(`Duplicated as "${s.name}"`);
}

function deleteSchedule() {
  if (schedules.length <= 1) { toast("Can't delete the only schedule"); return; }
  const name = getActive().name;
  schedules = schedules.filter(s => s.id !== activeId);
  activeId      = schedules[0].id;
  enrolled      = new Set(getActive().enrolled);
  customCourses = [...(getActive().customCourses || [])];
  persist();
  renderScheduleSelector();
  updateAll();
  toast(`Deleted "${name}"`);
}

function renderScheduleSelector() {
  const sel = document.getElementById("scheduleSelect");
  sel.innerHTML = "";
  for (const s of schedules) {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = s.name;
    if (s.id === activeId) o.selected = true;
    sel.appendChild(o);
  }
  // Only show delete if more than one schedule exists
  document.getElementById("deleteScheduleBtn").style.display =
    schedules.length > 1 ? "" : "none";
}

// ---------- Date helpers ----------
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toISO(d) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function startOfWeekMonday(d) {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  return r;
}
function minutesFromTime(t) {
  const [h,m] = t.split(":").map(Number);
  return h*60 + m;
}
function fmtTime(t) {
  const [h,m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2,"0")}${ampm}`;
}

// ---------- Day type lookup ----------
const xAll = new Set([...CAL.xQ1, ...CAL.xQ2, ...CAL.xQ3, ...CAL.xQ4]);
const yAll = new Set([...CAL.yQ1, ...CAL.yQ2, ...CAL.yQ3, ...CAL.yQ4]);
const holidays = new Set([
  "2026-09-07","2026-10-12","2026-11-11","2026-11-25","2026-11-26","2026-11-27",
  "2027-01-18","2027-02-15","2027-05-24"
]);
const exams = new Set([
  "2026-12-04","2026-12-05","2026-12-07","2026-12-08","2026-12-09","2026-12-10","2026-12-11",
  "2027-04-22","2027-04-23","2027-04-24","2027-04-26","2027-04-27"
]);
const springBreak = new Set([
  "2027-03-15","2027-03-16","2027-03-17","2027-03-18","2027-03-19"
]);

function dayType(iso) {
  if (xAll.has(iso)) return "x";
  if (yAll.has(iso)) return "y";
  if (holidays.has(iso)) return "holiday";
  if (exams.has(iso)) return "exams";
  if (springBreak.has(iso)) return "break";
  return "none";
}

// ---------- Meeting expansion ----------
function enrolledMeetings() {
  const out = [];
  for (const c of allCourses()) {
    if (!enrolled.has(c.id)) continue;
    for (const d of datesForCourse(c)) out.push({ ...d, course: c });
  }
  return out;
}

// ---------- Conflict detection ----------
function hasConflict(courseId) {
  const target = allCourses().find(c => c.id === courseId);
  if (!target) return false;
  const targetMeetings = datesForCourse(target);
  const others = enrolledMeetings().filter(m => m.course.id !== courseId);
  for (const t of targetMeetings) {
    const ts = minutesFromTime(t.start), te = minutesFromTime(t.end);
    for (const e of others) {
      if (e.date !== t.date) continue;
      if (ts < minutesFromTime(e.end) && te > minutesFromTime(e.start)) return true;
    }
  }
  return false;
}

// ---------- Course display helpers ----------
function scheduleKind(course) {
  if (course.isCustom) return "Custom";
  const types = course.meetings.map(m => m.type);
  if (types.includes("X")) return "X";
  if (types.includes("Y")) return "Y";
  if (types.includes("MON") && course.category === "Joint-Degree") return "Joint";
  return "Weekly";
}

function scheduleBadge(course) {
  const kind = scheduleKind(course);
  if (kind === "Custom") return { cls: "badge-custom", label: "MY" };
  return kind === "X"     ? { cls: "badge-X", label: "X" }
       : kind === "Y"     ? { cls: "badge-Y", label: "Y" }
       : kind === "Joint" ? { cls: "badge-J", label: "JD" }
       :                    { cls: "badge-W", label: "WK" };
}

function meetingSummary(course) {
  return course.meetings.map(m => {
    const tr = `${fmtTime(m.start)}–${fmtTime(m.end)}`;
    return `${m.type} ${tr}`;
  }).join(" + ");
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

// ---------- Rendering: Stats ----------
function renderStats() {
  const count = enrolled.size;
  let credits = 0;
  for (const id of enrolled) {
    const c = allCourses().find(x => x.id === id);
    if (c) credits += c.credits;
  }
  document.getElementById("enrolledCount").textContent = count;
  document.getElementById("creditCount").textContent = credits;
}

// ---------- Rendering: Catalog ----------
const courseListEl = document.getElementById("courseList");
const searchBox    = document.getElementById("searchBox");
const filterTerm   = document.getElementById("filterTerm");
const filterSchedule = document.getElementById("filterSchedule");
const filterCategory = document.getElementById("filterCategory");
const filterEnrolled = document.getElementById("filterEnrolled");
const filterConflicts = document.getElementById("filterConflicts");

// Populate category dropdown from catalog courses only
{
  const cats = [...new Set(COURSES.map(c => c.category))].sort();
  for (const cat of cats) {
    const o = document.createElement("option");
    o.value = cat; o.textContent = cat;
    filterCategory.appendChild(o);
  }
}

function renderCatalog() {
  const q     = searchBox.value.trim().toLowerCase();
  const ft    = filterTerm.value;
  const fs    = filterSchedule.value;
  const fc    = filterCategory.value;
  const fe    = filterEnrolled.checked;
  const fconf = filterConflicts.checked;

  const filtered = allCourses().filter(c => {
    if (ft && c.term !== ft) return false;
    if (fc && c.category !== fc) return false;
    if (fs) {
      const k = scheduleKind(c);
      if (fs === "Weekly" && k !== "Weekly") return false;
      if (fs === "Joint"  && k !== "Joint")  return false;
      if (fs === "X"      && k !== "X")      return false;
      if (fs === "Y"      && k !== "Y")      return false;
    }
    if (fe && !enrolled.has(c.id)) return false;
    if (q) {
      const hay = `${c.title} ${c.instructor} ${c.code} ${c.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (fconf && !enrolled.has(c.id) && hasConflict(c.id)) return false;
    return true;
  });

  // Separate custom courses and catalog courses
  const customFiltered  = filtered.filter(c => c.isCustom);
  const catalogFiltered = filtered.filter(c => !c.isCustom);

  // Group catalog courses by time slot
  const groups = {};
  for (const c of catalogFiltered) {
    const primary = c.meetings[0];
    const key = `${scheduleKind(c)} — ${primary.type} ${fmtTime(primary.start)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  const orderedKeys = Object.keys(groups).sort((a,b) => {
    const rank = s => s.startsWith("X") ? 0 : s.startsWith("Y") ? 1 : s.startsWith("Weekly") ? 2 : 3;
    const ra = rank(a), rb = rank(b);
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });

  if (filtered.length === 0) {
    courseListEl.innerHTML = `<div class="empty-state"><strong>No courses match</strong>Try clearing filters.</div>`;
    return;
  }

  courseListEl.innerHTML = "";

  // Custom courses section at the top
  if (customFiltered.length > 0) {
    const groupDiv = document.createElement("div");
    groupDiv.className = "course-group";
    const title = document.createElement("div");
    title.className = "course-group-title";
    title.textContent = "My Custom Classes";
    groupDiv.appendChild(title);
    for (const c of customFiltered) groupDiv.appendChild(renderCourseItem(c));
    courseListEl.appendChild(groupDiv);
  }

  // Catalog courses
  for (const key of orderedKeys) {
    const groupDiv = document.createElement("div");
    groupDiv.className = "course-group";
    const title = document.createElement("div");
    title.className = "course-group-title";
    title.textContent = key;
    groupDiv.appendChild(title);
    for (const c of groups[key]) groupDiv.appendChild(renderCourseItem(c));
    courseListEl.appendChild(groupDiv);
  }
}

function renderCourseItem(c) {
  const item = document.createElement("div");
  item.className = "course-item";
  if (enrolled.has(c.id)) item.classList.add("enrolled");
  if (!enrolled.has(c.id) && hasConflict(c.id)) item.classList.add("conflict");

  const badge   = scheduleBadge(c);
  const termText = c.term === "Q1Q2" ? "Q1Q2" : c.term;
  const section  = c.section ? `-${c.section}` : "";
  const colorDot = c.isCustom
    ? `<span class="custom-color-dot" style="background:${c.color}"></span>`
    : "";

  item.innerHTML = `
    <div class="course-head">
      <div class="course-title">${colorDot}${escapeHtml(c.title)}</div>
      <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
        <button class="info-btn" title="Course description">ⓘ</button>
        ${c.isCustom ? `<button class="edit-btn" title="Edit">✎</button>` : ""}
        <span class="course-badge ${badge.cls}">${badge.label}</span>
      </div>
    </div>
    <div class="course-meta">
      <span>${c.isCustom ? "Custom" : c.code + section}</span><span class="dot">•</span>
      <span>${escapeHtml(c.instructor || "—")}</span><span class="dot">•</span>
      <span>${meetingSummary(c)}</span><span class="dot">•</span>
      <span>${c.credits} cr · ${termText}</span>
    </div>
    ${c.notes ? `<div class="course-note">${escapeHtml(c.notes)}</div>` : ""}
    <div class="course-check"></div>
  `;

  // Info button — opens detail drawer without toggling enroll
  item.querySelector(".info-btn").addEventListener("click", ev => {
    ev.stopPropagation();
    openDetail(c.id);
  });

  // Edit button (custom only) — opens modal, does NOT toggle enroll
  if (c.isCustom) {
    item.querySelector(".edit-btn").addEventListener("click", ev => {
      ev.stopPropagation();
      openModal(c);
    });
  }

  // Main click = toggle enrollment
  item.addEventListener("click", () => {
    if (enrolled.has(c.id)) {
      enrolled.delete(c.id);
      toast(`Removed: ${c.title}`);
    } else {
      enrolled.add(c.id);
      toast(hasConflict(c.id) ? `Added (conflict!): ${c.title}` : `Added: ${c.title}`);
    }
    saveEnrolled();
    updateAll();
  });

  return item;
}

// ---------- Calendar: Week view ----------
const calendarEl  = document.getElementById("calendar");
const weekLabel   = document.getElementById("weekLabel");
let currentWeekStart = startOfWeekMonday(new Date(2026, 8, 1));
let view = "week";

function renderCalendar() {
  if (view === "week") renderWeekView();
  else renderTermView();
}

function renderWeekView() {
  const start = currentWeekStart;
  const days  = Array.from({ length: 5 }, (_, i) => addDays(start, i));

  const endLabel = days[4];
  weekLabel.textContent = `${MONTHS[start.getMonth()]} ${start.getDate()} – ${
    start.getMonth() !== endLabel.getMonth() ? MONTHS[endLabel.getMonth()] + " " : ""
  }${endLabel.getDate()}, ${start.getFullYear()}`;

  const startMin = 8*60, endMin = 19*60;
  const pxPerMin = 40/30;
  const totalHeight = (endMin - startMin) * pxPerMin;

  let html = `<div class="week-grid" style="grid-template-rows: auto ${totalHeight}px;">`;
  html += `<div class="day-header" style="background:white;"></div>`;

  const todayISO = toISO(new Date());
  for (const d of days) {
    const iso = toISO(d);
    const dt  = dayType(iso);
    const tagClass = dt === "x" ? "x" : dt === "y" ? "y"
      : (dt === "holiday" || dt === "exams" || dt === "break") ? "holiday"
      : dt === "open" ? "open" : "none";
    const tagLabel = dt === "x" ? "X" : dt === "y" ? "Y"
      : dt === "holiday" ? "Holiday" : dt === "exams" ? "Exams"
      : dt === "break" ? "Break" : dt === "open" ? "Open" : "";
    html += `<div class="day-header ${iso === todayISO ? "today" : ""}">
      <div class="day-name">${WEEKDAYS[d.getDay()]}</div>
      <div class="day-date">${d.getDate()}</div>
      <div class="day-tag ${tagClass}">${tagLabel || "&nbsp;"}</div>
    </div>`;
  }

  // Time column
  html += `<div class="time-col">`;
  for (let m = startMin; m < endMin; m += 30) {
    const h = Math.floor(m/60), mm = m%60;
    html += `<div class="time-label">${mm === 0 ? `${h%12===0?12:h%12} ${h>=12?"PM":"AM"}` : ""}</div>`;
  }
  html += `</div>`;

  // Day columns
  const myMeetings = enrolledMeetings();
  for (const d of days) {
    const iso = toISO(d);
    const dt  = dayType(iso);
    const dayClass = (dt === "holiday" || dt === "exams" || dt === "break") ? "holiday"
      : iso === todayISO ? "today" : "";
    html += `<div class="day-col ${dayClass}">`;

    const todays = myMeetings.filter(m => m.date === iso);
    todays.sort((a,b) => minutesFromTime(a.start) - minutesFromTime(b.start));

    // Group overlapping events into clusters; only events within the same cluster share columns
    function clusterOverlaps(events) {
      const clusters = [];
      for (const ev of events) {
        const s = minutesFromTime(ev.start), e = minutesFromTime(ev.end);
        const hits = [], rest = [];
        for (const cl of clusters) {
          (cl.some(o => minutesFromTime(o.start) < e && minutesFromTime(o.end) > s) ? hits : rest).push(cl);
        }
        clusters.length = 0;
        clusters.push(...rest, [ev, ...hits.flat()]);
      }
      return clusters;
    }

    const assigned = [];
    for (const cluster of clusterOverlaps(todays)) {
      const cols = [];
      const clusterAssigned = [];
      for (const mt of cluster) {
        const s = minutesFromTime(mt.start);
        let placed = false;
        for (let ci = 0; ci < cols.length; ci++) {
          const last = cols[ci][cols[ci].length - 1];
          if (minutesFromTime(last.end) <= s) {
            cols[ci].push(mt); clusterAssigned.push({ mt, col: ci }); placed = true; break;
          }
        }
        if (!placed) { cols.push([mt]); clusterAssigned.push({ mt, col: cols.length - 1 }); }
      }
      const numCols = cols.length;
      for (const a of clusterAssigned) assigned.push({ ...a, numCols });
    }

    for (const { mt, col, numCols } of assigned) {
      const s      = minutesFromTime(mt.start);
      const e      = minutesFromTime(mt.end);
      const top    = (s - startMin) * pxPerMin;
      const height = (e - s) * pxPerMin;
      const wPct   = 100 / numCols;
      const isConflict = numCols > 1;

      // Custom courses use inline color; catalog courses use CSS class
      let blockStyle = `top:${top}px; height:${Math.max(24, height-2)}px; left:calc(${col*wPct}% + 2px); width:calc(${wPct}% - 4px);`;
      let blockClass = "class-block";
      if (mt.course.isCustom) {
        blockStyle += `background:${mt.course.color};`;
      } else {
        const kind = scheduleKind(mt.course);
        blockClass += ` ${kind === "X" ? "x" : kind === "Y" ? "y" : kind === "Joint" ? "j" : "w"}`;
      }
      if (isConflict) blockClass += " conflict";

      html += `<div class="${blockClass}" style="${blockStyle}"
        data-course-id="${escapeHtml(mt.course.id)}"
        title="${escapeHtml(mt.course.title)}">
        <div class="class-title">${escapeHtml(mt.course.title)}</div>
        <div class="class-time">${fmtTime(mt.start)}–${fmtTime(mt.end)}</div>
        <div class="class-inst">${escapeHtml(mt.course.instructor)}</div>
      </div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  calendarEl.innerHTML = html;
}

// ---------- Calendar: Full-term heatmap ----------
function renderTermView() {
  weekLabel.textContent = "Fall 2026 — Full Term";
  let html = `<div class="term-grid">`;
  for (const d of ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"])
    html += `<div class="term-dow">${d}</div>`;

  const enrolledByDate = new Map();
  for (const m of enrolledMeetings()) {
    enrolledByDate.set(m.date, (enrolledByDate.get(m.date) || 0) + 1);
  }

  let cur = new Date(2026, 7, 31);
  const end = new Date(2026, 11, 11);
  let currentMonth = -1;
  while (cur <= end) {
    if (cur.getMonth() !== currentMonth) {
      currentMonth = cur.getMonth();
      html += `<div class="term-month-label">${MONTHS[currentMonth]} 2026</div>`;
    }
    for (let i = 0; i < 7; i++) {
      const iso = toISO(cur);
      const dt  = dayType(iso);
      const count = enrolledByDate.get(iso) || 0;
      const cls = dt === "x" ? "x" : dt === "y" ? "y"
        : (dt === "holiday" || dt === "exams") ? "holiday" : "";
      html += `<div class="term-cell ${cls}">
        <div class="d">${cur.getDate()}</div>
        ${count > 0 ? `<div class="ct">${count} class${count>1?"es":""}</div>` : ""}
      </div>`;
      cur = addDays(cur, 1);
    }
  }
  html += `</div>`;
  calendarEl.innerHTML = html;
}

// ---------- ICS export ----------
function exportICS() {
  if (enrolled.size === 0) { toast("No courses enrolled"); return; }
  const pad = n => String(n).padStart(2,"0");
  const fmt = (iso, time) => {
    const [y,m,d] = iso.split("-");
    const [h,mm]  = time.split(":");
    return `${y}${m}${d}T${pad(h)}${pad(mm)}00`;
  };
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HBS EC Planner//EN\nCALSCALE:GREGORIAN\n";
  for (const m of enrolledMeetings()) {
    ics += "BEGIN:VEVENT\n";
    ics += `UID:${m.course.id}-${m.date}-${m.start}@hbs-planner\n`;
    ics += `DTSTART;TZID=America/New_York:${fmt(m.date, m.start)}\n`;
    ics += `DTEND;TZID=America/New_York:${fmt(m.date, m.end)}\n`;
    ics += `SUMMARY:${m.course.title}\n`;
    ics += `DESCRIPTION:${m.course.instructor || ""} | ${m.course.credits} cr | ${m.course.term}\n`;
    ics += "END:VEVENT\n";
  }
  ics += "END:VCALENDAR\n";
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })),
    download: "hbs-schedule.ics"
  });
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Exported hbs-schedule.ics");
}

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

// ---------- Custom class modal ----------
const modal         = document.getElementById("customModal");
const modalTitleEl  = document.getElementById("modalTitle");
const customForm    = document.getElementById("customForm");
const editingIdEl   = document.getElementById("editingId");
const deleteBtn     = document.getElementById("deleteCustomBtn");

function openModal(existing) {
  editingIdEl.value = existing ? existing.id : "";
  modalTitleEl.textContent = existing ? "Edit Custom Class" : "Add Custom Class";
  deleteBtn.classList.toggle("hidden", !existing);

  // Reset form
  document.getElementById("customTitle").value      = existing ? existing.title : "";
  document.getElementById("customInstructor").value = existing ? (existing.instructor || "") : "";
  document.getElementById("customStart").value      = existing ? existing.meetings[0].start : "08:30";
  document.getElementById("customEnd").value        = existing ? existing.meetings[0].end   : "09:50";
  document.getElementById("customTerm").value       = existing ? existing.term : "Q1Q2";
  document.getElementById("customCredits").value    = existing ? existing.credits : 3;
  document.getElementById("customColor").value      = existing ? existing.color : "#7c3aed";

  // Reset day checkboxes
  const selectedDays = existing ? existing.meetings.map(m => m.type) : [];
  document.querySelectorAll("input[name='days']").forEach(cb => {
    cb.checked = selectedDays.includes(cb.value);
    syncChip(cb);
  });

  modal.classList.remove("hidden");
  document.getElementById("customTitle").focus();
}

function closeModal() {
  modal.classList.add("hidden");
}

// Keep chip styling in sync when checkboxes change
document.querySelectorAll("input[name='days']").forEach(cb => {
  cb.addEventListener("change", () => syncChip(cb));
});
function syncChip(cb) {
  cb.closest(".day-chip").classList.toggle("checked", cb.checked);
}

document.getElementById("addCustomBtn").addEventListener("click", () => openModal(null));
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalCancel").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

deleteBtn.addEventListener("click", () => {
  const id = editingIdEl.value;
  if (!id) return;
  customCourses = customCourses.filter(c => c.id !== id);
  enrolled.delete(id);
  saveCustomCourses();
  saveEnrolled();
  closeModal();
  updateAll();
  toast("Custom class deleted");
});

customForm.addEventListener("submit", e => {
  e.preventDefault();

  const title      = document.getElementById("customTitle").value.trim();
  const instructor = document.getElementById("customInstructor").value.trim();
  const start      = document.getElementById("customStart").value;
  const end        = document.getElementById("customEnd").value;
  const term       = document.getElementById("customTerm").value;
  const credits    = parseFloat(document.getElementById("customCredits").value) || 0;
  const color      = document.getElementById("customColor").value;

  const selectedDays = [...document.querySelectorAll("input[name='days']:checked")].map(cb => cb.value);
  if (!title) { toast("Please enter a class name"); return; }
  if (selectedDays.length === 0) { toast("Select at least one meeting day"); return; }
  if (!start || !end || end <= start) { toast("Check start/end times"); return; }

  const meetings = selectedDays.map(type => ({ type, start, end }));
  const editingId = editingIdEl.value;

  if (editingId) {
    // Update existing
    const idx = customCourses.findIndex(c => c.id === editingId);
    if (idx >= 0) {
      customCourses[idx] = { ...customCourses[idx], title, instructor, term, credits, color, meetings };
    }
  } else {
    // Create new
    const newCourse = {
      id: `custom-${Date.now()}`,
      code: "CUSTOM",
      title,
      instructor,
      credits,
      term,
      category: "Custom",
      color,
      meetings,
      isCustom: true,
    };
    customCourses.push(newCourse);
    enrolled.add(newCourse.id); // auto-enroll new custom classes
  }

  saveCustomCourses();
  saveEnrolled();
  closeModal();
  updateAll();
  toast(editingId ? "Class updated" : `Added: ${title}`);
});

// ---------- Course detail drawer ----------
const courseDetail = document.getElementById("courseDetail");
const detailBody   = document.getElementById("detailBody");

function openDetail(courseId) {
  const c = allCourses().find(x => x.id === courseId);
  if (!c) return;

  const kind = scheduleKind(c);
  const pillClass = kind === "X" ? "x" : kind === "Y" ? "y" : kind === "Joint" ? "j" : "w";
  const pillLabel = kind === "Custom" ? "" : kind;
  const section = c.section ? `-${c.section}` : "";
  const isEnrolled = enrolled.has(c.id);
  const conflict = !isEnrolled && hasConflict(c.id);

  const desc = DESCRIPTIONS[c.code] || "";

  detailBody.innerHTML = `
    <div class="detail-title">
      ${c.isCustom ? `<span class="custom-color-dot" style="background:${c.color};width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:2px;"></span>` : ""}
      ${escapeHtml(c.title)}
    </div>
    <div class="detail-meta">
      ${!c.isCustom ? `<span><strong>${c.code}${section}</strong></span>` : ""}
      ${c.instructor ? `<span>${escapeHtml(c.instructor)}</span>` : ""}
      <span>${c.category}</span>
      <span>${c.credits} credit${c.credits !== 1 ? "s" : ""}</span>
      <span>${c.term === "Q1Q2" ? "Full term (Q1Q2)" : c.term + " only"}</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
      ${kind !== "Custom" ? `<span class="detail-pill ${pillClass}">${pillLabel}</span>` : ""}
      ${c.meetings.map(m => `<span style="font-size:12px;color:var(--ink-2);">${m.type}&nbsp;${fmtTime(m.start)}–${fmtTime(m.end)}</span>`).join(" <span style='color:#ddd'>|</span> ")}
    </div>
    ${desc ? `<div class="detail-description">${escapeHtml(desc)}</div>` : ""}
    ${c.notes ? `<div class="detail-note">${escapeHtml(c.notes)}</div>` : ""}
    <div class="detail-footer">
      <button class="detail-enroll-btn ${isEnrolled ? "remove" : "add"}" id="detailEnrollBtn">
        ${isEnrolled ? "Remove from schedule" : "Add to schedule"}
      </button>
      ${conflict ? `<span class="detail-conflict-warn">⚠ Time conflict with an enrolled class</span>` : ""}
      ${c.isCustom ? `<button class="btn" id="detailEditBtn" style="margin-left:auto;">Edit class</button>` : ""}
      ${!c.isCustom ? `<a class="btn detail-catalog-link" href="https://www.hbs.edu/coursecatalog/${c.code}.html" target="_blank" style="margin-left:auto;text-decoration:none;">Full catalog page ↗</a>` : ""}
    </div>
  `;

  document.getElementById("detailEnrollBtn").addEventListener("click", () => {
    if (enrolled.has(c.id)) {
      enrolled.delete(c.id);
      toast(`Removed: ${c.title}`);
    } else {
      enrolled.add(c.id);
      toast(hasConflict(c.id) ? `Added (conflict!): ${c.title}` : `Added: ${c.title}`);
    }
    saveEnrolled();
    updateAll();
    openDetail(courseId); // refresh drawer
  });

  if (c.isCustom) {
    document.getElementById("detailEditBtn").addEventListener("click", () => {
      closeDetail();
      openModal(c);
    });
  }

  courseDetail.classList.remove("hidden");
}

function closeDetail() {
  courseDetail.classList.add("hidden");
}

// Event delegation: clicks on calendar blocks
calendarEl.addEventListener("click", e => {
  const block = e.target.closest("[data-course-id]");
  if (block) {
    e.stopPropagation();
    openDetail(block.dataset.courseId);
  } else {
    closeDetail();
  }
});

document.getElementById("detailClose").addEventListener("click", closeDetail);

// ---------- Shared update ----------
function updateAll() {
  renderStats();
  renderCatalog();
  renderCalendar();
}

// ---------- Event listeners ----------
searchBox.addEventListener("input", renderCatalog);
filterTerm.addEventListener("change", renderCatalog);
filterSchedule.addEventListener("change", renderCatalog);
filterCategory.addEventListener("change", renderCatalog);
filterEnrolled.addEventListener("change", renderCatalog);
filterConflicts.addEventListener("change", renderCatalog);

document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekStart = addDays(currentWeekStart, -7);
  renderCalendar();
});
document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekStart = addDays(currentWeekStart, 7);
  renderCalendar();
});
document.getElementById("todayBtn").addEventListener("click", () => {
  const iso = toISO(new Date());
  currentWeekStart = (iso < "2026-08-31" || iso > "2026-12-11")
    ? startOfWeekMonday(new Date(2026, 8, 1))
    : startOfWeekMonday(new Date());
  renderCalendar();
});

document.querySelectorAll(".view-toggle .toggle").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".view-toggle .toggle").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    view = b.dataset.view;
    renderCalendar();
  });
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (enrolled.size === 0) return;
  if (!confirm(`Clear all ${enrolled.size} enrolled courses?`)) return;
  enrolled.clear();
  saveEnrolled();
  updateAll();
  toast("Cleared");
});

document.getElementById("exportIcsBtn").addEventListener("click", exportICS);

// ---------- Schedule control listeners ----------
document.getElementById("scheduleSelect").addEventListener("change", e => {
  switchSchedule(e.target.value);
});

document.getElementById("newScheduleBtn").addEventListener("click", () => {
  const name = prompt("Name for new schedule:", `Schedule ${schedules.length + 1}`);
  if (name && name.trim()) createSchedule(name.trim());
});

document.getElementById("duplicateScheduleBtn").addEventListener("click", duplicateSchedule);

document.getElementById("renameScheduleBtn").addEventListener("click", () => {
  const name = prompt("Rename schedule:", getActive().name);
  if (name && name.trim()) renameSchedule(name.trim());
});

document.getElementById("deleteScheduleBtn").addEventListener("click", () => {
  if (!confirm(`Delete "${getActive().name}"? This cannot be undone.`)) return;
  deleteSchedule();
});

// ---------- Mobile tab switching ----------
function setMobileTab(tab) {
  document.querySelectorAll(".mobile-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === tab));
  document.body.classList.toggle("mobile-cal", tab === "calendar");
}
document.querySelectorAll(".mobile-tab").forEach(t => {
  t.addEventListener("click", () => setMobileTab(t.dataset.tab));
});

// Initial render
renderScheduleSelector();
updateAll();
