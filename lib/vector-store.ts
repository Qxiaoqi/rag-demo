import cosineSimilarity from 'cosine-similarity';

// 文档块的结构
export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata?: {
    source?: string;
    page?: number;
    chunkIndex?: number;
  };
}

// 简单的内存向量存储
export class VectorStore {
  private chunks: DocumentChunk[] = [];

  // 添加文档块
  addChunks(chunks: DocumentChunk[]): void {
    this.chunks.push(...chunks);
  }

  // 根据查询向量搜索最相似的文档块
  async search(
    queryEmbedding: number[],
    topK: number = 5
  ): Promise<DocumentChunk[]> {
    // 计算每个文档块与查询的相似度
    const similarities = this.chunks.map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // 按相似度排序并返回前 topK 个
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topK).map((item) => item.chunk);
  }

  // 清空存储
  clear(): void {
    this.chunks = [];
  }

  // 获取所有文档块数量
  getSize(): number {
    return this.chunks.length;
  }
}

// 全局向量存储实例
export const vectorStore = new VectorStore();

