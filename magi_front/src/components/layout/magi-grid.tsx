// ============================================================
// MAGI2.0 — MAGI Grid 布局容器 (Layout 组件)
// 规则 R1: 仅使用 CSS Grid + Flexbox 布局
// 规则 R2: 禁止 position: absolute/fixed
// 规则 R3: Grid 定义锁定，不可修改
// 规则 R5: 每个文件 ≤ 200 行
//
// Grid 定义 (锁定):
//   grid-template-columns: 22% 1fr 22%
//   grid-template-rows: 1fr 1fr
//   grid-template-areas:
//     "proposal  melchior  verdict"
//     "balthasar video     casper"
//
// 布局映射:
//   proposal  → 左上: 提案面板
//   melchior  → 中上: 梅尔基奥尔
//   verdict   → 右上: 表态面板
//   balthasar → 左下: 巴尔塔萨
//   video     → 中下: 系统日志
//   casper    → 右下: 卡斯帕
// ============================================================

"use client";

import type { ReactNode } from "react";

interface MagiGridProps {
  proposal: ReactNode;
  melchior: ReactNode;
  verdict: ReactNode;
  balthasar: ReactNode;
  video: ReactNode;
  casper: ReactNode;
}

export function MagiGrid({
  proposal,
  melchior,
  verdict,
  balthasar,
  video,
  casper,
}: MagiGridProps) {
  return (
    <div
      className="w-full h-full min-h-screen"
      style={{
        display: "grid",
        gridTemplateColumns: "22% 1fr 22%",
        gridTemplateRows: "1fr 1fr",
        gridTemplateAreas: `
          "proposal  melchior  verdict"
          "balthasar video     casper"
        `,
      }}
    >
      {/* SVG 连接线 — 覆盖在 Grid 之上，使用 grid-area 跨越所有单元格 */}
      <svg
        className="pointer-events-none z-10 w-full h-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ gridArea: "1 / 1 / -1 / -1", mixBlendMode: "screen" }}
      >
        <g stroke="var(--magi-amber, #c0843c)" strokeWidth="0.3" fill="none">
          {/* Melchior(中上) → Balthasar(左下) */}
          <line x1="50" y1="30" x2="18" y2="72" />
          {/* Balthasar(左下) → Casper(右下) */}
          <line x1="18" y1="72" x2="82" y2="72" />
          {/* Casper(右下) → Melchior(中上) */}
          <line x1="82" y1="72" x2="50" y2="30" />
        </g>
      </svg>

      <div style={{ gridArea: "proposal" }} className="relative overflow-hidden">
        {proposal}
      </div>
      <div style={{ gridArea: "melchior" }} className="relative overflow-hidden">
        {melchior}
      </div>
      <div style={{ gridArea: "verdict" }} className="relative overflow-hidden">
        {verdict}
      </div>
      <div style={{ gridArea: "balthasar" }} className="relative overflow-hidden">
        {balthasar}
      </div>
      <div style={{ gridArea: "video" }} className="relative overflow-hidden">
        {video}
      </div>
      <div style={{ gridArea: "casper" }} className="relative overflow-hidden">
        {casper}
      </div>
    </div>
  );
}
