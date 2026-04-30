# backend/agent_core.py
import os
from dotenv import load_dotenv
from openai import OpenAI

from backend.prompts import MELCHIOR_PROMPT, BALTHASAR_PROMPT, CASPER_PROMPT
from backend.config import MODEL_ROUTER, MODEL_ALIASES # 引入路由表和别名映射

load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
KIMI_API_KEY = os.getenv("KIMI_API_KEY") 

# 预先备好所有的 Client 兵符
clients = {
    "deepseek": OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com"),
    "kimi": OpenAI(api_key=KIMI_API_KEY, base_url="https://api.moonshot.cn/v1")
}

# 军师锦囊：打造一个通用的"代将出征"函数，消灭重复代码！
def _call_agent(agent_name, prompt, topic, tier="lite", model_alias=None):
    try:
        # 优先使用用户选择的模型别名，否则使用档位默认路由
        if model_alias and model_alias in MODEL_ALIASES:
            route_info = MODEL_ALIASES[model_alias]
        else:
            route_info = MODEL_ROUTER[tier][agent_name]
        provider = route_info["provider"]
        model_name = route_info["model"]
        
        client = clients[provider]
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": topic}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"【{agent_name} 宕机 / 可能是该档位 API 额度不足或网络异常】: {e}"

# 三位大将的对外接口，如今只需透传 tier（档位）参数即可
def ask_melchior(topic, tier="lite"):
    return _call_agent("melchior", MELCHIOR_PROMPT, topic, tier)

def ask_balthasar(topic, tier="lite"):
    return _call_agent("balthasar", BALTHASAR_PROMPT, topic, tier)

def ask_casper(topic, tier="lite"):
    return _call_agent("casper", CASPER_PROMPT, topic, tier)

# backend/agent_core.py (在文件末尾追加，或放在原 _call_agent 下方)

def stream_call_agent(agent_name, prompt, topic, tier="lite", model_alias=None):
    """流式调兵法：一边想，一边将字词源源不断地吐出"""
    # 优先使用用户选择的模型别名，否则使用档位默认路由
    if model_alias and model_alias in MODEL_ALIASES:
        route_info = MODEL_ALIASES[model_alias]
    else:
        route_info = MODEL_ROUTER[tier][agent_name]
    client = clients[route_info["provider"]]
    
    try:
        response = client.chat.completions.create(
            model=route_info["model"],
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": topic}
            ],
            stream=True  # 军师核心秘技：开启水龙头！
        )
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"\n【{agent_name} 宕机】: {e}"