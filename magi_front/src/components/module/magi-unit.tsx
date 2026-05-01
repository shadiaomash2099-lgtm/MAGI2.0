// ============================================================
// MAGI2.0 — 贤人单元卡片 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
// 规则 R7: 组件只通过 props 接收数据
//
// 设计说明:
//   - 使用 clipPath 实现 NERV 风格切角
//   - 顶部显示角色名 + 状态指示器
//   - 中间为 Markdown 内容区（发言或总结）
//   - 底部为表态徽章
//   - 发言时触发 LCL 呼吸动画
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

const ROLE_LABELS: Record<string, string> = {
  melchior: "MELCHIOR·1 — 科學家的視點",
  balthasar: "BALTHASAR·2 — 母性的視點",
  casper: "CASPER·3 — 女人的視點",
};

/** 根据状态返回颜色类名：idle/done→天蓝色实底, thinking/speaking→LCL黄色实底 */
function statusColors(status: string) {
  const isActive = status === "thinking" || status === "speaking";
  return {
    bg: isActive ? "bg-amber-900" : "bg-cyan-900",
    border: isActive ? "border-amber-700/30" : "border-cyan-700/25",
    borderBottom: isActive ? "border-amber-700/15" : "border-cyan-700/10",
    borderTop: isActive ? "border-amber-700/15" : "border-cyan-700/10",
    text: isActive ? "text-amber-400/80" : "text-cyan-400/70",
  };
}

export function MagiUnit({ data, clipPath, statusPos, children }: MagiUnitProps) {
  const statusTopClass =
    statusPos === "top-right" ? "right-2" : "left-2";
  const colors = statusColors(data.status);

  return (
    <div
      className={`relative w-full h-full flex flex-col border crt-screen ${colors.bg} ${colors.border}`}
      style={{ clipPath }}
    >
      {/* 顶部信息栏 */}
      <div className={`flex items-center justify-between px-2 py-1 border-b shrink-0 ${colors.borderBottom}`}>
        <span className={`text-[8px] font-bold tracking-widest ${colors.text}`}>
          {ROLE_LABELS[data.role] || data.role.toUpperCase()}
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
        ) : data.summary ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.summary}
          </ReactMarkdown>
        ) : (
          <span className="text-gray-600 italic">等待初始化...</span>
        )}
      </div>

      {/* 底部: 表态徽章 + 自定义内容 */}
      <div className={`flex items-center gap-2 px-2 py-1 border-t shrink-0 ${colors.borderTop}`}>
        <VerdictBadge verdict={data.verdict} />
        {children}
      </div>
    </div>
  );
}
