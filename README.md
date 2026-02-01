# AutoCard

A modern, AI-powered card editor for creating publication-ready social media content. Write in Markdown, choose from curated themes and fonts, and export beautiful slide cards — no design tools required.

## Features

- **Split-Screen Editor** — Real-time Markdown editor with instant live preview
- **Slide Card System** — Use `---` separators to split content into individual cards (375x500px, optimized for Instagram / Xiaohongshu)
- **5 Curated Themes** — Student Notebook, Grid Paper, Summer Breeze, Purple Dream, Editorial
- **8 Font Families** — Rounded, Serif, Sans, Mincho, Handwritten, Calligraphy, Pixel, Monospace
- **AI Writing Assistant** — Powered by Google Gemini for content generation, grammar fixes, summarization, and viral rewrites
- **Social Caption Generator** — Auto-generate captions for Instagram, LinkedIn, Twitter, and Threads
- **Export Options** — Copy to clipboard, download individual PNGs, or batch export all slides as a ZIP archive

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS |
| Markdown | react-markdown + remark-gfm |
| AI | Google Gemini API (`@google/genai`) |
| Export | html-to-image + JSZip |

## Getting Started

### Prerequisites

- Node.js (v18+)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/Jeffrey0117/AutoCard.git
cd AutoCard
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
AutoCard/
├── index.html            # Entry point
├── index.tsx             # React root
├── App.tsx               # Main application
├── types.ts              # TypeScript type definitions
├── constants.ts          # Themes, fonts, default content
├── components/
│   ├── Editor.tsx        # Markdown editor pane
│   ├── Preview.tsx       # Live preview with carousel/grid
│   ├── Toolbar.tsx       # Navigation and controls
│   ├── AIPanel.tsx       # AI writing assistant panel
│   └── SocialCaptionPanel.tsx  # Social caption generator
└── services/
    └── geminiService.ts  # Gemini API integration
```

## License

MIT
