import { vectorStore, DocumentChunk } from "./vector-store"
import { generateEmbedding } from "./embeddings"

// 使用 OpenRouter 调用大模型
async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash"

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY 未设置")
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000", // 可选，用于跟踪
          "X-Title": "RAG Demo", // 可选
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                "你是一个有用的助手，能够根据提供的上下文回答问题。如果上下文中没有相关信息，请如实说明。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API 错误: ${error}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "无法生成回答"
  } catch (error) {
    console.error("调用大模型时出错:", error)
    throw error
  }
}

// RAG 查询：检索相关文档并生成回答
export async function ragQuery(
  query: string,
  topK: number = 5
): Promise<{
  answer: string
  sources: DocumentChunk[]
}> {
  // 1. 将查询转换为 embedding
  const queryEmbedding = await generateEmbedding(query)

  // 2. 在向量数据库中搜索最相似的文档块
  const relevantChunks = await vectorStore.search(queryEmbedding, topK)

  // 3. 构建提示词，包含检索到的上下文
  let context = ""
  if (relevantChunks.length > 0) {
    context = relevantChunks
      .map((chunk, index) => `[文档片段 ${index + 1}]\n${chunk.content}`)
      .join("\n\n")
  } else {
    context = "没有找到相关的文档片段。"
  }

  const prompt = `请根据以下上下文信息回答用户的问题。如果上下文中没有相关信息，请如实说明。

上下文信息：
${context}

用户问题：${query}

请提供详细且准确的回答：`

  // 4. 调用大模型生成回答
  const answer = await callLLM(prompt)

  return {
    answer,
    sources: relevantChunks,
  }
}
