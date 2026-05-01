// ============================================================
// MAGI2.0 — 表态面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 显示三贤人的最终表态结果
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
    <div className="flex flex-col h-full p-2 gap-1.5">
      {/* NERV 红色警告标题 — 斜向切割条纹 */}
      <div className="relative py-1 text-center">
        {/* 上条纹（z-index 高于 CRT 扫描线） */}
        <div
          className="absolute top-0 left-0 right-0 h-[4px]"
          style={{
            zIndex: 20,
            background: `repeating-linear-gradient(-45deg, #b91c1c 0px, #b91c1c 6px, transparent 6px, transparent 11px)`,
          }}
        />
        {/* 下条纹（z-index 高于 CRT 扫描线） */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{
            zIndex: 20,
            background: `repeating-linear-gradient(135deg, #b91c1c 0px, #b91c1c 6px, transparent 6px, transparent 11px)`,
          }}
        />
        <div className="text-[28px] font-bold tracking-[-0.05em] text-magi-nerv-red-bright">
          決議
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {units.map((unit) => (
          <div
            key={unit.role}
            className="flex items-center justify-between px-2 py-1 border border-amber-900/10 bg-black/20"
          >
            <span className="text-[14px] font-bold tracking-[-0.05em] text-amber-400/80">
              {ROLE_LABELS[unit.role]}
            </span>
            <VerdictBadge verdict={unit.verdict} />
          </div>
        ))}
      </div>

      {/* 状态摘要 */}
      <div className="mt-auto text-[14px] text-gray-600 leading-tight">
        {units.every((u) => u.verdict !== null)
          ? "全員表態完畢"
          : "等待表態中..."}
      </div>
    </div>
  );
}
