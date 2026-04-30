// ============================================================
// MAGI2.0 — 贤人单元卡片 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
// 规则 R7: 组件只通过 props 接收数据
// ============================================================

"use client";

import type { UnitData } from "@/types";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MagiUnitProps {
  data: UnitData;
  clipPath: string;
  statusPos: "top-left" | "top-right";
  children?: React.ReactNode;
}

export function MagiUnit({ data, clipPath, statusPos, children }: MagiUnitProps) {
  const statusTopClass =
    statusPos === "top-right" ? "right-2" : "left-2";

  return (
    <div
      className="relative w-full h-full flex flex-col border border-red-900/20 bg-black/40 crt-screen"
      style={{ clipPath }}
    >
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-red-900/10">
        <span
          className="text-[9px] font-bold tracking-widest"
          style={{ color: data.badgeColor }}
        >
          {data.role.toUpperCase()}
        </span>
        <div className={`absolute ${statusTopClass} top-1`}>
          <StatusIndicator status={data.status} />
        </div>
      </div>

      {/* 内容区 */}
      <div
        className={`flex-1 overflow-y-auto p-2 text-[9px] leading-relaxed text-gray-300 scrollbar-thin markdown-content ${
          data.status === "speaking" ? "animate-lcl" : ""
        }`}
      >
        {data.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.content}
          </ReactMarkdown>
        ) : (
          <span className="text-gray-600 italic">等待初始化...</span>
        )}
      </div>

      {/* 底部: 表态徽章 + 自定义内容 */}
      <div className="flex items-center gap-2 px-2 py-1 border-t border-red-900/10">
        <VerdictBadge verdict={data.verdict} />
        {children}
      </div>
    </div>
  );
}
