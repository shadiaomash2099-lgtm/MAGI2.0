const startBtn = document.getElementById('startBtn');
const topicInput = document.getElementById('topicInput');
const logsContainer = document.getElementById('logsContainer');
const video = document.getElementById('catMouseVideo');
const tierSelect = document.getElementById('tierSelect');

// 督战台控件
const actionPanel = document.getElementById('actionPanel');
const directionBox = document.getElementById('directionBox');
const directionInput = document.getElementById('directionInput');

// 【隐形史官】：专门记录纯净的对话历史
let debateHistory = ""; 
// 用户的锦囊（方向控制）
let masterDirective = "";

// isContinue 参数用来判断是“新开一局”还是“接着吵”
async function startDebate(isContinue = false) {
    const topic = topicInput.value.trim();
    const tier = tierSelect.value; 
    
    // 如果是新开一局，清空史官的记录和战场
    if (!isContinue) {
        if (!topic) return;
        logsContainer.innerHTML = '';
        debateHistory = `初始议题：${topic}\n`; 
        masterDirective = ""; 
    }

    // 封锁输入，隐藏督战台，播放视频
    startBtn.disabled = true;
    actionPanel.style.display = 'none';
    directionBox.style.display = 'none';
    video.play().catch(e => console.log("视频自动播放受限"));

    // 组装公文：如果是继续，就要把史官的记录和用户的锦囊一起送去
    const payload = {
        topic: topic,
        tier: tier,
        history: isContinue ? debateHistory : "",
        directive: masterDirective
    };

try {
        const response = await fetch('/api/stream_debate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let currentBubble = null;
        let currentRawText = ""; // 记录当前角色的原始 Markdown 文本

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); 

            for (const line of lines) {
                if (line.startsWith('event: end')) {
                    startBtn.disabled = false;
                    video.pause();
                    actionPanel.style.display = 'block'; 
                    return;
                }
                if (line.startsWith('data: ')) {
                    const dataStr = line.substring(6);
                    if (!dataStr) continue;
                    const data = JSON.parse(dataStr);

                    if (data.type === 'sys') {
                        const div = document.createElement('div');
                        div.className = 'log-entry log-sys';
                        div.textContent = data.content;
                        logsContainer.appendChild(div);
                        currentBubble = null;
                        scrollToBottom(); // 系统提示强制滚动，提醒主公新阶段开始
                    } else if (data.type === 'start') {
                        currentRawText = ""; // 新人上阵，清空草稿
                        currentBubble = document.createElement('div');
                        currentBubble.className = `log-entry log-${data.role}`;
                        logsContainer.appendChild(currentBubble);
                        
                        // 史官动笔
                        let speakerName = data.role === 'melchior' ? '科学家' : (data.role === 'balthasar' ? '母亲' : '卡斯帕');
                        debateHistory += `\n[${speakerName}]: `;
                    } else if (data.type === 'chunk' && currentBubble) {
                        // 1. 累加原始文本
                        currentRawText += data.content;
                        debateHistory += data.content;

                        // 2. 探查：在更新内容前，主公是否在“阵前”（底部）？
                        // 亮设下 50 像素的容错余量
                        const isAtBottom = logsContainer.scrollHeight - logsContainer.clientHeight <= logsContainer.scrollTop + 50;

                        // 3. 渲染：将 Markdown 转化为精美 HTML
                        currentBubble.innerHTML = marked.parse(currentRawText);

                        // 4. 定风波：只有当主公在底部时，才自动随新字滚动
                        if (isAtBottom) {
                            logsContainer.scrollTop = logsContainer.scrollHeight;
                        }
                    }
                }
            }
        }
    } catch (error) {
        addLog('【系统故障】联络中断或水管爆裂', 'log-sys');
        startBtn.disabled = false;
        video.pause();
    }
}

function scrollToBottom() {
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function addLog(text, className) {
    const div = document.createElement('div');
    div.className = `log-entry ${className}`;
    div.textContent = text;
    logsContainer.appendChild(div);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// ================= 督战台三大将令逻辑 =================

// 1. 继续辩论：不清理战场，直接带着历史文本再次发兵
function onContinue() {
    addLog(">>> 用户下令：大军继续交锋！", "log-sys");
    startDebate(true);
}

// 2. 方向控制：展开锦囊输入框
function onDirect() {
    directionBox.style.display = directionBox.style.display === 'none' ? 'flex' : 'none';
}

// 2.1 确认注入锦囊
function confirmDirection() {
    const directive = directionInput.value.trim();
    if (directive) {
        masterDirective = directive; // 存入全局变量
        addLog(`>>> 已挂载用户锦囊：【${directive}】`, "log-sys");
        directionInput.value = "";
        directionBox.style.display = 'none';
    }
}

// 3. 归纳整理：呼叫后续的后端 Markdown 生成接口 (暂为占位)
async function onArchive() {
    addLog(">>> 用户下令：史官正在整理卷宗...", "log-sys");
    actionPanel.style.display = 'none'; // 整理期间隐藏督战台
    
    // 此处日后将联络后端的 /api/archive 接口
    // 假装后端花了1秒钟处理
    setTimeout(() => {
        addLog(">>> 卷宗整理完毕，已封存入库！(需后续配合后端实现)", "log-sys");
        actionPanel.style.display = 'block';
    }, 1000);
}