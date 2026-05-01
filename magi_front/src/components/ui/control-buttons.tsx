// ============================================================
// MAGI2.0 — 控制按钮组 (UI 组件)
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

interface ControlButtonsProps {
  isDebating: boolean;
  isSummarized: boolean;
  topic: string;
  onStart: () => void;
  onContinue: () => void;
  onSummarize: () => void;
}

export function ControlButtons({
  isDebating,
  isSummarized,
  topic,
  onStart,
  onContinue,
  onSummarize,
}: ControlButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onStart}
        disabled={isDebating || !topic.trim()}
        className="px-3 py-1 text-[16px] font-bold tracking-wider border border-amber-700/30
                   text-amber-400 bg-amber-950/20 hover:bg-amber-950/40
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors"
      >
        ▸ 開始
      </button>

      <button
        onClick={onContinue}
        disabled={isDebating}
        className="px-3 py-1 text-[16px] font-bold tracking-wider border border-amber-700/30
                   text-amber-400 bg-amber-950/20 hover:bg-amber-950/40
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors"
      >
        ↻ 修訂
      </button>

      <button
        onClick={onSummarize}
        disabled={isDebating || isSummarized}
        className="px-3 py-1 text-[16px] font-bold tracking-wider border border-amber-700/30
                   text-amber-400 bg-amber-950/20 hover:bg-amber-950/40
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-colors"
      >
        ■ 總結
      </button>
    </div>
  );
}
