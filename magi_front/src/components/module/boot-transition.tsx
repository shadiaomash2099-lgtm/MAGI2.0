// ============================================================
// MAGI2.0 — 启动序列：过渡阶段
// 规则 R5: ≤ 50 行
// 规则 R2: 无 position: absolute/fixed
//
// 设计说明:
//   - NERV 标志放大淡出（zoom-out）
//   - MAGI SYSTEM 文字放大淡入（zoom-in）
//   - 使用 Flexbox 层叠替代 position: absolute
// ============================================================

"use client";

export function BootTransition() {
  return (
    <div className="flex flex-col items-center justify-center gap-0">
      {/* NERV 标志放大淡出 */}
      <div className="animate-zoom-out flex flex-col items-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-amber-500">
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="60" y1="20" x2="60" y2="100" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="text-amber-500 text-4xl font-black text-center mt-3 tracking-[-0.05em]">
          NERV
        </div>
      </div>

      {/* MAGI SYSTEM 放大淡入 */}
      <div className="animate-zoom-in text-center -mt-20">
        <div className="text-amber-400 text-4xl md:text-5xl font-black tracking-[-0.05em] animate-text-glow">
          MAGI SYSTEM
        </div>
        <div className="text-amber-400/40 text-[16px] mt-4 tracking-[-0.05em]">
          SYSTEM READY
        </div>
      </div>
    </div>
  );
}
