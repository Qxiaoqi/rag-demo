'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage('请先选择文件');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadMessage(`✅ ${data.message}`);
        setFile(null);
        // 重置文件输入
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadMessage(`❌ ${data.error}`);
      }
    } catch (error: any) {
      setUploadMessage(`❌ 上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setAnswer('');
    setSources([]);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        setAnswer(data.answer);
        setSources(data.sources);
      } else {
        setAnswer(`错误: ${data.error}`);
      }
    } catch (error: any) {
      setAnswer(`查询失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      const response = await fetch('/api/clear', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        setUploadMessage('✅ 向量存储已清空');
        setAnswer('');
        setSources([]);
      }
    } catch (error: any) {
      setUploadMessage(`❌ 清空失败: ${error.message}`);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>RAG Demo</h1>
        <p className={styles.subtitle}>
          检索增强生成 (Retrieval-Augmented Generation) 演示
        </p>

        {/* 文档上传区域 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 上传文档</h2>
          <p className={styles.description}>
            上传 PDF、Word 或文本文件，系统会自动处理并生成向量索引
          </p>
          <div className={styles.uploadArea}>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <div className={styles.buttonGroup}>
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={styles.button}
              >
                {uploading ? '上传中...' : '上传文档'}
              </button>
              <button
                onClick={handleClear}
                className={styles.buttonSecondary}
              >
                清空存储
              </button>
            </div>
            {uploadMessage && (
              <p className={styles.message}>{uploadMessage}</p>
            )}
          </div>
        </section>

        {/* 查询区域 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 提问</h2>
          <p className={styles.description}>
            输入你的问题，系统会从文档中检索相关信息并生成回答
          </p>
          <div className={styles.queryArea}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：文档的主要内容是什么？"
              className={styles.textarea}
              rows={3}
            />
            <button
              onClick={handleQuery}
              disabled={loading || !query.trim()}
              className={styles.button}
            >
              {loading ? '思考中...' : '提问'}
            </button>
          </div>
        </section>

        {/* 回答区域 */}
        {answer && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>回答</h2>
            <div className={styles.answerBox}>
              <p className={styles.answerText}>{answer}</p>
            </div>

            {sources.length > 0 && (
              <div className={styles.sourcesBox}>
                <h3 className={styles.sourcesTitle}>参考来源 ({sources.length})</h3>
                {sources.map((source, index) => (
                  <div key={source.id} className={styles.sourceItem}>
                    <div className={styles.sourceHeader}>
                      <span className={styles.sourceIndex}>片段 {index + 1}</span>
                      {source.metadata?.source && (
                        <span className={styles.sourceFile}>
                          来源: {source.metadata.source}
                        </span>
                      )}
                    </div>
                    <p className={styles.sourceContent}>{source.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 说明区域 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>RAG 工作原理</h2>
          <div className={styles.infoBox}>
            <ol className={styles.stepsList}>
              <li>
                <strong>文档处理：</strong>
                将上传的文档分割成小块（chunks），每块约 1000 字符
              </li>
              <li>
                <strong>向量化：</strong>
                使用 OpenAI 的 embedding 模型将每个文档块转换为向量
              </li>
              <li>
                <strong>存储：</strong>
                将向量存储在内存向量数据库中
              </li>
              <li>
                <strong>检索：</strong>
                将用户问题转换为向量，在向量数据库中搜索最相似的文档块
              </li>
              <li>
                <strong>生成：</strong>
                将检索到的文档块作为上下文，通过 OpenRouter 调用大模型生成回答
              </li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

