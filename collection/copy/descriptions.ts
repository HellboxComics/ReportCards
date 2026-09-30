/**
 * Templates for each token's "permanent record" blurb, plus collection-level
 * copy, the unrevealed placeholder, and principal's-office one-liners.
 *
 * A blurb is 3-4 sentences, picked with the token's seeded PRNG:
 *   1. OPENERS                                          (always)
 *   2. subject line                                     (always)
 *        HONOR ROLL / VALEDICTORIAN -> BEST_SUBJECT_LINES[bestSubject]
 *        worst subject graded "I"   -> INCOMPLETE_LINES
 *        otherwise                  -> WORST_SUBJECT_LINES[worstSubject]
 *   3. incident !== NONE -> INCIDENT_LINES[incident]    (else DETAIL_LINES)
 *   4. STATUS_CLOSERS[status]                           (always)
 *   Optional: GPA_LINES instead of step 3 on ~1 in 4 incident-free cards.
 *
 * "Worst subject" = the subject that hurts academic standing most: the
 * highest-graded vice subject or the lowest-graded virtue subject.
 * "Best subject" = the reverse. Ties break in SUBJECT_COPY order.
 */

/** Every placeholder a template may use. */
export type BlurbVar =
  | "student" //       "Student #0417"
  | "studentId" //     "STUDENT ID #0417"
  | "school" //        school phrase, e.g. "Mt. Rugmore Junior High", "summer school"
  | "semester" //      "Fall 1994"
  | "paper" //         paper phrase, e.g. "tractor-feed dot-matrix paper"
  | "background" //    background phrase, e.g. "the gym floor"
  | "status" //        stamp text, e.g. "ACADEMIC PROBATION"
  | "subject" //       subject name for the line, e.g. "Taking Profit"
  | "grade" //         "F"
  | "aGrade" //        "an F" (see aGrade())
  | "gpa" //           "1.37"
  | "stain" //         stain phrase
  | "doodle" //        doodle phrase
  | "signature" //     signature phrase
  | "penMarks" //      pen-marks phrase
  | "comment"; //      the Teacher Comment text, verbatim

export type BlurbVars = Partial<Record<BlurbVar, string>>;

/** Replace {var} placeholders. Throws on a missing var so bad templates fail loudly. */
export function fill(template: string, vars: BlurbVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key as BlurbVar];
    if (v === undefined) throw new Error(`template var {${key}} missing in: ${template}`);
    return v;
  });
}

/** "an A+", "an F", "an I", "a B-", "a C", "a D+". */
export function aGrade(grade: string): string {
  return /^[AEFIO]/.test(grade) ? `an ${grade}` : `a ${grade}`;
}

/** Capitalize the first letter (for phrases that start a sentence). */
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------
// 1. Openers
// ---------------------------------------------------------------------------

export const OPENERS: readonly string[] = [
  "{student} attended {school} in {semester} and made it everyone's problem.",
  "Recovered from the bottom of a backpack, under a banana from {semester}: the report card of {student}.",
  "This is the permanent record of {student}. It is permanent. That was always the threat.",
  "Filed in the principal's office under DO NOT HIRE: {student}, {school}, {semester}.",
  "{student} was sent home from {school} with this in {semester}. Nobody at home was ready.",
  "Exhibit A in the matter of {school} v. {student}, {semester}.",
  "Printed on {paper} and mailed home in {semester}, this card has caused three family meetings.",
  "In {semester}, {school} tried to educate {student}. {student} tried to trade.",
  "{student}'s parents asked the district to lose this one. The district said no.",
  "Found folded into a {semester} textbook nobody ever returned: the grades of {student}.",
  "Harrow graded {student} in {semester} and has not been the same since.",
  "Report card, {school}, {semester}. {studentId}. Prognosis: see below.",
  "The school does not usually send these by certified mail. For {student}, {school} made an exception.",
  "Every school has one. At {school}, in {semester}, it was {student}.",
  "Dear Parent or Guardian: enclosed are the grades of {student}. Please sit down first.",
  "{student} brought this home in {semester} and tried to pass it off as a receipt.",
  "The grades of {student} were posted in {semester}. The market reacted.",
  "{student} enrolled at {school} with lunch money and a dream. Only one made it to {semester}.",
  "Photographed as evidence on {background}: the {semester} report card of {student}.",
  "For the record, and it is a permanent record: {student}, {school}, {semester}.",
  "There is a drawer at {school} for cards like this. {student}'s is on top.",
  "Harrow uncapped a fresh red pen for {student} in {semester}. It did not survive.",
];

// ---------------------------------------------------------------------------
// 2. Subject lines
// ---------------------------------------------------------------------------

/**
 * Written for the grade that HURTS standing: high in a vice subject, low in a
 * virtue subject. Vars: {aGrade}, {grade}.
 */
export const WORST_SUBJECT_LINES: Readonly<Record<
  "buyingTheTop" | "takingProfit" | "riskManagement" | "holdingBags" | "chasingMemes" | "sellingTooEarly",
  readonly string[]
>> = {
  buyingTheTop: [
    "Earned {aGrade} in Buying the Top, which the school board has asked us to stop calling a gift.",
    "Posted {aGrade} in Buying the Top; classmates now use this student's buys as their sell signal.",
    "The {grade} in Buying the Top was earned the hard way: at the exact high, every single time.",
    "Scored {aGrade} in Buying the Top and has been asked to stop describing it as 'good timing.'",
  ],
  takingProfit: [
    "Took {aGrade} in Taking Profit; the sell button is still in its original packaging.",
    "Pulled {aGrade} in Taking Profit after riding a 50x all the way back down to the bus stop.",
    "The {grade} in Taking Profit is technically unrealized, like everything else here.",
    "Earned {aGrade} in Taking Profit, a subject the student describes as 'optional.'",
  ],
  riskManagement: [
    "Received {aGrade} in Risk Management for running with scissors, on leverage, toward the pool.",
    "Earned {aGrade} in Risk Management; the college fund is now a coin with a hamster on it.",
    "The {grade} in Risk Management was hand-delivered by the nurse, who has seen things.",
    "Got {aGrade} in Risk Management after setting slippage to 49% 'to be safe.'",
  ],
  holdingBags: [
    "Earned {aGrade} in Holding Bags; the nurse has concerns about the student's spine.",
    "Posted {aGrade} in Holding Bags with positions older than the lunch lady.",
    "The {grade} in Holding Bags reflects a locker full of tokens that died in September.",
    "Scored {aGrade} in Holding Bags and now calls it 'long-term investing.'",
  ],
  chasingMemes: [
    "Earned {aGrade} in Chasing Memes by buying anything with a cartoon animal on it.",
    "Posted {aGrade} in Chasing Memes, including a coin named after the cafeteria fish sticks.",
    "The {grade} in Chasing Memes was locked in the day the student bought a coin called $RECESS.",
    "Took {aGrade} in Chasing Memes; the classroom posters have been removed for everyone's safety.",
  ],
  sellingTooEarly: [
    "Earned {aGrade} in Selling Too Early by selling at 2x the week before it went 40x.",
    "Posted {aGrade} in Selling Too Early and left the field trip right before the good part.",
    "The {grade} in Selling Too Early is a paper-hands grade. We tried laminating the hands.",
    "Scored {aGrade} in Selling Too Early and still checks the price of the one that got away.",
  ],
};

/**
 * For HONOR ROLL / VALEDICTORIAN: the grade that HELPS standing (high virtue,
 * low vice). Vars: {aGrade}, {grade}.
 */
export const BEST_SUBJECT_LINES: typeof WORST_SUBJECT_LINES = {
  buyingTheTop: [
    "Only {aGrade} in Buying the Top: waits for dips like an adult, which the other kids find creepy.",
    "Earned {aGrade} in Buying the Top, meaning they have never once bought the top. We checked twice.",
  ],
  takingProfit: [
    "Earned {aGrade} in Taking Profit, which is illegal in several group chats.",
    "Scored {aGrade} in Taking Profit and did not post about it, which is how we know it's real.",
  ],
  riskManagement: [
    "Earned {aGrade} in Risk Management by wearing a helmet to every recess, including indoor recess.",
    "Pulled {aGrade} in Risk Management: holds stables, owns a spreadsheet, has no friends.",
  ],
  holdingBags: [
    "Only {aGrade} in Holding Bags; travels light, sleeps well, is hated by the lunch table.",
    "Earned {aGrade} in Holding Bags, having thrown out every dead position before it started to smell.",
  ],
  chasingMemes: [
    "Just {aGrade} in Chasing Memes; walked past a cartoon dog without buying it, and there were witnesses.",
    "Only {aGrade} in Chasing Memes, which makes this student the only person here who has read a whitepaper.",
  ],
  sellingTooEarly: [
    "Only {aGrade} in Selling Too Early; stayed for the whole movie, including the good part.",
    "Just {aGrade} in Selling Too Early. Held through the scary part. Did not cry. Much.",
  ],
};

/** When the worst subject is "I". Var: {subject}. */
export const INCOMPLETE_LINES: readonly string[] = [
  "{subject} came back Incomplete; the student says the assignment is 'still vesting.'",
  "{subject}: Incomplete. The work is, according to the student, 'still in the mempool.'",
  "No grade in {subject}, because the student turned in a blank page and called it a stealth launch.",
];

// ---------------------------------------------------------------------------
// 3. Incident or detail
// ---------------------------------------------------------------------------

export const INCIDENT_LINES: Readonly<Record<
  | "WHALE"
  | "RUGGED"
  | "LIQUIDATED"
  | "FIGHT_IN_CAFETERIA"
  | "HALL_PASS"
  | "CONFISCATED_NOTE"
  | "LUNCH_IOU"
  | "PERMISSION_SLIP",
  readonly string[]
>> = {
  WHALE: [
    "A gold Gifted & Talented sticker was applied after the student moved the market during snack time.",
    "The Gifted & Talented sticker on the corner means one thing: parents, hide your wallets.",
  ],
  RUGGED: [
    "A nurse's pass is taped to it: rugged, ice pack administered, sent back to class.",
    "It comes with a nurse's pass, because a developer pulled the rug and the student hit the floor.",
  ],
  LIQUIDATED: [
    "Withdrawal paperwork is clipped to the front. Reason for withdrawal: LIQUIDATED.",
    "Attached is a notice of withdrawal. Collateral has been returned to the district.",
  ],
  FIGHT_IN_CAFETERIA: [
    "A disciplinary referral is stapled on: twelve trades in one lunch period and one thrown tray.",
    "Stapled through the corner: a referral for a cafeteria fight over the market cap of a tot.",
  ],
  HALL_PASS: [
    "A hall pass is attached, signed out to the bathroom in October and never returned.",
    "Also attached: a hall pass, used once, to transfer everything to 'a friend.'",
  ],
  CONFISCATED_NOTE: [
    "Paper-clipped to it: a confiscated note reading '100x, tell no one,' passed to 31 people.",
  ],
  LUNCH_IOU: [
    "Also enclosed: a cafeteria notice for a negative lunch balance, spent entirely on gas fees.",
  ],
  PERMISSION_SLIP: [
    "Tucked underneath is a forged permission slip for a 100x leverage field trip. The bus has not returned.",
  ],
};

/** No-incident fillers. Vars: {stain} {doodle} {signature} {penMarks} {background} {comment}. */
export const DETAIL_LINES: readonly string[] = [
  "In the margin: {doodle}. At the bottom: {signature}. On everything: {stain}.",
  "It came back with {signature} and {stain}, which is more than most of this student's positions came back with.",
  "Forensics found {stain}, {doodle} and {penMarks}.",
  "Harrow's only written comment: \"{comment}\"",
  "The parent signature section contains {signature}. The district has questions.",
  "It was recovered from {background}. The custodian has declined to discuss {stain}.",
  "Harrow added {penMarks}; the student added {doodle}. Neither helped.",
  "Under a black light it shows {stain} and, faintly, {doodle}.",
];

/** Optional GPA line. First band whose max >= gpa wins. Var: {gpa}. */
export const GPA_LINES: readonly { readonly max: number; readonly lines: readonly string[] }[] = [
  { max: 0.99, lines: ["GPA: {gpa}. The decimal point is doing a lot of work.", "GPA: {gpa}, which Harrow notes is also roughly the win rate."] },
  { max: 1.99, lines: ["GPA: {gpa}, rounded up out of pity.", "GPA: {gpa}. Technically a number."] },
  { max: 2.99, lines: ["GPA: {gpa}. Solidly mid. The chart agrees.", "GPA: {gpa}, which is what the student calls 'consolidating.'"] },
  { max: 5, lines: ["GPA: {gpa}. Please stop telling the other students.", "GPA: {gpa}. Grandma has been informed. Grandma has informed everyone."] },
];

// ---------------------------------------------------------------------------
// 4. Status closers
// ---------------------------------------------------------------------------

export const STATUS_CLOSERS: Readonly<Record<
  | "HONOR ROLL"
  | "NEEDS IMPROVEMENT"
  | "ACADEMIC PROBATION"
  | "HELD BACK"
  | "SUSPENDED"
  | "EXPELLED"
  | "MOST LIKELY TO BECOME EXIT LIQUIDITY"
  | "VALEDICTORIAN",
  readonly string[]
>> = {
  "HONOR ROLL": [
    "Status: HONOR ROLL. The wallet has been sent to the office for a random search.",
    "Final standing: HONOR ROLL, pending an investigation into who they're copying.",
    "HONOR ROLL. Grandma has already bought the frame.",
  ],
  "NEEDS IMPROVEMENT": [
    "Status: NEEDS IMPROVEMENT, the factory setting of the human spirit.",
    "Final standing: NEEDS IMPROVEMENT. Please see Harrow. Then please see a financial advisor.",
    "NEEDS IMPROVEMENT. Mother requested conference.",
  ],
  "ACADEMIC PROBATION": [
    "Status: ACADEMIC PROBATION. One more rug and we call home.",
    "Final standing: ACADEMIC PROBATION, which the student has already tried to leverage.",
    "ACADEMIC PROBATION. The ice is thin and the student is doing donuts on it.",
  ],
  "HELD BACK": [
    "Status: HELD BACK. See you next semester. And the one after that.",
    "Final standing: HELD BACK, repeating the grade and the exact same trade.",
    "HELD BACK. The student is now the tallest kid in class and still buying the top.",
  ],
  SUSPENDED: [
    "Status: SUSPENDED. Three days at home; traded all three.",
    "Final standing: SUSPENDED, pending a search of the student's locker and wallet.",
    "SUSPENDED. The computer lab has been notified. So has the calculator.",
  ],
  EXPELLED: [
    "Status: EXPELLED. Please collect belongings from the front office. It's one bag. It's down 98%.",
    "Final standing: EXPELLED. Do not readmit. Do not accept the same student with a different wallet.",
    "EXPELLED. The district asked Harrow to stop writing 'good riddance.' Harrow has not stopped.",
  ],
  "MOST LIKELY TO BECOME EXIT LIQUIDITY": [
    "Status: MOST LIKELY TO BECOME EXIT LIQUIDITY. The class thanks you for your service.",
    "Voted MOST LIKELY TO BECOME EXIT LIQUIDITY, unanimously, by everyone who sold to them.",
    "MOST LIKELY TO BECOME EXIT LIQUIDITY. Already has. The yearbook just made it official.",
  ],
  VALEDICTORIAN: [
    "Status: VALEDICTORIAN. Sold the top, bought the bottom, took the bus home. First one in 34 years.",
    "VALEDICTORIAN. The graduation speech was one word long, and the word was 'sell.'",
  ],
};

// ---------------------------------------------------------------------------
// Collection-level copy
// ---------------------------------------------------------------------------

export const COLLECTION = {
  name: "Report Cards",
  symbol: "GRADES",
  tagline: "Your permanent record. Onchain. Graded in red pen.",
  description:
    "3,333 report cards for the students of Robinhood Chain, graded by Harrow: a burned-out homeroom teacher " +
    "with a red pen, a fourth cup of coffee and no mercy left. Every card grades six subjects of degenerate " +
    "trading by how much you DO the thing, so an A+ in Buying the Top means you are elite at buying the top. " +
    "Then comes the stamp, anywhere from HONOR ROLL to EXPELLED to MOST LIKELY TO BECOME EXIT LIQUIDITY, and " +
    "whatever the backpack did to the paper: cafeteria gravy, forged signatures, nurse's passes, withdrawal paperwork. " +
    "33 are one-of-ones pulled from the permanent record they always threatened you with. RETURN SIGNED BY MONDAY.",
  /** Short line for the contract-level "about" or a banner. */
  about: "3,333 report cards. 33 one-of-ones. 0 students who took profit on time.",
} as const;

// ---------------------------------------------------------------------------
// Unrevealed placeholder
// ---------------------------------------------------------------------------

export const UNREVEALED = {
  /** Token name before reveal. Var: {id} = zero-padded id. */
  name: "Report Card #{id} — Grades Not Posted",
  description:
    "GRADES NOT POSTED YET. Harrow is still grading. Do not call the school. Do not email the school. " +
    "Do not have your mother call the school; she already called, and Harrow let it ring. The envelope stays " +
    "sealed until reveal. Opening it early is an automatic F.",
  /** Text that appears on the placeholder image, top to bottom. */
  image: {
    headline: "GRADES NOT POSTED YET",
    subhead: "Harrow is still grading. Do not call the school.",
    stamp: "CONFIDENTIAL",
    envelopeLines: [
      "TO THE PARENT OR GUARDIAN OF STUDENT ID #____",
      "DO NOT BEND. DO NOT OPEN. DO NOT TRADE.",
      "Opening early is an automatic F.",
    ],
    handwritten: "still grading. stop asking. — H.",
  },
  art:
    "A manila interoffice envelope with a string-and-button clasp, filling most of the square on a loud orange (#FF6A00) " +
    "background. Red CONFIDENTIAL stamp across it at an angle, a coffee ring, a red-pen scrawl. Readable at thumbnail: " +
    "GRADES NOT POSTED YET in huge block letters on a white label.",
  attributes: [
    { trait_type: "Status", value: "Grades Not Posted" },
    { trait_type: "Envelope", value: "Sealed (Smells Like Coffee)" },
  ],
} as const;

// ---------------------------------------------------------------------------
// Principal's office: PA announcements for marketing posts
// ---------------------------------------------------------------------------

export const PRINCIPAL_ONE_LINERS: readonly string[] = [
  "Good morning, students. The vending machine is not a liquidity pool. Please stop.",
  "Will the student who set the bake sale slippage to 49% please come to the office.",
  "Reminder: 'holding for the tech' is not an excuse for missing the bus.",
  "The lost and found is now mostly seed phrases. Please claim yours before the janitor does.",
  "Picture day is Tuesday. Please do not bring your chart. It will not smile.",
  "This is a fire drill. It is not a market signal. Please stop selling.",
  "Parents: if your child says 'gm' at dinner, it is already too late.",
  "Report cards go home Friday. Forged signatures will also be graded.",
  "The cafeteria no longer accepts memecoins for tots. We are still holding the last batch.",
  "Will the student who launched $HOMEWORK please report to the office. Bring the liquidity.",
  "Today's lunch is sloppy joes. Today's market is also sloppy joes.",
  "Bus 7 is running late. The driver is waiting for a retest.",
  "The nurse cannot treat being down bad. Please stop asking the nurse.",
  "Lunch money is not collateral. We cannot stress this enough. Several of you are hungry.",
  "Yearbook superlatives are in. Most Likely To Become Exit Liquidity won in a landslide. Again.",
  "The field trip to the moon has been canceled due to low volume.",
  "Snow day tomorrow. The school is closed. The chart is not. Good luck.",
  "Your permanent record is permanent. It's onchain now. We told you.",
  "Please stop sending the principal messages that begin with 'ser.'",
  "Spelling bee results: the final word was 'liquidation.' Three finalists fainted.",
  "A reminder that a parent's disappointment is unrealized until they sign.",
  "Will the owner of the wallet ending in DEAD please come get it. It's blocking the fire lane.",
  "The honor roll has been posted outside the office. It fits on one sticky note.",
  "Math reminder: down 90% and then up 90% is not breakeven. Please see Harrow.",
  "The Gifted & Talented program is now accepting whales. Please do not splash in the hallway.",
  "Tomorrow's assembly: Just Say No To 100x Leverage. Attendance mandatory. Leverage is not.",
  "Detention is now 44 days, the same length as a semester. That is not a coincidence. It is a threat.",
];
