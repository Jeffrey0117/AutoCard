<div align="center">

# AutoCard

**用 Markdown 打造精美社群圖卡 — AI 驅動。**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**English**](README.md) | [**繁體中文**](README.zh-TW.md)

</div>

---

AutoCard 是一款現代化的圖卡編輯器，讓你用 Markdown 撰寫內容、套用精選視覺主題，並匯出可直接發布的社群圖卡 — 針對 Instagram、小紅書等平台優化。內建 Gemini AI 助手，協助你生成、潤飾與撰寫社群文案。

## 功能特色

| | 功能 | 說明 |
|---|------|------|
| :pencil2: | **分割畫面編輯器** | 即時 Markdown 編輯，搭配同步預覽 |
| :card_index: | **圖卡分頁系統** | 使用 `---` 分隔符將內容切分為 375x500px 圖卡 |
| :art: | **5 款精選主題** | 手寫筆記 · 方格紙 · 夏日微風 · 紫色夢境 · 雜誌風 |
| :abc: | **8 種字體家族** | 圓體 · 宋體 · 黑體 · 明朝體 · 手寫 · 書法 · 像素 · 等寬 |
| :robot: | **AI 寫作助手** | 透過 Gemini 進行內容生成、文法修正、摘要、病毒式改寫 |
| :speech_balloon: | **社群文案產生器** | 自動生成 Instagram、LinkedIn、Twitter、Threads 文案 |
| :arrow_down: | **彈性匯出** | 複製到剪貼簿、下載 PNG、或批次匯出所有圖卡為 ZIP |

## 技術棧

<div align="center">

| 分類 | 技術 |
|:----:|:----:|
| 框架 | React 19 + TypeScript |
| 建置 | Vite 6 |
| 樣式 | Tailwind CSS |
| Markdown | react-markdown + remark-gfm |
| AI | Google Gemini API (`@google/genai`) |
| 匯出 | html-to-image + JSZip |

</div>

## 快速開始

### 前置需求

- **Node.js** v18+
- 一組 [Google Gemini API 金鑰](https://aistudio.google.com/apikey)

### 安裝

```bash
git clone https://github.com/Jeffrey0117/AutoCard.git
cd AutoCard
npm install
```

### 設定

在專案根目錄建立 `.env.local` 檔案：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 開發模式

```bash
npm run dev
```

### 正式建置

```bash
npm run build
npm run preview
```

## 專案結構

```
AutoCard/
├── index.html                  # 進入點
├── index.tsx                   # React 根元件
├── App.tsx                     # 主應用程式
├── types.ts                    # TypeScript 型別定義
├── constants.ts                # 主題、字體、預設內容
├── components/
│   ├── Editor.tsx              # Markdown 編輯面板
│   ├── Preview.tsx             # 即時預覽（輪播 / 網格）
│   ├── Toolbar.tsx             # 導覽列與控制項
│   ├── AIPanel.tsx             # AI 寫作助手面板
│   └── SocialCaptionPanel.tsx  # 社群文案產生器
└── services/
    └── geminiService.ts        # Gemini API 整合
```

## 授權

本專案採用 [MIT 授權條款](LICENSE)。
