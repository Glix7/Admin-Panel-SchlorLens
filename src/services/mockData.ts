import { Opportunity } from '../types';

// 25 Host Countries across Europe, North America, Asia-Pacific, and Middle East
export const SEED_COUNTRIES = [
  'Germany', 'United States', 'United Kingdom', 'Switzerland', 'Sweden',
  'Netherlands', 'France', 'Canada', 'Singapore', 'Japan',
  'Australia', 'Ireland', 'Finland', 'Norway', 'Denmark',
  'Belgium', 'Austria', 'South Korea', 'Taiwan', 'Italy',
  'Spain', 'New Zealand', 'Israel', 'Estonia', 'Poland'
];

export const TECHNICAL_FIELDS = [
  'Computer Science', 'Artificial Intelligence', 'Machine Learning',
  'Robotics', 'Cybersecurity', 'Embedded Systems', 'VLSI & Microelectronics',
  'Data Science', 'Human-Computer Interaction', 'Cloud Computing'
];

// Helper to construct seed records
function createOpportunity(
  idx: number,
  tier: 'long_tail' | 'well_known',
  country: string,
  institution: string,
  provider: string,
  providerType: 'university' | 'foundation' | 'government' | 'corporate',
  title: string,
  fundingType: 'full' | 'partial' | 'stipend_only' | 'tuition_waiver' | 'travel_grant',
  deadline: string | null,
  fields: string[],
  amountNote: string,
  isTestFixture: boolean = false
): Opportunity {
  const prefix = isTestFixture ? 'test-fixture' : tier === 'long_tail' ? 'opp-lt' : 'opp-wk';
  const id = `${prefix}-${String(idx).padStart(3, '0')}`;

  return {
    id,
    title,
    provider_name: provider,
    provider_type: providerType,
    host_country: country,
    host_institution: institution,
    degree_level: idx % 3 === 0 ? 'masters_or_phd' : 'masters',
    funding_type: fundingType,
    funding_summary: `${fundingType === 'full' ? '100% tuition coverage with monthly research stipend' : fundingType === 'partial' ? 'Covers 50% tuition and living supplement' : fundingType === 'stipend_only' ? 'Living stipend allowance for research assistants' : 'Complete tuition waiver award'} for technical graduate students.`,
    funding_amount_note: amountNote,
    fields_of_study: fields,
    eligibility_summary: 'B.Tech/B.E. in CS/ECE/EE with minimum 7.5 CGPA or equivalent academic standing.',
    indian_applicants_eligible: true,
    min_gpa_note: 'Minimum 7.5 CGPA or First Class distinction from an accredited Indian institution.',
    language_requirements: 'IELTS 6.5+ or TOEFL iBT 90+ (or medium of instruction certificate if applicable).',
    application_deadline: deadline,
    deadline_note: deadline ? 'Online application portal closes at 23:59 UTC on deadline date.' : 'Rolling admissions with bi-annual evaluation cycles.',
    official_url: `https://example.com/scholarships/${id}`, // All 112 are placeholder example.com URLs as specified
    tags: [tier, fundingType, country.toLowerCase().replace(/\s+/g, '-'), ...fields.slice(0, 2).map(f => f.toLowerCase().replace(/\s+/g, '-'))],
    popularity_tier: tier,
    curated_by: 'Scholar Lens Academic Curation Board',
    verified_on: idx % 7 === 0 ? '2025-10-15' : '2026-08-20', // Stale verification for some rows
    is_active: true,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-08-20T14:30:00.000Z',
  };
}

// 112 Authentic Curated Seed Records
export const INITIAL_MOCK_OPPORTUNITIES: Opportunity[] = [
  // --- Well-Known (opp-wk-001 to opp-wk-035) ---
  createOpportunity(1, 'well_known', 'Germany', 'Technical University of Munich (TUM)', 'DAAD', 'government', 'DAAD Helmut-Schmidt Master Fellowship in Informatics', 'full', '2026-11-15', ['Computer Science', 'Artificial Intelligence'], '€934/month + full health insurance + travel grant'),
  createOpportunity(2, 'well_known', 'United States', 'Stanford University', 'Knight-Hennessy Scholars Foundation', 'foundation', 'Knight-Hennessy Scholars in Computer Science & AI', 'full', '2026-10-14', ['Artificial Intelligence', 'Robotics'], 'Full tuition, room, board, and annual travel allowance'),
  createOpportunity(3, 'well_known', 'United Kingdom', 'University of Cambridge', 'Gates Cambridge Trust', 'foundation', 'Gates Cambridge Master in Advanced Computer Science', 'full', '2026-12-05', ['Computer Science', 'Machine Learning'], 'Full university fees + £20,000 annual maintenance allowance'),
  createOpportunity(4, 'well_known', 'Switzerland', 'ETH Zurich', 'ETH Zurich Excellence Foundation', 'university', 'ETH Excellence Scholarship & Opportunity Programme (ESOP)', 'full', '2026-12-15', ['Computer Science', 'Data Science'], 'CHF 12,000/semester living stipend + full tuition waiver'),
  createOpportunity(5, 'well_known', 'Sweden', 'KTH Royal Institute of Technology', 'Swedish Institute', 'government', 'Swedish Institute Global Professionals Fellowship in Embedded Systems', 'full', '2027-01-15', ['Embedded Systems', 'VLSI & Microelectronics'], 'SEK 12,000/month stipend + comprehensive health insurance'),
  createOpportunity(6, 'well_known', 'Netherlands', 'TU Delft', 'Justus & Louise van Effen Foundation', 'foundation', 'Justus & Louise van Effen Excellence Fellowship in Computer Science', 'full', '2026-12-01', ['Computer Science', 'Cybersecurity'], '€30,000/year covers full tuition and living expenses'),
  createOpportunity(7, 'well_known', 'France', 'École Polytechnique (IPP)', 'French Ministry for Europe and Foreign Affairs', 'government', 'Eiffel Excellence Master Scholarship in AI & Data Science', 'full', '2027-01-10', ['Artificial Intelligence', 'Data Science'], '€1,181/month allowance + international transport + social security'),
  createOpportunity(8, 'well_known', 'Canada', 'University of Toronto', 'Mila & Vector Institute', 'foundation', 'Vector Institute Master Research Bursary in Deep Learning', 'stipend_only', '2026-11-30', ['Machine Learning', 'Artificial Intelligence'], 'CAD $17,500 annual stipend merit award'),
  createOpportunity(9, 'well_known', 'Singapore', 'National University of Singapore (NUS)', 'AI Singapore & EDB', 'government', 'AI Singapore Graduate Fellowship in Autonomous Systems', 'full', '2026-10-30', ['Artificial Intelligence', 'Robotics'], 'SGD $3,200/month + full tuition subsidy + conference grant'),
  createOpportunity(10, 'well_known', 'Japan', 'University of Tokyo', 'MEXT (Ministry of Education, Culture, Sports, Science & Tech)', 'government', 'MEXT University Recommendation Fellowship in Robotics', 'full', '2026-11-20', ['Robotics', 'Embedded Systems'], '144,000 JPY/month stipend + zero tuition + round-trip flights'),
  createOpportunity(11, 'well_known', 'Australia', 'University of Melbourne', 'Australian Government Research Training Program (RTP)', 'government', 'Melbourne RTP Scholarship in Intelligent Systems', 'full', '2026-10-31', ['Artificial Intelligence', 'Cloud Computing'], 'AUD $37,000/year living stipend + full fee offset'),
  createOpportunity(12, 'well_known', 'Ireland', 'Trinity College Dublin', 'Government of Ireland (HEA)', 'government', 'Government of Ireland International Education Scholarship in Computing', 'partial', '2027-02-15', ['Computer Science', 'Cybersecurity'], '€10,000 stipend + 100% tuition fee waiver'),
  createOpportunity(13, 'well_known', 'Finland', 'Aalto University', 'Aalto University Scholarship Programme', 'university', 'Aalto Science Fellowship in Machine Learning & Data Science', 'full', '2027-01-08', ['Machine Learning', 'Data Science'], '100% tuition waiver + €1,000/month living subsidy'),
  createOpportunity(14, 'well_known', 'Norway', 'NTNU (Norwegian University of Science & Technology)', 'Erasmus+ Consortium', 'government', 'Erasmus Mundus Joint Master in Cyber Security (CYBER)', 'full', '2027-01-20', ['Cybersecurity', 'Cloud Computing'], '€1,400/month allowance + tuition coverage + installation fees'),
  createOpportunity(15, 'well_known', 'Denmark', 'Technical University of Denmark (DTU)', 'Danish Government', 'government', 'DTU High-Tech Talent Master Scholarship in Computer Systems', 'tuition_waiver', '2027-01-15', ['Computer Science', 'Embedded Systems'], 'Full tuition waiver + partial living grant of DKK 6,000/month'),
  createOpportunity(16, 'well_known', 'Belgium', 'KU Leuven', 'Master Mind Flemish Government', 'government', 'Master Mind Scholarship in Artificial Intelligence', 'partial', '2027-02-01', ['Artificial Intelligence', 'Machine Learning'], '€9,600 living grant + tuition capped at €131/year'),
  createOpportunity(17, 'well_known', 'Austria', 'TU Wien', 'Helmut Veith Stipend Foundation', 'foundation', 'Helmut Veith Stipend for Female Master Students in Computer Science', 'full', '2026-11-30', ['Computer Science', 'Cybersecurity'], '€7,000/year stipend + Austrian university tuition waiver'),
  createOpportunity(18, 'well_known', 'South Korea', 'KAIST', 'KAIST International Graduate Fund', 'university', 'KAIST International Student Master Scholarship in EE & CS', 'full', '2026-09-25', ['Embedded Systems', 'VLSI & Microelectronics'], '350,000 KRW/month + full tuition waiver + national health insurance'),
  createOpportunity(19, 'well_known', 'Taiwan', 'National Taiwan University (NTU)', 'Taiwan MOFA & ICDF', 'government', 'Taiwan Semiconductor Scholarship Program in VLSI Design', 'full', '2026-12-15', ['VLSI & Microelectronics', 'Embedded Systems'], 'NT$ 25,000/month + full credit fee coverage + housing grant'),
  createOpportunity(20, 'well_known', 'Italy', 'Politecnico di Milano', 'Politecnico di Milano Merit Committee', 'university', 'PoliMi Platinum Graduate Scholarship in Computer Engineering', 'full', '2027-01-30', ['Computer Science', 'Robotics'], '€10,000 gross/year + complete tuition exemption'),
  createOpportunity(21, 'well_known', 'Spain', 'UPC BarcelonaTech', 'Severo Ochoa Research Centers', 'foundation', 'Severo Ochoa Master Fellowship in High Performance Computing', 'full', '2027-02-10', ['Computer Science', 'Cloud Computing'], '€1,200/month + full registration fees'),
  createOpportunity(22, 'well_known', 'New Zealand', 'University of Auckland', 'Auckland International Academic Excellence Committee', 'university', 'Auckland International Master Merit Scholarship in Data Science', 'partial', '2026-11-21', ['Data Science', 'Machine Learning'], 'Up to NZD $10,000 toward tuition fees'),
  createOpportunity(23, 'well_known', 'Israel', 'Technion - Israel Institute of Technology', 'Technion Graduate School', 'university', 'Technion International Excellence Fellowship in Autonomous Systems', 'full', '2026-11-01', ['Robotics', 'Artificial Intelligence'], '100% tuition waiver + 5,500 ILS/month living stipend'),
  createOpportunity(24, 'well_known', 'Estonia', 'University of Tartu', 'Estonian Ministry of Education & IT Academy', 'government', 'Estonian IT Academy Master Stipend in Cyber Security', 'full', '2027-03-15', ['Cybersecurity', 'Cloud Computing'], 'Tuition waiver + €400/month specialty stipend'),
  createOpportunity(25, 'well_known', 'Poland', 'Warsaw University of Technology', 'NAWA (Polish National Agency for Academic Exchange)', 'government', 'NAWA Banach Scholarship in Artificial Intelligence', 'full', '2027-03-31', ['Artificial Intelligence', 'Data Science'], 'PLN 1,700/month + tuition exemption at Polish state universities'),
  createOpportunity(26, 'well_known', 'Germany', 'RWTH Aachen University', 'Siemens & RWTH Foundation', 'corporate', 'Siemens Excellence Grant in Industrial Embedded Systems', 'stipend_only', '2026-12-01', ['Embedded Systems', 'Robotics'], '€800/month living grant + industrial internship placement'),
  createOpportunity(27, 'well_known', 'United States', 'Carnegie Mellon University', 'CMU School of Computer Science', 'university', 'CMU Robotics Institute Graduate Assistantship', 'full', '2026-12-10', ['Robotics', 'Artificial Intelligence'], 'Full tuition coverage + monthly teaching/research stipend'),
  createOpportunity(28, 'well_known', 'United Kingdom', 'Imperial College London', 'DeepMind', 'corporate', 'DeepMind Master Scholarship in Artificial Intelligence', 'full', '2026-11-25', ['Artificial Intelligence', 'Machine Learning'], 'Full international fees + £20,500 stipend + equipment grant'),
  createOpportunity(29, 'well_known', 'Switzerland', 'EPFL', 'EPFL School of Computer and Communication Sciences', 'university', 'EPFL Excellence Master Fellowship in Computer Science', 'full', '2026-11-15', ['Computer Science', 'Cybersecurity'], 'CHF 10,000/semester + reserved campus housing'),
  createOpportunity(30, 'well_known', 'Sweden', 'Chalmers University of Technology', 'Volvo Group', 'corporate', 'Volvo Group Master Scholarship in Autonomous Vehicle Systems', 'full', '2027-01-15', ['Robotics', 'Embedded Systems'], '100% tuition fee reduction + thesis mentorship project'),
  createOpportunity(31, 'well_known', 'Netherlands', 'Eindhoven University of Technology (TU/e)', 'ASML', 'corporate', 'ASML Technology Scholarship in Semiconductor & Microelectronics', 'full', '2027-02-01', ['VLSI & Microelectronics', 'Embedded Systems'], '€5,000/year living allowance + dedicated industry mentor'),
  createOpportunity(32, 'well_known', 'Canada', 'McGill University', 'Mila Quebec AI Institute', 'foundation', 'Mila Graduate Research Scholarship in Deep Learning', 'full', '2026-12-15', ['Machine Learning', 'Artificial Intelligence'], 'CAD $22,000/year living stipend + lab resources'),
  createOpportunity(33, 'well_known', 'Japan', 'Tokyo Institute of Technology', 'Sony Research', 'corporate', 'Sony AI Graduate Fellowship in Audio and Perception Intelligence', 'full', '2026-10-15', ['Artificial Intelligence', 'Human-Computer Interaction'], '200,000 JPY/month + full tuition fee coverage'),
  createOpportunity(34, 'well_known', 'Singapore', 'Nanyang Technological University (NTU)', 'A*STAR (Agency for Science, Technology and Research)', 'government', 'Singapore International Graduate Award (SINGA) in Computer Science', 'full', '2027-01-01', ['Computer Science', 'Machine Learning'], 'SGD $2,700/month stipend + zero tuition + SGD $1,000 airfare'),
  createOpportunity(35, 'well_known', 'Germany', 'University of Stuttgart', 'Bosch Research', 'corporate', 'Bosch AI & Sensor Networks Graduate Research Award', 'stipend_only', '2026-11-05', ['Embedded Systems', 'Artificial Intelligence'], '€950/month living support during thesis tenure'),

  // --- Long-Tail Scholarships (opp-lt-036 to opp-lt-112) ---
  createOpportunity(36, 'long_tail', 'Germany', 'TU Dresden', 'cfaed (Center for Advancing Electronics Dresden)', 'university', 'cfaed Nanotechnology & Nanoelectronics Master Bursary', 'partial', '2026-12-15', ['VLSI & Microelectronics'], '€500/month study allowance for first 12 months'),
  createOpportunity(37, 'long_tail', 'Sweden', 'Linköping University', 'Linköping International Fund', 'university', 'LiU International Master Bursary in Intelligent Software Systems', 'partial', '2027-01-15', ['Computer Science'], '50% tuition fee reduction'),
  createOpportunity(38, 'long_tail', 'Finland', 'Tampere University', 'Tampere University Global Scholars', 'university', 'Tampere Graduate Award in Embedded Computing Systems', 'tuition_waiver', '2027-01-10', ['Embedded Systems'], '100% tuition waiver for 2-year duration'),
  createOpportunity(39, 'long_tail', 'France', 'Institut Polytechnique de Paris', 'Telecom Paris Foundation', 'foundation', 'Telecom Paris Excellence Grant in Network Security', 'partial', '2027-01-15', ['Cybersecurity'], '€6,000 annual merit grant'),
  createOpportunity(40, 'long_tail', 'Netherlands', 'University of Twente', 'University of Twente Scholarship (UTS)', 'university', 'UTS Graduate Grant in Robotics & Mechatronics', 'partial', '2027-02-01', ['Robotics'], '€3,000 - €22,000 per year towards study costs'),
  createOpportunity(41, 'long_tail', 'Belgium', 'Ghent University', 'Top-Up Grants Ghent Committee', 'university', 'Ghent University Master Grant in Data Engineering', 'stipend_only', '2027-02-05', ['Data Science'], '€1,000/month living grant + basic health insurance'),
  createOpportunity(42, 'long_tail', 'Austria', 'Johannes Kepler University Linz', 'JKU AI Excellence Fund', 'university', 'JKU Sepp Hochreiter AI Master Fellowship', 'full', '2027-01-31', ['Artificial Intelligence', 'Machine Learning'], '€800/month + research assistant contract'),
  createOpportunity(43, 'long_tail', 'Denmark', 'Aarhus University', 'Danish State Educational Grant', 'government', 'Aarhus University Master Scholarship in Computer Engineering', 'tuition_waiver', '2027-01-15', ['Computer Science'], 'Full tuition fee waiver for non-EU students'),
  createOpportunity(44, 'long_tail', 'Norway', 'University of Oslo', 'Department of Informatics', 'university', 'UiO Research Assistant Bursary in Distributed Systems', 'stipend_only', '2026-12-01', ['Cloud Computing'], 'Hourly stipend for 15 hours/week teaching assistance'),
  createOpportunity(45, 'long_tail', 'Ireland', 'University College Dublin (UCD)', 'UCD Global', 'university', 'UCD Global Excellence Scholarship in Advanced Software Engineering', 'partial', '2027-02-28', ['Computer Science'], '50% tuition reduction'),
  createOpportunity(46, 'long_tail', 'South Korea', 'POSTECH', 'Pohang University of Science & Technology', 'university', 'POSTECH Graduate Fellowship in Semiconductor & VLSI', 'full', '2026-10-10', ['VLSI & Microelectronics'], 'Full tuition coverage + 400,000 KRW monthly stipend'),
  createOpportunity(47, 'long_tail', 'Taiwan', 'National Yang Ming Chiao Tung University (NYCU)', 'NYCU International Affairs', 'university', 'NYCU International Student Scholarship in IC Design', 'full', '2026-12-20', ['VLSI & Microelectronics'], 'NT$ 15,000/month + tuition waiver'),
  createOpportunity(48, 'long_tail', 'Estonia', 'Tallinn University of Technology (TalTech)', 'Cybernetica Foundation', 'corporate', 'Cybernetica Master Fellowship in Cryptography & Systems', 'stipend_only', '2027-03-01', ['Cybersecurity'], '€500/month merit stipend for selected thesis candidates'),
  createOpportunity(49, 'long_tail', 'Poland', 'AGH University of Krakow', 'AGH International Relations', 'university', 'Stanislaw Staszic Master Bursary in Intelligent Computing', 'tuition_waiver', '2027-04-15', ['Artificial Intelligence'], 'Full tuition exemption for top ranked international applicants'),
  createOpportunity(50, 'long_tail', 'Italy', 'University of Bologna', 'Unibo Action 1 & 2', 'university', 'Unibo Action 2 Study Grant in Artificial Intelligence', 'full', '2027-03-31', ['Artificial Intelligence'], '€4,500 gross/year + full tuition exemption'),
  createOpportunity(51, 'long_tail', 'Spain', 'Carlos III University of Madrid (UC3M)', 'UC3M Master Grants', 'university', 'UC3M Tuition Aid for Master in Computer Science & Technology', 'partial', '2027-03-15', ['Computer Science'], 'Up to €3,000 reduction on credit fees'),
  createOpportunity(52, 'long_tail', 'Israel', 'Weizmann Institute of Science', 'Feinberg Graduate School', 'university', 'Feinberg Master Fellowship in Computer Science & Applied Math', 'full', '2026-11-15', ['Machine Learning'], 'Zero tuition fees + monthly living stipend of 6,200 ILS'),
  createOpportunity(53, 'long_tail', 'New Zealand', 'University of Canterbury', 'UC Engineering Faculty', 'university', 'UC International Engineering Master Scholarship in Robotics', 'partial', '2026-11-01', ['Robotics'], 'NZD $15,000 toward first year tuition'),
  createOpportunity(54, 'long_tail', 'Japan', 'Tohoku University', 'President Fellowship Tohoku', 'university', 'Tohoku University Global Leader Master Award in Microelectronics', 'full', '2026-10-20', ['VLSI & Microelectronics'], 'Exam fee, admission fee, and full tuition waiver'),
  createOpportunity(55, 'long_tail', 'Canada', 'University of Waterloo', 'David R. Cheriton School of Computer Science', 'university', 'Cheriton Graduate Scholarship in Computer Systems', 'stipend_only', '2026-12-01', ['Computer Science'], 'CAD $10,000 per year supplement to departmental assistantship'),
  createOpportunity(56, 'long_tail', 'United States', 'Purdue University', 'Center for Education and Research in Information Assurance (CERIAS)', 'foundation', 'CERIAS Fellowship in Cybersecurity & Privacy', 'full', '2026-12-15', ['Cybersecurity'], 'Full graduate research tuition + $2,400/month stipend'),
  createOpportunity(57, 'long_tail', 'United Kingdom', 'University of Edinburgh', 'Edinburgh School of Informatics', 'university', 'Informatics Global Master Merit Scholarship', 'partial', '2027-01-25', ['Artificial Intelligence'], '£8,000 tuition fee contribution'),
  createOpportunity(58, 'long_tail', 'Australia', 'UNSW Sydney', 'UNSW Engineering Faculty', 'university', 'UNSW Engineering International Postgraduate Award in Robotics', 'partial', '2026-11-10', ['Robotics'], 'AUD $10,000 per year towards tuition fees'),
  createOpportunity(59, 'long_tail', 'Germany', 'Karlsruhe Institute of Technology (KIT)', 'Hector Fellow Academy', 'foundation', 'Hector Fellowship in Quantum Informatics and Sensorics', 'full', '2026-12-01', ['Computer Science'], '€1,050/month living allowance + lab operational funds'),
  createOpportunity(60, 'long_tail', 'Sweden', 'Uppsala University', 'King Carl Gustaf Scholarship', 'foundation', 'King Carl Gustaf Master Scholarship in Data Engineering', 'tuition_waiver', '2027-01-15', ['Data Science'], '100% waiver of tuition fee costs'),

  // --- Null Deadline Records (11 in seed as specified in Section 0) ---
  createOpportunity(61, 'long_tail', 'Germany', 'Saarland University', 'Saarbrücken Graduate School of Computer Science', 'university', 'Saarbrücken CS Graduate School Master Bursary', 'stipend_only', null, ['Computer Science', 'Cybersecurity'], '€861/month living stipend for admitted master scholars'),
  createOpportunity(62, 'long_tail', 'Switzerland', 'University of Basel', 'Department of Mathematics and Computer Science', 'university', 'Basel Master Research Assistantship in Distributed AI', 'stipend_only', null, ['Artificial Intelligence'], 'CHF 2,200/month for 50% research assistant work'),
  createOpportunity(63, 'long_tail', 'France', 'Inria (National Institute for Research in Digital Science & Tech)', 'Inria Research Internships', 'government', 'Inria Master Research Internship Fellowship', 'stipend_only', null, ['Machine Learning', 'Robotics'], '€600/month legal gratuity + laboratory housing access'),
  createOpportunity(64, 'long_tail', 'Netherlands', 'Radboud University', 'Max Planck Institute for Psycholinguistics & Computing', 'foundation', 'Radboud-Max Planck Research Fellowship in NLP', 'full', null, ['Artificial Intelligence', 'Human-Computer Interaction'], '€14,000/year living stipend + full non-EU tuition reduction'),
  createOpportunity(65, 'long_tail', 'Singapore', 'Singapore University of Technology and Design (SUTD)', 'SUTD Graduate Research Hub', 'university', 'SUTD Master by Research Industrial Fellowship in Cyber-Physical Systems', 'full', null, ['Embedded Systems', 'Cybersecurity'], 'SGD $2,800/month + complete tuition grant'),
  createOpportunity(66, 'long_tail', 'Canada', 'Simon Fraser University', 'School of Computing Science', 'university', 'SFU Graduate Research Assistantship in Computer Vision', 'stipend_only', null, ['Artificial Intelligence'], 'CAD $18,000/year departmental guaranteed funding'),
  createOpportunity(67, 'long_tail', 'Japan', 'Nara Institute of Science and Technology (NAIST)', 'NAIST Global Admissions', 'university', 'NAIST Information Science Research Grant', 'partial', null, ['Robotics', 'Data Science'], '50% tuition reduction + campus dormitory reservation'),
  createOpportunity(68, 'long_tail', 'Australia', 'Australian National University (ANU)', 'ANU College of Engineering, Computing and Cybernetics', 'university', 'ANU Cybernetics Research Master Bursary', 'stipend_only', null, ['Cybersecurity', 'Robotics'], 'AUD $28,000/year living support award'),
  createOpportunity(69, 'long_tail', 'Sweden', 'Lund University', 'Department of Electrical and Information Technology', 'university', 'Lund EIT Master Project Bursary in 6G Communications', 'travel_grant', null, ['Embedded Systems'], 'SEK 35,000 one-off project and travel contribution'),
  createOpportunity(70, 'long_tail', 'United States', 'University of Wisconsin-Madison', 'Department of Computer Sciences', 'university', 'UW-Madison Computer Sciences Teaching Assistantship', 'full', null, ['Computer Science', 'VLSI & Microelectronics'], 'Full tuition remission + $2,300/month stipend'),
  createOpportunity(71, 'long_tail', 'United Kingdom', 'University of Bristol', 'Bristol Cryptography Group', 'university', 'Bristol Cryptography MSc Student Research Fellowship', 'partial', null, ['Cybersecurity'], '£5,000 tuition fee waiver for top qualifying applicant'),

  // --- Expired Deadline Records (3 in seed as specified in Section 0) ---
  createOpportunity(72, 'long_tail', 'Germany', 'Technical University of Berlin', 'TU Berlin Academic Office', 'university', 'TU Berlin International Student Bursary in Autonomous Driving', 'partial', '2025-04-15', ['Robotics', 'Artificial Intelligence'], '€400/month grant for final semester completion'),
  createOpportunity(73, 'long_tail', 'United States', 'University of Texas at Austin', 'UT Austin ECE Department', 'university', 'UT Austin Microelectronics Graduate Research Stipend', 'stipend_only', '2025-06-30', ['VLSI & Microelectronics'], 'Monthly research assistantship for IC testing laboratory'),
  createOpportunity(74, 'long_tail', 'United Kingdom', 'University of Southampton', 'Zepler Institute for Photonics and Nanoelectronics', 'university', 'Southampton Zepler Institute Silicon Photonics Fellowship', 'full', '2025-08-01', ['VLSI & Microelectronics'], 'Full UK fees + maintenance stipend'),

  // --- Records 75 to 112 (Completing exactly 112 seed items) ---
  createOpportunity(75, 'long_tail', 'Germany', 'University of Freiburg', 'Department of Computer Science', 'university', 'Freiburg Autonomous Intelligent Systems Fellowship', 'stipend_only', '2026-11-20', ['Artificial Intelligence', 'Robotics'], '€850/month laboratory research support'),
  createOpportunity(76, 'long_tail', 'Germany', 'TU Darmstadt', 'Hessian Center for Artificial Intelligence (hessian.AI)', 'foundation', 'hessian.AI Graduate Research Scholarship', 'full', '2026-12-15', ['Machine Learning', 'Data Science'], '€1,000/month stipend + hardware allocation'),
  createOpportunity(77, 'long_tail', 'United States', 'Georgia Institute of Technology', 'College of Computing', 'university', 'Georgia Tech Cybersecurity Fellowship Award', 'partial', '2027-01-15', ['Cybersecurity'], '$7,500/semester tuition assistance grant'),
  createOpportunity(78, 'long_tail', 'United States', 'University of Illinois Urbana-Champaign', 'UIUC CS Department', 'university', 'UIUC Parallel Computing Graduate Fellowship', 'full', '2026-12-15', ['Computer Science', 'Cloud Computing'], 'Full tuition waiver + $2,450/month RA stipend'),
  createOpportunity(79, 'long_tail', 'United Kingdom', 'University of Manchester', 'School of Computer Science', 'university', 'Manchester Turing AI Master Scholarship', 'partial', '2027-02-15', ['Artificial Intelligence'], '£10,000 fee deduction for international scholars'),
  createOpportunity(80, 'long_tail', 'United Kingdom', 'University of Oxford', 'Department of Computer Science', 'university', 'Oxford DeepMind Scholarship in Computer Science', 'full', '2026-11-20', ['Computer Science', 'Machine Learning'], 'Full university fees + £19,000 annual living stipend'),
  createOpportunity(81, 'long_tail', 'Switzerland', 'University of Zurich', 'Department of Informatics', 'university', 'UZH Master Research Bursary in Intelligent Systems', 'stipend_only', '2026-12-01', ['Artificial Intelligence'], 'CHF 1,800/month research assistant allowance'),
  createOpportunity(82, 'long_tail', 'Sweden', 'Stockholm University', 'Department of Computer and Systems Sciences', 'university', 'Stockholm International Tuition Waiver in Data Science', 'tuition_waiver', '2027-01-15', ['Data Science'], '100% tuition coverage for duration of program'),
  createOpportunity(83, 'long_tail', 'Netherlands', 'University of Amsterdam', 'Informatics Institute', 'university', 'Amsterdam Science Talent Scholarship in AI', 'full', '2027-01-15', ['Artificial Intelligence', 'Data Science'], '€12,500/year living allowance + full tuition'),
  createOpportunity(84, 'long_tail', 'France', 'Sorbonne University', 'LIP6 Computer Science Laboratory', 'university', 'Sorbonne Master Excellence Bursary in Algorithms', 'partial', '2027-02-01', ['Computer Science'], '€600/month stipend during study period'),
  createOpportunity(85, 'long_tail', 'Canada', 'University of British Columbia', 'Department of Computer Science', 'university', 'UBC Graduate Support Initiative in Robotics & Vision', 'stipend_only', '2026-12-15', ['Robotics', 'Artificial Intelligence'], 'CAD $8,000/year minimum guaranteed funding'),
  createOpportunity(86, 'long_tail', 'Canada', 'University of Alberta', 'Amii (Alberta Machine Intelligence Institute)', 'foundation', 'Amii Graduate Researcher Award in Reinforcement Learning', 'full', '2026-11-30', ['Machine Learning'], 'CAD $21,000/year living stipend + travel grant'),
  createOpportunity(87, 'long_tail', 'Singapore', 'Singapore Management University (SMU)', 'School of Computing and Information Systems', 'university', 'SMU Master of IT in Business Postgraduate Scholarship', 'partial', '2027-01-31', ['Data Science', 'Cloud Computing'], 'Up to SGD $15,000 tuition fee subsidy'),
  createOpportunity(88, 'long_tail', 'Japan', 'Kyoto University', 'Graduate School of Informatics', 'university', 'Kyoto University International Education Bursary in Intelligence', 'partial', '2026-10-31', ['Artificial Intelligence'], '50% tuition reduction for top 10% applicants'),
  createOpportunity(89, 'long_tail', 'Australia', 'University of Sydney', 'School of Computer Science', 'university', 'Sydney Engineering & IT Master Merit Scholarship', 'partial', '2026-11-15', ['Computer Science', 'Cybersecurity'], 'AUD $10,000 towards first-year fees'),
  createOpportunity(90, 'long_tail', 'Ireland', 'University College Cork (UCC)', 'School of Computer Science & IT', 'university', 'UCC Postgraduate Merit Bursary in Interactive Media', 'partial', '2027-03-01', ['Human-Computer Interaction'], '20% tuition fee reduction'),
  createOpportunity(91, 'long_tail', 'Finland', 'University of Helsinki', 'Department of Computer Science', 'university', 'Helsinki Master Scholarship in Algorithms & Machine Learning', 'full', '2027-01-05', ['Machine Learning'], '100% tuition waiver + €10,000/year living grant'),
  createOpportunity(92, 'long_tail', 'Norway', 'University of Bergen', 'Department of Informatics', 'university', 'Bergen Master Project Allowance in Algorithms', 'travel_grant', '2026-12-01', ['Computer Science'], 'NOK 20,000 travel and equipment grant'),
  createOpportunity(93, 'long_tail', 'Denmark', 'IT University of Copenhagen', 'ITU Scholarship Committee', 'university', 'ITU Danish Government Scholarship in Software Design', 'full', '2027-01-15', ['Computer Science'], 'Full tuition waiver + DKK 7,000/month allowance'),
  createOpportunity(94, 'long_tail', 'Belgium', 'Vrije Universiteit Brussel (VUB)', 'VUB International Relations', 'university', 'VUB Scholarship for Master in Applied Computer Science', 'partial', '2027-02-15', ['Computer Science', 'Cloud Computing'], 'Up to €5,000 fee reduction'),
  createOpportunity(95, 'long_tail', 'Austria', 'University of Innsbruck', 'Department of Computer Science', 'university', 'Innsbruck Master Fellowship in Distributed & Parallel Systems', 'stipend_only', '2027-01-15', ['Cloud Computing'], '€750/month teaching assistant stipend'),
  createOpportunity(96, 'long_tail', 'South Korea', 'Seoul National University (SNU)', 'SNU Global Scholarship Committee', 'university', 'SNU Global Scholarship for Graduate Students in CS', 'full', '2026-10-25', ['Computer Science'], 'Full tuition + 1,200,000 KRW/month living support'),
  createOpportunity(97, 'long_tail', 'Taiwan', 'National Tsing Hua University (NTHU)', 'NTHU International Operations', 'university', 'NTHU International Student Scholarship in CS & AI', 'full', '2026-12-15', ['Artificial Intelligence', 'VLSI & Microelectronics'], 'NT$ 10,000/month + full credit waiver'),
  createOpportunity(98, 'long_tail', 'Italy', 'Sapienza University of Rome', 'Department of Computer, Control, and Management Engineering', 'university', 'Sapienza International Master Scholarship in Cyber Engineering', 'full', '2027-03-15', ['Cybersecurity', 'Robotics'], '€5,000/year + complete exemption from enrollment fees'),
  createOpportunity(99, 'long_tail', 'Spain', 'Technical University of Madrid (UPM)', 'UPM International Mobility', 'university', 'UPM Master Bursary in Telecommunication & Embedded Systems', 'partial', '2027-02-28', ['Embedded Systems'], '€2,500 contribution towards international tuition'),
  createOpportunity(100, 'long_tail', 'New Zealand', 'Victoria University of Wellington', 'School of Engineering and Computer Science', 'university', 'Wellington Master of Software Development Merit Award', 'partial', '2026-11-20', ['Computer Science'], 'NZD $10,000 tuition fee contribution'),
  createOpportunity(101, 'long_tail', 'Israel', 'Tel Aviv University', 'Blavatnik School of Computer Science', 'university', 'Blavatnik Graduate Fellowship in Theoretical Computer Science', 'full', '2026-11-15', ['Computer Science'], 'Full tuition remission + 5,000 ILS/month living stipend'),
  createOpportunity(102, 'long_tail', 'Estonia', 'University of Tartu', 'Institute of Computer Science', 'university', 'Tartu Industrial Master Programme in Autonomous Systems', 'full', '2027-03-15', ['Robotics', 'Artificial Intelligence'], 'Tuition waiver + €1,000/month partner company stipend'),
  createOpportunity(103, 'long_tail', 'Poland', 'Wrocław University of Science and Technology', 'Department of Computer Science and Management', 'university', 'WUST International Master Scholarship in Big Data Analytics', 'partial', '2027-03-31', ['Data Science'], '50% tuition discount for verified Indian candidates'),
  createOpportunity(104, 'long_tail', 'Germany', 'Heidelberg University', 'Interdisciplinary Center for Scientific Computing (IWR)', 'university', 'Heidelberg IWR Master Bursary in Scientific Computing', 'stipend_only', '2026-11-15', ['Computer Science', 'Machine Learning'], '€900/month research assistant fellowship'),
  createOpportunity(105, 'long_tail', 'United States', 'University of California, San Diego', 'Department of Computer Science and Engineering', 'university', 'UCSD CSE Departmental Master Teaching Assistantship', 'full', '2026-12-15', ['Computer Science', 'VLSI & Microelectronics'], 'Full in-state fee remission + $2,500/month stipend'),
  createOpportunity(106, 'long_tail', 'United Kingdom', 'University of Birmingham', 'School of Computer Science', 'university', 'Birmingham Master Excellence Scholarship in Human-AI Interaction', 'partial', '2027-01-30', ['Human-Computer Interaction', 'Artificial Intelligence'], '£4,000 fee waiver on global international fee rate'),
  createOpportunity(107, 'long_tail', 'Switzerland', 'University of Geneva', 'Computer Science Department', 'university', 'Geneva Master Merit Fellowship in Data & Cyber Intelligence', 'partial', '2027-02-15', ['Data Science', 'Cybersecurity'], 'CHF 10,000/year for candidates with top distinction'),
  createOpportunity(108, 'long_tail', 'Sweden', 'Umeå University', 'Department of Computing Science', 'university', 'Umeå University AI Talent Scholarship', 'tuition_waiver', '2027-01-15', ['Artificial Intelligence'], '100% waiver of tuition fee for two consecutive years'),
  createOpportunity(109, 'long_tail', 'Netherlands', 'Utrecht University', 'Utrecht Excellence Scholarships', 'university', 'Utrecht Excellence Fellowship in Computing Science', 'full', '2027-01-31', ['Computer Science'], 'Full tuition fee + €11,000 annual living allowance'),
  createOpportunity(110, 'long_tail', 'France', 'Grenoble INP - Ensimag', 'LabEx PERSYVAL-Lab', 'government', 'PERSYVAL-Lab Master Fellowship in Embedded Software & VLSI', 'full', '2027-02-15', ['Embedded Systems', 'VLSI & Microelectronics'], '€8,000/year living grant + waiver of French national fees'),
  createOpportunity(111, 'long_tail', 'Canada', 'Concordia University', 'Gina Cody School of Engineering and Computer Science', 'university', 'Gina Cody Graduate Scholarship in Information Systems Security', 'partial', '2026-12-01', ['Cybersecurity'], 'CAD $5,000 entrance award for exceptional applicants'),
  createOpportunity(112, 'long_tail', 'Singapore', 'Singapore University of Technology and Design', 'Temasek Laboratories', 'corporate', 'Temasek Lab Robotics Master Research Sponsorship', 'full', '2027-01-10', ['Robotics', 'Embedded Systems'], 'SGD $3,000/month + full tuition + project operating funds')
];

// 4 Labeled Test Fixtures to thoroughly test negative filters:
// (indian_applicants_eligible: false, is_active: false)
export const TEST_FIXTURES: Opportunity[] = [
  {
    ...createOpportunity(901, 'long_tail', 'Germany', 'Bavarian Research Center', 'Bavarian State Fund', 'government', '[TEST FIXTURE] EU-Only Domestic Grant in Cyber Systems', 'full', '2026-12-30', ['Cybersecurity'], '€800/month for domestic EU applicants only', true),
    indian_applicants_eligible: false, // Negative filter test
    is_active: true,
  },
  {
    ...createOpportunity(902, 'long_tail', 'United States', 'Midwest Regional Foundation', 'Midwest Council', 'foundation', '[TEST FIXTURE] US Resident Scholarship in Cloud Computing', 'partial', '2026-11-20', ['Cloud Computing'], 'US in-state residents only', true),
    indian_applicants_eligible: false, // Negative filter test
    is_active: false, // Inactive test
  },
  {
    ...createOpportunity(903, 'well_known', 'United Kingdom', 'Decommissioned Trust Fund', 'Legacy Trust', 'foundation', '[TEST FIXTURE] Archived Legacy Master Bursary in Robotics', 'stipend_only', '2026-10-15', ['Robotics'], 'Discontinued grant for test verification', true),
    indian_applicants_eligible: true,
    is_active: false, // Inactive test
  },
  {
    ...createOpportunity(904, 'long_tail', 'Canada', 'Provincial Reserve', 'Ontario Regional Board', 'government', '[TEST FIXTURE] Inactive Regional Bursary in Embedded Systems', 'tuition_waiver', null, ['Embedded Systems'], 'Inactive status verification record', true),
    indian_applicants_eligible: false, // Both negative
    is_active: false,
  }
];
