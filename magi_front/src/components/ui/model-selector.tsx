// ============================================================
// MAGI2.0 — 模型选择器 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import type { MagiRole } from "@/types";

interface ModelSelectorProps {
  role: MagiRole;
  value: string;
  disabled: boolean;
  onChange: (role: MagiRole, value: string) => void;
}

const ROLE_LABELS: Record<MagiRole, string> = {
  melchior: "MELCHIOR",
  balthasar: "BALTHASAR",
  casper: "CASPER",
};

const MODEL_OPTIONS = [
  { value: "", label: "Default" },
  { value: "deepseek-chat", label: "DeepSeek" },
  { value: "kimi", label: "Kimi" },
];

export function ModelSelector({
  role,
  value,
  disabled,
  onChange,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-1 text-[7px]">
      <span className="text-gray-500 shrink-0">{ROLE_LABELS[role]}:</span>
      <select
        value={value}
        onChange={(e) => onChange(role, e.target.value)}
        disabled={disabled}
        className="flex-1 bg-transparent border border-amber-700/20 px-1 py-0.5 text-amber-400 outline-none focus:border-amber-700/40 transition-colors text-[7px]"
      >
        {MODEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
