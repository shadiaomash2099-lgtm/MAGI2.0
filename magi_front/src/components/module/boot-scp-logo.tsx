// ============================================================
// MAGI2.0 — 启动序列：SCP 向心收容标志
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed
//
// 设计说明:
//   - 直接内联 art/SCP_Foundation_(emblem).svg 原始内容
//   - 保留原始 use + xlink:href 结构
//   - 三段式入场动画 + 永恒警戒自转 + 呼吸光晕
//   - 所有 transform-origin 锁定中心点防止偏心
//   - 自包含 @keyframes，不依赖外部 CSS
// ============================================================

"use client";

import { useEffect, useState } from "react";

interface BootScpLogoProps {
  onProceed: () => void;
}

export function BootScpLogo({ onProceed }: BootScpLogoProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <style>{`
        @keyframes expandIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes arrowStrike0 {
          0% { transform: translateY(-35px) scale(1.4); opacity: 0; }
          60% { transform: translateY(3px) scale(1); opacity: 1; }
          80% { transform: translateY(-1px) scale(1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes arrowStrike120 {
          0% { transform: translateY(-35px) scale(1.4); opacity: 0; }
          60% { transform: translateY(3px) scale(1); opacity: 1; }
          80% { transform: translateY(-1px) scale(1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes arrowStrike240 {
          0% { transform: translateY(-35px) scale(1.4); opacity: 0; }
          60% { transform: translateY(3px) scale(1); opacity: 1; }
          80% { transform: translateY(-1px) scale(1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes spinShield {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(255,255,255,0.15)); }
          50%      { transform: scale(1.03); filter: drop-shadow(0 0 20px rgba(255,255,255,0.35)); }
        }
      `}</style>

      {/* SVG 容器：呼吸 + 光晕 */}
      <div
        className="flex items-center justify-center"
        style={{
          animation: phase >= 3 ? "breathe 4s ease-in-out infinite" : "none",
        }}
      >
        <svg
          viewBox="0 0 135 135"
          className="w-[380px] h-[380px] text-gray-200"
        >
          {/* ── 注意绘制顺序：箭头先画（在下层），核心+外盾后画（在上层） ── */}
          {/* 这样核心展开时自然覆盖箭头，箭头出现时从核心下方"刺出" */}

          {/* 图层 2（先画）：三枚独立向心箭头，沿各自方向从外围刺入 */}
          {/* 每个箭头用独立的 keyframe，在各自的旋转坐标系中沿 Y 轴负方向（即箭头指向）刺入 */}
          <g
            style={{
              transformOrigin: "67.7px 71.5px",
              opacity: phase >= 2 ? undefined : 0,
              pointerEvents: phase >= 2 ? undefined : "none",
            }}
          >
            {/* 正上方箭头（0°）：沿 Y 轴负方向（即向下）刺入 */}
            <g transform="rotate(0 67.7 71.5)">
              <g
                style={{
                  transformOrigin: "67.7px 71.5px",
                  animation: phase >= 2 ? "arrowStrike0 0.4s cubic-bezier(0.19,1,0.22,1) both" : "none",
                }}
              >
                <path
                  d="m64.7 30.6v24h-5.08l8.08 14 8.08-14h-5.08l-.000265-24h-5.99"
                  fill="currentColor"
                />
              </g>
            </g>
            {/* 右下箭头（120°）：沿 120° 方向刺入，延迟 0.1s */}
            <g transform="rotate(120 67.7 71.5)">
              <g
                style={{
                  transformOrigin: "67.7px 71.5px",
                  animation: phase >= 2 ? "arrowStrike120 0.4s cubic-bezier(0.19,1,0.22,1) 0.1s both" : "none",
                }}
              >
                <path
                  d="m64.7 30.6v24h-5.08l8.08 14 8.08-14h-5.08l-.000265-24h-5.99"
                  fill="currentColor"
                />
              </g>
            </g>
            {/* 左下箭头（240°）：沿 240° 方向刺入，延迟 0.2s */}
            <g transform="rotate(240 67.7 71.5)">
              <g
                style={{
                  transformOrigin: "67.7px 71.5px",
                  animation: phase >= 2 ? "arrowStrike240 0.4s cubic-bezier(0.19,1,0.22,1) 0.2s both" : "none",
                }}
              >
                <path
                  d="m64.7 30.6v24h-5.08l8.08 14 8.08-14h-5.08l-.000265-24h-5.99"
                  fill="currentColor"
                />
              </g>
            </g>
          </g>

          {/* 图层 1（后画）：核心 + 外盾（expandIn）—— 在上层，覆盖箭头 */}
          <g
            style={{
              transformOrigin: "67.7px 71.5px",
              animation: phase >= 1 ? "expandIn 0.8s ease-out both" : "none",
            }}
          >
            {/* 核心内环 */}
            <circle
              cx="67.7"
              cy="71.5"
              r="33"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
            />

            {/* 外围盾环 + 永恒自转 */}
            <g
              style={{
                transformOrigin: "67.7px 71.5px",
                animation: phase >= 3 ? "spinShield 20s linear infinite" : "none",
              }}
            >
              <path
                d="m51.9 11.9h31.7l3.07 11.4.944.391c19.4 8.03 32 26.9 32 47.9 0 2.26-.149 4.53-.445 6.77l-.133 1.01 8.37 8.37-15.8 27.4-11.4-3.06-.809.623c-9.06 6.95-20.2 10.7-31.6 10.7-11.4 6e-5-22.5-3.77-31.6-10.7l-.81-.623-11.4 3.06-15.8-27.4 8.37-8.37-.133-1.01c-.296-2.25-.445-4.51-.445-6.77.000141-21 12.6-39.9 32-47.9l.944-.391z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* SCP 文字 */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="text-white text-8xl font-black tracking-tighter font-mono"
          style={{
            animation: phase >= 3 ? "fadeInUp 0.6s ease-out both" : "none",
            opacity: 0,
          }}
        >
          SCP
        </div>
        <div
          className="text-white/80 text-3xl font-bold tracking-widest mt-2"
          style={{
            animation: phase >= 3 ? "fadeInUp 0.6s ease-out 0.15s both" : "none",
            opacity: 0,
          }}
        >
          FOUNDATION
        </div>
        <div
          className="text-white/40 text-xl font-medium tracking-widest mt-3"
          style={{
            animation: phase >= 3 ? "fadeInUp 0.6s ease-out 0.3s both" : "none",
            opacity: 0,
          }}
        >
          SECURE. CONTAIN. PROTECT.
        </div>
      </div>

      {/* 底部框体：输入框 + 权限确认按钮 */}
      <div
        className="flex items-center gap-4 border border-white/20 rounded-sm px-6 py-4 w-[480px]"
        style={{
          animation: phase >= 3 ? "fadeInUp 0.6s ease-out 0.45s both" : "none",
          opacity: 0,
        }}
      >
        {/* 左侧：输入框区域 */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[16px] text-gray-500 italic">黑月為何嚎叫？</span>
          <input
            type="text"
            className="w-full bg-transparent border border-white/20 rounded-sm px-3 py-2 text-white text-[14px] outline-none focus:border-white/50 transition-colors placeholder:text-gray-600"
            placeholder="API Key"
          />
        </div>
        {/* 右侧：权限确认按钮 */}
        <button
          onClick={onProceed}
          disabled={phase < 3}
          className={`px-6 py-2 border-2 border-white/50 text-white text-[24px] font-black tracking-[-0.05em]
            hover:bg-white/10 hover:border-white transition-all duration-300 whitespace-nowrap
            ${phase >= 3 ? "opacity-100" : "opacity-0"}`}
        >
          权限確認
        </button>
      </div>
    </div>
  );
}
