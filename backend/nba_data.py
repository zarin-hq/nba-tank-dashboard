"""
NBA data via ESPN public APIs + NBA CDN. No stats.nba.com calls (blocked on cloud).
Simple in-memory cache with 5-minute TTL and stale fallback.
"""
import time
import httpx
from datetime import date, datetime
from typing import Dict, List, Optional, Any

CACHE_TTL = 300  # seconds

# NBA team ID → ESPN abbreviation
NBA_TO_ESPN_ABBR: Dict[int, str] = {
    1610612737: "ATL", 1610612738: "BOS", 1610612739: "CLE", 1610612740: "NO",
    1610612741: "CHI", 1610612742: "DAL", 1610612743: "DEN", 1610612744: "GS",
    1610612745: "HOU", 1610612746: "LAC", 1610612747: "LAL", 1610612748: "MIA",
    1610612749: "MIL", 1610612750: "MIN", 1610612751: "BKN", 1610612752: "NY",
    1610612753: "ORL", 1610612754: "IND", 1610612755: "PHI", 1610612756: "PHX",
    1610612757: "POR", 1610612758: "SAC", 1610612759: "SA",  1610612760: "OKC",
    1610612761: "TOR", 1610612762: "UTAH", 1610612763: "MEM", 1610612764: "WSH",
    1610612765: "DET", 1610612766: "CHA",
}
ESPN_ABBR_TO_NBA: Dict[str, int] = {v: k for k, v in NBA_TO_ESPN_ABBR.items()}

# Standard 3-letter NBA abbreviations (for display)
NBA_ABBR: Dict[int, str] = {
    1610612737: "ATL", 1610612738: "BOS", 1610612739: "CLE", 1610612740: "NOP",
    1610612741: "CHI", 1610612742: "DAL", 1610612743: "DEN", 1610612744: "GSW",
    1610612745: "HOU", 1610612746: "LAC", 1610612747: "LAL", 1610612748: "MIA",
    1610612749: "MIL", 1610612750: "MIN", 1610612751: "BKN", 1610612752: "NYK",
    1610612753: "ORL", 1610612754: "IND", 1610612755: "PHI", 1610612756: "PHX",
    1610612757: "POR", 1610612758: "SAC", 1610612759: "SAS", 1610612760: "OKC",
    1610612761: "TOR", 1610612762: "UTA", 1610612763: "MEM", 1610612764: "WAS",
    1610612765: "DET", 1610612766: "CHA",
}

ESPN_HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

_cache: Dict[str, tuple] = {}


def _get(key: str) -> Optional[Any]:
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _get_stale(key: str) -> Optional[Any]:
    """Return cached value even if expired — fallback when API fails."""
    return _cache[key][0] if key in _cache else None


def _set(key: str, data: Any) -> None:
    _cache[key] = (data, time.time())


def _stat_val(stats_list: list, name: str, default=0):
    for s in stats_list:
        if s.get("name") == name:
            return s.get("value", default)
    return default


def _stat_disp(stats_list: list, name: str, default="") -> str:
    for s in stats_list:
        if s.get("name") == name:
            return s.get("displayValue", default)
    return default


# ── Standings (ESPN) ──────────────────────────────────────────────────────────

def get_standings() -> List[Dict]:
    cached = _get("standings")
    if cached is not None:
        return cached

    try:
        r = httpx.get(
            "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings",
            timeout=15.0,
            headers=ESPN_HEADERS,
        )
        data = r.json()

        result = []
        for conf_block in data.get("children", []):
            conf_name = conf_block.get("name", "")
            conf_short = "East" if "Eastern" in conf_name else "West"

            for entry in conf_block.get("standings", {}).get("entries", []):
                team = entry.get("team", {})
                abbr = team.get("abbreviation", "")
                nba_id = ESPN_ABBR_TO_NBA.get(abbr)
                if not nba_id:
                    continue

                sl = entry.get("stats", [])
                wins   = int(_stat_val(sl, "wins"))
                losses = int(_stat_val(sl, "losses"))

                off_rtg_val = _stat_val(sl, "avgPointsFor")
                def_rtg_val = _stat_val(sl, "avgPointsAgainst")
                net_rtg_val = _stat_val(sl, "differential")

                result.append({
                    "team_id":     nba_id,
                    "team_city":   team.get("location", ""),
                    "team_name":   team.get("name", ""),
                    "wins":        wins,
                    "losses":      losses,
                    "win_pct":     round(float(_stat_val(sl, "winPercent")), 3),
                    "conference":  conf_short,
                    "conf_record": "",
                    "home_record": _stat_disp(sl, "Home"),
                    "road_record": _stat_disp(sl, "Road"),
                    "l10":         _stat_disp(sl, "Last Ten Games"),
                    "streak":      _stat_disp(sl, "streak"),
                    "point_diff":  round(float(_stat_val(sl, "pointDifferential")), 1),
                    "off_rtg":     round(float(off_rtg_val), 1) if off_rtg_val else None,
                    "def_rtg":     round(float(def_rtg_val), 1) if def_rtg_val else None,
                    "net_rtg":     round(float(net_rtg_val), 1) if net_rtg_val else None,
                })

        _set("standings", result)
        return result
    except Exception as e:
        print(f"[standings] error: {e}")
        return _get_stale("standings") or []


# ── Advanced stats — not available from cloud-accessible endpoints ────────────
# Returns empty dict; table shows "—" for NET/OFF/DEF RTG columns.

def get_advanced_stats() -> Dict[int, Dict]:
    return {}


# ── Today's games (ESPN scoreboard) ──────────────────────────────────────────

def get_today_games(date_str: str = None) -> List[Dict]:
    if date_str is None:
        date_str = date.today().strftime("%Y-%m-%d")
    cache_key = f"games_{date_str}"
    cached = _get(cache_key)
    if cached is not None:
        return cached

    try:
        espn_date = date_str.replace("-", "")
        r = httpx.get(
            f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates={espn_date}",
            timeout=15.0,
            headers=ESPN_HEADERS,
        )
        data = r.json()

        games = []
        for event in data.get("events", []):
            comps = event.get("competitions", [])
            if not comps:
                continue
            comp = comps[0]

            competitors = comp.get("competitors", [])
            home = next((c for c in competitors if c.get("homeAway") == "home"), None)
            away = next((c for c in competitors if c.get("homeAway") == "away"), None)
            if not home or not away:
                continue

            home_id = ESPN_ABBR_TO_NBA.get(home.get("team", {}).get("abbreviation", ""))
            away_id = ESPN_ABBR_TO_NBA.get(away.get("team", {}).get("abbreviation", ""))
            if not home_id or not away_id:
                continue

            status_type = comp.get("status", {}).get("type", {})
            if status_type.get("completed"):
                status_id = 3
            elif status_type.get("state") == "in":
                status_id = 2
            else:
                status_id = 1

            status_text = status_type.get("shortDetail", "")

            def parse_score(competitor):
                s = competitor.get("score", "")
                return int(s) if s and str(s).isdigit() else None

            broadcasts = comp.get("broadcasts", [])
            natl_tv = broadcasts[0].get("names", [""])[0] if broadcasts else ""

            games.append({
                "game_id":      event.get("id", ""),
                "status_id":    status_id,
                "status_text":  status_text,
                "home_team_id": home_id,
                "away_team_id": away_id,
                "home_score":   parse_score(home),
                "away_score":   parse_score(away),
                "national_tv":  natl_tv,
            })

        _set(cache_key, games)
        return games
    except Exception as e:
        print(f"[today_games] error: {e}")
        return _get_stale(cache_key) or []


# ── Remaining schedule (NBA CDN — accessible from cloud) ─────────────────────

def get_future_games() -> List[tuple]:
    """Returns list of (home_team_id, away_team_id) for all remaining games."""
    cached = _get("future_games")
    if cached is not None:
        return cached

    try:
        r = httpx.get(
            "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json",
            timeout=15.0,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        data = r.json()
        today = date.today()
        games = []
        for gd in data.get("leagueSchedule", {}).get("gameDates", []):
            raw_date = gd.get("gameDate", "")
            try:
                gdate = datetime.strptime(raw_date[:10], "%m/%d/%Y").date()
            except Exception:
                continue
            if gdate <= today:
                continue
            for g in gd.get("games", []):
                h = g.get("homeTeam", {}).get("teamId")
                a = g.get("awayTeam", {}).get("teamId")
                if h and a:
                    games.append((h, a))
        _set("future_games", games)
        return games
    except Exception as e:
        print(f"[future_games] error: {e}")
        return _get_stale("future_games") or []


def get_remaining_sos() -> Dict[int, float]:
    cached = _get("sos")
    if cached is not None:
        return cached

    try:
        standings = get_standings()
        win_pct = {s["team_id"]: s["win_pct"] for s in standings}
        remaining: Dict[int, List[float]] = {}
        for h, a in get_future_games():
            remaining.setdefault(h, []).append(win_pct.get(a, 0.5))
            remaining.setdefault(a, []).append(win_pct.get(h, 0.5))
        sos = {tid: round(sum(opps) / len(opps), 3) for tid, opps in remaining.items() if opps}
        _set("sos", sos)
        return sos
    except Exception as e:
        print(f"[sos] error: {e}")
        return _get_stale("sos") or {}


# ── Injuries (ESPN game summary) ──────────────────────────────────────────────

def get_injuries_for_games(nba_team_ids: List[int], date_str: str = None) -> Dict[int, List[Dict]]:
    if date_str is None:
        date_str = date.today().strftime("%Y-%m-%d")
    cache_key = f"injuries_{date_str}"
    cached = _get(cache_key)
    if cached is not None:
        return cached

    espn_date = date_str.replace("-", "")
    try:
        sb = httpx.get(
            f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates={espn_date}",
            timeout=10.0, headers=ESPN_HEADERS,
        ).json()

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

        result: Dict[int, List[Dict]] = {}
        for gid in game_ids:
            try:
                summary = httpx.get(
                    f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={gid}",
                    timeout=10.0, headers=ESPN_HEADERS,
                ).json()

                for team_injury_block in summary.get("injuries", []):
                    team_abbr = team_injury_block.get("team", {}).get("abbreviation", "")
                    nba_id = ESPN_ABBR_TO_NBA.get(team_abbr)
                    if nba_id is None:
                        continue

                    players = []
                    for inj in team_injury_block.get("injuries", []):
                        athlete = inj.get("athlete", {})
                        details = inj.get("details", {})
                        injury_type = details.get("type", "")
                        detail = details.get("detail", "")
                        side = details.get("side", "")
                        desc_parts = [p for p in [injury_type, detail, side] if p and p != "Not Specified"]
                        players.append({
                            "name":       athlete.get("displayName", ""),
                            "short_name": athlete.get("shortName", ""),
                            "position":   athlete.get("position", {}).get("abbreviation", ""),
                            "status":     inj.get("status", ""),
                            "description": " / ".join(desc_parts) if desc_parts else injury_type,
                            "headshot":   athlete.get("headshot", {}).get("href", ""),
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
