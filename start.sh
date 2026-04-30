#!/bin/bash
# ============================================================
# MAGI2.0 一键启动脚本 — macOS
# 自动启动后端 + 前端 + 打开浏览器
# 使用方式: ./start.sh
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/magi_front"
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_PID=""
FRONTEND_PID=""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 清理函数：停止所有后台进程
cleanup() {
    echo ""
    echo -e "${YELLOW}⏹  正在停止服务...${NC}"
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
        echo -e "${GREEN}  ✔ 后端已停止${NC}"
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        echo -e "${GREEN}  ✔ 前端已停止${NC}"
    fi
    echo -e "${CYAN}👋 再见${NC}"
    exit 0
}

# 注册退出信号处理
trap cleanup SIGINT SIGTERM EXIT

echo ""
echo -e "${RED}============================================${NC}"
echo -e "${RED}   MAGI 2.0 — NERV 系统启动序列${NC}"
echo -e "${RED}============================================${NC}"
echo ""

# --------------------------------------------------
# 1. 检查 Python 环境
# --------------------------------------------------
echo -e "${YELLOW}[1/4] 检查运行环境...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}  ✖ 未找到 python3，请安装 Python 3.10+${NC}"
    exit 1
fi
echo -e "${GREEN}  ✔ Python $(python3 --version | cut -d' ' -f2)${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}  ✖ 未找到 node，请安装 Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}  ✔ Node $(node --version)${NC}"

# --------------------------------------------------
# 2. 检查依赖
# --------------------------------------------------
echo -e "${YELLOW}[2/4] 检查依赖...${NC}"

# 后端依赖
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "${YELLOW}  ⚡ 创建 Python 虚拟环境...${NC}"
    python3 -m venv "$BACKEND_DIR/venv"
fi
source "$BACKEND_DIR/venv/bin/activate"
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}  ⚡ 安装后端依赖...${NC}"
    pip install -q fastapi uvicorn pydantic httpx
fi
echo -e "${GREEN}  ✔ 后端依赖就绪${NC}"

# 前端依赖
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}  ⚡ 安装前端依赖...${NC}"
    cd "$FRONTEND_DIR" && npm install --silent
fi
echo -e "${GREEN}  ✔ 前端依赖就绪${NC}"

# --------------------------------------------------
# 3. 启动后端
# --------------------------------------------------
echo -e "${YELLOW}[3/4] 启动后端服务...${NC}"
cd "$BACKEND_DIR"
source "$BACKEND_DIR/venv/bin/activate"
uvicorn main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload --log-level warning &
BACKEND_PID=$!

# 等待后端就绪
echo -n "  ⏳ 等待后端就绪"
for i in $(seq 1 30); do
    if curl -s "http://localhost:$BACKEND_PORT/docs" > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}  ✔ 后端已启动 → http://localhost:$BACKEND_PORT${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
if ! curl -s "http://localhost:$BACKEND_PORT/docs" > /dev/null 2>&1; then
    echo ""
    echo -e "${RED}  ✖ 后端启动超时${NC}"
    exit 1
fi

# --------------------------------------------------
# 4. 启动前端 + 打开浏览器
# --------------------------------------------------
echo -e "${YELLOW}[4/4] 启动前端服务...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# 等待前端就绪
echo -n "  ⏳ 等待前端就绪"
for i in $(seq 1 60); do
    if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}  ✔ 前端已启动 → http://localhost:$FRONTEND_PORT${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
if ! curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
    echo ""
    echo -e "${RED}  ✖ 前端启动超时${NC}"
    exit 1
fi

# --------------------------------------------------
# 5. 打开浏览器
# --------------------------------------------------
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   🚀 MAGI 2.0 已就绪${NC}"
echo -e "${CYAN}   ├─ 后端: http://localhost:$BACKEND_PORT${NC}"
echo -e "${CYAN}   ├─ 前端: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${CYAN}   └─ API 文档: http://localhost:$BACKEND_PORT/docs${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "${YELLOW}  正在打开浏览器...${NC}"
open "http://localhost:$FRONTEND_PORT"

echo ""
echo -e "${YELLOW}  按 Ctrl+C 停止所有服务${NC}"
echo ""

# 保持脚本运行
wait
