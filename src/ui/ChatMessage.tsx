import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Thêm plugin breaks để xử lý xu��ng dòng
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw'; // Thêm dòng này
import { User, Bot, Folder } from 'lucide-react';
import { Message } from '../types';
import { ChunkReference } from './ChunkReference';

interface ChatMessageProps {
  message: Message;
}

// Hàm parse chunk IDs từ text
function parseChunkReferences(content: string) {
  const chunkRegex = /\[\$([a-f0-9-]{36})\$\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = chunkRegex.exec(content)) !== null) {
    // Thêm text trước chunk ID
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Thêm chunk reference
    parts.push({
      type: 'chunk',
      chunkId: match[1]
    });

    lastIndex = match.index + match[0].length;
  }

  // Thêm text còn lại
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return parts;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  // Parse chunk references nếu là tin nhắn từ bot
  const parsedContent = !isUser ? parseChunkReferences(message.content) : null;
  const processedContent = message.content;

  return (
    <div className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
            <Bot size={18} className="text-white" />
          </div>
        </div>
      )}

      {/* Nội dung */}
      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-line">{message.content}</p>
          ) : parsedContent && parsedContent.length > 1 ? (
            // Nếu có chunk references, render từng phần
            <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg">
              {parsedContent.map((part, index) =>
                part.type === 'text' ? (
                    <ReactMarkdown
                      key={index}
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        // Paragraph - consistent block rendering for both cases
                        p: ({ children }) => {
                          // Nếu đoạn văn chỉ chứa một link file
                          if (
                            Array.isArray(children) &&
                            children.length === 1 &&
                            typeof children[0] === 'object' &&
                            children[0].type === 'a'
                          ) {
                            return <div className="mb-2 last:mb-0 leading-relaxed">{children}</div>;
                          }
                          // Đoạn văn thông thường - sử dụng block element như trường hợp không có chunk
                          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                        },

                        // Unordered list
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>
                        ),
                        // Ordered list
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,

                        // Bold text
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),

                        // Inline code
                        code: ({ node, inline, children, ...props }) =>
                          inline ? (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600">
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                              <code {...props}>{children}</code>
                            </pre>
                          ),

                        // Tables - same styling as original
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 border-2 border-gray-500 rounded-lg shadow-lg bg-white">
                            <table className="min-w-full text-sm border-separate border-spacing-0">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-900">{children}</thead>
                        ),
                        tr: ({ children }) => (
                          <tr className="even:bg-gray-50 hover:bg-blue-50 transition-colors">{children}</tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-4 text-left font-bold border-b-2 border-r-2 border-gray-400 bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-800 first:rounded-tl-lg last:rounded-tr-lg last:border-r-0">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-4 align-top border-b border-r-2 border-gray-300 text-gray-900 last:border-r-0 first:border-l-0">
                            {children}
                          </td>
                        ),
                        a: ({ href, children }) => {
                          const isFile = /\.(txt|pdf|docx|xlsx|pptx|zip|rar|json|html)$/i.test(href || '');
                          if (isFile) {
                            return (
                              <a
                                href={href}
                                download
                                className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition"
                                title="Tải xuống"
                                style={{ textDecoration: 'none', alignItems: 'center', display: 'inline-flex' }}
                              >
                                {/* Icon thư mục vàng luôn đứng trước tên file */}
                                <Folder size={18} className="text-yellow-400 flex-shrink-0" />
                                <span className="text-blue-600 hover:underline font-medium text-base">
                                  {children}
                                </span>
                              </a>
                            );
                          }
                          // Link thông thường
                          return (
                            <a
                              href={href}
                              className="text-blue-600 underline hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          );
                        },
                      }}
                    >
                      {part.content}
                    </ReactMarkdown>
                ) : (
                  <ChunkReference key={index} chunkId={part.chunkId} />
                )
              )}
            </div>
          ) : (
            // Nếu không có chunk references, render như bình thường
            <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]} // Thêm dòng này để render HTML inline
                components={{
                  // Paragraph
                  p: ({ children }) => {
                    // Nếu đoạn văn chỉ chứa một link file
                    if (
                      Array.isArray(children) &&
                      children.length === 1 &&
                      typeof children[0] === 'object' &&
                      children[0].type === 'a'
                    ) {
                      return <div className="mb-2 last:mb-0 leading-relaxed">{children}</div>;
                    }
                    // Đoạn văn thông thường
                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                  },

                  // Unordered list
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>
                  ),
                  // Ordered list
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

                  // Bold text
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-800">{children}</strong>
                  ),

                  // Inline code
                  code: ({ node, inline, children, ...props }) =>
                    inline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                        <code {...props}>{children}</code>
                      </pre>
                    ),

                  // Tables
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border-2 border-gray-500 rounded-lg shadow-lg bg-white">
                      <table className="min-w-full text-sm border-separate border-spacing-0">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-900">{children}</thead>
                  ),
                  tr: ({ children }) => (
                    <tr className="even:bg-gray-50 hover:bg-blue-50 transition-colors">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-4 text-left font-bold border-b-2 border-r-2 border-gray-400 bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-800 first:rounded-tl-lg last:rounded-tr-lg last:border-r-0">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-4 align-top border-b border-r-2 border-gray-300 text-gray-900 last:border-r-0 first:border-l-0">
                      {children}
                    </td>
                  ),
                  a: ({ href, children }) => {
                    const isFile = /\.(txt|pdf|docx|xlsx|pptx|zip|rar|json|html)$/i.test(href || '');
                    if (isFile) {
                      return (
                        <a
                          href={href}
                          download
                          className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition"
                          title="Tải xuống"
                          style={{ textDecoration: 'none', alignItems: 'center', display: 'inline-flex' }}
                        >
                          {/* Icon thư mục vàng luôn đứng trước tên file */}
                          <Folder size={18} className="text-yellow-400 flex-shrink-0" />
                          <span className="text-blue-600 hover:underline font-medium text-base">
                            {children}
                          </span>
                        </a>
                      );
                    }
                    // Link thông thường
                    return (
                      <a
                        href={href}
                        className="text-blue-600 underline hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {processedContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Thời gian */}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-right text-gray-400' : 'text-left text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center shadow-md">
            <User size={18} className="text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
