# MAGI2.0 前端代码审查与同步重构计划

> 创建日期：2026-04-30
> 状态：待批准

---

## 一、审查结论

经过对 MAGI2_0 全部 17 个前端文件与 MAGI_System 原始代码的逐行对比，发现 **3 类共 13 个问题**。

### 1.1 致命错误（P0）— 后端 API 数据格式不匹配

| # | 文件 | 问题描述 | 后端实际格式 | 当前错误代码 |
|---|------|---------|-------------|-------------|
| 1 | [`types/index.ts`](../magi_front/src/types/index.ts:35) | `StreamChunk` 类型完全错误 | `{type, content, role?, verdict?}` | `{role, token, finished}` |
| 2 | [`lib/api.ts`](../magi_front/src/lib/api.ts:70) | SSE 解析为 `role/token/finished` | 后端发 `type/content/role/verdict` | 解析结果完全错误 |
| 3 | [`lib/api.ts`](../magi_front/src/lib/api.ts:61) | SSE 行分割用 `\n` 而非 `\n\n` | SSE 标准用双换行 | 单换行导致解析错乱 |
| 4 | [`lib/api.ts`](../magi_front/src/lib/api.ts:77) | 未检测 `event: end` 行 | 后端发 `event: end\ndata: {}\n\n` | 缺少结束事件检测 |
| 5 | [`lib/api.ts`](../magi_front/src/lib/api.ts:102) | `fetchSummary` 参数错误 | `{history, topic}` | `{debate_content}` |

### 1.2 业务逻辑缺失（P1）— Store 与 Controller 不完整

| # | 文件 | 问题描述 |
|---|------|---------|
| 6 | [`store/debate-store.ts`](../magi_front/src/store/debate-store.ts:28) | `LogEntry` 缺少 `id` 字段（React key 用索引代替） |
| 7 | [`store/debate-store.ts`](../magi_front/src/store/debate-store.ts:108) | `appendUnitContent` 只处理 `chunk` 类型，缺少 `sys/start/verdict` 处理 |
| 8 | [`debate-controller.tsx`](../magi_front/src/components/module/debate-controller.tsx:43) | `handleChunk` 只处理 `token/finished`，未处理 `sys/start/verdict` |

### 1.3 直接复制（P2）— 结构和值直接复制自原版

| # | 文件 | 复制内容 |
|---|------|---------|
| 9 | [`magi-grid.tsx`](../magi_front/src/components/layout/magi-grid.tsx:50) | Grid 定义 `22% 1fr 22%` + `grid-template-areas` |
| 10 | [`magi-page.tsx`](../magi_front/src/components/module/magi-page.tsx:41) | 3 个 clipPath 值直接复制 |
| 11 | [`magi-unit.tsx`](../magi_front/src/components/module/magi-unit.tsx:22) | 组件结构（clipPath 容器 + 状态 + 内容 + 徽章） |
| 12 | [`proposal-panel.tsx`](../magi_front/src/components/module/proposal-panel.tsx:40) | 布局结构（标题 + 输入 + 模型选择 + 按钮） |
| 13 | [`verdict-panel.tsx`](../magi_front/src/components/module/verdict-panel.tsx:21) | 布局结构（标题 + 角色列表 + 状态摘要） |
| 14 | [`video-panel.tsx`](../magi_front/src/components/module/video-panel.tsx:15) | 布局结构（标题 + 日志容器） |

---

## 二、同步执行策略（分步回退）

### 核心原则

每一步修改后都 **立即提交 Git**，确保每一步都有明确的回退点。

```
当前 HEAD → Step 1 → Step 2 → Step 3 → ... → Step N
                ↑         ↑         ↑              ↑
            可回退      可回退      可回退         可回退
```

### Step 1：修复类型定义（`types/index.ts`）

**操作：** 重写 `StreamChunk` 类型匹配后端 SSE 格式，添加 `LogEntry.id` 字段

**回退命令：**
```bash
git checkout -- magi_front/src/types/index.ts
```

**验证：** `cd magi_front && npx tsc --noEmit` 无类型错误

---

### Step 2：修复 API 层（`lib/api.ts`）

**操作：** 重写 SSE 解析逻辑：
- 使用 `\n\n` 分割
- 检测 `event: end` 行
- 解析 `data: {...}` 为 `{type, content, role, verdict}`
- 修复 `fetchSummary` 参数为 `{history, topic}`

**回退命令：**
```bash
git checkout -- magi_front/src/lib/api.ts
```

**验证：** `cd magi_front && npx tsc --noEmit`

---

### Step 3：修复 Store（`store/debate-store.ts`）

**操作：**
- `LogEntry` 添加 `id: number` 字段
- 添加 `currentSpeaker: string | null` 状态
- 添加 `setCurrentSpeaker` Action
- 添加 `appendLogContent` Action（更新最后一条日志的内容，用于 SSE chunk 追加）

**回退命令：**
```bash
git checkout -- magi_front/src/store/debate-store.ts
```

**验证：** `cd magi_front && npx tsc --noEmit`

---

### Step 4：修复辩论控制器（`debate-controller.tsx`）

**操作：** 重写 `handleChunk` 处理 4 种 SSE 类型：
- `type: "sys"` → `addLog("sys", content)`
- `type: "start"` → `setCurrentSpeaker(role)` + `setUnitStatus(role, "speaking")` + 创建新日志条目
- `type: "chunk"` → `appendUnitContent(role, content)` + 更新最后一条日志
- `type: "verdict"` → `setUnitVerdict(role, verdict)`

**回退命令：**
```bash
git checkout -- magi_front/src/components/module/debate-controller.tsx
```

**验证：** `cd magi_front && npx tsc --noEmit`

---

### Step 5：重构 UI 组件（6 个文件）

**操作：** 配合新的类型定义微调组件：
- `status-indicator.tsx` — 适配新状态
- `verdict-badge.tsx` — 适配新 Verdict 类型（繁体中文）
- `log-viewer.tsx` — 使用 `entry.id` 作为 key
- `control-buttons.tsx` — 无变化
- `topic-input.tsx` — 无变化
- `model-selector.tsx` — 无变化

**回退命令：**
```bash
git checkout -- magi_front/src/components/ui/
```

**验证：** `cd magi_front && npx tsc --noEmit`

---

### Step 6：重构 Module 组件（5 个文件）

**操作：** 基于对后端 API 的理解重新设计组件结构（非复制）：
- `magi-unit.tsx` — 重新设计卡片结构
- `magi-page.tsx` — 重新组织 clipPath 和布局
- `proposal-panel.tsx` — 重新设计提案面板
- `verdict-panel.tsx` — 重新设计表态面板
- `video-panel.tsx` — 重新设计日志面板

**回退命令：**
```bash
git checkout -- magi_front/src/components/module/
```

**验证：** `cd magi_front && npx tsc --noEmit`

---

### Step 7：重构 Layout 组件（`magi-grid.tsx`）

**操作：** 重新设计 Grid 布局容器

**回退命令：**
```bash
git checkout -- magi_front/src/components/layout/
```

**验证：** `cd magi_front && npx tsc --noEmit`

---

### Step 8：完整构建验证

**操作：** `cd magi_front && npm run build`

**回退命令：**
```bash
git reset --hard HEAD~1
```

---

## 三、Git 提交策略

```
commit 1: "fix(types): 重写 StreamChunk 类型匹配后端 SSE 格式"
commit 2: "fix(api): 重写 SSE 解析逻辑，修复 fetchSummary 参数"
commit 3: "fix(store): 添加 LogEntry.id 和 currentSpeaker 状态"
commit 4: "fix(controller): 重写 handleChunk 处理 4 种 SSE 类型"
commit 5: "refactor(ui): 适配新类型定义"
commit 6: "refactor(module): 重构 Module 组件（非复制）"
commit 7: "refactor(layout): 重构 Grid 布局容器"
commit 8: "chore: 完整构建验证通过"
```

每个 commit 后都可以用 `git reset --hard HEAD~1` 回退到上一步。

---

## 四、验证清单

| 步骤 | 验证项 | 预期结果 |
|------|--------|---------|
| 1-7 | `npx tsc --noEmit` | 无 TypeScript 错误 |
| 8 | `npm run build` | Build 成功 |
| 9 | 启动后端 + 前端 | 页面正常加载 |
| 10 | 输入议题点击"開始" | 日志区显示系统消息 |
| 11 | 等待辩论进行 | 贤人卡片显示发言内容 |
| 12 | 辩论结束 | 表态徽章正确更新 |
| 13 | 点击"總結" | 总结功能正常工作 |

---

## 五、风险矩阵

| 风险 | 概率 | 影响 | 检测方法 | 缓解措施 |
|------|------|------|---------|---------|
| SSE 解析错误 | 高 | 严重 | 浏览器控制台查看原始 SSE 数据 | 每步 tsc 验证 + 端到端测试 |
| Store Action 缺失 | 中 | 严重 | 运行时功能缺失 | 对照后端 4 种类型逐一验证 |
| 组件重构布局错位 | 中 | 中等 | 视觉检查 | 保留 Grid 定义不变 |
| clipPath 视觉变化 | 低 | 低 | 视觉检查 | 保留 clipPath 值 |
| 构建失败 | 低 | 高 | `npm run build` | 每步提交，可回退 |
