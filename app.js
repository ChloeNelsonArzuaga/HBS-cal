// HBS EC Schedule Planner — app logic

// ---------- Persistence ----------
const STORAGE_KEY = "hbs_enrolled_v1";
let enrolled = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
function saveEnrolled() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...enrolled]));
}

// ---------- Date helpers ----------
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parseISO(s) {
  const [y,m,d] = s.split("-").map(Number);
  return new Date(y, m-1, d);
}
function toISO(d) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function startOfWeekMonday(d) {
  const r = new Date(d);
  const day = r.getDay();  // 0=Sun..6=Sat
  const offset = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + offset);
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
const opens = new Set([
  "2026-09-04","2026-09-21","2026-10-09","2026-10-29","2026-11-17",
  "2027-02-26","2027-03-29"
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
  if (opens.has(iso)) return "open";
  if (exams.has(iso)) return "exams";
  if (springBreak.has(iso)) return "break";
  return "none";
}

// ---------- Meeting expansion ----------
// Map every course to a flat list of {date, start, end, course}
function expandedMeetings() {
  const out = [];
  for (const c of COURSES) {
    const dates = datesForCourse(c);
    for (const d of dates) out.push({ ...d, course: c });
  }
  return out;
}
const ALL_MEETINGS = expandedMeetings();

// Only enrolled meetings
function enrolledMeetings() {
  return ALL_MEETINGS.filter(m => enrolled.has(m.course.id));
}

// ---------- Conflict detection ----------
// A conflict is two enrolled classes on the same date with overlapping time.
function hasConflict(courseId) {
  const target = COURSES.find(c => c.id === courseId);
  if (!target) return false;
  const targetMeetings = datesForCourse(target);
  const enrolledMs = enrolledMeetings().filter(m => m.course.id !== courseId);
  for (const t of targetMeetings) {
    const ts = minutesFromTime(t.start), te = minutesFromTime(t.end);
    for (const e of enrolledMs) {
      if (e.date !== t.date) continue;
      const es = minutesFromTime(e.start), ee = minutesFromTime(e.end);
      if (ts < ee && te > es) return true;
    }
  }
  return false;
}

// ---------- Rendering: Catalog ----------
const courseListEl = document.getElementById("courseList");
const searchBox = document.getElementById("searchBox");
const filterTerm = document.getElementById("filterTerm");
const filterSchedule = document.getElementById("filterSchedule");
const filterCategory = document.getElementById("filterCategory");
const filterEnrolled = document.getElementById("filterEnrolled");
const filterConflicts = document.getElementById("filterConflicts");

// Populate categories
{
  const cats = [...new Set(COURSES.map(c => c.category))].sort();
  for (const c of cats) {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    filterCategory.appendChild(o);
  }
}

function scheduleKind(course) {
  const types = course.meetings.map(m => m.type);
  if (types.includes("X")) return "X";
  if (types.includes("Y")) return "Y";
  if (types.includes("MON") && course.category === "Joint-Degree") return "Joint";
  return "Weekly";
}

function scheduleBadge(course) {
  const kind = scheduleKind(course);
  return kind === "X" ? { cls: "badge-X", label: "X" }
       : kind === "Y" ? { cls: "badge-Y", label: "Y" }
       : kind === "Joint" ? { cls: "badge-J", label: "JD" }
       : { cls: "badge-W", label: "WK" };
}

function courseBlockColor(course) {
  const kind = scheduleKind(course);
  return kind === "X" ? "x" : kind === "Y" ? "y" : kind === "Joint" ? "j" : "w";
}

function meetingSummary(course) {
  return course.meetings.map(m => {
    const tr = `${fmtTime(m.start)}–${fmtTime(m.end)}`;
    if (m.type === "X" || m.type === "Y") return `${m.type} ${tr}`;
    return `${m.type} ${tr}`;
  }).join(" + ");
}

function renderCatalog() {
  const q = searchBox.value.trim().toLowerCase();
  const ft = filterTerm.value;
  const fs = filterSchedule.value;
  const fc = filterCategory.value;
  const fe = filterEnrolled.checked;
  const fconf = filterConflicts.checked;

  const filtered = COURSES.filter(c => {
    if (ft && c.term !== ft) return false;
    if (fc && c.category !== fc) return false;
    if (fs) {
      const k = scheduleKind(c);
      if (fs === "Weekly" && k !== "Weekly") return false;
      if (fs === "Joint" && k !== "Joint") return false;
      if (fs === "X" && k !== "X") return false;
      if (fs === "Y" && k !== "Y") return false;
    }
    if (fe && !enrolled.has(c.id)) return false;
    if (q) {
      const hay = `${c.title} ${c.instructor} ${c.code} ${c.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (fconf && !enrolled.has(c.id) && hasConflict(c.id)) return false;
    return true;
  });

  // Group by time slot
  const groups = {};
  for (const c of filtered) {
    const primary = c.meetings[0];
    const key = `${scheduleKind(c)} — ${primary.type} ${fmtTime(primary.start)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  const orderedKeys = Object.keys(groups).sort((a,b) => {
    // X first, then Y, then Weekly, then JD
    const rank = s => s.startsWith("X") ? 0 : s.startsWith("Y") ? 1 : s.startsWith("Weekly") ? 2 : 3;
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });

  if (filtered.length === 0) {
    courseListEl.innerHTML = `<div class="empty-state"><strong>No courses match</strong>Try clearing filters.</div>`;
    return;
  }

  courseListEl.innerHTML = "";
  for (const key of orderedKeys) {
    const groupDiv = document.createElement("div");
    groupDiv.className = "course-group";
    const title = document.createElement("div");
    title.className = "course-group-title";
    title.textContent = key;
    groupDiv.appendChild(title);
    for (const c of groups[key]) {
      groupDiv.appendChild(renderCourseItem(c));
    }
    courseListEl.appendChild(groupDiv);
  }
}

function renderCourseItem(c) {
  const item = document.createElement("div");
  item.className = "course-item";
  if (enrolled.has(c.id)) item.classList.add("enrolled");
  if (!enrolled.has(c.id) && hasConflict(c.id)) item.classList.add("conflict");

  const badge = scheduleBadge(c);
  const termText = c.term === "Q1Q2" ? "Q1Q2" : c.term;
  const section = c.section ? `-${c.section}` : "";

  item.innerHTML = `
    <div class="course-head">
      <div class="course-title">${escapeHtml(c.title)}</div>
      <span class="course-badge ${badge.cls}">${badge.label}</span>
    </div>
    <div class="course-meta">
      <span>${c.code}${section}</span><span class="dot">•</span>
      <span>${escapeHtml(c.instructor)}</span><span class="dot">•</span>
      <span>${meetingSummary(c)}</span><span class="dot">•</span>
      <span>${c.credits} cr · ${termText}</span>
    </div>
    ${c.notes ? `<div class="course-note">${escapeHtml(c.notes)}</div>` : ""}
    <div class="course-check"></div>
  `;

  item.addEventListener("click", () => {
    if (enrolled.has(c.id)) {
      enrolled.delete(c.id);
      toast(`Removed: ${c.title}`);
    } else {
      enrolled.add(c.id);
      if (hasConflict(c.id)) toast(`Added (with conflict): ${c.title}`);
      else toast(`Added: ${c.title}`);
    }
    saveEnrolled();
    updateAll();
  });

  return item;
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

// ---------- Rendering: Stats ----------
function renderStats() {
  const count = enrolled.size;
  let credits = 0;
  for (const id of enrolled) {
    const c = COURSES.find(x => x.id === id);
    if (c) credits += c.credits;
  }
  document.getElementById("enrolledCount").textContent = count;
  document.getElementById("creditCount").textContent = credits;
}

// ---------- Calendar: Week view ----------
const calendarEl = document.getElementById("calendar");
const weekLabel = document.getElementById("weekLabel");
let currentWeekStart = startOfWeekMonday(new Date(2026, 8, 1)); // default: first week of fall
let view = "week";

function renderCalendar() {
  if (view === "week") renderWeekView();
  else renderTermView();
}

function renderWeekView() {
  const start = currentWeekStart;
  const days = [];
  for (let i = 0; i < 5; i++) days.push(addDays(start, i));  // Mon-Fri

  const endLabel = addDays(start, 4);
  weekLabel.textContent = `${MONTHS[start.getMonth()]} ${start.getDate()} – ${start.getMonth() !== endLabel.getMonth() ? MONTHS[endLabel.getMonth()] + " " : ""}${endLabel.getDate()}, ${start.getFullYear()}`;

  // Build time-axis from 8:00 to 19:00 (40px per 30 min)
  const startMin = 8*60, endMin = 19*60;
  const pxPerMin = 40/30;
  const totalHeight = (endMin - startMin) * pxPerMin;

  // Header row
  let html = `<div class="week-grid" style="grid-template-rows: auto ${totalHeight}px;">`;

  // Corner (empty)
  html += `<div class="day-header" style="background:white;"></div>`;

  // Day headers
  const todayISO = toISO(new Date());
  for (const d of days) {
    const iso = toISO(d);
    const dt = dayType(iso);
    const tagClass = dt === "x" ? "x" : dt === "y" ? "y" : (dt === "holiday" || dt === "exams" || dt === "break") ? "holiday" : dt === "open" ? "open" : "none";
    const tagLabel = dt === "x" ? "X" : dt === "y" ? "Y" : dt === "holiday" ? "Holiday" : dt === "exams" ? "Exams" : dt === "break" ? "Break" : dt === "open" ? "Open" : "";
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
    const label = mm === 0 ? `${(h%12===0?12:h%12)} ${h>=12?"PM":"AM"}` : "";
    html += `<div class="time-label">${label}</div>`;
  }
  html += `</div>`;

  // Day columns with class blocks
  const myMeetings = enrolledMeetings();
  for (const d of days) {
    const iso = toISO(d);
    const dt = dayType(iso);
    const dayClass = (dt === "holiday" || dt === "exams" || dt === "break") ? "holiday" : iso === todayISO ? "today" : "";
    html += `<div class="day-col ${dayClass}">`;

    const todays = myMeetings.filter(m => m.date === iso);
    // Sort by start and detect overlaps for side-by-side layout
    todays.sort((a,b) => minutesFromTime(a.start) - minutesFromTime(b.start));
    // Basic side-by-side: assign columns greedily
    const cols = []; // each col is array of meetings
    const assigned = [];
    for (const mt of todays) {
      const s = minutesFromTime(mt.start), e = minutesFromTime(mt.end);
      let placed = false;
      for (let ci = 0; ci < cols.length; ci++) {
        const last = cols[ci][cols[ci].length - 1];
        if (minutesFromTime(last.end) <= s) {
          cols[ci].push(mt);
          assigned.push({ mt, col: ci });
          placed = true;
          break;
        }
      }
      if (!placed) {
        cols.push([mt]);
        assigned.push({ mt, col: cols.length - 1 });
      }
    }
    const totalCols = Math.max(1, cols.length);

    for (const { mt, col } of assigned) {
      const s = minutesFromTime(mt.start), e = minutesFromTime(mt.end);
      const top = (s - startMin) * pxPerMin;
      const height = (e - s) * pxPerMin;
      const widthPct = 100 / totalCols;
      const left = col * widthPct;
      const color = courseBlockColor(mt.course);
      const isConflict = todays.some(o => o !== mt && minutesFromTime(o.start) < e && minutesFromTime(o.end) > s);
      html += `<div class="class-block ${color} ${isConflict ? "conflict" : ""}"
        style="top:${top}px; height:${Math.max(24, height-2)}px; left: calc(${left}% + 2px); right: auto; width: calc(${widthPct}% - 4px);"
        title="${escapeHtml(mt.course.title)} — ${escapeHtml(mt.course.instructor)}">
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

  // Day-of-week headers
  const dow = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  for (const d of dow) html += `<div class="term-dow">${d}</div>`;

  const enrolledByDate = new Map();
  for (const m of enrolledMeetings()) {
    if (!enrolledByDate.has(m.date)) enrolledByDate.set(m.date, 0);
    enrolledByDate.set(m.date, enrolledByDate.get(m.date) + 1);
  }

  // Render each week row from 8/31/2026 to 12/11/2026
  let cur = new Date(2026, 7, 31); // 8/31
  const end = new Date(2026, 11, 11); // 12/11

  let currentMonth = -1;
  while (cur <= end) {
    if (cur.getMonth() !== currentMonth) {
      currentMonth = cur.getMonth();
      html += `<div class="term-month-label">${MONTHS[currentMonth]} 2026</div>`;
      // repeat the dow headers under month label? Only once at top. Skip here.
    }
    for (let i = 0; i < 7; i++) {
      const iso = toISO(cur);
      const dt = dayType(iso);
      const count = enrolledByDate.get(iso) || 0;
      const cls = dt === "x" ? "x" : dt === "y" ? "y" : (dt === "holiday" || dt === "exams" || dt === "break") ? "holiday" : "";
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
    const [h,mm] = time.split(":");
    return `${y}${m}${d}T${pad(h)}${pad(mm)}00`;
  };

  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HBS EC Planner//EN\nCALSCALE:GREGORIAN\n";
  for (const m of enrolledMeetings()) {
    const uid = `${m.course.id}-${m.date}-${m.start}@hbs-planner`;
    ics += "BEGIN:VEVENT\n";
    ics += `UID:${uid}\n`;
    ics += `DTSTART;TZID=America/New_York:${fmt(m.date, m.start)}\n`;
    ics += `DTEND;TZID=America/New_York:${fmt(m.date, m.end)}\n`;
    ics += `SUMMARY:${m.course.title} (${m.course.code}${m.course.section ? "-"+m.course.section : ""})\n`;
    ics += `DESCRIPTION:${m.course.instructor} | ${m.course.credits} cr | ${m.course.term}\n`;
    ics += "END:VEVENT\n";
  }
  ics += "END:VCALENDAR\n";

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hbs-schedule.ics";
  a.click();
  URL.revokeObjectURL(url);
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

// ---------- Wire up ----------
function updateAll() {
  renderStats();
  renderCatalog();
  renderCalendar();
}

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
  const now = new Date();
  // If today is outside semester, jump to first class week
  const iso = toISO(now);
  if (iso < "2026-08-31") currentWeekStart = startOfWeekMonday(new Date(2026, 8, 1));
  else if (iso > "2026-12-11") currentWeekStart = startOfWeekMonday(new Date(2026, 8, 1));
  else currentWeekStart = startOfWeekMonday(now);
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

// Initial render
updateAll();
