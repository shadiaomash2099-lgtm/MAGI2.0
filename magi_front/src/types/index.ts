// ============================================================
// MAGI2.0 — 核心类型定义
// 规则 R6: 所有类型集中在 types/，禁止在组件内定义复杂类型
// ============================================================

/** 三贤人角色标识 */
export type MagiRole = "melchior" | "balthasar" | "casper";

/** 贤人单元状态 */
export type UnitStatus = "idle" | "thinking" | "speaking" | "done";

/** 表态类型 */
export type Verdict = "agree" | "disagree" | "neutral";

/** 日志条目角色 */
export type LogRole = "sys" | "user" | "melchior" | "balthasar" | "casper";

/** 单个贤人单元数据 */
export interface UnitData {
  role: MagiRole;
  content: string;
  status: UnitStatus;
  verdict: Verdict | null;
  badgeColor: string;
}

/** 日志条目 */
export interface LogEntry {
  role: LogRole;
  text: string;
  timestamp: number;
}

/** SSE 流式数据块 */
export interface StreamChunk {
  role: MagiRole;
  token: string;
  finished?: boolean;
}

/** 辩论请求参数 */
export interface DebateParams {
  topic: string;
  model_choice: Record<string, string>;
  directive?: string;
}

/** 总结结果 */
export interface SummaryResult {
  summary: string;
}

/** 单贤人总结请求 */
export interface UnitSummaryRequest {
  role: MagiRole;
  content: string;
}

/** 单贤人总结结果 */
export interface UnitSummaryResult {
  summary: string;
}

/** 应用阶段 */
export type AppStage = "boot" | "debate";
