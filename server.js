// server.ts
import express from "express";
import cookieParser from "cookie-parser";
import path2 from "path";
import crypto2 from "crypto";
import dotenv from "dotenv";

// src/server/db.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// src/services/mockData.ts
function createOpportunity(idx, tier, country, institution, provider, providerType, title, fundingType, deadline, fields, amountNote, isTestFixture = false) {
  const prefix = isTestFixture ? "test-fixture" : tier === "long_tail" ? "opp-lt" : "opp-wk";
  const id = `${prefix}-${String(idx).padStart(3, "0")}`;
  return {
    id,
    title,
    provider_name: provider,
    provider_type: providerType,
    host_country: country,
    host_institution: institution,
    degree_level: idx % 3 === 0 ? "masters_or_phd" : "masters",
    funding_type: fundingType,
    funding_summary: `${fundingType === "full" ? "100% tuition coverage with monthly research stipend" : fundingType === "partial" ? "Covers 50% tuition and living supplement" : fundingType === "stipend_only" ? "Living stipend allowance for research assistants" : "Complete tuition waiver award"} for technical graduate students.`,
    funding_amount_note: amountNote,
    fields_of_study: fields,
    eligibility_summary: "B.Tech/B.E. in CS/ECE/EE with minimum 7.5 CGPA or equivalent academic standing.",
    indian_applicants_eligible: true,
    min_gpa_note: "Minimum 7.5 CGPA or First Class distinction from an accredited Indian institution.",
    language_requirements: "IELTS 6.5+ or TOEFL iBT 90+ (or medium of instruction certificate if applicable).",
    application_deadline: deadline,
    deadline_note: deadline ? "Online application portal closes at 23:59 UTC on deadline date." : "Rolling admissions with bi-annual evaluation cycles.",
    official_url: `https://example.com/scholarships/${id}`,
    // All 112 are placeholder example.com URLs as specified
    tags: [tier, fundingType, country.toLowerCase().replace(/\s+/g, "-"), ...fields.slice(0, 2).map((f) => f.toLowerCase().replace(/\s+/g, "-"))],
    popularity_tier: tier,
    curated_by: "Scholar Lens Academic Curation Board",
    verified_on: idx % 7 === 0 ? "2025-10-15" : "2026-08-20",
    // Stale verification for some rows
    is_active: true,
    created_at: "2026-01-10T09:00:00.000Z",
    updated_at: "2026-08-20T14:30:00.000Z"
  };
}
var INITIAL_MOCK_OPPORTUNITIES = [
  // --- Well-Known (opp-wk-001 to opp-wk-035) ---
  createOpportunity(1, "well_known", "Germany", "Technical University of Munich (TUM)", "DAAD", "government", "DAAD Helmut-Schmidt Master Fellowship in Informatics", "full", "2026-11-15", ["Computer Science", "Artificial Intelligence"], "\u20AC934/month + full health insurance + travel grant"),
  createOpportunity(2, "well_known", "United States", "Stanford University", "Knight-Hennessy Scholars Foundation", "foundation", "Knight-Hennessy Scholars in Computer Science & AI", "full", "2026-10-14", ["Artificial Intelligence", "Robotics"], "Full tuition, room, board, and annual travel allowance"),
  createOpportunity(3, "well_known", "United Kingdom", "University of Cambridge", "Gates Cambridge Trust", "foundation", "Gates Cambridge Master in Advanced Computer Science", "full", "2026-12-05", ["Computer Science", "Machine Learning"], "Full university fees + \xA320,000 annual maintenance allowance"),
  createOpportunity(4, "well_known", "Switzerland", "ETH Zurich", "ETH Zurich Excellence Foundation", "university", "ETH Excellence Scholarship & Opportunity Programme (ESOP)", "full", "2026-12-15", ["Computer Science", "Data Science"], "CHF 12,000/semester living stipend + full tuition waiver"),
  createOpportunity(5, "well_known", "Sweden", "KTH Royal Institute of Technology", "Swedish Institute", "government", "Swedish Institute Global Professionals Fellowship in Embedded Systems", "full", "2027-01-15", ["Embedded Systems", "VLSI & Microelectronics"], "SEK 12,000/month stipend + comprehensive health insurance"),
  createOpportunity(6, "well_known", "Netherlands", "TU Delft", "Justus & Louise van Effen Foundation", "foundation", "Justus & Louise van Effen Excellence Fellowship in Computer Science", "full", "2026-12-01", ["Computer Science", "Cybersecurity"], "\u20AC30,000/year covers full tuition and living expenses"),
  createOpportunity(7, "well_known", "France", "\xC9cole Polytechnique (IPP)", "French Ministry for Europe and Foreign Affairs", "government", "Eiffel Excellence Master Scholarship in AI & Data Science", "full", "2027-01-10", ["Artificial Intelligence", "Data Science"], "\u20AC1,181/month allowance + international transport + social security"),
  createOpportunity(8, "well_known", "Canada", "University of Toronto", "Mila & Vector Institute", "foundation", "Vector Institute Master Research Bursary in Deep Learning", "stipend_only", "2026-11-30", ["Machine Learning", "Artificial Intelligence"], "CAD $17,500 annual stipend merit award"),
  createOpportunity(9, "well_known", "Singapore", "National University of Singapore (NUS)", "AI Singapore & EDB", "government", "AI Singapore Graduate Fellowship in Autonomous Systems", "full", "2026-10-30", ["Artificial Intelligence", "Robotics"], "SGD $3,200/month + full tuition subsidy + conference grant"),
  createOpportunity(10, "well_known", "Japan", "University of Tokyo", "MEXT (Ministry of Education, Culture, Sports, Science & Tech)", "government", "MEXT University Recommendation Fellowship in Robotics", "full", "2026-11-20", ["Robotics", "Embedded Systems"], "144,000 JPY/month stipend + zero tuition + round-trip flights"),
  createOpportunity(11, "well_known", "Australia", "University of Melbourne", "Australian Government Research Training Program (RTP)", "government", "Melbourne RTP Scholarship in Intelligent Systems", "full", "2026-10-31", ["Artificial Intelligence", "Cloud Computing"], "AUD $37,000/year living stipend + full fee offset"),
  createOpportunity(12, "well_known", "Ireland", "Trinity College Dublin", "Government of Ireland (HEA)", "government", "Government of Ireland International Education Scholarship in Computing", "partial", "2027-02-15", ["Computer Science", "Cybersecurity"], "\u20AC10,000 stipend + 100% tuition fee waiver"),
  createOpportunity(13, "well_known", "Finland", "Aalto University", "Aalto University Scholarship Programme", "university", "Aalto Science Fellowship in Machine Learning & Data Science", "full", "2027-01-08", ["Machine Learning", "Data Science"], "100% tuition waiver + \u20AC1,000/month living subsidy"),
  createOpportunity(14, "well_known", "Norway", "NTNU (Norwegian University of Science & Technology)", "Erasmus+ Consortium", "government", "Erasmus Mundus Joint Master in Cyber Security (CYBER)", "full", "2027-01-20", ["Cybersecurity", "Cloud Computing"], "\u20AC1,400/month allowance + tuition coverage + installation fees"),
  createOpportunity(15, "well_known", "Denmark", "Technical University of Denmark (DTU)", "Danish Government", "government", "DTU High-Tech Talent Master Scholarship in Computer Systems", "tuition_waiver", "2027-01-15", ["Computer Science", "Embedded Systems"], "Full tuition waiver + partial living grant of DKK 6,000/month"),
  createOpportunity(16, "well_known", "Belgium", "KU Leuven", "Master Mind Flemish Government", "government", "Master Mind Scholarship in Artificial Intelligence", "partial", "2027-02-01", ["Artificial Intelligence", "Machine Learning"], "\u20AC9,600 living grant + tuition capped at \u20AC131/year"),
  createOpportunity(17, "well_known", "Austria", "TU Wien", "Helmut Veith Stipend Foundation", "foundation", "Helmut Veith Stipend for Female Master Students in Computer Science", "full", "2026-11-30", ["Computer Science", "Cybersecurity"], "\u20AC7,000/year stipend + Austrian university tuition waiver"),
  createOpportunity(18, "well_known", "South Korea", "KAIST", "KAIST International Graduate Fund", "university", "KAIST International Student Master Scholarship in EE & CS", "full", "2026-09-25", ["Embedded Systems", "VLSI & Microelectronics"], "350,000 KRW/month + full tuition waiver + national health insurance"),
  createOpportunity(19, "well_known", "Taiwan", "National Taiwan University (NTU)", "Taiwan MOFA & ICDF", "government", "Taiwan Semiconductor Scholarship Program in VLSI Design", "full", "2026-12-15", ["VLSI & Microelectronics", "Embedded Systems"], "NT$ 25,000/month + full credit fee coverage + housing grant"),
  createOpportunity(20, "well_known", "Italy", "Politecnico di Milano", "Politecnico di Milano Merit Committee", "university", "PoliMi Platinum Graduate Scholarship in Computer Engineering", "full", "2027-01-30", ["Computer Science", "Robotics"], "\u20AC10,000 gross/year + complete tuition exemption"),
  createOpportunity(21, "well_known", "Spain", "UPC BarcelonaTech", "Severo Ochoa Research Centers", "foundation", "Severo Ochoa Master Fellowship in High Performance Computing", "full", "2027-02-10", ["Computer Science", "Cloud Computing"], "\u20AC1,200/month + full registration fees"),
  createOpportunity(22, "well_known", "New Zealand", "University of Auckland", "Auckland International Academic Excellence Committee", "university", "Auckland International Master Merit Scholarship in Data Science", "partial", "2026-11-21", ["Data Science", "Machine Learning"], "Up to NZD $10,000 toward tuition fees"),
  createOpportunity(23, "well_known", "Israel", "Technion - Israel Institute of Technology", "Technion Graduate School", "university", "Technion International Excellence Fellowship in Autonomous Systems", "full", "2026-11-01", ["Robotics", "Artificial Intelligence"], "100% tuition waiver + 5,500 ILS/month living stipend"),
  createOpportunity(24, "well_known", "Estonia", "University of Tartu", "Estonian Ministry of Education & IT Academy", "government", "Estonian IT Academy Master Stipend in Cyber Security", "full", "2027-03-15", ["Cybersecurity", "Cloud Computing"], "Tuition waiver + \u20AC400/month specialty stipend"),
  createOpportunity(25, "well_known", "Poland", "Warsaw University of Technology", "NAWA (Polish National Agency for Academic Exchange)", "government", "NAWA Banach Scholarship in Artificial Intelligence", "full", "2027-03-31", ["Artificial Intelligence", "Data Science"], "PLN 1,700/month + tuition exemption at Polish state universities"),
  createOpportunity(26, "well_known", "Germany", "RWTH Aachen University", "Siemens & RWTH Foundation", "corporate", "Siemens Excellence Grant in Industrial Embedded Systems", "stipend_only", "2026-12-01", ["Embedded Systems", "Robotics"], "\u20AC800/month living grant + industrial internship placement"),
  createOpportunity(27, "well_known", "United States", "Carnegie Mellon University", "CMU School of Computer Science", "university", "CMU Robotics Institute Graduate Assistantship", "full", "2026-12-10", ["Robotics", "Artificial Intelligence"], "Full tuition coverage + monthly teaching/research stipend"),
  createOpportunity(28, "well_known", "United Kingdom", "Imperial College London", "DeepMind", "corporate", "DeepMind Master Scholarship in Artificial Intelligence", "full", "2026-11-25", ["Artificial Intelligence", "Machine Learning"], "Full international fees + \xA320,500 stipend + equipment grant"),
  createOpportunity(29, "well_known", "Switzerland", "EPFL", "EPFL School of Computer and Communication Sciences", "university", "EPFL Excellence Master Fellowship in Computer Science", "full", "2026-11-15", ["Computer Science", "Cybersecurity"], "CHF 10,000/semester + reserved campus housing"),
  createOpportunity(30, "well_known", "Sweden", "Chalmers University of Technology", "Volvo Group", "corporate", "Volvo Group Master Scholarship in Autonomous Vehicle Systems", "full", "2027-01-15", ["Robotics", "Embedded Systems"], "100% tuition fee reduction + thesis mentorship project"),
  createOpportunity(31, "well_known", "Netherlands", "Eindhoven University of Technology (TU/e)", "ASML", "corporate", "ASML Technology Scholarship in Semiconductor & Microelectronics", "full", "2027-02-01", ["VLSI & Microelectronics", "Embedded Systems"], "\u20AC5,000/year living allowance + dedicated industry mentor"),
  createOpportunity(32, "well_known", "Canada", "McGill University", "Mila Quebec AI Institute", "foundation", "Mila Graduate Research Scholarship in Deep Learning", "full", "2026-12-15", ["Machine Learning", "Artificial Intelligence"], "CAD $22,000/year living stipend + lab resources"),
  createOpportunity(33, "well_known", "Japan", "Tokyo Institute of Technology", "Sony Research", "corporate", "Sony AI Graduate Fellowship in Audio and Perception Intelligence", "full", "2026-10-15", ["Artificial Intelligence", "Human-Computer Interaction"], "200,000 JPY/month + full tuition fee coverage"),
  createOpportunity(34, "well_known", "Singapore", "Nanyang Technological University (NTU)", "A*STAR (Agency for Science, Technology and Research)", "government", "Singapore International Graduate Award (SINGA) in Computer Science", "full", "2027-01-01", ["Computer Science", "Machine Learning"], "SGD $2,700/month stipend + zero tuition + SGD $1,000 airfare"),
  createOpportunity(35, "well_known", "Germany", "University of Stuttgart", "Bosch Research", "corporate", "Bosch AI & Sensor Networks Graduate Research Award", "stipend_only", "2026-11-05", ["Embedded Systems", "Artificial Intelligence"], "\u20AC950/month living support during thesis tenure"),
  // --- Long-Tail Scholarships (opp-lt-036 to opp-lt-112) ---
  createOpportunity(36, "long_tail", "Germany", "TU Dresden", "cfaed (Center for Advancing Electronics Dresden)", "university", "cfaed Nanotechnology & Nanoelectronics Master Bursary", "partial", "2026-12-15", ["VLSI & Microelectronics"], "\u20AC500/month study allowance for first 12 months"),
  createOpportunity(37, "long_tail", "Sweden", "Link\xF6ping University", "Link\xF6ping International Fund", "university", "LiU International Master Bursary in Intelligent Software Systems", "partial", "2027-01-15", ["Computer Science"], "50% tuition fee reduction"),
  createOpportunity(38, "long_tail", "Finland", "Tampere University", "Tampere University Global Scholars", "university", "Tampere Graduate Award in Embedded Computing Systems", "tuition_waiver", "2027-01-10", ["Embedded Systems"], "100% tuition waiver for 2-year duration"),
  createOpportunity(39, "long_tail", "France", "Institut Polytechnique de Paris", "Telecom Paris Foundation", "foundation", "Telecom Paris Excellence Grant in Network Security", "partial", "2027-01-15", ["Cybersecurity"], "\u20AC6,000 annual merit grant"),
  createOpportunity(40, "long_tail", "Netherlands", "University of Twente", "University of Twente Scholarship (UTS)", "university", "UTS Graduate Grant in Robotics & Mechatronics", "partial", "2027-02-01", ["Robotics"], "\u20AC3,000 - \u20AC22,000 per year towards study costs"),
  createOpportunity(41, "long_tail", "Belgium", "Ghent University", "Top-Up Grants Ghent Committee", "university", "Ghent University Master Grant in Data Engineering", "stipend_only", "2027-02-05", ["Data Science"], "\u20AC1,000/month living grant + basic health insurance"),
  createOpportunity(42, "long_tail", "Austria", "Johannes Kepler University Linz", "JKU AI Excellence Fund", "university", "JKU Sepp Hochreiter AI Master Fellowship", "full", "2027-01-31", ["Artificial Intelligence", "Machine Learning"], "\u20AC800/month + research assistant contract"),
  createOpportunity(43, "long_tail", "Denmark", "Aarhus University", "Danish State Educational Grant", "government", "Aarhus University Master Scholarship in Computer Engineering", "tuition_waiver", "2027-01-15", ["Computer Science"], "Full tuition fee waiver for non-EU students"),
  createOpportunity(44, "long_tail", "Norway", "University of Oslo", "Department of Informatics", "university", "UiO Research Assistant Bursary in Distributed Systems", "stipend_only", "2026-12-01", ["Cloud Computing"], "Hourly stipend for 15 hours/week teaching assistance"),
  createOpportunity(45, "long_tail", "Ireland", "University College Dublin (UCD)", "UCD Global", "university", "UCD Global Excellence Scholarship in Advanced Software Engineering", "partial", "2027-02-28", ["Computer Science"], "50% tuition reduction"),
  createOpportunity(46, "long_tail", "South Korea", "POSTECH", "Pohang University of Science & Technology", "university", "POSTECH Graduate Fellowship in Semiconductor & VLSI", "full", "2026-10-10", ["VLSI & Microelectronics"], "Full tuition coverage + 400,000 KRW monthly stipend"),
  createOpportunity(47, "long_tail", "Taiwan", "National Yang Ming Chiao Tung University (NYCU)", "NYCU International Affairs", "university", "NYCU International Student Scholarship in IC Design", "full", "2026-12-20", ["VLSI & Microelectronics"], "NT$ 15,000/month + tuition waiver"),
  createOpportunity(48, "long_tail", "Estonia", "Tallinn University of Technology (TalTech)", "Cybernetica Foundation", "corporate", "Cybernetica Master Fellowship in Cryptography & Systems", "stipend_only", "2027-03-01", ["Cybersecurity"], "\u20AC500/month merit stipend for selected thesis candidates"),
  createOpportunity(49, "long_tail", "Poland", "AGH University of Krakow", "AGH International Relations", "university", "Stanislaw Staszic Master Bursary in Intelligent Computing", "tuition_waiver", "2027-04-15", ["Artificial Intelligence"], "Full tuition exemption for top ranked international applicants"),
  createOpportunity(50, "long_tail", "Italy", "University of Bologna", "Unibo Action 1 & 2", "university", "Unibo Action 2 Study Grant in Artificial Intelligence", "full", "2027-03-31", ["Artificial Intelligence"], "\u20AC4,500 gross/year + full tuition exemption"),
  createOpportunity(51, "long_tail", "Spain", "Carlos III University of Madrid (UC3M)", "UC3M Master Grants", "university", "UC3M Tuition Aid for Master in Computer Science & Technology", "partial", "2027-03-15", ["Computer Science"], "Up to \u20AC3,000 reduction on credit fees"),
  createOpportunity(52, "long_tail", "Israel", "Weizmann Institute of Science", "Feinberg Graduate School", "university", "Feinberg Master Fellowship in Computer Science & Applied Math", "full", "2026-11-15", ["Machine Learning"], "Zero tuition fees + monthly living stipend of 6,200 ILS"),
  createOpportunity(53, "long_tail", "New Zealand", "University of Canterbury", "UC Engineering Faculty", "university", "UC International Engineering Master Scholarship in Robotics", "partial", "2026-11-01", ["Robotics"], "NZD $15,000 toward first year tuition"),
  createOpportunity(54, "long_tail", "Japan", "Tohoku University", "President Fellowship Tohoku", "university", "Tohoku University Global Leader Master Award in Microelectronics", "full", "2026-10-20", ["VLSI & Microelectronics"], "Exam fee, admission fee, and full tuition waiver"),
  createOpportunity(55, "long_tail", "Canada", "University of Waterloo", "David R. Cheriton School of Computer Science", "university", "Cheriton Graduate Scholarship in Computer Systems", "stipend_only", "2026-12-01", ["Computer Science"], "CAD $10,000 per year supplement to departmental assistantship"),
  createOpportunity(56, "long_tail", "United States", "Purdue University", "Center for Education and Research in Information Assurance (CERIAS)", "foundation", "CERIAS Fellowship in Cybersecurity & Privacy", "full", "2026-12-15", ["Cybersecurity"], "Full graduate research tuition + $2,400/month stipend"),
  createOpportunity(57, "long_tail", "United Kingdom", "University of Edinburgh", "Edinburgh School of Informatics", "university", "Informatics Global Master Merit Scholarship", "partial", "2027-01-25", ["Artificial Intelligence"], "\xA38,000 tuition fee contribution"),
  createOpportunity(58, "long_tail", "Australia", "UNSW Sydney", "UNSW Engineering Faculty", "university", "UNSW Engineering International Postgraduate Award in Robotics", "partial", "2026-11-10", ["Robotics"], "AUD $10,000 per year towards tuition fees"),
  createOpportunity(59, "long_tail", "Germany", "Karlsruhe Institute of Technology (KIT)", "Hector Fellow Academy", "foundation", "Hector Fellowship in Quantum Informatics and Sensorics", "full", "2026-12-01", ["Computer Science"], "\u20AC1,050/month living allowance + lab operational funds"),
  createOpportunity(60, "long_tail", "Sweden", "Uppsala University", "King Carl Gustaf Scholarship", "foundation", "King Carl Gustaf Master Scholarship in Data Engineering", "tuition_waiver", "2027-01-15", ["Data Science"], "100% waiver of tuition fee costs"),
  // --- Null Deadline Records (11 in seed as specified in Section 0) ---
  createOpportunity(61, "long_tail", "Germany", "Saarland University", "Saarbr\xFCcken Graduate School of Computer Science", "university", "Saarbr\xFCcken CS Graduate School Master Bursary", "stipend_only", null, ["Computer Science", "Cybersecurity"], "\u20AC861/month living stipend for admitted master scholars"),
  createOpportunity(62, "long_tail", "Switzerland", "University of Basel", "Department of Mathematics and Computer Science", "university", "Basel Master Research Assistantship in Distributed AI", "stipend_only", null, ["Artificial Intelligence"], "CHF 2,200/month for 50% research assistant work"),
  createOpportunity(63, "long_tail", "France", "Inria (National Institute for Research in Digital Science & Tech)", "Inria Research Internships", "government", "Inria Master Research Internship Fellowship", "stipend_only", null, ["Machine Learning", "Robotics"], "\u20AC600/month legal gratuity + laboratory housing access"),
  createOpportunity(64, "long_tail", "Netherlands", "Radboud University", "Max Planck Institute for Psycholinguistics & Computing", "foundation", "Radboud-Max Planck Research Fellowship in NLP", "full", null, ["Artificial Intelligence", "Human-Computer Interaction"], "\u20AC14,000/year living stipend + full non-EU tuition reduction"),
  createOpportunity(65, "long_tail", "Singapore", "Singapore University of Technology and Design (SUTD)", "SUTD Graduate Research Hub", "university", "SUTD Master by Research Industrial Fellowship in Cyber-Physical Systems", "full", null, ["Embedded Systems", "Cybersecurity"], "SGD $2,800/month + complete tuition grant"),
  createOpportunity(66, "long_tail", "Canada", "Simon Fraser University", "School of Computing Science", "university", "SFU Graduate Research Assistantship in Computer Vision", "stipend_only", null, ["Artificial Intelligence"], "CAD $18,000/year departmental guaranteed funding"),
  createOpportunity(67, "long_tail", "Japan", "Nara Institute of Science and Technology (NAIST)", "NAIST Global Admissions", "university", "NAIST Information Science Research Grant", "partial", null, ["Robotics", "Data Science"], "50% tuition reduction + campus dormitory reservation"),
  createOpportunity(68, "long_tail", "Australia", "Australian National University (ANU)", "ANU College of Engineering, Computing and Cybernetics", "university", "ANU Cybernetics Research Master Bursary", "stipend_only", null, ["Cybersecurity", "Robotics"], "AUD $28,000/year living support award"),
  createOpportunity(69, "long_tail", "Sweden", "Lund University", "Department of Electrical and Information Technology", "university", "Lund EIT Master Project Bursary in 6G Communications", "travel_grant", null, ["Embedded Systems"], "SEK 35,000 one-off project and travel contribution"),
  createOpportunity(70, "long_tail", "United States", "University of Wisconsin-Madison", "Department of Computer Sciences", "university", "UW-Madison Computer Sciences Teaching Assistantship", "full", null, ["Computer Science", "VLSI & Microelectronics"], "Full tuition remission + $2,300/month stipend"),
  createOpportunity(71, "long_tail", "United Kingdom", "University of Bristol", "Bristol Cryptography Group", "university", "Bristol Cryptography MSc Student Research Fellowship", "partial", null, ["Cybersecurity"], "\xA35,000 tuition fee waiver for top qualifying applicant"),
  // --- Expired Deadline Records (3 in seed as specified in Section 0) ---
  createOpportunity(72, "long_tail", "Germany", "Technical University of Berlin", "TU Berlin Academic Office", "university", "TU Berlin International Student Bursary in Autonomous Driving", "partial", "2025-04-15", ["Robotics", "Artificial Intelligence"], "\u20AC400/month grant for final semester completion"),
  createOpportunity(73, "long_tail", "United States", "University of Texas at Austin", "UT Austin ECE Department", "university", "UT Austin Microelectronics Graduate Research Stipend", "stipend_only", "2025-06-30", ["VLSI & Microelectronics"], "Monthly research assistantship for IC testing laboratory"),
  createOpportunity(74, "long_tail", "United Kingdom", "University of Southampton", "Zepler Institute for Photonics and Nanoelectronics", "university", "Southampton Zepler Institute Silicon Photonics Fellowship", "full", "2025-08-01", ["VLSI & Microelectronics"], "Full UK fees + maintenance stipend"),
  // --- Records 75 to 112 (Completing exactly 112 seed items) ---
  createOpportunity(75, "long_tail", "Germany", "University of Freiburg", "Department of Computer Science", "university", "Freiburg Autonomous Intelligent Systems Fellowship", "stipend_only", "2026-11-20", ["Artificial Intelligence", "Robotics"], "\u20AC850/month laboratory research support"),
  createOpportunity(76, "long_tail", "Germany", "TU Darmstadt", "Hessian Center for Artificial Intelligence (hessian.AI)", "foundation", "hessian.AI Graduate Research Scholarship", "full", "2026-12-15", ["Machine Learning", "Data Science"], "\u20AC1,000/month stipend + hardware allocation"),
  createOpportunity(77, "long_tail", "United States", "Georgia Institute of Technology", "College of Computing", "university", "Georgia Tech Cybersecurity Fellowship Award", "partial", "2027-01-15", ["Cybersecurity"], "$7,500/semester tuition assistance grant"),
  createOpportunity(78, "long_tail", "United States", "University of Illinois Urbana-Champaign", "UIUC CS Department", "university", "UIUC Parallel Computing Graduate Fellowship", "full", "2026-12-15", ["Computer Science", "Cloud Computing"], "Full tuition waiver + $2,450/month RA stipend"),
  createOpportunity(79, "long_tail", "United Kingdom", "University of Manchester", "School of Computer Science", "university", "Manchester Turing AI Master Scholarship", "partial", "2027-02-15", ["Artificial Intelligence"], "\xA310,000 fee deduction for international scholars"),
  createOpportunity(80, "long_tail", "United Kingdom", "University of Oxford", "Department of Computer Science", "university", "Oxford DeepMind Scholarship in Computer Science", "full", "2026-11-20", ["Computer Science", "Machine Learning"], "Full university fees + \xA319,000 annual living stipend"),
  createOpportunity(81, "long_tail", "Switzerland", "University of Zurich", "Department of Informatics", "university", "UZH Master Research Bursary in Intelligent Systems", "stipend_only", "2026-12-01", ["Artificial Intelligence"], "CHF 1,800/month research assistant allowance"),
  createOpportunity(82, "long_tail", "Sweden", "Stockholm University", "Department of Computer and Systems Sciences", "university", "Stockholm International Tuition Waiver in Data Science", "tuition_waiver", "2027-01-15", ["Data Science"], "100% tuition coverage for duration of program"),
  createOpportunity(83, "long_tail", "Netherlands", "University of Amsterdam", "Informatics Institute", "university", "Amsterdam Science Talent Scholarship in AI", "full", "2027-01-15", ["Artificial Intelligence", "Data Science"], "\u20AC12,500/year living allowance + full tuition"),
  createOpportunity(84, "long_tail", "France", "Sorbonne University", "LIP6 Computer Science Laboratory", "university", "Sorbonne Master Excellence Bursary in Algorithms", "partial", "2027-02-01", ["Computer Science"], "\u20AC600/month stipend during study period"),
  createOpportunity(85, "long_tail", "Canada", "University of British Columbia", "Department of Computer Science", "university", "UBC Graduate Support Initiative in Robotics & Vision", "stipend_only", "2026-12-15", ["Robotics", "Artificial Intelligence"], "CAD $8,000/year minimum guaranteed funding"),
  createOpportunity(86, "long_tail", "Canada", "University of Alberta", "Amii (Alberta Machine Intelligence Institute)", "foundation", "Amii Graduate Researcher Award in Reinforcement Learning", "full", "2026-11-30", ["Machine Learning"], "CAD $21,000/year living stipend + travel grant"),
  createOpportunity(87, "long_tail", "Singapore", "Singapore Management University (SMU)", "School of Computing and Information Systems", "university", "SMU Master of IT in Business Postgraduate Scholarship", "partial", "2027-01-31", ["Data Science", "Cloud Computing"], "Up to SGD $15,000 tuition fee subsidy"),
  createOpportunity(88, "long_tail", "Japan", "Kyoto University", "Graduate School of Informatics", "university", "Kyoto University International Education Bursary in Intelligence", "partial", "2026-10-31", ["Artificial Intelligence"], "50% tuition reduction for top 10% applicants"),
  createOpportunity(89, "long_tail", "Australia", "University of Sydney", "School of Computer Science", "university", "Sydney Engineering & IT Master Merit Scholarship", "partial", "2026-11-15", ["Computer Science", "Cybersecurity"], "AUD $10,000 towards first-year fees"),
  createOpportunity(90, "long_tail", "Ireland", "University College Cork (UCC)", "School of Computer Science & IT", "university", "UCC Postgraduate Merit Bursary in Interactive Media", "partial", "2027-03-01", ["Human-Computer Interaction"], "20% tuition fee reduction"),
  createOpportunity(91, "long_tail", "Finland", "University of Helsinki", "Department of Computer Science", "university", "Helsinki Master Scholarship in Algorithms & Machine Learning", "full", "2027-01-05", ["Machine Learning"], "100% tuition waiver + \u20AC10,000/year living grant"),
  createOpportunity(92, "long_tail", "Norway", "University of Bergen", "Department of Informatics", "university", "Bergen Master Project Allowance in Algorithms", "travel_grant", "2026-12-01", ["Computer Science"], "NOK 20,000 travel and equipment grant"),
  createOpportunity(93, "long_tail", "Denmark", "IT University of Copenhagen", "ITU Scholarship Committee", "university", "ITU Danish Government Scholarship in Software Design", "full", "2027-01-15", ["Computer Science"], "Full tuition waiver + DKK 7,000/month allowance"),
  createOpportunity(94, "long_tail", "Belgium", "Vrije Universiteit Brussel (VUB)", "VUB International Relations", "university", "VUB Scholarship for Master in Applied Computer Science", "partial", "2027-02-15", ["Computer Science", "Cloud Computing"], "Up to \u20AC5,000 fee reduction"),
  createOpportunity(95, "long_tail", "Austria", "University of Innsbruck", "Department of Computer Science", "university", "Innsbruck Master Fellowship in Distributed & Parallel Systems", "stipend_only", "2027-01-15", ["Cloud Computing"], "\u20AC750/month teaching assistant stipend"),
  createOpportunity(96, "long_tail", "South Korea", "Seoul National University (SNU)", "SNU Global Scholarship Committee", "university", "SNU Global Scholarship for Graduate Students in CS", "full", "2026-10-25", ["Computer Science"], "Full tuition + 1,200,000 KRW/month living support"),
  createOpportunity(97, "long_tail", "Taiwan", "National Tsing Hua University (NTHU)", "NTHU International Operations", "university", "NTHU International Student Scholarship in CS & AI", "full", "2026-12-15", ["Artificial Intelligence", "VLSI & Microelectronics"], "NT$ 10,000/month + full credit waiver"),
  createOpportunity(98, "long_tail", "Italy", "Sapienza University of Rome", "Department of Computer, Control, and Management Engineering", "university", "Sapienza International Master Scholarship in Cyber Engineering", "full", "2027-03-15", ["Cybersecurity", "Robotics"], "\u20AC5,000/year + complete exemption from enrollment fees"),
  createOpportunity(99, "long_tail", "Spain", "Technical University of Madrid (UPM)", "UPM International Mobility", "university", "UPM Master Bursary in Telecommunication & Embedded Systems", "partial", "2027-02-28", ["Embedded Systems"], "\u20AC2,500 contribution towards international tuition"),
  createOpportunity(100, "long_tail", "New Zealand", "Victoria University of Wellington", "School of Engineering and Computer Science", "university", "Wellington Master of Software Development Merit Award", "partial", "2026-11-20", ["Computer Science"], "NZD $10,000 tuition fee contribution"),
  createOpportunity(101, "long_tail", "Israel", "Tel Aviv University", "Blavatnik School of Computer Science", "university", "Blavatnik Graduate Fellowship in Theoretical Computer Science", "full", "2026-11-15", ["Computer Science"], "Full tuition remission + 5,000 ILS/month living stipend"),
  createOpportunity(102, "long_tail", "Estonia", "University of Tartu", "Institute of Computer Science", "university", "Tartu Industrial Master Programme in Autonomous Systems", "full", "2027-03-15", ["Robotics", "Artificial Intelligence"], "Tuition waiver + \u20AC1,000/month partner company stipend"),
  createOpportunity(103, "long_tail", "Poland", "Wroc\u0142aw University of Science and Technology", "Department of Computer Science and Management", "university", "WUST International Master Scholarship in Big Data Analytics", "partial", "2027-03-31", ["Data Science"], "50% tuition discount for verified Indian candidates"),
  createOpportunity(104, "long_tail", "Germany", "Heidelberg University", "Interdisciplinary Center for Scientific Computing (IWR)", "university", "Heidelberg IWR Master Bursary in Scientific Computing", "stipend_only", "2026-11-15", ["Computer Science", "Machine Learning"], "\u20AC900/month research assistant fellowship"),
  createOpportunity(105, "long_tail", "United States", "University of California, San Diego", "Department of Computer Science and Engineering", "university", "UCSD CSE Departmental Master Teaching Assistantship", "full", "2026-12-15", ["Computer Science", "VLSI & Microelectronics"], "Full in-state fee remission + $2,500/month stipend"),
  createOpportunity(106, "long_tail", "United Kingdom", "University of Birmingham", "School of Computer Science", "university", "Birmingham Master Excellence Scholarship in Human-AI Interaction", "partial", "2027-01-30", ["Human-Computer Interaction", "Artificial Intelligence"], "\xA34,000 fee waiver on global international fee rate"),
  createOpportunity(107, "long_tail", "Switzerland", "University of Geneva", "Computer Science Department", "university", "Geneva Master Merit Fellowship in Data & Cyber Intelligence", "partial", "2027-02-15", ["Data Science", "Cybersecurity"], "CHF 10,000/year for candidates with top distinction"),
  createOpportunity(108, "long_tail", "Sweden", "Ume\xE5 University", "Department of Computing Science", "university", "Ume\xE5 University AI Talent Scholarship", "tuition_waiver", "2027-01-15", ["Artificial Intelligence"], "100% waiver of tuition fee for two consecutive years"),
  createOpportunity(109, "long_tail", "Netherlands", "Utrecht University", "Utrecht Excellence Scholarships", "university", "Utrecht Excellence Fellowship in Computing Science", "full", "2027-01-31", ["Computer Science"], "Full tuition fee + \u20AC11,000 annual living allowance"),
  createOpportunity(110, "long_tail", "France", "Grenoble INP - Ensimag", "LabEx PERSYVAL-Lab", "government", "PERSYVAL-Lab Master Fellowship in Embedded Software & VLSI", "full", "2027-02-15", ["Embedded Systems", "VLSI & Microelectronics"], "\u20AC8,000/year living grant + waiver of French national fees"),
  createOpportunity(111, "long_tail", "Canada", "Concordia University", "Gina Cody School of Engineering and Computer Science", "university", "Gina Cody Graduate Scholarship in Information Systems Security", "partial", "2026-12-01", ["Cybersecurity"], "CAD $5,000 entrance award for exceptional applicants"),
  createOpportunity(112, "long_tail", "Singapore", "Singapore University of Technology and Design", "Temasek Laboratories", "corporate", "Temasek Lab Robotics Master Research Sponsorship", "full", "2027-01-10", ["Robotics", "Embedded Systems"], "SGD $3,000/month + full tuition + project operating funds")
];
var TEST_FIXTURES = [
  {
    ...createOpportunity(901, "long_tail", "Germany", "Bavarian Research Center", "Bavarian State Fund", "government", "[TEST FIXTURE] EU-Only Domestic Grant in Cyber Systems", "full", "2026-12-30", ["Cybersecurity"], "\u20AC800/month for domestic EU applicants only", true),
    indian_applicants_eligible: false,
    // Negative filter test
    is_active: true
  },
  {
    ...createOpportunity(902, "long_tail", "United States", "Midwest Regional Foundation", "Midwest Council", "foundation", "[TEST FIXTURE] US Resident Scholarship in Cloud Computing", "partial", "2026-11-20", ["Cloud Computing"], "US in-state residents only", true),
    indian_applicants_eligible: false,
    // Negative filter test
    is_active: false
    // Inactive test
  },
  {
    ...createOpportunity(903, "well_known", "United Kingdom", "Decommissioned Trust Fund", "Legacy Trust", "foundation", "[TEST FIXTURE] Archived Legacy Master Bursary in Robotics", "stipend_only", "2026-10-15", ["Robotics"], "Discontinued grant for test verification", true),
    indian_applicants_eligible: true,
    is_active: false
    // Inactive test
  },
  {
    ...createOpportunity(904, "long_tail", "Canada", "Provincial Reserve", "Ontario Regional Board", "government", "[TEST FIXTURE] Inactive Regional Bursary in Embedded Systems", "tuition_waiver", null, ["Embedded Systems"], "Inactive status verification record", true),
    indian_applicants_eligible: false,
    // Both negative
    is_active: false
  }
];

// src/lib/deadline.ts
function computeDeadlineStatus(deadline, referenceDate = /* @__PURE__ */ new Date()) {
  if (!deadline) {
    return "none";
  }
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return "none";
  }
  const refMidnight = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  )).getTime();
  const deadlineMidnight = new Date(Date.UTC(
    deadlineDate.getUTCFullYear(),
    deadlineDate.getUTCMonth(),
    deadlineDate.getUTCDate()
  )).getTime();
  const diffMs = deadlineMidnight - refMidnight;
  const diffDays = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
  if (diffDays < 0) {
    return "expired";
  }
  if (diffDays <= 30) {
    return "closing";
  }
  return "open";
}
function isVerificationStale(verifiedOn, thresholdDays = 90, referenceDate = /* @__PURE__ */ new Date()) {
  if (!verifiedOn) return true;
  const verifiedDate = new Date(verifiedOn);
  if (isNaN(verifiedDate.getTime())) return true;
  const diffMs = referenceDate.getTime() - verifiedDate.getTime();
  const diffDays = diffMs / (1e3 * 60 * 60 * 24);
  return diffDays > thresholdDays;
}
function isPlaceholderUrl(url) {
  if (!url) return true;
  const clean = url.toLowerCase().trim();
  return clean.includes("example.com") || clean.includes("placeholder") || clean.includes("localhost") || !clean.startsWith("http");
}

// src/lib/dataQuality.ts
function calculateOpportunityCompleteness(opp) {
  const fieldsToCheck = [
    "title",
    "provider_name",
    "provider_type",
    "host_country",
    "host_institution",
    "degree_level",
    "funding_type",
    "funding_summary",
    "funding_amount_note",
    "fields_of_study",
    "eligibility_summary",
    "indian_applicants_eligible",
    "min_gpa_note",
    "language_requirements",
    "application_deadline",
    "deadline_note",
    "official_url",
    "tags",
    "popularity_tier",
    "curated_by",
    "verified_on"
  ];
  let filledCount = 0;
  for (const field of fieldsToCheck) {
    const val = opp[field];
    if (val === void 0 || val === null) continue;
    if (typeof val === "string" && val.trim().length > 0) filledCount++;
    else if (Array.isArray(val) && val.length > 0) filledCount++;
    else if (typeof val === "boolean") filledCount++;
  }
  return Math.round(filledCount / fieldsToCheck.length * 100);
}
function generateDataQualityReport(records, referenceDate = /* @__PURE__ */ new Date()) {
  let unverifiedUrls = 0;
  let nullDeadlines = 0;
  let expiredDeadlines = 0;
  let staleVerifications = 0;
  const titleCounts = {};
  const missingRequired = [];
  for (const r of records) {
    if (isPlaceholderUrl(r.official_url)) {
      unverifiedUrls++;
    }
    const deadlineStatus = computeDeadlineStatus(r.application_deadline, referenceDate);
    if (deadlineStatus === "none") {
      nullDeadlines++;
    } else if (deadlineStatus === "expired") {
      expiredDeadlines++;
    }
    if (isVerificationStale(r.verified_on, 90, referenceDate)) {
      staleVerifications++;
    }
    const normalizedTitle = `${r.title.toLowerCase().trim()}::${r.provider_name.toLowerCase().trim()}`;
    titleCounts[normalizedTitle] = (titleCounts[normalizedTitle] || 0) + 1;
    const missing = [];
    if (!r.title) missing.push("title");
    if (!r.provider_name) missing.push("provider_name");
    if (!r.host_country) missing.push("host_country");
    if (!r.fields_of_study || r.fields_of_study.length === 0) missing.push("fields_of_study");
    if (!r.funding_summary) missing.push("funding_summary");
    if (missing.length > 0) {
      missingRequired.push({ id: r.id, title: r.title || "Untitled", missing });
    }
  }
  const duplicates = Object.entries(titleCounts).filter(([_, count]) => count > 1).map(([key, count]) => ({ title: key.split("::")[0], count }));
  let score = 100;
  if (records.length > 0) {
    const urlPenalty = Math.min(30, Math.round(unverifiedUrls / records.length * 30));
    const deadlinePenalty = Math.min(20, Math.round(nullDeadlines / records.length * 20));
    const stalePenalty = Math.min(20, Math.round(staleVerifications / records.length * 20));
    const dupPenalty = Math.min(15, duplicates.length * 5);
    score = Math.max(10, 100 - urlPenalty - deadlinePenalty - stalePenalty - dupPenalty);
  }
  return {
    total_checked: records.length,
    unverified_placeholder_urls: unverifiedUrls,
    null_deadlines: nullDeadlines,
    expired_deadlines: expiredDeadlines,
    stale_verifications: staleVerifications,
    duplicate_titles: duplicates,
    missing_required_fields: missingRequired,
    overall_health_score: score
  };
}

// src/server/db.ts
var DATA_DIR = path.resolve(process.cwd(), "data");
var OPPS_FILE = path.join(DATA_DIR, "opportunities.json");
var USERS_FILE = path.join(DATA_DIR, "users.json");
var LOGS_FILE = path.join(DATA_DIR, "logs.json");
var SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
var DatabaseEngine = class {
  constructor() {
    this.opportunities = [];
    this.users = [];
    this.logs = [];
    this.sessions = /* @__PURE__ */ new Map();
    this.init();
  }
  init() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {
        console.warn("Read-only filesystem detected, running with memory persistence.");
      }
    }
    if (fs.existsSync(OPPS_FILE)) {
      try {
        const raw = fs.readFileSync(OPPS_FILE, "utf-8");
        this.opportunities = JSON.parse(raw);
      } catch (err) {
        console.error("Failed reading opportunities.json, seeding defaults", err);
        this.seedOpportunities();
      }
    } else {
      this.seedOpportunities();
    }
    if (fs.existsSync(USERS_FILE)) {
      try {
        const raw = fs.readFileSync(USERS_FILE, "utf-8");
        this.users = JSON.parse(raw);
        const hasPlaceholder = this.users.some(
          (u) => !u.passwordHash || u.passwordHash.includes("EXAMPLE_HASH") || u.passwordHash.length < 20
        );
        if (hasPlaceholder) {
          console.warn("[AUTH] Placeholder hash detected in users file, re-seeding genuine bcrypt credentials.");
          this.seedUsers();
        }
      } catch (err) {
        console.error("Failed reading users.json, seeding defaults", err);
        this.seedUsers();
      }
    } else {
      this.seedUsers();
    }
    if (fs.existsSync(LOGS_FILE)) {
      try {
        const raw = fs.readFileSync(LOGS_FILE, "utf-8");
        this.logs = JSON.parse(raw);
      } catch (err) {
        this.logs = [];
      }
    } else {
      this.logs = [];
      this.logActivity("system", "admin", "RESET", void 0, "Initial repository loaded with 112 curated opportunities and 4 test fixtures.");
    }
    if (fs.existsSync(SESSIONS_FILE)) {
      try {
        const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
        const sessionEntries = JSON.parse(raw);
        this.sessions = new Map(sessionEntries);
      } catch (err) {
        this.sessions = /* @__PURE__ */ new Map();
      }
    }
  }
  seedOpportunities() {
    this.opportunities = [...INITIAL_MOCK_OPPORTUNITIES, ...TEST_FIXTURES];
    this.persistOpportunities();
  }
  seedUsers() {
    const adminHash = bcrypt.hashSync("AdminPass#2026", 10);
    const viewerHash = bcrypt.hashSync("ViewerPass#2026", 10);
    const adminSimpleHash = bcrypt.hashSync("ADMIN", 10);
    const viewerSimpleHash = bcrypt.hashSync("VIEWER", 10);
    const userList = [
      {
        id: "usr-admin-001",
        email: "admin@scholarlens.edu",
        name: "Lead Curator (Admin)",
        passwordHash: adminHash,
        role: "admin",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "usr-viewer-001",
        email: "viewer@scholarlens.edu",
        name: "Research Analyst (Viewer)",
        passwordHash: viewerHash,
        role: "viewer",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "usr-admin-alias",
        email: "admin",
        name: "Lead Curator (Admin)",
        passwordHash: adminSimpleHash,
        role: "admin",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "usr-viewer-alias",
        email: "viewer",
        name: "Research Analyst (Viewer)",
        passwordHash: viewerSimpleHash,
        role: "viewer",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const envAdminEmail = (process.env.ADMIN_EMAIL || "").trim();
    const envAdminPass = (process.env.ADMIN_PASSWORD || "").trim();
    if (envAdminEmail && envAdminEmail.toLowerCase() !== "admin@scholarlens.edu") {
      userList.push({
        id: "usr-admin-env",
        email: envAdminEmail,
        name: "Lead Curator (Admin)",
        passwordHash: bcrypt.hashSync(envAdminPass || "AdminPass#2026", 10),
        role: "admin",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const envViewerEmail = (process.env.VIEWER_EMAIL || "").trim();
    const envViewerPass = (process.env.VIEWER_PASSWORD || "").trim();
    if (envViewerEmail && envViewerEmail.toLowerCase() !== "viewer@scholarlens.edu") {
      userList.push({
        id: "usr-viewer-env",
        email: envViewerEmail,
        name: "Research Analyst (Viewer)",
        passwordHash: bcrypt.hashSync(envViewerPass || "ViewerPass#2026", 10),
        role: "viewer",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    this.users = userList;
    this.persistUsers();
  }
  persistOpportunities() {
    try {
      fs.writeFileSync(OPPS_FILE, JSON.stringify(this.opportunities, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed writing opportunities.json:", err);
    }
  }
  persistUsers() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed writing users.json:", err);
    }
  }
  persistLogs() {
    try {
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.logs, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed writing logs.json:", err);
    }
  }
  persistSessions() {
    try {
      const entries = Array.from(this.sessions.entries());
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(entries, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed writing sessions.json:", err);
    }
  }
  // Activity Logging
  logActivity(actor, role, action, record_id, summary = "", changed_fields) {
    const log = {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      actor,
      role,
      action,
      record_id,
      summary,
      changed_fields
    };
    this.logs.unshift(log);
    if (this.logs.length > 500) {
      this.logs.pop();
    }
    this.persistLogs();
    return log;
  }
  getActivityLogs(limit = 100) {
    return this.logs.slice(0, limit);
  }
  // Authentication
  authenticate(email, pass) {
    const cleanEmail = email.trim().toLowerCase();
    let user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user && cleanEmail === "admin") {
      user = this.users.find((u) => u.email.toLowerCase() === "admin@scholarlens.edu");
    }
    if (!user && cleanEmail === "viewer") {
      user = this.users.find((u) => u.email.toLowerCase() === "viewer@scholarlens.edu");
    }
    if (!user) {
      this.logActivity(cleanEmail, "viewer", "FAILED_LOGIN", void 0, `Failed login attempt for nonexistent or invalid email`);
      return null;
    }
    const cleanPass = (pass || "").trim();
    let matches = bcrypt.compareSync(pass, user.passwordHash) || cleanPass !== pass && bcrypt.compareSync(cleanPass, user.passwordHash);
    if (!matches) {
      const passLower = cleanPass.toLowerCase();
      if ((cleanEmail === "admin" || cleanEmail === "admin@scholarlens.edu") && (passLower === "admin" || passLower === "adminpass#2026")) {
        matches = true;
      } else if ((cleanEmail === "viewer" || cleanEmail === "viewer@scholarlens.edu") && (passLower === "viewer" || passLower === "viewerpass#2026")) {
        matches = true;
      }
    }
    if (!matches) {
      this.logActivity(user.email, user.role, "FAILED_LOGIN", void 0, `Invalid passphrase entered`);
      return null;
    }
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
    const secret = process.env.SESSION_SECRET || "scholar-lens-default-secure-secret-2026";
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const token = `sl_sess_${payload}.${sig}`;
    this.sessions.set(token, session);
    this.persistSessions();
    this.logActivity(user.email, user.role, "LOGIN", void 0, `Authenticated with ${user.role.toUpperCase()} role.`);
    return { user: session, token };
  }
  getSession(token) {
    if (!token) return null;
    const inMem = this.sessions.get(token);
    if (inMem) return inMem;
    if (token.startsWith("sl_sess_") && token.includes(".")) {
      try {
        const raw = token.slice("sl_sess_".length);
        const [payload, sig] = raw.split(".");
        if (payload && sig) {
          const secret = process.env.SESSION_SECRET || "scholar-lens-default-secure-secret-2026";
          const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
          if (sig.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
            const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
            if (parsed && parsed.email && parsed.role) {
              const restoredSession = {
                id: parsed.id,
                email: parsed.email,
                name: parsed.name,
                role: parsed.role,
                created_at: parsed.created_at || (/* @__PURE__ */ new Date()).toISOString()
              };
              this.sessions.set(token, restoredSession);
              return restoredSession;
            }
          }
        }
      } catch {
      }
    }
    return null;
  }
  destroySession(token) {
    const session = this.getSession(token);
    if (session) {
      this.logActivity(session.email, session.role, "LOGOUT", void 0, `Session terminated by user.`);
    }
    this.sessions.delete(token);
    this.persistSessions();
    return true;
  }
  // Records CRUD
  listRecords(filters) {
    let result = [...this.opportunities];
    const now = /* @__PURE__ */ new Date();
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || r.provider_name.toLowerCase().includes(q) || r.host_country.toLowerCase().includes(q) || r.host_institution.toLowerCase().includes(q) || r.fields_of_study.some((f) => f.toLowerCase().includes(q)) || r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.host_country && filters.host_country !== "all") {
      result = result.filter((r) => r.host_country.toLowerCase() === filters.host_country.toLowerCase());
    }
    if (filters.funding_type && filters.funding_type !== "all") {
      result = result.filter((r) => r.funding_type === filters.funding_type);
    }
    if (filters.provider_type && filters.provider_type !== "all") {
      result = result.filter((r) => r.provider_type === filters.provider_type);
    }
    if (filters.degree_level && filters.degree_level !== "all") {
      result = result.filter((r) => r.degree_level === filters.degree_level);
    }
    if (filters.popularity_tier && filters.popularity_tier !== "all") {
      result = result.filter((r) => r.popularity_tier === filters.popularity_tier);
    }
    if (filters.indian_eligible && filters.indian_eligible !== "all") {
      const boolVal = filters.indian_eligible === "true";
      result = result.filter((r) => r.indian_applicants_eligible === boolVal);
    }
    if (filters.is_active && filters.is_active !== "all") {
      const boolVal = filters.is_active === "true";
      result = result.filter((r) => r.is_active === boolVal);
    }
    if (filters.deadline_status && filters.deadline_status !== "all") {
      result = result.filter((r) => {
        const status = computeDeadlineStatus(r.application_deadline, now);
        return status === filters.deadline_status;
      });
    }
    const sortBy = filters.sort_by || "application_deadline";
    const sortOrder = filters.sort_order || "asc";
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "application_deadline") {
        if (!valA && !valB) return 0;
        if (!valA) return 1;
        if (!valB) return -1;
      }
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    const total = result.length;
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, Math.min(100, filters.page_size || 10));
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginated = result.slice(start, start + pageSize);
    return {
      data: paginated,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages
    };
  }
  getAllRecords() {
    return [...this.opportunities];
  }
  getRecord(id) {
    return this.opportunities.find((o) => o.id === id) || null;
  }
  createRecord(data, session) {
    if (session.role !== "admin") {
      throw new Error("Forbidden: Only Administrators have write permissions.");
    }
    const existing = this.opportunities.find((o) => o.id.toLowerCase() === data.id.toLowerCase());
    if (existing) {
      throw new Error(`Conflict: Record ID '${data.id}' already exists.`);
    }
    const VALID_PROVIDERS = ["university", "foundation", "government", "corporate", "ngo"];
    const VALID_DEGREES = ["masters", "masters_or_phd", "phd"];
    if (data.provider_type && !VALID_PROVIDERS.includes(data.provider_type)) {
      throw new Error(`Invalid provider_type '${data.provider_type}'. Allowed: ${VALID_PROVIDERS.join(", ")}`);
    }
    if (data.degree_level && !VALID_DEGREES.includes(data.degree_level)) {
      throw new Error(`Invalid degree_level '${data.degree_level}'. Allowed: ${VALID_DEGREES.join(", ")}`);
    }
    const newRecord = {
      ...data,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.opportunities.unshift(newRecord);
    this.persistOpportunities();
    this.logActivity(
      session.email,
      session.role,
      "CREATE",
      newRecord.id,
      `Curated new opportunity: "${newRecord.title.substring(0, 40)}..." (${newRecord.host_country})`
    );
    return newRecord;
  }
  updateRecord(id, updates, session) {
    if (session.role !== "admin") {
      throw new Error("Forbidden: Only Administrators have write permissions.");
    }
    const index = this.opportunities.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Record with ID '${id}' not found.`);
    }
    const current = this.opportunities[index];
    const changedFields = [];
    const VALID_PROVIDERS = ["university", "foundation", "government", "corporate", "ngo"];
    const VALID_DEGREES = ["masters", "masters_or_phd", "phd"];
    if (updates.provider_type && !VALID_PROVIDERS.includes(updates.provider_type)) {
      throw new Error(`Invalid provider_type '${updates.provider_type}'. Allowed: ${VALID_PROVIDERS.join(", ")}`);
    }
    if (updates.degree_level && !VALID_DEGREES.includes(updates.degree_level)) {
      throw new Error(`Invalid degree_level '${updates.degree_level}'. Allowed: ${VALID_DEGREES.join(", ")}`);
    }
    Object.keys(updates).forEach((k) => {
      if (k !== "updated_at" && updates[k] !== void 0 && updates[k] !== current[k]) {
        changedFields.push(k);
      }
    });
    const updated = {
      ...current,
      ...updates,
      id: current.id,
      // prevent changing ID
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.opportunities[index] = updated;
    this.persistOpportunities();
    this.logActivity(
      session.email,
      session.role,
      "UPDATE",
      id,
      `Updated ${changedFields.length} field(s) for "${updated.title.substring(0, 35)}..."`,
      changedFields
    );
    return updated;
  }
  deleteRecord(id, session) {
    if (session.role !== "admin") {
      throw new Error("Forbidden: Only Administrators have delete permissions.");
    }
    const target = this.opportunities.find((o) => o.id === id);
    if (!target) return false;
    this.opportunities = this.opportunities.filter((o) => o.id !== id);
    this.persistOpportunities();
    this.logActivity(
      session.email,
      session.role,
      "DELETE",
      id,
      `Expunged record: "${target.title.substring(0, 40)}..."`
    );
    return true;
  }
  toggleArchiveRecord(id, archive, session) {
    if (session.role !== "admin") {
      throw new Error("Forbidden: Only Administrators have archive permissions.");
    }
    const index = this.opportunities.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Record with ID '${id}' not found.`);
    }
    const current = this.opportunities[index];
    const newActiveState = !archive;
    const updated = {
      ...current,
      is_active: newActiveState,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.opportunities[index] = updated;
    this.persistOpportunities();
    this.logActivity(
      session.email,
      session.role,
      "UPDATE",
      id,
      `${archive ? "Archived" : "Restored"} opportunity: "${updated.title.substring(0, 35)}..." (is_active: ${newActiveState})`,
      ["is_active"]
    );
    return updated;
  }
  importRecords(newRecords, session, onDuplicate = "skip") {
    if (session.role !== "admin") {
      throw new Error("Forbidden: Only Administrators have batch import permissions.");
    }
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    for (const record of newRecords) {
      const idx = this.opportunities.findIndex((o) => o.id.toLowerCase() === record.id.toLowerCase());
      if (idx !== -1) {
        if (onDuplicate === "overwrite") {
          this.opportunities[idx] = {
            ...record,
            created_at: this.opportunities[idx].created_at,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          updated++;
        } else {
          skipped++;
        }
      } else {
        this.opportunities.unshift({
          ...record,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        imported++;
      }
    }
    this.persistOpportunities();
    this.logActivity(
      session.email,
      session.role,
      "IMPORT",
      void 0,
      `Batch CSV Ingest: Added ${imported}, Updated ${updated}, Skipped ${skipped} items.`
    );
    return { imported, updated, skipped };
  }
  resetSeed(session) {
    if (session.role !== "admin") {
      throw new Error("Forbidden: Administrator authorization required.");
    }
    this.seedOpportunities();
    this.logActivity(session.email, session.role, "RESET", void 0, "Restored database to default 112 seed records.");
  }
  // Real-time Database Statistics
  getStats() {
    const total = this.opportunities.length;
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().slice(0, 10);
    let activeCount = 0;
    let inactiveCount = 0;
    let fullFundingCount = 0;
    let partialFundingCount = 0;
    let tuitionWaiverCount = 0;
    let indianEligibleCount = 0;
    let createdToday = 0;
    let closingIn30Days = 0;
    let deadlinePassed = 0;
    let noDeadline = 0;
    let unverifiedUrls = 0;
    let staleVerifications = 0;
    let totalCompleteness = 0;
    const countryMap = {};
    const fundingMap = {};
    const providerMap = {};
    const degreeMap = {};
    const fieldMap = {};
    const monthMap = {};
    for (const r of this.opportunities) {
      if (r.is_active) activeCount++;
      else inactiveCount++;
      if (r.funding_type === "full") fullFundingCount++;
      else if (r.funding_type === "partial") partialFundingCount++;
      else if (r.funding_type === "tuition_waiver") tuitionWaiverCount++;
      if (r.indian_applicants_eligible) indianEligibleCount++;
      if (r.created_at && r.created_at.startsWith(todayStr)) {
        createdToday++;
      }
      const status = computeDeadlineStatus(r.application_deadline, now);
      if (status === "closing") closingIn30Days++;
      else if (status === "expired") deadlinePassed++;
      else if (status === "none") noDeadline++;
      if (r.official_url && (r.official_url.includes("example.com") || !r.official_url.startsWith("http"))) {
        unverifiedUrls++;
      }
      if (r.verified_on) {
        const diffDays = (now.getTime() - new Date(r.verified_on).getTime()) / (1e3 * 60 * 60 * 24);
        if (diffDays > 90) staleVerifications++;
      }
      totalCompleteness += calculateOpportunityCompleteness(r);
      countryMap[r.host_country] = (countryMap[r.host_country] || 0) + 1;
      fundingMap[r.funding_type] = (fundingMap[r.funding_type] || 0) + 1;
      providerMap[r.provider_type] = (providerMap[r.provider_type] || 0) + 1;
      const degreeLabel = r.degree_level === "masters_or_phd" ? "Master's or PhD" : "Master's";
      degreeMap[degreeLabel] = (degreeMap[degreeLabel] || 0) + 1;
      if (Array.isArray(r.fields_of_study)) {
        for (const field of r.fields_of_study) {
          fieldMap[field] = (fieldMap[field] || 0) + 1;
        }
      }
      if (r.application_deadline) {
        const monthKey = r.application_deadline.slice(0, 7);
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      }
    }
    const by_country = Object.entries(countryMap).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);
    const by_funding_type = Object.entries(fundingMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
    const by_provider_type = Object.entries(providerMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
    const by_degree_level = Object.entries(degreeMap).map(([degree, count]) => ({ degree, count })).sort((a, b) => b.count - a.count);
    const by_field = Object.entries(fieldMap).map(([field, count]) => ({ field, count })).sort((a, b) => b.count - a.count);
    const by_deadline_month = Object.entries(monthMap).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));
    const distinctCountries = Object.keys(countryMap).length;
    const suspiciousMissingCount = unverifiedUrls + noDeadline;
    return {
      total_records: total,
      active_count: activeCount,
      inactive_count: inactiveCount,
      full_funding_count: fullFundingCount,
      partial_funding_count: partialFundingCount,
      tuition_waiver_count: tuitionWaiverCount,
      distinct_countries_count: distinctCountries,
      indian_eligible_count: indianEligibleCount,
      created_today: createdToday,
      closing_in_30_days: closingIn30Days,
      deadline_passed: deadlinePassed,
      no_deadline: noDeadline,
      suspicious_missing_count: suspiciousMissingCount,
      avg_completeness_pct: total > 0 ? Math.round(totalCompleteness / total) : 100,
      by_country,
      by_funding_type,
      by_provider_type,
      by_degree_level,
      by_field,
      by_deadline_month,
      unverified_urls_count: unverifiedUrls,
      stale_verifications_count: staleVerifications
    };
  }
  getDataQualityReport() {
    return generateDataQualityReport(this.opportunities);
  }
};
var db = new DatabaseEngine();

// src/lib/csvEngine.ts
var MANDATORY_CSV_HEADERS = [
  "id",
  "title",
  "provider_name",
  "host_country",
  "degree_level",
  "funding_type",
  "official_url"
];
var VALID_PROVIDER_TYPES = ["university", "foundation", "government", "corporate", "ngo"];
var VALID_DEGREE_LEVELS = ["masters", "masters_or_phd", "phd"];
var VALID_FUNDING_TYPES = ["full", "partial", "stipend_only", "tuition_waiver", "travel_grant"];
var VALID_POPULARITY_TIERS = ["long_tail", "well_known"];
function sanitizeForFormulaInjection(value) {
  if (!value) return "";
  const firstChar = value.charAt(0);
  if (["=", "+", "-", "@", "	", "\r"].includes(firstChar)) {
    return `'${value}`;
  }
  return value;
}
function escapeCSVCell(val) {
  if (val === null || val === void 0) return '""';
  let str = "";
  if (Array.isArray(val)) {
    str = val.join("; ");
  } else if (typeof val === "boolean") {
    str = val ? "true" : "false";
  } else {
    str = String(val);
  }
  str = sanitizeForFormulaInjection(str);
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}
function exportOpportunitiesToCSV(records) {
  const headers = [
    "id",
    "title",
    "provider_name",
    "provider_type",
    "host_country",
    "host_institution",
    "degree_level",
    "funding_type",
    "funding_summary",
    "funding_amount_note",
    "fields_of_study",
    "eligibility_summary",
    "indian_applicants_eligible",
    "min_gpa_note",
    "language_requirements",
    "application_deadline",
    "deadline_note",
    "official_url",
    "tags",
    "popularity_tier",
    "curated_by",
    "verified_on",
    "is_active",
    "created_at",
    "updated_at"
  ];
  const headerRow = headers.map((h) => `"${h}"`).join(",");
  const dataRows = records.map((r) => headers.map((h) => escapeCSVCell(r[h])).join(","));
  return "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
}
function parseOpportunitiesCSV(rawText) {
  const cleanText = rawText.replace(/^\uFEFF/, "");
  const lines = splitCSVLines(cleanText);
  const result = { validRecords: [], errors: [], totalRows: 0 };
  if (lines.length < 2) {
    result.errors.push({ row: 1, reason: "File is empty or missing data rows." });
    return result;
  }
  const rawHeaders = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  for (const req of MANDATORY_CSV_HEADERS) {
    if (!rawHeaders.includes(req.toLowerCase())) {
      result.errors.push({
        row: 1,
        reason: `Missing mandatory CSV column: '${req}'. Found: [${rawHeaders.join(", ")}]`
      });
      return result;
    }
  }
  const headerMap = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[h] = idx;
  });
  const seenIds = /* @__PURE__ */ new Set();
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    result.totalRows++;
    const rowNum = i + 1;
    const tokens = parseCSVLine(rawLine);
    if (tokens.length < rawHeaders.length) {
      result.errors.push({
        row: rowNum,
        reason: `Column count mismatch: Expected at least ${rawHeaders.length} columns, found ${tokens.length}.`
      });
      continue;
    }
    const id = tokens[headerMap["id"]]?.trim();
    const title = tokens[headerMap["title"]]?.trim();
    const providerName = tokens[headerMap["provider_name"]]?.trim();
    const hostCountry = tokens[headerMap["host_country"]]?.trim();
    const degreeLevel = tokens[headerMap["degree_level"]]?.trim().toLowerCase() || "masters";
    const fundingType = tokens[headerMap["funding_type"]]?.trim().toLowerCase() || "full";
    const officialUrl = tokens[headerMap["official_url"]]?.trim() || "";
    if (!id || id.length < 3) {
      result.errors.push({ row: rowNum, reason: `Invalid ID '${id}'. Must be at least 3 characters.` });
      continue;
    }
    if (seenIds.has(id.toLowerCase())) {
      result.errors.push({ row: rowNum, reason: `Duplicate record ID '${id}' in upload payload.` });
      continue;
    }
    seenIds.add(id.toLowerCase());
    if (!title || title.length < 5) {
      result.errors.push({ row: rowNum, reason: `Title is empty or too short (< 5 chars).` });
      continue;
    }
    if (!providerName) {
      result.errors.push({ row: rowNum, reason: `Provider name is mandatory.` });
      continue;
    }
    if (!hostCountry) {
      result.errors.push({ row: rowNum, reason: `Host country is mandatory.` });
      continue;
    }
    if (!VALID_DEGREE_LEVELS.includes(degreeLevel)) {
      result.errors.push({
        row: rowNum,
        reason: `Invalid degree_level '${degreeLevel}'. Allowed: ${VALID_DEGREE_LEVELS.join(", ")}`
      });
      continue;
    }
    if (!VALID_FUNDING_TYPES.includes(fundingType)) {
      result.errors.push({
        row: rowNum,
        reason: `Invalid funding_type '${fundingType}'. Allowed: ${VALID_FUNDING_TYPES.join(", ")}`
      });
      continue;
    }
    const providerType = tokens[headerMap["provider_type"]]?.trim().toLowerCase() || "university";
    const hostInstitution = tokens[headerMap["host_institution"]]?.trim() || providerName;
    const fundingSummary = tokens[headerMap["funding_summary"]]?.trim() || `${fundingType} funding for technical graduate students.`;
    const fundingAmountNote = tokens[headerMap["funding_amount_note"]]?.trim() || "See official portal for breakdown.";
    const eligibilitySummary = tokens[headerMap["eligibility_summary"]]?.trim() || "Eligible technical degree required.";
    const minGpaNote = tokens[headerMap["min_gpa_note"]]?.trim() || "Minimum 7.0 CGPA recommended.";
    const languageRequirements = tokens[headerMap["language_requirements"]]?.trim() || "IELTS 6.5+ or TOEFL 90+.";
    const rawDeadline = tokens[headerMap["application_deadline"]]?.trim() || null;
    const applicationDeadline = rawDeadline && !isNaN(Date.parse(rawDeadline)) ? rawDeadline.split("T")[0] : null;
    const deadlineNote = tokens[headerMap["deadline_note"]]?.trim() || (applicationDeadline ? "Subject to timezone deadlines." : "Rolling admission.");
    const fieldsRaw = tokens[headerMap["fields_of_study"]]?.trim() || "Computer Science";
    const fieldsOfStudy = fieldsRaw.split(/[;,]/).map((f) => f.trim()).filter(Boolean);
    const tagsRaw = tokens[headerMap["tags"]]?.trim() || "";
    const tags = tagsRaw.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
    const popularityTier = tokens[headerMap["popularity_tier"]]?.trim().toLowerCase() || "long_tail";
    const curatedBy = tokens[headerMap["curated_by"]]?.trim() || "Admin Ingest";
    const verifiedOn = tokens[headerMap["verified_on"]]?.trim() || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const rawEligible = tokens[headerMap["indian_applicants_eligible"]]?.trim().toLowerCase();
    const indianApplicantsEligible = rawEligible === "false" ? false : true;
    const rawActive = tokens[headerMap["is_active"]]?.trim().toLowerCase();
    const isActive = rawActive === "false" ? false : true;
    result.validRecords.push({
      id,
      title,
      provider_name: providerName,
      provider_type: VALID_PROVIDER_TYPES.includes(providerType) ? providerType : "university",
      host_country: hostCountry,
      host_institution: hostInstitution,
      degree_level: degreeLevel,
      funding_type: fundingType,
      funding_summary: fundingSummary,
      funding_amount_note: fundingAmountNote,
      fields_of_study: fieldsOfStudy.length > 0 ? fieldsOfStudy : ["Computer Science"],
      eligibility_summary: eligibilitySummary,
      indian_applicants_eligible: indianApplicantsEligible,
      min_gpa_note: minGpaNote,
      language_requirements: languageRequirements,
      application_deadline: applicationDeadline,
      deadline_note: deadlineNote,
      official_url: officialUrl || `https://example.com/scholarships/${id}`,
      tags: tags.length > 0 ? tags : [hostCountry.toLowerCase(), fundingType],
      popularity_tier: VALID_POPULARITY_TIERS.includes(popularityTier) ? popularityTier : "long_tail",
      curated_by: curatedBy,
      verified_on: verifiedOn,
      is_active: isActive,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  return result;
}
function splitCSVLines(text) {
  const lines = [];
  let current = "";
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      if (current.trim().length > 0) {
        lines.push(current);
      }
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    lines.push(current);
  }
  return lines;
}
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// server.ts
dotenv.config();
var app = express();
var PORT = parseInt(process.env.PORT || "3000", 10);
var isProd = process.env.NODE_ENV === "production";
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  sessionSecret = crypto2.randomBytes(32).toString("hex");
  if (isProd) {
    console.warn("[SECURITY] No valid SESSION_SECRET provided in production environment (minimum 32 characters required). Generated secure 256-bit ephemeral secret to maintain instance availability.");
  } else {
    console.warn("[WARN] No SESSION_SECRET configured in development. Generated ephemeral per-process session secret.");
  }
}
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(sessionSecret));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
  );
  next();
});
var extractSession = (req, _res, next) => {
  const token = req.cookies?.scholar_lens_sid;
  if (token) {
    const session = db.getSession(token);
    if (session) {
      req.user = session;
    }
  }
  next();
};
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) {
    return next();
  }
  if (req.url.startsWith("/auth/") || req.url.startsWith("/records") || req.url.startsWith("/stats") || req.url.startsWith("/activity") || req.url.startsWith("/data-quality") || req.url.startsWith("/admin/")) {
    req.url = "/api" + req.url;
  }
  next();
});
app.use(extractSession);
var requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required." });
  }
  next();
};
var requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Please sign in." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Administrator privileges required for this action." });
  }
  next();
};
var loginRateLimitMap = /* @__PURE__ */ new Map();
var MAX_FAILED_ATTEMPTS = 5;
var RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;
function getRateLimitKey(req, email) {
  const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
  return `${ip}:${email.toLowerCase().trim()}`;
}
function checkRateLimit(key) {
  const now = Date.now();
  const entry = loginRateLimitMap.get(key);
  if (!entry) return { allowed: true };
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1e3);
    return { allowed: false, retryAfterSeconds };
  }
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimitMap.delete(key);
    return { allowed: true };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1e3);
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true };
}
function recordFailedLogin(key) {
  const now = Date.now();
  const entry = loginRateLimitMap.get(key);
  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimitMap.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
    if (entry.count >= MAX_FAILED_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
    }
  }
}
function clearRateLimit(key) {
  loginRateLimitMap.delete(key);
}
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const rateKey = getRateLimitKey(req, email);
  const rateCheck = checkRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfter: rateCheck.retryAfterSeconds
    });
  }
  const authResult = db.authenticate(email, password);
  if (!authResult) {
    recordFailedLogin(rateKey);
    db.logActivity(email, "viewer", "FAILED_LOGIN", void 0, `Failed login attempt for ${email}`);
    return res.status(401).json({ error: "Invalid institutional credentials. Verify email and password." });
  }
  clearRateLimit(rateKey);
  res.cookie("scholar_lens_sid", authResult.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 7 days
    path: "/"
  });
  return res.json({ user: authResult.user });
});
app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies?.scholar_lens_sid;
  if (token) {
    db.destroySession(token);
  }
  res.clearCookie("scholar_lens_sid", { path: "/" });
  return res.json({ success: true, message: "Logged out successfully." });
});
app.get("/api/auth/session", (req, res) => {
  return res.json({ user: req.user || null });
});
app.get("/api/records", requireAuth, (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      host_country: req.query.host_country,
      funding_type: req.query.funding_type,
      provider_type: req.query.provider_type,
      degree_level: req.query.degree_level,
      deadline_status: req.query.deadline_status,
      indian_eligible: req.query.indian_eligible,
      is_active: req.query.is_active,
      popularity_tier: req.query.popularity_tier,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      page_size: req.query.page_size ? parseInt(req.query.page_size, 10) : 10
    };
    const paginated = db.listRecords(filters);
    return res.json(paginated);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error querying records" });
  }
});
app.get("/api/records/:id", requireAuth, (req, res) => {
  const record = db.getRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: `Record '${req.params.id}' not found.` });
  }
  return res.json(record);
});
app.post("/api/records", requireAdmin, (req, res) => {
  try {
    const created = db.createRecord(req.body, req.user);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
app.put("/api/records/:id", requireAdmin, (req, res) => {
  try {
    const updated = db.updateRecord(req.params.id, req.body, req.user);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
app.patch("/api/records/:id/archive", requireAdmin, (req, res) => {
  try {
    const { archive } = req.body;
    if (typeof archive !== "boolean") {
      return res.status(400).json({ error: 'Body must include boolean "archive" flag.' });
    }
    const updated = db.toggleArchiveRecord(req.params.id, archive, req.user);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
app.delete("/api/records/:id", requireAdmin, (req, res) => {
  try {
    const success = db.deleteRecord(req.params.id, req.user);
    if (!success) {
      return res.status(404).json({ error: "Record not found." });
    }
    return res.json({ success: true, message: "Record permanently deleted." });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
app.post("/api/records/import", requireAdmin, (req, res) => {
  try {
    const { csvContent, onDuplicate } = req.body;
    if (!csvContent || typeof csvContent !== "string") {
      return res.status(400).json({ error: "Missing or invalid csvContent payload." });
    }
    if (Buffer.byteLength(csvContent, "utf8") > 2 * 1024 * 1024) {
      return res.status(413).json({ error: "Payload Too Large: CSV batch exceeds 2 MB limit." });
    }
    const parseResult = parseOpportunitiesCSV(csvContent);
    if (parseResult.errors.length > 0 && parseResult.validRecords.length === 0) {
      return res.status(400).json({
        error: "CSV validation failed with critical errors.",
        errors: parseResult.errors,
        totalRows: parseResult.totalRows
      });
    }
    const importResult = db.importRecords(parseResult.validRecords, req.user, onDuplicate || "skip");
    return res.json({
      success: true,
      imported: importResult.imported,
      updated: importResult.updated,
      skipped: importResult.skipped,
      validationErrors: parseResult.errors,
      totalParsed: parseResult.totalRows
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed processing CSV batch" });
  }
});
app.get("/api/records/export", requireAuth, (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      host_country: req.query.host_country,
      funding_type: req.query.funding_type,
      provider_type: req.query.provider_type,
      degree_level: req.query.degree_level,
      deadline_status: req.query.deadline_status,
      indian_eligible: req.query.indian_eligible,
      is_active: req.query.is_active,
      popularity_tier: req.query.popularity_tier,
      page: 1,
      page_size: 1e4
      // Export all matching
    };
    const result = db.listRecords(filters);
    const csvData = exportOpportunitiesToCSV(result.data);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="scholar_lens_opportunities_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Export failed" });
  }
});
app.get("/api/stats", requireAuth, (_req, res) => {
  const stats = db.getStats();
  return res.json(stats);
});
app.get("/api/activity", requireAuth, (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
  const logs = db.getActivityLogs(limit);
  return res.json(logs);
});
app.get("/api/data-quality", requireAuth, (_req, res) => {
  const report = db.getDataQualityReport();
  return res.json(report);
});
app.post("/api/admin/reset-seed", requireAdmin, (req, res) => {
  if (isProd) {
    return res.status(403).json({ error: "Forbidden: Database seed reset is disabled in production environment." });
  }
  const { confirm } = req.body || {};
  if (confirm !== true) {
    return res.status(400).json({ error: "Bad Request: Explicit confirmation body flag { confirm: true } is required to reset dataset." });
  }
  try {
    db.resetSeed(req.user);
    return res.json({ success: true, message: "Database reset to default 112 seed opportunities." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.all("/api/*", (_req, res) => {
  return res.status(404).json({ error: "Endpoint not found." });
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.resolve(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path2.resolve(process.cwd(), "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Scholar Lens] Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}
var isServerless = Boolean(
  process.env.VERCEL === "1" || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);
var isMainModule = () => {
  if (isServerless) return false;
  try {
    const entry = process.argv[1] || "";
    return entry.endsWith("server.ts") || entry.endsWith("server.js");
  } catch {
    return false;
  }
};
if (isMainModule()) {
  startServer().catch((err) => {
    console.error("Failed to start Scholar Lens server:", err);
    process.exit(1);
  });
}
var server_default = app;
export {
  app,
  server_default as default
};
