# RAG Demo - 检索增强生成演示

这是一个使用 Next.js 构建的 RAG (Retrieval-Augmented Generation) 演示项目，帮助你理解 RAG 的实现方式。

## 什么是 RAG？

RAG (Retrieval-Augmented Generation) 是一种结合了信息检索和文本生成的技术。它的工作流程如下：

1. **文档处理**：将文档分割成小块（chunks）
2. **向量化**：使用 embedding 模型将文档块转换为向量
3. **存储**：将向量存储在向量数据库中
4. **检索**：将用户问题转换为向量，在向量数据库中搜索最相似的文档块
5. **生成**：将检索到的文档块作为上下文，通过大语言模型生成回答

## 功能特性

- 📄 支持多种文档格式：PDF、Word (.docx)、文本文件 (.txt, .md)
- 🔍 智能文档分块：自动将文档分割成合适大小的块
- 🧠 向量化存储：使用 OpenRouter 的 embedding 模型生成向量
- 🔎 相似度搜索：基于余弦相似度检索相关文档
- 💬 智能问答：通过 OpenRouter 调用大模型生成回答
- 🎨 现代化 UI：美观的用户界面

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **向量化**：OpenRouter Embeddings API (默认使用 google/text-embedding-004，支持多种模型)
- **大模型**：OpenRouter API (默认使用 google/gemini-2.5-flash，支持多种模型)
- **文档处理**：
  - `pdf-parse` - PDF 文件解析
  - `mammoth` - Word 文档解析
- **向量计算**：`cosine-similarity` - 余弦相似度计算

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env.local` 并填入你的 API 密钥：

```bash
cp env.example .env.local
```

编辑 `.env.local`：

```env
# OpenRouter API Key (用于调用大模型和生成 embeddings)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OpenRouter 使用的聊天模型 (可选，默认使用 google/gemini-2.5-flash)
OPENROUTER_MODEL=google/gemini-2.5-flash

# OpenRouter 使用的 embedding 模型 (可选，默认使用 google/text-embedding-004)
# 注意：gemini-2.5-flash 是生成模型，不是专门的 embedding 模型
# 推荐使用专门的 embedding 模型：
# - google/text-embedding-004 (Google 的 embedding 模型，推荐)
# - voyage-3.5 (Voyage AI 的高性能 embedding 模型)
# - text-embedding-ada-002 (OpenAI)
# - text-embedding-3-small/large (OpenAI)
OPENROUTER_EMBEDDING_MODEL=google/text-embedding-004
```

### 3. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 1. 上传文档

- 点击"选择文件"按钮，上传 PDF、Word 或文本文件
- 系统会自动处理文档：
  - 提取文本内容
  - 将文本分割成约 1000 字符的块
  - 为每个块生成 embedding 向量
  - 存储到向量数据库中

### 2. 提问

- 在输入框中输入你的问题
- 点击"提问"按钮
- 系统会：
  - 将问题转换为向量
  - 在向量数据库中搜索最相似的文档块（默认返回前 5 个）
  - 将检索到的文档块作为上下文，调用大模型生成回答
  - 显示回答和参考来源

### 3. 清空存储

- 点击"清空存储"按钮可以清空所有已上传的文档

## 项目结构

```
rag-demo/
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # 文档上传 API
│   │   ├── query/route.ts      # 查询 API
│   │   └── clear/route.ts      # 清空存储 API
│   ├── page.tsx                # 主页面
│   ├── page.module.css         # 页面样式
│   ├── layout.tsx              # 布局组件
│   └── globals.css             # 全局样式
├── lib/
│   ├── vector-store.ts         # 向量存储实现
│   ├── document-processor.ts   # 文档处理
│   ├── embeddings.ts           # Embedding 生成
│   └── rag.ts                  # RAG 核心逻辑
├── package.json
├── tsconfig.json
└── README.md
```

## 核心代码说明

### 向量存储 (`lib/vector-store.ts`)

使用简单的内存向量存储，基于余弦相似度进行搜索。在实际生产环境中，可以使用专业的向量数据库如 Pinecone、Weaviate 或 Chroma。

### 文档处理 (`lib/document-processor.ts`)

- 支持多种文档格式的解析
- 智能文本分块，尝试在句子边界处分割
- 支持块之间的重叠，以保持上下文连续性

### RAG 查询 (`lib/rag.ts`)

RAG 的核心流程：

1. 将查询转换为 embedding
2. 在向量数据库中搜索相似文档
3. 构建包含上下文的提示词
4. 调用大模型生成回答

## 注意事项

1. **API 密钥**：确保正确配置 OpenRouter 的 API 密钥（用于 embeddings 和聊天模型）
2. **内存存储**：当前使用内存存储，重启服务器后数据会丢失。生产环境应使用持久化存储
3. **成本**：使用 OpenRouter API 会产生费用，请注意使用量
4. **文件大小**：大文件可能需要较长的处理时间
5. **模型选择**：
   - **对话模型**：默认使用 `google/gemini-2.5-flash`，你也可以切换到其他模型
   - **Embedding 模型**：默认使用 `google/text-embedding-004`（Google 的专门 embedding 模型）。注意：`gemini-2.5-flash` 是生成模型，不是专门的 embedding 模型，虽然可以尝试，但推荐使用专门的 embedding 模型以获得更好的检索效果

## 扩展建议

- 使用专业的向量数据库（如 Pinecone、Weaviate）
- 添加更多文档格式支持（如 Markdown、HTML）
- 实现持久化存储
- 添加用户认证和文档管理
- 优化分块策略
- 添加流式响应支持

## 许可证

MIT
