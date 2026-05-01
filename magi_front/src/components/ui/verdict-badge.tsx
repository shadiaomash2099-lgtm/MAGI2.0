// ============================================================
// MAGI2.0 — 表态徽章 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 后端返回繁体中文表态: 承認 / 否認 / 疑慮
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
  承認: {
    label: "承認",
    className: "bg-green-900/40 text-green-400 border-green-500/30",
  },
  否認: {
    label: "否認",
    className: "bg-amber-900/40 text-amber-400 border-amber-500/30",
  },
  疑慮: {
    label: "疑慮",
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
