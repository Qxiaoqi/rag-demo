import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// 将文本分割成块
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // 尝试在句子边界处分割
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const splitPoint = Math.max(lastPeriod, lastNewline);

      if (splitPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, splitPoint + 1);
        start += splitPoint + 1 - overlap;
      } else {
        start += chunkSize - overlap;
      }
    } else {
      start = text.length;
    }

    chunks.push(chunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

// 处理 PDF 文件
export async function processPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);
  return data.text;
}

// 处理 Word 文档
export async function processWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// 处理文本文件
export async function processText(file: File): Promise<string> {
  return await file.text();
}

// 根据文件类型处理文档
export async function processDocument(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return await processPDF(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await processWord(file);
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return await processText(file);
  } else {
    throw new Error(`不支持的文件类型: ${file.name}`);
  }
}

