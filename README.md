# NBA Tank Dashboard

A real-time NBA lottery standings tracker built for Utah Jazz fans. Monitor tanking standings, explore draft prospects, simulate the lottery, and plan offseason moves — all in one place.

## Tech Stack

### Backend
- **FastAPI** — Python async web framework
- **Uvicorn** — ASGI server
- **httpx** — Async HTTP client for ESPN/NBA API calls
- **Docker** — Containerized for deployment

### Frontend
- **React 18** — UI framework
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Chart library for odds visualization
- **React Router** — Client-side routing

### Deployment
- **Render** — Backend hosting
- **Vercel** — Frontend hosting

## Features

- **Lottery Standings** — Live bottom-14 standings with games behind, ratings, strength of schedule, and pick probability distributions
- **Today's Games** — Game cards for bottom-10 teams with live scores, status, and injury reports
- **Jazz Pick Odds** — Visual bar chart showing pick probability with draft prospect info
- **Lottery Simulator** — Interactive lottery draw with dramatic reveal sequence and Jazz celebration animations
- **Draft History** — Historical Jazz draft picks with tier classifications and career stats
- **Free Agency Simulator** — Cap space management, roster builder, trade builder, and shareable results

## Project Structure

```
sch-jazz-tools/
├── backend/
│   ├── main.py              # FastAPI app, API endpoints, caching, background refresh
│   ├── nba_data.py           # ESPN/NBA API integration, data fetching and parsing
│   ├── lottery.py            # NBA lottery simulation engine (2019+ rules, 10k iterations)
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container config for Render deployment
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main dashboard layout, date navigation, data fetching
│   │   ├── main.jsx          # React entry point
│   │   ├── index.css         # Global styles, CSS variables, color palette, animations
│   │   ├── lib/
│   │   │   └── api.js        # API base URL configuration
│   │   │
│   │   ├── components/
│   │   │   ├── TankTable.jsx         # Sortable 14-team standings table with sticky headers
│   │   │   ├── TodayGames.jsx        # Game cards with live scores and injury tooltips
│   │   │   ├── JazzPickOdds.jsx      # Draft pick probability chart with prospect profiles
│   │   │   ├── LotterySimulator.jsx  # Interactive lottery draw modal with animations
│   │   │   └── free-agency/
│   │   │       ├── CapOverview.jsx       # Salary cap breakdown
│   │   │       ├── CurrentRoster.jsx     # Current team contracts
│   │   │       ├── DraftPick.jsx         # Rookie scale salary slots
│   │   │       ├── FreeAgentMarket.jsx   # Available free agents list
│   │   │       ├── DepthChart.jsx        # Position-based roster view
│   │   │       ├── TradeBuilder.jsx      # Trade scenario builder
│   │   │       └── ShareImage.jsx        # Shareable roster snapshot
│   │   │
│   │   ├── pages/
│   │   │   ├── DraftHistory.jsx      # Jazz draft history with tier filtering
│   │   │   └── FreeAgency.jsx        # Free agency simulator page
│   │   │
│   │   ├── hooks/
│   │   │   ├── useIsMobile.js        # Mobile viewport detection
│   │   │   └── useSimState.js        # Free agency simulator state management
│   │   │
│   │   ├── data/
│   │   │   ├── draft-prospects.js    # 2026 draft big board (14 prospects)
│   │   │   ├── jazz-draft-history.js # Historical Jazz picks with career tiers
│   │   │   ├── jazz-contracts.js     # Current roster salaries
│   │   │   ├── free-agents.js        # Free agent pool data
│   │   │   └── rookie-scale.js       # NBA rookie salary scale
│   │   │
│   │   └── StyleGuide.jsx           # Design system reference
│   │
│   ├── public/                # Static assets (logos, GIFs, prospect headshots)
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite config with API proxy
│   ├── tailwind.config.js     # Tailwind theme extensions
│   └── postcss.config.js      # PostCSS plugin config
│
├── render.yaml                # Render deployment config
├── start.sh                   # Local dev startup script
└── .gitignore
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/standings` | Lottery standings (bottom 14) with odds, ratings, and SOS |
| `GET /api/today-games?game_date=YYYY-MM-DD` | Games involving bottom-10 teams |
| `GET /api/jazz-pick-odds` | Jazz-specific lottery probability breakdown |
| `GET /api/lotto-watch` | Top 9 lottery teams summary |
| `GET /api/big-board` | 2026 draft prospect rankings |
| `GET /api/draft-history` | Historical first 14 picks (2015-2024) |
| `GET /api/sim-lottery` | Run a single lottery simulation |

## Local Development

```bash
./start.sh
```

This starts the backend on port `8000` and the frontend on port `5173`. Vite proxies `/api` requests to the backend in development.

## Data Sources

- **ESPN API** — Standings, scoreboard, injury reports
- **NBA CDN** — Remaining schedule data
- **Tankathon** — Draft prospect rankings (hardcoded)
