/**
 * Harrow's comment bank for the collection. Each comment is handwritten on the
 * card in red pen and is also the "Teacher Comment" attribute value, so no
 * placeholders: the exact text must repeat across tokens for rarity to work.
 *
 * Every text is ≤ 90 characters. `when` uses the semantics in ./types.ts
 * (AND across fields, OR within one). No `when` = generic, fits any card.
 *
 * Suggested pick order: incident -> status -> subject (high/low) -> attendance,
 * era/season -> generic. Most specific match wins; generics fill the rest.
 */
import type { TeacherComment } from "./types";

export const COMMENTS: readonly TeacherComment[] = [
  // -------------------------------------------------------------------------
  // Generic: fits any card
  // -------------------------------------------------------------------------
  { id: "bright-refuses", tier: "Common", text: "Bright student. Refuses to learn." },
  { id: "generational-wealth", tier: "Common", text: "Talks a lot in class about 'generational wealth.' Has $11." },
  { id: "fire-drill-trading", tier: "Common", text: "Was seen trading during the fire drill. From inside the building." },
  { id: "still-early", tier: "Common", text: "Insists every test is 'still early.'" },
  { id: "gm-every-morning", tier: "Common", text: "Says 'gm' to me every morning. It has never once been a good morning." },
  { id: "the-trenches", tier: "Common", text: "Calls the cafeteria 'the trenches.' It is a cafeteria. There is pudding." },
  { id: "book-report-chart", tier: "Common", text: "Replaced the book report with a chart. The chart went down. So did the grade." },
  { id: "red-candle-notes", tier: "Common", text: "Draws candles instead of taking notes. All red. At least it's honest." },
  { id: "few-understand", tier: "Common", text: "Wrote 'few understand' on the chalkboard. We understand. We are concerned." },
  { id: "this-is-the-bottom", tier: "Common", text: "Has announced 'this is the bottom' eight times this term." },
  { id: "field-trip-dead-coin", tier: "Common", text: "Tried to pay for the field trip in a coin that no longer exists." },
  { id: "followers-bots", tier: "Common", text: "Has 14 followers. 12 are bots. 2 are me, reporting the account." },
  { id: "works-worse-alone", tier: "Common", text: "Does not work well with others. Works even worse alone." },
  { id: "apply-themself", tier: "Common", text: "Needs to apply themself. Applied for a loan instead." },
  { id: "pop-quiz-presale", tier: "Common", text: "Asked if the pop quiz had a presale." },
  { id: "dry-powder", tier: "Common", text: "Refers to lunch money as 'dry powder.'" },
  { id: "show-and-tell-chart", tier: "Common", text: "Brought a chart to show-and-tell. Three classmates cried. One sold." },
  { id: "ser-no", tier: "Uncommon", text: "Calls me 'ser.' I asked them to stop. They said 'ser, no.'" },
  { id: "career-goal", tier: "Common", text: "Career goal: whale. Backup career goal: exit liquidity for a whale." },
  { id: "nfa-spelling", tier: "Uncommon", text: "Signs every assignment 'not financial advice.' It's a spelling test." },
  { id: "lounge-alpha", tier: "Common", text: "Keeps asking for 'alpha' in the teachers' lounge. It's decaf in there." },
  { id: "hamster-advice", tier: "Uncommon", text: "Took financial advice from the class hamster. The hamster is up." },
  { id: "kindergarten-leverage", tier: "Uncommon", text: "Explained leverage to the kindergarteners. Two are now liquidated." },
  { id: "conviction-password", tier: "Common", text: "Uses the word 'conviction' to describe forgetting their password." },
  { id: "influencer", tier: "Common", text: "Wants to be an influencer. Currently influencing me toward early retirement." },
  { id: "mother-father-refund", tier: "Uncommon", text: "Mother requested conference. Father requested a refund." },
  { id: "parents-in-the-trade", tier: "Uncommon", text: "Parents were called. Turns out they were also in the trade." },
  { id: "field-trip-fund", tier: "Uncommon", text: "Traded the class field trip fund. This year's field trip is the parking lot." },
  { id: "retiring-in-may", tier: "Uncommon", text: "31 years of teaching. This card is why I am retiring in May." },
  { id: "including-the-winners", tier: "Common", text: "Every trade this term was a mistake, including the ones that worked." },
  { id: "hand-before-buying", tier: "Common", text: "Must learn to raise hand before speaking. And before buying." },
  { id: "asia-open", tier: "Common", text: "Asleep in class again. Says they were up 'watching the Asia open.'" },

  // -------------------------------------------------------------------------
  // Buying the Top (vice: high = buys tops)
  // -------------------------------------------------------------------------
  { id: "300-candles", tier: "Common", when: { high: ["buyingTheTop"] }, text: "Has been asked repeatedly to stop buying after 300% candles." },
  { id: "grandma-asks", tier: "Common", when: { high: ["buyingTheTop"] }, text: "Only buys after Grandma asks about it. Grandma always asks at the top." },
  { id: "cops-arrive", tier: "Common", when: { high: ["buyingTheTop"] }, text: "Arrives at every party exactly when the cops do." },
  { id: "top-signal", tier: "Common", when: { high: ["buyingTheTop"] }, text: "A natural top signal. Other students check this card before selling." },
  { id: "high-twice", tier: "Uncommon", when: { high: ["buyingTheTop"] }, text: "Bought the high of the year. Twice. Same coin. Same afternoon." },
  { id: "confirmation", tier: "Common", when: { high: ["buyingTheTop"] }, text: "Waits for confirmation. Confirmation is always the top." },
  { id: "sniper-target", tier: "Uncommon", when: { high: ["buyingTheTop"] }, text: "Buys the top with the precision of a sniper who is also the target." },
  { id: "basement", tier: "Uncommon", when: { low: ["buyingTheTop"] }, text: "Never buys the top. Buys the floor, then the basement, then the crawlspace." },
  { id: "early-to-nothing", tier: "Uncommon", when: { low: ["buyingTheTop"] }, text: "Occasionally early. Mostly early to things that never happen." },

  // -------------------------------------------------------------------------
  // Taking Profit (virtue: low = never sells)
  // -------------------------------------------------------------------------
  { id: "sell-assignment", tier: "Common", when: { low: ["takingProfit"] }, text: "Has never once turned in the assignment titled 'sell.'" },
  { id: "up-40x-october", tier: "Common", when: { low: ["takingProfit"] }, text: "Was up 40x in October and would like everyone to know. Is not up now." },
  { id: "unrealized", tier: "Common", when: { low: ["takingProfit"] }, text: "Unrealized gains are not a grade. We have discussed this. Twice." },
  { id: "screenshot", tier: "Common", when: { low: ["takingProfit"] }, text: "Keeps showing me the screenshot. I asked where the money is. Silence." },
  { id: "rode-50x-down", tier: "Uncommon", when: { low: ["takingProfit"] }, text: "Rode a 50x all the way back down to keep it company." },
  { id: "sell-button-trap", tier: "Common", when: { low: ["takingProfit"] }, text: "Believes the sell button is a trap. Has never tested this theory." },
  { id: "standing-ovation", tier: "Uncommon", when: { high: ["takingProfit"] }, text: "Actually sold something. The class gave a standing ovation. One child wept." },
  { id: "notified-authorities", tier: "Uncommon", when: { high: ["takingProfit"] }, text: "Takes profit like an adult. We have notified the authorities." },
  { id: "witchcraft", tier: "Rare", when: { high: ["takingProfit"] }, text: "Sold into a green candle. Classmates think it's witchcraft. Nobody sits near them." },

  // -------------------------------------------------------------------------
  // Risk Management (virtue: low = reckless)
  // -------------------------------------------------------------------------
  { id: "mother-conference", tier: "Common", when: { low: ["riskManagement"] }, text: "Mother requested conference." },
  { id: "leveraged-scissors", tier: "Common", when: { low: ["riskManagement"] }, text: "Was found running with scissors. Leveraged scissors." },
  { id: "hamster-college-fund", tier: "Common", when: { low: ["riskManagement"] }, text: "Put the college fund into a coin with a hamster on the logo." },
  { id: "50x-to-be-safe", tier: "Common", when: { low: ["riskManagement"] }, text: "Uses 50x leverage 'to be safe.'" },
  { id: "slippage-49", tier: "Uncommon", when: { low: ["riskManagement"] }, text: "Set slippage to 49% and called it 'being decisive.'" },
  { id: "seed-phrase-locker", tier: "Uncommon", when: { low: ["riskManagement"] }, text: "Keeps seed phrase taped inside locker door. The locker does not lock." },
  { id: "prayer-caps", tier: "Common", when: { low: ["riskManagement"] }, text: "Does not believe in stop-losses. Believes in prayer and ALL CAPS." },
  { id: "lost-permission-slip", tier: "Uncommon", when: { low: ["riskManagement"] }, text: "Lost the permission slip, the library book and 80% of the college fund." },
  { id: "boring-child", tier: "Uncommon", when: { high: ["riskManagement"] }, text: "Holds 40% stables. The most boring child I have ever loved." },
  { id: "helmet-recess", tier: "Uncommon", when: { high: ["riskManagement"] }, text: "Wears a helmet to recess. Diversified across all four slides." },
  { id: "spreadsheet-locker", tier: "Rare", when: { high: ["riskManagement"] }, text: "Keeps a spreadsheet. Was stuffed in a locker for it. The locker was hedged." },

  // -------------------------------------------------------------------------
  // Holding Bags (vice: high = bagholder)
  // -------------------------------------------------------------------------
  { id: "clearly-died", tier: "Common", when: { high: ["holdingBags"] }, text: "Refuses to let go of things that have clearly died." },
  { id: "locker-smells", tier: "Common", when: { high: ["holdingBags"] }, text: "Locker smells. Locker contains positions from last September." },
  { id: "nurse-posture", tier: "Common", when: { high: ["holdingBags"] }, text: "Carries bags so heavy the nurse is worried about their posture." },
  { id: "long-term-now", tier: "Common", when: { high: ["holdingBags"] }, text: "Now calls it 'long-term investing.' Did not call it that on the way in." },
  { id: "family-heirloom", tier: "Uncommon", when: { high: ["holdingBags"] }, text: "Down 91%. Describes the position as 'a family heirloom.'" },
  { id: "dev-dentist", tier: "Uncommon", when: { high: ["holdingBags"] }, text: "Still holding a coin whose developer has since become a dentist." },
  { id: "travels-light", tier: "Uncommon", when: { low: ["holdingBags"] }, text: "Travels light. Suspiciously light. Where did the bags go." },

  // -------------------------------------------------------------------------
  // Chasing Memes (vice: high = buys cartoon animals)
  // -------------------------------------------------------------------------
  { id: "rockets-desk", tier: "Common", when: { high: ["chasingMemes"] }, text: "Please stop drawing rockets on the desk." },
  { id: "dog-on-it", tier: "Common", when: { high: ["chasingMemes"] }, text: "Cannot be left alone near anything with a dog on it." },
  { id: "fish-sticks", tier: "Uncommon", when: { high: ["chasingMemes"] }, text: "Bought a coin named after the cafeteria fish sticks. It 10x'd. Worst possible lesson." },
  { id: "recess-token", tier: "Uncommon", when: { high: ["chasingMemes"] }, text: "Launched a token called $RECESS during recess. Recess has been canceled." },
  { id: "posters-removed", tier: "Common", when: { high: ["chasingMemes"] }, text: "Buys anything with a cartoon animal on it. We removed the classroom posters." },
  { id: "whitepaper-report", tier: "Common", when: { high: ["chasingMemes"] }, text: "Did the book report on a one-page whitepaper. The report was longer." },
  { id: "milk-caps", tier: "Rare", when: { high: ["chasingMemes"] }, text: "Traded a milk-cap collection for a memecoin. The milk caps are up." },
  { id: "pays-attention", tier: "Uncommon", when: { low: ["chasingMemes"] }, text: "Pays attention in class. The other children find this deeply upsetting." },

  // -------------------------------------------------------------------------
  // Selling Too Early (vice: high = paper hands)
  // -------------------------------------------------------------------------
  { id: "field-trip-early", tier: "Common", when: { high: ["sellingTooEarly"] }, text: "Left the field trip early and missed the good part." },
  { id: "laminating-hands", tier: "Common", when: { high: ["sellingTooEarly"] }, text: "Paper hands. We have tried laminating them." },
  { id: "sold-2x-40x", tier: "Common", when: { high: ["sellingTooEarly"] }, text: "Sold at 2x. It went 40x. Has not spoken since." },
  { id: "first-sign", tier: "Common", when: { high: ["sellingTooEarly"] }, text: "Sells at the first sign of green. Also red. Also lunch." },
  { id: "hands-shake", tier: "Common", when: { high: ["sellingTooEarly"] }, text: "Hands visibly shake during tests. And during green candles." },
  { id: "whole-movie", tier: "Uncommon", when: { low: ["sellingTooEarly"] }, text: "Stays for the whole movie. Even the bad ones. Especially the bad ones." },

  // -------------------------------------------------------------------------
  // Grades on the card
  // -------------------------------------------------------------------------
  { id: "mempool", tier: "Uncommon", when: { anyGrade: ["I"] }, text: "Did not turn in work. Says the work is 'still in the mempool.'" },
  { id: "vesting", tier: "Uncommon", when: { anyGrade: ["I"] }, text: "Incomplete. Student says the assignment is 'vesting.'" },
  { id: "stealth-launch", tier: "Rare", when: { anyGrade: ["I"] }, text: "Turned in a blank page and called it a 'stealth launch.'" },
  { id: "pen-ran-out", tier: "Common", when: { anyGrade: ["F"] }, text: "The red pen ran out halfway down this card. That's on you." },
  { id: "average-down-f", tier: "Common", when: { anyGrade: ["F"] }, text: "An F is not a dip. Please stop averaging down on it." },

  // -------------------------------------------------------------------------
  // Status
  // -------------------------------------------------------------------------
  { id: "suspicious-pleasure", tier: "Epic", when: { status: ["HONOR ROLL"] }, text: "A pleasure to have in class. We are frankly suspicious." },
  { id: "copying-trades", tier: "Epic", when: { status: ["HONOR ROLL"] }, text: "Copies trades from another student. Unfortunately, it's working." },
  { id: "went-to-bed", tier: "Epic", when: { status: ["HONOR ROLL"] }, text: "Took profit, managed risk, went to bed. We don't know what to do with this child." },
  { id: "keep-away", tier: "Epic", when: { status: ["HONOR ROLL"] }, text: "Proud of this one. Keep them away from the other children." },
  { id: "random-search", tier: "Epic", when: { status: ["HONOR ROLL"] }, text: "Excellent term. Wallet has been sent to the office for a random search." },
  { id: "first-in-34", tier: "Legendary", when: { status: ["VALEDICTORIAN"] }, text: "Sold the top, bought the bottom, took the bus home. First one in 34 years." },
  { id: "framed-card", tier: "Legendary", when: { status: ["VALEDICTORIAN"] }, text: "The only student who ever listened. I framed this card. I do not frame things." },
  { id: "one-word-speech", tier: "Legendary", when: { status: ["VALEDICTORIAN"] }, text: "Graduation speech will be one word long. The word is 'sell.'" },
  { id: "when-supervised", tier: "Common", when: { status: ["NEEDS IMPROVEMENT"] }, text: "Shows promise when supervised. Is never supervised." },
  { id: "almost-twice", tier: "Common", when: { status: ["NEEDS IMPROVEMENT"] }, text: "Almost did the right thing twice this semester. Growth." },
  { id: "other-thing", tier: "Common", when: { status: ["NEEDS IMPROVEMENT"] }, text: "Knows exactly what to do. Does the other thing." },
  { id: "b-for-bags", tier: "Common", when: { status: ["NEEDS IMPROVEMENT"] }, text: "Could be a B student if the B didn't stand for 'bags.'" },
  { id: "see-an-advisor", tier: "Common", when: { status: ["NEEDS IMPROVEMENT"] }, text: "Please see me. Actually, please see a financial advisor. Then me." },
  { id: "call-your-mother", tier: "Common", when: { status: ["ACADEMIC PROBATION"] }, text: "One more rug and we call your mother. She has asked us not to." },
  { id: "leveraged-ice", tier: "Common", when: { status: ["ACADEMIC PROBATION"] }, text: "On thin ice. Currently trying to open a leveraged position on the ice." },
  { id: "down-only", tier: "Common", when: { status: ["ACADEMIC PROBATION"] }, text: "Grades are 'down only.' Student insists it's a trend, not a problem." },
  { id: "bought-more", tier: "Common", when: { status: ["ACADEMIC PROBATION"] }, text: "Has until end of term to turn this around. Has already bought more." },
  { id: "statistically-next", tier: "Uncommon", when: { status: ["HELD BACK"] }, text: "Will be repeating this semester. And, statistically, the next one." },
  { id: "same-trade", tier: "Uncommon", when: { status: ["HELD BACK"] }, text: "Repeating the grade. Also repeating the exact same trade." },
  { id: "tallest-kid", tier: "Uncommon", when: { status: ["HELD BACK"] }, text: "Held back again. Now the tallest kid in class. Still buying their tops." },
  { id: "traded-all-three", tier: "Rare", when: { status: ["SUSPENDED"] }, text: "Sent home for three days. Traded all three. Came back worse." },
  { id: "library-pump", tier: "Rare", when: { status: ["SUSPENDED"] }, text: "Suspended for running a pump group out of the library. It was very quiet." },
  { id: "computer-lab-ban", tier: "Rare", when: { status: ["SUSPENDED"] }, text: "Banned from the computer lab until further notice. And the calculator." },
  { id: "good-riddance", tier: "Rare", when: { status: ["EXPELLED"] }, text: "The district has asked me to stop writing 'good riddance.' Good riddance." },
  { id: "tokenize-expulsion", tier: "Rare", when: { status: ["EXPELLED"] }, text: "Expelled. Asked if the expulsion could be tokenized." },
  { id: "one-bag", tier: "Rare", when: { status: ["EXPELLED"] }, text: "Please collect belongings from the front office. It's one bag. It's down 98%." },
  { id: "scissors-traffic", tier: "Rare", when: { status: ["EXPELLED"], low: ["riskManagement"] }, text: "Ran with scissors, into traffic, on 50x. The scissors are fine." },
  { id: "selling-at-lunch", tier: "Uncommon", when: { status: ["MOST LIKELY TO BECOME EXIT LIQUIDITY"] }, text: "Other students have been seen selling to this child at lunch." },
  { id: "music-stops", tier: "Uncommon", when: { status: ["MOST LIKELY TO BECOME EXIT LIQUIDITY"] }, text: "Always the last one holding the ball when the music stops." },
  { id: "whole-class-sold", tier: "Uncommon", when: { status: ["MOST LIKELY TO BECOME EXIT LIQUIDITY"] }, text: "The whole class sold to this student. Every single one. On purpose." },
  { id: "generous-student", tier: "Uncommon", when: { status: ["MOST LIKELY TO BECOME EXIT LIQUIDITY"] }, text: "A generous student. Absorbs everyone's sell orders. Never complains." },
  { id: "before-yearbook", tier: "Uncommon", when: { status: ["MOST LIKELY TO BECOME EXIT LIQUIDITY"] }, text: "Voted 'Most Likely.' Already did it. Before the yearbook came out." },

  // -------------------------------------------------------------------------
  // Incidents (these outrank everything else)
  // -------------------------------------------------------------------------
  { id: "hide-wallets", tier: "Rare", when: { incident: ["WHALE"] }, text: "Referred to Gifted & Talented. Parents are advised to hide their wallets." },
  { id: "snack-time", tier: "Rare", when: { incident: ["WHALE"] }, text: "Moved the entire market during snack time. Please leave some for the others." },
  { id: "bought-cafeteria", tier: "Rare", when: { incident: ["WHALE"] }, text: "Bought the cafeteria. We do not know how to discipline a shareholder." },
  { id: "ice-pack", tier: "Uncommon", when: { incident: ["RUGGED"] }, text: "Sent to the nurse after a token pulled the rug. Ice pack administered." },
  { id: "still-building", tier: "Uncommon", when: { incident: ["RUGGED"] }, text: "Dev ran off with the lunch money. Student insists dev is 'still building.'" },
  { id: "dead-group-chat", tier: "Uncommon", when: { incident: ["RUGGED"] }, text: "Still in the group chat for a coin that no longer exists. Still says gm." },
  { id: "spelling-test", tier: "Rare", when: { incident: ["LIQUIDATED"] }, text: "Liquidated during a spelling test. Spelled 'margin call' correctly, at least." },
  { id: "lunch-money-loan", tier: "Rare", when: { incident: ["LIQUIDATED"] }, text: "Borrowed against lunch money to buy more lunch money." },
  { id: "filmstrip", tier: "Rare", when: { incident: ["LIQUIDATED"] }, text: "Fell asleep during the filmstrip. Woke up liquidated." },
  { id: "tray-thrown", tier: "Uncommon", when: { incident: ["FIGHT_IN_CAFETERIA"] }, text: "Twelve trades in one lunch period. A tray was thrown. So was a chart." },
  { id: "tot-market-cap", tier: "Uncommon", when: { incident: ["FIGHT_IN_CAFETERIA"] }, text: "Involved in a cafeteria altercation over the market cap of a tot." },
  { id: "31-hall-passes", tier: "Uncommon", when: { incident: ["HALL_PASS"] }, text: "Asked for the hall pass 31 times. Transferred everything to 'a friend.'" },
  { id: "bathroom-october", tier: "Uncommon", when: { incident: ["HALL_PASS"] }, text: "Left for the bathroom in October. The wallet has not returned." },
  { id: "tell-no-one", tier: "Uncommon", when: { incident: ["CONFISCATED_NOTE"] }, text: "Caught passing a note: '100x, tell no one.' It had been passed to 31 people." },
  { id: "ketchup-protein", tier: "Rare", when: { incident: ["LUNCH_IOU"] }, text: "Spent lunch money on gas fees. Ate a ketchup packet for protein." },
  { id: "bus-never-back", tier: "Epic", when: { incident: ["PERMISSION_SLIP"] }, text: "Forged a permission slip for a 100x leverage field trip. The bus never came back." },

  // -------------------------------------------------------------------------
  // Attendance
  // -------------------------------------------------------------------------
  { id: "not-slept", tier: "Uncommon", when: { attendance: ["PERFECT"] }, text: "Perfect attendance. Has not slept since the chain launched." },
  { id: "never-misses-top", tier: "Uncommon", when: { attendance: ["PERFECT"], high: ["buyingTheTop"] }, text: "Never misses a day. Never misses a top." },
  { id: "chart-class-pet", tier: "Common", when: { attendance: ["EXCELLENT"] }, text: "Always here early. Brings the chart to homeroom like it's the class pet." },
  { id: "one-minute-chart", tier: "Common", when: { attendance: ["SATISFACTORY"] }, text: "Physically present. Mentally watching a one-minute chart." },
  { id: "green-days", tier: "Common", when: { attendance: ["SPOTTY"] }, text: "Only comes to school on green days." },
  { id: "hides-red", tier: "Common", when: { attendance: ["SPOTTY"] }, text: "Shows up when it's green. Hides in the nurse's office when it's red." },
  { id: "doctors-note", tier: "Uncommon", when: { attendance: ["CHRONICALLY ABSENT"] }, text: "Absent 31 days. Doctor's note was a screenshot of a chart." },
  { id: "joy-when-absent", tier: "Uncommon", when: { attendance: ["CHRONICALLY ABSENT", "NEVER SHOWED UP"] }, text: "A joy to have in class when absent. Which is always." },
  { id: "still-rugged", tier: "Rare", when: { attendance: ["NEVER SHOWED UP"] }, text: "Never came to class. Still somehow got rugged." },

  // -------------------------------------------------------------------------
  // Era / season
  // -------------------------------------------------------------------------
  { id: "stop-sniffing", tier: "Rare", when: { era: ["mimeograph"] }, text: "Stop sniffing the report card. It is not going to get better." },
  { id: "printer-jammed", tier: "Uncommon", when: { era: ["1994-dot-matrix"] }, text: "The printer jammed on this student's grades. Even the printer has limits." },
  { id: "y2k-survived", tier: "Uncommon", when: { era: ["1999-office-laser"] }, text: "Prepared for Y2K by buying a coin called $Y2K. The computers survived. The coin did not." },
  { id: "pink-copy", tier: "Uncommon", when: { era: ["1987-carbon"] }, text: "The pink copy was supposed to go to a parent. It went to the group chat." },
  { id: "tan-lines", tier: "Uncommon", when: { season: ["SUMMER"] }, text: "Summer school again. Tan lines are from the monitor." },
  { id: "failing-summer", tier: "Uncommon", when: { season: ["SUMMER"] }, text: "Failed the regular year. Now failing the summer. Consistency is something." },
  { id: "snow-day-blanket", tier: "Common", when: { season: ["WINTER"] }, text: "Snow day. School closed. Market didn't. Lost money from under a blanket." },
  { id: "spring-broke", tier: "Common", when: { season: ["SPRING"] }, text: "Came back from spring break broke. Did not go anywhere." },
  { id: "school-supplies", tier: "Common", when: { season: ["FALL"] }, text: "Back-to-school supplies: pencils, eraser, 40x leverage." },
];
