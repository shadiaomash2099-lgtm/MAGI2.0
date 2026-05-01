// ============================================================
// MAGI2.0 — 简略总结面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 显示辩论过程中的所有日志（系统消息 + 各贤人发言）
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
      <div className="text-[16px] font-bold tracking-widest text-amber-400/80">
        ▸ 簡略總結
      </div>

      <div className="flex-1 min-h-0">
        <LogViewer logLines={logLines} />
      </div>
    </div>
  );
}
