# Quantify

> Make your invisible work visible.

A personal contribution tracker for the work that often goes unrecognised — caregiving, learning, self-improvement, and more.

---

## Deploy in 5 minutes

### Option A — Vercel (recommended)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Create React App — just click **Deploy**
4. Share the URL it gives you

### Option B — Netlify

1. Push this folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build command: `npm run build` · Publish directory: `build`
4. Click **Deploy site**

### Option C — Run locally

```bash
npm install
npm start
```

Opens at http://localhost:3000

---

## Features (MVP)

- **Log activities** with contribution value (RM), happiness (1–5), and energy impact (−5 to +5)
- **Today screen** — daily score card and category breakdown
- **Insights** — weekly totals, 7-day bar chart, auto-generated patterns
- **Evidence Folder** — full history of every contribution, grouped by day
- **Profile** — lifetime stats and achievements
- **Streak tracking** — consecutive days logged
- Data persists in localStorage (per device, per browser)

---

## Project structure

```
quantify/
├── public/
│   └── index.html
├── src/
│   ├── App.js       ← entire app (single file for easy editing)
│   └── index.js     ← React entry point
├── package.json
├── vercel.json      ← Vercel config
└── netlify.toml     ← Netlify config
```

---

## Roadmap ideas

- [ ] Shareable weekly summary card (PNG export)
- [ ] Supabase backend for cross-device sync
- [ ] Partner view (read-only sharing with a family member)
- [ ] PWA / Add to Home Screen support
- [ ] Push notification for weekly reflection
