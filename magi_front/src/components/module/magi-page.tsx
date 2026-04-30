// ============================================================
// MAGI2.0 — MAGI 主页面 (Page 组件)
// 规则 R4: 4 层组件架构: page → layout → module → ui
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import { MagiGrid } from "@/components/layout/magi-grid";
import { ProposalPanel } from "@/components/module/proposal-panel";
import { VerdictPanel } from "@/components/module/verdict-panel";
import { VideoPanel } from "@/components/module/video-panel";
import { MagiUnit } from "@/components/module/magi-unit";
import { useDebateController } from "@/components/module/debate-controller";
import { useDebateStore } from "@/store/debate-store";

export function MagiPage() {
  const controller = useDebateController();
  const logLines = useDebateStore((s) => s.logLines);
  const units = useDebateStore((s) => s.units);

  return (
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
          clipPath="polygon(0% 0%, 100% 0%, 100% 75%, 88% 100%, 12% 100%, 0% 75%)"
          statusPos="top-right"
        />
      }
      verdict={<VerdictPanel units={units} />}
      balthasar={
        <MagiUnit
          data={units[1]}
          clipPath="polygon(0% 0%, 88% 0%, 100% 12%, 100% 100%, 0% 100%)"
          statusPos="top-left"
        />
      }
      video={<VideoPanel logLines={logLines} />}
      casper={
        <MagiUnit
          data={units[2]}
          clipPath="polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12%)"
          statusPos="top-right"
        />
      }
    />
  );
}
