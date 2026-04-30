// ============================================================
// MAGI2.0 — 辩论控制器 (Module 组件)
// 规则 R8: 全局状态通过 Store 管理
// 规则 R11: API 层为纯函数，不直接操作 UI 状态
// 规则 R14: useCallback 包裹回调函数
// 规则 R5: 每个文件 ≤ 200 行
// ============================================================

"use client";

import { useCallback, useRef } from "react";
import { useDebateStore } from "@/store/debate-store";
import { streamDebate, fetchSummary } from "@/lib/api";
import type { MagiRole, StreamChunk } from "@/types";

/**
 * 辩论控制器 Hook
 * 封装所有辩论相关的业务逻辑
 */
export function useDebateController() {
  const {
    topic,
    units,
    isDebating,
    isSummarized,
    modelChoice,
    setTopic,
    setDebating,
    setSummarized,
    setModelChoice,
    appendUnitContent,
    setUnitStatus,
    setUnitVerdict,
    resetUnits,
    addLog,
    clearLogs,
    resetAll,
  } = useDebateStore();

  const abortRef = useRef<AbortController | null>(null);

  // ── 处理 SSE 数据块 ──────────────────────────────────────
  const handleChunk = useCallback(
    (data: StreamChunk) => {
      if (data.token) {
        appendUnitContent(data.role, data.token);
      }
      if (data.finished) {
        setUnitStatus(data.role, "done");
        addLog(data.role, `${data.role} 发言完毕`);
      }
    },
    [appendUnitContent, setUnitStatus, addLog]
  );

  // ── 处理辩论结束 ─────────────────────────────────────────
  const handleEnd = useCallback(() => {
    setDebating(false);
    addLog("sys", "辩论结束");
  }, [setDebating, addLog]);

  // ── 处理错误 ─────────────────────────────────────────────
  const handleError = useCallback(
    (err: Error) => {
      setDebating(false);
      addLog("sys", `错误: ${err.message}`);
      console.error("Debate error:", err);
    },
    [setDebating, addLog]
  );

  // ── 开始辩论 ─────────────────────────────────────────────
  const startDebate = useCallback(() => {
    if (!topic.trim()) return;

    resetAll();
    setDebating(true);
    setSummarized(false);
    addLog("sys", `辩论开始: "${topic}"`);

    // 设置初始状态
    (["melchior", "balthasar", "casper"] as MagiRole[]).forEach((role) => {
      setUnitStatus(role, "thinking");
    });

    // 发起 SSE 请求
    abortRef.current = streamDebate(
      {
        topic: topic.trim(),
        model_choice: modelChoice,
      },
      (chunk) => {
        // 首次收到 token 时切换为 speaking
        if (chunk.token) {
          setUnitStatus(chunk.role, "speaking");
        }
        handleChunk(chunk);
      },
      handleEnd,
      handleError
    );
  }, [topic, modelChoice, resetAll, setDebating, setSummarized, addLog, setUnitStatus, handleChunk, handleEnd, handleError]);

  // ── 继续辩论（修订） ─────────────────────────────────────
  const continueDebate = useCallback(() => {
    if (!topic.trim()) return;

    setDebating(true);
    addLog("sys", "继续辩论...");

    (["melchior", "balthasar", "casper"] as MagiRole[]).forEach((role) => {
      setUnitStatus(role, "thinking");
    });

    abortRef.current = streamDebate(
      {
        topic: topic.trim(),
        model_choice: modelChoice,
        directive: "请从不同角度继续深入讨论",
      },
      (chunk) => {
        if (chunk.token) {
          setUnitStatus(chunk.role, "speaking");
        }
        handleChunk(chunk);
      },
      handleEnd,
      handleError
    );
  }, [topic, modelChoice, setDebating, addLog, setUnitStatus, handleChunk, handleEnd, handleError]);

  // ── 总结 ─────────────────────────────────────────────────
  const handleSummarize = useCallback(async () => {
    setDebating(true);
    addLog("sys", "正在生成总结...");

    try {
      const debateContent = units
        .map((u) => `${u.role.toUpperCase()}:\n${u.content}`)
        .join("\n\n");

      const result = await fetchSummary(debateContent);
      addLog("sys", `总结: ${result.summary}`);
      setSummarized(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "未知错误";
      addLog("sys", `总结失败: ${msg}`);
    } finally {
      setDebating(false);
    }
  }, [units, setDebating, addLog, setSummarized]);

  // ── 话题输入处理 ─────────────────────────────────────────
  const handleTopicKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isDebating && topic.trim()) {
        startDebate();
      }
    },
    [isDebating, topic, startDebate]
  );

  // ── 模型选择处理 ─────────────────────────────────────────
  const handleModelChange = useCallback(
    (role: MagiRole, value: string) => {
      const next = { ...modelChoice, [role]: value };
      setModelChoice(next);
      localStorage.setItem("magi_model_choice", JSON.stringify(next));
    },
    [modelChoice, setModelChoice]
  );

  return {
    // 状态
    topic,
    units,
    isDebating,
    isSummarized,
    modelChoice,
    // Actions
    setTopic,
    startDebate,
    continueDebate,
    handleSummarize,
    handleTopicKeyDown,
    handleModelChange,
  };
}
