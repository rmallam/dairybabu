# OurDairy — Smart Farm Ledger & Cattle Tracker

A multi-tenant dairy farm management app for Indian dairy farmers. Tracks cattle, milk yields, health events, and farm finances.

## Running the App

```bash
npm run dev
```

Runs on port 5000. Uses the **Start application** workflow in Replit.

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Custom CSS design system (`src/index.css`) — Pastoral light theme
- **Icons**: lucide-react
- **Database**: Supabase (optional) with localStorage fallback

## Design System — Pastoral Theme

Warm earthy palette applied via CSS variables in `src/index.css`:

| Token | Value | Use |
|---|---|---|
| `--primary` | `#7F936C` | Sage Green — buttons, active states |
| `--secondary` | `#D26D54` | Terracotta — CTAs, alerts |
| `--accent` | `#DFA842` | Amber Gold — highlights |
| `--bg` | `#FCFAF6` | Warm Cream — page background |
| `--bg-sidebar` | `#F1F4EB` | Light Sage — table headers, panels |
| `--text` | `#2E3A24` | Dark Forest — primary text |
| `--font-title` | Fraunces (serif) | Headings |
| `--font-body` | Outfit (sans) | Body text |

## Architecture

All app UI lives in `src/App.tsx` (single-file, ~2450 lines).

Navigation via `activeTab` state: `dashboard` | `cattle` | `financials` | `health`

Data layer in `src/utils/supabaseClient.ts` — falls back to localStorage when Supabase env vars are not set.

## Supabase Setup (optional)

Set these environment secrets to enable cloud sync:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Without them the app runs fully offline using browser localStorage.

## Default Login

After registering a farm or using the demo data:
- **Owner PIN**: `0000`
- **Manager PIN**: `1111`

## User Preferences

- Light mode by default (Pastoral theme)
- Keep the existing single-file App.tsx structure unless explicitly asked to refactor
