// ============================================================
// MAGI2.0 — 日志/视频面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import { LogViewer } from "@/components/ui/log-viewer";
import type { LogEntry } from "@/types";

interface VideoPanelProps {
  logLines: LogEntry[];
}

export function VideoPanel({ logLines }: VideoPanelProps) {
  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="text-[10px] font-bold tracking-widest text-red-400/80">
        ▸ 系統日誌
      </div>

      <div className="flex-1 border border-red-900/10 bg-black/30 p-2 min-h-0">
        <LogViewer logLines={logLines} />
      </div>
    </div>
  );
}
