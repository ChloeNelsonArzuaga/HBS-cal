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
  friFall: [
    "2026-09-04","2026-09-11","2026-09-18","2026-09-25","2026-10-02",
    "2026-10-09","2026-10-16","2026-10-23","2026-10-30","2026-11-06",
    "2026-11-13","2026-11-20"
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
    else if (m.type === "FRI") src = CAL.friFall;

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

// --- COURSE DESCRIPTIONS (sourced from hbs.edu/coursecatalog) ---
const DESCRIPTIONS = {
  "2261": "Take your negotiating ability to the next level by matching wits with some of the world's greatest dealmakers and diplomats as they work through their toughest deals.",
  "1504": "A second-year elective that explores why managers making seemingly rational decisions often find their firms in trouble, combining business theory with practical case analysis to help students understand causality and become better decision-makers. It covers management of innovation, strategy, and growth from the perspective of the general manager.",
  "1306": "Equips managers and investors with a framework for evaluating companies through financial statements. Students develop expertise in analyzing strategy execution, performance, financial prospects, and firm value across both public and private companies.",
  "2158": "Examines the distinctive challenges and opportunities of leading and governing concentrated ownership enterprises, where control rests with a founder, family, or small group of owners. Explores how ownership structures influence strategy, governance, and succession planning across generations.",
  "1777": "Focuses on the role of individuals in creating, engaging with, operating, or investing in new life sciences ventures. Emphasizes understanding the unique challenges of life sciences innovation, including high levels of scientific, clinical, and commercial uncertainty across biotech, pharmaceuticals, diagnostics, and medical devices.",
  "1446": "Suitable for all students interested in gaining a broad perspective on investing and the asset management business — both those targeting careers in asset management and those interested in learning how to manage their personal wealth, current and future.",
  "2120": "Most companies compete through service; few are designed to deliver it well. Examines how service organizations can be structured and operated effectively, addressing the gap between strategy and execution that results in poor customer experiences and employee disengagement.",
  "1765": "Students take the perspective of a Product Manager at a technology company tasked with improving and growing an existing product. Examines management opportunities and challenges related to building technology products through case studies, exercises, readings, and conversations with product leaders.",
  "1914": "Examines the entertainment, media, and sports sectors through a series of case studies that focus on companies and personalities in these industries.",
  "1416": "Finance leaders and other operators often fail to collaborate effectively. Addresses this gap by teaching students to bridge communication and understanding between finance teams and operational leaders, focusing on core financial activities typically managed by a CFO.",
  "2077": "A course fundamentally about you — preparing and equipping you to better handle the choices, tradeoffs, and surprises that you will inevitably face after graduating from HBS. Covers work-life integration, career transitions, and personal values.",
  "1153": "Explores capitalism's evolution and impact, examining why different forms of capitalism produce vastly different global outcomes. Uses historical context alongside contemporary cases to help students understand economic transformation and business's role in shaping a more sustainable future.",
  "1757": "Teaches founders the playbook for finding product-market fit by treating startups as experimentation machines, with a heavy focus on how modern AI tools accelerate that discovery process. Examines tactical challenges and business model decisions that early-stage technology ventures face before scaling.",
  "2240": "Managerial, executive, and entrepreneurial success requires the ability to negotiate. Teaches students to analyze, prepare for, and execute negotiations at an advanced level through simulations and real-world scenarios involving suppliers, customers, investors, and internal conflicts.",
  "1632": "Examines three transformative technologies — Artificial Intelligence, Blockchain, and Synthetic Biology — that are reshaping business and society. Explores how these technologies create unprecedented opportunities while introducing new risks, and how they are converging rather than operating in isolation.",
  "1908": "Examines one of the most consequential and least understood developments in global capitalism: the rapid growth of commercial markets serving low-income consumers and producers. Treats these populations as a central part of the global economy, framing this as a business strategy challenge rather than a charitable endeavor.",
  "1529": "Examines crisis leadership and how leaders, their teams, and organizations rise to the challenges of unexpected, high-stakes situations. Focuses on how intense turbulence serves as a transformative force, enabling ordinary people to accomplish extraordinary feats.",
  "1676": "Almost all human endeavors start with a Founder — a person willing to challenge the status quo, question prevailing wisdom on what is possible, and change our world. Examines the mindset and decisions behind great founders.",
  "1540": "Covers how law and regulation affect business decisions, with a focus on securities litigation, corporate governance, and the legal frameworks that shape every business leader's decisions.",
  "1509": "Examines how incumbent firms and startups navigate an environment shaped by constant competition, technological change, and regulatory shifts across banking, nonbank intermediaries, insurance, and fintech sectors. Explores financial services firms' critically important role in the global economy.",
  "2218": "Matches wits with some of the world's greatest diplomats as they work through their toughest deals. Studies high-level negotiators handling complex international challenges, with video interviews and cases drawn from the instructor's work with former U.S. Secretaries of State.",
  "1623": "Explores building for government in private startups and inside governments themselves, examining whether entrepreneurial methods can address major public challenges at scale. Combines case-based discussions with guest appearances from govtech founders and public officials.",
  "2265": "Examines complex corporate deals, with many class sessions structured around actual transactions selected for the complex issues of law and business they raise. Aims to develop students' transactional instincts and skills to address deal challenges through contract and deal design.",
  "1625": "Prepares students to navigate the full arc of startup financing — from first check to exit. Equips learners with frameworks for making financing decisions, whether they plan to found a company, join an early-stage venture, serve on a board, or invest in startups.",
  "1185": "Explores how to build sustainable innovation capabilities within large firms by addressing timing decisions, internal execution strategies, and external partnership approaches. Creating new ideas, products, or business lines is especially challenging when they break with traditional ways of working or risk cannibalizing existing revenue.",
  "1340": "Every business decision takes place within an ownership structure that shapes how capital gets allocated, how risk is distributed, and whose interests count. Explores how ownership arrangements are intentional design choices, examining enterprise ownership structures, property rights, and technology's interaction with ownership models.",
  "1287": "Builds on the RC Strategy course to expand in both depth and breadth, with a particular focus on competitive advantage and dynamics. Equips future executives and investors with sophisticated strategy skills, covering competitive advantage sources, value capture mechanisms, and dynamic competitive processes.",
  "1120": "Explores the theory, history, and state structures of capitalism; examines its manifestations in several national contexts; and seeks to understand the ways in which systemic changes to market capitalism are likely to both demand and cause systemic political change.",
  "1412": "Family Offices are the fastest-growing organizational form in financial markets. This field immersion course embeds students directly in Family Offices to engage in real decision-making and projects addressing core pillars like succession, governance, investments, organizational structure, and impact.",
  "6454": "Students partner with an investment firm to work directly and deeply on an investment theme or question. Combines hands-on project work with weekly seminars featuring industry leaders, covering diligence, sourcing opportunities, implementation, and risk management.",
  "2292": "What might we learn by examining and debating the lessons of over 2,500 years of history in which human beings have sought to avert, instigate, wage, win, and end wars? Extracts leadership and strategic insights from historical conflict.",
  "1130": "Equips students with an understanding of why the world looks as it does today by examining major business leaders and their decisions across different historical eras. Students explore how entrepreneurs navigated complex global contexts — competitive landscapes, geopolitics, and ethical challenges.",
  "1452": "Focuses on how to manage smaller businesses with an emphasis on the financial aspects of buying and growing these businesses.",
  "1180": "A course about exploiting the opportunities created by the emergence of a global economy and managing the risks that globalization entails. Emphasizes that managers must understand macroeconomic and political phenomena to make informed decisions, as these factors can significantly impact business performance.",
  "1581": "Social entrepreneurs don't just build organizations — they change systems. Explores frameworks and best practices that successful social entrepreneurs use to maximize impact, examining how they differ from traditional entrepreneurs through systems thinking, empathy in design, and ability to navigate diverse capital sources.",
  "1684": "Real estate represents the world's largest investment asset class at over $400 trillion. Success requires multidisciplinary knowledge spanning capital markets, regulation, negotiation, law, technology, and leadership, with emphasis on the interconnected nature of real estate investment and development.",
  "1286": "Examines the unique aspects of creating effective strategies for technology-intensive businesses. Key topics include network effects, multisided platforms, intellectual property value creation, and governance challenges in tech firms, spanning industries from AI and autonomous vehicles to blockchain and streaming media.",
  "2108": "Builds on TOM to emphasize managing product availability in a context of rapid product proliferation, short product life cycles, and global networks of suppliers and customers. Examines inventory management, distribution economics, and demand forecasting while adopting a cross-organizational perspective.",
  "1428": "Designed as a survey course that examines the firm-wide managerial issues that VC and PE investors encounter. Focuses on broad strategic topics rather than deal-execution skills, covering investor structures, private equity approaches, and venture capital strategies.",
  "1440": "An advanced corporate finance course focused on private equity investing, offering a deep dive into growth equity and buyouts while touching on closely related strategies such as secondaries, distress, and private debt. Examines diverse investment scenarios across different market sizes, geographies, and company stages.",
  "1995": "A build-heavy operator workshop where students deploy real marketing assets and campaigns using LLMs to run complete go-to-market test cycles across multiple channels. Students learn by doing in an ambiguous, frontier environment with weekly deliverables that build into a functional toolkit.",
  "2165": "Virtually every organization considers growth a critical objective, but enterprise growth is quite poorly understood. Examines when and how companies can achieve profitable growth, as most enterprises struggle to grow sustainably over time.",
  "1143": "Examines challenges and opportunities firms encounter during the green transition, emphasizing green energy, corporate decarbonization, and climate entrepreneurship. Integrates physical sciences, economics, politics, and technologies underlying climate change to shape understanding of the business environment.",
  "1655": "Demystifies sales and helps students understand how to sell products and services within entrepreneurial settings.",
  "2185": "Health care remains too costly, too inaccessible, and too fragmented, despite being the nation's largest industry with world-class resources. Teaches an analytical framework to help students distinguish viable healthcare innovations from superficial ones, addressing challenges like incumbent resistance, complex reimbursement systems, and strict regulations.",
  "2061": "Designed to teach practical skills for future general managers who must lead and develop people while also managing their own careers. Emphasizes three core competencies: people development, people management, and career management.",
  "2043": "Addresses a critical gap by providing students with comprehensive training in consulting and advisory skills before they enter post-MBA careers. Designed for those planning to take on an advisory role — whether in consultancy or in a partner-based organization.",
  "1816": "Examines how managers can effectively motivate individuals and teams by designing incentive systems and organizational processes. Applies behavioral science research and real-world cases to help students drive performance and improve workplace effectiveness.",
  "1563": "Engages in a conversation seldom held at Harvard Business School, welcoming all students regardless of their faith perspective. Explores fundamental questions about spirituality's role in leadership, how to integrate personal values with professional ambitions, and how faith traditions inform decision-making.",
  "1315": "We are in the golden age of fraud. Learning how to detect and prevent fraud and make better investment decisions has broad applicability for people joining or running companies, as well as private and public market investors.",
  "7515": "Exceptionally effective leaders must have the ability to communicate clearly, persuasively, and thoughtfully to diverse audiences. Develops skillful communication that extends beyond formal speeches to include workplace interactions and conflict resolution.",
  "1231": "Examines how CEOs create value across businesses, geographies, and stages of the value chain in a world shaped by technological disruption and uncertainty. Addresses corporate scope, advantage, and organizational effectiveness, moving beyond competitive positioning to focus on corporate revitalization and long-term value creation.",
  "1495": "Brings students to the frontier of practice in sustainable impact investing. Covers how investors should incorporate environmental, social, and governance considerations alongside traditional financial criteria when evaluating opportunities in both public and private markets.",
  "6333": "Designed to enable students to develop and grow their businesses, blending field methods, classroom exercises, and peer feedback while dedicating substantial time to direct business advancement. Occupies a unique space between an independent project and a traditional course.",
  "6673": "Provides hands-on guidance through the early stages of building a business by helping students test assumptions, develop roadmaps, and manage startup complexities. Designed for students who have already launched or are about to launch a startup, those curious about early-stage startups, and those interested in investing.",
  "1562": "Examines moral and ethical challenges leaders face throughout their careers through literature, philosophy, and historical accounts from around the world. Aims to develop student skills in ethical decision-making and personal confidence in moral leadership through discussion of literary texts and real-world scenarios.",
  "6756": "A practical, hands-on field course designed for students serious about entrepreneurship in life sciences and healthcare, featuring workshops covering critical tasks like validating business ideas, protecting intellectual property, developing budgets, building teams, and fundraising.",
  "5230": "Brings together students in the HBS/HKS joint degree program. Faculty pairs from both institutions teach modules on policy topics, analytical methods, and cross-sector issues, developing students' ability to analyze complex problems from multiple viewpoints.",
  "5240": "Students learn to design effective business models and organizations for tech startups, using system dynamics modeling and organization design methods to evaluate tradeoffs in their ventures.",
};

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
  { id:"1684", code:"1684", title:"Real Property", instructor:"Charvel; Dubrowski; Wu",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"2108", code:"2108", title:"Supply Chain Management", instructor:"Ferreira",
    credits:3, term:"Q1Q2", category:"Operations",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1581-02", code:"1581", section:"02", title:"Social Enterprise & Systems Change", instructor:"Chertavian",
    credits:3, term:"Q1Q2", category:"Social Enterprise",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1286-01", code:"1286", section:"01", title:"Strategy & Technology", instructor:"Yoffie",
    credits:3, term:"Q1Q2", category:"Strategy",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"1428-01", code:"1428", section:"01", title:"Venture Capital & Private Equity", instructor:"Tango",
    credits:3, term:"Q1Q2", category:"Finance",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },
  { id:"2165", code:"2165", title:"Driving Profitable Growth", instructor:"Alcacer; Sadun",
    credits:1.5, term:"Q2", category:"Strategy",
    meetings:[{ type:"Y", start:"10:10", end:"11:30" }] },

  // ===== Y 11:50-1:10 =====
  { id:"2240-05", code:"2240", section:"05", title:"Negotiation", instructor:"Goldenberg",
    credits:3, term:"Q1Q2", category:"Negotiation",
    meetings:[{ type:"Y", start:"11:50", end:"13:10" }] },
  { id:"1995", code:"1995", title:"AI-Powered Digital Marketing", instructor:"Cook",
    credits:1.5, term:"Q1", category:"Marketing",
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
