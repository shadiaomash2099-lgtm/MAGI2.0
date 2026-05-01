// ============================================================
// MAGI2.0 — 启动序列：NERV 加载阶段
// 规则 R5: ≤ 100 行
// 规则 R2: 无 position: absolute/fixed
//
// 设计说明:
//   - NERV 标志巨大化、反转出现，占满屏幕
//   - 左右红色渐变遮罩（100% → 0% 透明度），不挤占中间标志
//   - 大量独立数字实体铺满左右两侧，每个数字自身会变化（跳跃感）
//   - 七段数码管风格（Courier New + text-shadow 发光）
//   - 进度条 + 8 个随机数字滚动
//   - 加载完成后需任意键盘输入才进入下一阶段
// ============================================================

"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const NERV_RED = "#DA291C";
const DARK_RED = "#8B0000";

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

// 生成一组数字实体
function createDigitGroup(cols: number, rows: number, idRef: React.MutableRefObject<number>): DigitCell[] {
  const group: DigitCell[] = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const id = idRef.current++;
      const size = 8 + Math.floor(Math.random() * 29); // 8px ~ 36px
      const delay = Math.random() * 3000;
      group.push({ id, col, row, size, delay });
    }
  }
  return group;
}

export function BootNervLoading({ onComplete }: BootNervLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [numberRolls, setNumberRolls] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 每个数字层独立的数据
  const [leftGroups, setLeftGroups] = useState<DigitCell[][]>([]);
  const [rightGroups, setRightGroups] = useState<DigitCell[][]>([]);
  const [digitValues, setDigitValues] = useState<Record<number, string>>({});
  const [digitOffsets, setDigitOffsets] = useState<Record<number, number>>({});
  const idRef = useRef(0);
  const digitValuesRef = useRef<Record<number, string>>({});
  const digitOffsetsRef = useRef<Record<number, number>>({});

  const COLS = 5;
  const ROWS = 16;
  const LAYERS = 4; // 原内容 + 3个复制层

  // 初始化所有数字层 + 随机初始偏移
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

  // 数字值变化 + 上下偏移跳变（连续浮动感，无 transition 实现跳跃）
  useEffect(() => {
    const allDigits = [...leftGroups.flat(), ...rightGroups.flat()];
    const timers: ReturnType<typeof setTimeout>[] = [];

    allDigits.forEach((d) => {
      const tick = () => {
        const nextVal = Math.floor(Math.random() * 10).toString();
        digitValuesRef.current[d.id] = nextVal;
        setDigitValues((prev) => ({ ...prev, [d.id]: nextVal }));

        // 随机上下偏移 -15px ~ +15px，无 transition 实现跳跃感
        const nextOffset = (Math.random() - 0.5) * 30;
        digitOffsetsRef.current[d.id] = nextOffset;
        setDigitOffsets((prev) => ({ ...prev, [d.id]: nextOffset }));

        const nextDelay = 150 + Math.random() * 450;
        timers.push(setTimeout(tick, nextDelay));
      };
      timers.push(setTimeout(tick, d.delay));
    });

    return () => timers.forEach(clearTimeout);
  }, [leftGroups, rightGroups]);

  // 进度条递增 + 数字滚动
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(numberInterval);
          setLoaded(true);
          return 100;
        }
        return next;
      });
    }, 75);

    const numberInterval = setInterval(() => {
      setNumberRolls((prev) =>
        prev.map(() =>
          Math.floor(Math.random() * 100).toString().padStart(2, "0")
        )
      );
    }, 200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(numberInterval);
    };
  }, []);

  // 键盘输入
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (loaded) onComplete();
    },
    [loaded, onComplete]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  // 渲染一组数字列（可复用，带偏移）
  // 使用 grid 布局使多个 group 重叠在同一区域，避免 position: absolute
  const renderDigitGroup = (digits: DigitCell[], dx: number = 0, dy: number = 0) => (
    <div
      className="flex flex-row items-stretch pointer-events-none"
      style={{
        width: "20vw",
        minWidth: "20vw",
        height: "100%",
        transform: `translate(${dx}px, ${dy}px)`,
      }}
    >
      {Array.from({ length: 5 }, (_, i) => renderDigitCol(digits, i))}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-row items-stretch overflow-hidden bg-black nerv-loading-container">

      {/* 左侧数字区域 — 原内容 + 复制偏移层 */}
      {/* 使用 grid 布局使多个 group 重叠在同一区域 */}
      <div
        className="grid pointer-events-none"
        style={{
          width: "20vw",
          minWidth: "20vw",
          height: "100%",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
        }}
      >
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[0] ?? [], 0, 0)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[1] ?? [], 20, 8)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[2] ?? [], 40, -6)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(leftGroups[3] ?? [], 60, 12)}</div>
      </div>

      {/* 中间主内容 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* NERV 标志 */}
        <div className="animate-nerv-appear flex flex-col items-center">
          <img
            src="/nerv-emblem.svg"
            alt="NERV"
            className="select-none pointer-events-none"
            style={{
              width: "min(60vw, 60vh)",
              height: "min(60vw, 60vh)",
              color: NERV_RED,
            }}
          />
          <div
            className="font-black text-center mt-4 tracking-[-0.05em]"
            style={{
              color: NERV_RED,
              fontSize: "clamp(2rem, 6vw, 5rem)",
            }}
          >
            NERV
          </div>
        </div>

        {/* 加载条 */}
        <div className="w-[360px] mt-8">
          <div className="flex h-[3px] bg-white/10 overflow-hidden">
            <div
              className="transition-all duration-75 ease-linear"
              style={{ width: `${progress}%`, backgroundColor: NERV_RED }}
            />
          </div>
          <div
            className="text-[16px] text-right mt-2 font-mono tracking-[-0.05em]"
            style={{ color: NERV_RED }}
          >
            {progress}%
          </div>
        </div>

        {/* 数字滚动 */}
        <div
          className="flex gap-3 font-mono text-[16px] opacity-70 mt-4"
          style={{ color: NERV_RED }}
        >
          {numberRolls.map((num, i) => (
            <div
              key={i}
              className="animate-number-roll"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* 按任意键继续 */}
        {loaded && (
          <div
            className="mt-8 text-[16px] font-mono tracking-[-0.05em] animate-pulse"
            style={{ color: NERV_RED }}
          >
            PRESS ANY KEY TO CONTINUE
          </div>
        )}
      </div>

      {/* 右侧数字区域 — 原内容 + 复制偏移层 */}
      <div
        className="grid pointer-events-none"
        style={{
          width: "20vw",
          minWidth: "20vw",
          height: "100%",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
        }}
      >
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[0] ?? [], 0, 0)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[1] ?? [], -20, 10)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[2] ?? [], -40, -8)}</div>
        <div className="col-start-1 row-start-1">{renderDigitGroup(rightGroups[3] ?? [], -60, 14)}</div>
      </div>

    </div>
  );
}
