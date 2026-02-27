# AutoCard

AI-powered flashcard generator with content pool and social caption tools.

## Stack

- Vite + React 19 (frontend) + Express (backend)
- TypeScript + ESM
- DeepSeek AI (content generation)
- Gemini AI (text enhancement)
- JWT auth (optional)
- Port: 4004

## Run

```bash
npm run dev:vite   # Vite dev server
npm start          # Express production server
npm run build      # Build frontend
```

## Key Files

```
server.js                — Express server wrapping Vercel-style handlers
api/generate.ts          — DeepSeek flashcard generation
api/gemini.ts            — Gemini AI operations
src/App.tsx              — Main app component
src/components/
  AIGenerator.tsx        — AI content generation UI
  AIPanel.tsx            — AI panel component
  ContentPoolPanel.tsx   — Content pool management
  Editor.tsx             — Markdown editor
  Preview.tsx            — Card preview
  SocialCaptionPanel.tsx — Social caption generator
  Toolbar.tsx            — Editor toolbar
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/login` | JWT login (optional) |
| GET | `/api/verify` | Verify JWT token |
| POST | `/api/generate` | Generate flashcards from topic (DeepSeek) |
| POST | `/api/suggest-topics` | AI suggests 10 topics for category |
| POST | `/api/gemini` | Gemini actions (summarize, improve, social caption) |
| GET | `/api/pool` | List content pool entries |
| GET | `/api/pool/:id` | Get pool entry with full markdown |
| POST | `/api/pool` | Create/update pool entry |
| DELETE | `/api/pool/:id` | Delete pool entry |

## Env

- `DEEPSEEK_API_KEY` — required for content generation
- `GEMINI_API_KEY` — required for text enhancement
- `JWT_SECRET` — optional
- `AUTH_PASSWORD` — optional (no auth if empty)

## CloudPipe

- Manifest: `data/manifests/autocard.json` (7 tools)
- Auth: bearer (direct JWT token in auth.json)
- Entry: `server.js`
