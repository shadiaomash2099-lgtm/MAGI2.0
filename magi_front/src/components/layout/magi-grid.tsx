// ============================================================
// MAGI2.0 — MAGI Grid 布局容器 (Layout 组件)
// 规则 R1: 仅使用 CSS Grid + Flexbox 布局
// 规则 R2: 禁止 position: absolute/fixed
// 规则 R3: Grid 定义锁定，不可修改
// 规则 R5: 每个文件 ≤ 200 行
//
// Grid 定义 (锁定):
//   grid-template-columns: 30.5% 1fr 30.5%
//   grid-template-rows: 1fr 1fr
//   grid-template-areas:
//     "proposal  melchior  verdict"
//     "balthasar video     casper"
//
// 布局映射:
//   proposal  → 左上: 提案面板 (30.5%)
//   melchior  → 中上: 梅尔基奥尔 (39%) — 左右收缩到 0.75 倍
//   verdict   → 右上: 表态面板 (30.5%)
//   balthasar → 左下: 巴尔塔萨 (30.5%) — 向内衍生 1.5 倍
//   video     → 中下: 系统日志 (39%)
//   casper    → 右下: 卡斯帕 (30.5%) — 向内衍生 1.5 倍
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
      className="w-full h-full min-h-screen px-8 pt-4 pb-16"
      style={{
        display: "grid",
        gap: "4px",
        gridTemplateColumns: "30.5% 1fr 30.5%",
        gridTemplateRows: "1fr 1fr",
        gridTemplateAreas: `
          "proposal  melchior  verdict"
          "balthasar video     casper"
        `,
      }}
    >
      {/* SVG 连接线 — 三根独立线从切角中心发出，Balthasar/Casper 下方 1/5 处连接
       *
       * 坐标说明（viewBox 0-100 百分比坐标系）：
       *   列宽: 左列 30.5%, 中列 39% (30.5→69.5), 右列 30.5%
       *   行高: 上行 50%, 下行 50%
       *
       *   Melchior(中上 30.5→69.5, 0→50):
       *     - 左下切角中心: x=30.5+39*6%=32.84, y=50*87.5%=43.75
       *     - 右下切角中心: x=30.5+39*94%=67.16, y=50*87.5%=43.75
       *   Balthasar(左下 0→30.5, 50→100):
       *     - 右上切角中心: x=30.5*94%=28.67, y=50+50*6%=53
       *     - 右侧下方1/5:  x=30.5, y=50+50*4/5=90
       *   Casper(右下 69.5→100, 50→100):
       *     - 左上切角中心: x=69.5+30.5*6%=71.33, y=50+50*6%=53
       *     - 左侧下方1/5:  x=69.5, y=50+50*4/5=90
       *
       *   修改 grid-template-columns 时需同步更新以上坐标。
       */}
      <svg
        className="pointer-events-none w-full h-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ gridArea: "1 / 1 / -1 / -1", zIndex: -1 }}
      >
        <g stroke="var(--magi-amber, #c0843c)" strokeWidth="0.3" fill="none">
          {/* 线1: Melchior 左下切角中心(32.84,43.75) → Balthasar 右上切角中心(28.67,53) */}
          <line x1="32.84" y1="43.75" x2="28.67" y2="53" />
          {/* 线2: Melchior 右下切角中心(67.16,43.75) → Casper 左上切角中心(71.33,53) */}
          <line x1="67.16" y1="43.75" x2="71.33" y2="53" />
          {/* 线3: Balthasar 右侧下方 1/5 处(30.5,90) → Casper 左侧下方 1/5 处(69.5,90) */}
          <line x1="30.5" y1="90" x2="69.5" y2="90" />
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
