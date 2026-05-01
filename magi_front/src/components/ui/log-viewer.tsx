// ============================================================
// MAGI2.0 — 日志查看器 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/types";

interface LogViewerProps {
  logLines: LogEntry[];
}

const ROLE_COLORS: Record<string, string> = {
  sys: "text-amber-400",
  melchior: "text-cyan-400",
  balthasar: "text-yellow-400",
  casper: "text-green-400",
};

export function LogViewer({ logLines }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logLines.length]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto scrollbar-thin pr-1 space-y-0.5 text-[16px] leading-relaxed"
    >
      {logLines.length === 0 && (
        <span className="text-gray-600 italic">等待系統日誌...</span>
      )}
      {logLines.map((entry) => (
        <div key={entry.id} className="flex gap-1.5">
          {entry.role === "sys" ? (
            <span className="text-gray-300 break-all">{entry.content}</span>
          ) : (
            <>
              <span className={`${ROLE_COLORS[entry.role] || "text-gray-300"} shrink-0`}>
                {'<'}{entry.role}{'>'}
              </span>
              <span className="text-gray-300 break-all">{entry.content}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
