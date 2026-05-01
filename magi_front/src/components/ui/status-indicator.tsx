// ============================================================
// MAGI2.0 — 发言状态指示器 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import type { UnitStatus } from "@/types";

interface StatusIndicatorProps {
  status: UnitStatus;
}

const STATUS_CONFIG: Record<
  UnitStatus,
  { label: string; className: string }
> = {
  idle: {
    label: "STANDBY",
    className: "text-gray-500",
  },
  thinking: {
    label: "ANALYZING",
    className: "text-amber-400 animate-pulse",
  },
  speaking: {
    label: "SPEAKING",
    className: "text-amber-300 animate-pulse animate-text-glow",
  },
  done: {
    label: "COMPLETE",
    className: "text-amber-400",
  },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`text-[8px] font-bold tracking-wider ${config.className}`}>
      ▸ {config.label}
    </span>
  );
}
