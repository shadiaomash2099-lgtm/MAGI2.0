// ============================================================
// MAGI2.0 — MAGI 主页面 (Page 组件)
// 规则 R1: 仅使用 CSS Grid + Flexbox 布局
// 规则 R2: 禁止 position: absolute/fixed
// 规则 R4: 4 层组件架构: page → layout → module → ui
// 规则 R5: 每个文件 ≤ 200 行
//
// 布局结构 (Flexbox 纵向):
//   ┌─ 标题栏 ──────────────────────────────┐  shrink-0
//   ├─ Grid 区域 (背景层 + 主界面 + 扫描线) ─┤  flex-1 min-h-0
//   ├─ 底部状态栏 ──────────────────────────┘  shrink-0
//
// Grid 区域层叠 (3 层):
//   1. NervHexBg (z-index: 0) — 六边形呼吸背景
//   2. MagiGrid (z-index: 1) — 主界面 Grid
//   3. 扫描线覆盖 (z-index: 50) — CRT 扫描线
//
// 启动序列: 在 MagiPage 外层 Grid 覆盖
// ============================================================

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MagiGrid } from "@/components/layout/magi-grid";
import { ProposalPanel } from "@/components/module/proposal-panel";
import { VerdictPanel } from "@/components/module/verdict-panel";
import { VideoPanel } from "@/components/module/video-panel";
import { MagiUnit } from "@/components/module/magi-unit";
import { useDebateController } from "@/components/module/debate-controller";
import { useDebateStore } from "@/store/debate-store";
import { BootSequence } from "@/components/module/boot-sequence";
import { NervHexBg } from "@/components/module/nerv-hex-bg";

// 三贤人 clipPath 切角（NERV 风格）
const CLIP_PATHS = {
  melchior: "polygon(0% 0%, 100% 0%, 100% 75%, 88% 100%, 12% 100%, 0% 75%)",
  balthasar: "polygon(0% 0%, 88% 0%, 100% 12%, 100% 100%, 0% 100%)",
  casper: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12%)",
};

export function MagiPage() {
  const [bootComplete, setBootComplete] = useState(false);
  const [sysStatus, setSysStatus] = useState("INITIALIZING");
  const [blink, setBlink] = useState(true);
  const controller = useDebateController();
  const logLines = useDebateStore((s) => s.logLines);
  const units = useDebateStore((s) => s.units);
  const currentSpeaker = useDebateStore((s) => s.currentSpeaker);

  // 光标闪烁
  useEffect(() => {
    const interval = setInterval(() => setBlink((p) => !p), 500);
    return () => clearInterval(interval);
  }, []);

  // 根据辩论状态更新系统状态
  useEffect(() => {
    if (controller.isDebating) {
      setSysStatus("DEBATE_ACTIVE");
    } else if (controller.isSummarized) {
      setSysStatus("SUMMARY_COMPLETE");
    } else if (bootComplete) {
      setSysStatus("STANDBY");
    }
  }, [controller.isDebating, controller.isSummarized, bootComplete]);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
    setSysStatus("STANDBY");
  }, []);

  return (
    <div className="grid grid-cols-1 grid-rows-1 w-full h-full min-h-screen bg-[#0a0a0a]">
      {/* 启动序列覆盖层 */}
      {!bootComplete && <BootSequence onComplete={handleBootComplete} />}

      {/* 主界面 — 启动完成后显示 */}
      {bootComplete && (
        <div className="col-start-1 row-start-1 col-span-full row-span-full flex flex-col w-full h-full overflow-hidden">
          {/* MAGI SYSTEM 标题 */}
          <div className="flex items-center justify-center py-1.5 shrink-0">
            <h1 className="text-amber-400 text-xl md:text-2xl font-black tracking-[0.15em] leading-none animate-text-glow">
              MAGI SYSTEM
            </h1>
          </div>

          {/* Grid 区域 — 3 层叠 */}
          <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-1">
            {/* 层 1: 六边形呼吸背景 */}
            <NervHexBg />

            {/* 层 2: 主界面 Grid */}
            <div className="col-start-1 row-start-1 col-span-full row-span-full" style={{ zIndex: 1 }}>
              <MagiGrid
                proposal={
                  <ProposalPanel
                    topic={controller.topic}
                    isDebating={controller.isDebating}
                    isSummarized={controller.isSummarized}
                    modelChoice={controller.modelChoice}
                    onTopicChange={controller.setTopic}
                    onTopicKeyDown={controller.handleTopicKeyDown}
                    onModelChange={controller.handleModelChange}
                    onStart={controller.startDebate}
                    onContinue={controller.continueDebate}
                    onSummarize={controller.handleSummarize}
                  />
                }
                melchior={
                  <MagiUnit
                    data={units[0]}
                    clipPath={CLIP_PATHS.melchior}
                    statusPos="top-right"
                  />
                }
                verdict={<VerdictPanel units={units} />}
                balthasar={
                  <MagiUnit
                    data={units[1]}
                    clipPath={CLIP_PATHS.balthasar}
                    statusPos="top-left"
                  />
                }
                video={<VideoPanel logLines={logLines} />}
                casper={
                  <MagiUnit
                    data={units[2]}
                    clipPath={CLIP_PATHS.casper}
                    statusPos="top-right"
                  />
                }
              />
            </div>

            {/* 层 3: 扫描线覆盖 */}
            <div
              className="col-start-1 row-start-1 col-span-full row-span-full pointer-events-none overflow-hidden"
              style={{ zIndex: 50 }}
            >
              <div className="w-full h-[2px] bg-gradient-to-b from-transparent via-amber-500/8 to-transparent animate-scanline" />
            </div>
          </div>

          {/* 底部状态栏 */}
          <div className="flex items-center justify-between px-3 py-1 text-[7px] text-amber-400/30 tracking-widest border-t border-amber-900/15 shrink-0">
            <span suppressHydrationWarning>
              SYS_STATUS: {sysStatus}
            </span>
            <span
              className={blink ? "opacity-60" : "opacity-0"}
              suppressHydrationWarning
            >
              MAGI_LINK: ONLINE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
