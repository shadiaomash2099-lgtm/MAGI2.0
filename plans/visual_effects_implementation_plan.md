# MAGI2.0 视觉特效实现计划

> 基于原始 [`MAGI_System`](../MAGI_System) 前端视觉分析，制定 MAGI2.0 特效实现方案。
> **核心原则**：绝不复制原始代码（原始文件充满错误引用和截断），所有实现基于对效果的理解重新编写。
> **布局约束**：严格遵守 R1（CSS Grid + Flexbox）、R2（禁止 `position: absolute/fixed`）。

---

## 一、原始特效全景分析

### 1.1 原始文件清单

| 文件 | 行数 | 包含特效 |
|------|------|----------|
| [`globals.css`](../MAGI_System/magi_front/MAGI_DEMO/app/globals.css) | 794 | 30+ 动画关键帧、CRT 效果、网格纹理、噪点、Markdown 样式、自定义滚动条 |
| [`boot-sequence-scp.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/boot-sequence-scp.tsx) | 347 | 3 阶段启动序列：SCP 标志矢量动画 → NERV 加载 → 过渡 |
| [`nerv-hex-grid.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/nerv-hex-grid.tsx) | 189 | Canvas 六边形呼吸网格（7 个六边形，正弦波呼吸） |
| [`magi-system.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/magi-system.tsx) | 566 | SVG 连接线、MAGI SYSTEM 标题、底部状态栏、模块入场动画 |

### 1.2 特效分类矩阵

| 类别 | 特效名称 | 原始实现方式 | 当前 MAGI2.0 状态 | 优先级 |
|------|----------|-------------|-------------------|--------|
| **CRT 效果** | 扫描线 `scanline` | CSS `@keyframes` + `::before` | ✅ 已实现 | P0 |
| | 闪烁 `flicker` | CSS `@keyframes` | ✅ 已实现 | P0 |
| | 光晕脉冲 `glow-pulse` | CSS `@keyframes` + `drop-shadow` | ✅ 已实现 | P0 |
| | 文字发光 `text-glow` | CSS `@keyframes` + `text-shadow` | ✅ 已实现 | P0 |
| | 暗角 `radial-gradient` | CSS `::after` | ✅ 已实现 | P0 |
| | 扫描线覆盖层 | `div` + `animate-scanline` | ❌ 未实现 | P1 |
| **LCL 呼吸** | 发言时卡片呼吸 | CSS `@keyframes lcl-breathe` | ✅ 已实现 | P0 |
| **AT Field** | 脉冲光晕 `at-field-pulse` | CSS `@keyframes` | ✅ 已实现 | P0 |
| | 涟漪 3 层 `ripple-1/2/3` | CSS `@keyframes` 交错 1s | ✅ 已实现 | P0 |
| **数据流** | 数据流扫描 `data-stream` | CSS `@keyframes` | ✅ 已实现 | P0 |
| | 数据流动 `data-flow` | CSS `@keyframes` | ✅ 已实现 | P0 |
| **边框** | 边框发光 `border-glow` | CSS `@keyframes` + `box-shadow` | ✅ 已实现 | P0 |
| | 边框扫描 `sweep-top/right/bottom/left` | CSS `@keyframes` | ❌ 未实现 | P2 |
| **徽章** | 表态弹出 `badge-pop` | CSS `@keyframes` | ✅ 已实现 | P0 |
| **入场** | 模块出现 `module-appear` | CSS `@keyframes` | ✅ 已实现 | P0 |
| | 渐入 `fade-in-up` | CSS `@keyframes` | ✅ 已实现 | P0 |
| **背景** | 网格纹理 `grid-texture` | CSS `background-image` | ✅ 已实现 | P0 |
| | 噪点 `noise-texture` | CSS `::before` + SVG filter | ✅ 已实现 | P0 |
| **光标** | 打字机光标 `cursor-blink` | CSS `@keyframes` | ✅ 已实现 | P0 |
| **粒子** | 闪烁 `particle-twinkle` | CSS `@keyframes` | ✅ 已实现 | P0 |
| **能量** | 能量波纹 `energy-ripple` | CSS `@keyframes` + `box-shadow` | ✅ 已实现 | P0 |
| **六边形** | 呼吸 `hex-pulse` | CSS `@keyframes` | ✅ 已实现 | P0 |
| | Canvas 六边形网格 | `useRef` + `requestAnimationFrame` | ❌ 未实现 | P1 |
| **启动序列** | SCP 标志矢量绘制 | SVG `stroke-dasharray/dashoffset` | ❌ 未实现 | P1 |
| | NERV 加载 | SVG + 进度条 + 数字滚动 | ❌ 未实现 | P1 |
| | 过渡动画 | `zoom-out` + `zoom-in` | ❌ 未实现 | P1 |
| **连接线** | 三贤人 SVG 连接线 | SVG `line` + `mix-blend-mode: screen` | ❌ 未实现 | P1 |
| **标题** | MAGI SYSTEM 标题 | `h1` + `animate-text-glow` | ❌ 未实现 | P1 |
| **状态栏** | 底部状态栏 | `div` + `SYS_STATUS` / `MAGI_LINK` | ❌ 未实现 | P2 |
| **滚动条** | 自定义滚动条 | `::-webkit-scrollbar` | ✅ 已实现 | P0 |

---

## 二、实施策略

### 2.1 分层实施原则

```
Phase 1: CSS 动画补齐（globals.css 增量修改）
  └─ 当前已实现 20/30 个动画，补齐缺失的 10 个

Phase 2: 启动序列组件（新组件，不复制原始代码）
  └─ boot-sequence.tsx — 3 阶段启动，纯 SVG + CSS 动画

Phase 3: Canvas 六边形呼吸网格（新组件，遵守 R2）
  └─ nerv-hex-bg.tsx — 背景装饰，CSS Grid 定位

Phase 4: 页面级视觉集成（magi-page.tsx + magi-grid.tsx 修改）
  └─ SVG 连接线、标题、状态栏、扫描线覆盖层
```

### 2.2 关键约束

| 规则 | 内容 | 对本计划的影响 |
|------|------|---------------|
| **R1** | 仅使用 CSS Grid + Flexbox 布局 | 原始 `position: fixed/absolute` 的覆盖层（扫描线、启动序列）需改用 Grid 层叠 |
| **R2** | 禁止 `position: absolute/fixed` | 原始 `NervHexCorner` 使用 `absolute` 定位，需改为 Grid area 或 `z-index` 层叠 |
| **R3** | Grid 定义锁定 | 不可修改 `grid-template-columns/rows/areas` |
| **R5** | 每个文件 ≤ 200 行 | 启动序列（原始 347 行）需拆分为子组件 |
| **R15** | CSS 变量集中定义 | 所有颜色值使用 `:root` 变量 |
| **R16** | 组件动画使用 CSS Modules | 全局动画放 `globals.css`，组件特有动画放组件内 |

---

## 三、Phase 1：CSS 动画补齐

### 3.1 当前 `globals.css` 已有动画（20 个）

```
scanline, flicker, glow-pulse, text-glow, cursor-blink,
lcl-breathe, boot-sequence, boot-progress,
at-field-pulse, particle-twinkle, data-stream,
energy-ripple, at-field-ripple-1/2/3,
badge-pop, fade-in-up, module-appear,
data-flow, border-glow
```

### 3.2 需要新增的动画（10 个）

#### 3.2.1 边框扫描动画（4 个）

```css
/* 上边框从左到右扫描 */
@keyframes border-sweep-top {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 右边框从上到下扫描 */
@keyframes border-sweep-right {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* 下边框从右到左扫描 */
@keyframes border-sweep-bottom {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

/* 左边框从下到上扫描 */
@keyframes border-sweep-left {
  0% { transform: translateY(100%); }
  100% { transform: translateY(-100%); }
}
```

**用途**：卡片边框的流动光效，增强 NERV 科技感。

#### 3.2.2 启动序列动画（6 个）

```css
/* SCP 标志绘制 — 4 段弧线依次绘制 */
@keyframes scp-draw-1 {
  0% { stroke-dashoffset: 200; }
  25% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}
@keyframes scp-draw-2 {
  0%, 25% { stroke-dashoffset: 200; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}
@keyframes scp-draw-3 {
  0%, 50% { stroke-dashoffset: 200; }
  75% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}
@keyframes scp-draw-4 {
  0%, 75% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}

/* 缺口装饰出现 */
@keyframes scp-notch-appear {
  0% { opacity: 0; transform: scale(0); }
  60% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* 内圈出现 */
@keyframes scp-inner-appear {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

/* 箭头从中心伸出 */
@keyframes scp-arrows-appear {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}

/* NERV 标志出现 */
@keyframes nerv-appear {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

/* 数字滚动 */
@keyframes number-roll {
  0% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 放大淡出 */
@keyframes zoom-out {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* 放大淡入 */
@keyframes zoom-in {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

#### 3.2.3 六边形呼吸脉冲

```css
@keyframes hex-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
```

> **注意**：此动画已存在于当前 `globals.css`，仅用于 CSS 六边形装饰。Canvas 六边形网格的呼吸效果在 Phase 3 通过 `requestAnimationFrame` 实现。

### 3.3 修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| [`magi_front/src/app/globals.css`](magi_front/src/app/globals.css) | 增量添加 | 新增 10 个 `@keyframes` + 对应的 `.animate-*` 类 |

### 3.4 验证方法

```bash
cd /Users/matebook/MAGI2_0/magi_front
npx tsc --noEmit   # 零类型错误
npm run build       # 构建成功
```

### 3.5 回退策略

```bash
git checkout -- magi_front/src/app/globals.css
```

---

## 四、Phase 2：启动序列组件

### 4.1 架构设计

原始 [`boot-sequence-scp.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/boot-sequence-scp.tsx) 347 行，违反 R5（≤200 行）。拆分为：

```
components/
  module/
    boot-sequence.tsx          ← 主组件（≤100 行，状态机调度）
    boot-scp-logo.tsx          ← SCP 标志阶段（≤100 行）
    boot-nerv-loading.tsx      ← NERV 加载阶段（≤100 行）
    boot-transition.tsx        ← 过渡阶段（≤50 行）
```

### 4.2 状态机设计

```
[scp-logo] ──(按钮点击)──> [nerv-loading] ──(进度100%)──> [transition] ──(1.2s)──> [complete]
     ↑                                                                              │
     └─────────────────────── ESC 键跳过 ───────────────────────────────────────────┘
```

### 4.3 组件职责

#### [`boot-sequence.tsx`](magi_front/src/components/module/boot-sequence.tsx)（新建）

- 状态：`phase: 'scp-logo' | 'nerv-loading' | 'transition' | 'complete'`
- 2 秒后允许 ESC 跳过
- 渲染子组件 + 跳过提示
- 使用 CSS Grid 层叠（遵守 R2），而非 `position: fixed`

**关键设计决策**：原始使用 `position: fixed` 覆盖全屏。MAGI2.0 使用 Grid 层叠方案：

```tsx
// boot-sequence.tsx — 使用 Grid 层叠替代 position: fixed
<div className="col-start-1 row-start-1 col-span-full row-span-full z-50 bg-background">
  {/* 启动序列内容 */}
</div>
```

这要求 [`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 的外层容器使用 Grid 布局，启动序列作为第一个子元素（底层），MagiGrid 作为第二个子元素（上层），通过 `z-index` 控制显示。

#### [`boot-scp-logo.tsx`](magi_front/src/components/module/boot-scp-logo.tsx)（新建）

- SVG SCP 收容标志（4 段弧线 + 4 个缺口 + 内圈 + 3 个箭头）
- SCP 字母逐个出现（200ms 间隔）
- "权限确认"按钮

**与原始的关键区别**：
- 原始使用 `animate-scp-draw-1/2/3/4` 四个独立的 CSS 类 → 改为单个 SVG `<path>` 使用 `stroke-dasharray` + CSS 动画
- 原始使用 `transition-all duration-700` 控制字母出现 → 改为 `useEffect` + `setTimeout` 控制 className 切换
- 原始使用 `pointer-events-auto/none` 控制按钮交互 → 改为 `disabled` 属性

#### [`boot-nerv-loading.tsx`](magi_front/src/components/module/boot-nerv-loading.tsx)（新建）

- NERV 标志 SVG（圆 + 十字线）
- 进度条（5% 增量，75ms 间隔）
- 8 个随机数字滚动（200ms 更新）

**与原始的关键区别**：
- 原始使用 `setInterval` 直接修改 DOM 样式 → 改为 React state 驱动
- 原始进度条使用 `style={{ width: ... }}` → 改为 Tailwind `w-[${progress}%]` 或内联样式
- 原始数字滚动使用 `animate-number-roll` → 改为 CSS `@keyframes number-roll`

#### [`boot-transition.tsx`](magi_front/src/components/module/boot-transition.tsx)（新建）

- NERV 标志放大淡出（`zoom-out`）
- MAGI SYSTEM 文字放大淡入（`zoom-in`）

**与原始的关键区别**：
- 原始使用 `position: absolute` 叠加两个元素 → 改为 Flexbox 层叠
- 原始使用 `animate-zoom-out` + `animate-zoom-in` → 使用 CSS `@keyframes`

### 4.4 集成方式

在 [`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 中：

```tsx
export function MagiPage() {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <div className="grid grid-cols-1 grid-rows-1 w-full h-full">
      {/* 启动序列 — 覆盖层 */}
      {!bootComplete && (
        <BootSequence onComplete={() => setBootComplete(true)} />
      )}
      {/* 主界面 — 在启动序列下方 */}
      <MagiGrid ... />
    </div>
  );
}
```

### 4.5 修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| [`magi_front/src/components/module/boot-sequence.tsx`](magi_front/src/components/module/boot-sequence.tsx) | **新建** | 启动序列主组件（状态机） |
| [`magi_front/src/components/module/boot-scp-logo.tsx`](magi_front/src/components/module/boot-scp-logo.tsx) | **新建** | SCP 标志阶段 |
| [`magi_front/src/components/module/boot-nerv-loading.tsx`](magi_front/src/components/module/boot-nerv-loading.tsx) | **新建** | NERV 加载阶段 |
| [`magi_front/src/components/module/boot-transition.tsx`](magi_front/src/components/module/boot-transition.tsx) | **新建** | 过渡阶段 |
| [`magi_front/src/components/module/magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) | **修改** | 集成启动序列 |
| [`magi_front/src/app/globals.css`](magi_front/src/app/globals.css) | **修改** | 新增启动序列动画（Phase 1 已添加） |

### 4.6 验证方法

```bash
cd /Users/matebook/MAGI2_0/magi_front
npm run dev
# 打开浏览器，确认启动序列按顺序播放
# 确认 ESC 键可跳过
# 确认启动完成后正常进入主界面
```

### 4.7 回退策略

```bash
git checkout -- magi_front/src/components/module/boot-sequence.tsx
git checkout -- magi_front/src/components/module/boot-scp-logo.tsx
git checkout -- magi_front/src/components/module/boot-nerv-loading.tsx
git checkout -- magi_front/src/components/module/boot-transition.tsx
git checkout -- magi_front/src/components/module/magi-page.tsx
```

---

## 五、Phase 3：Canvas 六边形呼吸网格

### 5.1 设计决策

原始 [`nerv-hex-grid.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/nerv-hex-grid.tsx) 使用 `position: absolute` 定位到角落，违反 R2。

**MAGI2.0 方案**：将六边形网格作为背景装饰层，通过 Grid 层叠放置在 MagiGrid 下方。

### 5.2 组件设计

#### [`nerv-hex-bg.tsx`](magi_front/src/components/module/nerv-hex-bg.tsx)（新建）

- 使用 Canvas（`useRef` + `useEffect`）
- 7 个六边形，对角线排列（与原始一致）
- 每个六边形独立呼吸（随机速度/幅度/相位）
- NERV 红色主题
- `requestAnimationFrame` 渲染循环
- **不接收 `position` prop** — 固定在背景层

**与原始的关键区别**：
- 原始：`position: absolute` 定位到角落 → 改为 Grid 层叠背景
- 原始：`NervHexCorner({ position })` 接收位置参数 → 改为单一背景组件
- 原始：200x200 Canvas → 改为 `100%` 宽高，响应式
- 原始：`rgb(180+75*glow, 20+30*glow, 20+30*glow)` → 使用 CSS 变量 `var(--magi-red)`

### 5.3 集成方式

在 [`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 中：

```tsx
<div className="grid grid-cols-1 grid-rows-1 w-full h-full">
  {/* 背景层 */}
  <NervHexBg />
  {/* 主界面层 */}
  <MagiGrid ... />
</div>
```

### 5.4 修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| [`magi_front/src/components/module/nerv-hex-bg.tsx`](magi_front/src/components/module/nerv-hex-bg.tsx) | **新建** | Canvas 六边形呼吸网格 |
| [`magi_front/src/components/module/magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) | **修改** | 集成六边形背景 |

### 5.5 验证方法

```bash
cd /Users/matebook/MAGI2_0/magi_front
npm run dev
# 确认六边形网格在背景层显示
# 确认六边形有呼吸动画
# 确认不影响主界面交互
```

### 5.6 回退策略

```bash
git checkout -- magi_front/src/components/module/nerv-hex-bg.tsx
git checkout -- magi_front/src/components/module/magi-page.tsx
```

---

## 六、Phase 4：页面级视觉集成

### 6.1 SVG 连接线

原始在 [`magi-system.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/magi-system.tsx:427-438) 中使用 SVG 绘制三条连接线（melchior → balthasar → casper → melchior），形成三角形。

**MAGI2.0 方案**：在 [`magi-grid.tsx`](magi_front/src/components/layout/magi-grid.tsx) 中添加 SVG 覆盖层。

```tsx
// 在 magi-grid.tsx 的 Grid 容器内添加
<svg
  className="col-start-1 row-start-1 col-span-full row-span-full pointer-events-none z-10 opacity-40"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  style={{ mixBlendMode: 'screen' }}
>
  <g stroke="var(--magi-amber)" strokeWidth="0.3" fill="none">
    <line x1="50" y1="30" x2="18" y2="72" />
    <line x1="18" y1="72" x2="82" y2="72" />
    <line x1="82" y1="72" x2="50" y2="30" />
  </g>
</svg>
```

**关键设计**：SVG 使用 `viewBox="0 0 100 100" preserveAspectRatio="none"` 自动适配 Grid 尺寸。使用 `mix-blend-mode: screen` 增强科技感。

### 6.2 MAGI SYSTEM 标题

原始在 [`magi-system.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/magi-system.tsx:409-413) 中使用 `h1` 标题。

**MAGI2.0 方案**：在 [`magi-grid.tsx`](magi_front/src/components/layout/magi-grid.tsx) 的 Grid 上方添加标题行。

由于 Grid 定义锁定（R3），标题不能放在 Grid 内部。改为在 [`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 中使用 Flexbox 包裹：

```tsx
<div className="flex flex-col w-full h-full">
  {/* 标题栏 */}
  <div className="flex items-center justify-center py-1.5 shrink-0">
    <h1 className="text-magi-red text-xl font-black tracking-[0.15em] animate-text-glow">
      MAGI SYSTEM
    </h1>
  </div>
  {/* Grid 区域 */}
  <div className="flex-1 min-h-0">
    <MagiGrid ... />
  </div>
</div>
```

### 6.3 底部状态栏

原始在 [`magi-system.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/magi-system.tsx:558-561) 中使用底部状态栏显示 `SYS_STATUS` 和 `MAGI_LINK`。

**MAGI2.0 方案**：在 [`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 中添加底部状态栏：

```tsx
{/* 底部状态栏 */}
<div className="flex items-center justify-between px-3 py-1 text-[7px] text-red-400/30 tracking-widest border-t border-red-900/15 shrink-0">
  <span>SYS_STATUS: {sysStatus}</span>
  <span className={blink ? "opacity-60" : "opacity-0"}>MAGI_LINK: ONLINE</span>
</div>
```

### 6.4 扫描线覆盖层

原始在 [`magi-system.tsx`](../MAGI_System/magi_front/MAGI_DEMO/components/magi-system.tsx:399-401) 中使用 `position: fixed` 的扫描线覆盖层。

**MAGI2.0 方案**：在 [`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 中使用 Grid 层叠：

```tsx
<div className="grid grid-cols-1 grid-rows-1 w-full h-full">
  {/* 扫描线覆盖层 */}
  <div className="col-start-1 row-start-1 col-span-full row-span-full pointer-events-none z-50 overflow-hidden">
    <div className="w-full h-[2px] bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-scanline" />
  </div>
  {/* 主界面 */}
  <MagiGrid ... />
</div>
```

### 6.5 修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| [`magi_front/src/components/layout/magi-grid.tsx`](magi_front/src/components/layout/magi-grid.tsx) | **修改** | 添加 SVG 连接线覆盖层 |
| [`magi_front/src/components/module/magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) | **修改** | 添加标题栏、底部状态栏、扫描线覆盖层、六边形背景、启动序列集成 |

### 6.6 验证方法

```bash
cd /Users/matebook/MAGI2_0/magi_front
npx tsc --noEmit   # 零类型错误
npm run build       # 构建成功
npm run dev         # 视觉验证
```

### 6.7 回退策略

```bash
git checkout -- magi_front/src/components/layout/magi-grid.tsx
git checkout -- magi_front/src/components/module/magi-page.tsx
```

---

## 七、执行顺序与依赖关系

```mermaid
flowchart TD
    P1[Phase 1: CSS 动画补齐] --> P2[Phase 2: 启动序列]
    P1 --> P3[Phase 3: Canvas 六边形]
    P1 --> P4[Phase 4: 页面集成]
    P2 --> P4
    P3 --> P4
    
    P1 -.->|依赖| globals.css
    P2 -.->|依赖| boot-*.tsx
    P3 -.->|依赖| nerv-hex-bg.tsx
    P4 -.->|依赖| magi-grid.tsx + magi-page.tsx
```

### 推荐执行顺序

| 步骤 | Phase | 内容 | 预计文件变更 |
|------|-------|------|-------------|
| Step 1 | Phase 1 | `globals.css` 新增 10 个动画 | 1 文件 |
| Step 2 | Phase 2 | 创建 4 个启动序列组件 | 4 新建 |
| Step 3 | Phase 3 | 创建 Canvas 六边形组件 | 1 新建 |
| Step 4 | Phase 4 | 修改 `magi-grid.tsx` 添加 SVG 连接线 | 1 修改 |
| Step 5 | Phase 4 | 修改 `magi-page.tsx` 集成所有视觉元素 | 1 修改 |

---

## 八、潜在风险与应对

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|----------|
| Canvas 六边形性能问题 | 低 | 中 | 使用 `requestAnimationFrame` + `useRef` 避免重渲染；Canvas 尺寸限制在合理范围 |
| 启动序列 SVG 动画与原始不一致 | 中 | 低 | 视觉上近似即可，不追求像素级一致 |
| Grid 层叠导致交互穿透 | 低 | 高 | 启动序列使用 `pointer-events: auto`，完成后移除 DOM |
| 标题栏/状态栏占用空间导致 Grid 缩小 | 中 | 中 | 使用 `shrink-0` + `flex-1 min-h-0` 确保 Grid 撑满剩余空间 |
| 扫描线覆盖层遮挡交互 | 低 | 高 | 使用 `pointer-events: none` |

---

## 九、完整文件变更清单

### 新建文件（5 个）

| # | 文件路径 | 预计行数 | 说明 |
|---|---------|---------|------|
| 1 | [`magi_front/src/components/module/boot-sequence.tsx`](magi_front/src/components/module/boot-sequence.tsx) | ≤100 | 启动序列状态机 |
| 2 | [`magi_front/src/components/module/boot-scp-logo.tsx`](magi_front/src/components/module/boot-scp-logo.tsx) | ≤100 | SCP 标志阶段 |
| 3 | [`magi_front/src/components/module/boot-nerv-loading.tsx`](magi_front/src/components/module/boot-nerv-loading.tsx) | ≤100 | NERV 加载阶段 |
| 4 | [`magi_front/src/components/module/boot-transition.tsx`](magi_front/src/components/module/boot-transition.tsx) | ≤50 | 过渡阶段 |
| 5 | [`magi_front/src/components/module/nerv-hex-bg.tsx`](magi_front/src/components/module/nerv-hex-bg.tsx) | ≤150 | Canvas 六边形呼吸网格 |

### 修改文件（3 个）

| # | 文件路径 | 说明 |
|---|---------|------|
| 1 | [`magi_front/src/app/globals.css`](magi_front/src/app/globals.css) | 新增 10 个动画关键帧 |
| 2 | [`magi_front/src/components/layout/magi-grid.tsx`](magi_front/src/components/layout/magi-grid.tsx) | 添加 SVG 连接线覆盖层 |
| 3 | [`magi_front/src/components/module/magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) | 集成标题栏、状态栏、扫描线、启动序列、六边形背景 |

### 无需修改的文件

| 文件 | 原因 |
|------|------|
| [`magi_front/src/types/index.ts`](magi_front/src/types/index.ts) | 类型定义与视觉特效无关 |
| [`magi_front/src/store/debate-store.ts`](magi_front/src/store/debate-store.ts) | 状态管理与视觉特效无关 |
| [`magi_front/src/lib/api.ts`](magi_front/src/lib/api.ts) | API 层与视觉特效无关 |
| [`magi_front/src/components/module/debate-controller.tsx`](magi_front/src/components/module/debate-controller.tsx) | 控制器与视觉特效无关 |
| [`magi_front/src/components/module/magi-unit.tsx`](magi_front/src/components/module/magi-unit.tsx) | 单元卡片已有 LCL 呼吸动画，无需修改 |
| [`magi_front/src/components/module/proposal-panel.tsx`](magi_front/src/components/module/proposal-panel.tsx) | 提案面板无需修改 |
| [`magi_front/src/components/module/verdict-panel.tsx`](magi_front/src/components/module/verdict-panel.tsx) | 表态面板无需修改 |
| [`magi_front/src/components/module/video-panel.tsx`](magi_front/src/components/module/video-panel.tsx) | 视频面板无需修改 |
| [`magi_front/src/components/ui/*`](magi_front/src/components/ui/) | 所有 UI 组件无需修改 |
| [`magi_front/src/app/layout.tsx`](magi_front/src/app/layout.tsx) | 布局文件无需修改 |
| [`magi_front/src/app/page.tsx`](magi_front/src/app/page.tsx) | 页面入口无需修改 |

---

## 十、验证清单

### 构建验证（每个 Phase 后执行）

```bash
cd /Users/matebook/MAGI2_0/magi_front
npx tsc --noEmit          # 零类型错误
npm run build             # 构建成功
```

### 视觉验证（Phase 4 完成后）

| 检查项 | 预期结果 |
|--------|---------|
| 启动序列播放 | SCP 标志 → NERV 加载 → 过渡 → 主界面 |
| ESC 跳过 | 按 ESC 后直接进入主界面 |
| 六边形呼吸 | 背景层有 7 个六边形，正弦波呼吸 |
| SVG 连接线 | 三条金色线连接三贤人卡片 |
| MAGI SYSTEM 标题 | 顶部居中，红色发光 |
| 底部状态栏 | 显示 SYS_STATUS 和 MAGI_LINK |
| 扫描线覆盖 | 从上到下扫描，不遮挡交互 |
| 网格纹理 | 背景有 20px 网格线 |
| 噪点效果 | 背景有 SVG 噪点纹理 |
| CRT 暗角 | 屏幕边缘有暗角渐变 |
| 所有动画 | 不卡顿，不闪烁 |
| 布局不变 | Grid 定义未改变，无错位 |

---

请审查此计划，若无异议请批准。批准后，请切换至执行模式（Code/Implement Mode）进行落地。
