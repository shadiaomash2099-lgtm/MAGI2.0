# backend/translator.py
# 简繁转换中间件：将 AI 输出的简体中文转换为香港繁体

from opencc import OpenCC

# 使用 s2hk 配置：简体 → 香港繁体
_converter = OpenCC("s2hk")


def to_hk_traditional(text: str) -> str:
    """将简体中文文本转换为香港繁体"""
    if not text:
        return text
    return _converter.convert(text)
