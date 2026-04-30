// ============================================================
// MAGI2.0 — API 通信层
// 规则 R11: API 层为纯函数，返回 Promise 数据
// 规则 R12: API 层不直接操作 UI 状态
// 规则 R13: SSE 流式数据通过回调函数传递给 Store Action
//
// 后端 SSE 格式（backend/main.py）:
//   data: {"type": "sys",     "content": "..."}
//   data: {"type": "start",   "role": "melchior"}
//   data: {"type": "chunk",   "content": "..."}
//   data: {"type": "verdict", "role": "melchior", "verdict": "承認"}
//   event: end
//   data: {}
// ============================================================

import type {
  SseData,
  DebateParams,
  SummaryResult,
  UnitSummaryRequest,
  UnitSummaryResult,
} from "@/types";

// ─── 配置 ───────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// ─── SSE 流式辩论 ──────────────────────────────────────────
/**
 * 发起 SSE 流式辩论请求
 * @param params 辩论参数
 * @param onData 每收到一个 data: {...} 的回调（包含 type/content/role/verdict）
 * @param onEnd 流结束回调（收到 event: end 时触发）
 * @param onError 错误回调
 * @returns AbortController 用于取消请求
 */
export function streamDebate(
  params: DebateParams,
  onData: (data: SseData) => void,
  onEnd: () => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stream_debate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 协议：用 \n\n 分割事件
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const lines = block.split("\n");

          for (const line of lines) {
            // 检测 event: end — 辩论结束
            if (line.startsWith("event: end")) {
              onEnd();
              return;
            }

            // 解析 data: {...}
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (!dataStr || dataStr === "{}" || dataStr === "[DONE]") continue;

              try {
                const parsed: SseData = JSON.parse(dataStr);
                onData(parsed);
              } catch {
                console.warn("[api] 无法解析 SSE 行:", dataStr);
              }
            }
          }
        }
      }

      // 流自然结束（无 event: end）
      onEnd();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        onError(err);
      }
    }
  })();

  return controller;
}

// ─── 总结 API ──────────────────────────────────────────────
/**
 * 请求 AI 生成辩论总结
 * @param history 辩论历史文本
 * @param topic 原议题
 * @returns 结构化总结（summary + verdicts）
 */
export async function fetchSummary(
  history: string,
  topic: string
): Promise<SummaryResult> {
  const response = await fetch(`${API_BASE}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, topic }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ─── 单贤人总结 API ────────────────────────────────────────
/**
 * 请求 AI 生成单个角色的观点总结
 */
export async function fetchUnitSummary(
  params: UnitSummaryRequest
): Promise<UnitSummaryResult> {
  const response = await fetch(`${API_BASE}/api/summarize_unit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
