// ============================================================
// MAGI2.0 — 表态面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import type { UnitData } from "@/types";
import { VerdictBadge } from "@/components/ui/verdict-badge";

interface VerdictPanelProps {
  units: UnitData[];
}

const ROLE_LABELS: Record<string, string> = {
  melchior: "MELCHIOR",
  balthasar: "BALTHASAR",
  casper: "CASPER",
};

export function VerdictPanel({ units }: VerdictPanelProps) {
  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="text-[10px] font-bold tracking-widest text-red-400/80">
        ▸ 表態
      </div>

      <div className="flex flex-col gap-2">
        {units.map((unit) => (
          <div
            key={unit.role}
            className="flex items-center justify-between px-2 py-1.5 border border-red-900/10 bg-black/20"
          >
            <span
              className="text-[8px] font-bold tracking-wider"
              style={{ color: unit.badgeColor }}
            >
              {ROLE_LABELS[unit.role]}
            </span>
            <VerdictBadge verdict={unit.verdict} />
          </div>
        ))}
      </div>

      {/* 状态摘要 */}
      <div className="mt-auto text-[7px] text-gray-600">
        {units.every((u) => u.verdict !== null)
          ? "全員表態完畢"
          : "等待表態中..."}
      </div>
    </div>
  );
}
