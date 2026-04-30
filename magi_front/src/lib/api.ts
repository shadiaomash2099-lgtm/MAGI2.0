// ============================================================
// MAGI2.0 — API 通信层
// 规则 R11: API 层为纯函数，返回 Promise 数据
// 规则 R12: API 层不直接操作 UI 状态
// 规则 R13: SSE 流式数据通过回调函数传递给 Store Action
// ============================================================

import type {
  StreamChunk,
  DebateParams,
  SummaryResult,
  UnitSummaryRequest,
  UnitSummaryResult,
  MagiRole,
} from "@/types";

// ─── 配置 ───────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// ─── SSE 流式辩论 ──────────────────────────────────────────
/**
 * 发起 SSE 流式辩论请求
 * @param params 辩论参数
 * @param onChunk 每收到一个 token 的回调
 * @param onEnd 流结束回调
 * @param onError 错误回调
 * @returns AbortController 用于取消请求
 */
export function streamDebate(
  params: DebateParams,
  onChunk: (chunk: StreamChunk) => void,
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
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              onChunk({
                role: parsed.role as MagiRole,
                token: parsed.token || "",
                finished: parsed.finished || false,
              });
            } catch {
              // 跳过无法解析的行
            }
          }
        }
      }

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
/** 获取辩论总结 */
export async function fetchSummary(
  debateContent: string
): Promise<SummaryResult> {
  const response = await fetch(`${API_BASE}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debate_content: debateContent }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ─── 单贤人总结 API ────────────────────────────────────────
/** 获取单个贤人的总结 */
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
