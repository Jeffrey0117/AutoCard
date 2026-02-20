import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import GFM for tables
import { Theme, FontOption } from '../types';
import { Download, Copy, Check, Loader2, FolderArchive } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import JSZip from 'jszip';

interface PreviewProps {
  content: string;
  theme: Theme;
  fontOption: FontOption;
  title: string;
  previewRef: React.RefObject<HTMLDivElement>;
}

const Slide: React.FC<{ 
    content: string; 
    theme: Theme; 
    fontOption: FontOption;
    index: number; 
    total: number;
    id: string;
    title: string;
}> = ({ content, theme, fontOption, index, total, id, title }) => {
    const slideRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [fontScale, setFontScale] = useState(100);

    // Detect real overflow and auto-shrink font
    React.useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        el.style.fontSize = '100%';
        setFontScale(100);

        // Use rAF + setTimeout to ensure layout is fully computed
        requestAnimationFrame(() => {
            setTimeout(() => {
                let scale = 100;
                while (el.scrollHeight > el.clientHeight && scale > 40) {
                    scale -= 5;
                    el.style.fontSize = `${scale}%`;
                    // Force synchronous reflow so scrollHeight updates
                    void el.offsetHeight;
                }
                setFontScale(scale);
                setIsOverflowing(el.scrollHeight > el.clientHeight);
            }, 0);
        });
    }, [content]);

    // Configuration to prevent CORS errors with external fonts and IMAGES
    const htmlToImageConfig = {
        cacheBust: true,
        pixelRatio: 2,
        skipAutoScale: true,
        useCORS: true, // IMPORTANT: Allows external images to be captured
        allowTaint: true, // IMPORTANT: Allows cross-origin images
        fontEmbedCSS: '', 
        filter: (node: HTMLElement) => {
            // Exclude external stylesheets from the clone to prevent fetch errors
            if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
                return false;
            }
            return true;
        }
    };

    const handleCopy = async () => {
        if (!slideRef.current) return;
        setStatus('loading');
        try {
            await new Promise(r => setTimeout(r, 300)); // Increased delay for robust rendering
            const blob = await toBlob(slideRef.current, htmlToImageConfig);
            if (blob) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 2000);
            }
        } catch (e) {
            console.error('Copy failed:', e);
            setStatus('idle');
            alert("複製失敗。如使用外部圖片，請改用「下載」或確認圖片允許跨域存取。");
        }
    };

    const handleDownload = async () => {
        if (!slideRef.current) return;
        setStatus('loading');
        try {
            await new Promise(r => setTimeout(r, 300)); // Increased delay
            const dataUrl = await toPng(slideRef.current, htmlToImageConfig);
            const link = document.createElement('a');
            link.download = `${title}-slide-${index + 1}.png`;
            link.href = dataUrl;
            link.click();
            setStatus('idle');
        } catch (e) {
            console.error('Download failed:', e);
            setStatus('idle');
            alert("下載失敗。圖片伺服器可能阻擋下載，請嘗試手動截圖。");
        }
    };

    const isCover = index === 0;

    return (
        <div className="flex flex-col gap-1.5 group relative">
             <div
                ref={slideRef}
                id={id}
                className={`
                    w-[240px] h-[320px] sm:w-[195px] sm:h-[260px] shrink-0
                    transition-all duration-300 ease-in-out
                    flex flex-col overflow-hidden
                    ${theme.slideClassName}
                `}
                style={{
                    backgroundColor: theme.backgroundColor.startsWith('#') ? theme.backgroundColor : undefined
                }}
            >
                {theme.id === 'notebook' && (
                    <div className="absolute top-0 left-6 bottom-0 w-px bg-red-300/40 z-0"></div>
                )}
                {theme.id === 'grid' && (
                    <div className="absolute top-3 right-3 w-8 h-3 bg-yellow-300/60 rotate-[-5deg] z-0 rounded-sm"></div>
                )}
                {theme.id === 'summer' && (
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -mr-8 -mb-8 pointer-events-none"></div>
                )}

                <div
                    ref={contentRef}
                    className={`
                        relative z-10 px-3 h-full flex flex-col overflow-hidden
                        ${isCover ? 'justify-center items-center text-center' : 'pt-10 pb-2 justify-start text-left'}
                    `}
                    style={{ fontSize: `${fontScale}%` }}
                >
                    <div className={`
                        prose prose-xs max-w-none w-full text-[10px] leading-relaxed
                        ${theme.proseStyle}
                        ${fontOption.cssValue}
                    `}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => (
                                    <h1
                                        className={`
                                            ${theme.headingColor}
                                            ${isCover ? 'text-base font-black mb-1 leading-tight' : 'text-sm font-bold mt-0 mb-2 leading-snug'}
                                            ${theme.id === 'notebook' ? 'font-marker' : ''}
                                        `}
                                        {...props}
                                    />
                                ),
                                h2: ({node, ...props}) => (
                                    <h2
                                        className={`
                                            ${theme.headingColor}
                                            text-xs font-semibold mt-2 mb-1
                                            ${theme.id === 'editorial' ? 'border-l-2 border-slate-900 pl-1.5' : ''}
                                            ${theme.id === 'grid' ? 'bg-yellow-100/80 px-1 rounded' : ''}
                                        `}
                                        {...props}
                                    />
                                ),
                                p: ({node, ...props}) => (
                                    <p className={`${theme.bodyColor} my-1.5 leading-relaxed`} {...props} />
                                ),
                                strong: ({node, ...props}) => (
                                    <strong className={`
                                        font-semibold
                                        ${theme.id === 'notebook' ? 'bg-yellow-200/50 px-0.5' : ''}
                                        ${theme.id === 'summer' ? 'text-blue-600' : ''}
                                    `} {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                    <blockquote className={`
                                        my-2 pl-2 border-l-2 opacity-80 italic text-[9px]
                                        ${theme.isDark ? 'border-white/30' : 'border-slate-300'}
                                    `} {...props} />
                                ),
                                li: ({node, ...props}) => (
                                    <li className={`${theme.bodyColor} my-0.5 leading-relaxed`} {...props} />
                                ),
                                ul: ({node, ...props}) => (
                                    <ul className="my-1.5 pl-3 list-disc" {...props} />
                                ),
                                ol: ({node, ...props}) => (
                                    <ol className="my-1.5 pl-3 list-decimal" {...props} />
                                ),
                                // --- IMAGE HANDLING ---
                                img: ({node, ...props}) => (
                                    <img
                                        {...props}
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        className={`
                                            rounded shadow-sm my-1.5 max-h-[60px] w-auto object-cover
                                            ${theme.id === 'grid' ? 'border border-slate-400' : ''}
                                            ${theme.id === 'notebook' ? 'border border-white shadow' : ''}
                                        `}
                                    />
                                ),
                                // --- TABLE HANDLING ---
                                table: ({node, ...props}) => (
                                    <div className="overflow-x-auto my-4 w-full">
                                        <table className={`
                                            min-w-full text-sm border-collapse table-auto
                                            ${theme.id === 'grid' ? 'border-2 border-slate-900' : 'border border-slate-300'}
                                            ${theme.id === 'purple-dream' ? 'border-white/30 text-white' : ''}
                                        `} {...props} />
                                    </div>
                                ),
                                thead: ({node, ...props}) => (
                                    <thead className={`
                                        ${theme.id === 'summer' ? 'bg-blue-100/50' : 'bg-slate-100/50'}
                                        ${theme.id === 'purple-dream' ? 'bg-white/10' : ''}
                                        ${theme.id === 'grid' ? 'bg-yellow-50' : ''}
                                    `} {...props} />
                                ),
                                tr: ({node, ...props}) => (
                                    <tr className={`
                                        border-b
                                        ${theme.id === 'grid' ? 'border-slate-900' : 'border-slate-200'}
                                        ${theme.id === 'purple-dream' ? 'border-white/20' : ''}
                                    `} {...props} />
                                ),
                                th: ({node, ...props}) => (
                                    <th className={`
                                        p-2 text-left font-bold border-r last:border-r-0
                                        ${theme.id === 'grid' ? 'border-slate-900' : 'border-slate-200'}
                                        ${theme.id === 'purple-dream' ? 'border-white/20' : ''}
                                    `} {...props} />
                                ),
                                td: ({node, ...props}) => (
                                    <td className={`
                                        p-2 border-r last:border-r-0
                                        ${theme.id === 'grid' ? 'border-slate-900' : 'border-slate-200'}
                                        ${theme.id === 'purple-dream' ? 'border-white/20' : ''}
                                    `} {...props} />
                                ),
                                // --- CODE HANDLING ---
                                code: ({node, className, children, ...props}) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match && !String(children).includes('\n');

                                    if (isInline) {
                                        return (
                                            <code className={`
                                                ${theme.id === 'purple-dream' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-100'}
                                                rounded px-1 py-0.5 text-[8px] font-mono
                                            `} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <pre className="bg-slate-800 text-slate-100 rounded p-2 my-1.5 text-[7px] font-mono leading-relaxed whitespace-pre-wrap break-all">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    );
                                }
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Overflow Warning Indicator */}
                {isOverflowing && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-red-200/80 to-transparent z-20 pointer-events-none" />
                )}

                <div className={`
                    absolute bottom-0.5 right-2 text-[5px] tracking-wide
                    ${theme.isDark ? 'text-white/20' : 'text-black/15'}
                    z-10
                `}>
                    {index + 1}/{total}
                </div>
            </div>

            <div className="flex gap-1.5 sm:absolute sm:top-1 sm:right-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-30 mt-1 sm:mt-0">
                 <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:p-1 bg-indigo-50 sm:bg-white/90 backdrop-blur text-indigo-600 sm:text-slate-700 rounded-lg sm:rounded shadow-sm hover:text-indigo-600 border border-indigo-200 sm:border-slate-200 text-xs sm:text-base"
                    title="下載 PNG"
                 >
                    <Download className="w-3.5 h-3.5 sm:w-3 sm:h-3"/>
                    <span className="sm:hidden">下載</span>
                 </button>
                 <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:p-1 bg-white/90 backdrop-blur text-slate-600 sm:text-slate-700 rounded-lg sm:rounded shadow-sm hover:text-indigo-600 border border-slate-200 text-xs sm:text-base"
                    title="複製圖片"
                 >
                    {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 sm:w-3 sm:h-3 animate-spin"/> : status === 'success' ? <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-emerald-500"/> : <Copy className="w-3.5 h-3.5 sm:w-3 sm:h-3"/>}
                    <span className="sm:hidden">複製</span>
                 </button>
            </div>
        </div>
    )
}

const Preview: React.FC<PreviewProps> = ({ content, theme, fontOption, title }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const slides = useMemo(() => {
    return content.split(/\n-{3,}\n/).filter(slide => slide.trim().length > 0);
  }, [content]);

  const htmlToImageBulkConfig = {
    cacheBust: true,
    pixelRatio: 2,
    skipAutoScale: true,
    useCORS: true,
    allowTaint: true,
    fontEmbedCSS: '',
    filter: (node: HTMLElement) => node.tagName !== 'LINK'
  };

  // Batch download: one PNG at a time
  const handleBatchDownload = async () => {
    setIsBatchDownloading(true);
    setBatchProgress(0);
    const slideElements = document.querySelectorAll('[id^="slide-"]');

    for (let i = 0; i < slideElements.length; i++) {
      const el = slideElements[i] as HTMLElement;
      try {
        await new Promise(r => setTimeout(r, 400));
        const dataUrl = await toPng(el, htmlToImageBulkConfig);
        const link = document.createElement('a');
        link.download = `${title}-slide-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
        setBatchProgress(i + 1);
      } catch {
        // skip failed slide
      }
    }

    setIsBatchDownloading(false);
  };

  // Handle Download All as ZIP
  const handleDownloadAll = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder(title.replace(/\s+/g, '-'));

    try {
        const slideElements = document.querySelectorAll('[id^="slide-"]');

        for (let i = 0; i < slideElements.length; i++) {
            const el = slideElements[i] as HTMLElement;
            await new Promise(r => setTimeout(r, 300));
            const blob = await toBlob(el, htmlToImageBulkConfig);
            if (blob && folder) {
                folder.file(`${title}-slide-${i + 1}.png`, blob);
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${title}.zip`;
        link.click();

    } catch (e) {
        console.error("Zip generation failed", e);
        alert("ZIP 產生失敗。如使用外部圖片，可能因跨域限制導致。");
    } finally {
        setIsZipping(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col min-h-0">
       <div className="px-3 sm:px-6 py-2 border-b border-slate-100 flex justify-between items-center gap-2">
          <div className="text-xs text-slate-500 font-medium shrink-0">
            {slides.length} 頁
          </div>
          <div className="flex items-center gap-1.5">
            <button
                onClick={handleBatchDownload}
                disabled={isBatchDownloading || isZipping}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors border border-indigo-100"
            >
                {isBatchDownloading ? <><Loader2 className="w-3 h-3 animate-spin"/> {batchProgress}/{slides.length}</> : <><Download className="w-3 h-3" /> 逐張下載</>}
            </button>
            <button
                onClick={handleDownloadAll}
                disabled={isZipping || isBatchDownloading}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors border border-slate-200"
            >
                {isZipping ? <Loader2 className="w-3 h-3 animate-spin"/> : <FolderArchive className="w-3 h-3" />}
                ZIP
            </button>
          </div>
       </div>

       <div className={`
            flex-1 px-3 sm:px-6 py-4 scrollbar-styled min-h-0
            sm:overflow-x-auto sm:overflow-y-hidden sm:flex-row sm:items-center
            overflow-y-auto overflow-x-hidden flex-col items-center
            flex gap-4
       `}>
            {slides.map((slideContent, index) => (
                <Slide
                    key={index}
                    id={`slide-${index}`}
                    content={slideContent}
                    theme={theme}
                    fontOption={fontOption}
                    index={index}
                    total={slides.length}
                    title={title}
                />
            ))}

            <div className="w-[240px] h-[320px] sm:w-[195px] sm:h-[260px] shrink-0 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-1 opacity-50 hover:opacity-100 transition-opacity">
                <div className="text-xs font-medium">新增頁面</div>
                <div className="text-[10px] text-center px-2">輸入 "---"</div>
            </div>
       </div>
    </div>
  );
};

export default Preview;