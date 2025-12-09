import { NextRequest, NextResponse } from 'next/server';
import { ragQuery } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的查询问题' },
        { status: 400 }
      );
    }

    console.log('收到查询:', query);

    // 执行 RAG 查询
    const result = await ragQuery(query, 5);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sources: result.sources.map((chunk) => ({
        id: chunk.id,
        content: chunk.content.substring(0, 200) + '...', // 只返回前200个字符
        metadata: chunk.metadata,
      })),
    });
  } catch (error: any) {
    console.error('查询时出错:', error);
    return NextResponse.json(
      { error: error.message || '查询时出错' },
      { status: 500 }
    );
  }
}

