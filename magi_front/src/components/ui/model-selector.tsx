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
  // Casper 切角在左上角，select 内文字右对齐避免被切
  const isCasper = role === "casper";

  return (
    <div className="flex items-center gap-1 text-[16px]">
      <select
        value={value}
        onChange={(e) => onChange(role, e.target.value)}
        disabled={disabled}
        dir={isCasper ? "rtl" : undefined}
        className="w-full bg-transparent border border-cyan-700/30 px-1 py-0.5 text-cyan-400/80 outline-none focus:border-cyan-500/50 transition-colors text-[16px] cursor-pointer"
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
