"""
NBA Tank Dashboard — FastAPI backend.
Run: python main.py
API available at http://localhost:8000
"""
import asyncio
import os
from concurrent.futures import ThreadPoolExecutor

from datetime import date as date_
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from nba_data import (
    get_standings, get_advanced_stats, get_today_games,
    get_remaining_sos, get_future_games, get_injuries_for_games,
    NBA_ABBR,
)
from lottery import run_simulation, top4_from_results, N_SLOTS, _simulate_one

app = FastAPI(title="NBA Tank Dashboard")

# ---------------------------------------------------------------------------
# 2026 Big Board — sourced from tankathon.com/big_board
# Photos from nbadraft.net. Update as the board changes.
# ---------------------------------------------------------------------------
BIG_BOARD = [
    {"rank": 1,  "name": "AJ Dybantsa",     "pos": "SF", "school": "BYU",         "photo": "https://www.nbadraft.net/wp-content/uploads/2022/04/AJ-Dybantsa-1.png",       "stats": {"ppg": 23.1, "rpg": 7.0,  "apg": 4.0}, "bref_url": "https://www.sports-reference.com/cbb/players/aj-dybantsa-1.html"},
    {"rank": 2,  "name": "Darryn Peterson", "pos": "SG", "school": "Kansas",      "photo": "https://www.nbadraft.net/wp-content/uploads/2022/08/Darryn-Peterson-1.png",   "stats": {"ppg": 19.5, "rpg": 3.8,  "apg": 1.4}, "bref_url": "https://www.sports-reference.com/cbb/players/darryn-peterson-1.html"},
    {"rank": 3,  "name": "Cameron Boozer",  "pos": "PF", "school": "Duke",        "photo": "https://www.nbadraft.net/wp-content/uploads/2022/05/Cameron-Boozer-1.png",    "stats": {"ppg": 22.6, "rpg": 10.0, "apg": 4.0}, "bref_url": "https://www.sports-reference.com/cbb/players/cameron-boozer-1.html"},
    {"rank": 4,  "name": "Caleb Wilson",    "pos": "SF", "school": "N. Carolina", "photo": "https://www.nbadraft.net/wp-content/uploads/2023/04/caleb-wilson-hd.jpg",     "stats": {"ppg": 19.8, "rpg": 9.4,  "apg": 2.7}, "bref_url": "https://www.sports-reference.com/cbb/players/caleb-wilson-1.html"},
    {"rank": 5,  "name": "Kingston Flemings","pos":"PG", "school": "Houston",     "photo": "https://www.nbadraft.net/wp-content/uploads/2024/07/kingston-flemings-hd.jpg", "stats": {"ppg": 16.6, "rpg": 3.9,  "apg": 5.2}, "bref_url": "https://www.sports-reference.com/cbb/players/kingston-flemings-1.html"},
    {"rank": 6,  "name": "Darius Acuff",    "pos": "PG", "school": "Arkansas",    "photo": "https://www.nbadraft.net/wp-content/uploads/2023/05/Darius-Acuff-1.png",      "stats": {"ppg": 22.2, "rpg": 3.0,  "apg": 6.2}, "bref_url": "https://www.sports-reference.com/cbb/players/darius-acuff-1.html"},
    {"rank": 7,  "name": "Mikel Brown Jr.", "pos": "PG", "school": "Louisville",  "photo": "https://www.nbadraft.net/wp-content/uploads/2023/06/Mikel-Brown-3.png",       "stats": {"ppg": 18.6, "rpg": 3.4,  "apg": 4.9}, "bref_url": "https://www.sports-reference.com/cbb/players/mikel-brown-jr-1.html"},
    {"rank": 8,  "name": "Keaton Wagler",   "pos": "SG", "school": "Illinois",    "photo": "https://www.nbadraft.net/wp-content/uploads/2025/12/keaton-wagler-hd.jpg",    "stats": {"ppg": 18.2, "rpg": 5.0,  "apg": 4.3}, "bref_url": "https://www.sports-reference.com/cbb/players/keaton-wagler-1.html"},
    {"rank": 9,  "name": "Nate Ament",      "pos": "SF", "school": "Tennessee",   "photo": "https://www.nbadraft.net/wp-content/uploads/2024/06/Nate-Ament-1.png",        "stats": {"ppg": 18.0, "rpg": 6.4,  "apg": 2.5}, "bref_url": "https://www.sports-reference.com/cbb/players/nate-ament-1.html"},
    {"rank": 10, "name": "Braylon Mullins", "pos": "SG", "school": "UConn",       "photo": "https://www.nbadraft.net/wp-content/uploads/2025/03/Braylon-Mullins.png",     "stats": {"ppg": 12.3, "rpg": 3.5,  "apg": 1.2}, "bref_url": "https://www.sports-reference.com/cbb/players/braylon-mullins-1.html"},
    {"rank": 11, "name": "Hannes Steinbach","pos": "PF", "school": "Washington",  "photo": "/steinbach.webp",                                                              "stats": {"ppg": 17.6, "rpg": 11.4, "apg": 1.6}, "bref_url": "https://www.sports-reference.com/cbb/players/hannes-steinbach-1.html"},
    {"rank": 12, "name": "Labaron Philon",  "pos": "PG", "school": "Alabama",     "photo": "https://www.nbadraft.net/wp-content/uploads/2023/06/labaron-philon-hd.jpg",   "stats": {"ppg": 21.3, "rpg": 3.3,  "apg": 5.0}, "bref_url": "https://www.sports-reference.com/cbb/players/labaron-philon-1.html"},
    {"rank": 13, "name": "Yaxel Lendeborg", "pos": "PF", "school": "Michigan",    "photo": "https://www.nbadraft.net/wp-content/uploads/2025/03/yaxel-lendeborg-hd.jpg",  "stats": {"ppg": 14.6, "rpg": 7.5,  "apg": 3.2}, "bref_url": "https://www.sports-reference.com/cbb/players/yaxel-lendeborg-1.html"},
    {"rank": 14, "name": "Brayden Burries", "pos": "SG", "school": "Arizona",     "photo": "https://www.nbadraft.net/wp-content/uploads/2024/01/Brayden-Burries-1.png",   "stats": {"ppg": 15.2, "rpg": 4.6,  "apg": 2.6}, "bref_url": "https://www.sports-reference.com/cbb/players/brayden-burries-1.html"},
]

# Draft history: picks 1-14 for 2015-2024
DRAFT_HISTORY = {
    1:  {2015:"Karl-Anthony Towns",  2016:"Ben Simmons",      2017:"Markelle Fultz",   2018:"DeAndre Ayton",      2019:"Zion Williamson", 2020:"Anthony Edwards", 2021:"Cade Cunningham", 2022:"Paolo Banchero",    2023:"Victor Wembanyama", 2024:"Zaccharie Risacher"},
    2:  {2015:"D'Angelo Russell",    2016:"Brandon Ingram",   2017:"Lonzo Ball",        2018:"Marvin Bagley III",  2019:"Ja Morant",       2020:"James Wiseman",   2021:"Jalen Green",     2022:"Chet Holmgren",     2023:"Brandon Miller",    2024:"Alexandre Sarr"},
    3:  {2015:"Jahlil Okafor",       2016:"Jaylen Brown",     2017:"Jayson Tatum",      2018:"Luka Doncic",        2019:"RJ Barrett",      2020:"LaMelo Ball",     2021:"Evan Mobley",     2022:"Jabari Smith Jr.",  2023:"Scoot Henderson",   2024:"Reed Sheppard"},
    4:  {2015:"Kristaps Porzingis",  2016:"Dragan Bender",    2017:"Josh Jackson",      2018:"Jaren Jackson Jr.",  2019:"De'Andre Hunter", 2020:"Patrick Williams",2021:"Scottie Barnes",  2022:"Keegan Murray",     2023:"Amen Thompson",     2024:"Stephon Castle"},
    5:  {2015:"Mario Hezonja",       2016:"Kris Dunn",        2017:"De'Aaron Fox",      2018:"Trae Young",         2019:"Darius Garland",  2020:"Isaac Okoro",     2021:"Jalen Suggs",     2022:"Jaden Ivey",        2023:"Ausar Thompson",    2024:"Ron Holland II"},
    6:  {2015:"Willie Cauley-Stein", 2016:"Buddy Hield",      2017:"Jonathan Isaac",    2018:"Mo Bamba",           2019:"Jarrett Culver",  2020:"Onyeka Okongwu",  2021:"Josh Giddey",     2022:"Bennedict Mathurin",2023:"Anthony Black",     2024:"Tidjane Salaun"},
    7:  {2015:"Emmanuel Mudiay",     2016:"Jamal Murray",     2017:"Lauri Markkanen",   2018:"Wendell Carter Jr.", 2019:"Coby White",      2020:"Killian Hayes",   2021:"Jonathan Kuminga",2022:"Shaedon Sharpe",    2023:"Bilal Coulibaly",   2024:"Donovan Clingan"},
    8:  {2015:"Stanley Johnson",     2016:"Marquese Chriss",  2017:"Frank Ntilikina",   2018:"Collin Sexton",      2019:"Jaxson Hayes",    2020:"Obi Toppin",      2021:"Franz Wagner",    2022:"Dyson Daniels",     2023:"Jarace Walker",     2024:"Rob Dillingham"},
    9:  {2015:"Frank Kaminsky",      2016:"Jakob Poeltl",     2017:"Dennis Smith Jr.",  2018:"Kevin Knox",         2019:"Rui Hachimura",   2020:"Deni Avdija",     2021:"Davion Mitchell", 2022:"Jeremy Sochan",     2023:"Taylor Hendricks",  2024:"Zach Edey"},
    10: {2015:"Justise Winslow",     2016:"Thon Maker",       2017:"Zach Collins",      2018:"Mikal Bridges",      2019:"Cam Reddish",     2020:"Jalen Smith",     2021:"Ziaire Williams", 2022:"Johnny Davis",      2023:"Cason Wallace",     2024:"Cody Williams"},
    11: {2015:"Myles Turner",        2016:"Domantas Sabonis", 2017:"Malik Monk",        2018:"Shai Gilgeous-Alexander",2019:"Cameron Johnson",2020:"Devin Vassell", 2021:"James Bouknight", 2022:"Ousmane Dieng",     2023:"Jett Howard",       2024:"Matas Buzelis"},
    12: {2015:"Trey Lyles",          2016:"Taurean Prince",   2017:"Luke Kennard",      2018:"Miles Bridges",      2019:"PJ Washington",   2020:"Tyrese Haliburton",2021:"Joshua Primo",   2022:"Jalen Williams",    2023:"Dereck Lively II",  2024:"Nikola Topic"},
    13: {2015:"Devin Booker",        2016:"Georgios Papagiannis",2017:"Donovan Mitchell",2018:"Jerome Robinson",   2019:"Tyler Herro",     2020:"Kira Lewis Jr.",  2021:"Chris Duarte",    2022:"Jalen Duren",       2023:"Gradey Dick",       2024:"Devin Carter"},
    14: {2015:"Cameron Payne",       2016:"Denzel Valentine", 2017:"Bam Adebayo",       2018:"Michael Porter Jr.", 2019:"Romeo Langford",  2020:"Aaron Nesmith",   2021:"Moses Moody",     2022:"Ochai Agbaji",      2023:"Jordan Hawkins",    2024:"Bub Carrington"},
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=4)

JAZZ_TEAM_ID = 1610612762

# Lottery simulation — compute once at startup and cache
_lottery_results = None


def _get_lottery():
    global _lottery_results
    if _lottery_results is None:
        print("Running lottery simulation (10k iterations)...")
        _lottery_results = run_simulation(10_000)
        print("Lottery simulation complete.")
    return _lottery_results


def _run(fn, *args):
    """Run a blocking NBA API call in a thread pool."""
    return asyncio.get_event_loop().run_in_executor(executor, fn, *args)


# ---------------------------------------------------------------------------
# Background pre-warm: fetch all NBA data at startup, retry until it works
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup():
    loop = asyncio.get_event_loop()
    loop.run_in_executor(executor, _get_lottery)
    asyncio.create_task(_pre_warm())


async def _pre_warm():
    loop = asyncio.get_event_loop()
    while True:
        try:
            standings = await loop.run_in_executor(executor, get_standings)
            if standings:
                await asyncio.gather(
                    loop.run_in_executor(executor, get_advanced_stats),
                    loop.run_in_executor(executor, get_remaining_sos),
                    loop.run_in_executor(executor, get_future_games),
                )
                print(f"[startup] pre-warm complete: {len(standings)} teams loaded")
                asyncio.create_task(_refresh_loop())
                return
            else:
                print("[startup] standings empty, retrying in 30s...")
        except Exception as e:
            print(f"[startup] pre-warm error: {e}, retrying in 30s...")
        await asyncio.sleep(30)


async def _refresh_loop():
    """Re-fetch NBA data every 5 minutes so cache stays warm."""
    while True:
        await asyncio.sleep(300)
        try:
            loop = asyncio.get_event_loop()
            await asyncio.gather(
                loop.run_in_executor(executor, get_standings),
                loop.run_in_executor(executor, get_advanced_stats),
                loop.run_in_executor(executor, get_remaining_sos),
            )
            print("[refresh] standings updated")
        except Exception as e:
            print(f"[refresh] error: {e}")


def _sort_lottery(standings):
    """Sort standings worst → best (most losses first, then fewest wins)."""
    return sorted(standings, key=lambda x: (-x["losses"], x["wins"]))


def _calc_gb(worst, team):
    """Games behind worst team (tanking GB — higher = better record = further from #1 pick)."""
    return round(
        ((worst["losses"] - team["losses"]) + (team["wins"] - worst["wins"])) / 2, 1
    )


@app.get("/")
async def health():
    return {"status": "ok", "service": "nba-tank-dashboard"}


@app.get("/api/standings")
async def standings_endpoint():
    loop = asyncio.get_event_loop()
    standings, advanced, sos, future_games = await asyncio.gather(
        loop.run_in_executor(executor, get_standings),
        loop.run_in_executor(executor, get_advanced_stats),
        loop.run_in_executor(executor, get_remaining_sos),
        loop.run_in_executor(executor, get_future_games),
    )

    lottery = _get_lottery()
    sorted_teams = _sort_lottery(standings)
    worst = sorted_teams[0] if sorted_teams else None

    # Bottom 6 team IDs (worst records) for the VS B6 column
    bottom6_ids = {t["team_id"] for t in sorted_teams[:6]}

    # Build per-team remaining games vs bottom-6 opponents
    vs_b6_map: Dict[int, List] = {}
    for h, a in future_games:
        if a in bottom6_ids:
            vs_b6_map.setdefault(h, []).append({"opp_abbr": NBA_ABBR.get(a, "?"), "home": True})
        if h in bottom6_ids:
            vs_b6_map.setdefault(a, []).append({"opp_abbr": NBA_ABBR.get(h, "?"), "home": False})

    result = []
    for slot_idx, team in enumerate(sorted_teams[:14]):
        slot = slot_idx + 1
        tid = team["team_id"]
        adv = advanced.get(tid, {})
        slot_odds = lottery.get(slot, {})

        result.append({
            **team,
            "lottery_slot": slot,
            "gb": _calc_gb(worst, team) if worst else 0,
            "net_rtg": adv.get("net_rtg") if adv.get("net_rtg") is not None else team.get("net_rtg"),
            "off_rtg": adv.get("off_rtg") if adv.get("off_rtg") is not None else team.get("off_rtg"),
            "def_rtg": adv.get("def_rtg") if adv.get("def_rtg") is not None else team.get("def_rtg"),
            "net_rtg_rank": adv.get("net_rtg_rank"),
            "off_rtg_rank": adv.get("off_rtg_rank"),
            "def_rtg_rank": adv.get("def_rtg_rank"),
            "sos": sos.get(tid),
            "vs_bottom6": vs_b6_map.get(tid, []),
            "top4_odds": top4_from_results(slot, lottery),
            "pick_odds": {str(k): v for k, v in slot_odds.items()},
        })

    return result


@app.get("/api/today-games")
async def today_games_endpoint(game_date: str = Query(default=None)):
    date_str = game_date or date_.today().strftime("%Y-%m-%d")
    loop = asyncio.get_event_loop()
    standings, games = await asyncio.gather(
        loop.run_in_executor(executor, get_standings),
        loop.run_in_executor(executor, get_today_games, date_str),
    )

    sorted_teams = _sort_lottery(standings)
    bottom10_ids = {t["team_id"] for t in sorted_teams[:10]}
    team_by_id = {t["team_id"]: t for t in standings}

    # Filter to relevant games first
    relevant = []
    all_team_ids = set()
    for g in games:
        home_id, away_id = g["home_team_id"], g["away_team_id"]
        if home_id not in bottom10_ids and away_id not in bottom10_ids:
            continue
        relevant.append(g)
        all_team_ids.update([home_id, away_id])

    # Fetch injuries for all teams involved (both bottom-10 and their opponents)
    injuries = await loop.run_in_executor(executor, get_injuries_for_games, list(all_team_ids), date_str)

    result = []
    for g in relevant:
        home_id, away_id = g["home_team_id"], g["away_team_id"]
        ht = team_by_id.get(home_id, {})
        at = team_by_id.get(away_id, {})
        result.append({
            **g,
            "home_team_name": f"{ht.get('team_city', '')} {ht.get('team_name', '')}".strip(),
            "away_team_name": f"{at.get('team_city', '')} {at.get('team_name', '')}".strip(),
            "home_record": f"{ht.get('wins', 0)}-{ht.get('losses', 0)}",
            "away_record": f"{at.get('wins', 0)}-{at.get('losses', 0)}",
            "both_bottom10": home_id in bottom10_ids and away_id in bottom10_ids,
            "home_in_bottom10": home_id in bottom10_ids,
            "away_in_bottom10": away_id in bottom10_ids,
            "home_injuries": injuries.get(home_id, []),
            "away_injuries": injuries.get(away_id, []),
        })

    return result


@app.get("/api/jazz-pick-odds")
async def jazz_pick_odds_endpoint():
    loop = asyncio.get_event_loop()
    standings = await loop.run_in_executor(executor, get_standings)

    sorted_teams = _sort_lottery(standings)
    jazz_slot = None
    jazz_team = None
    for idx, team in enumerate(sorted_teams):
        if team["team_id"] == JAZZ_TEAM_ID:
            jazz_slot = idx + 1
            jazz_team = team
            break

    if jazz_slot is None:
        return {"error": "Jazz not found in lottery standings"}

    lottery = _get_lottery()
    slot_odds = lottery.get(jazz_slot, {})

    return {
        "slot": jazz_slot,
        "record": f"{jazz_team['wins']}-{jazz_team['losses']}",
        "top4_odds": top4_from_results(jazz_slot, lottery),
        "odds": {str(k): v for k, v in sorted(slot_odds.items(), key=lambda x: int(x[0]))},
    }


@app.get("/api/lotto-watch")
async def lotto_watch_endpoint():
    loop = asyncio.get_event_loop()
    standings, advanced, sos = await asyncio.gather(
        loop.run_in_executor(executor, get_standings),
        loop.run_in_executor(executor, get_advanced_stats),
        loop.run_in_executor(executor, get_remaining_sos),
    )

    lottery = _get_lottery()
    sorted_teams = _sort_lottery(standings)
    worst = sorted_teams[0] if sorted_teams else None
    bottom9_ids = {t["team_id"] for t in sorted_teams[:9]}

    result = []
    for slot_idx, team in enumerate(sorted_teams[:9]):
        slot = slot_idx + 1
        tid = team["team_id"]
        adv = advanced.get(tid, {})

        # GA/GB relative to worst team (slot 1)
        gb = _calc_gb(worst, team) if worst else 0

        result.append({
            **team,
            "lottery_slot": slot,
            "gb": gb,
            "net_rtg": adv.get("net_rtg") if adv.get("net_rtg") is not None else team.get("net_rtg"),
            "off_rtg": adv.get("off_rtg") if adv.get("off_rtg") is not None else team.get("off_rtg"),
            "def_rtg": adv.get("def_rtg") if adv.get("def_rtg") is not None else team.get("def_rtg"),
            "off_rtg_rank": adv.get("off_rtg_rank"),
            "def_rtg_rank": adv.get("def_rtg_rank"),
            "sos": sos.get(tid),
            "top4_odds": top4_from_results(slot, lottery),
            "is_jazz": tid == JAZZ_TEAM_ID,
        })

    return result


@app.get("/api/big-board")
async def big_board_endpoint():
    return BIG_BOARD


@app.get("/api/draft-history")
async def draft_history_endpoint():
    return DRAFT_HISTORY


@app.get("/api/sim-lottery")
async def sim_lottery_endpoint():
    loop = asyncio.get_event_loop()
    standings = await loop.run_in_executor(executor, get_standings)
    sorted_teams = _sort_lottery(standings)
    lottery_teams = sorted_teams[:14]

    lottery_picks = _simulate_one()  # 4 winning slot numbers (1-indexed)
    non_lottery = [s for s in range(1, 15) if s not in lottery_picks]

    result = {}
    for slot_idx, team in enumerate(lottery_teams):
        slot = slot_idx + 1
        if slot in lottery_picks:
            pick = lottery_picks.index(slot) + 1
        else:
            pick = 5 + non_lottery.index(slot)
        result[pick] = {
            "pick": pick,
            "slot": slot,
            "team_id": team["team_id"],
            "team_name": f"{team.get('team_city', '')} {team.get('team_name', '')}".strip(),
            "wins": team["wins"],
            "losses": team["losses"],
        }

    return [result[p] for p in sorted(result.keys())]


if __name__ == "__main__":
    import uvicorn
    _get_lottery()  # Pre-warm on startup
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
