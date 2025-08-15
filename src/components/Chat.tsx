import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Bot, RefreshCw, X, Menu } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Document, Message, ChatSession, ChatMode } from '../types';
import { api } from '../utils/api';

interface ChatProps {
  documents: Document[];
}

export function Chat({ documents }: ChatProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('rag');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ thêm state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chatSessions.find(session => session.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: `Chat ${chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
    };
    setChatSessions([newChat, ...chatSessions]);
    setActiveChatId(newChat.id);
  };

  useEffect(() => {
    if (chatSessions.length === 0) {
      createNewChat();
    }
  }, [chatSessions.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !activeChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
    };

    setChatSessions(sessions =>
      sessions.map(session =>
        session.id === activeChatId ? updatedChat : session
      )
    );

    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      if (chatMode === 'rag') {
        const fileIds = documents.map(doc => doc.id);
        response = await api.ragChat(
          userMessage.content,
          activeChat.sessionId,
          fileIds
        );
      } else {
        response = await api.chat(
          userMessage.content,
          activeChat.sessionId
        );
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: response.message,
        timestamp: new Date(),
      };

      const finalUpdatedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, botMessage],
        sessionId: response.session_id || activeChat.sessionId,
      };

      setChatSessions(sessions =>
        sessions.map(session =>
          session.id === activeChatId ? finalUpdatedChat : session
        )
      );
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: `Xin lỗi, có lỗi xảy ra: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        timestamp: new Date(),
      };

      setChatSessions(sessions =>
        sessions.map(session =>
          session.id === activeChatId
            ? { ...updatedChat, messages: [...updatedChat.messages, errorMessage] }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
<div
  className={`bg-white border-r border-gray-200 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden`}
  style={{ width: isSidebarOpen ? '320px' : '0px' }}
>
  {isSidebarOpen && (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700 text-lg">Danh sách chat</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tạo chat mới */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={createNewChat}
          className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Tạo chat mới
        </button>
      </div>
      {/* Mode Selection */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Chế độ chat:</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="chatMode"
              value="rag"
              checked={chatMode === 'rag'}
              onChange={(e) => setChatMode(e.target.value as ChatMode)}
              className="text-blue-500"
            />
            <span className="text-sm">RAG Chat (sử dụng tài liệu)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="chatMode"
              value="chat"
              checked={chatMode === 'chat'}
              onChange={(e) => setChatMode(e.target.value as ChatMode)}
              className="text-blue-500"
            />
            <span className="text-sm">Chat thường</span>
          </label>
        </div>
        {chatMode === 'rag' && (
          <p className="text-xs text-gray-500 mt-2">
            Đang sử dụng {documents.length} tài liệu
          </p>
        )}
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {chatSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => setActiveChatId(session.id)}
            className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
              activeChatId === session.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.title}</p>
                <p className="text-xs text-gray-500">
                  {session.messages.length} tin nhắn
                </p>
                <p className="text-xs text-gray-400">
                  {session.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  )}
</div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Trò chuyện với AI
              </h2>
              <p className="text-sm text-gray-500">
                Chế độ: {chatMode === 'rag' ? 'RAG Chat' : 'Chat thường'}
                {activeChat?.sessionId && ` • Session: ${activeChat.sessionId.substring(0, 8)}...`}
              </p>
            </div>
          </div>
          <Bot size={32} className="text-blue-500" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeChat?.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bot size={48} className="mb-4" />
              <h3 className="text-lg font-medium mb-2">Bắt đầu cuộc trò chuyện</h3>
              <p className="text-center">
                {chatMode === 'rag' 
                  ? 'Hãy hỏi tôi về nội dung trong các tài liệu bạn đã tải lên'
                  : 'Hãy hỏi tôi bất cứ điều gì bạn muốn biết'
                }
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {activeChat?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <RefreshCw size={16} className="text-white animate-spin" />
                    </div>
                  </div>
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                    <p className="text-sm">Đang suy nghĩ...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                minHeight: '40px',
                maxHeight: '120px',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
