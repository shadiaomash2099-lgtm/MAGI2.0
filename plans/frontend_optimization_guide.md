# MAGI2.0 前端优化守则

> 本文档作为下一阶段美术风格微调的"工作区域准备"和"上下文压缩"。
> 所有后续修改必须遵守此守则，每一步都要 git 提交（直到用户同意停止）。

---

## 一、项目现状（截至 2026-05-01）

### 1.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.2.4 |
| UI 库 | React | 19 |
| 样式 | Tailwind CSS | 4 |
| 状态管理 | Zustand | 5 |
| 构建工具 | Turbopack | - |
| 后端 | FastAPI (Python) | - |

### 1.2 目录结构

```
magi_front/
├── src/
│   ├── app/
│   │   ├── globals.css          # 全局样式 + 所有 @keyframes
│   │   ├── layout.tsx           # 根布局
│   │   └── page.tsx             # 页面入口（渲染 MagiPage）
│   ├── types/
│   │   └── index.ts             # 所有 TypeScript 类型定义
│   ├── store/
│   │   └── debate-store.ts      # Zustand 全局状态
│   ├── lib/
│   │   └── api.ts               # API 层（SSE 流式 + 总结）
│   └── components/
│       ├── layout/
│       │   └── magi-grid.tsx    # Grid 布局容器 + SVG 连接线
│       ├── module/
│       │   ├── magi-page.tsx    # 页面编排器（标题栏+状态栏+3层叠）
│       │   ├── magi-unit.tsx    # 贤人单元卡片
│       │   ├── debate-controller.tsx  # 辩论控制器 Hook
│       │   ├── proposal-panel.tsx     # 提案面板
│       │   ├── verdict-panel.tsx      # 表态面板
│       │   ├── video-panel.tsx        # 日志面板
│       │   ├── boot-sequence.tsx      # 启动序列状态机
│       │   ├── boot-scp-logo.tsx      # SCP 标志阶段
│       │   ├── boot-nerv-loading.tsx  # NERV 加载阶段
│       │   ├── boot-transition.tsx    # 过渡阶段
│       │   └── nerv-hex-bg.tsx        # Canvas 六边形呼吸背景
│       └── ui/
│           ├── status-indicator.tsx   # 状态指示器
│           ├── verdict-badge.tsx      # 表态徽章
│           ├── log-viewer.tsx         # 日志查看器
│           ├── model-selector.tsx     # 模型选择器
│           ├── topic-input.tsx        # 话题输入框
│           └── control-buttons.tsx    # 控制按钮组
```

### 1.3 后端 API（不变）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/stream_debate` | POST | SSE 流式辩论（`type: sys/start/chunk/verdict`） |
| `/api/summarize` | POST | 全局总结（`{history, topic}` → `{summary, verdicts}`） |
| `/api/summarize_unit` | POST | 单贤人总结（`{role, content, topic}` → `{summary, verdict}`） |

---

## 二、19 条铁律（必须严格遵守）

### 布局规则

| 编号 | 规则 | 说明 |
|------|------|------|
| **R1** | 仅使用 CSS Grid + Flexbox | 禁止任何 float、table-cell 布局 |
| **R2** | 禁止 `position: absolute/fixed` | 所有层叠使用 Grid 层叠（`col-start-1 row-start-1 col-span-full row-span-full`） |
| **R3** | Grid 定义锁定 | `grid-template-columns: 22% 1fr 22%; grid-template-rows: 1fr 1fr; grid-template-areas: "proposal melchior verdict" "balthasar video casper"` |
| **R4** | 4 层组件架构 | `page → layout → module → ui`，数据流单向向下 |

### 组件规则

| 编号 | 规则 | 说明 |
|------|------|------|
| **R5** | 每个文件 ≤ 200 行 | 超出必须拆分 |
| **R6** | 组件只通过 props 接收数据 | 禁止组件内部直接调用 Store |
| **R7** | 禁止 `useRef` 同步状态 | 使用 Zustand action 更新 |
| **R8** | 禁止 `any` 类型 | 所有类型必须在 `types/index.ts` 定义 |
| **R9** | 禁止内联 `style` | 使用 Tailwind 类或 CSS 变量 |

### 状态管理规则

| 编号 | 规则 | 说明 |
|------|------|------|
| **R10** | Zustand 管理全局状态 | `useDebateStore` 是唯一全局 Store |
| **R11** | `useState` 仅用于局部 UI 状态 | 如弹窗开关、输入框值 |
| **R12** | Store action 必须是纯函数 | 不包含 API 调用逻辑 |
| **R13** | 控制器 Hook 隔离副作用 | `useDebateController` 封装所有 API 调用和副作用 |

### 样式规则

| 编号 | 规则 | 说明 |
|------|------|------|
| **R14** | 颜色使用 CSS 变量 | `var(--magi-red)` 等，定义在 `:root` |
| **R15** | 全局动画放 `globals.css` | 组件特有动画放组件内 |
| **R16** | 禁止复制原始代码 | 所有实现基于效果理解重新编写 |
| **R17** | 主题色为 NERV 红 | `oklch(0.65 0.25 30)` 为主色 |

### API 通信规则

| 编号 | 规则 | 说明 |
|------|------|------|
| **R18** | API 层是纯函数 | `lib/api.ts` 只返回数据，不操作 Store |
| **R19** | SSE 数据流经 Store | API → Controller → Store → 组件 |

---

## 三、当前视觉特效清单

### 已实现（30 个）

| # | 特效 | 位置 | 说明 |
|---|------|------|------|
| 1 | `scanline` | globals.css | CRT 扫描线（6s linear infinite） |
| 2 | `flicker` | globals.css | 屏幕闪烁（5s infinite） |
| 3 | `glow-pulse` | globals.css | 光晕脉冲（2s ease-in-out） |
| 4 | `text-glow` | globals.css | 文字发光（2s ease-in-out） |
| 5 | `cursor-blink` | globals.css | 打字机光标（0.7s step-end） |
| 6 | `lcl-breathe` | globals.css | LCL 呼吸（2.5s ease-in-out） |
| 7 | `at-field-pulse` | globals.css | AT 脉冲（3s ease-in-out） |
| 8 | `at-field-ripple-1/2/3` | globals.css | AT 涟漪 3 层（3s 交错 1s） |
| 9 | `badge-pop` | globals.css | 徽章弹出（0.4s cubic-bezier） |
| 10 | `fade-in-up` | globals.css | 渐入（0.5s ease-out） |
| 11 | `module-appear` | globals.css | 模块入场（0.7s） |
| 12 | `data-stream` | globals.css | 数据流扫描（4s linear） |
| 13 | `data-flow` | globals.css | 数据流动（2s linear） |
| 14 | `border-glow` | globals.css | 边框发光（3s ease-in-out） |
| 15 | `energy-ripple` | globals.css | 能量波纹（2s ease-in-out） |
| 16 | `particle-twinkle` | globals.css | 粒子闪烁（2s ease-in-out） |
| 17 | `border-sweep-*` | globals.css | 边框扫描 4 方向（2s） |
| 18 | `scp-draw-1~4` | globals.css | SCP 弧线绘制（2s） |
| 19 | `scp-notch-appear` | globals.css | SCP 缺口出现（0.5s） |
| 20 | `scp-inner-appear` | globals.css | SCP 内圈出现（0.6s） |
| 21 | `scp-arrows-appear` | globals.css | SCP 箭头伸出（0.5s） |
| 22 | `nerv-appear` | globals.css | NERV 标志出现（0.8s） |
| 23 | `number-roll` | globals.css | 数字滚动（0.3s） |
| 24 | `zoom-out` | globals.css | 放大淡出（1s） |
| 25 | `zoom-in` | globals.css | 放大淡入（1s） |
| 26 | 启动序列 | boot-sequence.tsx | 3 阶段状态机 |
| 27 | Canvas 六边形 | nerv-hex-bg.tsx | 7 个呼吸六边形 |
| 28 | SVG 连接线 | magi-grid.tsx | 三贤人三角形连线 |
| 29 | CRT 屏幕 | crt-screen class | 扫描线 + 暗角 |
| 30 | 网格纹理 | grid-texture class | 20px CSS grid |

### 待微调（下一阶段）

| # | 待优化项 | 当前状态 | 建议方向 |
|---|---------|---------|---------|
| 1 | 颜色对比度 | NERV 红在深色背景上可能不够突出 | 调整亮度/饱和度 |
| 2 | 字体渲染 | Matisse Pro 可能未加载 | 检查 font-display 和 fallback |
| 3 | 动画时序 | 部分动画可能过快/过慢 | 统一调整 duration |
| 4 | 卡片间距 | Grid gap 为 0 | 考虑添加 gap |
| 5 | 边框样式 | 卡片边框为 `border-red-900/20` | 可能太淡 |
| 6 | 状态栏闪烁 | `MAGI_LINK` 使用 blink state | 可改为更优雅的动画 |
| 7 | 扫描线透明度 | `via-red-500/8` | 可能太淡或太明显 |
| 8 | 六边形密度 | 7 个六边形 | 可增加数量或调整位置 |
| 9 | 标题大小 | `text-xl` | 可调整 |
| 10 | 按钮样式 | 控制按钮 | 可增加 hover 效果 |

---

## 四、Git 提交规范

### 4.1 提交频率

```
每一步修改 → git add → git commit → git push
（直到用户说"停止提交"为止）
```

### 4.2 提交信息格式

```
type(scope): 描述

- 具体变更点 1
- 具体变更点 2
```

| type | 用途 |
|------|------|
| `style` | 视觉/样式调整 |
| `fix` | 修复问题 |
| `feat` | 新功能 |
| `refactor` | 重构 |
| `chore` | 杂项 |

### 4.3 回退命令

```bash
# 回退单个文件
git checkout -- <filepath>

# 回退到上一个提交
git reset --hard HEAD~1
```

---

## 五、验证命令

```bash
# 类型检查
cd /Users/matebook/MAGI2_0/magi_front && npx tsc --noEmit

# 构建
npm run build

# 开发服务器
npm run dev
```

---

## 六、启动方式

```bash
# 终端 1: 后端
cd /Users/matebook/MAGI2_0 && uvicorn backend.main:app --reload --port 8000

# 终端 2: 前端
cd /Users/matebook/MAGI2_0/magi_front && npm run dev

# 浏览器
open http://localhost:3000
```

或使用一键启动脚本：

```bash
open /Users/matebook/MAGI2_0/启动MAGI2.command
```

---

## 七、上下文压缩总结

### 已完成的里程碑

1. **项目初始化**：Next.js 16 + React 19 + Tailwind 4 + Zustand 5
2. **后端对接**：SSE 流式解析（4 种事件类型）、3 个 API 端点
3. **组件架构**：4 层体系（page→layout→module→ui），19 条铁律
4. **数据流**：API→Controller→Store→Component（单向）
5. **视觉特效**：30 个动画 + 启动序列 + 六边形网格 + SVG 连接线 + CRT 效果
6. **Git 管理**：GitHub 远程仓库，MAGI2.0

### 下一阶段目标

> 美术风格微调 — 在现有视觉特效基础上，优化颜色、间距、字体、动画时序等细节。
> 每一步都要 git 提交，直到用户同意停止。

---

*本守则生成于 2026-05-01，作为下一阶段工作的上下文基础。*
