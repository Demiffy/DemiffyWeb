import { useRef, useEffect } from "react";
import throttle from "lodash/throttle";

const GRID_COLOR = "#00ff5e";
const BG_COLOR = "#009447";
const BG_ALPHA = 0.16;
const SWEEP_SPEED = 2;
const SWEEP_RELATIVE_WIDTH = 0.015;

// --- Utility grid math ---
const getGridConfig = (w: number, h: number) => {
  const minMajorPx = 140;
  const majorX = Math.max(6, Math.round(w / minMajorPx));
  const majorY = Math.max(4, Math.round(h / minMajorPx));
  return {
    majorX, majorY,
    cellW: w / (majorX - 1),
    cellH: h / (majorY - 1),
    minorPerMajor: 4,
  };
};

function drawRadar(ctx: CanvasRenderingContext2D, w: number, h: number, sweepX: number, sweepY: number) {
  ctx.clearRect(0, 0, w, h);

  // --- Background
  ctx.save();
  ctx.globalAlpha = BG_ALPHA;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  const { majorX, majorY, cellW, cellH, minorPerMajor } = getGridConfig(w, h);

  // --- Major grid lines
  ctx.save();
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 2;
  for (let i = 0; i < majorX; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellW, 0);
    ctx.lineTo(i * cellW, h);
    ctx.stroke();
  }
  for (let i = 0; i < majorY; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellH);
    ctx.lineTo(w, i * cellH);
    ctx.stroke();
  }
  ctx.restore();

  // --- Minor grid lines
  ctx.save();
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 5;
  ctx.globalAlpha = 0.44;
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  for (let i = 0; i < majorX - 1; i++) {
    for (let m = 1; m < minorPerMajor; m++) {
      let x = i * cellW + (m * cellW) / minorPerMajor;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }
  for (let i = 0; i < majorY - 1; i++) {
    for (let m = 1; m < minorPerMajor; m++) {
      let y = i * cellH + (m * cellH) / minorPerMajor;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // --- Central crosshair
  ctx.save();
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 2.5;
  const cx = w / 2, cy = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - cellW * 0.18, cy); ctx.lineTo(cx + cellW * 0.18, cy); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - cellH * 0.18); ctx.lineTo(cx, cy + cellH * 0.18); ctx.stroke();
  ctx.restore();

  // --- Sweep bar
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 25;
  ctx.fillStyle = GRID_COLOR;
  const sweepBarWidth = Math.max(w * SWEEP_RELATIVE_WIDTH, 8);
  ctx.fillRect(sweepX - sweepBarWidth / 2, 0, sweepBarWidth, h);
  ctx.restore();

  // --- Rectangle & bar
  const rectW = Math.max(0.042 * w, 44);
  const rectH = Math.max(0.28 * h, 120);
  const rectX = Math.max(0.017 * w, 12);
  const rectY = h / 2 - rectH / 2;

  // Rectangle box
  ctx.save();
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.96;
  ctx.beginPath();
  ctx.rect(rectX, rectY, rectW, rectH);
  ctx.stroke();
  ctx.restore();

  // Ticks
  ctx.save();
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 2.2;
  [rectY, rectY + rectH / 2, rectY + rectH].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(rectX, y);
    ctx.lineTo(rectX + rectW * 0.24, y);
    ctx.stroke();
  });
  ctx.restore();

  // --- Moving indicator bar
    ctx.save();
    ctx.shadowColor = GRID_COLOR;
    ctx.shadowBlur = 32;
    ctx.globalAlpha = 1;
    ctx.fillStyle = GRID_COLOR;
    const barH = Math.max(rectH * 0.075, 11);
    const barW = rectW - 20;
    ctx.fillRect(rectX + 10, sweepY, barW, barH);
    ctx.restore();
    }

function drawLabels(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { cellW, cellH } = getGridConfig(w, h);
  ctx.save();
  ctx.font = "bold clamp(16px, 2vw, 28px) 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = GRID_COLOR;
  ctx.shadowColor = GRID_COLOR;
  ctx.shadowBlur = 10;
  ctx.fillText("60°×10°", w / 2 - cellW * 0.7, h * 0.06);
  ctx.fillText("SRC PD", w / 2 + cellW * 1.2, h * 0.06);
  ctx.textAlign = "right";
  ctx.fillText("37 km", w - 22, h * 0.095);
  ctx.textAlign = "left";
  ctx.fillText("120°", 16, cellH * 0.85);
  ctx.fillText("60°", 16, h / 4 + cellH * 0.08);
  ctx.fillText("-60°", 28, (3 * h) / 4 + cellH * 0.05);
  ctx.textAlign = "right";
  ctx.fillText("60°", w - 15, cellH * 0.85);
  ctx.fillText("0 km", w - 22, h - 22);
  ctx.restore();
}

export default function Grid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const setCanvasSize = () => {
      if (!canvasRef.current) return;
      const w = window.innerWidth, h = window.innerHeight;
      canvasRef.current.width = w * window.devicePixelRatio;
      canvasRef.current.height = h * window.devicePixelRatio;
      canvasRef.current.style.width = `${w}px`;
      canvasRef.current.style.height = `${h}px`;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    const handleResize = throttle(setCanvasSize, 80);
    setCanvasSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let animId = 0;
    let sweepX = window.innerWidth / 2;
    let dirX = 1;
    let row = 0;

    const animate = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const { majorY } = getGridConfig(w, h);
      const numRows = majorY - 1;

      if (sweepX > w) {
        dirX = -1;
        row = (row + 1) % numRows;
      }
      if (sweepX < 0) {
        dirX = 1;
        row = (row + 1) % numRows;
      }
      sweepX += SWEEP_SPEED * dirX * (w / 900);

      const rectH = Math.max(0.28 * h, 120);
      const rectY = h / 2 - rectH / 2;
      const barH = Math.max(rectH * 0.075, 11);
      const sweepY = rectY + (rectH - barH) - (row * (rectH - barH) / (numRows - 1));

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawRadar(ctx, w, h, sweepX, sweepY);
        drawLabels(ctx, w, h);
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-0">
      <canvas ref={canvasRef} />
    </div>
  );
}
