/**
 * Every trait value in every layer: marketplace name, one-line joke, suggested
 * tier, conditions, a noun phrase for description templates, and an art brief.
 *
 * Layers stack bottom -> top in the order of LAYER_COPY. The foundation agent
 * owns final quotas (SPEC.md); tiers here are the writers' intent.
 */
import type {
  AttendanceValue,
  GradeBand,
  IncidentValue,
  LetterGrade,
  PaperValue,
  SchoolValue,
  SeasonValue,
  StatusKey,
  StatusValue,
  SubjectCopy,
  SubjectKey,
  Tier,
  TokenTier,
  TraitValue,
} from "./types";

// ---------------------------------------------------------------------------
// Simple template helpers
// ---------------------------------------------------------------------------

export const MAX_SUPPLY = 3333;

/** "0417" */
export const pad4 = (id: number): string => String(id).padStart(4, "0");
/** "STUDENT ID #0417" — what prints on the card. */
export const studentId = (id: number): string => `STUDENT ID #${pad4(id)}`;
/** "Student #0417" — for sentences. */
export const studentLabel = (id: number): string => `Student #${pad4(id)}`;
/** "Fall 1994" — the Semester attribute value. */
export const semesterName = (season: SeasonValue, year: number): string => `${season.name} ${year}`;
/** "FALL 1994" — as printed. */
export const semesterPrinted = (season: SeasonValue, year: number): string =>
  `${season.printed} ${year}`;

// ---------------------------------------------------------------------------
// Layers, tiers, grades
// ---------------------------------------------------------------------------

export const LAYER_COPY = [
  { key: "background", traitType: "Background", joke: "Where the card was found. Every surface in a school is sticky." },
  { key: "paper", traitType: "Paper", joke: "What the office printed it on. Sets the year and the smell." },
  { key: "school", traitType: "School", joke: "Fictional institutions of lower learning. Accreditation pending." },
  { key: "semester", traitType: "Semester", joke: "Season plus the year the printer gives away. Summer means summer school. There is no other kind." },
  { key: "grades", traitType: "(one per subject)", joke: "Six subjects, graded in red, by how much you DO the thing. An A+ in Buying the Top is not a compliment." },
  { key: "attendance", traitType: "Attendance", joke: "Days present. Does not measure whether you should have been." },
  { key: "comment", traitType: "Teacher Comment", joke: "Harrow, in red pen, 90 characters max, because Harrow's hand cramps and Harrow's patience ended in 1994." },
  { key: "penMarks", traitType: "Pen Marks", joke: "Harrow's red ink, applied with feeling." },
  { key: "doodle", traitType: "Doodle", joke: "What the student drew instead of listening." },
  { key: "stain", traitType: "Stain", joke: "What the backpack, the cafeteria and the student's own body did to the card." },
  { key: "signature", traitType: "Parent Signature", joke: "RETURN SIGNED BY MONDAY. Results vary." },
  { key: "incident", traitType: "Incident", joke: "Paperwork stapled, clipped or stuck to the card by the front office." },
  { key: "status", traitType: "Status", joke: "The stamp. The verdict. The part your mother reads first." },
] as const;

export const TIER_COPY: Readonly<Record<TokenTier, string>> = {
  Common: "Sits in the middle row. Harrow can't remember the name. Honestly, a blessing.",
  Uncommon: "Gets called on in class, usually for the wrong reasons.",
  Rare: "Has a reputation in the teachers' lounge.",
  Epic: "Parents have been called. Twice. The PTA keeps a folder.",
  Legendary: "Harrow tells stories about this one at retirement parties.",
  "1 of 1": "There is only one. The district has asked that it never happen again.",
};

export const GRADE_BAND: Readonly<Record<LetterGrade, GradeBand>> = {
  "A+": "A", A: "A", "A-": "A",
  "B+": "B", B: "B", "B-": "B",
  "C+": "C", C: "C", "C-": "C",
  "D+": "D", D: "D", "D-": "D",
  F: "F",
  I: "I",
};

/** Docs flavor per letter. Remember: grades measure how much you do the thing. */
export const GRADE_COPY: Readonly<Record<LetterGrade, string>> = {
  "A+": "Elite. In a vice subject, elite at the vice. Please don't frame it.",
  A: "Excellent at the named activity. Harrow declines to say whether that's good.",
  "A-": "Almost perfect at it. So close to being a full-blown problem.",
  "B+": "Strong effort. Aimed in the wrong direction, possibly.",
  B: "Good at it. Whether 'it' is good is between you and your mother.",
  "B-": "Fine. Honestly fine. Nobody believes you.",
  "C+": "Mid, with a little extra mid on top.",
  C: "Perfectly average. Harrow has already forgotten you.",
  "C-": "Average, minus the part where you tried.",
  "D+": "Technically passing. Technically.",
  D: "The letter for 'did it, badly.'",
  "D-": "Harrow wanted to give an F and ran out of energy.",
  F: "The only letter Harrow enjoys writing. Circled free of charge.",
  I: "Incomplete. Did not turn in work. Says it's 'still vesting.'",
};

/** The six subjects keep the app's names. Remarks feed the REMARKS column. */
export const SUBJECT_COPY: Readonly<Record<SubjectKey, SubjectCopy>> = {
  buyingTheTop: {
    name: "Buying the Top",
    vice: true,
    joke: "How precisely you buy the exact high. An A+ is a gift. A cursed one.",
    remarks: {
      A: ["Natural talent", "Human top signal", "Buys the exact tick"],
      B: ["Gifted, sadly", "Nearly the top"],
      C: ["Buys the shoulder", "Mid-candle entries"],
      D: ["Occasionally early", "Rarely at the top"],
      F: ["Never buys the top", "Suspiciously patient"],
      I: ["Did not turn in work", "Waiting for a dip"],
    },
  },
  takingProfit: {
    name: "Taking Profit",
    vice: false,
    joke: "Whether you ever pressed sell while green. Screenshots do not count.",
    remarks: {
      A: ["Knows when to leave", "Actually sold"],
      B: ["Leaves most parties", "Sells some, cries some"],
      C: ["Sold once, felt weird"],
      D: ["Forgot to sell", "Screenshots only"],
      F: ["Has never left", "Sell button untouched"],
      I: ["Did not turn in work", "Says it's vesting"],
    },
  },
  riskManagement: {
    name: "Risk Management",
    vice: false,
    joke: "Helmets, stables, and not putting the college fund into a hamster coin.",
    remarks: {
      A: ["Wears a helmet", "Owns a spreadsheet"],
      B: ["Mostly wears a helmet"],
      C: ["Helmet, no chinstrap"],
      D: ["Runs with scissors"],
      F: ["Juggles scissors", "Leverage for breakfast"],
      I: ["Did not turn in work"],
    },
  },
  holdingBags: {
    name: "Holding Bags",
    vice: true,
    joke: "How much of the portfolio is down 40%+ and now called 'long-term.'",
    remarks: {
      A: ["Strong back", "Bag collector"],
      B: ["Carries several bags"],
      C: ["One bag, emotionally"],
      D: ["Travels light-ish"],
      F: ["Travels light", "Owns no bags"],
      I: ["Did not turn in work"],
    },
  },
  chasingMemes: {
    name: "Chasing Memes",
    vice: true,
    joke: "Share of buys whose entire business plan is a cartoon animal.",
    remarks: {
      A: ["Easily distracted", "Bought the dog again"],
      B: ["Distracted by animals"],
      C: ["Meme-curious"],
      D: ["Mostly pays attention"],
      F: ["Pays attention", "Immune to cartoon dogs"],
      I: ["Did not turn in work"],
    },
  },
  sellingTooEarly: {
    name: "Selling Too Early",
    vice: true,
    joke: "How often you sold right before it ran 30%. Paper hands, graded.",
    remarks: {
      A: ["Leaves before dessert", "Sold at 2x, it 40x'd"],
      B: ["Leaves at intermission"],
      C: ["Sometimes stays"],
      D: ["Stays for the ending"],
      F: ["Stays through credits"],
      I: ["Did not turn in work"],
    },
  },
};

// ---------------------------------------------------------------------------
// 1. Background — LOUD, saturated, and visually distinct from each other.
// ---------------------------------------------------------------------------

export const BACKGROUNDS = [
  {
    id: "bus-7",
    name: "Bus 7 (Late Again)",
    tier: "Common",
    joke: "School-bus yellow. The driver is 'waiting for a retest.'",
    phrase: "the floor of Bus 7",
    art: "Flat #FFC400 school-bus yellow, black bumper stripes along the bottom, 'BUS 7' stenciled huge in black and cropped by the canvas edge.",
  },
  {
    id: "locker-wall",
    name: "Locker Wall (Combo Forgotten)",
    tier: "Common",
    joke: "Painted the exact blue of a school district that lost the levy vote.",
    phrase: "a row of dented hallway lockers",
    art: "Royal blue (#1646FF) lockers edge to edge: vent slots, dents, number plates 1987-1991, one door ajar with a sock hanging out.",
  },
  {
    id: "carved-desk",
    name: "Desk Carved 'WAGMI'",
    tier: "Common",
    joke: "Someone carved WAGMI into it in 1996. They were wrong.",
    phrase: "a desk someone carved WAGMI into",
    art: "Top-down orange laminate wood grain (#E8742A / #B8501A), WAGMI gouged in deep, a pencil groove, one gray wad of gum.",
  },
  {
    id: "cafeteria-tray",
    name: "Cafeteria Tray (Mystery Slot)",
    tier: "Common",
    joke: "Five compartments. One is gravy. None are food.",
    phrase: "a cafeteria tray",
    art: "Top-down molded turquoise tray (#12C6B5), five compartments; tots and a puddle of beige gravy peek out from under the card.",
  },
  {
    id: "chalkboard",
    name: "Chalkboard (Chart Never Erased)",
    tier: "Common",
    joke: "Harrow drew the chart on Monday. By Friday nobody had the heart to erase it.",
    phrase: "the chalk tray of a chalkboard",
    art: "Saturated board green (#1F8F4E), half-erased chalk: a line chart falling off a cliff, 'DUE MONDAY', a chalk tray with one nub.",
  },
  {
    id: "gym-floor",
    name: "Gym Floor (Dodgeball Zone)",
    tier: "Common",
    joke: "Varnished maple and the faint echo of a kid getting headshot in 1993.",
    phrase: "the gym floor",
    art: "Glossy honey floorboards (#F4A81D), red and blue court lines crossing, a half-circle, a deflated red rubber ball in a corner.",
  },
  {
    id: "detention-room",
    name: "Detention Room (Again)",
    tier: "Uncommon",
    joke: "Speckled linoleum, a clock that runs slow, a HANG IN THERE poster. You didn't.",
    phrase: "the detention room floor",
    art: "Seafoam speckled linoleum (#5FF2C2) with scuffs; corner of a poster reading HANG IN THERE showing a stick figure dangling from a red candle.",
  },
  {
    id: "principals-carpet",
    name: "Principal's Carpet (Seen Things)",
    tier: "Uncommon",
    joke: "Purple-and-teal confetti carpet. Every expelled child has stared at it.",
    phrase: "the principal's carpet",
    art: "90s commercial carpet: deep purple (#5B1FA8) with teal, magenta and yellow squiggles and triangles, worn into a path toward the desk.",
  },
  {
    id: "picture-day-lasers",
    name: "Picture Day Lasers",
    tier: "Uncommon",
    joke: "The 1993 portrait backdrop. You were told to smile. The chart didn't.",
    phrase: "a picture-day laser backdrop",
    art: "Blue-black gradient with neon magenta (#FF2BD6) and cyan (#18E5FF) laser beams crisscrossing, a few star glints.",
  },
  {
    id: "bathroom-stall",
    name: "Bathroom Stall (Graffiti)",
    tier: "Uncommon",
    joke: "Salmon-pink stall. 'BUY HIGH SELL LOWER' in marker. Better alpha than most group chats.",
    phrase: "a bathroom stall wall",
    art: "Salmon painted steel (#FF7F6E), rivets, marker graffiti: 'BUY HIGH SELL LOWER', 'NGMI', a heart with 'BAGS 4EVER', tally marks.",
  },
  {
    id: "sticker-bombed-desk",
    name: "Sticker-Bombed Desk",
    tier: "Rare",
    joke: "Covered in stickers from projects that no longer exist. A museum of rugs.",
    phrase: "a desk plastered in stickers from dead projects",
    art: "Dense overlapping neon stickers: rockets, '100X', 'TO THE MOON', smileys, 'HODL', a cartoon hamster, 'NOT FINANCIAL ADVICE'. All fictional.",
  },
  {
    id: "overhead-projector",
    name: "Overhead Projector (Left On)",
    tier: "Rare",
    joke: "Somebody left the projector on. The chart is burned into the wall.",
    phrase: "an overhead projector that was left on",
    art: "Dark navy room (#0B1030), a blown-out warm-white trapezoid of projector light behind the card, dust in the beam, a ghostly red chart.",
  },
  {
    id: "green-candle-floor",
    name: "Green Candle Trading Floor",
    tier: "Epic",
    joke: "Every candle green. Every screen up. Obviously a dream. Harrow will wake you.",
    phrase: "a trading floor where every candle is green",
    art: "Near-black (#050A05) with towering neon-green (#18FF6D) candlesticks rising off the top edge, confetti, bloom glow.",
  },
  {
    id: "liquidation-red",
    name: "Liquidation Red",
    tier: "Legendary",
    joke: "Solid emergency red. The last color you see before the withdrawal paperwork.",
    phrase: "a wall of liquidation red",
    when: { status: ["EXPELLED"] },
    art: "Flat alarm red (#FF1A1A), faint diagonal repeating 'LIQUIDATED' watermark, a siren glow in each corner.",
  },
] as const satisfies readonly TraitValue[];

// ---------------------------------------------------------------------------
// 2. Paper / era — sets the printed year.
// ---------------------------------------------------------------------------

export const PAPERS = [
  {
    key: "1994-dot-matrix",
    id: "1994-dot-matrix",
    name: "1994 Dot Matrix",
    year: 1994,
    tier: "Common",
    joke: "Tractor-feed holes still attached. The printer screamed the whole time. So did your mother.",
    phrase: "tractor-feed dot-matrix paper",
    art: "Green-bar continuous paper with perforated tractor-feed strips down both sides, blocky 9-pin type, faint ribbon streaks.",
  },
  {
    key: "1999-office-laser",
    id: "1999-office-laser",
    name: "1999 Office Laser (Y2K Ready)",
    year: 1999,
    tier: "Common",
    joke: "Printed the week everyone thought the computers would die. The computers lived. The portfolio did not.",
    phrase: "crisp 1999 office laser paper",
    art: "Bright white bond, clean serif type, a toner streak down one side, a tiny 'Y2K COMPLIANT' footer.",
  },
  {
    key: "1987-carbon",
    id: "1987-carbon",
    name: "1987 Carbon Copy (Pink)",
    year: 1987,
    tier: "Uncommon",
    joke: "White copy to the permanent record, yellow to the office, pink to your mother. She did not frame it.",
    phrase: "the pink carbon copy",
    art: "Pale pink (#FFC8D8) thin carbonless sheet, slightly smeared blue-black carbon type, pressure-dented handwriting.",
  },
  {
    key: "2004-inkjet",
    id: "2004-inkjet",
    name: "2004 Inkjet (Out Of Cyan)",
    year: 2004,
    tier: "Uncommon",
    joke: "Printer was out of cyan, so every green came out brown. Fitting. Nothing on this card was ever green.",
    phrase: "streaky out-of-cyan inkjet paper",
    art: "White paper with horizontal inkjet banding, colors shifted magenta/brown, one wet smear where it came out of the tray.",
  },
  {
    key: "mimeograph",
    id: "mimeograph",
    name: "Mimeograph Purple",
    year: 1982,
    tier: "Rare",
    joke: "Still damp. Still smells like solvent. Every kid sniffed it. Every single one.",
    phrase: "still-damp mimeograph purple",
    art: "Off-white newsprint, all type in bleeding violet (#6B3FA0) with soft doubled edges, faint purple thumbprints.",
  },
  {
    key: "gold-foil",
    id: "gold-foil",
    name: "Gold Foil (Fridge Tier)",
    year: 1996,
    tier: "Legendary",
    when: { status: ["HONOR ROLL", "VALEDICTORIAN"] },
    joke: "The district's one box of gold-foil stock, opened for the first time since 1996. Grandma bought two frames.",
    phrase: "embossed gold-foil certificate stock",
    art: "Heavy cream stock with an embossed metallic-gold guilloche border and a gold seal; everything else still looks like school paperwork.",
  },
] as const satisfies readonly PaperValue[];

// ---------------------------------------------------------------------------
// 3. School header — fictional, printed with a motto.
// ---------------------------------------------------------------------------

export const SCHOOLS = [
  {
    id: "public-46",
    name: "Robinhood Chain Public School 46",
    phrase: "Robinhood Chain Public School No. 46",
    printed: "ROBINHOOD CHAIN PUBLIC SCHOOL NO. 46",
    motto: "Underfunded. Overleveraged. Proud.",
    tier: "Common",
    joke: "Number 46, because the first 45 got rugged. This one has a gym.",
  },
  {
    id: "st-satoshi",
    name: "St. Satoshi of the Perpetual Dip",
    phrase: "St. Satoshi of the Perpetual Dip",
    printed: "ST. SATOSHI OF THE PERPETUAL DIP",
    motto: "Ora Et Tene (Pray And Hold)",
    tier: "Common",
    joke: "Uniforms mandatory. Confession is Fridays; bring your trade history.",
  },
  {
    id: "mt-rugmore",
    name: "Mt. Rugmore Junior High",
    phrase: "Mt. Rugmore Junior High",
    printed: "MT. RUGMORE JUNIOR HIGH SCHOOL",
    motto: "Carved In Stone. Pulled In Minutes.",
    tier: "Common",
    joke: "Four founders carved into the mountain. All four left with the treasury.",
  },
  {
    id: "bagholder-valley",
    name: "Bagholder Valley Regional High",
    phrase: "Bagholder Valley Regional High",
    printed: "BAGHOLDER VALLEY REGIONAL HIGH SCHOOL",
    motto: "Home Of The Fighting Bagholders",
    tier: "Common",
    joke: "The mascot is a duffel bag. It has been down 80% since homecoming.",
  },
  {
    id: "fomo-falls",
    name: "FOMO Falls Elementary",
    phrase: "FOMO Falls Elementary",
    printed: "FOMO FALLS ELEMENTARY SCHOOL",
    motto: "Yes, We Would Jump Off The Bridge",
    tier: "Uncommon",
    joke: "Every parent asked 'if all your friends jumped off a bridge...' Every student here said yes.",
  },
  {
    id: "leverage-heights",
    name: "Leverage Heights Middle School",
    phrase: "Leverage Heights Middle School",
    printed: "LEVERAGE HEIGHTS MIDDLE SCHOOL",
    motto: "Borrowed Land. Borrowed Time.",
    tier: "Uncommon",
    joke: "The building is on 20x margin. Fire drills are liquidation drills.",
  },
  {
    id: "paper-hands-prep",
    name: "Paper Hands Preparatory Academy",
    phrase: "Paper Hands Preparatory Academy",
    printed: "PAPER HANDS PREPARATORY ACADEMY",
    motto: "Leave Early. Leave Often.",
    tier: "Uncommon",
    joke: "Elite prep school. Every graduate left the ceremony before their name was called.",
  },
  {
    id: "summer-school",
    name: "Summer School (Remedial Finance)",
    phrase: "summer school",
    printed: "SUMMER SCHOOL — REMEDIAL FINANCE",
    motto: "You Again.",
    tier: "Uncommon",
    when: { season: ["SUMMER"] },
    joke: "For students who failed the regular year and the regular market.",
  },
  {
    id: "exit-liquidity-charter",
    name: "Exit Liquidity Charter Academy",
    phrase: "Exit Liquidity Charter Academy",
    printed: "EXIT LIQUIDITY CHARTER ACADEMY",
    motto: "We Buy What You're Selling.",
    tier: "Rare",
    joke: "A charter school funded entirely by students on their way out. Tuition is due at the top.",
  },
  {
    id: "wen-moon-votech",
    name: "Wen Moon Vocational & Technical",
    phrase: "Wen Moon Vocational & Technical",
    printed: "WEN MOON VOCATIONAL & TECHNICAL SCHOOL",
    motto: "Learn A Trade. One Trade. Repeatedly.",
    tier: "Rare",
    joke: "Teaches a trade. One trade. At the top. Forever.",
  },
  {
    id: "detention-office",
    name: "Office of Student Discipline",
    phrase: "the Office of Student Discipline",
    printed: "OFFICE OF STUDENT DISCIPLINE — DETENTION FORM",
    motto: "This Is Going On Your Record.",
    tier: "Rare",
    when: { status: ["SUSPENDED"] },
    joke: "Less a report card than a police report with a lunch menu on the back.",
  },
  {
    id: "diamond-hands-magnet",
    name: "Diamond Hands Magnet School",
    phrase: "the Diamond Hands Magnet School for the Gifted",
    printed: "DIAMOND HANDS MAGNET SCHOOL FOR THE GIFTED",
    motto: "Nobody Sells. Nobody Graduates.",
    tier: "Epic",
    joke: "Students are taught to hold everything: pencils, grudges, tokens that died in the fourth grade.",
  },
] as const satisfies readonly SchoolValue[];

// ---------------------------------------------------------------------------
// 4. Semester — season + the paper's year. SUMMER <=> summer-school.
// ---------------------------------------------------------------------------

export const SEASONS = [
  { key: "FALL", id: "fall", name: "Fall", printed: "FALL", tier: "Common", joke: "Back to school. Back to buying the top." },
  { key: "WINTER", id: "winter", name: "Winter", printed: "WINTER", tier: "Common", joke: "Snow days close the school, not the chart." },
  { key: "SPRING", id: "spring", name: "Spring", printed: "SPRING", tier: "Common", joke: "Spring break. Spring broke." },
  {
    key: "SUMMER",
    id: "summer",
    name: "Summer",
    printed: "SUMMER",
    tier: "Uncommon",
    when: { school: ["summer-school"] },
    joke: "Summer school. Everyone here failed something, and it was usually money.",
  },
] as const satisfies readonly SeasonValue[];

// ---------------------------------------------------------------------------
// 6. Attendance — app labels print; the funny names are the attribute values.
// ---------------------------------------------------------------------------

export const ATTENDANCE = [
  {
    key: "PERFECT",
    id: "perfect",
    printed: "PERFECT",
    name: "Perfect (Never Logs Off)",
    tier: "Uncommon",
    joke: "Has not missed a single day, candle or top all semester.",
  },
  {
    key: "EXCELLENT",
    id: "excellent",
    printed: "EXCELLENT",
    name: "Excellent (Trades In Homeroom)",
    tier: "Common",
    joke: "In homeroom every morning, mostly for the free internet.",
  },
  {
    key: "SATISFACTORY",
    id: "satisfactory",
    printed: "SATISFACTORY",
    name: "Satisfactory (Body Present)",
    tier: "Common",
    joke: "Physically present. Mentally on a one-minute chart.",
  },
  {
    key: "SPOTTY",
    id: "spotty",
    printed: "SPOTTY",
    name: "Spotty (Green Days Only)",
    tier: "Common",
    joke: "Only shows up when the market is green. Has missed most of the year.",
  },
  {
    key: "CHRONICALLY ABSENT",
    id: "chronically-absent",
    printed: "CHRONICALLY ABSENT",
    name: "Chronically Absent (Chart Note)",
    tier: "Uncommon",
    joke: "Doctor's note was a screenshot of a chart. Excused, out of pity.",
  },
  {
    key: "NEVER SHOWED UP",
    id: "never-showed-up",
    printed: "NEVER SHOWED UP",
    name: "Never Showed Up (Still Rugged)",
    tier: "Rare",
    joke: "Did not attend a single class. Still somehow lost money.",
  },
] as const satisfies readonly AttendanceValue[];

// ---------------------------------------------------------------------------
// 8. Pen Marks — Harrow's red ink.
// ---------------------------------------------------------------------------

export const PEN_MARKS = [
  {
    id: "see-me",
    name: "SEE ME",
    tier: "Common",
    phrase: "a SEE ME in letters an inch tall",
    joke: "Two words. Every parent's heart rate: up 40%.",
    art: "SEE ME in huge slanted red capitals near the top right, double underline that trails off the edge.",
  },
  {
    id: "underlined-3x",
    name: "Underlined Three Times",
    tier: "Common",
    phrase: "three underlines under the worst grade",
    joke: "Underlined, underlined again, then a third time with a second pen when the first one died.",
    art: "Three red strokes under the worst grade; the third is a different red and skips where the pen ran dry.",
  },
  {
    id: "question-marks",
    name: "'?!?' In The Margin",
    tier: "Common",
    phrase: "a '?!?' in the margin",
    joke: "Harrow's complete written reaction to Chasing Memes.",
    art: "Giant '?!?' in the left margin beside Chasing Memes, pen pressed so hard the dot is a hole.",
  },
  {
    id: "flat-smiley",
    name: "Flat-Mouth Smiley",
    tier: "Common",
    phrase: "a smiley face with a flat, unsmiling mouth",
    joke: "A smiley face whose mouth is a straight line. You know exactly what you did.",
    art: "Circle face, two dot eyes, a dead-straight mouth line, drawn next to the status stamp.",
  },
  {
    id: "circled-f",
    name: "Circled F (Tore The Paper)",
    tier: "Common",
    when: { anyGrade: ["F"] },
    phrase: "an F circled so hard the pen went through",
    joke: "Circled so hard the pen went through to the desk. Harrow is at peace.",
    art: "Several frantic red loops around an F grade, a torn slit in the paper along one loop.",
  },
  {
    id: "arrow-why",
    name: "Arrow To 'WHY'",
    tier: "Uncommon",
    when: { high: ["buyingTheTop"] },
    phrase: "a red arrow from Buying the Top to the word WHY",
    joke: "A long red arrow from Buying the Top to one word: WHY. Underlined. No answer was given.",
    art: "Curving red arrow from the Buying the Top grade into the margin ending at 'WHY' underlined twice.",
  },
  {
    id: "ngmi",
    name: "'NGMI' In The Margin",
    tier: "Uncommon",
    phrase: "the letters NGMI in the margin",
    joke: "Harrow learned one crypto word, and it was this one.",
    art: "NGMI written vertically down the right margin in tidy teacher print, boxed.",
  },
  {
    id: "no-marks",
    name: "No Marks (Harrow Gave Up)",
    tier: "Uncommon",
    phrase: "not one drop of red ink, out of pure exhaustion",
    joke: "Not mercy. Exhaustion.",
    art: "Empty file (no marks). The absence is the joke.",
  },
  {
    id: "grade-changed",
    name: "Grade Changed B To F",
    tier: "Rare",
    when: { anyGrade: ["F"] },
    phrase: "a B crossed out and rewritten as an F",
    joke: "It was a B. Then Harrow checked the wallet again.",
    art: "A printed B struck through with one hard red line, a big handwritten F beside it, initialed 'H.'",
  },
  {
    id: "pen-exploded",
    name: "Red Pen Exploded",
    tier: "Rare",
    phrase: "a red pen that exploded mid-comment",
    joke: "The pen gave up before Harrow did. Barely.",
    art: "A red ink burst with splatter and drips across the comment box, a cracked pen cap in the blot.",
  },
  {
    id: "gold-star",
    name: "Gold Star (Double-Checked)",
    tier: "Epic",
    when: { status: ["HONOR ROLL", "VALEDICTORIAN"] },
    phrase: "one gold star, double-checked",
    joke: "One gold star. Harrow checked the sticker sheet twice to make sure it wasn't a mistake.",
    art: "One shiny foil gold star sticker, slightly crooked, with a tiny red '?' next to it.",
  },
  {
    id: "hearts",
    name: "Hearts Around The A+",
    tier: "Legendary",
    when: { status: ["VALEDICTORIAN"] },
    phrase: "hand-drawn hearts around the A+",
    joke: "Harrow has never drawn a heart. Harrow drew four.",
    art: "Four small wobbly red hearts around the Taking Profit A+.",
  },
] as const satisfies readonly TraitValue[];

// ---------------------------------------------------------------------------
// 9. Doodles — what the student drew instead of listening.
// ---------------------------------------------------------------------------

export const DOODLES = [
  {
    id: "rocket",
    name: "Rocket To The Moon",
    tier: "Common",
    phrase: "a rocket ship headed for the moon",
    joke: "Drawn in every class since September. The rocket has never landed.",
    art: "Ballpoint-blue rocket with flame scribble aimed at a crescent moon in the top margin.",
  },
  {
    id: "chart-up",
    name: "Chart Only Goes Up",
    tier: "Common",
    phrase: "a chart that only goes up",
    joke: "A line that goes up and off the page. The most fictional thing in the building.",
    art: "Pencil line chart shooting diagonally up and off the paper edge, arrowhead missing.",
  },
  {
    id: "hodl-letters",
    name: "'HODL' Bubble Letters",
    tier: "Common",
    phrase: "'HODL' in shaded 3D bubble letters",
    joke: "Took 45 minutes to shade. The only assignment completed all semester.",
    art: "HODL in fat 3D bubble letters with cross-hatch shading, bottom margin.",
  },
  {
    id: "cube",
    name: "The Cube (Mandatory)",
    tier: "Common",
    phrase: "the 3D cube every kid draws",
    joke: "Every kid drew it. It holds exactly as much value as the portfolio.",
    art: "Two overlapping squares joined at the corners, traced over many times.",
  },
  {
    id: "cool-s",
    name: "The S (You Know The One)",
    tier: "Uncommon",
    phrase: "the pointy S every kid in America draws",
    joke: "Nobody knows who invented it. Everyone drew it. Harrow drew it in 1974.",
    art: "The classic six-line pointy block S, inked heavy.",
  },
  {
    id: "diamond-hands",
    name: "Diamond Hands (Six Fingers)",
    tier: "Uncommon",
    phrase: "a pair of diamond hands with six fingers each",
    joke: "Anatomically incorrect. Emotionally accurate.",
    art: "Two faceted diamond-shaped hands with six fingers each, sparkle marks.",
  },
  {
    id: "laser-eyes",
    name: "Laser Eyes Self-Portrait",
    tier: "Uncommon",
    phrase: "a self-portrait with laser eyes",
    joke: "Laser eyes, historically a perfect top signal. Dated the day of the top.",
    art: "Stick-figure head with two red laser beams from the eyes, a date scribbled under it.",
  },
  {
    id: "crying-stick",
    name: "Crying Stick Figure ('ME')",
    tier: "Uncommon",
    phrase: "a crying stick figure labeled 'ME'",
    joke: "Labeled with an arrow. The most honest line on the card.",
    art: "Stick figure with fountain tears, arrow pointing to it, labeled ME.",
  },
  {
    id: "dream-car",
    name: "Dream Car (Three Wheels)",
    tier: "Uncommon",
    phrase: "a three-wheeled dream car with a giant spoiler",
    joke: "Drawn from memory of a poster. Three wheels. A spoiler the size of a door.",
    art: "Wedge-shaped sports car with only three wheels visible and an enormous spoiler, speed lines.",
  },
  {
    id: "none",
    name: "None (Paid Attention?)",
    tier: "Uncommon",
    phrase: "no doodles whatsoever, for once",
    joke: "Not a single doodle. Either paid attention or was trading the entire time.",
    art: "Empty file (no doodle).",
  },
  {
    id: "yacht",
    name: "Yacht ('ME IN 2 WEEKS')",
    tier: "Rare",
    phrase: "a stick figure on a yacht captioned 'ME IN 2 WEEKS'",
    joke: "Captioned 'ME IN 2 WEEKS.' It has been two years.",
    art: "Stick figure in sunglasses on a yacht with a flag, caption ME IN 2 WEEKS.",
  },
  {
    id: "wen-moon-lines",
    name: "'WEN MOON' Written 40 Times",
    tier: "Rare",
    phrase: "'WEN MOON' written forty times like detention lines",
    joke: "Written forty times like detention lines. Nobody assigned it.",
    art: "Column of tiny repeated WEN MOON lines down the margin, getting sloppier.",
  },
  {
    id: "liq-math",
    name: "Liquidation Price Math",
    tier: "Rare",
    when: { low: ["riskManagement"] },
    phrase: "long division trying to find a liquidation price",
    joke: "Long division in the margin to find the liquidation price. Got it wrong. Found it anyway.",
    art: "Messy long-division bracket with crossed-out numbers, 'LIQ = ??' circled.",
  },
  {
    id: "harrow-horns",
    name: "Harrow With Devil Horns",
    tier: "Rare",
    phrase: "a portrait of Harrow with devil horns",
    joke: "Artistic. Accurate. Confiscated, then quietly framed in the teachers' lounge.",
    art: "Caricature of a stern teacher with bun and glasses, devil horns and a pitchfork shaped like a red pen, labeled HARROW.",
  },
] as const satisfies readonly TraitValue[];

// ---------------------------------------------------------------------------
// 10. Stain / Wear — what the world did to the card.
// ---------------------------------------------------------------------------

export const STAINS = [
  {
    id: "coffee-ring",
    name: "Coffee Ring (Harrow's)",
    tier: "Common",
    phrase: "a coffee ring from Harrow's fourth cup",
    joke: "Harrow's fourth cup of the morning. The paper absorbed more than the student did.",
    art: "Brown ring with darker rim and a drip tail, overlapping the grades table.",
  },
  {
    id: "cafeteria-gravy",
    name: "Mystery Cafeteria Gravy",
    tier: "Common",
    phrase: "a smear of mystery cafeteria gravy",
    joke: "Beige, glossy, scientifically unidentified. Tastes like a Tuesday.",
    art: "Glossy tan smear with a fingerprint in it, bottom corner.",
  },
  {
    id: "chocolate-milk",
    name: "Chocolate Milk Leak",
    tier: "Common",
    phrase: "a chocolate milk leak",
    joke: "The carton burst in the backpack. The backpack never recovered. Neither did the card.",
    art: "Wavy brown tide line across the bottom third with warping.",
  },
  {
    id: "folded-eighths",
    name: "Folded Into Eighths",
    tier: "Common",
    phrase: "creases from being folded into eighths and hidden in a sock",
    joke: "Folded into eighths and hidden in a sock drawer. Found by a parent doing laundry.",
    art: "Crisp grid of fold creases with worn white lines at the intersections.",
  },
  {
    id: "grape-juice",
    name: "Grape Juice Box Explosion",
    tier: "Uncommon",
    phrase: "a grape juice box explosion",
    joke: "Squeezed the juice box during a red candle. Purple everywhere. No survivors.",
    art: "Violet splatter with a straw-shaped splash, drips toward the bottom.",
  },
  {
    id: "pizza-grease",
    name: "Square Pizza Grease",
    tier: "Uncommon",
    phrase: "a translucent square-pizza grease spot",
    joke: "Friday pizza spot. You can read the grade right through it, which is worse.",
    art: "Translucent square-ish grease blot making the paper see-through over one grade.",
  },
  {
    id: "tears",
    name: "Tear Stains (Dried)",
    tier: "Uncommon",
    phrase: "dried tear stains",
    joke: "Crinkled drops. Could be tears. Could be sweat. Lab results say both.",
    art: "Five or six puckered round drop marks with slightly bled ink beneath.",
  },
  {
    id: "shoe-print",
    name: "Hallway Shoe Print",
    tier: "Uncommon",
    phrase: "a hallway shoe print",
    joke: "Dropped in the hallway. Stepped on by 400 kids. Not one picked it up. They knew.",
    art: "Gray sneaker tread print diagonally across the card.",
  },
  {
    id: "booger",
    name: "Booger (Fresh-ish)",
    tier: "Rare",
    phrase: "a booger of unknown vintage",
    joke: "Wiped on the corner during the grade reveal. A power move, honestly.",
    art: "Small glossy green-yellow smear on the lower corner with a shine highlight.",
  },
  {
    id: "nosebleed",
    name: "Nosebleed (Watched It Dump)",
    tier: "Rare",
    phrase: "a nosebleed from watching the chart dump",
    joke: "Watched a 90% candle during math class. The body responded.",
    art: "A few dark-red drops and one smear near the grades.",
  },
  {
    id: "ketchup",
    name: "Ketchup (Hopefully)",
    tier: "Rare",
    phrase: "a red splatter the nurse insists is ketchup",
    joke: "The nurse says ketchup. The nurse has been wrong before.",
    art: "Bright tomato-red splat with a packet-tear shape nearby.",
  },
  {
    id: "pristine",
    name: "Pristine (Never Shown To Parents)",
    tier: "Rare",
    phrase: "a suspiciously clean finish, as if no parent ever touched it",
    joke: "No folds, no stains. Went straight from the mailbox into a shoebox under the bed.",
    art: "Empty file (no stain).",
  },
  {
    id: "scorched",
    name: "Scorched (Tried To Burn It)",
    tier: "Epic",
    when: { status: ["HELD BACK", "SUSPENDED", "EXPELLED", "MOST LIKELY TO BECOME EXIT LIQUIDITY"] },
    phrase: "scorch marks from a failed attempt to burn it",
    joke: "Tried to burn it in the bathroom sink. Set off the fire alarm. The card survived. So did the bags.",
    art: "Blackened, curled corner with a brown singe gradient and a few ash flecks.",
  },
] as const satisfies readonly TraitValue[];

// ---------------------------------------------------------------------------
// 11. Parent Signature — RETURN SIGNED BY MONDAY.
// ---------------------------------------------------------------------------

export const SIGNATURES = [
  {
    id: "mom-cursive",
    name: "Mom (Disappointed Cursive)",
    tier: "Common",
    phrase: "Mom's disappointed cursive",
    joke: "Beautiful penmanship. You can hear the sigh.",
    art: "Elegant blue fountain-pen cursive with a long trailing sigh of a final stroke.",
  },
  {
    id: "dad-illegible",
    name: "Dad (Illegible, Furious)",
    tier: "Common",
    phrase: "Dad's furious, illegible signature",
    joke: "Pressed so hard it embossed the next three pages of the checkbook.",
    art: "Jagged black ballpoint scrawl that tears the line, heavy pressure grooves.",
  },
  {
    id: "forged-poorly",
    name: "Forged (Poorly)",
    tier: "Common",
    phrase: "a poorly forged parent signature",
    joke: "'Mom,' in the student's exact handwriting. The i is dotted with a rocket.",
    art: "Wobbly kid print reading 'Mom Parent', erased once, with a tiny rocket as an i-dot.",
  },
  {
    id: "unsigned",
    name: "Unsigned ('Pending')",
    tier: "Common",
    phrase: "no signature, which the student describes as 'pending'",
    joke: "Came back blank. The student says the signature is 'pending confirmation.'",
    art: "Empty signature line with a small pencil note 'pending' beside it.",
  },
  {
    id: "forged-crayon",
    name: "Forged (Green Crayon)",
    tier: "Uncommon",
    phrase: "'MOM' forged in green crayon",
    joke: "Signed MOM in green crayon. Green 'for good luck.'",
    art: "Waxy green crayon MOM in giant capitals, the M backwards.",
  },
  {
    id: "grandma",
    name: "Grandma (Has Questions)",
    tier: "Uncommon",
    phrase: "Grandma's signature and a note asking what a memecoin is",
    joke: "Signed, with a note: 'What is a meme coin and why is it on a report card?'",
    art: "Shaky looping cursive plus a small note in the same hand with the question.",
  },
  {
    id: "parent-also-down",
    name: "Parent Is Also Down Bad",
    tier: "Uncommon",
    phrase: "a parent's signature next to 'we'll talk later,' from a parent holding the same coin",
    joke: "Signed beside 'we'll talk about this later.' They will not. Parent holds the same coin.",
    art: "Tired signature plus 'we'll talk about this later' trailing off into a doodled red candle.",
  },
  {
    id: "signed-3am",
    name: "Signed At 3:12 AM",
    tier: "Rare",
    phrase: "a signature timestamped 3:12 AM",
    joke: "Parent was also up checking the chart. Nobody in this house sleeps.",
    art: "Signature with '3:12 AM' written next to it and a coffee drip.",
  },
  {
    id: "paw-print",
    name: "Signed By The Dog",
    tier: "Rare",
    phrase: "a muddy paw print where the parent signature should be",
    joke: "A muddy paw print. The dog is the only one in the house without bags.",
    art: "Brown muddy paw print centered on the signature line.",
  },
  {
    id: "just-gm",
    name: "Parent Wrote 'gm'",
    tier: "Rare",
    phrase: "a parent signature that just says 'gm'",
    joke: "The parent signed 'gm.' The whole family is lost.",
    art: "Lowercase 'gm' in adult cursive on the signature line.",
  },
  {
    id: "group-chat",
    name: "Signed By The Group Chat",
    tier: "Epic",
    phrase: "seventeen signatures from the group chat",
    joke: "Seventeen signatures from strangers, all saying this is fine and to keep holding.",
    art: "A crowd of tiny signatures in mixed inks crammed around the line: 'ser', 'hold', 'wagmi', 'fine'.",
  },
  {
    id: "both-parents",
    name: "Both Parents (Rare Alliance)",
    tier: "Epic",
    phrase: "both parents' signatures, the first thing they have agreed on in years",
    joke: "Divorced since the fifth grade. Reunited only to be disappointed in you.",
    art: "Two signatures in different inks, deliberately far apart on the same line.",
  },
] as const satisfies readonly TraitValue[];

// ---------------------------------------------------------------------------
// 12. Incident — paperwork attached by the front office. NONE is common.
// ---------------------------------------------------------------------------

export const INCIDENTS = [
  {
    key: "NONE",
    id: "none",
    name: "None (Allegedly)",
    tier: "Common",
    phrase: "no incidents on file",
    joke: "No incidents on file. The file is missing.",
    art: "Empty file (no attachment).",
  },
  {
    key: "RUGGED",
    id: "nurse-pass",
    name: "Nurse's Pass (Rugged)",
    tier: "Uncommon",
    when: { high: ["chasingMemes", "holdingBags"] },
    phrase: "a nurse's pass for being rugged",
    joke: "The floor was pulled out from under the student. Ice pack administered.",
    slip: {
      heading: "NURSE'S OFFICE PASS",
      lines: [
        "Complaint: floor pulled out from under student",
        "Treatment: ice pack, juice box, 'it's just a dip'",
        "Returned to class 10:42 — RN",
      ],
    },
    art: "Pale mint pass slip with a red cross, taped at an angle over the lower right, torn tape edges.",
  },
  {
    key: "FIGHT_IN_CAFETERIA",
    id: "disciplinary-referral",
    name: "Fight In Cafeteria",
    tier: "Uncommon",
    when: { notStatus: ["HONOR ROLL", "VALEDICTORIAN"] },
    phrase: "a stapled disciplinary referral for a fight in the cafeteria",
    joke: "Twelve trades in one lunch period. A tray was thrown. So was a chart.",
    slip: {
      heading: "DISCIPLINARY REFERRAL",
      lines: [
        "Incident: FIGHT IN CAFETERIA",
        "12+ trades exchanged in one lunch period",
        "A tray was thrown. So was a chart.",
        "Witnesses: entire lunch table",
      ],
    },
    art: "Yellow referral form stapled through the top-left corner with a fat silver staple, slightly crumpled.",
  },
  {
    key: "HALL_PASS",
    id: "hall-pass",
    name: "Hall Pass (Never Came Back)",
    tier: "Uncommon",
    phrase: "a hall pass signed out to the bathroom and never returned",
    joke: "Left for the bathroom. Transferred everything to 'a friend.' Never came back.",
    slip: {
      heading: "HALL PASS",
      lines: ["Destination: BATHROOM", "Time out: 9:14", "Time in: ——", "Transferred everything to 'a friend'"],
    },
    art: "Oversized wooden-paddle hall pass on a string, lying across the top edge, 'HALL PASS' burned into it.",
  },
  {
    key: "CONFISCATED_NOTE",
    id: "confiscated-note",
    name: "Confiscated Note ('100x')",
    tier: "Uncommon",
    when: { high: ["chasingMemes"] },
    phrase: "a confiscated note reading '100x, tell no one'",
    joke: "Passed to 31 people. Every one of them was told to tell no one.",
    slip: {
      heading: "CONFISCATED",
      lines: ["psst", "this one is going to 100x", "tell NO ONE", "pass it on ->"],
    },
    art: "Triangle-folded notebook paper, half unfolded, blue-lined, paper-clipped to the side edge.",
  },
  {
    key: "WHALE",
    id: "gifted-sticker",
    name: "Gifted & Talented (Whale)",
    tier: "Rare",
    phrase: "a Gifted & Talented sticker from the whale division",
    joke: "Moved the whole market during snack time. Parents, hide your wallets.",
    slip: {
      heading: "GIFTED & TALENTED",
      lines: ["WHALE DIVISION", "PARENTS: HIDE YOUR WALLETS"],
    },
    art: "Big round shiny gold foil sticker with scalloped edge and a tiny whale, slapped on the top right corner.",
  },
  {
    key: "LUNCH_IOU",
    id: "lunch-iou",
    name: "Lunch Debt (Gas Fees)",
    tier: "Rare",
    phrase: "a cafeteria notice for a negative lunch balance spent on gas fees",
    joke: "Owes the cafeteria $4.12. Lunch money went to gas fees and a coin called $TOTS.",
    slip: {
      heading: "CAFETERIA NOTICE: NEGATIVE BALANCE",
      lines: ["Balance: -$4.12", "Lunch money spent on: GAS FEES", "Student ate a ketchup packet for protein"],
    },
    art: "Half-sheet pink cafeteria notice, rubber-stamped PAST DUE, paper-clipped at the bottom.",
  },
  {
    key: "LIQUIDATED",
    id: "withdrawal-notice",
    name: "Withdrawal Notice (Liquidated)",
    tier: "Rare",
    when: { status: ["EXPELLED"], low: ["riskManagement"] },
    phrase: "withdrawal paperwork citing liquidation",
    joke: "Withdrawn from enrollment, effective immediately. Collateral returned to the district.",
    slip: {
      heading: "NOTICE OF WITHDRAWAL",
      lines: [
        "Student has been withdrawn, effective immediately",
        "Reason: LIQUIDATED",
        "Collateral has been returned to the district",
        "Do not re-enroll using a different wallet",
      ],
    },
    art: "Formal white form with a thick black border clipped over the lower half with a big black binder clip.",
  },
  {
    key: "PERMISSION_SLIP",
    id: "permission-slip",
    name: "Permission Slip (100x Field Trip)",
    tier: "Epic",
    when: { low: ["riskManagement"] },
    phrase: "a forged permission slip for a 100x leverage field trip",
    joke: "Field trip to 100x leverage. Signature forged. The bus has not come back.",
    slip: {
      heading: "FIELD TRIP PERMISSION SLIP",
      lines: ["Destination: 100x LEVERAGE", "Bus departs: now", "Bus returns: ——", "Parent/guardian: 'Mom' (green crayon)"],
    },
    art: "Goldenrod half-sheet slip with a dotted tear-off line, partially torn, tucked under the card.",
  },
] as const satisfies readonly IncidentValue[];

// ---------------------------------------------------------------------------
// 13. Status — the stamp, on top of everything.
// ---------------------------------------------------------------------------

export const STATUSES = [
  {
    key: "NEEDS IMPROVEMENT",
    id: "needs-improvement",
    name: "Needs Improvement",
    printed: "NEEDS IMPROVEMENT",
    subtext: "PLEASE SEE ME",
    tier: "Common",
    share: 0.3,
    joke: "The factory setting of the human spirit.",
    art: "Orange (#FF7A00) rectangular rubber stamp, uneven ink, rotated about -8 degrees.",
  },
  {
    key: "ACADEMIC PROBATION",
    id: "academic-probation",
    name: "Academic Probation",
    printed: "ACADEMIC PROBATION",
    subtext: "ONE MORE RUG AND WE CALL HOME",
    tier: "Common",
    share: 0.26,
    joke: "On thin ice, and currently trying to open a leveraged position on the ice.",
    art: "Red double-border rectangle stamp, heavy ink on one side.",
  },
  {
    key: "HELD BACK",
    id: "held-back",
    name: "Held Back",
    printed: "HELD BACK",
    subtext: "SEE YOU NEXT SEMESTER",
    tier: "Uncommon",
    share: 0.11,
    joke: "Repeating the grade. Also repeating the exact same trade.",
    art: "Purple (#7B2CFF) circular stamp with a curved arrow looping back on itself.",
  },
  {
    key: "MOST LIKELY TO BECOME EXIT LIQUIDITY",
    id: "exit-liquidity",
    name: "Most Likely to Become Exit Liquidity",
    printed: "MOST LIKELY TO BECOME EXIT LIQUIDITY",
    subtext: "THANK YOU FOR YOUR SERVICE",
    tier: "Uncommon",
    share: 0.12,
    joke: "Voted by the class. Unanimously. They all sold to you.",
    art: "Hot-pink (#FF1F8E) yearbook-superlative banner stamp in three stacked lines, star bursts at each end.",
  },
  {
    key: "SUSPENDED",
    id: "suspended",
    name: "Suspended",
    printed: "SUSPENDED",
    subtext: "3 DAYS — TRADED ALL 3",
    tier: "Rare",
    share: 0.08,
    joke: "Sent home for three days. Traded all three. Came back worse.",
    art: "Black-and-yellow hazard-striped rectangle stamp, crooked.",
  },
  {
    key: "EXPELLED",
    id: "expelled",
    name: "Expelled",
    printed: "EXPELLED",
    subtext: "DO NOT READMIT",
    tier: "Rare",
    share: 0.07,
    joke: "Escorted off campus by the liquidation engine and one very tired janitor.",
    art: "Massive blood-red (#E3122B) stamp at 45 degrees across the whole card, ink splatter, letters cracked.",
  },
  {
    key: "HONOR ROLL",
    id: "honor-roll",
    name: "Honor Roll",
    printed: "HONOR ROLL",
    subtext: "PLEASE FRAME. PLEASE VERIFY.",
    tier: "Epic",
    share: 0.059,
    joke: "Took profit, managed risk, went to bed on time. Currently under investigation.",
    art: "Green-and-gold (#0FA958 / #FFC400) circular seal stamp with laurel wreath and a ribbon tail.",
  },
  {
    key: "VALEDICTORIAN",
    id: "valedictorian",
    name: "Valedictorian",
    printed: "VALEDICTORIAN",
    subtext: "SOLD THE TOP. WENT HOME.",
    tier: "Legendary",
    share: 0.001,
    joke: "Graduation speech was the word 'sell' for eleven minutes. Standing ovation.",
    art: "Embossed gold foil seal with a mortarboard and tassel, radiant lines, slight holographic shimmer.",
  },
] as const satisfies readonly StatusValue[];

/** Quick lookup: status key -> copy. */
export const STATUS_BY_KEY: Readonly<Record<StatusKey, StatusValue>> = Object.fromEntries(
  STATUSES.map((s) => [s.key, s]),
) as Record<StatusKey, StatusValue>;

// Derived id unions, handy for typed layer registries.
export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];
export type PaperId = (typeof PAPERS)[number]["id"];
export type SchoolId = (typeof SCHOOLS)[number]["id"];
export type PenMarkId = (typeof PEN_MARKS)[number]["id"];
export type DoodleId = (typeof DOODLES)[number]["id"];
export type StainId = (typeof STAINS)[number]["id"];
export type SignatureId = (typeof SIGNATURES)[number]["id"];
export type IncidentId = (typeof INCIDENTS)[number]["id"];
export type StatusId = (typeof STATUSES)[number]["id"];
