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
    className: "text-green-400",
  },
  否認: {
    label: "否認",
    className: "text-red-500",
  },
  疑慮: {
    label: "疑慮",
    className: "text-yellow-400",
  },
};

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  if (!verdict) return null;

  const config = VERDICT_CONFIG[verdict];

  // 防御：如果 verdict 不在配置中（如后端返回了简体或异常值），直接显示原文
  if (!config) {
    return (
      <span
        className="inline-block text-[26px] font-bold text-gray-300"
        style={{ zIndex: 20, position: "relative" }}
      >
        {verdict}
      </span>
    );
  }

  return (
    <span
      className={`inline-block text-[26px] font-bold ${config.className}`}
      style={{ zIndex: 20, position: "relative" }}
    >
      {config.label}
    </span>
  );
}
