/**
 * The 33 hand-composed one-of-ones. Each is its own drawing (not a layer
 * combo) with bespoke attribute values. The generator adds
 * { "1 of 1": "Yes" } and { "Rarity Tier": "1 of 1" } and places them at
 * seeded-random token ids.
 *
 * `visual` is a brief an illustrator can draw in SVG on a 2000x2000 square.
 * `thumbnail` is the single idea that must read at ~300px.
 * Palette entries are "#RRGGBB name". `text` is every string that appears.
 */
import type { SubjectKey } from "./types";

/** Attribute trait types a 1/1 fills with bespoke values (grades are separate). */
export type OneOfOneTrait =
  | "Background"
  | "Paper"
  | "School"
  | "Semester"
  | "Attendance"
  | "Teacher Comment"
  | "Pen Marks"
  | "Doodle"
  | "Stain"
  | "Parent Signature"
  | "Incident"
  | "Status";

export interface OneOfOne {
  readonly slug: string;
  readonly title: string;
  readonly lore: string;
  readonly thumbnail: string;
  readonly visual: {
    readonly composition: string;
    readonly props: readonly string[];
    readonly palette: readonly string[];
    readonly text: readonly string[];
  };
  /** Printed grade per subject. Bespoke strings allowed ("EATEN", "ASH"). */
  readonly grades: Readonly<Record<SubjectKey, string>>;
  /** Numeric GPA attribute, 0.00 - 4.33. */
  readonly gpa: number;
  readonly traits: Readonly<Record<OneOfOneTrait, string>>;
  /** Extra bespoke attributes unique to this piece. */
  readonly extra?: Readonly<Record<string, string>>;
}

export const ONE_OF_ONES: readonly OneOfOne[] = [
  // 1
  {
    slug: "the-permanent-record",
    title: "The Permanent Record",
    lore:
      "Every teacher since 1962 threatened you with it: this is going on your permanent record. Nobody ever saw it. " +
      "It exists. It is four inches thick, chained shut, and it contains every top you ever bought, including the ones " +
      "you only bought in your head. The district keeps it in a vault under the gym, next to the good dodgeballs.",
    thumbnail: "A bursting manila folder wrapped in a chain and padlock under a spotlight.",
    visual: {
      composition:
        "Centered three-quarter view of a manila folder so overstuffed that pages fan out of every side, bound with a " +
        "bicycle chain and a brass padlock. The tab reads EVERYTHING. One report card sheet slides out of the front " +
        "showing the six subjects and the grades below in red. Hard museum spotlight from above, long shadow, " +
        "a red wax seal on the chain, a staple the size of a railroad spike through the corner.",
      props: ["overstuffed manila folder", "bicycle chain", "brass padlock", "red wax seal", "giant staple", "fanned carbon sheets"],
      palette: ["#0A0A0A velvet black", "#D9A441 manila", "#E3122B red ink", "#FFF6D6 spotlight", "#B08D57 brass"],
      text: ["PERMANENT RECORD", "EVERYTHING", "THIS WILL FOLLOW YOU", "ON FILE SINCE 1962"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A+", chasingMemes: "A+", sellingTooEarly: "A+" },
    gpa: 0,
    traits: {
      Background: "Museum Vault Spotlight",
      Paper: "Carbon, Four Inches Thick",
      School: "District Archive (Sub-Basement)",
      Semester: "All Of Them",
      Attendance: "On File",
      "Teacher Comment": "This is going on your permanent record. This is it. You're looking at it.",
      "Pen Marks": "Every Mark Ever Made",
      Doodle: "Confiscated",
      Stain: "Sixty Years Of Coffee",
      "Parent Signature": "Required In Triplicate",
      Incident: "All Of Them",
      Status: "ON YOUR PERMANENT RECORD",
    },
    extra: { Artifact: "The Actual Permanent Record" },
  },
  // 2
  {
    slug: "the-dog-ate-it",
    title: "The Dog Ate It",
    lore:
      "For once, it's true. The family dog ate the report card, but only the bottom half: Holding Bags, Chasing Memes, " +
      "Selling Too Early and the parent signature. The top half, with the A+ in Buying the Top and the F in Taking " +
      "Profit, was left untouched, because even the dog didn't want that. Harrow accepted the excuse and gave the dog a B+.",
    thumbnail: "A report card with a huge bite taken out of it and a guilty dog.",
    visual: {
      composition:
        "Top-down onto a black-and-white checkerboard kitchen floor. The card lies at a slight angle; its lower half " +
        "is a huge jagged bite-shaped arc of wet shreds with tooth-puncture holes and slobber gloss. Top half intact " +
        "and legible. A scruffy brown generic mutt (floppy ears, NOT any meme breed or famous dog) sits at the right " +
        "edge, looking away guiltily, a paper scrap reading 'PROFIT' hanging from its mouth. A steel food bowl labeled " +
        "GOOD BOY in the bottom-left corner.",
      props: ["chewed report card", "brown mutt", "paper scrap in mouth", "steel dog bowl", "shreds"],
      palette: ["#111111 black tile", "#F7F7F2 white tile", "#8B5A2B dog brown", "#E3122B red grades", "#7FD8FF slobber shine"],
      text: ["BUYING THE TOP — A+", "TAKING PROFIT — F", "RISK MANAGEMENT — D-", "PROFIT (scrap in mouth)", "GOOD BOY"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D-", holdingBags: "EATEN", chasingMemes: "EATEN", sellingTooEarly: "EATEN" },
    gpa: 0.44,
    traits: {
      Background: "Checkerboard Kitchen Floor",
      Paper: "Half A Card",
      School: "Mt. Rugmore Junior High",
      Semester: "Fall 1994",
      Attendance: "Spotty (Dog: Perfect)",
      "Teacher Comment": "Excuse accepted. The dog has better judgment than the student.",
      "Pen Marks": "Eaten",
      Doodle: "Eaten",
      Stain: "Dog Slobber (Fresh)",
      "Parent Signature": "Eaten",
      Incident: "Actually Eaten By Dog",
      Status: "EXCUSE ACCEPTED",
    },
    extra: { "Dog's Grade": "B+" },
  },
  // 3
  {
    slug: "laminated-by-mom",
    title: "Laminated By Mom",
    lore:
      "Mom laminated it and put it on the fridge, between the takeout menu and a magnet shaped like a strawberry. " +
      "She did not read it. She has never read one. It says EXPELLED in letters two inches tall, and she put a gold " +
      "star on top of the stamp. Every guest who comes over sees it. Mom tells them it's a certificate.",
    thumbnail: "A glossy laminated card on a green fridge, gold star slapped on EXPELLED.",
    visual: {
      composition:
        "Front view of a 1970s avocado-green fridge door filling the square, chrome handle down the right edge. The " +
        "report card is laminated (white diagonal glare streaks, one bubbled corner) and pinned by four fruit magnets " +
        "(strawberry, banana, pineapple, lemon). Across the big red EXPELLED stamp, Mom has stuck one shiny gold star. " +
        "Taped beside it, a crayon note with a heart. A takeout menu and a dentist reminder card also on the door.",
      props: ["avocado fridge door", "laminate glare", "fruit magnets", "gold star sticker", "crayon note", "takeout menu"],
      palette: ["#8DB600 avocado", "#FFFFFF glare", "#E3122B stamp red", "#FFD400 star gold", "#FF5FA2 crayon pink"],
      text: ["EXPELLED", "PROUD OF YOU!!", "ALL MY LOVE — MOM"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A", chasingMemes: "A+", sellingTooEarly: "B" },
    gpa: 0.33,
    traits: {
      Background: "Avocado Fridge Door",
      Paper: "Laminated (By Mom)",
      School: "Bagholder Valley Regional High",
      Semester: "Spring 1987",
      Attendance: "Chronically Absent",
      "Teacher Comment": "Please have a parent read this. Any parent. Please.",
      "Pen Marks": "Gold Star (Added By Mom)",
      Doodle: "Crayon Heart (Mom's)",
      Stain: "Laminate Bubble",
      "Parent Signature": "Mom (Did Not Read It)",
      Incident: "Displayed Publicly",
      Status: "EXPELLED (LAMINATED)",
    },
    extra: { "Fridge Rating": "10/10" },
  },
  // 4
  {
    slug: "snow-day",
    title: "Snow Day",
    lore:
      "School was closed. The market was not. There are no grades on this card because the district never printed " +
      "them: the buses were stuck, Harrow was stuck, and the only thing still moving was the chart. It is the best " +
      "report card in the collection by a mile. It is completely blank.",
    thumbnail: "A blank report card half-buried in a snowdrift.",
    visual: {
      composition:
        "The card stands upright, lower third buried in a big curved snowdrift, snow piled along its top edge. Header " +
        "and subject names are printed but every grade box is empty. Diagonal blizzard streaks across a bright sky-blue " +
        "field. A red plastic sled leans on the card. A small snowman at left holds a stick with a red flag reading " +
        "SELL. A radio-bulletin strip taped across the top: SCHOOL CLOSED — ALL DISTRICTS.",
      props: ["snowdrift", "red plastic sled", "snowman with flag", "bulletin strip", "blizzard streaks"],
      palette: ["#6EC6FF sky", "#FFFFFF snow", "#E3122B sled red", "#FF8A00 carrot", "#1B3A5C shadow"],
      text: ["SCHOOL CLOSED — ALL DISTRICTS", "NO GRADES POSTED", "SELL (snowman's flag)"],
    },
    grades: { buyingTheTop: "—", takingProfit: "—", riskManagement: "—", holdingBags: "—", chasingMemes: "—", sellingTooEarly: "—" },
    gpa: 4,
    traits: {
      Background: "Blizzard",
      Paper: "Blank (Never Printed)",
      School: "All Districts (Closed)",
      Semester: "Winter (Canceled)",
      Attendance: "School Closed",
      "Teacher Comment": "No comment. Harrow is stuck in a ditch on Route 9.",
      "Pen Marks": "Frozen Pen",
      Doodle: "Snow Angel",
      Stain: "Slush",
      "Parent Signature": "Not Required",
      Incident: "Act Of Nature",
      Status: "SNOW DAY",
    },
    extra: { "GPA (Printed)": "N/A (Snow)" },
  },
  // 5
  {
    slug: "the-rug-pull",
    title: "The Rug Pull",
    lore:
      "Every other rug pull in history happened on a screen. This one happened in the principal's office, with an " +
      "actual rug. A kid in a gray hoodie nobody could describe grabbed the corner and yanked. The report card went " +
      "airborne. The rug has never been found. Neither has the kid.",
    thumbnail: "A rug yanked out of frame, the card flipping in mid-air over a black void.",
    visual: {
      composition:
        "Low angle. A red-and-gold geometric ornamental rug rips out of frame to the right, rippling hard with motion " +
        "lines. Above where it was, the report card flips mid-air, spilling tumbling gold coins. Where the rug used to " +
        "be: a pure black void with a few floor tiles falling into it. At the right edge, a hand in a gray hoodie " +
        "sleeve grips the rug corner; a paper tag tied to the rug reads DEV.",
      props: ["ornamental rug", "gray hoodie sleeve", "DEV tag", "tumbling coins", "falling floor tiles"],
      palette: ["#B3122B rug red", "#F2C14E gold", "#000000 void", "#9AA0A6 hoodie gray", "#FFFFFF paper"],
      text: ["DEV", "RUGGED"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A+", chasingMemes: "A+", sellingTooEarly: "F" },
    gpa: 0,
    traits: {
      Background: "The Void Where The Rug Was",
      Paper: "Airborne",
      School: "Mt. Rugmore Junior High",
      Semester: "Fall 2004",
      Attendance: "Present (Floor: Absent)",
      "Teacher Comment": "The floor was pulled out from under this student. Literally, this time.",
      "Pen Marks": "Motion Blur",
      Doodle: "Rocket (Mid-Fall)",
      Stain: "Carpet Burn",
      "Parent Signature": "Fell Off",
      Incident: "An Actual Rug",
      Status: "RUGGED",
    },
    extra: { "Rug Location": "Unknown" },
  },
  // 6
  {
    slug: "substitute-teacher",
    title: "Substitute Teacher",
    lore:
      "Harrow was out for one day. The substitute didn't know what any of the subjects meant, assumed an A in " +
      "Buying the Top was good, gave every student straight A's and put on a movie. For one glorious afternoon, the " +
      "whole class made honor roll. Harrow came back the next morning and has not taken a sick day since.",
    thumbnail: "A card of cheerful green A's with one furious red NO.",
    visual: {
      composition:
        "The card fills the center, every grade a big loopy GREEN-ink A with a smiley face in the margin and a sticky " +
        "note: 'Great job everyone!! — Sub'. Behind it, a rolling TV cart with a boxy CRT television showing static. " +
        "Harrow's red pen, clipped to the top edge, has slashed a single furious NO. beside the smiley and circled the " +
        "A in Buying the Top so hard it tore.",
      props: ["TV cart", "CRT television with static", "green pen", "sticky note", "Harrow's red pen"],
      palette: ["#2EC4B6 classroom teal", "#1DB954 green ink", "#E3122B Harrow red", "#2B2B2B TV cart", "#FFF59D sticky note"],
      text: ["A", "Great job everyone!! — Sub", "NO.", "HONOR ROLL??"],
    },
    grades: { buyingTheTop: "A", takingProfit: "A", riskManagement: "A", holdingBags: "A", chasingMemes: "A", sellingTooEarly: "A" },
    gpa: 4,
    traits: {
      Background: "TV Cart (Movie Day)",
      Paper: "1999 Office Laser",
      School: "Robinhood Chain Public School 46",
      Semester: "Spring 1999",
      Attendance: "Sub Didn't Take Roll",
      "Teacher Comment": "Great job everyone!! — Sub",
      "Pen Marks": "Green Pen Smiley + Harrow's 'NO.'",
      Doodle: "Sub's Flower",
      Stain: "Popcorn Butter",
      "Parent Signature": "Signed Immediately (Suspicious)",
      Incident: "Harrow Was Out Sick",
      Status: "HONOR ROLL (UNDER REVIEW)",
    },
    extra: { Grader: "Substitute (Name Unknown)" },
  },
  // 7
  {
    slug: "fire-drill",
    title: "Fire Drill",
    lore:
      "The student pulled the fire alarm to get out of a math test, then traded through the entire evacuation from the " +
      "parking lot. The card was left on a desk next to a space heater. It is mostly ash now. What remains is still " +
      "down 60%.",
    thumbnail: "A charred, curling card with glowing edges and one surviving SELL.",
    visual: {
      composition:
        "The card burnt from the edges inward: curled black crust, orange ember line, drifting ash flakes. Only a " +
        "center island survives, showing 'SELL' circled in red and one F. Background is blacktop parking lot with a " +
        "yellow painted stripe and an orange traffic cone. A red fire-alarm pull station at left, lever yanked down, " +
        "labeled PULL IN CASE OF DUMP.",
      props: ["charred card", "embers", "ash flakes", "traffic cone", "fire-alarm pull station"],
      palette: ["#2A2A2A asphalt", "#FF6A00 ember", "#FFD400 stripe yellow", "#E3122B alarm red", "#BDBDBD ash"],
      text: ["PULL IN CASE OF DUMP", "SELL", "F"],
    },
    grades: { buyingTheTop: "ASH", takingProfit: "F", riskManagement: "ASH", holdingBags: "ASH", chasingMemes: "ASH", sellingTooEarly: "ASH" },
    gpa: 0,
    traits: {
      Background: "Evacuation Parking Lot",
      Paper: "Ash",
      School: "Leverage Heights Middle School",
      Semester: "Winter 1994",
      Attendance: "Outside (Evacuated)",
      "Teacher Comment": "Pulled the alarm to skip the test. Traded the whole evacuation. See me. From outside.",
      "Pen Marks": "Burned Off",
      Doodle: "Burned Off",
      Stain: "Smoke Damage",
      "Parent Signature": "Burned Off",
      Incident: "Pulled The Fire Alarm",
      Status: "EVACUATED",
    },
  },
  // 8
  {
    slug: "y2k-time-capsule",
    title: "Y2K Time Capsule",
    lore:
      "Buried behind the gym by the Class of 1999, to be opened in 2026. Inside: one report card, one floppy disk " +
      "labeled MY PORTFOLIO, and a note reading 'if the computers survive, sell.' The computers survived. Nobody sold. " +
      "The floppy disk is corrupted, which makes it the most accurate portfolio in the collection.",
    thumbnail: "An open silver time capsule with a floppy disk and a CRT reading 01/01/1900.",
    visual: {
      composition:
        "A dented silver time-capsule cylinder lies open in the foreground with dirt clods around it; the rolled " +
        "report card spills out, every grade printed as ERROR. Beside it, a generic 3.5-inch floppy disk with a " +
        "handwritten label MY PORTFOLIO. Behind, a beige CRT monitor glowing neon-green terminal text. A folded note " +
        "in the dirt.",
      props: ["time capsule cylinder", "floppy disk", "beige CRT monitor", "folded note", "dirt clods"],
      palette: ["#C0C0C0 silver", "#6B4423 dirt", "#00FF41 terminal green", "#E8E0C8 beige plastic", "#0B0B0B screen"],
      text: ["CLASS OF 1999 — OPEN IN 2026", "MY PORTFOLIO", "01/01/1900", "PORTFOLIO NOT FOUND", "if the computers survive, sell."],
    },
    grades: { buyingTheTop: "ERROR", takingProfit: "ERROR", riskManagement: "ERROR", holdingBags: "ERROR", chasingMemes: "ERROR", sellingTooEarly: "ERROR" },
    gpa: 0,
    traits: {
      Background: "Dirt Behind The Gym",
      Paper: "1999 Office Laser (Buried)",
      School: "Class Of 1999",
      Semester: "Fall 1999 (Opened 2026)",
      Attendance: "01/01/1900",
      "Teacher Comment": "To whoever opens this: if the computers survived, sell. — H., 1999",
      "Pen Marks": "Faded",
      Doodle: "Millennium Bug",
      Stain: "27 Years Of Dirt",
      "Parent Signature": "Illegible (Water Damage)",
      Incident: "Buried",
      Status: "COMPUTERS SURVIVED",
    },
    extra: { "GPA (Printed)": "NaN" },
  },
  // 9
  {
    slug: "the-kid-who-sold-the-top",
    title: "The Kid Who Sold The Top",
    lore:
      "Every school has a legend: a kid who sold the exact top, to the minute, walked out the front door and was " +
      "never seen again. Nobody has met this student. Everyone's cousin knew them. The card was found in a locker " +
      "that has been welded shut ever since, and Harrow will only talk about it after the second coffee.",
    thumbnail: "A glowing card with a halo, gold rays and a SELL arrow at the exact peak.",
    visual: {
      composition:
        "The card floats in a shaft of heavenly light breaking through purple storm clouds; gold rays burst from " +
        "behind it and a glowing halo ring hovers above it. On the card, all grades in gold ink, plus a small line " +
        "chart with one SELL arrow exactly at the peak. Below, an open locker with its door blown off, weld scars " +
        "around the frame.",
      props: ["halo", "god rays", "storm clouds", "open locker with welds", "gold-ink chart"],
      palette: ["#1A1033 storm purple", "#FFD700 gold", "#FFFFFF light", "#18FF6D chart green", "#7A7A7A locker steel"],
      text: ["SOLD THE TOP", "SELL", "VALEDICTORIAN"],
    },
    grades: { buyingTheTop: "F", takingProfit: "A+", riskManagement: "A+", holdingBags: "F", chasingMemes: "F", sellingTooEarly: "F" },
    gpa: 4.33,
    traits: {
      Background: "Heavenly Light",
      Paper: "Gold Foil (Glowing)",
      School: "Unknown (Records Sealed)",
      Semester: "The Top",
      Attendance: "Left At The Top",
      "Teacher Comment": "I only had one who listened. I never saw them again.",
      "Pen Marks": "Gold Ink Only",
      Doodle: "A Perfect Chart",
      Stain: "None (Untouchable)",
      "Parent Signature": "Unnecessary",
      Incident: "Sold The Top",
      Status: "VALEDICTORIAN (MYTHICAL)",
    },
    extra: { Sightings: "0" },
  },
  // 10
  {
    slug: "expelled-from-the-blockchain",
    title: "Expelled From The Blockchain",
    lore:
      "Most students get expelled from a school. This one got expelled from a distributed ledger, which nobody knew was " +
      "possible. The validators held a meeting. The vote was unanimous. The card was physically kicked out of the " +
      "chain and now lies on the sidewalk outside it, still stamped, still warm.",
    thumbnail: "A giant boot kicking a stamped card out of a wall of glowing blocks.",
    visual: {
      composition:
        "Left two-thirds: a towering wall of stacked translucent glowing blue cubes linked by thick chain links. A " +
        "cube-shaped door in the wall is open, and a big cartoon boot extends from it at full follow-through. The " +
        "card tumbles right with a massive EXPELLED stamp, trailing snapped chain links, toward a cracked red sidewalk.",
      props: ["wall of glowing blocks", "chain links (snapped)", "cartoon boot", "cracked sidewalk"],
      palette: ["#0038FF block blue", "#7FDBFF glow", "#FF1A1A expelled red", "#111111 outline", "#BDBDBD chain steel"],
      text: ["EXPELLED", "DO NOT READMIT (ANY BLOCK)", "NO ENTRY"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A+", chasingMemes: "A+", sellingTooEarly: "A" },
    gpa: 0,
    traits: {
      Background: "Outside The Chain",
      Paper: "Kicked",
      School: "The Blockchain (Formerly)",
      Semester: "Every Block",
      Attendance: "Banned",
      "Teacher Comment": "I did not know this was possible. The validators did not either.",
      "Pen Marks": "Boot Print",
      Doodle: "Chain (Broken)",
      Stain: "Sidewalk Grit",
      "Parent Signature": "Rejected",
      Incident: "Removed By Validators",
      Status: "EXPELLED FROM THE BLOCKCHAIN",
    },
    extra: { "Validator Vote": "Unanimous" },
  },
  // 11
  {
    slug: "principals-own-wallet",
    title: "The Principal's Own Wallet",
    lore:
      "Found in the staff parking lot: the principal's own wallet, and folded inside it, the principal's own report " +
      "card. It is worse than any student's. The principal has asked for it back three times over the PA system. It " +
      "will not be returned.",
    thumbnail: "An open leather wallet on asphalt with a folded report card inside.",
    visual: {
      composition:
        "Top-down: an open, cracked brown leather bifold on gray asphalt next to a yellow parking stripe. Inside, a " +
        "staff ID card reading THE PRINCIPAL with a gray blank silhouette (no face), a punch card, and the report card " +
        "folded in quarters and half-open, showing the EXIT LIQUIDITY stamp. A keychain reading WORLD'S OKAYEST " +
        "PRINCIPAL lies beside it.",
      props: ["brown bifold wallet", "staff ID with blank silhouette", "folded report card", "keychain", "parking stripe"],
      palette: ["#6B3E1F leather", "#3A3A3A asphalt", "#FFD400 stripe", "#FF1F8E stamp pink", "#FFFFFF card"],
      text: ["THE PRINCIPAL", "WORLD'S OKAYEST PRINCIPAL", "MOST LIKELY TO BECOME EXIT LIQUIDITY"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A+", chasingMemes: "A", sellingTooEarly: "A" },
    gpa: 0,
    traits: {
      Background: "Staff Parking Lot",
      Paper: "Folded In Quarters",
      School: "Faculty Division",
      Semester: "Every Payday",
      Attendance: "Perfect (Unfortunately)",
      "Teacher Comment": "Staff member is not a student and should know better. Does not.",
      "Pen Marks": "Harrow's Revenge",
      Doodle: "Retirement Countdown",
      Stain: "Parking Lot Puddle",
      "Parent Signature": "Signed By Superintendent (Disappointed)",
      Incident: "Lost Wallet",
      Status: "EXIT LIQUIDITY (FACULTY)",
    },
  },
  // 12
  {
    slug: "hall-monitor",
    title: "Hall Monitor",
    lore:
      "Wore the orange sash. Carried the clipboard. Took down the name of every classmate who bought the top and " +
      "reported them to the office. Made zero trades personally, which is why they are the only student in school " +
      "history with a positive return. Nobody sits with them at lunch. They have a clipboard. They are fine.",
    thumbnail: "A clipboard with an orange safety sash and a whistle: WHO BOUGHT THE TOP: EVERYONE.",
    visual: {
      composition:
        "The card clipped diagonally to a brown clipboard, a fluorescent-orange safety sash draped across it, a silver " +
        "whistle on a lanyard. On the clipboard beside the card, a handwritten list headed WHO BOUGHT THE TOP: with " +
        "the single entry EVERYONE underlined twice. A HALL MONITOR badge pinned to the sash. Background: a hallway of " +
        "blue lockers in one-point perspective.",
      props: ["clipboard", "orange safety sash", "whistle", "badge", "locker hallway"],
      palette: ["#FF6B00 sash orange", "#8B5E3C clipboard", "#1646FF lockers", "#C0C0C0 whistle", "#FFFFFF paper"],
      text: ["HALL MONITOR — MARKET SURVEILLANCE", "WHO BOUGHT THE TOP:", "EVERYONE"],
    },
    grades: { buyingTheTop: "F", takingProfit: "A", riskManagement: "A+", holdingBags: "F", chasingMemes: "F", sellingTooEarly: "F" },
    gpa: 4,
    traits: {
      Background: "Locker Hallway (Patrolled)",
      Paper: "Clipboard Carbon",
      School: "Robinhood Chain Public School 46",
      Semester: "Fall 1987",
      Attendance: "Perfect (Patrolling)",
      "Teacher Comment": "Reports classmates' trades to the office. Accurate. Deeply unpopular.",
      "Pen Marks": "Checkmarks (Hall Monitor's)",
      Doodle: "List Of Names",
      Stain: "None (Too Careful)",
      "Parent Signature": "Signed Promptly",
      Incident: "Filed 212 Reports",
      Status: "HONOR ROLL (SNITCH)",
    },
    extra: { "Trades Made": "0" },
  },
  // 13
  {
    slug: "summer-school-lifer",
    title: "Summer School Lifer",
    lore:
      "Has attended summer school every summer since 1987. Knows the janitor by name. Has a reserved desk with a " +
      "cushion. Buys the top every July like clockwork and every June is right back here, sunburned, holding the " +
      "same bags in a different beach tote.",
    thumbnail: "A 40-card leaning tower of summer report cards under a beach umbrella.",
    visual: {
      composition:
        "A tall leaning tower of report cards stacked about 40 high, each edge labeled SUMMER with a year from 1987 up " +
        "to 2026; the top card is fully visible. A striped beach umbrella is jammed into the classroom floor beside " +
        "it, a folding lawn chair, sunglasses resting on the top card, a tube of sunscreen. Bleached yellow-orange " +
        "background with heat-haze wiggles.",
      props: ["stack of 40 report cards", "beach umbrella", "lawn chair", "sunglasses", "sunscreen tube"],
      palette: ["#FFB000 heat orange", "#FF4F81 umbrella pink", "#00C2FF umbrella blue", "#FFFFFF paper", "#E3122B grades"],
      text: ["SUMMER SCHOOL — REMEDIAL FINANCE", "SUMMER 1987", "SUMMER 2026", "YOU AGAIN."],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D", holdingBags: "A+", chasingMemes: "A", sellingTooEarly: "C" },
    gpa: 0.5,
    traits: {
      Background: "Heat Haze",
      Paper: "40 Summers Of Paper",
      School: "Summer School (Remedial Finance)",
      Semester: "Summer 1987-2026",
      Attendance: "Every Summer",
      "Teacher Comment": "Welcome back. Your desk is where you left it. So is your position.",
      "Pen Marks": "Forty Years Of SEE ME",
      Doodle: "Palm Tree",
      Stain: "Sunscreen",
      "Parent Signature": "Parents Retired To Florida",
      Incident: "Tenure",
      Status: "HELD BACK (x40)",
    },
  },
  // 14
  {
    slug: "wallet-sized",
    title: "Wallet-Sized",
    lore:
      "Picture day order form, Package C: eight wallet-sized prints. The only time this student has ever filled a " +
      "wallet. The photographer said 'say profit.' Nobody knew the word. Retake scheduled.",
    thumbnail: "A school-portrait print sheet with eight tiny wallet-size copies and a RETAKE stamp.",
    visual: {
      composition:
        "A school-portrait print sheet: top half is one large oval portrait of the report card itself (as the " +
        "subject) against a magenta/cyan laser backdrop; bottom half is a grid of eight tiny wallet-size copies with " +
        "dotted perforation lines. A black plastic pocket comb tucked in one corner. A big red RETAKE stamp diagonal " +
        "across the sheet. Order-form corner: PACKAGE C — 8 WALLETS with the box checked.",
      props: ["portrait print sheet", "oval matte", "8 wallet prints", "pocket comb", "order form corner"],
      palette: ["#1B1464 backdrop navy", "#FF2BD6 laser magenta", "#18E5FF laser cyan", "#E3122B retake red", "#FFFFFF paper"],
      text: ["PACKAGE C — 8 WALLETS", "RETAKE", "SAY PROFIT"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D", holdingBags: "A", chasingMemes: "A-", sellingTooEarly: "B+" },
    gpa: 0.9,
    traits: {
      Background: "Picture Day Lasers (Studio)",
      Paper: "Glossy Photo Paper",
      School: "FOMO Falls Elementary",
      Semester: "Fall 1993",
      Attendance: "Picture Day Only",
      "Teacher Comment": "Blinked. Retake scheduled. Also blinked at every top this year.",
      "Pen Marks": "RETAKE",
      Doodle: "Pocket Comb",
      Stain: "Fingerprints On Gloss",
      "Parent Signature": "Ordered Package C",
      Incident: "Blinked",
      Status: "RETAKE",
    },
    extra: { Wallets: "8" },
  },
  // 15
  {
    slug: "bubble-sheet-masterpiece",
    title: "Bubble Sheet Masterpiece",
    lore:
      "Instead of answering the final exam, the student filled in the bubbles to draw a candlestick chart. It goes " +
      "down. It is, by every account, the most accurate thing anyone turned in all year. The grading machine gave it " +
      "a 34 and then made a noise nobody had heard before.",
    thumbnail: "An answer bubble sheet where the filled bubbles form a falling candle chart.",
    visual: {
      composition:
        "A long answer sheet fills the square: rows of A-E bubbles on pale green and salmon stripes. Filled pencil " +
        "bubbles form a falling staircase of candlesticks from top-left to bottom-right. A worn yellow No. 2 pencil " +
        "lies across it, eraser chewed flat. Machine score printed in the corner: 34. The report card is clipped on " +
        "top at an angle, partly covering the header.",
      props: ["bubble answer sheet", "No. 2 pencil", "machine score box", "binder clip"],
      palette: ["#CFF5D8 sheet green", "#FF9F8A sheet salmon", "#333333 graphite", "#FFD000 pencil yellow", "#E3122B grades"],
      text: ["SCORE: 34", "USE NO. 2 PENCIL ONLY", "chart of my portfolio (margin, pencil)"],
    },
    grades: { buyingTheTop: "A", takingProfit: "F", riskManagement: "F", holdingBags: "A", chasingMemes: "A+", sellingTooEarly: "B" },
    gpa: 0.34,
    traits: {
      Background: "Bubble Answer Sheet",
      Paper: "Machine-Readable",
      School: "Paper Hands Preparatory Academy",
      Semester: "Spring 1996",
      Attendance: "Present For The Test",
      "Teacher Comment": "Did not answer one question. Drew the chart. The chart was correct.",
      "Pen Marks": "Machine Score: 34",
      Doodle: "The Whole Test",
      Stain: "Graphite Smudge",
      "Parent Signature": "Filled In As A Bubble",
      Incident: "Broke The Grading Machine",
      Status: "ART, TECHNICALLY",
    },
  },
  // 16
  {
    slug: "science-fair-volcano",
    title: "Science Fair Volcano",
    lore:
      "Hypothesis: number go up. Method: baking soda and vinegar. Results: see attached. The volcano erupted red " +
      "lava all over the gym floor, the judges' table and the report card. It received an honorable mention for " +
      "realism.",
    thumbnail: "A papier-mache volcano erupting red candlestick lava onto a report card.",
    visual: {
      composition:
        "A tri-fold poster board titled MY PORTFOLIO: A VOLCANO with three panels HYPOTHESIS / METHOD / RESULTS. In " +
        "front, a lumpy papier-mache volcano erupts thick red lava shaped like falling red candlesticks, oozing over " +
        "the report card at its base. A blue HONORABLE MENTION ribbon pinned to the board. Glitter glue everywhere.",
      props: ["tri-fold poster board", "papier-mache volcano", "red candlestick lava", "ribbon", "glitter"],
      palette: ["#1646FF board border", "#FF1A1A lava", "#8B5A2B volcano brown", "#FFFFFF board", "#FFD400 glitter"],
      text: ["MY PORTFOLIO: A VOLCANO", "HYPOTHESIS: NUMBER GO UP", "RESULTS: SEE LAVA", "HONORABLE MENTION"],
    },
    grades: { buyingTheTop: "A", takingProfit: "D-", riskManagement: "F", holdingBags: "A+", chasingMemes: "A", sellingTooEarly: "C" },
    gpa: 1.1,
    traits: {
      Background: "Gym Science Fair",
      Paper: "Tri-Fold Poster Board",
      School: "Wen Moon Vocational & Technical",
      Semester: "Spring 2004",
      Attendance: "Satisfactory",
      "Teacher Comment": "The volcano was the only accurate forecast in the gym. B+ for effort, F for outcome.",
      "Pen Marks": "Judge's Scorecard",
      Doodle: "Glitter Glue Rocket",
      Stain: "Lava (Vinegar)",
      "Parent Signature": "Parent Did The Project",
      Incident: "Eruption",
      Status: "HONORABLE MENTION",
    },
  },
  // 17
  {
    slug: "signed-yearbook",
    title: "Signed Yearbook",
    lore:
      "Voted Most Likely To Become Exit Liquidity, and the whole class signed the page. 'Never change.' 'Stay the " +
      "same forever.' 'Please keep buying.' Every message is from someone who sold to them. Several included price " +
      "targets.",
    thumbnail: "A yearbook superlative page covered edge to edge in gel-pen signatures.",
    visual: {
      composition:
        "An open yearbook spread. A grid of blank silhouette portrait frames (no faces) under the heading " +
        "SUPERLATIVES; the center frame holds the report card under a banner MOST LIKELY TO BECOME EXIT LIQUIDITY. " +
        "Every inch is covered in slanted signatures in different gel-pen colors with hearts, arrows and stars.",
      props: ["yearbook spread", "silhouette frames", "superlative banner", "gel-pen signatures"],
      palette: ["#FFFFFF page", "#FF2BD6 gel pink", "#18E5FF gel blue", "#7CFC00 gel green", "#9B30FF gel purple"],
      text: [
        "SUPERLATIVES",
        "MOST LIKELY TO BECOME EXIT LIQUIDITY",
        "NEVER CHANGE!!",
        "stay cool, keep buying",
        "HAGS — sold you my bags lol",
        "thx for the exit <3",
        "2 good 2 be 4gotten, 2 late 2 sell",
      ],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D-", holdingBags: "A+", chasingMemes: "A+", sellingTooEarly: "F" },
    gpa: 0.2,
    traits: {
      Background: "Yearbook Spread",
      Paper: "Glossy Yearbook Stock",
      School: "Bagholder Valley Regional High",
      Semester: "Spring 1998",
      Attendance: "Perfect (For Them)",
      "Teacher Comment": "Never change. The market needs you exactly as you are.",
      "Pen Marks": "Signed By Harrow Too",
      Doodle: "Hearts From Sellers",
      Stain: "Gel Pen Bleed",
      "Parent Signature": "Also Signed The Yearbook",
      Incident: "Superlative",
      Status: "EXIT LIQUIDITY (SIGNED)",
    },
    extra: { Signatures: "Everyone Who Sold" },
  },
  // 18
  {
    slug: "parent-teacher-conference",
    title: "Parent-Teacher Conference",
    lore:
      "Mother requested conference. Mother arrived with her own chart. It was worse. The conference ran two hours " +
      "over and ended with Harrow consoling both of them. All three now share a watchlist.",
    thumbnail: "A tiny kid's chair holding the report card, facing a desk with a tissue box.",
    visual: {
      composition:
        "Empty classroom, no people. A tiny orange plastic kid's chair in the foreground with the report card propped " +
        "on it, facing a big teacher's desk. On the desk: a white mug reading HARROW, a second mug reading WORLD'S " +
        "OKAYEST INVESTOR, a half-empty tissue box with tissues spilling, a printed red chart going down. A wall clock " +
        "reads 6:47. A sticky note on the desk: MOTHER REQUESTED CONFERENCE.",
      props: ["kid-size chair", "teacher's desk", "two mugs", "tissue box", "printed chart", "wall clock"],
      palette: ["#FF8C00 chair orange", "#FFE9B0 wall cream", "#E3122B chart red", "#4A2C1A desk brown", "#FFF59D sticky note"],
      text: ["MOTHER REQUESTED CONFERENCE", "HARROW", "WORLD'S OKAYEST INVESTOR"],
    },
    grades: { buyingTheTop: "A", takingProfit: "D", riskManagement: "F", holdingBags: "A-", chasingMemes: "B+", sellingTooEarly: "B" },
    gpa: 1,
    traits: {
      Background: "Empty Classroom, 6:47 PM",
      Paper: "1994 Dot Matrix",
      School: "St. Satoshi of the Perpetual Dip",
      Semester: "Fall 1994",
      Attendance: "Satisfactory",
      "Teacher Comment": "Mother requested conference.",
      "Pen Marks": "Agenda (Crossed Out)",
      Doodle: "Mom's Chart (Worse)",
      Stain: "Tissues",
      "Parent Signature": "Mom (Also Down)",
      Incident: "Conference Ran Two Hours Over",
      Status: "CONFERENCE REQUESTED",
    },
    extra: { "Shared Watchlist": "Yes" },
  },
  // 19
  {
    slug: "grade-10-attempt-26",
    title: "Grade 10, Attempt 26",
    lore:
      "Held back twenty-six times. Now older than Harrow. Drives to school. Has a mortgage, reading glasses and a " +
      "pension-shaped hole in the portfolio. Still in tenth grade. Still buying the top.",
    thumbnail: "A report card with 26 tally marks, reading glasses and a PAST DUE bill.",
    visual: {
      composition:
        "The card fills the center with a huge box reading GRADE 10 — ATTEMPT 26 and 26 tally marks in five-bar gates " +
        "down the side. Clipped to it: drugstore reading glasses and a mortgage envelope stamped PAST DUE. A car key " +
        "on a generic fob lies on top. Behind, a tiny student desk with a lumbar-support pillow on the chair.",
      props: ["tally marks", "reading glasses", "PAST DUE envelope", "car key", "lumbar pillow", "tiny desk"],
      palette: ["#6C5CE7 violet", "#FFFFFF paper", "#E3122B tally red", "#FFD400 highlight", "#3D3D3D ink"],
      text: ["GRADE 10 — ATTEMPT 26", "PAST DUE", "HELD BACK"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D-", holdingBags: "A+", chasingMemes: "B", sellingTooEarly: "C-" },
    gpa: 1.2,
    traits: {
      Background: "Tiny Desk, Lumbar Pillow",
      Paper: "26th Carbon Copy",
      School: "Bagholder Valley Regional High",
      Semester: "Fall (Again)",
      Attendance: "Excellent (Drives Self)",
      "Teacher Comment": "Please stop calling me by my first name. We are not colleagues. Yet.",
      "Pen Marks": "26 Tally Marks",
      Doodle: "Mortgage Math",
      Stain: "Reading Glasses Smudge",
      "Parent Signature": "Signed By Own Kid",
      Incident: "Mortgage Past Due",
      Status: "HELD BACK (26)",
    },
    extra: { Attempts: "26" },
  },
  // 20
  {
    slug: "gifted-and-talented-whale",
    title: "Gifted & Talented (Whale Division)",
    lore:
      "Referred to the Gifted & Talented program after buying the cafeteria, the gym and the vice principal's " +
      "parking spot during snack time. The sticker ran out of room. The district drew the student as a whale for " +
      "the file because, frankly, they could not fit the portfolio through the door.",
    thumbnail: "A gigantic cartoon whale swallowing a cafeteria, gold sticker on its side.",
    visual: {
      composition:
        "Deep ocean blue fills the square. A gigantic friendly cartoon whale takes up most of the frame, mouth open, " +
        "swallowing an entire cafeteria: tables, trays, a floating hairnet, flying tots. The report card is held up " +
        "in one flipper like a trophy. A giant gold GIFTED & TALENTED sticker is stuck on the whale's side. Bubbles " +
        "and floating coins.",
      props: ["giant cartoon whale", "swallowed cafeteria", "gold sticker", "report card in flipper", "bubbles"],
      palette: ["#003B8E ocean", "#00A8E8 whale blue", "#FFD700 sticker gold", "#FFFFFF bubbles", "#12C6B5 trays"],
      text: ["GIFTED & TALENTED", "WHALE DIVISION", "PARENTS: HIDE YOUR WALLETS"],
    },
    grades: { buyingTheTop: "A", takingProfit: "B", riskManagement: "C", holdingBags: "B", chasingMemes: "A", sellingTooEarly: "C" },
    gpa: 2.5,
    traits: {
      Background: "The Ocean",
      Paper: "Waterproof",
      School: "Diamond Hands Magnet School",
      Semester: "Winter 2004",
      Attendance: "Perfect (Owns The Building)",
      "Teacher Comment": "Bought the cafeteria. I do not know how to discipline a shareholder.",
      "Pen Marks": "Too Big To Mark",
      Doodle: "Spout",
      Stain: "Seawater",
      "Parent Signature": "Signed By Accountant",
      Incident: "Bought The Cafeteria",
      Status: "GIFTED & TALENTED",
    },
    extra: { Division: "Whale" },
  },
  // 21
  {
    slug: "nurses-punch-card",
    title: "Nurse's Punch Card",
    lore:
      "Rugged so many times that the school nurse started a loyalty program. Every rug gets a punch. The tenth " +
      "ice pack is free. The student has redeemed it four times and is two rugs away from a fifth.",
    thumbnail: "A pink loyalty punch card with ten punched rug icons and a red cross.",
    visual: {
      composition:
        "A big coffee-shop-style loyalty card in nurse's-office pink and white with a red cross logo, ten circles each " +
        "holding a tiny rug icon, all ten punched clean through so the background shows. Under it, the report card, " +
        "and a stack of four more fully punched cards held with a rubber band. A melting blue ice pack in the corner.",
      props: ["loyalty punch card", "punched holes", "rubber-banded stack", "ice pack", "report card"],
      palette: ["#FF8FC7 nurse pink", "#FFFFFF card white", "#E3122B cross red", "#6EC6FF ice pack", "#2B2B2B holes"],
      text: ["NURSE'S OFFICE REWARDS", "10TH ICE PACK FREE", "RUGGED"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A+", chasingMemes: "A+", sellingTooEarly: "D" },
    gpa: 0.6,
    traits: {
      Background: "Nurse's Office Cot",
      Paper: "Loyalty Card Stock",
      School: "Mt. Rugmore Junior High",
      Semester: "Spring 1994",
      Attendance: "Nurse's Office (Mostly)",
      "Teacher Comment": "Spends more time with the nurse than with me. The nurse agrees.",
      "Pen Marks": "Hole Punch",
      Doodle: "Bandage Rocket",
      Stain: "Ice Pack Condensation",
      "Parent Signature": "Nurse Signed It",
      Incident: "Rugged (x48)",
      Status: "RUGGED (LOYALTY MEMBER)",
    },
    extra: { "Free Ice Packs Redeemed": "4" },
  },
  // 22
  {
    slug: "confiscated-pager",
    title: "Confiscated Pager",
    lore:
      "Confiscated from the student's belt clip during a 1997 science test. It buzzed forty times. Every page said " +
      "the same thing: BUY. Harrow kept it in the desk drawer for thirty years. It is still buzzing. It still says BUY.",
    thumbnail: "A buzzing pager reading BUY BUY BUY on top of a drawer of confiscated toys.",
    visual: {
      composition:
        "Top-down into an open teacher's desk drawer, a jumble of confiscated contraband: slap bracelets, a yo-yo, " +
        "milk caps, a pink eraser, a tangle of gel pens. On top, a black belt-clip pager with a green LCD reading " +
        "BUY BUY BUY 100X, surrounded by vibration lines. The report card lies under the pager with a CONFISCATED tag " +
        "on a string.",
      props: ["desk drawer", "pager with LCD", "slap bracelets", "yo-yo", "milk caps", "gel pens", "tag"],
      palette: ["#2B1B0E drawer wood", "#9BE564 LCD green", "#FF2BD6 slap-bracelet pink", "#FFD400 yo-yo", "#FFFFFF tag"],
      text: ["BUY BUY BUY 100X", "CONFISCATED — PICK UP AFTER SCHOOL", "1997"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D", holdingBags: "A", chasingMemes: "A+", sellingTooEarly: "B-" },
    gpa: 1,
    traits: {
      Background: "Harrow's Desk Drawer",
      Paper: "1994 Dot Matrix",
      School: "Leverage Heights Middle School",
      Semester: "Spring 1997",
      Attendance: "Excellent (Pager On)",
      "Teacher Comment": "Pager went off 40 times during the test. It said BUY. It still says BUY.",
      "Pen Marks": "CONFISCATED Tag",
      Doodle: "Pager Code 143",
      Stain: "Drawer Dust",
      "Parent Signature": "Never Came To Pick It Up",
      Incident: "Confiscated",
      Status: "CONFISCATED",
    },
    extra: { "Pages Received": "40" },
  },
  // 23
  {
    slug: "i-will-not-buy-the-top",
    title: "I Will Not Buy The Top",
    lore:
      "Assigned to write 'I will not buy the top' one hundred times on the chalkboard. Wrote it ninety-nine times in " +
      "perfect handwriting. The hundredth line says 'I will buy the top.' Harrow was standing right there. Harrow " +
      "watched it happen.",
    thumbnail: "A chalkboard of repeated lines ending in I WILL BUY THE TOP.",
    visual: {
      composition:
        "A green chalkboard filled edge to edge with neat chalk lines repeating I WILL NOT BUY THE TOP, slanting " +
        "slightly more toward the bottom. The final line is bigger, underlined twice: I WILL BUY THE TOP. The report " +
        "card is taped to the board with masking tape. Chalk tray at the bottom with a stub and a felt eraser.",
      props: ["chalkboard", "chalk lines", "masking tape", "chalk stub", "felt eraser"],
      palette: ["#1F6B45 board green", "#FFFFFF chalk", "#E3122B grades", "#D8C9A3 masking tape", "#6B6B6B eraser"],
      text: ["I WILL NOT BUY THE TOP", "I WILL BUY THE TOP"],
    },
    grades: { buyingTheTop: "A++", takingProfit: "F", riskManagement: "D", holdingBags: "A", chasingMemes: "A-", sellingTooEarly: "C" },
    gpa: 0.7,
    traits: {
      Background: "Chalkboard (Lines)",
      Paper: "Masking-Taped To The Board",
      School: "Robinhood Chain Public School 46",
      Semester: "Winter 1987",
      Attendance: "Detention (Mandatory)",
      "Teacher Comment": "Ninety-nine out of a hundred. I was standing right there.",
      "Pen Marks": "Chalk Dust",
      Doodle: "Line 100",
      Stain: "Chalk Handprint",
      "Parent Signature": "Written On The Board",
      Incident: "Lines",
      Status: "DETENTION (LINES)",
    },
    extra: { "Lines Written": "99 + 1" },
  },
  // 24
  {
    slug: "the-forgery-kit",
    title: "The Forgery Kit",
    lore:
      "Turned every F into a B with one careful pen stroke. Turned the D into a B. Practiced Mom's signature forty " +
      "times on the back. Could not figure out what to do about the EXPELLED stamp, so they changed one letter and " +
      "it now says EXCELLED. It almost worked.",
    thumbnail: "A card whose EXPELLED stamp has been doctored into EXCELLED, surrounded by forgery tools.",
    visual: {
      composition:
        "The card under a desk-lamp spotlight, ringed by forgery tools: a generic white bottle of correction fluid " +
        "with a drip, a red pen and a blue pen, a sheet of tracing paper covered in practice 'Mom' signatures getting " +
        "more confident. On the card, every grade is a B with obvious extra pen loops where it used to be an F, and " +
        "the big status stamp reads EXCELLED, the P clumsily turned into a C in blue ink.",
      props: ["correction fluid bottle", "red and blue pens", "tracing paper", "desk lamp", "doctored card"],
      palette: ["#1E3A8A blue pen", "#E3122B stamp red", "#FFFFFF correction fluid", "#F5F5DC tracing paper", "#FFB000 lamp glow"],
      text: ["EXCELLED", "B", "Mom", "Mom", "Mom"],
    },
    grades: { buyingTheTop: "B (FORGED)", takingProfit: "B (FORGED)", riskManagement: "B (FORGED)", holdingBags: "B (FORGED)", chasingMemes: "B (FORGED)", sellingTooEarly: "B (FORGED)" },
    gpa: 3,
    traits: {
      Background: "Desk Lamp, Midnight",
      Paper: "Doctored",
      School: "Paper Hands Preparatory Academy",
      Semester: "Spring 2004",
      Attendance: "Satisfactory (Forged)",
      "Teacher Comment": "Nice try. Every B has a tail. Also, it says EXCELLED.",
      "Pen Marks": "Correction Fluid",
      Doodle: "Forty Practice Signatures",
      Stain: "Correction Fluid Drip",
      "Parent Signature": "Forged (Almost Good)",
      Incident: "Forgery",
      Status: "EXCELLED",
    },
    extra: { "Actual GPA": "0.00" },
  },
  // 25
  {
    slug: "show-and-tell",
    title: "Show And Tell",
    lore:
      "Brought a seed phrase for show-and-tell and wrote all twelve words on the whiteboard so everyone could see. " +
      "The class loved it. The wallet was empty by recess. Harrow says it was the most educational thing that " +
      "happened all year, just not for this student.",
    thumbnail: "A whiteboard with twelve numbered silly words and a crowd of raised hands.",
    visual: {
      composition:
        "A whiteboard on an easel under a bubble-letter SHOW & TELL banner. On the board, twelve numbered words in " +
        "blue marker. The report card is clipped to the easel ledge. Along the bottom edge, a crowd of small raised " +
        "hands in simple silhouette, all eager.",
      props: ["whiteboard easel", "banner", "blue marker words", "raised-hand silhouettes"],
      palette: ["#FFFFFF board", "#0057FF marker blue", "#FF3B30 banner red", "#FFC400 banner yellow", "#5A5A5A silhouettes"],
      text: [
        "SHOW & TELL",
        "1 BANANA 2 CRAYON 3 RECESS 4 GRAVY",
        "5 LOCKER 6 TOTS 7 HAMSTER 8 BUS",
        "9 GLUE 10 NAPTIME 11 DODGEBALL 12 OOPS",
      ],
    },
    grades: { buyingTheTop: "B", takingProfit: "F", riskManagement: "F-", holdingBags: "C", chasingMemes: "A", sellingTooEarly: "D" },
    gpa: 0.5,
    traits: {
      Background: "Whiteboard Easel",
      Paper: "2004 Inkjet",
      School: "FOMO Falls Elementary",
      Semester: "Fall 2004",
      Attendance: "Present (Wallet: Not)",
      "Teacher Comment": "Very educational for the other 29 students.",
      "Pen Marks": "Dry-Erase Smudge",
      Doodle: "Twelve Words",
      Stain: "Marker On Hands",
      "Parent Signature": "Parent Also Took A Photo",
      Incident: "Seed Phrase Shared",
      Status: "EDUCATIONAL",
    },
    extra: { "Wallet Balance": "0" },
  },
  // 26
  {
    slug: "the-class-hamster",
    title: "The Class Hamster",
    lore:
      "The class hamster's report card. Made zero trades all year. Ran on the wheel, ate the whitepaper, slept " +
      "through every crash, and finished the semester as the only member of the class with a positive return. " +
      "Harrow put it on the honor roll. Several parents have filed complaints.",
    thumbnail: "A fat golden hamster sitting on a report card with a gold star.",
    visual: {
      composition:
        "Inside a wire hamster cage: a spinning wheel labeled TREASURY with motion blur, wood shavings everywhere. A " +
        "fat golden hamster (cute, generic) sits squarely on the report card, cheeks stuffed with shredded paper " +
        "from a document labeled WHITEPAPER. A tiny gold star on the card. The card's student line reads " +
        "STUDENT: MR. NIBBLES (CLASS PET).",
      props: ["wire cage", "hamster wheel", "golden hamster", "shredded whitepaper", "wood shavings"],
      palette: ["#F4A81D hamster gold", "#FFF3D6 shavings", "#C0C0C0 wire", "#18C964 honor green", "#E3122B grades"],
      text: ["STUDENT: MR. NIBBLES (CLASS PET)", "TREASURY", "WHITEPAPER", "HONOR ROLL"],
    },
    grades: { buyingTheTop: "F", takingProfit: "I", riskManagement: "A+", holdingBags: "F", chasingMemes: "F", sellingTooEarly: "F" },
    gpa: 4,
    traits: {
      Background: "Hamster Cage",
      Paper: "Shredded (Bedding)",
      School: "Room 14 (Class Pet)",
      Semester: "All Year",
      Attendance: "Perfect (Lives Here)",
      "Teacher Comment": "Best student in the room. Ate the whitepaper, which is more than the rest of you did.",
      "Pen Marks": "Gold Star (Earned)",
      Doodle: "Paw Prints",
      Stain: "Wood Shavings",
      "Parent Signature": "N/A (Hamster)",
      Incident: "Ate The Whitepaper",
      Status: "HONOR ROLL (RODENT)",
    },
    extra: { Species: "Hamster", "Trades Made": "0" },
  },
  // 27
  {
    slug: "harrows-own-report-card",
    title: "Harrow's Own Report Card",
    lore:
      "Seventh period got hold of the red pen. This is Harrow's report card, graded by the students. It turns out " +
      "Harrow has been holding the same position since 1987, buys the top every payday, and every 'coffee break' " +
      "since 1994 has been a chart break.",
    thumbnail: "A kid-graded report card for TEACHER: HARROW, stickers and crayon everywhere.",
    visual: {
      composition:
        "A report card filled out in kids' handwriting (crayon and gel pen, a few backwards letters) for TEACHER: " +
        "HARROW, graded by 7TH PERIOD. Stickers everywhere: a smiley next to the A+ in Buying the Top. Harrow's big " +
        "white coffee mug sits beside it with a coffee ring; peeking out of the mug, a phone glowing a red chart. " +
        "Scalloped bulletin-board border runs around the whole square.",
      props: ["kid-graded card", "stickers", "Harrow's mug", "phone in the mug", "scalloped border"],
      palette: ["#FFE45C bulletin yellow", "#FF2BD6 gel pink", "#E3122B red chart", "#FFFFFF mug", "#1646FF crayon blue"],
      text: ["TEACHER: HARROW", "GRADED BY: 7TH PERIOD", "SEE US AFTER CLASS"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D", holdingBags: "A+ (SINCE 1987)", chasingMemes: "B", sellingTooEarly: "F" },
    gpa: 0.8,
    traits: {
      Background: "Bulletin Board",
      Paper: "Construction Paper",
      School: "Faculty (Graded By 7th Period)",
      Semester: "Every Semester Since 1987",
      Attendance: "Perfect (No Choice)",
      "Teacher Comment": "Holds one position since 1987. Calls it 'tenure.' See us after class.",
      "Pen Marks": "Stickers (Sarcastic)",
      Doodle: "Harrow With Devil Horns (Original)",
      Stain: "The Coffee Ring",
      "Parent Signature": "Signed By The Principal (Worse)",
      Incident: "Red Pen Stolen",
      Status: "SEE US AFTER CLASS",
    },
    extra: { Grader: "7th Period" },
  },
  // 28
  {
    slug: "made-it-to-the-moon",
    title: "Made It To The Moon",
    lore:
      "The only student who actually made it to the moon. The report card came too, planted in the dust like a " +
      "flag. It still says F in Taking Profit, because there is nowhere to sell on the moon. The student has been " +
      "up there for three years asking how to get down.",
    thumbnail: "A report card planted like a flag on the moon, Earth in the sky.",
    visual: {
      composition:
        "Gray cratered lunar ground across the bottom third, black starfield above, a small blue Earth low in the " +
        "corner. The report card is planted on a flagpole, stiffly flapping. An empty child-size astronaut helmet lies " +
        "beside it, visor reflecting a green chart. Boot prints lead to the flag and stop. A small sign stuck in the " +
        "dust: NO SELL ORDERS BEYOND THIS POINT.",
      props: ["flagpole", "astronaut helmet", "boot prints", "sign", "Earth"],
      palette: ["#000000 space", "#BFBFBF moon gray", "#1E90FF earth blue", "#18FF6D visor green", "#E3122B grades"],
      text: ["WE MADE IT", "NO SELL ORDERS BEYOND THIS POINT", "TAKING PROFIT — F"],
    },
    grades: { buyingTheTop: "D", takingProfit: "F", riskManagement: "F", holdingBags: "A+", chasingMemes: "A+", sellingTooEarly: "F" },
    gpa: 1.5,
    traits: {
      Background: "The Actual Moon",
      Paper: "Flag",
      School: "Wen Moon Vocational & Technical",
      Semester: "Launch Day",
      Attendance: "384,400 km Away",
      "Teacher Comment": "Congratulations on reaching the moon. Please come back for your final exam.",
      "Pen Marks": "Zero Gravity Scribble",
      Doodle: "Rocket (Landed)",
      Stain: "Moon Dust",
      "Parent Signature": "Out Of Range",
      Incident: "No Way Down",
      Status: "MOON (NO EXIT)",
    },
    extra: { Altitude: "Moon" },
  },
  // 29
  {
    slug: "stuck-under-the-desk",
    title: "Stuck Under The Desk",
    lore:
      "Stuck to the underside of desk 14 since 1994 by thirty-eight pieces of chewed gum. Like every position this " +
      "student has ever opened: sticky, fossilized and impossible to exit. The custodian tried a putty knife in 2003. " +
      "The putty knife is also still there.",
    thumbnail: "The underside of a desk covered in neon gum, report card stuck in the middle.",
    visual: {
      composition:
        "Looking up at the underside of a school desk: steel frame, bolts, and a galaxy of chewed gum wads in neon " +
        "pink, green, blue and yellow, some stretched into strings. The report card is stuck face-out in the middle, " +
        "pinned by gum at each corner. A putty knife is embedded in one wad. Scratched into the steel: DESK 14.",
      props: ["desk underside", "gum wads", "gum strings", "putty knife", "bolts"],
      palette: ["#4A4A4A steel", "#FF4FA3 gum pink", "#39FF14 gum green", "#00B7FF gum blue", "#FFE600 gum yellow"],
      text: ["DESK 14", "STUCK SINCE 1994"],
    },
    grades: { buyingTheTop: "A", takingProfit: "F", riskManagement: "D", holdingBags: "A++", chasingMemes: "B", sellingTooEarly: "F" },
    gpa: 0.9,
    traits: {
      Background: "Underside Of Desk 14",
      Paper: "Gum-Laminated",
      School: "Bagholder Valley Regional High",
      Semester: "Fall 1994 (Still)",
      Attendance: "Never Left",
      "Teacher Comment": "Cannot exit a position. Cannot exit the desk. We are looking into both.",
      "Pen Marks": "None (Can't Reach)",
      Doodle: "38 Pieces Of Gum",
      Stain: "Gum (All Of It)",
      "Parent Signature": "Stuck Under Gum",
      Incident: "Putty Knife Failed",
      Status: "STUCK",
    },
    extra: { "Gum Count": "38" },
  },
  // 30
  {
    slug: "scratch-and-sniff",
    title: "Scratch And Sniff",
    lore:
      "Harrow ran out of gold stars and used the scratch-and-sniff stickers from the back of the drawer. Every grade " +
      "has its own smell. Holding Bags smells like a gym locker. Chasing Memes smells like fake grape. Taking Profit " +
      "has no smell at all, because nobody has ever scratched it.",
    thumbnail: "A card covered in cartoon scratch-and-sniff stickers with wavy smell lines.",
    visual: {
      composition:
        "The card with a cartoon scratch-and-sniff sticker next to each grade, each with a label bubble. Most are " +
        "scuffed and scratched with fingernail marks; the PROFIT sticker is pristine and shiny. Wavy cartoon smell " +
        "lines rise off the whole card into a bright background.",
      props: ["scratch-and-sniff stickers", "label bubbles", "smell lines", "fingernail scratches"],
      palette: ["#FFE600 sticker yellow", "#B266FF grape", "#FF7A00 popcorn", "#7CFC00 locker green", "#FFFFFF paper"],
      text: ["TOP (burnt popcorn)", "PROFIT (unscratched)", "RISK (smoke)", "BAGS (gym locker)", "MEMES (fake grape)", "EARLY (sour milk)"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D-", holdingBags: "A", chasingMemes: "A+", sellingTooEarly: "B" },
    gpa: 1.1,
    traits: {
      Background: "Sticker Sheet",
      Paper: "Scented",
      School: "FOMO Falls Elementary",
      Semester: "Spring 1989",
      Attendance: "Satisfactory",
      "Teacher Comment": "Smells like loss. Scratch Taking Profit. Go on. Nothing.",
      "Pen Marks": "Stickers Instead",
      Doodle: "Smell Lines",
      Stain: "Fake Grape",
      "Parent Signature": "Mom Sniffed It",
      Incident: "Out Of Gold Stars",
      Status: "SMELLS LIKE LOSS",
    },
    extra: { Scent: "Loss" },
  },
  // 31
  {
    slug: "the-airdrop",
    title: "The Airdrop",
    lore:
      "Folded into a paper airplane during fifth period and airdropped to the whole class. It did two loops, clipped " +
      "the ceiling fan and landed directly in the trash can, which Harrow says is where every airdrop ends up " +
      "eventually.",
    thumbnail: "A report card folded into a paper airplane looping into a trash can.",
    visual: {
      composition:
        "The report card folded into a crisp paper airplane, grades visible on the wings, frozen mid-flight on a " +
        "dotted flight path that loops twice across a sky-blue square before diving into a metal classroom wastebasket " +
        "overflowing with other paper airplanes. A ceiling-fan blade clips the top edge. Speed lines.",
      props: ["paper airplane", "dotted flight path", "wastebasket", "other airplanes", "ceiling fan"],
      palette: ["#4FC3F7 sky blue", "#FFFFFF paper", "#9E9E9E wastebasket", "#E3122B grades", "#1B1B1B fan"],
      text: ["AIRDROP", "ELIGIBLE: EVERYONE", "CLAIMED BY: TRASH"],
    },
    grades: { buyingTheTop: "A", takingProfit: "F", riskManagement: "F", holdingBags: "B", chasingMemes: "A+", sellingTooEarly: "A-" },
    gpa: 0.4,
    traits: {
      Background: "Fifth Period Airspace",
      Paper: "Folded (Airplane)",
      School: "Exit Liquidity Charter Academy",
      Semester: "Winter 1999",
      Attendance: "Spotty",
      "Teacher Comment": "Airdropped to the whole class. Claimed by the trash can. As they all are.",
      "Pen Marks": "Crease Lines",
      Doodle: "Flight Path",
      Stain: "Trash Can Juice",
      "Parent Signature": "Unclaimed",
      Incident: "Airdropped",
      Status: "CLAIMED BY TRASH",
    },
  },
  // 32
  {
    slug: "chain-letter",
    title: "Chain Letter",
    lore:
      "THIS REPORT CARD HAS BEEN SENT TO YOU FOR GOOD LUCK. The original is in 1987. It has gone around the school " +
      "nine times. Forward it to ten classmates within 24 hours or your bags will never recover. One student broke " +
      "the chain in 1994 and bought the top the very next morning. Do not break the chain.",
    thumbnail: "A grainy photocopy of a photocopy covered in all-caps chain-letter warnings.",
    visual: {
      composition:
        "A photocopy-of-a-photocopy report card: gray, grainy, dark edges, skewed toner streaks. Handwritten all-caps " +
        "chain-letter text is crammed across the top. Ten smaller photocopied duplicates fan out behind it. A paper " +
        "clip. 'SEND TO 10 FRIENDS' circled in red with a shaky arrow, and one line highlighted in yellow.",
      props: ["degraded photocopy", "fanned duplicates", "paper clip", "highlighter"],
      palette: ["#D9D9D9 photocopy gray", "#222222 toner", "#E3122B circle red", "#FFF200 highlighter", "#FFFFFF paper"],
      text: [
        "THIS REPORT CARD HAS BEEN SENT TO YOU FOR GOOD LUCK",
        "SEND TO 10 FRIENDS WITHIN 24 HOURS",
        "DO NOT BREAK THE CHAIN",
      ],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "D", holdingBags: "A", chasingMemes: "A", sellingTooEarly: "C+" },
    gpa: 1,
    traits: {
      Background: "Photocopier Glass",
      Paper: "Copy Of A Copy Of A Copy",
      School: "Every School (Forwarded)",
      Semester: "Since 1987",
      Attendance: "Forwarded",
      "Teacher Comment": "Whoever started this: I know it was you. I also forwarded it. I'm scared.",
      "Pen Marks": "SEND TO 10 FRIENDS (Circled)",
      Doodle: "Four-Leaf Clover",
      Stain: "Toner Streaks",
      "Parent Signature": "Forwarded To 10 Parents",
      Incident: "Chain Unbroken",
      Status: "DO NOT BREAK THE CHAIN",
    },
    extra: { Copies: "10" },
  },
  // 33
  {
    slug: "sent-to-the-corner",
    title: "Sent To The Corner",
    lore:
      "Sent to sit in the corner for buying the top during a math test. Traded from the corner. The corner is now " +
      "down 70%. The dunce cap has been rugged twice and is on its third developer.",
    thumbnail: "A report card on a stool in the corner wearing a tall paper dunce cap.",
    visual: {
      composition:
        "Two mustard-yellow walls meet in a room corner (one-point perspective). A tall wooden stool sits in the " +
        "corner; the report card sits on it wearing a tall white paper cone hat with a big D. On one wall, a tiny red " +
        "chart doodled in pencil with a downward arrow. Taped to the other wall, a red-pen note from Harrow: FACE THE " +
        "WALL. NOT THE CHART.",
      props: ["room corner", "wooden stool", "paper cone hat", "wall doodle", "taped note"],
      palette: ["#E1A800 mustard wall", "#8B5A2B stool", "#FFFFFF cone hat", "#E3122B red pen", "#6B4E00 shadow"],
      text: ["FACE THE WALL. NOT THE CHART.", "D"],
    },
    grades: { buyingTheTop: "A+", takingProfit: "F", riskManagement: "F", holdingBags: "A-", chasingMemes: "A", sellingTooEarly: "D" },
    gpa: 0.6,
    traits: {
      Background: "The Corner",
      Paper: "1987 Carbon Copy",
      School: "St. Satoshi of the Perpetual Dip",
      Semester: "Winter 1988",
      Attendance: "In The Corner",
      "Teacher Comment": "Face the wall. Not the chart.",
      "Pen Marks": "Taped Note",
      Doodle: "Chart On The Wall",
      Stain: "Stool Splinters",
      "Parent Signature": "Signed From The Doorway",
      Incident: "Cone Hat (Third Developer)",
      Status: "SENT TO THE CORNER",
    },
    extra: { "Corner Performance": "-70%" },
  },
];
