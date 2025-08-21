import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar bot */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
        </div>
      )}

      {/* Nội dung tin nhắn */}
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-2 last:mb-0">
                    {children}
                  </p>
                ),
                code: ({node, ...props}) =>
                  (node && (node as any).inline) ? (
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">
                    {props.children}
                  </code>
                ) : (
                <pre className="bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto">
                  <code>{props.children}</code>
                </pre>
                ),
                br: () => <> </>, // bỏ hẳn thẻ <br />
              }}
              >
              {message.content}
            </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Thời gian */}
        <div className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>

      {/* Avatar user */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User size={16} className="text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
