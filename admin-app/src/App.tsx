import React, { useState } from 'react';
import { Upload as UploadIcon, Settings } from 'lucide-react';
import { Upload } from './components/Upload';
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
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RAG Admin</h1>
            </div>

            <div className="flex items-center gap-2 bg-orange-100 rounded-lg px-4 py-2">
              <UploadIcon size={16} className="text-orange-600" />
              <span className="text-orange-600 font-medium">Quản lý tài liệu</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Upload documents={documents} setDocuments={setDocuments} />
      </main>
    </div>
  );
}

export default App;