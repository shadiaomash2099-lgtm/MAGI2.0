// ============================================================
// MAGI2.0 — 表态徽章 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import type { Verdict } from "@/types";

interface VerdictBadgeProps {
  verdict: Verdict | null;
}

const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; className: string }
> = {
  agree: {
    label: "賛成",
    className: "bg-green-900/40 text-green-400 border-green-500/30",
  },
  disagree: {
    label: "反対",
    className: "bg-red-900/40 text-red-400 border-red-500/30",
  },
  neutral: {
    label: "保留",
    className: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
  },
};

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  if (!verdict) return null;

  const config = VERDICT_CONFIG[verdict];

  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[7px] font-bold border rounded-sm ${config.className}`}
    >
      {config.label}
    </span>
  );
}
