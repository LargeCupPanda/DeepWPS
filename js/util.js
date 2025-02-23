//在后续的wps版本中，wps的所有枚举值都会通过wps.Enum对象来自动支持，现阶段先人工定义
var WPS_Enum = {
    msoCTPDockPositionLeft: 0,
    msoCTPDockPositionRight: 2
}

function GetUrlPath() {
    let e = document.location.toString()
    return -1 != (e = decodeURI(e)).indexOf("/") && (e = e.substring(0, e.lastIndexOf("/"))), e
}

// WPS Application状态管理
const AppState = {
    initialized: false,
    application: null,

    // 初始化检查
    async init() {
        if (this.application) {
            return this.application;
        }

        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 200;  // 增加检查次数
            const checkInterval = 200; // 增加每次检查间隔

            const checkApplication = () => {
                attempts++;
                if (typeof window.Application !== 'undefined' &&
                    window.Application.PluginStorage) {
                    this.application = window.Application;
                    this.initialized = true;
//                    console.log('WPS Application initialized successfully');
                    resolve(window.Application);
                    return;
                }

                if (attempts >= maxAttempts) {
                    reject(new Error('WPS Application 初始化超时'));
                    return;
                }

                setTimeout(checkApplication, checkInterval);
            };

            checkApplication();
        });
    },

    // 获取应用实例
    async getApplication() {
        try {
            return await this.init();
        } catch (error) {
            console.error('获取 WPS Application 失败:', error);
            throw error;
        }
    },

    // 检查是否初始化完成
    isReady() {
        return this.initialized && this.application != null;
    }
};

// 配置管理
const Config = {
    default: {
        apiBaseUrl: 'https://api.siliconflow.cn/v1',
        apiKey: '',
        model: 'deepseek-ai/DeepSeek-R1',
        systemPrompt: '你是一个AI助手，可以帮助用户完成各种任务。',
        temperature: 0.7,
        maxTokens: 2000,
        stream: true,
        theme: 'light',
        fontSize: 14
    },

    get: function(key) {
        try {
            const config = JSON.parse(localStorage.getItem('ai_config')) || this.default;
            return key ? config[key] : config;
        } catch (err) {
            console.error('Failed to get config:', err);
            return key ? this.default[key] : this.default;
        }
    },

    set: function(key, value) {
        try {
            const config = this.get();
            if (typeof key === 'object') {
                Object.assign(config, key);
            } else {
                config[key] = value;
            }
            localStorage.setItem('ai_config', JSON.stringify(config));
        } catch (err) {
            console.error('Failed to save config:', err);
            throw err;
        }
    },

    reset: function() {
        try {
            localStorage.setItem('ai_config', JSON.stringify(this.default));
            return true;
        } catch (err) {
            console.error('Failed to reset config:', err);
            throw err;
        }
    }
};

// 对话管理
const ChatManager = {
    create: function() {
        const chat = {
            id: generateUUID(),
            messages: [],
            timestamp: Date.now(),
            title: '新对话'
        };
        this.save(chat);
        return chat;
    },

    get: function(id) {
        try {
            const chats = JSON.parse(localStorage.getItem('ai_chats')) || {};
            if (id) {
                if (!chats[id]) {
                    console.warn(`Chat ${id} not found`);
                    return null;
                }
                return chats[id];
            }
            return chats;
        } catch (err) {
            console.error('Failed to get chats:', err);
            return id ? null : {};
        }
    },

    save: function(chat) {
        try {
            if (!chat || !chat.id) {
                throw new Error('Invalid chat object');
            }
            const chats = this.get();
            chats[chat.id] = chat;
            localStorage.setItem('ai_chats', JSON.stringify(chats));
//            console.log(`Chat ${chat.id} saved successfully`);
        } catch (err) {
            console.error('Failed to save chat:', err);
            throw err;
        }
    },

    delete: function(id) {
        try {
            const chats = this.get();
            if (!chats[id]) {
                console.warn(`Chat ${id} not found`);
                return;
            }
            delete chats[id];
            localStorage.setItem('ai_chats', JSON.stringify(chats));
//            console.log(`Chat ${id} deleted successfully`);
        } catch (err) {
            console.error('Failed to delete chat:', err);
            throw err;
        }
    },

    addMessage: function(chatId, role, content) {
        try {
            const chat = this.get(chatId);
            if (!chat) throw new Error('Chat not found');

            // Add message
            chat.messages.push({
                role,
                content,
                timestamp: Date.now()
            });

            // Update chat title if this is first user message
            if (role === 'user' && chat.messages.length === 1) {
                chat.title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
            }

            // Save changes
            this.save(chat);
            return chat;
        } catch (err) {
            console.error('Failed to add message:', err);
            throw err;
        }
    },

    // 获取最近的聊天记录
    getRecent: function(limit = 10) {
        try {
            const chats = this.get();
            return Object.values(chats)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);
        } catch (err) {
            console.error('Failed to get recent chats:', err);
            return [];
        }
    }
};

// 工具函数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 导出所需的对象和函数
window.AppState = AppState;
window.Config = Config;
window.ChatManager = ChatManager;
window.WPS_Enum = WPS_Enum;
window.generateUUID = generateUUID;
window.formatTime = formatTime;
window.GetUrlPath = GetUrlPath;