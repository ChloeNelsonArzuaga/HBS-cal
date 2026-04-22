// HBS EC 2026-27 calendar data + Fall 2026 course catalog.
// Dates sourced from the MBA 2026-27 EC Academic Calendar PDF.
// Courses sourced from the MBA Elective Curriculum Fall 2026 schedule PDF (updated 4.22.26).

const CAL = {
  // Day type per calendar cell for the Fall 2026 semester (Q1Q2)
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
  // Spring 2027 (Q3Q4) — provided for the date navigator; course catalog below is Fall only
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
};

// Returns all class dates for a course based on meetings[] + term.
// term: "Q1" | "Q2" | "Q1Q2"
function datesForCourse(course) {
  const out = [];
  for (const m of course.meetings) {
    let src = [];
    if (m.type === "X") {
      if (course.term === "Q1" || course.term === "Q1Q2") src = src.concat(CAL.xQ1);
      if (course.term === "Q2" || course.term === "Q1Q2") src = src.concat(CAL.xQ2);
    } else if (m.type === "Y") {
      if (course.term === "Q1" || course.term === "Q1Q2") src = src.concat(CAL.yQ1);
      if (course.term === "Q2" || course.term === "Q1Q2") src = src.concat(CAL.yQ2);
    } else if (m.type === "MON") src = CAL.monFall;
    else if (m.type === "TUE") src = CAL.tueFall;
    else if (m.type === "WED") src = CAL.wedFall;
    else if (m.type === "THU") src = CAL.thuFall;

    // For half-term weekly classes (Q1 or Q2), filter by date range
    if (course.term === "Q1" && (m.type !== "X" && m.type !== "Y")) {
      src = src.filter(d => d <= "2026-10-19");
    } else if (course.term === "Q2" && (m.type !== "X" && m.type !== "Y")) {
      src = src.filter(d => d >= "2026-10-20");
    }

    for (const d of src) out.push({ date: d, start: m.start, end: m.end });
  }
  return out;
}

// --- COURSE CATALOG (Fall 2026 Q1Q2) ---
// term: "Q1", "Q2", "Q1Q2"
// meetings: primary session(s). type = X/Y/MON/TUE/WED/THU, start/end in "HH:MM"
// category loosely groups courses for filtering
const COURSES = [
  // ===== X 8:30-9:50 =====
  { id:"2261", code:"2261", title:"Adv Negotiation: Great Dealmakers", instructor:"Sebenius",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"1504", code:"1504", title:"Building & Sustaining a Successful Enterprise", instructor:"Van Bever",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"1306", code:"1306", title:"Business Analysis & Valuation", instructor:"Pacelli",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"2158", code:"2158", title:"Demystifying Family Enterprise", instructor:"Wing",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"1777", code:"1777", title:"Entrepreneurial Innovation in Life Sciences", instructor:"Tadikonda",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"1446-01", code:"1446", section:"01", title:"Investment Management", instructor:"Viceira",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"2120-01", code:"2120", section:"01", title:"Managing Service Operations", instructor:"Markey",
    credits:3, term:"Q1Q2", category:"Operations",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },
  { id:"1765-01", code:"1765", section:"01", title:"Product Management", instructor:"Torti",
    credits:1.5, term:"Q2", category:"Marketing",
    meetings:[{ type:"X", start:"08:30", end:"09:50" }] },

  // ===== X 10:10-11:30 =====
  { id:"1914-01", code:"1914", section:"01", title:"Business of Entertainment, Media & Sports", instructor:"Elberse",
    credits:3, term:"Q1Q2", category:"Marketing",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"1416-01", code:"1416", section:"01", title:"Corporate Finance: The CFO Perspective", instructor:"Foley",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"2077-01", code:"2077", section:"01", title:"Crafting Your Life", instructor:"Perlow",
    credits:3, term:"Q1Q2", category:"Leadership",
    notes:"TUES session + WED 4:00-6:00pm plenary",
    meetings:[
      { type:"X", start:"10:10", end:"11:30" },
      { type:"WED", start:"16:00", end:"18:00" },
    ] },
  { id:"1153", code:"1153", title:"Global Capitalism: Past, Present, Future", instructor:"Reinert",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"1446-02", code:"1446", section:"02", title:"Investment Management", instructor:"Siriwardane",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"1757-01", code:"1757", section:"01", title:"Launching Tech Ventures with AI", instructor:"Bussgang",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"2120-02", code:"2120", section:"02", title:"Managing Service Operations", instructor:"Buell",
    credits:3, term:"Q1Q2", category:"Operations",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"2240-01", code:"2240", section:"01", title:"Negotiation", instructor:"Mohan",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },
  { id:"1765-02", code:"1765", section:"02", title:"Product Management", instructor:"Torti",
    credits:1.5, term:"Q2", category:"Marketing",
    meetings:[{ type:"X", start:"10:10", end:"11:30" }] },

  // ===== X 11:50-1:10 =====
  { id:"1632", code:"1632", title:"Three Technologies That Will Change the World", instructor:"Ghosh",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"1908", code:"1908", title:"Business at the Base of the Pyramid", instructor:"Roth; Rigol",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"1914-02", code:"1914", section:"02", title:"Business of Entertainment, Media & Sports", instructor:"Elberse",
    credits:3, term:"Q1Q2", category:"Marketing",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"1416-02", code:"1416", section:"02", title:"Corporate Finance: The CFO Perspective", instructor:"Foley",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"2077-02", code:"2077", section:"02", title:"Crafting Your Life", instructor:"Perlow",
    credits:3, term:"Q1Q2", category:"Leadership",
    notes:"TUES session + WED 4:00-6:00pm plenary",
    meetings:[
      { type:"X", start:"11:50", end:"13:10" },
      { type:"WED", start:"16:00", end:"18:00" },
    ] },
  { id:"1529", code:"1529", title:"Crucibles of Crisis Leadership", instructor:"Koehn",
    credits:3, term:"Q1Q2", category:"Leadership",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"1757-02", code:"1757", section:"02", title:"Launching Tech Ventures with AI", instructor:"Mnookin",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"2120-03", code:"2120", section:"03", title:"Managing Service Operations", instructor:"Buell",
    credits:3, term:"Q1Q2", category:"Operations",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },
  { id:"2240-02", code:"2240", section:"02", title:"Negotiation", instructor:"Zlatev",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"X", start:"11:50", end:"13:10" }] },

  // ===== X 1:30-2:50 =====
  { id:"1676", code:"1676", title:"Founder Mindset", instructor:"Satchu",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"1540", code:"1540", title:"Law, Management & Entrepreneurship", instructor:"Batter",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"1509", code:"1509", title:"Managing Innovation in Financial Services", instructor:"Scharfstein",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"2240-03", code:"2240", section:"03", title:"Negotiation", instructor:"Beshears",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"2218", code:"2218", title:"Negotiation & Diplomacy", instructor:"Sebenius; Burns",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"1623", code:"1623", title:"Public Entrepreneurship", instructor:"Weiss",
    credits:3, term:"Q1Q2", category:"Entrepreneurship",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"2265", code:"2265", title:"Deals", instructor:"Subramanian",
    credits:1.5, term:"Q2", category:"Finance",
    notes:"1:30-3:30pm",
    meetings:[{ type:"X", start:"13:30", end:"15:30" }] },
  { id:"1625", code:"1625", title:"Entrepreneurial Finance", instructor:"Howell",
    credits:1.5, term:"Q2", category:"Finance",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"1185", code:"1185", title:"Innovating at Scale", instructor:"Roche",
    credits:1.5, term:"Q1", category:"Strategy",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },
  { id:"1340", code:"1340", title:"Ownership by Design", instructor:"Hsieh; Rouen",
    credits:1.5, term:"Q1", category:"Strategy",
    meetings:[{ type:"X", start:"13:30", end:"14:50" }] },

  // ===== Weekly TUES (X-track) =====
  { id:"1287", code:"1287", title:"Advanced Competitive Strategy", instructor:"Van den Steen",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"TUE", start:"15:10", end:"17:10" }] },
  { id:"1120", code:"1120", title:"Capitalism & the State", instructor:"Spar",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"TUE", start:"15:10", end:"17:10" }] },
  { id:"6333", code:"6333", title:"FC: Field X", instructor:"R. Cohen",
    credits:3, term:"Q1Q2", category:"Field Course",
    meetings:[{ type:"TUE", start:"15:10", end:"17:10" }] },
  { id:"6673", code:"6673", title:"FC: Startup Operations", instructor:"Wallace",
    credits:3, term:"Q1Q2", category:"Field Course",
    meetings:[{ type:"TUE", start:"15:10", end:"17:10" }] },
  { id:"1562", code:"1562", title:"The Moral Leader", instructor:"Sucher",
    credits:3, term:"Q1Q2", category:"Leadership",
    meetings:[{ type:"TUE", start:"15:10", end:"17:10" }] },
  { id:"1265", code:"1265", title:"Grand Challenges: Unicorns", instructor:"Hill; Khanna",
    credits:1.5, term:"Q2", category:"Strategy",
    meetings:[{ type:"TUE", start:"15:10", end:"17:10" }] },

  // ===== Weekly WED =====
  { id:"1412", code:"1412", title:"FC: Inside the Family Office", instructor:"L. Cohen",
    credits:3, term:"Q1Q2", category:"Field Course",
    meetings:[{ type:"WED", start:"15:10", end:"17:10" }] },
  { id:"6756", code:"6756", title:"FC: Life Sciences Venture Creation", instructor:"Tadikonda",
    credits:3, term:"Q1Q2", category:"Field Course",
    meetings:[{ type:"WED", start:"15:10", end:"17:10" }] },
  { id:"6454", code:"6454", title:"FC: Seminar in Investing", instructor:"Fleiss",
    credits:3, term:"Q1Q2", category:"Field Course",
    meetings:[{ type:"WED", start:"15:10", end:"17:10" }] },
  { id:"2292-01", code:"2292", section:"01", title:"War & Peace: Lessons for Leaders", instructor:"Malhotra",
    credits:3, term:"Q1Q2", category:"Leadership",
    meetings:[{ type:"WED", start:"15:10", end:"17:10" }] },
  { id:"2292-02", code:"2292", section:"02", title:"War & Peace: Lessons for Leaders", instructor:"Mohan",
    credits:3, term:"Q1Q2", category:"Leadership",
    meetings:[{ type:"WED", start:"15:10", end:"17:10" }] },

  // ===== Y 8:30-9:50 =====
  { id:"1130-01", code:"1130", section:"01", title:"Entrepreneurship & Global Capitalism", instructor:"G. Jones",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1452-01", code:"1452", section:"01", title:"Financial Management of Smaller Firms", instructor:"Ruback; Yudkoff",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1180-01", code:"1180", section:"01", title:"Institutions, Macroeconomics & Global Economy", instructor:"Pons",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1581-01", code:"1581", section:"01", title:"Social Enterprise & Systems Change", instructor:"Trelstad",
    credits:3, term:"Q1Q2", category:"Social Enterprise",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1684", code:"1684", title:"Real Property", instructor:"Charvel; Dubrowski; Wu",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1581-02", code:"1581", section:"02", title:"Social Enterprise & Systems Change", instructor:"Chertavian",
    credits:3, term:"Q1Q2", category:"Social Enterprise",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1286-01", code:"1286", section:"01", title:"Strategy & Technology", instructor:"Yoffie",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"2108", code:"2108", title:"Supply Chain Management", instructor:"Ferreira",
    credits:3, term:"Q1Q2", category:"Operations",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },
  { id:"1428-01", code:"1428", section:"01", title:"Venture Capital & Private Equity", instructor:"Tango",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"08:30", end:"09:50" }] },

  // ===== Y 10:10-11:30 =====
  { id:"1130-02", code:"1130", section:"02", title:"Entrepreneurship & Global Capitalism", instructor:"G. Jones",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1452-02", code:"1452", section:"02", title:"Financial Management of Smaller Firms", instructor:"Ruback; Yudkoff",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1180-02", code:"1180", section:"02", title:"Institutions, Macroeconomics & Global Economy", instructor:"Pons",
    credits:3, term:"Q1Q2", category:"BGIE",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"2240-04", code:"2240", section:"04", title:"Negotiation", instructor:"Goldenberg",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1440-01", code:"1440", section:"01", title:"Private Equity Finance", instructor:"Berk; Ivashina",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1995", code:"1995", title:"AI-Powered Digital Marketing", instructor:"Cook",
    credits:1.5, term:"Q1", category:"Marketing",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"2165", code:"2165", title:"Driving Profitable Growth", instructor:"Alcacer; Sadun",
    credits:1.5, term:"Q2", category:"Strategy",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },

  // ===== Y 11:50-1:10 =====
  { id:"2240-05", code:"2240", section:"05", title:"Negotiation", instructor:"Goldenberg",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"1440-02", code:"1440", section:"02", title:"Private Equity Finance", instructor:"Berk; Ivashina",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"1143", code:"1143", title:"Strategy in Green Industries", instructor:"Trumbull",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"1286-02", code:"1286", section:"02", title:"Strategy & Technology", instructor:"Yoffie",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"1428-02", code:"1428", section:"02", title:"Venture Capital & Private Equity", instructor:"A. Jones",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"1655-01", code:"1655", section:"01", title:"Entrepreneur Sales 101", instructor:"Roberge; Shipley",
    credits:1.5, term:"Q2", category:"Entrepreneurship",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"6345", code:"6345", title:"FC: Innovating in Healthcare", instructor:"Creo; Herzlinger",
    credits:1.5, term:"Q2", category:"Field Course",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"2185", code:"2185", title:"Innovating in Healthcare", instructor:"Creo; Herzlinger",
    credits:1.5, term:"Q1", category:"Strategy",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"2061", code:"2061", title:"Managing Human Capital", instructor:"Zhang",
    credits:1.5, term:"Q2", category:"Leadership",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"2043", code:"2043", title:"Mastering Consulting Advisory Skills", instructor:"Fubini",
    credits:1.5, term:"Q1", category:"Strategy",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },

  // ===== Y 1:30-2:50 =====
  { id:"2240-06", code:"2240", section:"06", title:"Negotiation", instructor:"Coffman",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"1816", code:"1816", title:"Motivating People", instructor:"Whillans",
    credits:3, term:"Q1Q2", category:"Leadership",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"1563", code:"1563", title:"Spiritual Lives of Leaders", instructor:"Hsieh; Van Bever",
    credits:3, term:"Q1Q2", category:"Leadership",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"1315", code:"1315", title:"Anatomy of Fraud", instructor:"Dey; Heese",
    credits:1.5, term:"Q1", category:"Finance",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"7515", code:"7515", title:"Arts of Communication", instructor:"Bertotti",
    credits:1.5, term:"Q1", category:"Leadership",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"1655-02", code:"1655", section:"02", title:"Entrepreneur Sales 101", instructor:"Roberge; Shipley",
    credits:1.5, term:"Q2", category:"Entrepreneurship",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"6605", code:"6605", title:"FC: Invest for Impact", instructor:"Chertavian; A. Jones; McComb; Trelstad",
    credits:1.5, term:"Q2", category:"Field Course",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"1231", code:"1231", title:"Modern Corporate Strategy", instructor:"Tamayo",
    credits:1.5, term:"Q1", category:"Strategy",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },
  { id:"1495", code:"1495", title:"Sustainable Investing", instructor:"Cole; Gandhi",
    credits:1.5, term:"Q1", category:"Finance",
    meetings:[{ type:"Y", start:"13:30", end:"14:50" }] },

  // ===== Weekly THURS IFCs =====
  { id:"6057", code:"6057", title:"IFC: Cape Town — Africa Rising", instructor:"Belo-Osagie; Macomber",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6089", code:"6089", title:"IFC: China — Geopolitics, Trade & Supply Chains", instructor:"Rithemire; Shih",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6066", code:"6066", title:"IFC: India — Development at Scale", instructor:"Gandhi",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6052", code:"6052", title:"IFC: Italy — Tradition & Innovation", instructor:"Reinert; Roscini",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6062", code:"6062", title:"IFC: Japan — Innovation Ecosystem", instructor:"Amano; Casadesus-Masanell",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6060", code:"6060", title:"IFC: Saudi Arabia — A Nation and its Oil Economy Reimagined", instructor:"Khanna; Zelleke",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6094", code:"6094", title:"IFC: Silicon Valley — Disrupting Silicon Valley with AI", instructor:"Roberge",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },
  { id:"6093", code:"6093", title:"IFC: Singapore — Global Innovation Hub", instructor:"Schulman",
    credits:3, term:"Q1Q2", category:"IFC",
    meetings:[{ type:"THU", start:"15:10", end:"17:10" }] },

  // ===== Joint-Degree =====
  { id:"5230", code:"5230", title:"Creating Value in Business & Government (HBS-HKS)", instructor:"Zelleke",
    credits:3, term:"Q1Q2", category:"Joint-Degree",
    meetings:[{ type:"MON", start:"16:30", end:"18:45" }] },
  { id:"5240", code:"5240", title:"Design of Technology Ventures (HBS-SEAS)", instructor:"Clay; Howe",
    credits:3, term:"Q1Q2", category:"Joint-Degree",
    meetings:[
      { type:"MON", start:"15:50", end:"17:10" },
      { type:"WED", start:"15:50", end:"17:10" },
    ] },
];
