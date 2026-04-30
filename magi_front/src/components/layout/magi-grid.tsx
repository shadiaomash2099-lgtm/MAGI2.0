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
