# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import re
from backend.prompts import MELCHIOR_PROMPT, BALTHASAR_PROMPT, CASPER_PROMPT, SUMMARIZE_PROMPT
from backend.agent_core import stream_call_agent, _call_agent
from backend.translator import to_hk_traditional

app = FastAPI()

# CORS: 允许 Next.js 开发服务器 (localhost:3000) 跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# 军机处文书格式大升级，接纳史官卷宗与用户锦囊
class DebateRequest(BaseModel):
    topic: str
    tier: str = "lite"
    history: str = ""       # 史官记录的历史战报
    directive: str = ""     # 用户的方向控制锦囊
    model_choice: dict = {} # 用户选择的模型别名，如 {"melchior": "DeepSeek 轻量", ...}

class SummarizeRequest(BaseModel):
    history: str            # 辩论历史文本
    topic: str              # 原议题

class HealthCheckRequest(BaseModel):
    role: str               # 角色名称（default/melchior/balthasar/casper）

@app.post("/api/health")
async def health_check(request: HealthCheckRequest):
    """
    轻量级连接验证：尝试调用对应角色的 AI 模型，返回连接状态。
    用于启动序列中的三贤者验证环节。
    """
    try:
        result = _call_agent(request.role, "请回复OK", "", "lite")
        return {"status": "ok", "role": request.role}
    except Exception as e:
        return {"status": "error", "role": request.role, "message": str(e)}

@app.post("/api/stream_debate")
async def stream_debate(request: DebateRequest):
    topic = request.topic
    tier = request.tier
    history = request.history
    directive = request.directive
    model_choice = request.model_choice

    def event_generator():
        # 判断是新开一局，还是接着吵
        is_continue = bool(history)

        if is_continue:
            yield f"data: {json.dumps({'type': 'sys', 'content': to_hk_traditional(f'收到用户锦囊：【{directive}】，基于历史战报开启新一轮推演...')})}\n\n"
            # 给梅尔基奥尔下达包含历史和锦囊的“连环计”
            topic_for_melchior = f"原议题：{topic}\n\n【此前多方的历史辩论记录】：\n{history}\n\n【用户最新最高指示】：{directive}\n\n请你作为梅尔基奥尔，严格顺着用户的最新指示，结合历史记录，抛出你新一轮的结构主义暴论！"
        else:
            yield f"data: {json.dumps({'type': 'sys', 'content': to_hk_traditional(f'新议题已呈上：【{topic}】')})}\n\n"
            topic_for_melchior = topic

        # ---------------- 1. 梅尔基奥尔上阵 ----------------
        yield f"data: {json.dumps({'type': 'sys', 'content': to_hk_traditional('[梅尔基奥尔] ...')})}\n\n"
        yield f"data: {json.dumps({'type': 'start', 'role': 'melchior'})}\n\n"
        ans_m = ""
        for chunk in stream_call_agent("melchior", MELCHIOR_PROMPT, topic_for_melchior, tier, model_choice.get("melchior")):
            ans_m += chunk
            yield f"data: {json.dumps({'type': 'chunk', 'content': to_hk_traditional(chunk)})}\n\n"
        # 解析梅尔基奥尔的表态
        verdict_m = re.search(r'\[VERDICT\](承认|否认|疑虑)', ans_m)
        if verdict_m:
            yield f"data: {json.dumps({'type': 'verdict', 'role': 'melchior', 'verdict': to_hk_traditional(verdict_m.group(1))})}\n\n"

        # ---------------- 2. 巴尔塔萨上阵 ----------------
        yield f"data: {json.dumps({'type': 'sys', 'content': to_hk_traditional('[巴尔塔萨] ...')})}\n\n"
        yield f"data: {json.dumps({'type': 'start', 'role': 'balthasar'})}\n\n"
        if is_continue:
            attack_topic = f"原议题：{topic}。用户刚刚下达了指示：{directive}。基于此，梅尔基奥尔刚刚大放厥词：{ans_m}。请你从巴尔塔萨的角度，反驳梅尔基奥尔的冰冷推演。"
        else:
            attack_topic = f"针对议题：{topic}。梅尔基奥尔说：{ans_m}。请反驳。"
            
        ans_b = ""
        for chunk in stream_call_agent("balthasar", BALTHASAR_PROMPT, attack_topic, tier, model_choice.get("balthasar")):
            ans_b += chunk
            yield f"data: {json.dumps({'type': 'chunk', 'content': to_hk_traditional(chunk)})}\n\n"
        # 解析巴尔塔萨的表态
        verdict_b = re.search(r'\[VERDICT\](承认|否认|疑虑)', ans_b)
        if verdict_b:
            yield f"data: {json.dumps({'type': 'verdict', 'role': 'balthasar', 'verdict': to_hk_traditional(verdict_b.group(1))})}\n\n"

        # ---------------- 3. 卡斯帕上阵 ----------------
        yield f"data: {json.dumps({'type': 'sys', 'content': to_hk_traditional('[卡斯帕] :')})}\n\n"
        yield f"data: {json.dumps({'type': 'start', 'role': 'casper'})}\n\n"
        if is_continue:
            mad_topic = f"原议题：{topic}。用户指示：{directive}。针对用户的指示，梅尔基奥尔说：{ans_m}。巴尔塔萨反驳：{ans_b}。请你嘲笑他们两人的迂腐，给出破坏性的暴论！"
        else:
            mad_topic = f"议题：{topic}。梅尔基奥尔说：{ans_m}。巴尔塔萨说：{ans_b}。请给出破坏性暴论！"
            
        ans_c = ""
        for chunk in stream_call_agent("casper", CASPER_PROMPT, mad_topic, tier, model_choice.get("casper")):
            ans_c += chunk
            yield f"data: {json.dumps({'type': 'chunk', 'content': to_hk_traditional(chunk)})}\n\n"
        # 解析卡斯帕的表态
        verdict_c = re.search(r'\[VERDICT\](承认|否认|疑虑)', ans_c)
        if verdict_c:
            yield f"data: {json.dumps({'type': 'verdict', 'role': 'casper', 'verdict': to_hk_traditional(verdict_c.group(1))})}\n\n"

        # 收兵
        yield f"data: {json.dumps({'type': 'sys', 'content': to_hk_traditional('MAGI结论已完成')})}\n\n"
        yield "event: end\ndata: {}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/summarize")
async def summarize(request: SummarizeRequest):
    """
    军机处卷宗整理：接收辩论历史，调用 AI 生成结构化总结。
    返回 JSON: { summary: str, verdicts: { melchior: str, balthasar: str, casper: str } }
    """
    # 组装给 AI 的输入：议题 + 辩论历史
    input_text = f"议题：{request.topic}\n\n辩论记录：\n{request.history}"

    try:
        result = _call_agent("melchior", SUMMARIZE_PROMPT, input_text, "lite")
        # 尝试解析 AI 返回的 JSON
        # 先清理可能的 markdown 代码块标记
        cleaned = result.strip()
        if cleaned.startswith("```"):
            # 移除 ```json 或 ``` 包裹
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)

        parsed = json.loads(cleaned)
        # 将总结和表态内容转换为香港繁体
        if "summary" in parsed:
            parsed["summary"] = to_hk_traditional(parsed["summary"])
        if "verdicts" in parsed:
            for role in parsed["verdicts"]:
                parsed["verdicts"][role] = to_hk_traditional(parsed["verdicts"][role])
        return parsed
    except json.JSONDecodeError:
        # 如果 AI 返回的不是合法 JSON，返回错误信息
        return {
            "summary": to_hk_traditional(result),
            "verdicts": {
                "melchior": to_hk_traditional("总结生成失败：AI 返回格式异常"),
                "balthasar": to_hk_traditional("总结生成失败：AI 返回格式异常"),
                "casper": to_hk_traditional("总结生成失败：AI 返回格式异常")
            }
        }
    except Exception as e:
        return {
            "summary": to_hk_traditional(f"总结生成失败：{str(e)}"),
            "verdicts": {
                "melchior": to_hk_traditional(f"总结生成失败：{str(e)}"),
                "balthasar": to_hk_traditional(f"总结生成失败：{str(e)}"),
                "casper": to_hk_traditional(f"总结生成失败：{str(e)}")
            }
        }
