// ============================================================
// MAGI2.0 — 简略总结面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 辩论过程中不显示任何信息，点击总结后显示 AI 生成的纯文本总结
// ============================================================

"use client";

interface VideoPanelProps {
  summaryText: string;
  isSummarized: boolean;
}

export function VideoPanel({ summaryText, isSummarized }: VideoPanelProps) {
  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="text-[16px] font-bold tracking-[-0.05em] text-amber-400/80">
        ▸ 簡略總結
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin text-[16px] leading-relaxed text-gray-300 whitespace-pre-wrap">
        {!isSummarized ? (
          <span className="text-gray-600 italic">等待總結...</span>
        ) : summaryText ? (
          <span>{summaryText}</span>
        ) : (
          <span className="text-gray-600 italic">暫無總結</span>
        )}
      </div>
    </div>
  );
}
