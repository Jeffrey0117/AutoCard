import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import GFM for tables
import { Theme, FontOption } from '../types';
import { Download, Copy, Check, Loader2, LayoutGrid, LayoutTemplate, FolderArchive } from 'lucide-react';
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

    // Simple check for potential overflow (approximate)
    React.useEffect(() => {
        if (content.length > 600) setIsOverflowing(true); // Heuristic
        else setIsOverflowing(false);
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
            alert("Copy failed. If using external images, try 'Download' instead, or ensure the image allows CORS.");
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
            alert("Download failed. The image server might be blocking downloads. Try taking a screenshot manually if this persists.");
        }
    };

    const isCover = index === 0;
    const verticalAlignClass = isCover || theme.contentAlign === 'center' 
        ? 'justify-center' 
        : 'justify-start pt-4';

    return (
        <div className="flex flex-col gap-2 group relative">
             <div 
                ref={slideRef}
                id={id}
                className={`
                    w-[375px] h-[500px] shrink-0 
                    transition-all duration-300 ease-in-out
                    flex flex-col overflow-hidden
                    ${theme.slideClassName}
                `}
                style={{ 
                    backgroundColor: theme.backgroundColor.startsWith('#') ? theme.backgroundColor : undefined 
                }}
            >
                {theme.id === 'notebook' && (
                    <div className="absolute top-0 left-8 bottom-0 w-px bg-red-200/50 z-0"></div>
                )}
                {theme.id === 'grid' && (
                    <div className="absolute top-4 right-4 w-12 h-4 bg-yellow-200/50 rotate-[-5deg] z-0"></div>
                )}
                {theme.id === 'summer' && (
                     <>
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500/10"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none"></div>
                     </>
                )}

                <div 
                    ref={contentRef}
                    className={`
                        relative z-10 p-8 h-full flex flex-col
                        ${verticalAlignClass}
                        ${isCover ? 'items-center text-center' : 'text-left'}
                    `}
                >
                    <div className={`
                        prose max-w-none w-full
                        ${theme.proseStyle} 
                        ${fontOption.cssValue}
                        ${isCover ? 'prose-headings:mb-6 prose-p:text-xl' : ''}
                        ${theme.id === 'notebook' ? 'leading-[2rem]' : ''}
                    `}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => (
                                    <h1 
                                        className={`
                                            ${theme.headingColor} 
                                            ${isCover ? 'text-5xl md:text-6xl font-black !mb-8 !mt-0 leading-tight' : 'text-3xl font-bold mt-0 mb-6'}
                                            ${theme.id === 'notebook' ? 'font-marker' : ''}
                                        `} 
                                        {...props} 
                                    />
                                ),
                                h2: ({node, ...props}) => (
                                    <h2 
                                        className={`
                                            ${theme.headingColor}
                                            text-2xl font-bold mt-0 mb-4
                                            ${theme.id === 'editorial' && !isCover ? 'border-l-[6px] border-slate-900 pl-4 py-1' : ''}
                                            ${theme.id === 'grid' ? 'bg-yellow-100 inline px-2 box-decoration-clone leading-snug' : ''}
                                        `} 
                                        {...props} 
                                    />
                                ),
                                p: ({node, ...props}) => (
                                    <p className={`${theme.bodyColor} ${theme.id === 'notebook' ? 'leading-[2rem] my-0' : 'my-4'}`} {...props} />
                                ),
                                strong: ({node, ...props}) => (
                                    <strong className={`
                                        ${theme.id === 'notebook' ? 'bg-yellow-200/40 px-1 box-decoration-clone' : ''} 
                                        ${theme.id === 'summer' ? 'text-blue-600' : ''}
                                    `} {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                    <blockquote className={`
                                        not-italic border-none bg-transparent p-0 my-6
                                        ${theme.id === 'purple-dream' ? 'text-3xl font-marker opacity-90 text-center leading-relaxed' : 'border-l-4 pl-6 opacity-80 italic'}
                                    `} {...props} />
                                ),
                                li: ({node, ...props}) => (
                                    <li className={`${theme.bodyColor} ${theme.id === 'notebook' ? 'leading-[2rem]' : 'my-2'}`} {...props} />
                                ),
                                // --- IMAGE HANDLING ---
                                img: ({node, ...props}) => (
                                    <img 
                                        {...props} 
                                        crossOrigin="anonymous" // Essential for downloading external images
                                        referrerPolicy="no-referrer" // Helps with some hotlink protections
                                        className={`
                                            rounded-lg shadow-md my-4 max-h-[300px] w-auto mx-auto object-cover
                                            ${theme.id === 'grid' ? 'border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}
                                            ${theme.id === 'notebook' ? 'rotate-1 border-4 border-white shadow-lg' : ''}
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
                                                ${theme.id === 'purple-dream' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'} 
                                                rounded px-1.5 py-0.5 text-[0.85em] font-mono font-medium mx-0.5
                                            `} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <pre className={`
                                            ${theme.id === 'grid' ? 'bg-slate-900 text-slate-100' : 'bg-slate-800 text-slate-100'}
                                            rounded-lg p-4 my-4 overflow-x-auto shadow-md text-sm font-mono border border-slate-700/50
                                        `}>
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
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-100/90 to-transparent z-20 pointer-events-none flex items-end justify-center pb-2">
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full">Content Overflow Risk</span>
                    </div>
                )}

                <div className={`
                    absolute bottom-4 left-8 right-8
                    flex justify-between items-center text-[10px] tracking-widest uppercase border-t pt-4
                    ${theme.isDark ? 'border-white/20 text-white/40' : 'border-black/5 text-black/30'}
                    z-10
                `}>
                    <span>@{theme.name}</span>
                    <span>{index + 1} / {total}</span>
                </div>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                 <button 
                    onClick={handleCopy}
                    className="p-2 bg-white/90 backdrop-blur text-slate-700 rounded-lg shadow-sm hover:text-indigo-600 border border-slate-200"
                    title="Copy Image"
                 >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : status === 'success' ? <Check className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
                 </button>
                 <button 
                    onClick={handleDownload}
                    className="p-2 bg-white/90 backdrop-blur text-slate-700 rounded-lg shadow-sm hover:text-indigo-600 border border-slate-200"
                    title="Download PNG"
                 >
                    <Download className="w-4 h-4"/>
                 </button>
            </div>
        </div>
    )
}

const Preview: React.FC<PreviewProps> = ({ content, theme, fontOption, title }) => {
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [isZipping, setIsZipping] = useState(false);

  const slides = useMemo(() => {
    return content.split(/\n-{3,}\n/).filter(slide => slide.trim().length > 0);
  }, [content]);

  // Handle Download All as ZIP
  const handleDownloadAll = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder(title.replace(/\s+/g, '-'));

    // Config for bulk export
    const htmlToImageConfig = {
        cacheBust: true,
        pixelRatio: 2,
        skipAutoScale: true,
        useCORS: true,
        allowTaint: true,
        fontEmbedCSS: '', 
        filter: (node: HTMLElement) => node.tagName !== 'LINK'
    };

    try {
        const slideElements = document.querySelectorAll('[id^="slide-"]');
        
        // Process sequentially to avoid browser hanging
        for (let i = 0; i < slideElements.length; i++) {
            const el = slideElements[i] as HTMLElement;
            // Increased delay to ensure images load
            await new Promise(r => setTimeout(r, 300));
            const blob = await toBlob(el, htmlToImageConfig);
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
        alert("Failed to generate ZIP. If using external images, this might be due to CORS restrictions.");
    } finally {
        setIsZipping(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-100/50 flex flex-col">
       <div className="px-6 py-3 bg-white/50 backdrop-blur border-b border-slate-200/50 flex justify-between items-center">
          <div className="text-xs text-slate-500 font-medium">
            {slides.length} Pages • {theme.name}
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors border border-indigo-100"
            >
                {isZipping ? <Loader2 className="w-3 h-3 animate-spin"/> : <FolderArchive className="w-3 h-3" />}
                Download All
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <div className="flex bg-slate-200/50 rounded-lg p-0.5">
                <button 
                    onClick={() => setViewMode('carousel')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'carousel' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Carousel View"
                >
                    <LayoutTemplate className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Grid View"
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
            </div>
          </div>
       </div>

       <div className={`
            flex-1 p-8 md:p-12 overflow-y-auto scrollbar-styled
            ${viewMode === 'carousel' 
                ? 'flex flex-row items-center gap-8 overflow-x-auto overflow-y-hidden' 
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center'
            }
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
            
            <div className="w-[375px] h-[500px] shrink-0 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <div className="text-sm font-medium">Add New Page</div>
                <div className="text-xs text-center px-4">Type "---" in the editor to create a new slide</div>
            </div>
       </div>
    </div>
  );
};

export default Preview;