export const TIERS = {
  hof:      { label: 'Hall of Fame', color: '#92700a', bg: '#fef3c7' },
  'all-nba':{ label: 'All-NBA',     color: '#0d7377', bg: '#ccfbf1' },
  'all-star':{ label: 'All-Star',   color: '#1d4ed8', bg: '#dbeafe' },
  starter:  { label: 'Starter',     color: '#15803d', bg: '#dcfce7' },
  rotation: { label: 'Rotation',    color: '#374151', bg: '#d1d5db' },
  bust:     { label: 'Bust',        color: '#dc2626', bg: '#fee2e2' },
  tbd:      { label: 'TBD',         color: '#9ca3af', bg: '#f9fafb' },
}

const JAZZ_DRAFT_HISTORY = [
  // ── 2025 ──
  { year: 2025, round: 1, pick: 5, name: 'Ace Bailey', position: 'SF', college: 'Rutgers', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 4873138,
    ageAtDraft: 18.9, height: "6'10", heightIn: 82, country: 'USA', collegeStats: { ppg: 15.9, rpg: 7.3, apg: 1.2, threePct: 30.1 } },
  { year: 2025, round: 1, pick: 18, name: 'Walter Clayton Jr.', position: 'PG', college: 'Florida', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'tbd', note: 'Traded to MEM Feb 2026', espnId: 4896372,
    ageAtDraft: 22.3, height: "6'2", heightIn: 74, country: 'USA', collegeStats: { ppg: 17.1, rpg: 3.1, apg: 4.5, threePct: 38.1 } },

  // ── 2024 ──
  { year: 2024, round: 1, pick: 10, name: 'Cody Williams', position: 'SF', college: 'Colorado', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 4895758,
    ageAtDraft: 19.6, height: "6'8", heightIn: 80, country: 'USA', collegeStats: { ppg: 11.9, rpg: 3.0, apg: 1.4, threePct: 41.5 } },
  { year: 2024, round: 1, pick: 29, name: 'Isaiah Collier', position: 'PG', college: 'USC', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 4683766,
    ageAtDraft: 19.7, height: "6'5", heightIn: 77, country: 'USA', collegeStats: { ppg: 16.3, rpg: 2.9, apg: 4.3, threePct: 32.0 } },
  { year: 2024, round: 2, pick: 32, name: 'Kyle Filipowski', position: 'C', college: 'Duke', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 4684793,
    ageAtDraft: 20.6, height: "6'11", heightIn: 83, country: 'USA', collegeStats: { ppg: 16.4, rpg: 8.3, apg: 2.8, threePct: 34.8 } },

  // ── 2023 ──
  { year: 2023, round: 1, pick: 9, name: 'Taylor Hendricks', position: 'PF', college: 'UCF', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 4684806,
    ageAtDraft: 19.6, height: "6'9", heightIn: 81, country: 'USA', collegeStats: { ppg: 13.4, rpg: 7.3, apg: 0.6, threePct: 39.4 } },
  { year: 2023, round: 1, pick: 16, name: 'Keyonte George', position: 'SG', college: 'Baylor', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 4433627,
    ageAtDraft: 19.6, height: "6'4", heightIn: 76, country: 'USA', collegeStats: { ppg: 15.3, rpg: 2.8, apg: 3.4, threePct: 32.0 } },
  { year: 2023, round: 1, pick: 28, name: 'Brice Sensabaugh', position: 'SF', college: 'Ohio State', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: true, peakTier: 'tbd', note: '', espnId: 5105839,
    ageAtDraft: 19.7, height: "6'6", heightIn: 78, country: 'USA', collegeStats: { ppg: 16.3, rpg: 3.0, apg: 1.6, threePct: 36.0 } },

  // ── 2022 ──
  { year: 2022, round: 1, pick: 22, name: 'Walker Kessler', position: 'C', college: 'Auburn', yearsNba: 3, yearsWithJazz: 3, stillOnTeam: true, peakTier: 'starter', note: 'Acquired via trade on draft night', espnId: 4433136,
    ageAtDraft: 20.9, height: "7'1", heightIn: 85, country: 'USA', collegeStats: { ppg: 11.4, rpg: 8.1, apg: 0.6, threePct: null } },
  { year: 2022, round: 1, pick: 25, name: 'Ochai Agbaji', position: 'SG', college: 'Kansas', yearsNba: 3, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'rotation', note: 'Traded to CLE in Mitchell deal', espnId: 4397018,
    ageAtDraft: 22.2, height: "6'5", heightIn: 77, country: 'USA', collegeStats: { ppg: 18.8, rpg: 5.1, apg: 1.5, threePct: 40.8 } },

  // ── 2021 ──
  { year: 2021, round: 2, pick: 40, name: 'Jared Butler', position: 'PG', college: 'Baylor', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 4395695,
    ageAtDraft: 20.8, height: "6'3", heightIn: 75, country: 'USA', collegeStats: { ppg: 16.7, rpg: 4.0, apg: 3.6, threePct: 41.6 } },

  // ── 2020 ──
  { year: 2020, round: 1, pick: 23, name: 'Udoka Azubuike', position: 'C', college: 'Kansas', yearsNba: 4, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'bust', note: 'Injuries limited career', espnId: 4066299,
    ageAtDraft: 20.8, height: "7'0", heightIn: 84, country: 'USA', collegeStats: { ppg: 13.7, rpg: 10.5, apg: 0.8, threePct: null } },

  // ── 2019 ──
  { year: 2019, round: 2, pick: 53, name: 'Jarrell Brantley', position: 'PF', college: 'Charleston', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 3912292,
    ageAtDraft: 23.0, height: "6'7", heightIn: 79, country: 'USA', collegeStats: { ppg: 19.4, rpg: 8.4, apg: 2.4, threePct: 32.8 } },
  { year: 2019, round: 2, pick: 41, name: 'Miye Oni', position: 'SG', college: 'Yale', yearsNba: 3, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 4066851,
    ageAtDraft: 21.9, height: "6'5", heightIn: 77, country: 'USA', collegeStats: { ppg: 17.1, rpg: 6.3, apg: 3.6, threePct: 34.5 } },

  // ── 2018 ──
  { year: 2018, round: 1, pick: 21, name: 'Grayson Allen', position: 'SG', college: 'Duke', yearsNba: 7, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'starter', note: 'Traded to MEM 2020', espnId: 3135045,
    ageAtDraft: 22.7, height: "6'4", heightIn: 76, country: 'USA', collegeStats: { ppg: 15.5, rpg: 3.3, apg: 4.6, threePct: 37.2 } },

  // ── 2017 ──
  { year: 2017, round: 1, pick: 13, name: 'Donovan Mitchell', position: 'SG', college: 'Louisville', yearsNba: 8, yearsWithJazz: 5, stillOnTeam: false, peakTier: 'all-nba', note: 'Traded to CLE 2022', espnId: 3908809,
    ageAtDraft: 20.8, height: "6'3", heightIn: 75, country: 'USA', collegeStats: { ppg: 15.6, rpg: 4.9, apg: 2.7, threePct: 35.4 } },
  { year: 2017, round: 2, pick: 38, name: 'Tony Bradley', position: 'C', college: 'North Carolina', yearsNba: 8, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 4065673,
    ageAtDraft: 19.5, height: "6'10", heightIn: 82, country: 'USA', collegeStats: { ppg: 7.5, rpg: 5.1, apg: 0.5, threePct: null } },

  // ── 2015 ──
  { year: 2015, round: 1, pick: 12, name: 'Trey Lyles', position: 'PF', college: 'Kentucky', yearsNba: 6, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 3136196,
    ageAtDraft: 19.6, height: "6'10", heightIn: 82, country: 'Canada', collegeStats: { ppg: 8.7, rpg: 5.2, apg: 1.1, threePct: 13.8 } },
  { year: 2015, round: 2, pick: 46, name: 'Olivier Hanlan', position: 'SG', college: 'Boston College', yearsNba: 0, yearsWithJazz: 0, stillOnTeam: false, peakTier: 'bust', note: 'Never played in NBA', espnId: 2982192,
    ageAtDraft: 22.4, height: "6'4", heightIn: 76, country: 'Canada', collegeStats: { ppg: 19.5, rpg: 4.2, apg: 4.2, threePct: 35.3 } },

  // ── 2014 ──
  { year: 2014, round: 1, pick: 5, name: 'Dante Exum', position: 'PG', college: 'Australia', yearsNba: 7, yearsWithJazz: 5, stillOnTeam: false, peakTier: 'rotation', note: 'Injuries limited career', espnId: 3102528,
    ageAtDraft: 18.9, height: "6'5", heightIn: 77, country: 'Australia' },
  { year: 2014, round: 1, pick: 23, name: 'Rodney Hood', position: 'SG', college: 'Duke', yearsNba: 8, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'starter', note: 'Traded to CLE 2019', espnId: 2581177,
    ageAtDraft: 21.7, height: "6'8", heightIn: 80, country: 'USA', collegeStats: { ppg: 16.1, rpg: 3.7, apg: 2.1, threePct: 42.1 } },

  // ── 2013 ──
  { year: 2013, round: 1, pick: 9, name: 'Trey Burke', position: 'PG', college: 'Michigan', yearsNba: 8, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'rotation', note: 'Acquired via trade from MIN on draft night', espnId: 2528779,
    ageAtDraft: 20.6, height: "6'1", heightIn: 73, country: 'USA', collegeStats: { ppg: 18.6, rpg: 3.2, apg: 6.7, threePct: 38.4 } },
  { year: 2013, round: 1, pick: 27, name: 'Rudy Gobert', position: 'C', college: 'France', yearsNba: 13, yearsWithJazz: 9, stillOnTeam: false, peakTier: 'all-nba', note: '3x DPOY, traded to MIN 2022. Future Hall of Famer', espnId: 3032976,
    ageAtDraft: 21.0, height: "7'1", heightIn: 85, country: 'France' },

  // ── 2012 ──
  { year: 2012, round: 2, pick: 47, name: 'Kevin Murphy', position: 'SG', college: 'Tennessee Tech', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 6613,
    ageAtDraft: 22.3, height: "6'7", heightIn: 79, country: 'USA', collegeStats: { ppg: 22.3, rpg: 4.2, apg: 2.7, threePct: 39.2 } },

  // ── 2011 ──
  { year: 2011, round: 1, pick: 3, name: 'Enes Kanter', position: 'C', college: 'Kentucky', yearsNba: 11, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'starter', note: 'Traded to OKC 2015', espnId: 6447,
    ageAtDraft: 19.1, height: "6'11", heightIn: 83, country: 'Turkey' },
  { year: 2011, round: 1, pick: 12, name: 'Alec Burks', position: 'SG', college: 'Colorado', yearsNba: 13, yearsWithJazz: 8, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 6429,
    ageAtDraft: 19.9, height: "6'6", heightIn: 78, country: 'USA', collegeStats: { ppg: 15.5, rpg: 4.6, apg: 2.7, threePct: 37.6 } },

  // ── 2010 ──
  { year: 2010, round: 1, pick: 9, name: 'Gordon Hayward', position: 'SF', college: 'Butler', yearsNba: 14, yearsWithJazz: 7, stillOnTeam: false, peakTier: 'all-star', note: 'Left in free agency 2017', espnId: 4249,
    ageAtDraft: 20.3, height: "6'8", heightIn: 80, country: 'USA', collegeStats: { ppg: 15.5, rpg: 6.2, apg: 1.8, threePct: 36.5 } },
  { year: 2010, round: 2, pick: 38, name: 'Jeremy Evans', position: 'PF', college: 'Western Kentucky', yearsNba: 7, yearsWithJazz: 5, stillOnTeam: false, peakTier: 'rotation', note: 'Slam Dunk Contest winner 2012', espnId: 4295,
    ageAtDraft: 22.7, height: "6'9", heightIn: 81, country: 'USA', collegeStats: { ppg: 10.7, rpg: 5.7, apg: 0.5, threePct: null } },

  // ── 2008 ──
  { year: 2008, round: 2, pick: 38, name: 'Kosta Koufos', position: 'C', college: 'Ohio State', yearsNba: 10, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 3444,
    ageAtDraft: 19.3, height: "7'0", heightIn: 84, country: 'USA', collegeStats: { ppg: 10.5, rpg: 6.4, apg: 0.7, threePct: null } },

  // ── 2007 ──
  { year: 2007, round: 2, pick: 46, name: 'Morris Almond', position: 'SG', college: 'Rice', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 3188,
    ageAtDraft: 22.4, height: "6'6", heightIn: 78, country: 'USA', collegeStats: { ppg: 25.3, rpg: 4.5, apg: 1.4, threePct: 35.4 } },

  // ── 2006 ──
  { year: 2006, round: 2, pick: 35, name: 'Dee Brown', position: 'PG', college: 'Illinois', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 2994,
    ageAtDraft: 21.9, height: "5'11", heightIn: 71, country: 'USA', collegeStats: { ppg: 12.0, rpg: 3.5, apg: 5.4, threePct: 42.3 } },
  { year: 2006, round: 2, pick: 55, name: 'Paul Millsap', position: 'PF', college: 'Louisiana Tech', yearsNba: 17, yearsWithJazz: 7, stillOnTeam: false, peakTier: 'all-star', note: '4x All-Star, left in FA 2013', espnId: 3015,
    ageAtDraft: 21.4, height: "6'8", heightIn: 80, country: 'USA', collegeStats: { ppg: 17.3, rpg: 10.0, apg: 1.4, threePct: null } },

  // ── 2005 ──
  { year: 2005, round: 1, pick: 6, name: 'Deron Williams', position: 'PG', college: 'Illinois', yearsNba: 12, yearsWithJazz: 6, stillOnTeam: false, peakTier: 'all-nba', note: 'Traded to NJN 2011', espnId: 2798,
    ageAtDraft: 21.0, height: "6'3", heightIn: 75, country: 'USA', collegeStats: { ppg: 12.5, rpg: 2.8, apg: 6.4, threePct: 41.3 } },
  { year: 2005, round: 1, pick: 27, name: 'C.J. Miles', position: 'SF', college: 'Skyline HS (TX)', yearsNba: 14, yearsWithJazz: 7, stillOnTeam: false, peakTier: 'rotation', note: 'Drafted out of high school', espnId: 2778,
    ageAtDraft: 18.3, height: "6'6", heightIn: 78, country: 'USA' },

  // ── 2004 ──
  { year: 2004, round: 1, pick: 16, name: 'Kirk Snyder', position: 'SG', college: 'Nevada', yearsNba: 3, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 2445,
    ageAtDraft: 21.1, height: "6'6", heightIn: 78, country: 'USA', collegeStats: { ppg: 19.1, rpg: 4.9, apg: 2.9, threePct: 33.3 } },
  { year: 2004, round: 1, pick: 14, name: 'Kris Humphries', position: 'PF', college: 'Minnesota', yearsNba: 13, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 2433,
    ageAtDraft: 19.4, height: "6'9", heightIn: 81, country: 'USA', collegeStats: { ppg: 21.7, rpg: 10.1, apg: 1.4, threePct: 31.9 } },
  { year: 2004, round: 2, pick: 57, name: 'Pavel Podkolzin', position: 'C', college: 'Russia', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 2441,
    ageAtDraft: 19.4, height: "7'5", heightIn: 89, country: 'Russia' },

  // ── 2003 ──
  { year: 2003, round: 1, pick: 19, name: 'Sasha Pavlovic', position: 'SF', college: 'Montenegro', yearsNba: 8, yearsWithJazz: 0, stillOnTeam: false, peakTier: 'rotation', note: 'Traded to CLE on draft night', espnId: 2430,
    ageAtDraft: 19.6, height: "6'7", heightIn: 79, country: 'Montenegro' },
  { year: 2003, round: 2, pick: 47, name: 'Mo Williams', position: 'PG', college: 'Alabama', yearsNba: 14, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'all-star', note: '1x All-Star (2009)', espnId: 2443,
    ageAtDraft: 20.5, height: "6'1", heightIn: 73, country: 'USA', collegeStats: { ppg: 18.2, rpg: 3.3, apg: 6.0, threePct: 41.0 } },

  // ── 2002 ──
  { year: 2002, round: 2, pick: 34, name: 'Ryan Humphrey', position: 'PF', college: 'Notre Dame', yearsNba: 1, yearsWithJazz: 0, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 1714,
    ageAtDraft: 22.9, height: "6'8", heightIn: 80, country: 'USA', collegeStats: { ppg: 13.3, rpg: 8.1, apg: 0.8, threePct: null } },

  // ── 2001 ──
  { year: 2001, round: 2, pick: 33, name: 'Raul Lopez', position: 'PG', college: 'Spain', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 1011,
    ageAtDraft: 21.2, height: "6'0", heightIn: 72, country: 'Spain' },

  // ── 2000 ──
  { year: 2000, round: 2, pick: 34, name: 'DeShawn Stevenson', position: 'SG', college: 'Washington Union HS', yearsNba: 13, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'rotation', note: 'Drafted out of high school', espnId: 808,
    ageAtDraft: 19.2, height: "6'5", heightIn: 77, country: 'USA' },

  // ── 1999 ──
  { year: 1999, round: 1, pick: 14, name: 'Quincy Lewis', position: 'SF', college: 'Minnesota', yearsNba: 3, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 470,
    ageAtDraft: 22.0, height: "6'7", heightIn: 79, country: 'USA', collegeStats: { ppg: 18.5, rpg: 5.1, apg: 2.1, threePct: 37.0 } },
  { year: 1999, round: 2, pick: 37, name: 'Scott Padgett', position: 'PF', college: 'Kentucky', yearsNba: 4, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 630,
    ageAtDraft: 23.2, height: "6'9", heightIn: 81, country: 'USA', collegeStats: { ppg: 11.0, rpg: 6.1, apg: 1.1, threePct: 42.7 } },

  // ── 1998 ──
  { year: 1998, round: 2, pick: 52, name: 'Nazr Mohammed', position: 'C', college: 'Kentucky', yearsNba: 18, yearsWithJazz: 0, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 568,
    ageAtDraft: 20.8, height: "6'10", heightIn: 82, country: 'USA', collegeStats: { ppg: 9.2, rpg: 5.8, apg: 0.5, threePct: null } },

  // ── 1997 ──
  { year: 1997, round: 1, pick: 27, name: 'Jacque Vaughn', position: 'PG', college: 'Kansas', yearsNba: 12, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'rotation', note: 'Backup to Stockton', espnId: 862,
    ageAtDraft: 22.4, height: "6'1", heightIn: 73, country: 'USA', collegeStats: { ppg: 11.8, rpg: 2.8, apg: 6.2, threePct: 42.2 } },

  // ── 1996 ──
  { year: 1996, round: 1, pick: 14, name: 'Martin Muursepp', position: 'SF', college: 'Estonia', yearsNba: 2, yearsWithJazz: 0, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 3799,
    ageAtDraft: 21.7, height: "6'9", heightIn: 81, country: 'Estonia' },
  { year: 1996, round: 2, pick: 43, name: 'Shandon Anderson', position: 'SG', college: 'Georgia', yearsNba: 6, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 17,
    ageAtDraft: 22.5, height: "6'6", heightIn: 78, country: 'USA' },

  // ── 1995 ──
  { year: 1995, round: 1, pick: 22, name: 'Greg Ostertag', position: 'C', college: 'Kansas', yearsNba: 11, yearsWithJazz: 11, stillOnTeam: false, peakTier: 'starter', note: 'Finals run 1997-98', espnId: 622,
    ageAtDraft: 22.3, height: "7'2", heightIn: 86, country: 'USA', collegeStats: { ppg: 10.1, rpg: 6.7, apg: 0.6, threePct: null } },

  // ── 1994 ──
  { year: 1994, round: 2, pick: 45, name: 'Jamie Watson', position: 'SF', college: 'South Carolina', yearsNba: 4, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 1049,
    ageAtDraft: 22.3, height: "6'7", heightIn: 79, country: 'USA' },

  // ── 1993 ──
  { year: 1993, round: 1, pick: 16, name: 'Luther Wright', position: 'C', college: 'Seton Hall', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: 'Career cut short', espnId: 1684,
    ageAtDraft: 21.8, height: "7'2", heightIn: 86, country: 'USA' },

  // ── 1990 ──
  { year: 1990, round: 2, pick: 54, name: 'Walter Palmer', position: 'C', college: 'Dartmouth', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 5768,
    ageAtDraft: 21.7, height: "7'1", heightIn: 85, country: 'USA' },

  // ── 1989 ──
  { year: 1989, round: 1, pick: 23, name: 'Blue Edwards', position: 'SG', college: 'East Carolina', yearsNba: 10, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 3695,
    ageAtDraft: 23.6, height: "6'4", heightIn: 76, country: 'USA', collegeStats: { ppg: 17.2, rpg: 6.4, apg: 3.2, threePct: null } },

  // ── 1988 ──
  { year: 1988, round: 1, pick: 22, name: 'Eric Leckner', position: 'C', college: 'Wyoming', yearsNba: 3, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 3760,
    ageAtDraft: 22.1, height: "6'11", heightIn: 83, country: 'USA' },

  // ── 1987 ──
  { year: 1987, round: 1, pick: 13, name: 'Jose Ortiz', position: 'SF', college: 'Oregon State', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 5751,
    ageAtDraft: 23.7, height: "6'10", heightIn: 82, country: 'Puerto Rico' },

  // ── 1985 ──
  { year: 1985, round: 1, pick: 13, name: 'Karl Malone', position: 'PF', college: 'Louisiana Tech', yearsNba: 19, yearsWithJazz: 18, stillOnTeam: false, peakTier: 'hof', note: '2x MVP, 14x All-Star, all-time great', espnId: 501,
    ageAtDraft: 21.9, height: "6'9", heightIn: 81, country: 'USA', collegeStats: { ppg: 18.7, rpg: 9.3, apg: 0.5, threePct: null } },
  { year: 1985, round: 2, pick: 36, name: 'Carey Scurry', position: 'SF', college: 'Long Island', yearsNba: 2, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 6000,
    ageAtDraft: 22.6, height: "6'9", heightIn: 81, country: 'USA' },

  // ── 1984 ──
  { year: 1984, round: 1, pick: 16, name: 'John Stockton', position: 'PG', college: 'Gonzaga', yearsNba: 19, yearsWithJazz: 19, stillOnTeam: false, peakTier: 'hof', note: 'All-time assists & steals leader', espnId: 812,
    ageAtDraft: 22.3, height: "6'1", heightIn: 73, country: 'USA', collegeStats: { ppg: 20.9, rpg: 3.6, apg: 7.2, threePct: null } },
  { year: 1984, round: 4, pick: 78, name: 'Bob Hansen', position: 'SG', college: 'Iowa', yearsNba: 9, yearsWithJazz: 9, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 5102,
    ageAtDraft: 23.4, height: "6'6", heightIn: 78, country: 'USA', collegeStats: { ppg: 15.4, rpg: 5.7, apg: 2.0, threePct: null } },

  // ── 1983 ──
  { year: 1983, round: 1, pick: 7, name: 'Thurl Bailey', position: 'PF', college: 'NC State', yearsNba: 12, yearsWithJazz: 8, stillOnTeam: false, peakTier: 'starter', note: '', espnId: 3633,
    ageAtDraft: 22.2, height: "6'11", heightIn: 83, country: 'USA', collegeStats: { ppg: 12.8, rpg: 5.3, apg: 1.3, threePct: null } },
  { year: 1983, round: 2, pick: 30, name: 'Mitchell Anderson', position: 'SF', college: 'Bradley', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 4434,
    ageAtDraft: 22.7, height: "6'8", heightIn: 80, country: 'USA' },

  // ── 1982 ──
  { year: 1982, round: 2, pick: 35, name: 'Marc Iavaroni', position: 'PF', college: 'Virginia', yearsNba: 5, yearsWithJazz: 0, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 5220,
    ageAtDraft: 25.8, height: "6'8", heightIn: 80, country: 'USA' },

  // ── 1981 ──
  { year: 1981, round: 2, pick: 42, name: 'Danny Schayes', position: 'C', college: 'Syracuse', yearsNba: 18, yearsWithJazz: 2, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 3613,
    ageAtDraft: 22.1, height: "6'11", heightIn: 83, country: 'USA' },

  // ── 1980 ──
  { year: 1980, round: 1, pick: 2, name: 'Darrell Griffith', position: 'SG', college: 'Louisville', yearsNba: 10, yearsWithJazz: 10, stillOnTeam: false, peakTier: 'starter', note: 'ROY 1981, moved to SLC with team', espnId: 5063,
    ageAtDraft: 22.0, height: "6'4", heightIn: 76, country: 'USA', collegeStats: { ppg: 22.9, rpg: 4.8, apg: 2.2, threePct: null } },
  { year: 1980, round: 2, pick: 25, name: 'John Duren', position: 'PG', college: 'Georgetown', yearsNba: 4, yearsWithJazz: 3, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 4864,
    ageAtDraft: 21.7, height: "6'3", heightIn: 75, country: 'USA' },

  // ── 1979 ──
  { year: 1979, round: 1, pick: 16, name: 'Larry Knight', position: 'SF', college: 'Loyola Chicago', yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '',
    ageAtDraft: 22.6, height: "6'8", heightIn: 80, country: 'USA' },

  // ── 1978 ──
  { year: 1978, round: 1, pick: 5, name: 'James Hardy', position: 'SF', college: 'San Francisco', yearsNba: 4, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 5109,
    ageAtDraft: 21.6, height: "6'9", heightIn: 81, country: 'USA' },

  // ── 1977 ──
  { year: 1977, round: 1, pick: 7, name: 'Essie Hollis', position: 'SF', college: "St. Bonaventure", yearsNba: 1, yearsWithJazz: 1, stillOnTeam: false, peakTier: 'bust', note: '', espnId: 5182,
    ageAtDraft: 22.1, height: "6'6", heightIn: 78, country: 'USA' },

  // ── 1976 ──
  { year: 1976, round: 1, pick: 11, name: 'Adrian Dantley', position: 'SF', college: 'Notre Dame', yearsNba: 15, yearsWithJazz: 7, stillOnTeam: false, peakTier: 'hof', note: '6x All-Star, ROY; acquired in trade', espnId: 4777,
    ageAtDraft: 21.3, height: "6'5", heightIn: 77, country: 'USA', collegeStats: { ppg: 28.6, rpg: 10.1, apg: 1.8, threePct: null } },

  // ── 1975 ──
  { year: 1975, round: 1, pick: 11, name: 'Rich Kelley', position: 'C', college: 'Stanford', yearsNba: 11, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'starter', note: '', espnId: 5329,
    ageAtDraft: 22.3, height: "7'0", heightIn: 84, country: 'USA' },
  { year: 1975, round: 2, pick: 29, name: 'Aaron James', position: 'SF', college: 'Grambling State', yearsNba: 5, yearsWithJazz: 5, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 5238,
    ageAtDraft: 22.7, height: "6'8", heightIn: 80, country: 'USA' },

  // ── 1974 ──
  { year: 1974, round: 1, pick: 4, name: 'Pete Maravich', position: 'SG', college: 'LSU', yearsNba: 10, yearsWithJazz: 6, stillOnTeam: false, peakTier: 'hof', note: "Franchise's first major pick; 'Pistol Pete'", espnId: 4150,
    ageAtDraft: 27.0, height: "6'5", heightIn: 77, country: 'USA', collegeStats: { ppg: 44.2, rpg: 5.1, apg: 5.1, threePct: null } },
  { year: 1974, round: 2, pick: 22, name: 'Nate Williams', position: 'SF', college: 'Utah State', yearsNba: 4, yearsWithJazz: 4, stillOnTeam: false, peakTier: 'rotation', note: '', espnId: 2507,
    ageAtDraft: 24.1, height: "6'5", heightIn: 77, country: 'USA' },
]

export default JAZZ_DRAFT_HISTORY

export const DRAFT_NIGHT_TRADES = [
  { year: 1974, type: 'in', pick: 4, player: 'Pete Maravich', details: 'Acquired from ATL for 2 future 1sts, 2 future 2nds, expansion draft picks & pick swap options' },
  { year: 1979, type: 'out', pick: 1, player: 'Magic Johnson', details: 'LAL selected #1; Jazz traded pick to LAL as compensation for signing Gail Goodrich' },
  { year: 1982, type: 'out', pick: 3, player: 'Dominique Wilkins', details: 'Traded to ATL for John Drew, Freeman Williams & cash' },
  { year: 1986, type: 'out', pick: 18, player: 'Dell Curry', details: 'Traded to CLE with Kent Benson for Mel Turpin & Darryl Dawkins' },
  { year: 1992, type: 'out', pick: 23, player: 'Eric Murdock', details: 'Traded to MIL with Blue Edwards & 1st for Jay Humphries & Larry Krystkowiak' },
  { year: 1998, type: 'out', pick: 29, player: 'Nazr Mohammed', details: 'Traded rights to PHI for future 1st (became Quincy Lewis #14 in 1999)' },
  { year: 2003, type: 'out', pick: 19, player: 'Sasha Pavlovic', details: 'Traded to CLE on draft night' },
  { year: 2013, type: 'in', pick: 27, player: 'Rudy Gobert', details: 'Acquired from DEN for #46 pick (Erick Green) & cash' },
  { year: 2013, type: 'out', pick: 14, player: 'Shabazz Muhammad', details: 'Traded to MIN with #21 (Gorgui Dieng) for #9 (Trey Burke)' },
  { year: 2013, type: 'in', pick: 9, player: 'Trey Burke', details: 'Acquired from MIN for #14 (Shabazz Muhammad) & #21 (Gorgui Dieng)' },
  { year: 2017, type: 'in', pick: 13, player: 'Donovan Mitchell', details: 'Acquired from DEN for #13 pick (Tyler Lydon) & Trey Lyles' },
  { year: 2016, type: 'out', pick: 12, player: 'Taurean Prince', details: 'Drafted by Jazz, traded to ATL in three-team deal' },
  { year: 2021, type: 'out', pick: 30, player: 'Santi Aldama', details: 'Drafted by Jazz, traded to MEM for future 2nd-round pick' },
  { year: 2022, type: 'in', pick: 22, player: 'Walker Kessler', details: 'Acquired from MIN as part of Rudy Gobert blockbuster trade' },
]
