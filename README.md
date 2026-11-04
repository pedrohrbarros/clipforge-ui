# ClipForge UI

The web interface for [ClipForge](../clipforge): drop one video, get up to five captioned
9:16 shorts, and see how much free Groq quota is left. Built with Next.js (App Router),
TypeScript and Tailwind, deployed on Vercel.

## What the page does

1. Pings the API on load. If the Render free instance is asleep it shows "Waking the
   server" until it answers, then loads the quota panel from `GET /usage`.
2. You drop or choose a video (under 500 MB and 10 minutes), which previews inside the
   phone-shaped frame, or paste a YouTube link instead. A link wins over a chosen file.
3. "Make shorts" uploads it to `POST /jobs` with the captions flag, then polls
   `GET /jobs/{id}` every two seconds. Progress fills the frame from the bottom.
4. When the job is done, each short appears as a playable 9:16 card with a download
   link, plus "Download all" for a zip. Results expire on the server after an hour.

YouTube links are fetched on the server; YouTube sometimes blocks hosted servers, in which
case the job fails with a message suggesting an upload instead.

## Requirements

- Node 20 or newer
- A running ClipForge API (locally on port 8000, or the Render URL)

## Local development

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL and API_KEY
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the ClipForge API, no trailing slash |
| `API_KEY` | Same value as the API's `AUTHORIZATION_KEY` |

## API key

The API requires a shared secret, `AUTHORIZATION_KEY` on the server. The frontend reads the
same value from `API_KEY`, sends it as `Authorization: Bearer` on every request, and appends
it as `?token=` to the video and zip URLs the browser loads directly. `next.config.ts` inlines
`API_KEY` into the browser bundle at build time, so it is visible to anyone using the site;
that is inherent to a browser that calls the API directly. Changing it needs a rebuild.

## Languages

English, Portuguese and Spanish, in `lib/i18n.ts`. The page follows the browser language
on first visit; the selector next to the theme toggle overrides it and the choice is kept in
`localStorage`. Server failures carry a `code` that the UI translates, with the server's
English message as fallback.

## Theme

Dark by default. The toggle in the header switches to light and remembers the choice in
`localStorage`; a tiny inline script in `app/layout.tsx` applies it before first paint.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
npm test        # vitest (UsagePanel rendering)
```

## Deploy on Vercel

1. Push this repo to GitHub and import it in Vercel. The defaults for Next.js are fine.
2. Add the environment variables `NEXT_PUBLIC_API_URL` (the Render URL of the API, for
   example `https://clipforge.onrender.com`) and `API_KEY` (the API's `AUTHORIZATION_KEY`).
3. On the Render service set `ALLOWED_ORIGINS` to your Vercel URL so CORS allows the
   browser to call the API directly. Uploads go straight from the browser to Render, so
   Vercel's function limits never apply.

## Project layout

```
app/page.tsx              the single page and its state machine
app/layout.tsx            fonts (Bricolage Grotesque, Instrument Sans) and metadata
app/globals.css           design tokens, the .phone frame, buttons
app/icon.svg              favicon
components/Dropzone.tsx   drag and drop plus file preview (the link field lives in page.tsx)
components/Progress.tsx   ember fill and step list
components/ShortCard.tsx  playable result with download link
components/UsagePanel.tsx remaining uses per model as progress bars
components/Logo.tsx       the logo mark (also in public/logo.svg)
components/LanguageSelect.tsx  language dropdown
components/ThemeToggle.tsx     dark/light switch
lib/i18n.ts               dictionaries, detection and the useT hook
lib/api.ts                typed calls to the API
```
