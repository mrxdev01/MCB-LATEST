import { useCallback, useEffect, useRef, useState } from "react";
import { Expand, X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { ikUrl, ikSrcSet } from "@/lib/img";

type ImgT = { url: string; alt?: string | null };

export function Gallery({ images, alt }: { images: ImgT[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const list = images.length ? images : [{ url: "https://placehold.co/1000x1000/f7f3ee/8b7355?text=No+Image" }];
  const hasMany = list.length > 1;

  return (
    <div className="flex flex-col gap-2.5 md:flex-row md:items-start md:gap-3">
      {/* Thumbnails — vertical strip on desktop, horizontal row directly under image on mobile */}
      {hasMany && (
        <div
          className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:max-h-[560px] md:w-20 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0 lg:w-[92px] [scrollbar-width:thin]"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {list.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={i === active}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf7f2] transition-all md:w-full ${
                i === active
                  ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-background"
                  : "ring-1 ring-black/5 hover:ring-brand-primary/50"
              }`}
            >
              <img
                src={ikUrl(img.url, 200)}
                alt=""
                className="h-full w-full object-contain"
                loading="lazy"
                width={96}
                height={96}
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open zoom viewer"
        className="group relative order-1 aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-[#faf7f2] shadow-soft ring-1 ring-black/5 cursor-zoom-in md:order-2 md:min-w-0"
      >
        <img
          src={ikUrl(list[active].url, 900)}
          srcSet={ikSrcSet(list[active].url, [400, 600, 900, 1200])}
          sizes="(min-width: 1024px) 45vw, 100vw"
          alt={alt}
          width={1000}
          height={1000}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-secondary shadow-soft ring-1 ring-black/5">
          <Expand className="h-3 w-3" /> Zoom
        </span>
      </button>



      {open && (
        <ZoomViewer
          images={list}
          index={active}
          onIndex={setActive}
          onClose={() => setOpen(false)}
          alt={alt}
        />
      )}
    </div>
  );
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function ZoomViewer({
  images,
  index,
  onIndex,
  onClose,
  alt,
}: {
  images: ImgT[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  alt: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number; active: boolean; pinchDist?: number; pinchZoom?: number } | null>(null);
  const swipeXRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const goto = useCallback(
    (i: number) => {
      const next = (i + images.length) % images.length;
      onIndex(next);
      reset();
    },
    [images.length, onIndex, reset],
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goto(index + 1);
      else if (e.key === "ArrowLeft") goto(index - 1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.5).toFixed(2)));
      else if (e.key === "-") setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.5).toFixed(2)));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goto, index]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.003;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(z + delta).toFixed(2))));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y, active: true };
    if (zoom === 1) swipeXRef.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current?.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (zoom > 1) setPos({ x: dragRef.current.posX + dx, y: dragRef.current.posY + dy });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    // At zoom=1, treat horizontal drag as 360°/next-angle swipe
    if (zoom === 1 && Math.abs(dx) > 60) {
      if (dx < 0) goto(index + 1);
      else goto(index - 1);
    }
    swipeXRef.current = null;
  };

  const onDoubleClick = () => {
    if (zoom > 1) reset();
    else setZoom(2);
  };

  const img = images[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-3 sm:p-4">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.5).toFixed(2)))}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-semibold text-white/80">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.5).toFixed(2)))}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={reset}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
            aria-label="Reset"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-secondary shadow-lift hover:bg-white/90"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* prev/next */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goto(index - 1)}
            className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20 sm:left-4"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => goto(index + 1)}
            className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20 sm:right-4"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* image stage */}
      <div
        className="relative h-full w-full touch-none select-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        style={{ cursor: zoom > 1 ? "grab" : images.length > 1 ? "ew-resize" : "zoom-in" }}
      >
        <img
          src={ikUrl(img.url, 1600, 85)}
          srcSet={ikSrcSet(img.url, [800, 1200, 1600, 2000], 85)}
          sizes="92vw"
          alt={alt}
          draggable={false}
          className="absolute left-1/2 top-1/2 max-h-[92vh] max-w-[92vw] will-change-transform"
          style={{
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transition: dragRef.current?.active ? "none" : "transform 0.2s ease-out",
          }}
        />
      </div>

      {/* thumbnails */}
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center p-3 sm:p-4">
          <div className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur">
            {images.map((im, i) => (
              <button
                key={im.url + i}
                onClick={() => goto(i)}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 transition ${
                  i === index ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={ikUrl(im.url, 96)} alt="" className="h-full w-full object-cover" loading="lazy" width={48} height={48} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
