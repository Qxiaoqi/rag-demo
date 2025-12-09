import { NextResponse } from 'next/server';
import { vectorStore } from '@/lib/vector-store';

export async function POST() {
  try {
    vectorStore.clear();
    return NextResponse.json({
      success: true,
      message: '向量存储已清空',
    });
  } catch (error: any) {
    console.error('清空存储时出错:', error);
    return NextResponse.json(
      { error: error.message || '清空存储时出错' },
      { status: 500 }
    );
  }
}

