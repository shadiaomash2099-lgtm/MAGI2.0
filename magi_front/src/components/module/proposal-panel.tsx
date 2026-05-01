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
      {/* NERV 红色警告标题 — 斜向切割条纹 */}
      <div className="relative py-1.5 text-center">
        {/* 上条纹（z-index 高于 CRT 扫描线） */}
        <div
          className="absolute top-0 left-0 right-0 h-[6px]"
          style={{
            zIndex: 20,
            background: `repeating-linear-gradient(-45deg, #b91c1c 0px, #b91c1c 8px, transparent 8px, transparent 14px)`,
          }}
        />
        {/* 下条纹（z-index 高于 CRT 扫描线） */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[6px]"
          style={{
            zIndex: 20,
            background: `repeating-linear-gradient(135deg, #b91c1c 0px, #b91c1c 8px, transparent 8px, transparent 14px)`,
          }}
        />
        <div className="text-[32px] font-bold tracking-[-0.05em] text-magi-nerv-red-bright">
          提訴
        </div>
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
