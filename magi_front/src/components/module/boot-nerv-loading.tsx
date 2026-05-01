// ============================================================
// MAGI2.0 — 启动序列：NERV 加载阶段
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed
//
// 设计说明:
//   - NERV 标志 SVG（圆 + 十字线）
//   - 进度条（5% 增量，75ms 间隔）
//   - 8 个随机数字滚动（200ms 更新）
// ============================================================

"use client";

import { useEffect, useState } from "react";

interface BootNervLoadingProps {
  onComplete: () => void;
}

export function BootNervLoading({ onComplete }: BootNervLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [numberRolls, setNumberRolls] = useState<string[]>([]);

  // 初始化随机数字
  useEffect(() => {
    setNumberRolls(
      Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 100).toString().padStart(2, "0")
      )
    );
  }, []);

  // 进度条递增 + 数字滚动
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(numberInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, 75);

    const numberInterval = setInterval(() => {
      setNumberRolls((prev) =>
        prev.map(() =>
          Math.floor(Math.random() * 100).toString().padStart(2, "0")
        )
      );
    }, 200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(numberInterval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* NERV 标志 */}
      <div className="animate-nerv-appear flex flex-col items-center">
        <svg width="100" height="100" viewBox="0 0 120 120" className="text-red-500">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="60" y1="20" x2="60" y2="100" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="text-red-500 text-3xl font-black text-center mt-3 tracking-[0.15em]">
          NERV
        </div>
      </div>

      {/* 加载条 */}
      <div className="w-[360px]">
        <div className="relative h-[3px] bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-red-500 text-sm text-right mt-2 font-mono tracking-wider">
          {progress}%
        </div>
      </div>

      {/* NERV 红色数字滚动 */}
      <div className="flex gap-3 text-red-500 font-mono text-xs opacity-70">
        {numberRolls.map((num, i) => (
          <div
            key={i}
            className="animate-number-roll"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
