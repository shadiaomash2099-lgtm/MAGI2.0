# backend/config.py

# 定义系统运行的"档位"
# lite: 囊中羞涩时的轻量级辩论，速度快，便宜。
# pro: 需要极其严谨推演时的重装甲，较贵。
# （日后若有如 DeepSeek-Reasoning 等新模型，直接往这里添即可，业务代码无需改动）

MODEL_ROUTER = {
    "lite": {
        "melchior": {"provider": "deepseek", "model": "deepseek-chat"}, # 暂用通用版顶替lite
        "balthasar": {"provider": "kimi", "model": "moonshot-v1-8k"},
        "casper": {"provider": "kimi", "model": "moonshot-v1-8k"}
    },
    "pro": {
        "melchior": {"provider": "deepseek", "model": "deepseek-chat"}, # 日后可替换为更贵的推理模型
        "balthasar": {"provider": "kimi", "model": "moonshot-v1-32k"},  # 使用更长上下文的模型
        "casper": {"provider": "kimi", "model": "moonshot-v1-32k"}
    }
}

# 模型别名映射表（用户友好名称 → 实际 provider/model）
# 前端下拉菜单显示这些别名，后端负责映射
MODEL_ALIASES = {
    "DeepSeek 轻量": {"provider": "deepseek", "model": "deepseek-chat"},
    "Kimi 轻量": {"provider": "kimi", "model": "moonshot-v1-8k"},
    "Kimi 增强": {"provider": "kimi", "model": "moonshot-v1-32k"},
}