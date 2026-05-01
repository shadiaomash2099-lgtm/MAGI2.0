// ============================================================
// MAGI2.0 — 启动序列：SCP 标志阶段
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed
//
// 设计说明:
//   - SVG SCP 收容标志，4 段弧线依次绘制
//   - 4 个缺口装饰 + 内圈 + 3 个箭头从中心伸出
//   - SCP 字母逐个出现（200ms 间隔）
//   - "权限确认"按钮进入下一阶段
// ============================================================

"use client";

import { useEffect, useState } from "react";

interface BootScpLogoProps {
  onProceed: () => void;
}

export function BootScpLogo({ onProceed }: BootScpLogoProps) {
  const [lettersVisible, setLettersVisible] = useState(0);

  // SCP 字母逐个出现
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= 3; i++) {
      timers.push(setTimeout(() => setLettersVisible(i), i * 200));
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* SCP 收容标志 SVG */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="text-white"
      >
        {/* 外圈：4 段弧线 + 4 个缺口 */}
        <g className={`transition-all duration-700 ${lettersVisible >= 1 ? "opacity-100" : "opacity-0"}`}>
          {/* 顶部弧线 */}
          <path
            d="M 100 20 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
            strokeDasharray="200"
            className="animate-scp-draw-1"
          />
          {/* 右侧弧线 */}
          <path
            d="M 180 100 A 80 80 0 0 1 100 180"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
            strokeDasharray="200"
            className="animate-scp-draw-2"
          />
          {/* 底部弧线 */}
          <path
            d="M 100 180 A 80 80 0 0 1 20 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
            strokeDasharray="200"
            className="animate-scp-draw-3"
          />
          {/* 左侧弧线 */}
          <path
            d="M 20 100 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
            strokeDasharray="200"
            className="animate-scp-draw-4"
          />

          {/* 四个缺口装饰 */}
          <rect x="95" y="10" width="10" height="15" fill="currentColor" className="animate-scp-notch" style={{ animationDelay: "0.4s" }} />
          <rect x="175" y="95" width="15" height="10" fill="currentColor" className="animate-scp-notch" style={{ animationDelay: "0.8s" }} />
          <rect x="95" y="175" width="10" height="15" fill="currentColor" className="animate-scp-notch" style={{ animationDelay: "1.2s" }} />
          <rect x="10" y="95" width="15" height="10" fill="currentColor" className="animate-scp-notch" style={{ animationDelay: "1.6s" }} />
        </g>

        {/* 内圈 */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`transition-all duration-500 ${lettersVisible >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          style={{ transformOrigin: "center" }}
        />

        {/* 中心三个箭头 */}
        <g
          className={`transition-all duration-500 ${lettersVisible >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
          style={{ transformOrigin: "center" }}
        >
          {/* 上箭头 */}
          <path
            d="M 100 100 L 100 50 M 100 50 L 95 60 M 100 50 L 105 60"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* 左下箭头 */}
          <path
            d="M 100 100 L 65 135 M 65 135 L 72 128 M 65 135 L 72 142"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* 右下箭头 */}
          <path
            d="M 100 100 L 135 135 M 135 135 L 128 128 M 135 135 L 128 142"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* 中心点 */}
          <circle cx="100" cy="100" r="5" fill="currentColor" />
        </g>
      </svg>

      {/* SCP 文字 */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white text-5xl font-black tracking-[0.3em] font-mono">
          {["S", "C", "P"].map((letter, i) => (
            <span
              key={letter}
              className={`inline-block transition-all duration-300 ${
                lettersVisible >= i + 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div
          className={`text-white/70 text-base tracking-[0.5em] transition-all duration-500 ${
            lettersVisible >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          FOUNDATION
        </div>
        <div
          className={`text-white/40 text-xs tracking-[0.3em] transition-all duration-500 ${
            lettersVisible >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          SECURE. CONTAIN. PROTECT.
        </div>

        {/* 权限确认按钮 */}
        <button
          onClick={onProceed}
          disabled={lettersVisible < 3}
          className={`mt-8 px-8 py-3 border-2 border-white/50 text-white text-sm tracking-[0.3em] font-bold
            hover:bg-white/10 hover:border-white transition-all duration-300
            ${lettersVisible >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "1.2s" }}
        >
          权限确认
        </button>
      </div>
    </div>
  );
}
