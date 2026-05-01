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
    label: "",
    className: "text-cyan-400/70",
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
    className: "text-cyan-400",
  },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  // idle 状态不显示任何内容（去掉 STANDBY 和小箭头）
  if (status === "idle") return null;

  return (
    <span className={`text-[16px] font-bold tracking-wider ${config.className}`}>
      ▸ {config.label}
    </span>
  );
}
