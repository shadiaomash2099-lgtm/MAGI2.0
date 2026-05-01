// ============================================================
// MAGI2.0 — 控制按钮组 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import { useEffect, useRef } from "react";
import { useDebateStore } from "@/store/debate-store";

interface ControlButtonsProps {
  isDebating: boolean;
  isSummarized: boolean;
  topic: string;
  onStart: () => void;
  onContinue: () => void;
  onSummarize: () => void;
}

export function ControlButtons({
  isDebating,
  isSummarized,
  topic,
  onStart,
  onContinue,
  onSummarize,
}: ControlButtonsProps) {
  const logLines = useDebateStore((s) => s.logLines);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    const el = logContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logLines.length]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      {/* 按钮行 */}
      <div className="flex gap-2">
        <button
          onClick={onStart}
          disabled={isDebating || !topic.trim()}
          className="flex-1 px-1 py-1 text-[16px] font-bold tracking-[-0.05em] border border-amber-700/30
                     text-amber-400 bg-amber-950/20 hover:bg-amber-950/40
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors text-center"
        >
          ▸ 開始
        </button>

        <button
          onClick={onContinue}
          disabled={isDebating}
          className="flex-1 px-1 py-1 text-[16px] font-bold tracking-[-0.05em] border border-amber-700/30
                     text-amber-400 bg-amber-950/20 hover:bg-amber-950/40
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors text-center"
        >
          ↻ 修訂
        </button>

        <button
          onClick={onSummarize}
          disabled={isDebating || isSummarized}
          className="flex-1 px-1 py-1 text-[16px] font-bold tracking-[-0.05em] border border-amber-700/30
                     text-amber-400 bg-amber-950/20 hover:bg-amber-950/40
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors text-center"
        >
          ■ 總結
        </button>
      </div>

      {/* 日志显示区域 — 填充剩余空间，下沿对齐 casper 顶沿 */}
      <div
        ref={logContainerRef}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin border border-amber-900/15 rounded-sm
                   bg-black/40 p-2 space-y-0.5 text-[18px] leading-relaxed font-mono"
      >
        {logLines.length === 0 ? (
          <span className="text-gray-600 italic">等待系統日誌...</span>
        ) : (
          logLines.map((entry) => (
            <div key={entry.id} className="text-gray-300 break-all">
              {">>>"} {entry.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
