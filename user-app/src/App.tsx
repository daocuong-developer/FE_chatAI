import React, { useState } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { Chat } from './components/Chat';
import { Document } from './types';

function App() {
  const [documents, setDocuments] = useState<Document[]>(() => {
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
                <Bot size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RAG Chat</h1>
            </div>

            <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-4 py-2">
              <MessageSquare size={16} className="text-blue-600" />
              <span className="text-blue-600 font-medium">Trợ lý AI</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Chat documents={documents} />
      </main>
    </div>
  );
}

export default App;