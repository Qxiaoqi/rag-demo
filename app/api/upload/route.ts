import { NextRequest, NextResponse } from 'next/server';
import { processDocument, chunkText } from '@/lib/document-processor';
import { generateEmbeddings } from '@/lib/embeddings';
import { vectorStore, DocumentChunk } from '@/lib/vector-store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 1. 处理文档，提取文本
    console.log('正在处理文档:', file.name);
    const text = await processDocument(file);

    // 2. 将文本分割成块
    console.log('正在分割文本...');
    const chunks = chunkText(text, 1000, 200);
    console.log(`文本已分割成 ${chunks.length} 个块`);

    // 3. 生成 embeddings
    console.log('正在生成 embeddings...');
    const embeddings = await generateEmbeddings(chunks);

    // 4. 创建文档块对象并存储
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      id: uuidv4(),
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        source: file.name,
        chunkIndex: index,
      },
    }));

    vectorStore.addChunks(documentChunks);
    console.log(`已添加 ${documentChunks.length} 个文档块到向量存储`);

    return NextResponse.json({
      success: true,
      message: `成功处理文档，共 ${chunks.length} 个块`,
      chunksCount: chunks.length,
    });
  } catch (error: any) {
    console.error('处理文档时出错:', error);
    return NextResponse.json(
      { error: error.message || '处理文档时出错' },
      { status: 500 }
    );
  }
}

