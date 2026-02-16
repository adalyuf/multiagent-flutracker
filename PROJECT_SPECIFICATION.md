# FluTracker — Complete Project Specification

> **Purpose**: This document contains everything needed to recreate the FluTracker project from scratch. It describes every file, its exact contents, architecture, data flows, and deployment configuration.

## 1. Project Overview

FluTracker is a global influenza surveillance dashboard. It consists of:

- **Backend**: FastAPI (Python 3.12) + PostgreSQL 16 + SQLAlchemy async
- **Frontend**: React + vite
- **Data Sources**: WHO FluNet (flu cases) + Nextstrain (genomic sequences)
- **Deployment**: Railway (app service + managed Postgres)

The dashboard shows:

- Global choropleth map (cases per 100k)
- Historical season comparison chart (current + 9 past seasons)
- Clade trends (stacked area, genomics data)
- Subtype trends (stacked area, flu type data)
- Country dashboard table with search/filter/sort, sparklines, severity meters
- Anomaly alert bar
- Multi-country comparison chart
- Forecast visualization with confidence intervals
- Dedicated genomics analysis page

## Developing locally

Set up services in a manner that they can be brought up with docker compose up.
Do not touch the existing .devcontainer folder.

## 15. Backend: Data Ingestion

### 15.2 WHO FluNet Scraper

**API**: `https://xmart-api-public.who.int/FLUMART/VIW_FNT`

**Subtype priority** (avoids double-counting):

1. Specific: AH1N12009→H1N1, AH3→H3N2, AH5→H5N1, AH7N9→H7N9, BYAM→B/Yamagata, BVIC→B/Victoria
2. Aggregate (only if no specific found): INF_A→"A (unsubtyped)", INF_B→"B (lineage unknown)"
3. Last resort: INF_ALL/ALL_INF→"unknown"

**UK normalization**: XE, XI, XS, XW → "GB"

**Date parsing**: `datetime.strptime(f"{iso_year}-W{iso_week:02d}-1", "%G-W%V-%u")`

**Aggregation**: After parsing, aggregates duplicate logical keys (time, country_code, region, city, flu_type, source) by summing new_cases. This handles UK constituent merging.

### 15.3 Scheduler

Three APScheduler jobs:

| Job ID             | Trigger                       | Behavior                                                                                                     |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| who_flunet         | IntervalTrigger(hours=6)      | Runs immediately on startup + every 6 hours; fetches last 4 weeks                                            |
| anomaly_detection  | CronTrigger(hour="1,7,13,19") | Runs at startup + 4x daily; rebuilds anomalies table                                                         |
| full_daily_rebuild | CronTrigger(hour=5)           | Daily at 05:00 UTC; wipes flu_cases + genomic_sequences + anomalies; runs full backfills + anomaly detection |

## 16. Frontend: HTML Pages

### 16.1 index.html (Main Dashboard)

Structure:

1. **Header**: Logo (inline SVG globe), "FluTracker" title (amber), subtitle, live dot (green pulse), last updated timestamp
2. **Alert bar**: Red-themed, scrollable chips with severity dots
3. **Main grid** (2 columns):
   - Left: Map panel with map-container (400px), legend bar
   - Right: Charts panel with Historical/Compare tabs, SVG #mainChart, compare selector (3 dropdowns)
4. **Secondary grid** (2 columns):
   - Clade trends (1yr, links to genomics.html)
   - Subtype trends (1yr)
5. **Dashboard table**: Search, continent/flu-type/sort filters, 8-column table (rank, country, cases, per 100k, prior year delta, sparkline, severity meter, dominant type)
6. **Footer**: Data source attribution

### 16.2 Genomics Dashboard

Structure:

1. **Header**: Title, subtitle, back-to-dashboard link
2. **Controls**: Years (1/3/5/10), Country dropdown, Top N clades (4/6/8)
3. **KPI cards** (4 columns): Total sequences, countries, unique clades, dominant clade
4. **Stacked area chart**: SVG #trendChart (340px), monthly by clade
5. **Countries table**: Top 20 by sequences

## 21. Key Design Decisions & Gotchas

### Architecture

1. **Single data source (WHO FluNet)**: All flu case records use `source="who_flunet"`. Country-specific scrapers were removed to avoid double-counting with incompatible data definitions.
2. **Anchor-date pattern**: API queries use `max(time)` from DB instead of `utcnow()` to handle reporting lag consistently.
3. **Batch deduplication**: Single SELECT to get existing keys, then Python set lookup. Handles within-batch dupes too.
4. **Full daily rebuild**: Wipes and re-ingests all data at 05:00 UTC to ensure consistency.

### Configuration

9. **URL auto-conversion**: Railway provides plain `postgresql://`; config auto-derives both async and sync URLs.
10. **Extra env vars**: Config uses `extra="ignore"` because .env has Docker Compose vars not in Settings.

### Frontend

13. **Season normalization**: Historical overlay maps all seasons to Oct → Sep for visual comparison.
14. **Date parsing backward compat**: Charts handle YYYY-MM-DD, ISO datetime strings, and legacy week-offset indices.
15. **Choropleth scale**: Calibrated for FluNet lab-confirmed specimens (0-40+ per 100k), not clinical cases.
16. **TopoJSON ID resolution**: world-atlas uses numeric IDs; `_buildIso3to2Map()` maps 200+ numeric codes to ISO2.

### WHO FluNet API

17. **Endpoint**: `https://xmart-api-public.who.int/FLUMART/VIW_FNT` (NOT the old Azure Front Door URL)
18. **Format**: Default JSON (do NOT pass `$format=json`, that's invalid)
19. **Max records**: `$top=120000`; pagination via `@odata.nextLink`
20. **Subtype priority**: Specific subtypes preferred over aggregates to avoid double-counting.

### Scheduler Timing

21. **FluNet scrape**: Every 6 hours, runs immediately on startup
22. **Anomaly detection**: 01:00, 07:00, 13:00, 19:00 UTC + startup
23. **Full rebuild**: Daily at 05:00 UTC
