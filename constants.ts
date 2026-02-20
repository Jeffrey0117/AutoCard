import { Theme, FontOption } from './types';

export const FONTS: FontOption[] = [
  // 中文字型
  { id: 'sans', name: '思源黑體', cssValue: 'font-sans' },
  { id: 'serif', name: '思源宋體', cssValue: 'font-serif' },
  { id: 'wenkai', name: '霞鶩文楷', cssValue: 'font-wenkai' },
  { id: 'rounded', name: '日系圓體', cssValue: 'font-rounded' },
  { id: 'gothic', name: '圓潤黑體', cssValue: 'font-gothic' },
  { id: 'cute', name: '可愛圓體', cssValue: 'font-cute' },
  { id: 'mincho', name: '明朝體', cssValue: 'font-mincho' },
  // 手寫/藝術字型
  { id: 'hand', name: '毛筆楷書', cssValue: 'font-hand' },
  { id: 'marker', name: '行草書法', cssValue: 'font-marker' },
  // 英文/裝飾字型
  { id: 'modern', name: 'Poppins', cssValue: 'font-modern' },
  { id: 'elegant', name: 'Playfair', cssValue: 'font-elegant' },
  { id: 'classic', name: 'Baskerville', cssValue: 'font-classic' },
  // 特殊字型
  { id: 'pixel', name: '像素點陣', cssValue: 'font-pixel' },
  { id: 'mono', name: '等寬代碼', cssValue: 'font-mono' },
];

export const INITIAL_MARKDOWN = `# 文字筆記
# 這樣發！

如何製作高顏值的社群貼文？
只需簡單幾步，你的內容也能像雜誌一樣精緻。

---

## 1. 善用分頁

太長的文章沒人看。
使用 \`---\` 符號將你的內容切分成多張卡片。

- **封面**：標題要大，吸引眼球
- **內頁**：觀點清晰，排版舒適
- **結尾**：引導互動

---

## 2. 選擇對的主題

不同的內容適合不同的風格：

1. **手寫筆記**：適合學習心得、心情隨筆
2. **格子紙**：適合乾貨分享、清單
3. **雜誌風**：適合深度觀點、金句

> "排版是內容的衣裳。" 

---

## 3. 快速出圖

不需要複雜的設計軟體。
在這裡寫好文字，點擊右上角的複製或下載，直接發布到 Instagram 或小紅書。

**現在就試試看吧！**
`;

export const THEMES: Theme[] = [
  {
    id: 'notebook',
    name: 'Student Notebook',
    defaultFontFamily: 'hand',
    headingColor: 'text-slate-800',
    bodyColor: 'text-slate-700',
    backgroundColor: '#fdfbf7',
    slideClassName: 'bg-notebook border border-slate-200/60 shadow-sm relative',
    accentColor: 'border-yellow-200',
    proseStyle: 'prose-slate prose-xl',
    contentAlign: 'start',
  },
  {
    id: 'grid',
    name: 'Grid Paper',
    defaultFontFamily: 'rounded',
    headingColor: 'text-slate-900',
    bodyColor: 'text-slate-600',
    backgroundColor: '#ffffff',
    slideClassName: 'bg-grid-paper border border-slate-200 shadow-sm relative',
    accentColor: 'border-blue-400',
    proseStyle: 'prose-slate prose-lg',
    contentAlign: 'center',
  },
  {
    id: 'latte',
    name: 'Warm Latte',
    defaultFontFamily: 'serif',
    headingColor: 'text-amber-900',
    bodyColor: 'text-amber-800/80',
    backgroundColor: '#faf5ef',
    slideClassName: 'bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm relative overflow-hidden',
    accentColor: 'border-amber-300',
    proseStyle: 'prose-amber prose-lg',
    contentAlign: 'center',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    defaultFontFamily: 'modern',
    headingColor: 'text-amber-200',
    bodyColor: 'text-slate-300',
    backgroundColor: '#0f172a',
    slideClassName: 'bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 shadow-lg relative border border-slate-700/50',
    accentColor: 'border-amber-400',
    proseStyle: 'prose-invert prose-xl',
    isDark: true,
    contentAlign: 'center',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    defaultFontFamily: 'mincho',
    headingColor: 'text-slate-900',
    bodyColor: 'text-slate-800',
    backgroundColor: '#ffffff',
    slideClassName: 'bg-white border-t-[12px] border-slate-900 shadow-md relative px-8',
    accentColor: 'border-slate-900',
    proseStyle: 'prose-xl prose-slate',
    contentAlign: 'center',
  },
];