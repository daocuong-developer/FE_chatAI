import React, { useState } from 'react';
import { Upload as UploadIcon, MessageSquare } from 'lucide-react';
import { Upload } from './components/Upload';
import { Chat } from './components/Chat';
import { Document } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [documents, setDocuments] = useState<Document[]>(() => {
    // Khôi phục documents từ localStorage khi khởi tạo App
    const saved = localStorage.getItem('selectedDocuments');
    if (saved) {
      try {
        return JSON.parse(saved).map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt)
        }));
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
    return [];
  });

  // Lưu documents vào localStorage mỗi khi thay đổi
  React.useEffect(() => {
    localStorage.setItem('selectedDocuments', JSON.stringify(documents));
  }, [documents]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Chat AI</h1>
            </div>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UploadIcon size={16} />
                Tải tài liệu
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare size={16} />
                Trò chuyện ({documents.length})
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'upload' ? (
          <Upload documents={documents} setDocuments={setDocuments} />
        ) : (
          <Chat documents={documents} />
        )}
      </main>
    </div>
  );
}

export default App;