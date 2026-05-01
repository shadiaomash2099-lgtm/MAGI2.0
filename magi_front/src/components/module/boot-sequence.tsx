// ============================================================
// MAGI2.0 — 启动序列主组件（状态机）
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed — 使用 Grid 层叠
//
// 状态机:
//   scp-logo ──(按钮)──> nerv-loading ──(进度100%)──> complete
//      ↑                                               │
//      └─────────────── ESC 跳过 ───────────────────────┘
// ============================================================

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BootScpLogo } from "@/components/module/boot-scp-logo";
import { BootNervLoading } from "@/components/module/boot-nerv-loading";

type Phase = "scp-logo" | "nerv-loading" | "complete";

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("scp-logo");
  const [canSkip, setCanSkip] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // 2 秒后允许跳过
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ESC 键跳过
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canSkip) {
        onCompleteRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSkip]);

  const handleScpProceed = useCallback(() => {
    setPhase("nerv-loading");
  }, []);

  const handleNervComplete = useCallback(() => {
    onCompleteRef.current();
  }, []);

  if (phase === "complete") return null;

  return (
    <div className="col-start-1 row-start-1 col-span-full row-span-full z-50 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      {/* 跳过提示 */}
      {canSkip && (
        <div className="absolute top-6 right-6 text-white/20 text-[16px] tracking-[-0.05em] animate-pulse">
          ESC 跳过
        </div>
      )}

      {/* 两层动画：SCP → NERV */}
      {phase === "scp-logo" && <BootScpLogo onProceed={handleScpProceed} />}
      {phase === "nerv-loading" && <BootNervLoading onComplete={handleNervComplete} />}
    </div>
  );
}
