// ============================================================
// MAGI2.0 — 辩论状态 Store (Zustand)
// 规则 R8: 全局状态统一由 Zustand 管理
// 规则 R9: Store Action 是唯一修改状态的途径
// 规则 R10: 禁止在组件内直接修改全局状态
// ============================================================

import { create } from "zustand";
import type {
  MagiRole,
  UnitData,
  UnitStatus,
  Verdict,
  LogEntry,
  LogRole,
  AppStage,
} from "@/types";

// ─── 默认单元数据 ───────────────────────────────────────────
const DEFAULT_UNITS: UnitData[] = [
  { role: "melchior", content: "", status: "idle", verdict: null },
  { role: "balthasar", content: "", status: "idle", verdict: null },
  { role: "casper", content: "", status: "idle", verdict: null },
];

let logIdCounter = 0;

// ─── Store 类型 ─────────────────────────────────────────────
export interface DebateState {
  /** 应用阶段 */
  appStage: AppStage;
  /** 三贤人单元数据 */
  units: UnitData[];
  /** 日志行 */
  logLines: LogEntry[];
  /** 是否正在辩论中 */
  isDebating: boolean;
  /** 当前辩论话题 */
  topic: string;
  /** 模型选择映射 */
  modelChoice: Record<string, string>;
  /** 是否已总结 */
  isSummarized: boolean;
  /** 是否正在生成总结（控制呼吸动画） */
  isSummarizing: boolean;
  /** 当前发言角色 */
  currentSpeaker: MagiRole | null;
  /** 简明总结文本（点击总结后生成） */
  summaryText: string;

  // ─── Actions ────────────────────────────────────────────
  setAppStage: (stage: AppStage) => void;
  setTopic: (topic: string) => void;
  setDebating: (debating: boolean) => void;
  setSummarized: (summarized: boolean) => void;
  setSummarizing: (summarizing: boolean) => void;
  setModelChoice: (choice: Record<string, string>) => void;
  setCurrentSpeaker: (role: MagiRole | null) => void;

  /** 追加贤人发言内容 */
  appendUnitContent: (role: MagiRole, content: string) => void;
  /** 设置贤人状态 */
  setUnitStatus: (role: MagiRole, status: UnitStatus) => void;
  /** 设置贤人表态 */
  setUnitVerdict: (role: MagiRole, verdict: Verdict) => void;
  /** 设置贤人总结 */
  setUnitSummary: (role: MagiRole, summary: string) => void;
  /** 重置所有贤人 */
  resetUnits: () => void;

  /** 添加日志条目 */
  addLog: (role: LogRole, content: string) => void;
  /** 更新最后一条日志的内容（用于 SSE chunk 追加） */
  updateLastLog: (content: string) => void;
  /** 清空日志 */
  clearLogs: () => void;
  /** 设置简明总结文本 */
  setSummaryText: (text: string) => void;

  /** 重置整个辩论状态 */
  resetAll: () => void;
}

// ─── Store 实现 ─────────────────────────────────────────────
export const useDebateStore = create<DebateState>((set) => ({
  // ── 初始状态 ──
  appStage: "boot",
  units: DEFAULT_UNITS.map((u) => ({ ...u })),
  logLines: [],
  isDebating: false,
  topic: "",
  modelChoice: {},
  isSummarized: false,
  isSummarizing: false,
  currentSpeaker: null,
  summaryText: "",

  // ── Actions ──
  setAppStage: (stage) => set({ appStage: stage }),

  setTopic: (topic) => set({ topic }),

  setDebating: (debating) => set({ isDebating: debating }),

  setSummarized: (summarized) => set({ isSummarized: summarized }),
  setSummarizing: (summarizing) => set({ isSummarizing: summarizing }),

  setModelChoice: (choice) => set({ modelChoice: choice }),

  setCurrentSpeaker: (role) => set({ currentSpeaker: role }),

  appendUnitContent: (role, content) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.role === role ? { ...u, content: u.content + content } : u
      ),
    })),

  setUnitStatus: (role, status) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.role === role ? { ...u, status } : u
      ),
    })),

  setUnitVerdict: (role, verdict) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.role === role ? { ...u, verdict } : u
      ),
    })),

  setUnitSummary: (role, summary) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.role === role ? { ...u, summary } : u
      ),
    })),

  resetUnits: () =>
    set({
      units: DEFAULT_UNITS.map((u) => ({ ...u })),
    }),

  addLog: (role, content) =>
    set((state) => ({
      logLines: [
        ...state.logLines,
        { id: ++logIdCounter, role, content },
      ],
    })),

  updateLastLog: (content) =>
    set((state) => {
      const lines = [...state.logLines];
      const last = lines[lines.length - 1];
      if (last) {
        lines[lines.length - 1] = { ...last, content };
      }
      return { logLines: lines };
    }),

  clearLogs: () => set({ logLines: [] }),

  setSummaryText: (text) => set({ summaryText: text }),

  resetAll: () =>
    set({
      units: DEFAULT_UNITS.map((u) => ({ ...u })),
      logLines: [],
      isDebating: false,
      isSummarized: false,
      isSummarizing: false,
      topic: "",
      currentSpeaker: null,
      summaryText: "",
    }),
}));
