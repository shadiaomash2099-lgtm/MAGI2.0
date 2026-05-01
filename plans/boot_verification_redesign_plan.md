# 第二层验证系统重构计划 — NERV Loading → MAGI SYSTEM Verification

## 一、总体架构变更

### 当前状态
```
SCP Logo ──(按钮)──> NERV Loading (进度条+数字+anykey) ──(键盘)──> 主界面
```

### 目标状态
```
SCP Logo ──(按钮)──> MAGI SYSTEM Verification ──(验证通过+TOUCH)──> 主界面（平滑过渡）
                        │
                        ├─ 1. Default API 验证（黄色边框+蓝色透明背景）
                        ├─ 2. Melchior 验证（蓝色闪烁→高饱和天蓝）
                        ├─ 3. Balthasar 验证（蓝色闪烁→高饱和天蓝）
                        ├─ 4. Casper 验证（蓝色闪烁→高饱和天蓝）
                        └─ 5. 全部亮起 → 显示 TOUCH → 点击后标题上移过渡
```

## 二、核心架构变动说明

### 2.1 后端新增 [`/api/health`](backend/main.py) 端点

**目的：** 轻量级 API 连接验证，不接受流式响应，只返回成功/失败状态。

```python
class HealthCheckRequest(BaseModel):
    role: str  # "default" | "melchior" | "balthasar" | "casper"

@app.post("/api/health")
async def health_check(request: HealthCheckRequest):
    """
    轻量级连接验证：尝试调用对应角色的 AI 模型，返回连接状态。
    """
    try:
        # 调用对应角色的 AI 模型（使用极简 prompt）
        result = _call_agent(request.role, "请回复OK", "", "lite")
        return {"status": "ok", "role": request.role}
    except Exception as e:
        return {"status": "error", "role": request.role, "message": str(e)}
```

### 2.2 前端 API 层新增 [`healthCheck`](magi_front/src/lib/api.ts)

```typescript
export async function healthCheck(role: string): Promise<{ status: string; role: string }> {
  const res = await fetch(`${API_BASE}/api/health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return res.json();
}
```

### 2.3 [`boot-nerv-loading.tsx`](magi_front/src/components/module/boot-nerv-loading.tsx) 重写

**移除：**
- 进度条（`progress` state + 进度条 UI）
- 8个数字滚动（`numberRolls` state + 数字滚动 UI）
- "PRESS ANY KEY TO CONTINUE" 提示
- 键盘事件监听（`handleKeyDown`）

**保留：**
- 左右浮动数字系统（`DigitCell`、`createDigitGroup`、`renderDigitCol`、`renderDigitGroup`）
- NERV 标志（`nerv-emblem.svg`）
- "MAGI SYSTEM" 标题（改为 "MAGI SYSTEM" 中间加空格）

**新增：**
- 三贤者验证块（3个卡片，与主界面 MagiUnit 视觉风格一致）
- 验证状态机
- TOUCH 按钮
- 标题上移动画

### 2.4 三贤者验证块设计

```
┌──────────────────────────────────────────┐
│                                          │
│              NERV 标志 (缩小)              │
│            MAGI SYSTEM (标题)              │
│                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ MELCHIOR  │  │ BALTHASAR│  │  CASPER  │  │
│   │ 科学家    │  │  母亲    │  │  女人    │  │
│   │ [状态灯]  │  │ [状态灯]  │  │ [状态灯]  │  │
│   └──────────┘  └──────────┘  └──────────┘  │
│                                          │
│              [TOUCH] 按钮                  │
│                                          │
└──────────────────────────────────────────┘
```

**颜色状态机：**

| 状态 | 边框 | 背景 | 说明 |
|------|------|------|------|
| `pending` | 黄色 `#c0843c` | 蓝色透明 `rgba(0,100,200,0.15)` | 等待验证 |
| `verifying` | 黄色 `#c0843c` | 蓝色闪烁动画 | 正在验证 |
| `verified` | 天蓝色 `#00d4ff` | 高饱和天蓝 `rgba(0,212,255,0.3)` | 验证成功 |
| `error` | 红色 `#ff3333` | 红色透明 | 验证失败 |

### 2.5 验证状态机流程

```
phase: "idle"
  │
  ├─ 翻转动画完成后自动进入
  │
  ▼
phase: "verifying-default"
  │  向 /api/health 发送 { role: "default" }
  │  第一个块（Default）蓝色闪烁
  │  成功 → 变为高饱和天蓝色
  │
  ▼
phase: "verifying-melchior"
  │  向 /api/health 发送 { role: "melchior" }
  │  Melchior 块蓝色闪烁
  │  成功 → 变为高饱和天蓝色
  │
  ▼
phase: "verifying-balthasar"
  │  向 /api/health 发送 { role: "balthasar" }
  │  Balthasar 块蓝色闪烁
  │  成功 → 变为高饱和天蓝色
  │
  ▼
phase: "verifying-casper"
  │  向 /api/health 发送 { role: "casper" }
  │  Casper 块蓝色闪烁
  │  成功 → 变为高饱和天蓝色
  │
  ▼
phase: "complete"
  │  三个块全部天蓝色亮起
  │  显示 "TOUCH" 按钮
  │  点击后触发标题上移过渡
```

### 2.6 平滑过渡机制

验证完成后点击 TOUCH：
1. NERV 标志淡出（opacity → 0）
2. 左右数字淡出（opacity → 0）
3. MAGI SYSTEM 标题从中间动画移动到顶部（`transform: translateY` 动画）
4. 主界面淡入（opacity → 1）
5. 标题位置与主界面标题重合

**实现方式：** 在 [`boot-sequence.tsx`](magi_front/src/components/module/boot-sequence.tsx) 中新增一个 `transitioning` 阶段，或者直接在 [`boot-nerv-loading.tsx`](magi_front/src/components/module/boot-nerv-loading.tsx) 内部处理过渡动画，完成后调用 `onComplete`。

### 2.7 主界面标题同步

[`magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) 第73行：
```tsx
// 修改前
<h1 className="text-amber-400 text-xl md:text-2xl font-black tracking-[-0.05em] leading-none animate-text-glow">
  MAGI SYSTEM
</h1>

// 修改后
<h1 className="font-black text-center tracking-[-0.05em] leading-none"
    style={{ color: "#DA291C", fontSize: "clamp(2rem, 6vw, 5rem)" }}>
  MAGI SYSTEM
</h1>
```

## 三、修改/创建文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| [`backend/main.py`](backend/main.py) | 修改 | 新增 `/api/health` 端点和 `HealthCheckRequest` 模型 |
| [`magi_front/src/lib/api.ts`](magi_front/src/lib/api.ts) | 修改 | 新增 `healthCheck()` 函数 |
| [`magi_front/src/components/module/boot-nerv-loading.tsx`](magi_front/src/components/module/boot-nerv-loading.tsx) | 重写 | 移除进度条/数字滚动/anykey，新增验证块+状态机+过渡 |
| [`magi_front/src/components/module/magi-page.tsx`](magi_front/src/components/module/magi-page.tsx) | 修改 | 主界面标题改为红色+与二层相同大小 |
| [`magi_front/src/components/module/boot-sequence.tsx`](magi_front/src/components/module/boot-sequence.tsx) | 修改 | 支持新的过渡逻辑（可能新增 transitioning 阶段） |
| [`magi_front/src/app/globals.css`](magi_front/src/app/globals.css) | 修改 | 新增验证闪烁动画 keyframes |

## 四、潜在风险与回退策略

| 风险 | 影响 | 回退策略 |
|------|------|----------|
| `/api/health` 调用超时 | 验证卡住 | 设置 5 秒超时，超时后标记为 error 但仍可继续 |
| AI 模型不可用 | 所有验证失败 | 添加 fallback：如果 API 返回 error，显示红色但允许手动跳过 |
| 过渡动画不流畅 | 视觉卡顿 | 降低动画复杂度，使用简单的 opacity/fade 过渡 |
| 标题位置计算错误 | 标题跳动 | 使用 CSS transition 而非 JS 计算位置 |

## 五、验证方法

1. **后端验证：** `curl -X POST http://localhost:8000/api/health -H "Content-Type: application/json" -d '{"role":"default"}'` 应返回 `{"status":"ok","role":"default"}`
2. **前端验证：** 启动 dev server，观察 SCP → MAGI SYSTEM 验证流程
3. **颜色验证：** 每个验证块在 pending→verifying→verified 过程中颜色是否正确变化
4. **过渡验证：** 点击 TOUCH 后标题是否平滑移动到顶部，主界面是否正确显示
5. **编译验证：** `npx tsc --noEmit` 无类型错误

## 六、实施顺序

1. 后端 `/api/health` 端点
2. 前端 API 层 `healthCheck`
3. 重写 `boot-nerv-loading.tsx`（核心）
4. 修改 `magi-page.tsx` 标题样式
5. 修改 `boot-sequence.tsx` 过渡逻辑
6. 添加 CSS 动画
7. 编译验证 + 端到端测试
