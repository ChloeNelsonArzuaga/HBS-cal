// HBS EC 2026-27 calendar data, shared by every term.
// Dates sourced from the MBA 2026-27 EC Academic Calendar PDF.
// Course catalogs live in data-fall2026.js and data-spring2027.js.

const CAL = {
  // Day type per calendar cell. Fall 2026 (Q1Q2) is kept for the date navigator.
  // Q1: X = 9/2-10/19, Y = 9/3-10/15
  // Q2: X = 10/20-12/1, Y = 10/16-12/3
  xQ1: [
    "2026-09-02","2026-09-08","2026-09-09","2026-09-14","2026-09-15",
    "2026-09-22","2026-09-23","2026-09-28","2026-09-29","2026-10-05",
    "2026-10-06","2026-10-13","2026-10-14","2026-10-19"
  ],
  xQ2: [
    "2026-10-20","2026-10-21","2026-10-26","2026-10-27","2026-11-02",
    "2026-11-03","2026-11-09","2026-11-10","2026-11-16","2026-11-18",
    "2026-11-23","2026-11-24","2026-11-30","2026-12-01"
  ],
  yQ1: [
    "2026-09-03","2026-09-10","2026-09-11","2026-09-16","2026-09-17",
    "2026-09-18","2026-09-24","2026-09-25","2026-09-30","2026-10-01",
    "2026-10-02","2026-10-07","2026-10-08","2026-10-15"
  ],
  yQ2: [
    "2026-10-16","2026-10-22","2026-10-23","2026-10-28","2026-10-30",
    "2026-11-04","2026-11-05","2026-11-06","2026-11-12","2026-11-13",
    "2026-11-19","2026-11-20","2026-12-02","2026-12-03"
  ],
  // Spring 2027 (Q3Q4)
  // Q3: X = 1/25-3/8, Y = 1/26-3/5
  // Q4: X = 3/9-4/20, Y = 3/10-4/21
  xQ3: [
    "2027-01-25","2027-01-28","2027-02-01","2027-02-02","2027-02-08",
    "2027-02-09","2027-02-16","2027-02-17","2027-02-22","2027-02-23",
    "2027-03-01","2027-03-02","2027-03-03","2027-03-08"
  ],
  xQ4: [
    "2027-03-09","2027-03-22","2027-03-23","2027-03-24","2027-03-30",
    "2027-04-05","2027-04-06","2027-04-07","2027-04-12","2027-04-13",
    "2027-04-14","2027-04-19","2027-04-20"
  ],
  yQ3: [
    "2027-01-26","2027-01-29","2027-02-03","2027-02-04","2027-02-05",
    "2027-02-10","2027-02-11","2027-02-12","2027-02-18","2027-02-19",
    "2027-02-24","2027-02-25","2027-03-04","2027-03-05"
  ],
  yQ4: [
    "2027-03-10","2027-03-11","2027-03-12","2027-03-25","2027-03-26",
    "2027-03-31","2027-04-01","2027-04-02","2027-04-08","2027-04-09",
    "2027-04-15","2027-04-16","2027-04-21"
  ],
  // Weekly-recurring class days during Q3Q4 (excluding holidays, open days and spring break)
  monSpring: [
    "2027-01-25","2027-02-01","2027-02-08","2027-02-22","2027-03-01",
    "2027-03-08","2027-03-22","2027-04-05","2027-04-12","2027-04-19"
  ],
  tueSpring: [
    "2027-01-26","2027-02-02","2027-02-09","2027-02-16","2027-02-23",
    "2027-03-02","2027-03-09","2027-03-23","2027-03-30","2027-04-06",
    "2027-04-13","2027-04-20"
  ],
  wedSpring: [
    "2027-01-27","2027-02-03","2027-02-10","2027-02-17","2027-02-24",
    "2027-03-03","2027-03-10","2027-03-24","2027-03-31","2027-04-07",
    "2027-04-14","2027-04-21"
  ],
  thuSpring: [
    "2027-01-28","2027-02-04","2027-02-11","2027-02-18","2027-02-25",
    "2027-03-04","2027-03-11","2027-03-25","2027-04-01","2027-04-08",
    "2027-04-15"
  ],
  friSpring: [
    "2027-01-29","2027-02-05","2027-02-12","2027-02-19","2027-03-05",
    "2027-03-12","2027-03-26","2027-04-02","2027-04-09","2027-04-16"
  ],
  // Weekly-recurring class days during Q1Q2 (excluding holidays/open days where all classes are canceled)
  monFall: [
    "2026-09-14","2026-09-28","2026-10-05","2026-10-19","2026-10-26",
    "2026-11-02","2026-11-09","2026-11-16","2026-11-23","2026-11-30"
  ],
  tueFall: [
    "2026-09-08","2026-09-15","2026-09-22","2026-09-29","2026-10-06",
    "2026-10-13","2026-10-20","2026-10-27","2026-11-03","2026-11-10",
    "2026-11-24","2026-12-01"
  ],
  wedFall: [
    "2026-09-02","2026-09-09","2026-09-16","2026-09-23","2026-09-30",
    "2026-10-07","2026-10-14","2026-10-21","2026-10-28","2026-11-04",
    "2026-11-18","2026-12-02"
  ],
  thuFall: [
    "2026-09-03","2026-09-10","2026-09-17","2026-09-24","2026-10-01",
    "2026-10-08","2026-10-15","2026-10-22","2026-11-05","2026-11-12",
    "2026-11-19","2026-12-03"
  ],
  friFall: [
    "2026-09-04","2026-09-11","2026-09-18","2026-09-25","2026-10-02",
    "2026-10-09","2026-10-16","2026-10-23","2026-10-30","2026-11-06",
    "2026-11-13","2026-11-20"
  ],
};

// Term definitions. Each data-<term>.js file fills in courses + descriptions.
// splitDate: first day of the second quarter (used to trim half-term weekly classes)
const TERMS = {
  fall2026: {
    id: "fall2026", label: "Fall 2026", full: "Q1Q2", quarters: ["Q1", "Q2"], splitDate: "2026-10-20",
    start: "2026-08-31", end: "2026-12-11",
    weekly: { MON: CAL.monFall, TUE: CAL.tueFall, WED: CAL.wedFall, THU: CAL.thuFall, FRI: CAL.friFall },
    schedulesKey: "hbs_schedules_v1", activeKey: "hbs_active_v1",
    courses: [], descriptions: {},
  },
  spring2027: {
    id: "spring2027", label: "Spring 2027", full: "Q3Q4", quarters: ["Q3", "Q4"], splitDate: "2027-03-09",
    start: "2027-01-25", end: "2027-04-30",
    weekly: { MON: CAL.monSpring, TUE: CAL.tueSpring, WED: CAL.wedSpring, THU: CAL.thuSpring, FRI: CAL.friSpring },
    schedulesKey: "hbs_schedules_spring2027_v1", activeKey: "hbs_active_spring2027_v1",
    courses: [], descriptions: {},
  },
};

function termForCourse(course) {
  return /Q[12]/.test(course.term) ? TERMS.fall2026 : TERMS.spring2027;
}

// Returns all class dates for a course based on meetings[] + term.
// term: a single quarter ("Q1".."Q4") or a full term ("Q1Q2" / "Q3Q4")
// Weekly courses may carry startDate/endDate from the catalog to trim their date range.
function datesForCourse(course) {
  const t = termForCourse(course);
  const [qa, qb] = t.quarters;
  const inA = course.term === qa || course.term === t.full;
  const inB = course.term === qb || course.term === t.full;
  const out = [];
  for (const m of course.meetings) {
    let src = [];
    if (m.type === "X" || m.type === "Y") {
      const k = m.type.toLowerCase();
      if (inA) src = src.concat(CAL[k + qa]);
      if (inB) src = src.concat(CAL[k + qb]);
    } else {
      src = t.weekly[m.type] || [];
      // For half-term weekly classes, filter by date range
      if (course.term === qa) src = src.filter(d => d < t.splitDate);
      else if (course.term === qb) src = src.filter(d => d >= t.splitDate);
      if (course.startDate) src = src.filter(d => d >= course.startDate);
      if (course.endDate)   src = src.filter(d => d <= course.endDate);
    }

    for (const d of src) out.push({ date: d, start: m.start, end: m.end });
  }
  return out;
}
