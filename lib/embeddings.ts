// 使用 OpenRouter 生成 embeddings
async function callOpenRouterEmbeddings(
  input: string | string[]
): Promise<any> {
  const apiKey = process.env.OPENROUTER_API_KEY
  // 默认使用 gemini-embedding-001 (Google 的 embedding 模型)
  const model = process.env.OPENROUTER_EMBEDDING_MODEL || "thenlper/gte-base"

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY 未设置")
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000", // 可选，用于跟踪
        "X-Title": "RAG Demo", // 可选
      },
      body: JSON.stringify({
        model: model,
        input: input,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("OpenRouter Embeddings API 错误响应:", error)
      throw new Error(`OpenRouter Embeddings API 错误: ${error}`)
    }

    const data = await response.json()

    // 检查响应中是否包含错误
    if (data.error) {
      console.error("OpenRouter Embeddings API 返回错误:", data.error)
      throw new Error(
        `模型不可用: ${data.error.message || "未知错误"} (代码: ${
          data.error.code || "未知"
        })`
      )
    }

    console.log(
      "OpenRouter Embeddings API 响应:",
      JSON.stringify(data, null, 2)
    )
    return data
  } catch (error) {
    console.error("调用 OpenRouter Embeddings API 时出错:", error)
    throw error
  }
}

// 生成文本的 embedding
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await callOpenRouterEmbeddings(text)

    // 检查响应格式
    if (!response) {
      throw new Error("API 响应为空")
    }

    // 检查是否有错误（虽然应该在 callOpenRouterEmbeddings 中处理，但这里也检查一下）
    if (response.error) {
      throw new Error(`API 返回错误: ${response.error.message || "未知错误"}`)
    }

    // OpenRouter 可能返回不同的格式，尝试多种可能的结构
    let embedding: number[] | undefined

    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data[0]?.embedding
    ) {
      // 标准格式: { data: [{ embedding: [...] }] }
      embedding = response.data[0].embedding
    } else if (response.embedding) {
      // 直接返回 embedding
      embedding = response.embedding
    } else if (Array.isArray(response) && response[0]?.embedding) {
      // 数组格式
      embedding = response[0].embedding
    } else {
      console.error("未知的响应格式:", JSON.stringify(response, null, 2))
      throw new Error(
        `无法从响应中提取 embedding。响应格式: ${JSON.stringify(response)}`
      )
    }

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("embedding 不是有效的数组")
    }

    return embedding
  } catch (error: any) {
    console.error("生成 embedding 时出错:", error)
    throw new Error(`无法生成 embedding: ${error.message}`)
  }
}

// 批量生成 embeddings
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await callOpenRouterEmbeddings(texts)

    // 检查响应格式
    if (!response) {
      throw new Error("API 响应为空")
    }

    // 检查是否有错误
    if (response.error) {
      throw new Error(`API 返回错误: ${response.error.message || "未知错误"}`)
    }

    let embeddings: number[][]

    if (response.data && Array.isArray(response.data)) {
      // 标准格式: { data: [{ embedding: [...] }, ...] }
      embeddings = response.data.map((item: any) => {
        if (item.embedding && Array.isArray(item.embedding)) {
          return item.embedding
        }
        throw new Error(`无效的 embedding 格式: ${JSON.stringify(item)}`)
      })
    } else if (Array.isArray(response)) {
      // 数组格式
      embeddings = response.map((item: any) => {
        if (item.embedding && Array.isArray(item.embedding)) {
          return item.embedding
        }
        throw new Error(`无效的 embedding 格式: ${JSON.stringify(item)}`)
      })
    } else {
      console.error("未知的响应格式:", JSON.stringify(response, null, 2))
      throw new Error(
        `无法从响应中提取 embeddings。响应格式: ${JSON.stringify(response)}`
      )
    }

    return embeddings
  } catch (error: any) {
    console.error("批量生成 embeddings 时出错:", error)
    throw new Error(`无法生成 embeddings: ${error.message}`)
  }
}
