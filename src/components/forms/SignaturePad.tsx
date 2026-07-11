"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icons";
import { LBL } from "@/components/ui/Sheet";

/** Kanvas tanda tangan (pointer events, skala DPR) — lapor status & data ke induk. */
export function SignaturePad({
  onChange,
  onData,
}: {
  onChange: (has: boolean) => void;
  onData?: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    el.width = rect.width * dpr;
    el.height = rect.height * dpr;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle =
      getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#111";
    ctxRef.current = ctx;
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    try {
      canvasRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* abaikan */
    }
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasSig) {
      setHasSig(true);
      onChange(true);
    }
  }
  function up() {
    if (drawing.current && hasSig && onData) {
      try {
        onData(canvasRef.current?.toDataURL("image/png") ?? null);
      } catch {
        /* abaikan */
      }
    }
    drawing.current = false;
  }
  function clear() {
    const ctx = ctxRef.current;
    const el = canvasRef.current;
    if (ctx && el) {
      const r = el.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
    }
    setHasSig(false);
    onChange(false);
    onData?.(null);
  }

  return (
    <div>
      <label className={LBL}>
        Tanda tangan <span className="text-libur">*</span>
      </label>
      <div
        className="overflow-hidden rounded-[14px] bg-surface-2"
        style={{ border: `1.5px solid ${hasSig ? "var(--accent)" : "var(--border-strong)"}` }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="block h-[150px] w-full cursor-crosshair"
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className="text-[11.5px] font-semibold"
          style={{ color: hasSig ? "var(--lembur)" : "var(--faint)" }}
        >
          {hasSig ? "✓ Tanda tangan siap" : "Gambar tanda tangan di area ini"}
        </span>
        <button
          onClick={clear}
          type="button"
          className="flex items-center gap-[5px] text-xs font-bold text-muted"
        >
          <Icon name="trash" size={14} />
          Bersihkan
        </button>
      </div>
    </div>
  );
}
