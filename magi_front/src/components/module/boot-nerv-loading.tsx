// ============================================================
// MAGI2.0 — 启动序列：MAGI SYSTEM 验证阶段
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed
//
// 设计说明:
//   - NERV 标志 + MAGI SYSTEM 标题固定在顶部，翻转进入
//   - 左右浮动数字系统保留（七段数码管风格）
//   - 移除进度条、数字滚动、anykey 提示
//   - 三贤者验证块呈三角形排列（Melchior 在上，Balthasar/Casper 在下）
//   - 翻转动画完成后验证块才浮现
//   - 验证通过后下方浮现"這裡沒有逆模因部"（浮动在验证框下方，不挤开布局）
//   - 点击后标题上移过渡到主界面
// ============================================================

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { healthCheck } from "@/lib/api";

const NERV_RED = "#DA291C";
const DARK_RED = "#8B0000";
const YELLOW_BORDER = "#c0843c";
const SKY_BLUE = "#00d4ff";
const BLUE_BG = "rgba(0,100,200,0.15)";
const SKY_BLUE_BG = "rgba(0,212,255,0.3)";

type BlockStatus = "pending" | "verifying" | "verified" | "error";

interface VerifyBlock {
  role: string;
  label: string;
  status: BlockStatus;
}

interface DigitCell {
  id: number;
  col: number;
  row: number;
  size: number;
  delay: number;
}

interface BootNervLoadingProps {
  onComplete: () => void;
}

function createDigitGroup(cols: number, rows: number, idRef: React.MutableRefObject<number>): DigitCell[] {
  const group: DigitCell[] = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const id = idRef.current++;
      const size = 8 + Math.floor(Math.random() * 29);
      const delay = Math.random() * 3000;
      group.push({ id, col, row, size, delay });
    }
  }
  return group;
}

export function BootNervLoading({ onComplete }: BootNervLoadingProps) {
  // 数字系统
  const [leftGroups, setLeftGroups] = useState<DigitCell[][]>([]);
  const [rightGroups, setRightGroups] = useState<DigitCell[][]>([]);
  const [digitValues, setDigitValues] = useState<Record<number, string>>({});
  const [digitOffsets, setDigitOffsets] = useState<Record<number, number>>({});
  const idRef = useRef(0);
  const digitValuesRef = useRef<Record<number, string>>({});
  const digitOffsetsRef = useRef<Record<number, number>>({});

  // 三贤者验证块 — 三角形排列（Melchior 上，Balthasar/Casper 下）
  const [blocks, setBlocks] = useState<VerifyBlock[]>([
    { role: "melchior", label: "MELCHIOR", status: "pending" },
    { role: "balthasar", label: "BALTHASAR", status: "pending" },
    { role: "casper", label: "CASPER", status: "pending" },
  ]);
  const [showTouch, setShowTouch] = useState(false);
  const [appearPhase, setAppearPhase] = useState<"hidden" | "appearing" | "visible">("hidden");
  const [transitionPhase, setTransitionPhase] = useState<"none" | "fade-out" | "title-up" | "done">("none");
  const verifyStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const COLS = 5;
  const ROWS = 16;
  const LAYERS = 4;

  // 进入翻转动画
  useEffect(() => {
    setAppearPhase("appearing");
    const timer = setTimeout(() => {
      setAppearPhase("visible");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // 初始化数字层
  useEffect(() => {
    const leftLayers: DigitCell[][] = [];
    const rightLayers: DigitCell[][] = [];
    const values: Record<number, string> = {};
    const offsets: Record<number, number> = {};

    for (let layer = 0; layer < LAYERS; layer++) {
      const leftGroup = createDigitGroup(COLS, ROWS, idRef);
      const rightGroup = createDigitGroup(COLS, ROWS, idRef);
      leftGroup.forEach((d) => {
        values[d.id] = Math.floor(Math.random() * 10).toString();
        offsets[d.id] = (Math.random() - 0.5) * 20;
      });
      rightGroup.forEach((d) => {
        values[d.id] = Math.floor(Math.random() * 10).toString();
        offsets[d.id] = (Math.random() - 0.5) * 20;
      });
      leftLayers.push(leftGroup);
      rightLayers.push(rightGroup);
    }

    digitValuesRef.current = values;
    digitOffsetsRef.current = offsets;
    setLeftGroups(leftLayers);
    setRightGroups(rightLayers);
    setDigitValues(values);
    setDigitOffsets(offsets);
  }, []);

  // 数字跳动
  useEffect(() => {
    const allLeft = leftGroups.flat();
    const allRight = rightGroups.flat();
    if (allLeft.length === 0 && allRight.length === 0) return;
    const allDigits = [...allLeft, ...allRight];
    const timers: ReturnType<typeof setTimeout>[] = [];

    allDigits.forEach((d) => {
      const tick = () => {
        const nextVal = Math.floor(Math.random() * 10).toString();
        digitValuesRef.current[d.id] = nextVal;
        setDigitValues((prev) => ({ ...prev, [d.id]: nextVal }));
        const nextOffset = (Math.random() - 0.5) * 30;
        digitOffsetsRef.current[d.id] = nextOffset;
        setDigitOffsets((prev) => ({ ...prev, [d.id]: nextOffset }));
        const nextDelay = 150 + Math.random() * 450;
        timers.push(setTimeout(tick, nextDelay));
      };
      timers.push(setTimeout(tick, d.delay));
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftGroups.length > 0, rightGroups.length > 0]);

  // 验证流程 — 等待翻转动画完成后才开始
  useEffect(() => {
    if (verifyStartedRef.current) return;
    verifyStartedRef.current = true;

    const verifyRole = async (role: string, blockIdx: number): Promise<boolean> => {
      setBlocks((prev) => prev.map((b, i) => (i === blockIdx ? { ...b, status: "verifying" } : b)));
      await new Promise((r) => setTimeout(r, 300));
      try {
        const result = await healthCheck(role);
        if (result.status === "ok") {
          setBlocks((prev) => prev.map((b, i) => (i === blockIdx ? { ...b, status: "verified" } : b)));
          return true;
        } else {
          setBlocks((prev) => prev.map((b, i) => (i === blockIdx ? { ...b, status: "error" } : b)));
          return false;
        }
      } catch {
        setBlocks((prev) => prev.map((b, i) => (i === blockIdx ? { ...b, status: "error" } : b)));
        return false;
      }
    };

    const runSequence = async () => {
      // 等待翻转动画完成（1.2s）后再等 300ms 让验证块浮现
      await new Promise((r) => setTimeout(r, 1500));

      // 1. Melchior（上）
      await verifyRole("melchior", 0);
      await new Promise((r) => setTimeout(r, 500));

      // 2. Balthasar（左下）
      await verifyRole("balthasar", 1);
      await new Promise((r) => setTimeout(r, 500));

      // 3. Casper（右下）
      await verifyRole("casper", 2);
      await new Promise((r) => setTimeout(r, 500));

      setShowTouch(true);
    };

    runSequence();
  }, []);

  // 处理点击"这里没有逆模因部"
  const handleTouch = useCallback(() => {
    setTransitionPhase("fade-out");
    setTimeout(() => {
      setTransitionPhase("title-up");
      setTimeout(() => {
        setTransitionPhase("done");
        onCompleteRef.current();
      }, 800);
    }, 600);
  }, []);

  // 渲染数字列
  const renderDigitCol = (digits: DigitCell[], colIdx: number) => (
    <div key={colIdx} className="flex flex-col items-center justify-between flex-1">
      {digits
        .filter((d) => d.col === colIdx)
        .sort((a, b) => a.row - b.row)
        .map((d) => (
          <span
            key={d.id}
            className="font-mono font-bold leading-none select-none"
            style={{
              fontSize: d.size,
              color: DARK_RED,
              opacity: 0.25 + Math.random() * 0.55,
              textShadow: "0 0 4px currentColor, 0 0 8px currentColor",
              letterSpacing: "0.05em",
              transform: `translateY(${digitOffsets[d.id] ?? 0}px)`,
            }}
          >
            {digitValues[d.id] ?? "0"}
          </span>
        ))}
    </div>
  );

  const renderDigitGroup = (digits: DigitCell[], dx: number = 0, dy: number = 0) => (
    <div
      className="flex flex-row items-stretch pointer-events-none"
      style={{
        width: "20vw",
        minWidth: "20vw",
        height: "100%",
        transform: `translate(${dx}px, ${dy}px)`,
        opacity: transitionPhase === "none" ? 1 : 0,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {Array.from({ length: 5 }, (_, i) => renderDigitCol(digits, i))}
    </div>
  );

  const getBlockStyle = (status: BlockStatus) => {
    switch (status) {
      case "pending":
        return { borderColor: YELLOW_BORDER, backgroundColor: BLUE_BG, boxShadow: "none" };
      case "verifying":
        return { borderColor: YELLOW_BORDER, backgroundColor: BLUE_BG, animation: "verify-blink 0.6s ease-in-out infinite" };
      case "verified":
        return { borderColor: SKY_BLUE, backgroundColor: SKY_BLUE_BG, boxShadow: `0 0 8px ${SKY_BLUE}` };
      case "error":
        return { borderColor: "#ff3333", backgroundColor: "rgba(255, 50, 50, 0.15)", boxShadow: "none" };
    }
  };

  const renderVerifyBlock = (block: VerifyBlock, index: number) => {
    const style = getBlockStyle(block.status);
    return (
      <div
        key={block.role}
        className="flex flex-col items-center justify-center px-8 py-12"
        style={{
          width: "260px",
          border: `2px solid ${style.borderColor}`,
          backgroundColor: style.backgroundColor,
          boxShadow: style.boxShadow,
          animation: style.animation || "none",
          transition: "all 0.5s ease-out",
          transitionDelay: `${index * 0.1}s`,
        }}
      >
        <div
          className="font-black text-[28px] tracking-[-0.05em] leading-none"
          style={{
            color: block.status === "verified" ? SKY_BLUE : block.status === "error" ? "#ff3333" : YELLOW_BORDER,
            transition: "color 0.5s ease-out",
          }}
        >
          {block.label}
        </div>
      </div>
    );
  };

  // 翻转动画样式
  const getAppearStyle = (delay: number = 0) => ({
    opacity: appearPhase === "hidden" ? 0 : 1,
    transform:
      appearPhase === "hidden"
        ? "rotateX(180deg) scale(0.3)"
        : "rotateX(0deg) scale(1)",
    transition: `all 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  // 验证块浮现样式 — 翻转完成后才显示
  const getBlocksAppearStyle = () => ({
    opacity: appearPhase === "visible" ? 1 : 0,
    transform: appearPhase === "visible" ? "translateY(0)" : "translateY(30px)",
    transition: "all 0.6s ease-out 0.3s",
  });

  return (
    <div className="w-full h-full flex flex-row items-stretch overflow-hidden bg-black nerv-loading-container">
      {/* 左侧数字 */}
      <div className="grid pointer-events-none" style={{ width: "20vw", minWidth: "20vw", height: "100%", gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[0] ?? [], 0, 0)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[1] ?? [], 20, 8)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[2] ?? [], 40, -6)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[3] ?? [], 60, 12)}</div>
      </div>

      {/* 中间 */}
      <div className="flex-1 flex flex-col items-center overflow-hidden">
        {/* NERV 标志 + MAGI SYSTEM 标题（一起翻转进入） */}
        <div style={getAppearStyle(0)}>
          {/* NERV 标志 */}
          <div
            className="flex flex-col items-center shrink-0"
            style={{
              marginTop: "clamp(20px, 4vh, 60px)",
              opacity: transitionPhase === "fade-out" || transitionPhase === "title-up" ? 0 : 1,
              transition: "opacity 0.6s ease-out",
            }}
          >
            <img src="/nerv-emblem.svg" alt="NERV" className="select-none pointer-events-none" style={{ width: "min(30vw, 25vh)", height: "min(30vw, 25vh)", color: NERV_RED }} />
          </div>

          {/* MAGI SYSTEM 标题 */}
          <div
            className="font-black text-center tracking-[-0.05em] leading-none shrink-0"
            style={{
              color: NERV_RED,
              fontSize: "clamp(2rem, 6vw, 5rem)",
              marginTop: transitionPhase === "title-up" || transitionPhase === "done" ? "clamp(8px, 1.5vh, 20px)" : "clamp(12px, 2vh, 24px)",
              marginBottom: transitionPhase === "title-up" || transitionPhase === "done" ? "0" : "clamp(16px, 3vh, 40px)",
              transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              opacity: transitionPhase === "fade-out" ? 0 : 1,
            }}
          >
            MAGI SYSTEM
          </div>
        </div>

        {/* 三贤者验证块 — 三角形排列（翻转完成后才浮现） */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            ...getBlocksAppearStyle(),
          }}
        >
          {/* 上层：Melchior */}
          <div className="mb-5">
            {renderVerifyBlock(blocks[0], 0)}
          </div>
          {/* 下层：Balthasar + Casper */}
          <div className="flex flex-row items-center justify-center gap-10">
            {renderVerifyBlock(blocks[1], 1)}
            {renderVerifyBlock(blocks[2], 2)}
          </div>
        </div>

        {/* "這裡沒有逆模因部" — 验证完成后浮动在距底边 1/3 处，不挤开布局 */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            opacity: showTouch ? 1 : 0,
            transition: "all 0.6s ease-out",
            pointerEvents: showTouch ? "auto" : "none",
            height: 0,
            overflow: "visible",
            transform: showTouch ? "translateY(120px)" : "translateY(100px)",
          }}
        >
          <button
            onClick={handleTouch}
            className="cursor-pointer select-none animate-pulse hover:scale-110 transition-transform"
            style={{
              color: NERV_RED,
              fontSize: "64px",
              fontFamily: "'Matisse Pro', 'Noto Sans SC', sans-serif",
              letterSpacing: "-0.1em",
              fontWeight: "900",
              background: "none",
              border: "none",
              padding: "12px 48px",
              textShadow: `0 0 10px ${NERV_RED}, 0 0 20px ${NERV_RED}`,
            }}
          >
            這裡沒有逆模因部
          </button>
        </div>
      </div>

      {/* 右侧数字 */}
      <div className="grid pointer-events-none" style={{ width: "20vw", minWidth: "20vw", height: "100%", gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[0] ?? [], 0, 0)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[1] ?? [], -20, 10)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[2] ?? [], -40, -8)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[3] ?? [], -60, 14)}</div>
      </div>
    </div>
  );
}
