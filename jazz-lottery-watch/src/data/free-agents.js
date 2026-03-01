// Complete 2026 NBA free agent list
// Sources: Spotrac, Hoops Rumors, Basketball-Reference
// yearsExp = years of NBA experience entering 2026-27

const FREE_AGENTS = [
  // ──────────────────────────────────────────────
  // UNRESTRICTED FREE AGENTS (UFA)
  // ──────────────────────────────────────────────

  // Point Guards
  { name: 'Cole Anthony',       espnId: '4432809', position: 'PG',   age: 26, team: 'ORL', type: 'UFA', estimatedSalary: 10_000_000, yearsExp: 6 },
  { name: 'Jevon Carter',       espnId: '3133635', position: 'PG',   age: 31, team: 'CHI', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 8 },
  { name: 'Mike Conley',        espnId: '3195', position: 'PG',   age: 39, team: 'MIN', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 19 },
  { name: 'Collin Gillespie',   espnId: '4278585', position: 'PG',   age: 26, team: 'DEN', type: 'UFA', estimatedSalary: 2_500_000,  yearsExp: 4 },
  { name: 'Jordan Goodwin',     espnId: '4278402', position: 'PG',   age: 28, team: 'PHX', type: 'UFA', estimatedSalary: 2_500_000,  yearsExp: 4 },
  { name: 'Aaron Holiday',      espnId: '3922230', position: 'PG',   age: 30, team: 'HOU', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 8 },
  { name: 'Tyus Jones',         espnId: '3135046', position: 'PG',   age: 30, team: 'PHX', type: 'UFA', estimatedSalary: 12_000_000, yearsExp: 11 },
  { name: 'Kyle Lowry',         espnId: '3012', position: 'PG',   age: 40, team: 'PHI', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 20 },
  { name: 'Jordan McLaughlin',  espnId: '3134916', position: 'PG',   age: 30, team: 'MIN', type: 'UFA', estimatedSalary: 2_500_000,  yearsExp: 7 },
  { name: 'Cameron Payne',      espnId: '3064230', position: 'PG',   age: 32, team: 'NYK', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 11 },
  { name: 'Terry Rozier',       espnId: '3074752', position: 'PG',   age: 32, team: 'MIA', type: 'UFA', estimatedSalary: 12_000_000, yearsExp: 11 },
  { name: 'Gabe Vincent',       espnId: '3137259', position: 'PG',   age: 30, team: 'LAL', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 5 },
  { name: 'Russell Westbrook',  espnId: '3468', position: 'PG',   age: 38, team: 'DEN', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 18 },
  { name: 'Jordan Clarkson',    espnId: '2528426', position: 'SG/PG', age: 34, team: 'UTA', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 12 },
  { name: 'Coby White',         espnId: '4395651', position: 'PG',   age: 26, team: 'CHI', type: 'UFA', estimatedSalary: 20_000_000, yearsExp: 7 },
  { name: 'Brandon Williams',   espnId: '4397040', position: 'PG',   age: 27, team: 'POR', type: 'UFA', estimatedSalary: 2_500_000,  yearsExp: 5 },

  // Shooting Guards
  { name: 'Bruce Brown',        espnId: '4065670', position: 'SG',   age: 30, team: 'IND', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 8 },
  { name: 'Seth Curry',         espnId: '2326307', position: 'SG',   age: 36, team: 'CHA', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 13 },
  { name: 'Ayo Dosunmu',        espnId: '4397002', position: 'SG',   age: 26, team: 'CHI', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 5 },
  { name: 'Keon Ellis',         espnId: '4702177', position: 'SG',   age: 26, team: 'SAC', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 4 },
  { name: 'Quentin Grimes',     espnId: '4397014', position: 'SG',   age: 26, team: 'DAL', type: 'UFA', estimatedSalary: 6_000_000,  yearsExp: 5 },
  { name: 'Kevin Huerter',      espnId: '4066372', position: 'SG',   age: 28, team: 'SAC', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 8 },
  { name: 'Bones Hyland',       espnId: '4592492', position: 'SG',   age: 26, team: 'LAC', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 5 },
  { name: 'Luke Kennard',       espnId: '3913174', position: 'SG',   age: 30, team: 'MEM', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 9 },
  { name: 'CJ McCollum',        espnId: '2490149', position: 'SG',   age: 35, team: 'NOP', type: 'UFA', estimatedSalary: 13_000_000, yearsExp: 13 },
  { name: 'Josh Okogie',        espnId: '4065663', position: 'SG',   age: 28, team: 'PHX', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 8 },
  { name: 'Gary Payton II',     espnId: '3134903', position: 'SG',   age: 34, team: 'GSW', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 10 },
  { name: 'Norman Powell',      espnId: '2595516', position: 'SG',   age: 33, team: 'LAC', type: 'UFA', estimatedSalary: 22_000_000, yearsExp: 11 },
  { name: 'Collin Sexton',      espnId: '4277811', position: 'SG',   age: 28, team: 'UTA', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 8 },
  { name: 'Landry Shamet',      espnId: '3914044', position: 'SG',   age: 29, team: 'NYK', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 8 },
  { name: 'Anfernee Simons',    espnId: '4351851', position: 'SG',   age: 27, team: 'POR', type: 'UFA', estimatedSalary: 27_000_000, yearsExp: 8 },
  { name: 'Cam Thomas',         espnId: '4432174', position: 'SG',   age: 25, team: 'BKN', type: 'UFA', estimatedSalary: 22_000_000, yearsExp: 5 },
  { name: 'Matisse Thybulle',   espnId: '3907498', position: 'SG',   age: 29, team: 'POR', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 7 },
  { name: 'Lindy Waters III',   espnId: '4066317', position: 'SG',   age: 29, team: 'OKC', type: 'UFA', estimatedSalary: 2_500_000,  yearsExp: 5 },
  { name: 'Blake Wesley',       espnId: '4683935', position: 'SG',   age: 23, team: 'SAS', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 4 },

  // Small Forwards
  { name: 'Amir Coffey',        espnId: '4066387', position: 'SF',   age: 29, team: 'LAC', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 7 },
  { name: 'Simone Fontecchio',  espnId: '3899664', position: 'SF',   age: 31, team: 'DET', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 4 },
  { name: 'Javonte Green',      espnId: '2596112', position: 'SF',   age: 33, team: 'CHI', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 7 },
  { name: 'Tim Hardaway Jr.',   espnId: '2528210', position: 'SF',   age: 34, team: 'DET', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 13 },
  { name: 'Caleb Houstan',      espnId: '4433623', position: 'SF',   age: 23, team: 'CLE', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 4 },
  { name: 'Jett Howard',        espnId: '5105806', position: 'SF',   age: 23, team: 'DET', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 3 },
  { name: 'LeBron James',       espnId: '1966', position: 'SF',   age: 42, team: 'LAL', type: 'UFA', estimatedSalary: 30_000_000, yearsExp: 23 },
  { name: 'Doug McDermott',     espnId: '2528588', position: 'SF',   age: 34, team: 'SAS', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 12 },
  { name: 'Khris Middleton',    espnId: '6609', position: 'SF',   age: 35, team: 'MIL', type: 'UFA', estimatedSalary: 10_000_000, yearsExp: 14 },
  { name: 'Kelly Oubre Jr.',    espnId: '3133603', position: 'SF',   age: 31, team: 'PHI', type: 'UFA', estimatedSalary: 10_000_000, yearsExp: 11 },
  { name: "Jae'Sean Tate",      espnId: '3136777', position: 'SF',   age: 31, team: 'HOU', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 6 },

  // Power Forwards
  { name: 'Precious Achiuwa',   espnId: '4431679', position: 'PF',   age: 27, team: 'NYK', type: 'UFA', estimatedSalary: 6_000_000,  yearsExp: 6 },
  { name: 'Harrison Barnes',    espnId: '6578', position: 'PF',   age: 34, team: 'PHX', type: 'UFA', estimatedSalary: 12_000_000, yearsExp: 14 },
  { name: 'Kobe Brown',         espnId: '4431752', position: 'PF',   age: 26, team: 'LAC', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 3 },
  { name: 'John Collins',       espnId: '3908845', position: 'PF',   age: 29, team: 'ATL', type: 'UFA', estimatedSalary: 17_000_000, yearsExp: 9 },
  { name: 'Jeff Green',         espnId: '3209', position: 'PF',   age: 40, team: 'HOU', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 19 },
  { name: 'Rui Hachimura',      espnId: '4066648', position: 'PF',   age: 28, team: 'LAL', type: 'UFA', estimatedSalary: 16_000_000, yearsExp: 7 },
  { name: 'Tobias Harris',      espnId: '6440', position: 'PF',   age: 34, team: 'DET', type: 'UFA', estimatedSalary: 12_000_000, yearsExp: 15 },
  { name: 'Maxi Kleber',        espnId: '2960236', position: 'PF',   age: 34, team: 'DAL', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 9 },
  { name: 'Trey Lyles',         espnId: '3136196', position: 'PF',   age: 31, team: 'SAC', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 11 },
  { name: 'Larry Nance Jr.',    espnId: '2580365', position: 'PF',   age: 33, team: 'ATL', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 11 },
  { name: 'Jeremy Sochan',      espnId: '4610139', position: 'PF',   age: 23, team: 'SAS', type: 'UFA', estimatedSalary: 15_000_000, yearsExp: 4 },
  { name: 'Dean Wade',          espnId: '3912848', position: 'PF',   age: 30, team: 'CLE', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 7 },
  { name: 'Guerschon Yabusele', espnId: '4017844', position: 'PF',   age: 31, team: 'PHI', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 9 },
  { name: 'Kevin Love',         espnId: '3449', position: 'PF',   age: 39, team: 'UTA', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 18 },

  // Centers
  { name: 'Marvin Bagley III',  espnId: '4277848', position: 'C',    age: 27, team: 'WAS', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 8 },
  { name: 'Bismack Biyombo',    espnId: '6427', position: 'C',    age: 34, team: '-',   type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 15 },
  { name: 'Thomas Bryant',      espnId: '3934723', position: 'C',    age: 29, team: 'IND', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 9 },
  { name: 'Zach Collins',       espnId: '4066650', position: 'C',    age: 29, team: 'SAS', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 9 },
  { name: 'Andre Drummond',     espnId: '6585', position: 'C',    age: 33, team: 'PHI', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 14 },
  { name: 'Drew Eubanks',       espnId: '3914285', position: 'C',    age: 29, team: 'PHX', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 8 },
  { name: 'Jaxson Hayes',       espnId: '4397077', position: 'C',    age: 26, team: 'LAL', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 7 },
  { name: 'DeAndre Jordan',     espnId: '3442', position: 'C',    age: 38, team: 'DEN', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 18 },
  { name: 'Jock Landale',       espnId: '3146557', position: 'C',    age: 31, team: 'HOU', type: 'UFA', estimatedSalary: 4_000_000,  yearsExp: 5 },
  { name: 'Kelly Olynyk',       espnId: '2489663', position: 'C',    age: 35, team: 'TOR', type: 'UFA', estimatedSalary: 6_000_000,  yearsExp: 13 },
  { name: 'Kristaps Porzingis', espnId: '3102531', position: 'C',    age: 31, team: 'BOS', type: 'UFA', estimatedSalary: 32_000_000, yearsExp: 11 },
  { name: 'Dwight Powell',      espnId: '2531367', position: 'C',    age: 35, team: 'DAL', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 12 },
  { name: 'Nick Richards',      espnId: '4278076', position: 'C',    age: 29, team: 'CHA', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 6 },
  { name: 'Mitchell Robinson',  espnId: '4351852', position: 'C',    age: 28, team: 'NYK', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 8 },
  { name: 'Xavier Tillman',     espnId: '4277964', position: 'C',    age: 27, team: 'BOS', type: 'UFA', estimatedSalary: 3_000_000,  yearsExp: 6 },
  { name: 'Nikola Vucevic',     espnId: '6478', position: 'C',    age: 36, team: 'CHI', type: 'UFA', estimatedSalary: 12_000_000, yearsExp: 15 },
  { name: 'Moritz Wagner',      espnId: '3150844', position: 'C',    age: 29, team: 'ORL', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 8 },
  { name: 'Robert Williams III',espnId: '4066211', position: 'C',    age: 29, team: 'POR', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 8 },
  { name: 'Jusuf Nurkic',      espnId: '3102530', position: 'C',    age: 30, team: 'UTA', type: 'UFA', estimatedSalary: 8_000_000,  yearsExp: 12 },
  { name: 'Mo Bamba',           espnId: '4277919', position: 'C',    age: 28, team: 'UTA', type: 'UFA', estimatedSalary: 5_000_000,  yearsExp: 8 },

  // ──────────────────────────────────────────────
  // RESTRICTED FREE AGENTS (RFA)
  // ──────────────────────────────────────────────
  { name: 'Ochai Agbaji',       espnId: '4397018', position: 'SG',   age: 26, team: 'TOR', type: 'RFA', estimatedSalary: 6_000_000,  yearsExp: 4 },
  { name: 'Jaylen Clark',       espnId: '4432247', position: 'SG',   age: 25, team: 'LAL', type: 'RFA', estimatedSalary: 3_000_000,  yearsExp: 3 },
  { name: 'Dyson Daniels',      espnId: '4869342', position: 'SG',   age: 23, team: 'ATL', type: 'RFA', estimatedSalary: 12_000_000, yearsExp: 4 },
  { name: 'Mohamed Diawara',    espnId: '5289900', position: 'SF',   age: 21, team: '-',   type: 'RFA', estimatedSalary: 3_000_000,  yearsExp: 1 },
  { name: 'Ousmane Dieng',      espnId: '4997526', position: 'SF',   age: 23, team: 'OKC', type: 'RFA', estimatedSalary: 4_000_000,  yearsExp: 4 },
  { name: 'Jalen Duren',        espnId: '4433621', position: 'C',    age: 23, team: 'DET', type: 'RFA', estimatedSalary: 22_000_000, yearsExp: 4 },
  { name: 'Tari Eason',         espnId: '4433192', position: 'PF',   age: 25, team: 'HOU', type: 'RFA', estimatedSalary: 12_000_000, yearsExp: 4 },
  { name: 'Ariel Hukporti',     espnId: '4871141', position: 'C',    age: 24, team: 'NYK', type: 'RFA', estimatedSalary: 3_000_000,  yearsExp: 2 },
  { name: 'Jaden Ivey',         espnId: '4433218', position: 'SG',   age: 24, team: 'DET', type: 'RFA', estimatedSalary: 14_000_000, yearsExp: 4 },
  { name: 'Keshad Johnson',     espnId: '4431786', position: 'SG',   age: 25, team: 'SAS', type: 'RFA', estimatedSalary: 3_000_000,  yearsExp: 2 },
  { name: 'Spencer Jones',      espnId: '4592427', position: 'SF',   age: 25, team: 'IND', type: 'RFA', estimatedSalary: 3_000_000,  yearsExp: 2 },
  { name: 'Bennedict Mathurin', espnId: '4683634', position: 'SG',   age: 24, team: 'IND', type: 'RFA', estimatedSalary: 14_000_000, yearsExp: 4 },
  { name: 'Keegan Murray',      espnId: '4594327', position: 'SF',   age: 26, team: 'SAC', type: 'RFA', estimatedSalary: 20_000_000, yearsExp: 4 },
  { name: 'Quinten Post',       espnId: '4593016', position: 'C',    age: 26, team: 'GSW', type: 'RFA', estimatedSalary: 3_000_000,  yearsExp: 2 },
  { name: 'Gui Santos',         espnId: '4997536', position: 'SF',   age: 24, team: 'GSW', type: 'RFA', estimatedSalary: 4_000_000,  yearsExp: 3 },
  { name: 'Shaedon Sharpe',     espnId: '4914336', position: 'SG',   age: 22, team: 'POR', type: 'RFA', estimatedSalary: 20_000_000, yearsExp: 4 },
  { name: 'Christian Braun',    espnId: '4431767', position: 'SG',   age: 24, team: 'DEN', type: 'RFA', estimatedSalary: 20_000_000, yearsExp: 4 },
  { name: 'Peyton Watson',      espnId: '4576087', position: 'SF',   age: 24, team: 'DEN', type: 'RFA', estimatedSalary: 14_000_000, yearsExp: 4 },
  { name: 'Mark Williams',      espnId: '4701232', position: 'C',    age: 25, team: 'CHA', type: 'RFA', estimatedSalary: 14_000_000, yearsExp: 4 },
  { name: 'Jalen Wilson',       espnId: '4431714', position: 'SF',   age: 26, team: 'BKN', type: 'RFA', estimatedSalary: 5_000_000,  yearsExp: 3 },

  // ──────────────────────────────────────────────
  // PLAYER OPTIONS (PO) — stars who may opt out
  // ──────────────────────────────────────────────
  { name: 'Jose Alvarado',      espnId: '4277869', position: 'PG',   age: 28, team: 'NYK', type: 'PO',  estimatedSalary: 4_500_000,  optionValue: 4_500_000,  yearsExp: 5 },
  { name: 'James Harden',       espnId: '3992', position: 'PG',   age: 37, team: 'CLE', type: 'PO',  estimatedSalary: 42_300_000, optionValue: 42_317_307, yearsExp: 17 },
  { name: "D'Angelo Russell",   espnId: '3136776', position: 'PG',   age: 30, team: 'WAS', type: 'PO',  estimatedSalary: 6_000_000,  optionValue: 5_969_250,  yearsExp: 11 },
  { name: 'Marcus Smart',       espnId: '2990992', position: 'PG',   age: 32, team: 'LAL', type: 'PO',  estimatedSalary: 5_400_000,  optionValue: 5_390_700,  yearsExp: 12 },
  { name: 'Fred VanVleet',      espnId: '2991230', position: 'PG',   age: 32, team: 'HOU', type: 'PO',  estimatedSalary: 25_000_000, optionValue: 25_000_000, yearsExp: 10 },
  { name: 'Trae Young',         espnId: '4277905', position: 'PG',   age: 28, team: 'WAS', type: 'PO',  estimatedSalary: 49_000_000, optionValue: 48_967_380, yearsExp: 8 },
  { name: 'Bradley Beal',       espnId: '6580', position: 'SG',   age: 33, team: 'LAC', type: 'PO',  estimatedSalary: 5_600_000,  optionValue: 5_621_700,  yearsExp: 14 },
  { name: 'Kentavious Caldwell-Pope', espnId: '2581018', position: 'SG', age: 33, team: 'MEM', type: 'PO', estimatedSalary: 21_600_000, optionValue: 21_621_500, yearsExp: 13 },
  { name: 'Gary Harris',        espnId: '2999547', position: 'SG',   age: 32, team: 'MIL', type: 'PO',  estimatedSalary: 3_800_000,  optionValue: 3_815_861,  yearsExp: 12 },
  { name: 'Zach LaVine',        espnId: '3064440', position: 'SG',   age: 31, team: 'SAC', type: 'PO',  estimatedSalary: 49_000_000, optionValue: 48_967_380, yearsExp: 12 },
  { name: "De'Anthony Melton",  espnId: '4066436', position: 'SG',   age: 28, team: 'GSW', type: 'PO',  estimatedSalary: 3_500_000,  optionValue: 3_451_779,  yearsExp: 8 },
  { name: 'Austin Reaves',      espnId: '4066457', position: 'SG',   age: 28, team: 'LAL', type: 'PO',  estimatedSalary: 14_900_000, optionValue: 14_898_786, yearsExp: 5 },
  { name: 'Gary Trent Jr.',     espnId: '4277843', position: 'SG',   age: 28, team: 'MIL', type: 'PO',  estimatedSalary: 3_900_000,  optionValue: 3_881_960,  yearsExp: 8 },
  { name: 'Taurean Prince',     espnId: '2990962', position: 'SF',   age: 32, team: 'MIL', type: 'PO',  estimatedSalary: 3_800_000,  optionValue: 3_815_861,  yearsExp: 10 },
  { name: 'Andrew Wiggins',     espnId: '3059319', position: 'SF',   age: 31, team: 'MIA', type: 'PO',  estimatedSalary: 30_200_000, optionValue: 30_169_644, yearsExp: 12 },
  { name: 'Draymond Green',     espnId: '6589', position: 'PF',   age: 36, team: 'GSW', type: 'PO',  estimatedSalary: 27_700_000, optionValue: 27_678_571, yearsExp: 14 },
  { name: 'Deandre Ayton',      espnId: '4278129', position: 'C',    age: 28, team: 'POR', type: 'PO',  estimatedSalary: 8_100_000,  optionValue: 8_104_000,  yearsExp: 8 },
  { name: 'Al Horford',         espnId: '3213', position: 'C',    age: 40, team: 'GSW', type: 'PO',  estimatedSalary: 6_000_000,  optionValue: 5_969_250,  yearsExp: 19 },

  // ──────────────────────────────────────────────
  // TEAM OPTIONS (TO) — notable players
  // ──────────────────────────────────────────────
  { name: 'Bogdan Bogdanovic',  espnId: '3037789', position: 'SG',   age: 34, team: 'LAC', type: 'TO',  estimatedSalary: 16_000_000, optionValue: 16_020_000, yearsExp: 9 },
  { name: 'Luguentz Dort',      espnId: '4397020', position: 'SF',   age: 27, team: 'OKC', type: 'TO',  estimatedSalary: 17_700_000, optionValue: 17_722_222, yearsExp: 7 },
  { name: 'Isaiah Hartenstein',  espnId: '4222252', position: 'C',   age: 28, team: 'OKC', type: 'TO',  estimatedSalary: 28_500_000, optionValue: 28_500_000, yearsExp: 8 },
  { name: 'Jonathan Kuminga',   espnId: '4433247', position: 'PF',   age: 24, team: 'ATL', type: 'TO',  estimatedSalary: 24_300_000, optionValue: 24_300_000, yearsExp: 5 },
  { name: 'Kevon Looney',       espnId: '3155535', position: 'C',    age: 30, team: 'NOP', type: 'TO',  estimatedSalary: 8_000_000,  optionValue: 8_000_000,  yearsExp: 11 },
  { name: 'Brook Lopez',        espnId: '3448', position: 'C',    age: 38, team: 'LAC', type: 'TO',  estimatedSalary: 9_200_000,  optionValue: 9_187_500,  yearsExp: 18 },
]

export default FREE_AGENTS
