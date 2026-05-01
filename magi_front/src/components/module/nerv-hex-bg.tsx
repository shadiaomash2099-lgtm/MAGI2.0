// ============================================================
// MAGI2.0 — NERV 六边形呼吸网格背景
// 规则 R5: ≤ 150 行
// 规则 R2: 无 position: absolute/fixed — 使用 Grid 层叠
//
// 设计说明:
//   - Canvas 绘制 7 个六边形，对角线排列
//   - 每个六边形独立呼吸（随机速度/幅度/相位）
//   - NERV 红色主题
//   - requestAnimationFrame 渲染循环
//   - 作为背景层，不干扰主界面交互
// ============================================================

"use client";

import { useEffect, useRef } from "react";

interface HexData {
  cx: number;
  cy: number;
  size: number;
  breathSpeed: number;
  breathAmp: number;
  breathOffset: number;
}

// 对角线排列模式（7 个六边形）
const HEX_PATTERN: { row: number; col: number }[] = [
  { row: 0, col: 1 },
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
  { row: 3, col: 1 },
];

function hexPoints(
  cx: number,
  cy: number,
  size: number
): { x: number; y: number }[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return {
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    };
  });
}

function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  glow: number
) {
  const points = hexPoints(cx, cy, size);

  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();

  // 填充
  ctx.fillStyle = `rgba(180, 20, 20, ${0.03 + glow * 0.06})`;
  ctx.fill();

  // 边框
  ctx.strokeStyle = `rgba(200, ${40 + Math.floor(30 * glow)}, ${40 + Math.floor(30 * glow)}, ${0.15 + glow * 0.3})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function NervHexBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hexesRef = useRef<HexData[]>([]);
  const animFrameRef = useRef<number>(0);

  // 初始化六边形数据
  useEffect(() => {
    const cols = 5;
    const rows = 5;

    hexesRef.current = HEX_PATTERN.map(({ row, col }) => ({
      cx: ((col + 0.5) / cols) * 100,
      cy: ((row + 0.5) / rows) * 100,
      size: 6 + Math.random() * 3,
      breathSpeed: 0.5 + Math.random() * 1.5,
      breathAmp: 0.15 + Math.random() * 0.25,
      breathOffset: Math.random() * Math.PI * 2,
    }));
  }, []);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      hexesRef.current.forEach((hex) => {
        const glow =
          0.5 +
          0.5 *
            Math.sin(
              time * 0.001 * hex.breathSpeed + hex.breathOffset
            );
        const breathSize =
          hex.size * (1 + hex.breathAmp * (glow - 0.5) * 2);
        const cx = (hex.cx / 100) * w;
        const cy = (hex.cy / 100) * h;
        const size = (breathSize / 100) * Math.min(w, h);

        drawHex(ctx, cx, cy, size, glow);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="col-start-1 row-start-1 col-span-full row-span-full w-full h-full pointer-events-none opacity-40"
      style={{ zIndex: 0 }}
    />
  );
}
