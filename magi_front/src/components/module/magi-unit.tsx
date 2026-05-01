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
  melchior: "MELCHIOR",
  balthasar: "BALTHASAR",
  casper: "CASPER",
};

/** 根据状态返回颜色类名：
 *  - idle/done → 天蓝色实底（默认等待/完成）
 *  - thinking  → 蓝色系（等待发言，非活跃）
 *  - speaking  → 亮黄色实底（正在输出，活跃）
 */
function statusColors(status: string) {
  const isSpeaking = status === "speaking";
  const isThinking = status === "thinking";
  return {
    // speaking 的背景色由 animate-lcl 动画接管，此处不设固定 bg 类
    bg: isSpeaking ? "" : isThinking ? "bg-cyan-800" : "bg-cyan-900",
    border: isSpeaking ? "border-amber-500/50" : isThinking ? "border-cyan-600/30" : "border-cyan-700/25",
    borderBottom: isSpeaking ? "border-amber-500/30" : isThinking ? "border-cyan-600/15" : "border-cyan-700/10",
    borderTop: isSpeaking ? "border-amber-500/30" : isThinking ? "border-cyan-600/15" : "border-cyan-700/10",
    text: isSpeaking ? "text-amber-300/90" : isThinking ? "text-cyan-300/80" : "text-cyan-400/70",
  };
}

export function MagiUnit({ data, clipPath, statusPos, children }: MagiUnitProps) {
  const statusTopClass =
    statusPos === "top-right" ? "right-2" : "left-2";
  const colors = statusColors(data.status);

  // Casper 切角在左上角（polygon(12% 0%, ...)），flex-row-reverse 让角色名和模型选择器移到右侧避开切角
  const isCasper = data.role === "casper";
  const isBalthasar = data.role === "balthasar";
  const isMelchior = data.role === "melchior";

  // 根据切角位置动态计算 padding，避免元素被切角遮挡
  // Casper: 左上切角 12% → 标题栏左侧 padding 加大
  // Balthasar: 右上切角 12% → 标题栏右侧 padding 加大
  // Melchior: 底部左右切角在 12%/88% 处，中间区域完整，徽章居中不受影响
  const titlePadding = isCasper ? "pl-[14%] pr-2" : isBalthasar ? "pr-[14%] pl-2" : "px-2";
  const bottomPadding = "py-0.5";

  return (
    <div
      className={`relative w-full h-full flex flex-col border ${colors.bg} ${colors.border} ${
        data.status === "speaking" ? "animate-lcl" : ""
      }`}
      style={{ clipPath }}
    >
      {/* 顶部信息栏: 角色名 + 模型选择器 + 状态指示器 */}
      {/* Casper 使用 flex-row-reverse：视觉上 [角色名] [模型选择器] [状态指示器] 从右到左，避开左上切角 */}
      <div className={`flex ${isCasper ? "flex-row-reverse" : "flex-row"} items-center gap-2 ${titlePadding} py-1 border-b shrink-0 ${colors.borderBottom}`}>
        <span className={`text-[16px] font-bold tracking-[-0.05em] shrink-0 ${colors.text}`}>
          {ROLE_LABELS[data.role] || data.role.toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          {children}
        </div>
        <div className={`shrink-0 ${statusTopClass}`}>
          <StatusIndicator status={data.status} />
        </div>
      </div>

      {/* 内容区 — 根据切角位置调整 padding，避免内容被切角遮挡 */}
      <div
        className={`flex-1 overflow-y-auto text-[16px] leading-relaxed text-gray-300 scrollbar-thin markdown-content ${
          isCasper ? "pl-[14%] pr-2 pt-2 pb-2" : isBalthasar ? "pr-[14%] pl-2 pt-2 pb-2" : "p-2"
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

      {/* 底部: 表态徽章 — 居中显示，根据切角位置调整 padding */}
      <div className={`flex items-center justify-center gap-2 px-2 ${bottomPadding} border-t shrink-0 ${colors.borderTop}`}>
        <VerdictBadge verdict={data.verdict} />
      </div>
    </div>
  );
}
