import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FunctionPreset, StationaryPoint } from '../types';
import { sound } from '../utils/audio';

interface PlotCanvasProps {
  preset: FunctionPreset;
  xVal: number;
  hVal: number;
  onXChange: (newX: number) => void;
  showSecant: boolean;
  showTangent: boolean;
  showTriangle: boolean;
  showStationaryMarkers: boolean;
  onSelectStationaryPoint?: (pt: StationaryPoint) => void;
}

export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  preset,
  xVal,
  hVal,
  onXChange,
  showSecant,
  showTangent,
  showTriangle,
  showStationaryMarkers,
  onSelectStationaryPoint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Auto-resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [xMin, xMax] = preset.xRange;
  const [yMin, yMax] = preset.yRange;

  // Coordinate transforms
  const toCanvasX = useCallback(
    (x: number) => ((x - xMin) / (xMax - xMin)) * dimensions.width,
    [xMin, xMax, dimensions.width]
  );
  const toCanvasY = useCallback(
    (y: number) => dimensions.height - ((y - yMin) / (yMax - yMin)) * dimensions.height,
    [yMin, yMax, dimensions.height]
  );
  const toMathX = useCallback(
    (cx: number) => xMin + (cx / dimensions.width) * (xMax - xMin),
    [xMin, xMax, dimensions.width]
  );
  const toMathY = useCallback(
    (cy: number) => yMin + ((dimensions.height - cy) / dimensions.height) * (yMax - yMin),
    [yMin, yMax, dimensions.height]
  );

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const w = dimensions.width;
    const h = dimensions.height;

    // Background
    ctx.fillStyle = '#090d16'; // Deep slate dark
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748b';

    // Vertical grid ticks
    const xStep = (xMax - xMin) <= 6 ? 1 : 2;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
      if (Math.abs(x) > 0.01) {
        const originY = Math.min(Math.max(toCanvasY(0) + 12, 14), h - 6);
        ctx.fillText(x.toString(), cx - 4, originY);
      }
    }

    // Horizontal grid ticks
    const yStep = (yMax - yMin) <= 6 ? 1 : (yMax - yMin) <= 12 ? 2 : 5;
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      if (Math.abs(y) > 0.01) {
        const originX = Math.min(Math.max(toCanvasX(0) + 6, 6), w - 24);
        ctx.fillText(y.toString(), originX, cy + 3);
      }
    }

    // Main Axes
    const originX = toCanvasX(0);
    const originY = toCanvasY(0);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#334155';

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Plot Curve f(x)
    ctx.lineWidth = 3;
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, '#38bdf8');
    gradient.addColorStop(0.5, '#60a5fa');
    gradient.addColorStop(1, '#818cf8');
    ctx.strokeStyle = gradient;

    ctx.beginPath();
    let started = false;
    const numSamples = Math.min(w * 1.5, 600);
    for (let i = 0; i <= numSamples; i++) {
      const x = xMin + (i / numSamples) * (xMax - xMin);
      // Skip undefined or vertical asymptote jump in 1/x
      if (preset.id === 'reciprocal' && Math.abs(x) < 0.08) {
        started = false;
        continue;
      }
      const y = preset.f(x);
      if (isNaN(y) || !isFinite(y) || y < yMin - 10 || y > yMax + 10) {
        started = false;
        continue;
      }
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (!started) {
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Points P and Q evaluations
    const pX = xVal;
    const pY = preset.f(pX);
    const qX = xVal + hVal;
    const qY = preset.f(qX);

    const cPx = toCanvasX(pX);
    const cPy = toCanvasY(pY);
    const cQx = toCanvasX(qX);
    const cQy = toCanvasY(qY);

    const secantSlope = (qY - pY) / hVal;
    const tangentSlope = preset.df(pX);

    // Difference Quotient Delta Triangle
    if (showTriangle && isFinite(secantSlope) && Math.abs(hVal) > 0.005) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38bdf8'; // light cyan
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';

      // Draw triangle P -> (x+h, f(x)) -> Q
      const cCornerX = cQx;
      const cCornerY = cPy;

      ctx.beginPath();
      ctx.moveTo(cPx, cPy);
      ctx.lineTo(cCornerX, cCornerY);
      ctx.lineTo(cQx, cQy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Delta X Label (Run)
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Δx = ${hVal > 0 ? '+' : ''}${hVal.toFixed(3)}`, (cPx + cCornerX) / 2 - 25, cCornerY + (hVal > 0 ? 14 : -6));

      // Delta Y Label (Rise)
      ctx.fillStyle = '#a5f3fc';
      const deltaY = qY - pY;
      ctx.fillText(`Δy = ${deltaY > 0 ? '+' : ''}${deltaY.toFixed(3)}`, cCornerX + (hVal > 0 ? 6 : -65), (cCornerY + cQy) / 2);
      ctx.restore();
    }

    // Extended Secant Line (Cyan)
    if (showSecant && isFinite(secantSlope)) {
      ctx.save();
      ctx.strokeStyle = '#06b6d4'; // cyan-500
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);

      // y - pY = m * (x - pX)  =>  y = m*(x - pX) + pY
      const x1 = xMin - 2;
      const y1 = secantSlope * (x1 - pX) + pY;
      const x2 = xMax + 2;
      const y2 = secantSlope * (x2 - pX) + pY;

      ctx.beginPath();
      ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
      ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
      ctx.stroke();
      ctx.restore();
    }

    // Extended Tangent Line (Neon Red)
    if (showTangent && isFinite(tangentSlope)) {
      ctx.save();
      ctx.strokeStyle = '#f43f5e'; // rose/neon red
      ctx.lineWidth = 2.5;

      const x1 = xMin - 2;
      const y1 = tangentSlope * (x1 - pX) + pY;
      const x2 = xMax + 2;
      const y2 = tangentSlope * (x2 - pX) + pY;

      ctx.beginPath();
      ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
      ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
      ctx.stroke();
      ctx.restore();
    }

    // Stationary Point Markers
    if (showStationaryMarkers && preset.stationaryPoints) {
      preset.stationaryPoints.forEach((pt) => {
        const cx = toCanvasX(pt.x);
        const cy = toCanvasY(pt.y);

        ctx.save();
        ctx.fillStyle = pt.type === 'Local Maximum' ? '#f59e0b' : pt.type === 'Local Minimum' ? '#10b981' : '#8b5cf6';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label above/below
        ctx.font = 'bold 10px Inter, sans-serif';
        const labelY = pt.type === 'Local Maximum' ? cy - 10 : cy + 18;
        ctx.fillText(`${pt.type} (${pt.x}, ${pt.y})`, cx - 35, labelY);
        ctx.restore();
      });
    }

    // Point Q (Cyan Convergence Target)
    if (isFinite(qY)) {
      ctx.save();
      // Glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(cQx, cQy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Q label
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`Q(x+h)`, cQx + 8, cQy - 8);
      ctx.restore();
    }

    // Point P (Fixed Anchor Node)
    if (isFinite(pY)) {
      ctx.save();
      // Pulsing outer halo
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(cPx, cPy, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // P label & coordinate readout
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`P(${pX.toFixed(2)}, ${pY.toFixed(2)})`, cPx - 25, cPy - 14);
      ctx.restore();
    }
  }, [
    dimensions,
    preset,
    xVal,
    hVal,
    showSecant,
    showTangent,
    showTriangle,
    showStationaryMarkers,
    toCanvasX,
    toCanvasY,
    xMin,
    xMax,
    yMin,
    yMax,
  ]);

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const mathX = toMathX(cx);
    const mathY = toMathY(cy);

    // Check if clicked near a stationary point
    if (showStationaryMarkers && preset.stationaryPoints && onSelectStationaryPoint) {
      const clickedPt = preset.stationaryPoints.find((pt) => {
        const dist = Math.hypot(toCanvasX(pt.x) - cx, toCanvasY(pt.y) - cy);
        return dist < 18;
      });
      if (clickedPt) {
        onSelectStationaryPoint(clickedPt);
        return;
      }
    }

    // Set new X and start dragging
    const clampedX = Math.max(xMin + 0.1, Math.min(xMax - 0.1, mathX));
    onXChange(Number(clampedX.toFixed(3)));
    setIsDragging(true);
    sound.playSliderTick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const mathX = toMathX(cx);
    const mathY = toMathY(cy);
    setHoverCoord({ x: mathX, y: mathY });

    if (isDragging) {
      const clampedX = Math.max(xMin + 0.1, Math.min(xMax - 0.1, mathX));
      onXChange(Number(clampedX.toFixed(3)));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      id="plot-canvas-container"
      className="relative w-full h-full min-h-[300px] sm:min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-center select-none"
    >
      <canvas
        id="calculus-interactive-canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setIsDragging(false);
          setHoverCoord(null);
        }}
        className="w-full h-full cursor-crosshair touch-none"
      />

      {/* Floating Canvas Legend */}
      <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 text-[10px] sm:text-xs text-slate-300 pointer-events-none shadow-lg">
        <div className="flex items-center gap-1 px-1.5 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-300/40"></span>
          <span className="font-semibold text-blue-300">P(x, f(x))</span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-cyan-300">Q(x+h, f(x+h))</span>
        </div>
        {showSecant && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 border-l border-slate-700">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block border-b border-dashed"></span>
            <span className="text-cyan-400">Secant Chord</span>
          </div>
        )}
        {showTangent && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 border-l border-slate-700">
            <span className="w-3 h-0.5 bg-rose-500 inline-block"></span>
            <span className="text-rose-400 font-semibold">Tangent f'(x)</span>
          </div>
        )}
      </div>

      {/* Hover readout indicator */}
      {hoverCoord && (
        <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          cursor: x = {hoverCoord.x.toFixed(2)}, y = {hoverCoord.y.toFixed(2)}
        </div>
      )}
    </div>
  );
};
