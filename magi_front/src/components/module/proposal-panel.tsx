// ============================================================
// MAGI2.0 — 提案面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 功能:
//   - 话题输入框
//   - 三贤人模型选择器
//   - 开始/修订/总结 控制按钮
// ============================================================

"use client";

import { TopicInput } from "@/components/ui/topic-input";
import { ControlButtons } from "@/components/ui/control-buttons";
import { ModelSelector } from "@/components/ui/model-selector";
import type { MagiRole } from "@/types";

interface ProposalPanelProps {
  topic: string;
  isDebating: boolean;
  isSummarized: boolean;
  modelChoice: Record<string, string>;
  onTopicChange: (value: string) => void;
  onTopicKeyDown: (e: React.KeyboardEvent) => void;
  onModelChange: (role: MagiRole, value: string) => void;
  onStart: () => void;
  onContinue: () => void;
  onSummarize: () => void;
}

const ROLES: MagiRole[] = ["melchior", "balthasar", "casper"];

export function ProposalPanel({
  topic,
  isDebating,
  isSummarized,
  modelChoice,
  onTopicChange,
  onTopicKeyDown,
  onModelChange,
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

      {/* 模型选择 */}
      <div className="flex flex-col gap-1">
        <span className="text-[16px] text-gray-500 tracking-wider">模型分配</span>
        {ROLES.map((role) => (
          <ModelSelector
            key={role}
            role={role}
            value={modelChoice[role] || ""}
            disabled={isDebating}
            onChange={onModelChange}
          />
        ))}
      </div>

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
