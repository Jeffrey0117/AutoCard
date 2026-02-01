<div align="center">

# AutoCard

**Turn Markdown into beautiful social media cards — powered by AI.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**English**](README.md) | [**繁體中文**](README.zh-TW.md)

</div>

---

AutoCard is a modern card editor that lets you write content in Markdown, apply curated visual themes, and export publication-ready slide cards — optimized for Instagram, Xiaohongshu, and other social platforms. An integrated Gemini AI assistant helps you generate, refine, and caption your content.

## Features

| | Feature | Description |
|---|---------|-------------|
| :pencil2: | **Split-Screen Editor** | Real-time Markdown editor with instant live preview |
| :card_index: | **Slide Card System** | `---` separators split content into 375x500px cards |
| :art: | **5 Curated Themes** | Student Notebook · Grid Paper · Summer Breeze · Purple Dream · Editorial |
| :abc: | **8 Font Families** | Rounded · Serif · Sans · Mincho · Handwritten · Calligraphy · Pixel · Mono |
| :robot: | **AI Writing Assistant** | Content generation, grammar fixes, summarization, viral rewrites via Gemini |
| :speech_balloon: | **Social Caption Generator** | Auto-generate captions for Instagram, LinkedIn, Twitter, Threads |
| :arrow_down: | **Flexible Export** | Copy to clipboard, download PNG, or batch export all slides as ZIP |

## Tech Stack

<div align="center">

| Category | Technology |
|:--------:|:----------:|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS |
| Markdown | react-markdown + remark-gfm |
| AI | Google Gemini API (`@google/genai`) |
| Export | html-to-image + JSZip |

</div>

## Getting Started

### Prerequisites

- **Node.js** v18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/Jeffrey0117/AutoCard.git
cd AutoCard
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```env
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
├── index.html                  # Entry point
├── index.tsx                   # React root
├── App.tsx                     # Main application
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Themes, fonts, default content
├── components/
│   ├── Editor.tsx              # Markdown editor pane
│   ├── Preview.tsx             # Live preview (carousel / grid)
│   ├── Toolbar.tsx             # Navigation and controls
│   ├── AIPanel.tsx             # AI writing assistant panel
│   └── SocialCaptionPanel.tsx  # Social caption generator
└── services/
    └── geminiService.ts        # Gemini API integration
```

## License

This project is licensed under the [MIT License](LICENSE).
