// 全局变量
let currentChat = null;
let copyInProgress = false;
let debugMode = false; // 控制是否显示调试信息

// HTML转义函数
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        // 保留emoji和其他Unicode字符
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(match) {
            return encodeURIComponent(match);
        })
        // 保留换行和空格
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
}

// 添加调试输出函数
function debugLog(title, content) {
    if (debugMode) {
        console.log(`[Debug] ${title}:`);
//        console.log(content);
    }
}

// 创建新对话
function createNewChat() {
//    console.log('Creating new chat');
    currentChat = ChatManager.create();
    renderChat();
}

// 加载指定对话
function loadChat(chatId) {
//    console.log('Loading chat:', chatId);
    currentChat = ChatManager.get(chatId);
    renderChat();
}

//// 渲染消息内容
//function renderMessageContent(content, role) {
//    debugLog('Original content', content);
//
//    // 用户消息保持简单渲染
//    if (role === 'user') {
//        const formattedContent = content
//            .replace(/\\n/g, '<br>')
//            .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
//            .replace(/\\r/g, '')
//            .replace(/\\"/g, '"')
//            .replace(/\\'/g, "'");
//
//        return `<div class="message-content" data-content="${escapeHtml(content)}">
//            ${formattedContent}
//            <div class="message-actions">
//                <button class="message-action-button" onclick="copyMessage(this.parentElement.parentElement)">复制</button>
//            </div>
//        </div>`;
//    }
//
//    try {
//        // 处理AI回复
//        let thinkingContent = '';
//        let mainContent = content;
//
//        // 匹配thinking内容
//        const thinkingPatterns = [
//            /```thinking\n([\s\S]*?)\n```/,
//            /<think>([\s\S]*?)<\/think>/,
//            /<thinking>([\s\S]*?)<\/thinking>/
//        ];
//
//        for (const pattern of thinkingPatterns) {
//            const match = content.match(pattern);
//            if (match) {
//                thinkingContent = match[1].trim();
//                mainContent = content.replace(match[0], '').trim();
//                break;
//            }
//        }
//
//        // 处理转义字符
//        mainContent = mainContent
//            .replace(/\\n/g, '\n')
//            .replace(/\\t/g, '\t')
//            .replace(/\\"/g, '"')
//            .replace(/\\'/g, "'");
//
//        // 自定义marked渲染器
//        const renderer = new marked.Renderer();
//
//        // 支持Mermaid
//        renderer.code = function(code, language) {
//            if (language === 'mermaid') {
//                return `<div class="mermaid">${code}</div>`;
//            }
//            // SVG内容渲染
//            if (language === 'svg') {
//                return `<div class="svg-container">${code}</div>`;
//            }
//            // HTML内容渲染
//            if (language === 'html') {
//                return `<div class="html-content">${code}</div>`;
//            }
//            return `<pre><code class="hljs ${language}">${hljs.highlight(code, {language: language || 'plaintext'}).value}</code></pre>`;
//        };
//
//        marked.setOptions({
//            renderer: renderer,
//            highlight: function(code, language) {
//                if (language && hljs.getLanguage(language)) {
//                    return hljs.highlight(code, { language: language }).value;
//                }
//                return hljs.highlightAuto(code).value;
//            },
//            breaks: true,
//            gfm: true
//        });
//
//        // 渲染thinking部分
//        const thinkingHtml = thinkingContent ? `
//            <div class="thinking-block">
//                <div class="thinking-header" onclick="toggleThinking(this)">
//                    <span class="thinking-icon">💭</span>
//                    思考过程
//                    <span class="thinking-arrow">▼</span>
//                </div>
//                <div class="thinking-content">
//                    <pre>${escapeHtml(thinkingContent)}</pre>
//                </div>
//            </div>
//        ` : '';
//
//        // 渲染主要内容
//        const mainHtml = marked.parse(mainContent);
//
//        // 组合最终HTML
//        return `
//            <div class="message-content markdown-body" data-content="${escapeHtml(content)}">
//                ${thinkingHtml}
//                ${mainHtml}
//                <div class="message-actions">
//                    <button class="message-action-button" onclick="copyMessage(this.parentElement.parentElement)">复制</button>
//                </div>
//            </div>
//        `;
//    } catch (error) {
//        console.error('Rendering error:', error);
//        return `<div class="message-content">${escapeHtml(content)}</div>`;
//    }
//}

// 渲染聊天界面
function renderChat() {
//    console.log('Rendering chat');
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }

    if (!currentChat) {
        chatContainer.innerHTML = '<div class="welcome">开始新的对话...</div>';
        return;
    }

    chatContainer.innerHTML = currentChat.messages
        .map(msg => `
            <div class="message ${msg.role}">
                ${renderMessageContent(msg.content, msg.role)}
                <div class="message-info">
                    <span class="message-time">${formatTime(msg.timestamp)}</span>
                </div>
            </div>
        `)
        .join('');

    // 初始化特殊内容
    try {
        // 代码高亮
        chatContainer.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

        // 初始化Mermaid图表
        mermaid.init(undefined, document.querySelectorAll('.mermaid'));
    } catch (error) {
        console.error('Content initialization error:', error);
    }

    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 复制消息内容
//async function copyMessage(element) {
//    if (copyInProgress) return;
//    copyInProgress = true;
//
//    try {
//        // 从data-content属性获取原始内容
//        const content = element.getAttribute('data-content');
//        if (!content) throw new Error('No content to copy');
//
//        // 处理转义字符
//        const decodedContent = content
//            .replace(/\\n/g, '\n')  // 换行符
//            .replace(/\\t/g, '\t')  // 制表符
//            .replace(/\\r/g, '\r')  // 回车符
//            .replace(/\\"/g, '"')   // 引号
//            .replace(/\\'/g, "'");  // 单引号
//
//        await navigator.clipboard.writeText(decodedContent);
//        showToast('已复制到剪贴板');
//    } catch (error) {
//        console.error('Copy failed:', error);
//        showToast('复制失败，请重试', true);
//    } finally {
//        copyInProgress = false;
//    }
//}

// 显示提示信息
function showToast(message, isError = false) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast${isError ? ' error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 切换thinking显示
function toggleThinking(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.thinking-arrow');
    const isVisible = content.style.display !== 'none';

    content.style.display = isVisible ? 'none' : 'block';
    arrow.textContent = isVisible ? '▼' : '▲';
}

// 发送消息
// 发送消息
async function sendMessage() {
    const inputBox = document.getElementById('inputBox');
    if (!inputBox) return;

    const message = inputBox.value.trim();
    if (!message) return;

    try {
        // 检查API配置
        const config = Config.get();
        if (!config.apiKey) {
            alert('请先在设置中配置API Key');
            return;
        }

        // 显示发送状态
        inputBox.disabled = true;
        document.querySelector('.toolbar-button.primary').disabled = true;

        // 添加用户消息
        if (!currentChat) {
            createNewChat();
        }

        currentChat = ChatManager.addMessage(currentChat.id, 'user', message);
        inputBox.value = '';
        renderChat();

        // 准备API请求
        const response = await fetch(`${config.apiBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: config.systemPrompt },
                    ...currentChat.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                stream: config.stream
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        if (config.stream) {
            try {
                // 处理流式响应
                const reader = response.body.getReader();
                let completeMessage = {
                    thinking: '',
                    content: ''
                };
                let messageInProgress = '';
                let isInThinking = false;

                // 创建新的assistant消息
                currentChat = ChatManager.addMessage(currentChat.id, 'assistant', '');

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder().decode(value);
                    debugLog('Stream chunk received', chunk);

                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(5);
                            if (data === '[DONE]') continue;

                            try {
                                const json = JSON.parse(data);
                                debugLog('Parsed JSON data', json);

                                const reasoning = json.choices[0]?.delta?.reasoning_content;
                                const content = json.choices[0]?.delta?.content;

                                if (reasoning) {
                                    // 处理thinking内容
                                    if (!isInThinking) {
                                        isInThinking = true;
                                        completeMessage.thinking = '```thinking\n' + reasoning;
                                    } else {
                                        completeMessage.thinking += reasoning;
                                    }
                                } else if (content) {
                                    // 处理普通内容
                                    if (isInThinking) {
                                        completeMessage.thinking += '\n```\n';
                                        isInThinking = false;
                                    }
                                    completeMessage.content += content;
                                }

                                // 构建完整消息
                                const fullMessage = [
                                    completeMessage.thinking,
                                    completeMessage.content
                                ].filter(Boolean).join('\n');

                                // 只有消息有变化时才更新和渲染
                                if (fullMessage !== messageInProgress) {
                                    messageInProgress = fullMessage;
                                    currentChat.messages[currentChat.messages.length - 1].content = fullMessage;
                                    renderChat();
                                }
                            } catch (parseError) {
                                if (data !== '[DONE]') {
                                    console.error('解析响应数据失败:', parseError);
                                }
                            }
                        }
                    }
                }

                // 确保thinking块正确闭合
                if (isInThinking) {
                    completeMessage.thinking += '\n```\n';
                    const finalMessage = [
                        completeMessage.thinking,
                        completeMessage.content
                    ].filter(Boolean).join('\n');
                    currentChat.messages[currentChat.messages.length - 1].content = finalMessage;
                    renderChat();
                }
            } catch (streamError) {
                console.error('流式处理错误:', streamError);
                throw streamError;
            }
        } else {
            const data = await response.json();
            debugLog('Non-stream response data', data);
            const assistantMessage = data.choices[0]?.message?.content || '';
            currentChat = ChatManager.addMessage(currentChat.id, 'assistant', assistantMessage);
            renderChat();
        }
    } catch (error) {
        console.error('发送消息失败:', error);
        alert('发送消息失败: ' + error.message);
    } finally {
        // 恢复UI状态
        inputBox.disabled = false;
        const sendButton = document.querySelector('.toolbar-button.primary');
        if (sendButton) {
            sendButton.disabled = false;
        }
    }
}

// 设置对话框
function showSettings() {
    window.Application.ShowDialog(
        GetUrlPath() + '/settings.html',
        '设置',
        400 * window.devicePixelRatio,
        600 * window.devicePixelRatio,
        false
    );
}

// 切换显示模式
function toggleDisplayMode() {
    try {
        const tsId = window.Application.PluginStorage.getItem("taskpane_id");
        if (tsId) {
            // 当前是侧边栏模式，切换到对话框
            const taskpane = window.Application.GetTaskPane(tsId);
            if (taskpane) {
                taskpane.Visible = false;
                window.Application.PluginStorage.removeItem("taskpane_id");
            }
            // 显示为对话框
            window.Application.ShowDialog(
                GetUrlPath() + '/dialog.html',
                '智能助理',
                400 * window.devicePixelRatio,
                600 * window.devicePixelRatio,
                false
            );
        } else {
            // 当前是对话框模式，切换到侧边栏
                let tskpane = window.Application.CreateTaskPane(GetUrlPath() + "/dialog.html");
                let id = tskpane.ID;
                window.Application.PluginStorage.setItem("taskpane_id", id);
                if (tskpane) {
                    tskpane.Visible = !tskpane.Visible;

//                        console.log("tskpane.Visible 11");
                        tskpane.DockPosition = window.Application.Enum.msoCTPDockPositionRight;
                        tskpane.Width = 1000;
                        tskpane.Visible = true;
                        if (window.Application.ActiveDocument) {
                            window.Application.ActiveDocument.ActiveWindow.View.Zoom.PageFit = 1;
                        }
                }
            // 关闭对话框
            window.close();

        }

        // 更新按钮文本
        const displayModeText = document.getElementById('displayModeText');
        if (displayModeText) {
            displayModeText.textContent = tsId ? '对话框' : '侧边栏';
        }
    } catch (error) {
        console.error('切换显示模式失败:', error);
    }
}

// 清空当前对话
function clearChat() {
    if (!currentChat) return;
    if (!confirm('确定要清空当前对话吗？')) return;

    currentChat.messages = [];
    ChatManager.save(currentChat);
    renderChat();
}

// 页面初始化
// dialog.js续上文
document.addEventListener('DOMContentLoaded', async function() {
    try {
//        console.log('Dialog page loaded');

        // 等待WPS Application初始化完成
        await AppState.init();
//        console.log('WPS Application initialized');

        // 加载配置
        document.getElementById('modelInfo').textContent = Config.get('model');

        // 初始化按钮事件监听
        document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
        document.getElementById('displayModeBtn')?.addEventListener('click', toggleDisplayMode);
        document.getElementById('settingsBtn')?.addEventListener('click', showSettings);
        document.getElementById('clearBtn')?.addEventListener('click', clearChat);

        // 初始化快捷键
        const inputBox = document.getElementById('inputBox');
        if (inputBox) {
            inputBox.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // 初始化库配置
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                securityLevel: 'loose',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true
                }
            });
        }

        marked.setOptions({
            highlight: function(code, language) {
                if (language && hljs.getLanguage(language)) {
                    return hljs.highlight(code, { language: language }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });

        hljs.configure({
            ignoreUnescapedHTML: true
        });
        hljs.highlightAll();

        // 加载最近的对话历史
        const recentChats = ChatManager.getRecent();
        if (recentChats.length > 0) {
            currentChat = recentChats[0]; // 加载最近的对话
            renderChat();
        } else {
            createNewChat();
        }

        // 检查显示模式
        const tsId = window.Application.PluginStorage.getItem("taskpane_id");
        const displayModeText = document.getElementById('displayModeText');
        if (displayModeText) {
            displayModeText.textContent = tsId ? '对话框' : '侧边栏';
        }

//        console.log('Initialization completed');
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
});

// 添加页面卸载前的清理代码
window.addEventListener('beforeunload', function() {
    try {
        if (currentChat) {
            ChatManager.save(currentChat);
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
});


function formatContent(content) {
    return content
        .replace(/\\n/g, '\n')  // 处理换行符
        .replace(/\\t/g, '\t')  // 处理制表符
        .replace(/\\r/g, '')    // 处理回车符
        .replace(/\\"/g, '"')   // 处理引号
        .replace(/\\'/g, "'")   // 处理单引号
        // 处理URL编码的emoji
        .replace(/%([0-9A-F]{2})/gi, (_, p1) => String.fromCharCode('0x' + p1))
        // 处理Unicode编码的emoji
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
}

function renderMessageContent(content, role) {
    debugLog('Original content', content);
	// 添加调试日志
    console.log('Rendering message:', { role, content });

    // 处理用户消息
    // 用户消息保持简单渲染
    if (role === 'user') {
        const formattedContent = content
            .replace(/\\n/g, '<br>')
            .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/\\r/g, '')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");

        console.log('Formatted user content:', formattedContent);

        return `<div class="message-content" data-content="${escapeHtml(content)}">
            ${formattedContent}
            <div class="message-actions">
                <button class="message-action-button" onclick="copyMessage(this.parentElement.parentElement)">复制</button>
            </div>
        </div>`;
    }

    try {
        console.log('Processing assistant message');
        // 处理AI回复
        let thinkingContent = '';
        let mainContent = content;
        // 添加更多调试信息
        console.log('Initial content:', content);
        console.log('Main content before processing:', mainContent);
        // 匹配thinking内容
        const thinkingPatterns = [
            /```thinking\n([\s\S]*?)\n```/,
            /<think>([\s\S]*?)<\/think>/,
            /<thinking>([\s\S]*?)<\/thinking>/
        ];

        for (const pattern of thinkingPatterns) {
            const match = content.match(pattern);
            if (match) {
                thinkingContent = match[1].trim()
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t')
                    .replace(/\\r/g, '')
                    .replace(/\\"/g, '"')
                    .replace(/\\'/g, "'")
                    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
                    .replace(/\\u([0-9a-fA-F]{4})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
                    .replace(/(%[0-9A-F]{2})+/gi, match => decodeURIComponent(match));
                mainContent = content.replace(match[0], '').trim();
                break;
            }
        }

        // 渲染thinking部分
        const thinkingHtml = thinkingContent ? `
            <div class="thinking-block">
                <div class="thinking-header" onclick="toggleThinking(this)">
                    <span class="thinking-icon">💭</span>
                    思考过程
                    <span class="thinking-arrow">▼</span>
                </div>
                <div class="thinking-content">
                    <pre>${thinkingContent}</pre>
                </div>
            </div>
        ` : '';

        // 处理mainContent中的转义字符和emoji
        mainContent = mainContent
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
            .replace(/(%[0-9A-F]{2})+/gi, match => decodeURIComponent(match));
        console.log('Processed main content:', mainContent);
        // 自定义markdown渲染器
        const renderer = new marked.Renderer();

        // 处理特殊内容块
        renderer.code = function(code, language) {
            if (language === 'mermaid') {
                return `<div class="mermaid special-content-block" title="右键点击可复制图片">${code}</div>`;
            }
            if (language === 'svg') {
                return `<div class="svg-container special-content-block" title="右键点击可复制图片">${code}</div>`;
            }
            if (language === 'html') {
                return `<div class="html-content special-content-block">${code}</div>`;
            }
            return `<pre><code class="hljs ${language || ''}">${hljs.highlight(code, {language: language || 'plaintext'}).value}</code><button class="copy-button" onclick="copyToClipboard(this.parentElement.querySelector('code').innerText)">复制</button></pre>`;
        };

        // 增强列表渲染
        renderer.list = function(body, ordered, start) {
            const type = ordered ? 'ol' : 'ul';
            const startAttr = (ordered && start !== 1) ? ` start="${start}"` : '';
            return `<${type}${startAttr} class="enhanced-list">${body}</${type}>`;
        };

        // 配置marked选项
        marked.setOptions({
            renderer: renderer,
            highlight: function(code, language) {
                if (language && hljs.getLanguage(language)) {
                    return hljs.highlight(code, { language: language }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true,
            headerIds: true,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: true
        });


        // 渲染主要内容
        const mainHtml = marked.parse(mainContent);
        console.log('Rendered HTML:', mainHtml);
        // 组合最终的HTML
        return `
            <div class="message-content markdown-body" data-content="${escapeHtml(content)}">
                ${thinkingHtml}
                ${mainHtml}
                <div class="message-actions">
                    <button class="message-action-button" onclick="copyMessage(this.parentElement.parentElement)">复制</button>
                    <button class="message-action-button" onclick="saveAsPNG(this.parentElement.parentElement)">保存为图片</button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Rendering error:', error);
        return `<div class="message-content">${escapeHtml(content)}</div>`;
    }
}

// 更新复制功能
async function copyMessage(element) {
    if (copyInProgress) return;
    copyInProgress = true;

    try {
        const content = element.getAttribute('data-content');
        if (!content) throw new Error('No content to copy');

        // 创建一个临时容器
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        // 处理content内容,将emoji编码转为实际字符
        const processedContent = content
            // 处理基本转义字符
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            // 将URL编码的emoji转为实际字符
            .replace(/%([0-9A-F]{2})/gi, (_, hex) => {
                try {
                    return decodeURIComponent('%' + hex);
                } catch {
                    return _;
                }
            })
            // 处理Unicode格式
            .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, code) => {
                try {
                    return String.fromCodePoint(parseInt(code, 16));
                } catch {
                    return _;
                }
            });

        // 设置临时容器的内容
        tempDiv.textContent = processedContent;

        // 选择文本
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // 尝试使用新的异步Clipboard API
        if (navigator.clipboard && navigator.clipboard.write) {
            const textBlob = new Blob([tempDiv.textContent], { type: 'text/plain' });
            const clipboardItem = new ClipboardItem({ 'text/plain': textBlob });
            await navigator.clipboard.write([clipboardItem]);
        } else {
            // 回退到document.execCommand
            const successful = document.execCommand('copy');
            if (!successful) {
                throw new Error('复制失败');
            }
        }

        // 清理
        selection.removeAllRanges();
        document.body.removeChild(tempDiv);

        showToast('已复制到剪贴板');
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('复制失败，请重试', true);
    } finally {
        copyInProgress = false;
    }
}

// 添加对Mermaid和SVG的右键菜单支持
function addContextMenu() {
    document.addEventListener('contextmenu', async function(e) {
        const target = e.target.closest('.mermaid, .svg-container');
        if (target) {
            e.preventDefault();

            try {
                const canvas = await html2canvas(target, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    useCORS: true
                });

                canvas.toBlob(async function(blob) {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({
                                'image/png': blob
                            })
                        ]);
                        showToast('图片已复制到剪贴板');
                    } catch (error) {
                        console.error('Copy image failed:', error);
                        showToast('复制图片失败', true);
                    }
                }, 'image/png');
            } catch (error) {
                console.error('Convert to image failed:', error);
                showToast('转换图片失败', true);
            }
        }
    });
}

// 添加图片导出功能
async function saveAsPNG(element) {
    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,  // 提高图片质量
            logging: false,
            useCORS: true
        });

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `message-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        showToast('图片已保存');
    } catch (error) {
        console.error('Save as PNG failed:', error);
        showToast('保存失败，请重试', true);
    }
}

// 添加Word文档选中文本监听
document.addEventListener('DOMContentLoaded', function() {
    addContextMenu();

    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'EmojiFont';
            src: local('Apple Color Emoji'),
                 local('Android Emoji'),
                 local('Segoe UI Emoji'),
                 local('Segoe UI Symbol');
        }

        .message-content {
            font-family: 'EmojiFont', -apple-system, BlinkMacSystemFont, sans-serif;
        }
    `;
    document.head.appendChild(style);

    if (typeof window.Application !== 'undefined') {
        // 监听Word文档的SelectionChange事件
        window.Application.ApiEvent.AddApiEventListener("WindowSelectionChange", function(selection) {
            try {
                const inputBox = document.getElementById('inputBox');
                if (inputBox && selection) {
                    const selectedText = window.Application.ActiveDocument.Application.Selection.Text;
                    if (selectedText && selectedText.trim()) {
                        inputBox.value = selectedText.trim();
                    }
                }
            } catch (error) {
                console.error('Failed to handle selection change:', error);
            }
        });
    }
});