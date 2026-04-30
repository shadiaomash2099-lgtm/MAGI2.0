// ============================================================
// MAGI2.0 — 核心类型定义
// 规则 R6: 所有类型集中在 types/，禁止在组件内定义复杂类型
//
// 后端 SSE 数据格式（backend/main.py）:
//   {"type": "sys",     "content": "..."}
//   {"type": "start",   "role": "melchior"}
//   {"type": "chunk",   "content": "..."}
//   {"type": "verdict", "role": "melchior", "verdict": "承認"}
//   event: end
//   data: {}
// ============================================================

/** 三贤人角色标识 */
export type MagiRole = "melchior" | "balthasar" | "casper";

/** 贤人单元状态 */
export type UnitStatus = "idle" | "thinking" | "speaking" | "done";

/** 表态类型（后端返回繁体中文） */
export type Verdict = "承認" | "否認" | "疑慮";

/** 日志条目角色 */
export type LogRole = "sys" | "melchior" | "balthasar" | "casper";

/** 后端 SSE 数据类型 */
export type SseEventType = "sys" | "start" | "chunk" | "verdict";

// ─── SSE 流式数据 ──────────────────────────────────────────

/** 后端 SSE 单行数据（data: {...} 解析结果） */
export interface SseData {
  type: SseEventType;
  content?: string;
  role?: MagiRole;
  verdict?: Verdict;
}

// ─── 辩论参数 ──────────────────────────────────────────────

/** 辩论请求参数（匹配 backend/main.py DebateRequest） */
export interface DebateParams {
  topic: string;
  tier?: string;
  history?: string;
  directive?: string;
  model_choice?: Record<string, string>;
}

// ─── 总结 API ──────────────────────────────────────────────

/** 总结结果（匹配 backend/main.py summarize 返回） */
export interface SummaryResult {
  summary: string;
  verdicts: Record<string, string>;
}

/** 单贤人总结请求（匹配 backend/main.py UnitSummarizeRequest） */
export interface UnitSummaryRequest {
  role: string;
  content: string;
  topic: string;
}

/** 单贤人总结结果（匹配 backend/main.py summarize_unit 返回） */
export interface UnitSummaryResult {
  summary: string;
  verdict?: string | null;
}

// ─── 贤人单元 ──────────────────────────────────────────────

/** 单个贤人单元数据 */
export interface UnitData {
  role: MagiRole;
  content: string;
  status: UnitStatus;
  verdict: Verdict | null;
  summary?: string;
}

// ─── 日志 ──────────────────────────────────────────────────

/** 日志条目 */
export interface LogEntry {
  id: number;
  role: LogRole;
  content: string;
}

// ─── 应用阶段 ──────────────────────────────────────────────

/** 应用阶段 */
export type AppStage = "boot" | "debate";
