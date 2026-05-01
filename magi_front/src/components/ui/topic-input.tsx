// ============================================================
// MAGI2.0 — 话题输入框 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

interface TopicInputProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function TopicInput({
  value,
  disabled,
  onChange,
  onKeyDown,
}: TopicInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder="輸入辯論主題..."
      className="w-full bg-transparent border border-amber-700/20 px-2 py-1 text-[10px] text-amber-400 placeholder-gray-600 outline-none focus:border-amber-700/40 transition-colors"
    />
  );
}
