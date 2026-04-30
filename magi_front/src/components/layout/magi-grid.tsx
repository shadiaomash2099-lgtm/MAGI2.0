// ============================================================
// MAGI2.0 — MAGI Grid 布局容器 (Layout 组件)
// 规则 R1: 仅使用 CSS Grid + Flexbox 布局
// 规则 R2: 禁止 position: absolute/fixed
// 规则 R3: Grid 定义锁定，不可修改
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import type { ReactNode } from "react";

interface MagiGridProps {
  /** 左上: 提案区 */
  proposal: ReactNode;
  /** 中上: Melchior */
  melchior: ReactNode;
  /** 右上: 表态区 */
  verdict: ReactNode;
  /** 左下: Balthasar */
  balthasar: ReactNode;
  /** 中下: 视频/日志区 */
  video: ReactNode;
  /** 右下: Casper */
  casper: ReactNode;
}

/**
 * MAGI Grid 主布局
 *
 * Grid 定义 (锁定):
 *   grid-template-columns: 22% 1fr 22%
 *   grid-template-rows: 1fr 1fr
 *   grid-template-areas:
 *     "proposal  melchior  verdict"
 *     "balthasar video     casper"
 */
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
      {/* 左上: 提案区 */}
      <div style={{ gridArea: "proposal" }} className="relative overflow-hidden">
        {proposal}
      </div>

      {/* 中上: Melchior */}
      <div style={{ gridArea: "melchior" }} className="relative overflow-hidden">
        {melchior}
      </div>

      {/* 右上: 表态区 */}
      <div style={{ gridArea: "verdict" }} className="relative overflow-hidden">
        {verdict}
      </div>

      {/* 左下: Balthasar */}
      <div style={{ gridArea: "balthasar" }} className="relative overflow-hidden">
        {balthasar}
      </div>

      {/* 中下: 视频/日志区 */}
      <div style={{ gridArea: "video" }} className="relative overflow-hidden">
        {video}
      </div>

      {/* 右下: Casper */}
      <div style={{ gridArea: "casper" }} className="relative overflow-hidden">
        {casper}
      </div>
    </div>
  );
}
