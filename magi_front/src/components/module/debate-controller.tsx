// ============================================================
// MAGI2.0 — 辩论控制器 (Module 组件)
// 规则 R8: 全局状态通过 Store 管理
// 规则 R11: API 层为纯函数，不直接操作 UI 状态
// 规则 R14: useCallback 包裹回调函数
// 规则 R5: 每个文件 ≤ 200 行
//
// 处理后端 4 种 SSE 事件类型:
//   sys    → 添加系统日志
//   start  → 切换发言人 + 创建新日志条目
//   chunk  → 追加发言内容 + 更新最后一条日志
//   verdict → 更新贤人表态
// ============================================================

"use client";

import { useCallback, useRef } from "react";
import { useDebateStore } from "@/store/debate-store";
import { streamDebate, fetchSummary } from "@/lib/api";
import type { MagiRole, SseData, Verdict } from "@/types";

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
    setSummarizing,
    setModelChoice,
    appendUnitContent,
    setUnitStatus,
    setUnitVerdict,
    setCurrentSpeaker,
    resetUnits,
    addLog,
    updateLastLog,
    clearLogs,
    resetAll,
    setSummaryText,
  } = useDebateStore();

  const abortRef = useRef<AbortController | null>(null);
  const topicRef = useRef(topic);
  const debateHistoryRef = useRef("");
  // 保持 topicRef 同步
  topicRef.current = topic;

  // ── 处理 SSE 数据块 ──────────────────────────────────────
  const handleSseData = useCallback(
    (data: SseData) => {
      switch (data.type) {
        case "sys":
          // 系统消息 → 添加日志
          addLog("sys", data.content || "");
          break;

        case "start":
          // 开始发言 → 切换发言人 + 日志只显示角色名，不显示逐字内容
          if (data.role) {
            setCurrentSpeaker(data.role);
            setUnitStatus(data.role, "speaking");
            const nameMap: Record<string, string> = {
              melchior: "梅爾基奧",
              balthasar: "巴爾薩澤",
              casper: "卡斯珀",
            };
            addLog("sys", `${nameMap[data.role] || data.role} 發言中...`);
          }
          break;

        case "chunk":
          // 内容块 → 追加到当前发言人（不更新日志，避免逐字输出）
          if (data.content) {
            const currentRole = useDebateStore.getState().currentSpeaker;
            if (currentRole) {
              appendUnitContent(currentRole, data.content);
              // 不调用 updateLastLog，日志只显示角色名
            }
          }
          break;

        case "verdict":
          // 表态 → 更新贤人表态
          if (data.role && data.verdict) {
            setUnitVerdict(data.role, data.verdict as Verdict);
            setUnitStatus(data.role, "done");
            addLog("sys", `${data.role.toUpperCase()} 表态: ${data.verdict}`);
          }
          break;
      }
    },
    [addLog, setCurrentSpeaker, setUnitStatus, appendUnitContent, updateLastLog, setUnitVerdict]
  );

  // ── 处理辩论结束 ─────────────────────────────────────────
  const handleEnd = useCallback(() => {
    setDebating(false);
    setCurrentSpeaker(null);
    // 后端 SSE 会发送 "MAGI结论已完成" 的 sys 消息，前端不再重复添加

    // 构建辩论历史
    const state = useDebateStore.getState();
    const fullLog = state.logLines
      .map((log) => {
        if (log.role === "sys") return `【系統】${log.content}`;
        const nameMap: Record<string, string> = {
          melchior: "梅爾基奧",
          balthasar: "巴爾薩澤",
          casper: "卡斯珀",
        };
        return `【${nameMap[log.role] || log.role}】${log.content}`;
      })
      .join("\n");
    debateHistoryRef.current = `初始議題：${topicRef.current}\n\n${fullLog}`;
  }, [setDebating, setCurrentSpeaker]);

  // ── 处理错误 ─────────────────────────────────────────────
  const handleError = useCallback(
    (err: Error) => {
      setDebating(false);
      setCurrentSpeaker(null);
      addLog("sys", `>>> 【系統故障】${err.message}`);
      console.error("Debate error:", err);
    },
    [setDebating, setCurrentSpeaker, addLog]
  );

  // ── 开始辩论 ─────────────────────────────────────────────
  const startDebate = useCallback(() => {
    if (!topic.trim()) return;

    resetAll();
    debateHistoryRef.current = "";
    setDebating(true);
    setSummarized(false);
    // 后端 SSE 会发送 "新議題已呈上" 的 sys 消息，前端不再重复添加

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
      handleSseData,
      handleEnd,
      handleError
    );
  }, [topic, modelChoice, resetAll, setDebating, setSummarized, addLog, setUnitStatus, handleSseData, handleEnd, handleError]);

  // ── 继续辩论（修订） ─────────────────────────────────────
  const continueDebate = useCallback(() => {
    if (!topic.trim()) return;

    // 清除上一轮的三贤人内容和表态，重新开始
    resetUnits();
    setDebating(true);
    addLog("sys", "收到用户锦囊，基于历史战报开启新一轮推演...");

    (["melchior", "balthasar", "casper"] as MagiRole[]).forEach((role) => {
      setUnitStatus(role, "thinking");
    });

    abortRef.current = streamDebate(
      {
        topic: topic.trim(),
        model_choice: modelChoice,
        history: debateHistoryRef.current,
        directive: "请从不同角度继续深入讨论",
      },
      handleSseData,
      handleEnd,
      handleError
    );
  }, [topic, modelChoice, setDebating, addLog, setUnitStatus, handleSseData, handleEnd, handleError]);

  // ── 总结 ─────────────────────────────────────────────────
  const handleSummarize = useCallback(async () => {
    if (!debateHistoryRef.current) return;

    addLog("sys", "正在生成总结...");
    setSummarizing(true);

    try {
      const result = await fetchSummary(
        debateHistoryRef.current,
        topicRef.current
      );
      // 将 JSON 格式化为显示文本：summary + 各贤人观点（带加粗标记）
      const nameMap: Record<string, string> = {
        melchior: "梅爾基奧",
        balthasar: "巴爾薩澤",
        casper: "卡斯珀",
      };
      const parts: string[] = [result.summary];
      for (const role of ["melchior", "balthasar", "casper"] as const) {
        if (result[role]) {
          parts.push(`\n【${nameMap[role]}】\n${result[role]}`);
        }
      }
      setSummaryText(parts.join("\n"));
      setSummarized(true);
      // 呼吸动画由 VideoPanel 的 onTypingComplete 回调关闭
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "未知错误";
      addLog("sys", `【總結失敗】${msg}`);
      setSummarizing(false);
    }
  }, [addLog, setSummarized, setSummarizing, setSummaryText]);

  // 打字完成后关闭呼吸动画
  const handleTypingComplete = useCallback(() => {
    setSummarizing(false);
  }, [setSummarizing]);

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
    handleTypingComplete,
    handleTopicKeyDown,
    handleModelChange,
  };
}
