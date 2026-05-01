// ============================================================
// MAGI2.0 — 提诉面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 功能:
//   - 话题输入框
//   - 开始/修订/总结 控制按钮
// ============================================================

"use client";

import { TopicInput } from "@/components/ui/topic-input";
import { ControlButtons } from "@/components/ui/control-buttons";

interface ProposalPanelProps {
  topic: string;
  isDebating: boolean;
  isSummarized: boolean;
  onTopicChange: (value: string) => void;
  onTopicKeyDown: (e: React.KeyboardEvent) => void;
  onStart: () => void;
  onContinue: () => void;
  onSummarize: () => void;
}

export function ProposalPanel({
  topic,
  isDebating,
  isSummarized,
  onTopicChange,
  onTopicKeyDown,
  onStart,
  onContinue,
  onSummarize,
}: ProposalPanelProps) {
  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* 标题 */}
      <div className="text-[16px] font-bold tracking-widest text-amber-400/80">
        ▸ 提訴
      </div>

      {/* 话题输入 */}
      <TopicInput
        value={topic}
        disabled={isDebating}
        onChange={onTopicChange}
        onKeyDown={onTopicKeyDown}
      />

      {/* 控制按钮 */}
      <ControlButtons
        isDebating={isDebating}
        isSummarized={isSummarized}
        topic={topic}
        onStart={onStart}
        onContinue={onContinue}
        onSummarize={onSummarize}
      />
    </div>
  );
}
