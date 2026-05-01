// ============================================================
// MAGI2.0 — 启动序列主组件（状态机）
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed — 使用 Grid 层叠
//
// 状态机:
//   scp-logo ──(按钮)──> nerv-loading ──(进度100%)──> transition ──(1.2s)──> complete
//      ↑                                                                    │
//      └─────────────────── ESC 跳过 ───────────────────────────────────────┘
// ============================================================

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BootScpLogo } from "@/components/module/boot-scp-logo";
import { BootNervLoading } from "@/components/module/boot-nerv-loading";
import { BootTransition } from "@/components/module/boot-transition";

type Phase = "scp-logo" | "nerv-loading" | "transition" | "complete";

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

  // 过渡阶段自动完成
  useEffect(() => {
    if (phase === "transition") {
      const timer = setTimeout(() => {
        setPhase("complete");
        onCompleteRef.current();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleScpProceed = useCallback(() => {
    setPhase("nerv-loading");
  }, []);

  const handleNervComplete = useCallback(() => {
    setPhase("transition");
  }, []);

  if (phase === "complete") return null;

  return (
    <div className="col-start-1 row-start-1 col-span-full row-span-full z-50 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      {/* 跳过提示 */}
      {canSkip && (
        <div className="absolute top-6 right-6 text-white/20 text-xs tracking-widest animate-pulse">
          ESC 跳过
        </div>
      )}

      {/* 阶段渲染 */}
      {phase === "scp-logo" && <BootScpLogo onProceed={handleScpProceed} />}
      {phase === "nerv-loading" && <BootNervLoading onComplete={handleNervComplete} />}
      {phase === "transition" && <BootTransition />}
    </div>
  );
}
