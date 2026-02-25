"""
NBA API wrappers with simple in-memory caching (5-minute TTL).
"""
import time
import httpx
import random
from datetime import date, datetime
from typing import Dict, List, Optional, Any

from nba_api.stats.endpoints import leaguestandingsv3, leaguedashteamstats, scoreboardv2

CURRENT_SEASON = "2025-26"
CACHE_TTL = 300  # seconds

# NBA team ID → ESPN abbreviation (used to match injury data)
NBA_TO_ESPN_ABBR: Dict[int, str] = {
    1610612737: "ATL", 1610612738: "BOS", 1610612739: "CLE", 1610612740: "NO",
    1610612741: "CHI", 1610612742: "DAL", 1610612743: "DEN", 1610612744: "GS",
    1610612745: "HOU", 1610612746: "LAC", 1610612747: "LAL", 1610612748: "MIA",
    1610612749: "MIL", 1610612750: "MIN", 1610612751: "BKN", 1610612752: "NY",
    1610612753: "ORL", 1610612754: "IND", 1610612755: "PHI", 1610612756: "PHX",
    1610612757: "POR", 1610612758: "SAC", 1610612759: "SA",  1610612760: "OKC",
    1610612761: "TOR", 1610612762: "UTA", 1610612763: "MEM", 1610612764: "WSH",
    1610612765: "DET", 1610612766: "CHA",
}

ESPN_HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

# stats.nba.com requires these headers or it returns 403/empty from cloud IPs
NBA_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Host": "stats.nba.com",
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
}

_cache: Dict[str, tuple] = {}


def _get(key: str) -> Optional[Any]:
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _get_stale(key: str) -> Optional[Any]:
    """Return cached value even if expired — used as fallback when API fails."""
    return _cache[key][0] if key in _cache else None


def _set(key: str, data: Any) -> None:
    _cache[key] = (data, time.time())


def _retry_nba(fn, retries=3):
    """Call fn up to retries times with jittered backoff."""
    for attempt in range(retries):
        try:
            return fn()
        except Exception as e:
            if attempt == retries - 1:
                raise
            wait = 3 * (attempt + 1) + random.uniform(0, 2)
            print(f"[nba_api] attempt {attempt + 1} failed: {e}. Retrying in {wait:.1f}s...")
            time.sleep(wait)


def get_standings() -> List[Dict]:
    cached = _get("standings")
    if cached is not None:
        return cached

    try:
        def _fetch():
            resp = leaguestandingsv3.LeagueStandingsV3(
                season=CURRENT_SEASON,
                season_type="Regular Season",
                league_id="00",
                headers=NBA_HEADERS,
                timeout=30,
            )
            df = resp.get_data_frames()[0]
            result = []
            for _, row in df.iterrows():
                result.append({
                    "team_id": int(row["TeamID"]),
                    "team_city": str(row["TeamCity"]),
                    "team_name": str(row["TeamName"]),
                    "wins": int(row["WINS"]),
                    "losses": int(row["LOSSES"]),
                    "win_pct": float(row["WinPCT"]),
                    "conference": str(row["Conference"]),
                    "conf_record": str(row["ConferenceRecord"]),
                    "home_record": str(row["HOME"]),
                    "road_record": str(row["ROAD"]),
                    "l10": str(row["L10"]),
                    "streak": str(row["strCurrentStreak"]),
                    "point_diff": float(row.get("DiffPoints_PG") or 0),
                })
            return result
        result = _retry_nba(_fetch)
        _set("standings", result)
        return result
    except Exception as e:
        print(f"[standings] error: {e}")
        return _get_stale("standings") or []


def get_advanced_stats() -> Dict[int, Dict]:
    cached = _get("advanced")
    if cached is not None:
        return cached

    try:
        def _fetch():
            resp = leaguedashteamstats.LeagueDashTeamStats(
                season=CURRENT_SEASON,
                season_type_all_star="Regular Season",
                measure_type_detailed_defense="Advanced",
                per_mode_detailed="PerGame",
                headers=NBA_HEADERS,
                timeout=30,
            )
            df = resp.get_data_frames()[0]
            result = {}
            for _, row in df.iterrows():
                tid = int(row["TEAM_ID"])
                result[tid] = {
                    "net_rtg": float(row.get("NET_RATING") or 0),
                    "off_rtg": float(row.get("OFF_RATING") or 0),
                    "def_rtg": float(row.get("DEF_RATING") or 0),
                    "net_rtg_rank": int(row.get("NET_RATING_RANK") or 0),
                    "off_rtg_rank": int(row.get("OFF_RATING_RANK") or 0),
                    "def_rtg_rank": int(row.get("DEF_RATING_RANK") or 0),
                }
            return result
        result = _retry_nba(_fetch)
        _set("advanced", result)
        return result
    except Exception as e:
        print(f"[advanced_stats] error: {e}")
        return _get_stale("advanced") or {}


def get_today_games(date_str: str = None) -> List[Dict]:
    if date_str is None:
        date_str = date.today().strftime("%Y-%m-%d")
    cache_key = f"games_{date_str}"
    cached = _get(cache_key)
    if cached is not None:
        return cached

    try:
        resp = _retry_nba(lambda: scoreboardv2.ScoreboardV2(game_date=date_str, league_id="00", headers=NBA_HEADERS, timeout=30))
        games_df = resp.game_header.get_data_frame()
        linescore_df = resp.line_score.get_data_frame()

        games = []
        for _, game in games_df.iterrows():
            gid = game["GAME_ID"]
            home_id = int(game["HOME_TEAM_ID"])
            away_id = int(game["VISITOR_TEAM_ID"])

            def get_score(team_id):
                rows = linescore_df[
                    (linescore_df["GAME_ID"] == gid) &
                    (linescore_df["TEAM_ID"] == team_id)
                ]
                if rows.empty:
                    return None
                val = rows.iloc[0]["PTS"]
                return int(val) if val is not None and str(val) != "nan" else None

            games.append({
                "game_id": gid,
                "status_id": int(game.get("GAME_STATUS_ID", 1)),
                "status_text": str(game.get("GAME_STATUS_TEXT", "")),
                "home_team_id": home_id,
                "away_team_id": away_id,
                "home_score": get_score(home_id),
                "away_score": get_score(away_id),
                "national_tv": str(game.get("NATL_TV_BROADCASTER_ABBREVIATION", "") or ""),
            })

        _set(cache_key, games)
        return games
    except Exception as e:
        print(f"[today_games] error: {e}")
        return _get_stale(cache_key) or []


def get_remaining_sos() -> Dict[int, float]:
    cached = _get("sos")
    if cached is not None:
        return cached

    try:
        r = httpx.get(
            "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json",
            timeout=15.0,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        data = r.json()

        standings = get_standings()
        win_pct = {s["team_id"]: s["win_pct"] for s in standings}

        today = date.today()
        remaining: Dict[int, List[float]] = {}

        for gd in data.get("leagueSchedule", {}).get("gameDates", []):
            raw_date = gd.get("gameDate", "")
            try:
                # Format: "10/02/2025 00:00:00"
                gdate = datetime.strptime(raw_date[:10], "%m/%d/%Y").date()
            except Exception:
                continue
            if gdate <= today:
                continue
            for g in gd.get("games", []):
                h = g.get("homeTeam", {}).get("teamId")
                a = g.get("awayTeam", {}).get("teamId")
                if h and a:
                    remaining.setdefault(h, []).append(win_pct.get(a, 0.5))
                    remaining.setdefault(a, []).append(win_pct.get(h, 0.5))

        sos = {tid: round(sum(opps) / len(opps), 3) for tid, opps in remaining.items() if opps}
        _set("sos", sos)
        return sos
    except Exception as e:
        print(f"[sos] error: {e}")
        return _get_stale("sos") or {}


def get_injuries_for_games(nba_team_ids: List[int], date_str: str = None) -> Dict[int, List[Dict]]:
    """
    Fetch injury reports for games involving the given NBA team IDs.
    Uses ESPN game summary API. Returns {nba_team_id: [injury_entries]}.
    """
    if date_str is None:
        date_str = date.today().strftime("%Y-%m-%d")
    cache_key = f"injuries_{date_str}"
    cached = _get(cache_key)
    if cached is not None:
        return cached

    espn_date = date_str.replace("-", "")  # YYYYMMDD for ESPN API
    try:
        # 1. Get ESPN scoreboard for the requested date to find game IDs
        sb = httpx.get(
            f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates={espn_date}",
            timeout=10.0, headers=ESPN_HEADERS,
        ).json()

        # Build ESPN abbr → NBA team id reverse map (only for teams we care about)
        espn_abbr_to_nba = {v: k for k, v in NBA_TO_ESPN_ABBR.items()}

        # Find ESPN game IDs that involve our teams
        target_espn_abbrs = {NBA_TO_ESPN_ABBR[tid] for tid in nba_team_ids if tid in NBA_TO_ESPN_ABBR}
        game_ids = []
        for event in sb.get("events", []):
            for comp in event.get("competitions", []):
                for competitor in comp.get("competitors", []):
                    abbr = competitor.get("team", {}).get("abbreviation", "")
                    if abbr in target_espn_abbrs:
                        game_ids.append(event["id"])
                        break

        game_ids = list(set(game_ids))

        # 2. Fetch injuries from each game summary
        result: Dict[int, List[Dict]] = {}
        for gid in game_ids:
            try:
                summary = httpx.get(
                    f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={gid}",
                    timeout=10.0, headers=ESPN_HEADERS,
                ).json()

                for team_injury_block in summary.get("injuries", []):
                    team_abbr = team_injury_block.get("team", {}).get("abbreviation", "")
                    nba_id = espn_abbr_to_nba.get(team_abbr)
                    if nba_id is None:
                        continue

                    players = []
                    for inj in team_injury_block.get("injuries", []):
                        athlete = inj.get("athlete", {})
                        details = inj.get("details", {})
                        status = inj.get("status", "")
                        injury_type = details.get("type", "")
                        detail = details.get("detail", "")
                        side = details.get("side", "")
                        desc_parts = [p for p in [injury_type, detail, side] if p and p != "Not Specified"]
                        players.append({
                            "name": athlete.get("displayName", ""),
                            "short_name": athlete.get("shortName", ""),
                            "position": athlete.get("position", {}).get("abbreviation", ""),
                            "status": status,
                            "description": " / ".join(desc_parts) if desc_parts else injury_type,
                            "headshot": athlete.get("headshot", {}).get("href", ""),
                        })

                    if players:
                        result[nba_id] = players
            except Exception as e:
                print(f"[injuries] game {gid} error: {e}")

        _set(cache_key, result)
        return result
    except Exception as e:
        print(f"[injuries] error: {e}")
        return {}
