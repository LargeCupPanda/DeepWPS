# WPS 智能助理插件

## 项目背景
随着AI的普及，希望能将AI功能接入WPS、Office等办公软件中使用，通过插件形式提供智能助理功能，提升办公效率。当前版本已实现基础的AI对话功能，支持文字处理场景下的智能辅助。

## 功能特性

### 已实现功能
- AI对话集成
  - 支持多轮对话
  - 保持上下文连续性
  - 实时流式输出
  - 思考过程展示
  - 消息历史记录
  
- 界面交互
  - 支持对话框/侧边栏两种显示模式
  - 支持Markdown富文本渲染
  - 代码高亮显示
  - Mermaid图表绘制
  - SVG图形支持
  
- 消息管理
  - 支持消息复制到剪贴板
  - 支持将消息保存为图片
  - 消息历史自动保存
  
- 配置管理
  - 自定义API参数(baseurl、key)
  - 自定义模型选择
  - 自定义系统提示语
  - 参数本地持久化

### 计划功能
- 多场景支持(Excel、PPT)
- 文档智能处理
- 协同办公集成
- 快捷键支持优化
- 提示词模板管理

## 技术实现

### 框架与类库
- 基于WPS加载项开发框架
- marked.js - Markdown渲染
- highlight.js - 代码高亮
- mermaid - 图表绘制
- html2canvas - 图片导出

### 核心模块

1. 对话管理
- 消息存储与检索
- 上下文管理
- 历史记录持久化

2. 界面渲染
- 动态消息渲染
- 特殊内容处理
  - 代码块渲染
  - 图表生成
  - 图片处理
- 布局自适应

3. API集成
- OpenAI接口对接
- 流式响应处理
- 错误处理机制

4. 配置管理
- 本地存储
- 参数验证
- 实时生效

## 安装部署

### 开发环境
- Node.js
- WPS开发者工具包
- VSCode或其他编辑器

### 开发调试
1. 安装依赖
```bash
npm install
```

2. 启动调试
```bash
wpsjs debug
```

### 发布部署
1. publish模式
```bash
wpsjs publish
```

2. jsplugins.xml模式
- 配置jsplugins.xml
- 设置JSPluginsServer

## 使用说明

### 基础配置
1. 安装WPS
2. 导入插件
3. 设置API参数
   - API Key
   - 模型选择
   - 系统提示语

### 基本操作
1. 启动方式
   - 功能区"智能助理"按钮
   - 右键菜单
   
2. 界面切换
   - 对话框模式
   - 侧边栏模式

3. 消息操作
   - 发送消息(Ctrl+Enter)
   - 复制内容
   - 保存为图片
   - 清空对话

### 高级功能
1. Markdown语法支持
2. 代码高亮显示
3. 图表自动绘制
4. 消息历史管理

## 注意事项
1. API密钥安全存储
2. 大文本响应优化
3. 网络请求异常处理
4. 浏览器兼容性考虑

## 技术栈
- JavaScript
- HTML/CSS
- WPS 加载项开发框架
- marked.js (Markdown渲染)
- highlight.js (代码高亮)
- mermaid (图表绘制)
- html2canvas (图片导出)

## 贡献指南
欢迎提交Issue和Pull Request来改进项目。在提交代码前，请确保：
1. 代码风格一致
2. 功能测试完整
3. 文档同步更新
4. 提交信息规范