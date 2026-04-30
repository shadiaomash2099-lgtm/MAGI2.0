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
  {
    role: "melchior",
    content: "",
    status: "idle",
    verdict: null,
    badgeColor: "#00BFFF",
  },
  {
    role: "balthasar",
    content: "",
    status: "idle",
    verdict: null,
    badgeColor: "#FFD700",
  },
  {
    role: "casper",
    content: "",
    status: "idle",
    verdict: null,
    badgeColor: "#32CD32",
  },
];

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

  // ─── Actions ────────────────────────────────────────────
  setAppStage: (stage: AppStage) => void;
  setTopic: (topic: string) => void;
  setDebating: (debating: boolean) => void;
  setSummarized: (summarized: boolean) => void;
  setModelChoice: (choice: Record<string, string>) => void;

  /** 更新指定贤人的内容（追加 token） */
  appendUnitContent: (role: MagiRole, token: string) => void;
  /** 更新指定贤人的状态 */
  setUnitStatus: (role: MagiRole, status: UnitStatus) => void;
  /** 更新指定贤人的表态 */
  setUnitVerdict: (role: MagiRole, verdict: Verdict) => void;
  /** 重置所有贤人数据 */
  resetUnits: () => void;

  /** 添加日志条目 */
  addLog: (role: LogRole, text: string) => void;
  /** 清空日志 */
  clearLogs: () => void;

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

  // ── Actions ──
  setAppStage: (stage) => set({ appStage: stage }),

  setTopic: (topic) => set({ topic }),

  setDebating: (debating) => set({ isDebating: debating }),

  setSummarized: (summarized) => set({ isSummarized: summarized }),

  setModelChoice: (choice) => set({ modelChoice: choice }),

  appendUnitContent: (role, token) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.role === role ? { ...u, content: u.content + token } : u
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

  resetUnits: () =>
    set({
      units: DEFAULT_UNITS.map((u) => ({ ...u })),
    }),

  addLog: (role, text) =>
    set((state) => ({
      logLines: [
        ...state.logLines,
        { role, text, timestamp: Date.now() },
      ],
    })),

  clearLogs: () => set({ logLines: [] }),

  resetAll: () =>
    set({
      units: DEFAULT_UNITS.map((u) => ({ ...u })),
      logLines: [],
      isDebating: false,
      isSummarized: false,
      topic: "",
    }),
}));
