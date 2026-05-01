// ============================================================
// MAGI2.0 — 简略总结面板 (Module 组件)
// 规则 R5: 每个文件 ≤ 200 行
//
// 辩论过程中不显示任何信息，点击总结后显示 AI 生成的总结文本
// 支持打字机连续输出效果 + 生成中黄色呼吸闪烁
// ============================================================

"use client";

import { useState, useEffect, useRef } from "react";

interface VideoPanelProps {
  summaryText: string;
  isSummarized: boolean;
  isSummarizing: boolean;
  onTypingComplete?: () => void;
}

export function VideoPanel({ summaryText, isSummarized, isSummarizing, onTypingComplete }: VideoPanelProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // 打字机效果：当 summaryText 变化且 isSummarized 时开始逐字输出
  useEffect(() => {
    if (!isSummarized || !summaryText) {
      setDisplayedText("");
      indexRef.current = 0;
      completedRef.current = false;
      return;
    }

    // 开始打字机效果
    setIsTyping(true);
    indexRef.current = 0;
    setDisplayedText("");
    completedRef.current = false;

    timerRef.current = setInterval(() => {
      if (indexRef.current < summaryText.length) {
        // 每次追加一个字符
        setDisplayedText(summaryText.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        // 输出完毕
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setIsTyping(false);
        // 确保只触发一次完成回调
        if (!completedRef.current) {
          completedRef.current = true;
          onTypingComplete?.();
        }
      }
    }, 20); // 每 20ms 输出一个字符

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [summaryText, isSummarized, onTypingComplete]);

  // 格式化显示：将 【角色名】 标记渲染为加粗
  function renderText(text: string) {
    // 按行分割，处理 【角色名】 标记
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // 匹配 【梅爾基奧】 等角色名行
      const roleMatch = line.match(/^【(梅爾基奧|巴爾薩澤|卡斯珀)】$/);
      if (roleMatch) {
        return (
          <div key={i} className="text-amber-300/90 font-bold text-[15px] mt-2 mb-0.5 tracking-[-0.02em]">
            {roleMatch[1]}
          </div>
        );
      }
      return (
        <div key={i} className="text-gray-300 text-[15px] leading-relaxed">
          {line || "\u00A0"}
        </div>
      );
    });
  }

  return (
    <div
      className={`flex flex-col h-full p-3 gap-2 transition-all duration-500 ${
        isSummarizing ? "animate-lcl-summary" : ""
      }`}
    >
      <div className="text-[16px] font-bold tracking-[-0.05em] text-amber-400/80">
        ▸ 簡略總結
        {isTyping && (
          <span className="inline-block w-[6px] h-[14px] bg-amber-400/70 ml-1 animate-cursor" />
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin whitespace-pre-wrap">
        {!isSummarized ? (
          <span className="text-gray-600 italic">等待總結...</span>
        ) : displayedText ? (
          renderText(displayedText)
        ) : (
          <span className="text-gray-600 italic">暫無總結</span>
        )}
      </div>
    </div>
  );
}
