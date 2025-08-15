import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, File, AlertCircle, CheckCircle2, X, History, Check } from 'lucide-react';
import { Document } from '../types';
import { api } from '../utils/api';

interface UploadProps {
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
}

export function Upload({ documents, setDocuments }: UploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [dragActive, setDragActive] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<Document[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    if (isInitialized) return;
    
    const savedHistory = localStorage.getItem('uploadHistory');
    const savedDocuments = localStorage.getItem('selectedDocuments');
    const savedSelectedIds = localStorage.getItem('selectedHistoryIds');
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory).map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt)
        }));
        setUploadHistory(history);
      } catch (error) {
        console.error('Error loading upload history:', error);
      }
    }

    if (savedDocuments) {
      try {
        const docs = JSON.parse(savedDocuments).map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt)
        }));
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading selected documents:', error);
      }
    }

    if (savedSelectedIds) {
      try {
        const ids = JSON.parse(savedSelectedIds);
        setSelectedHistoryIds(new Set(ids));
      } catch (error) {
        console.error('Error loading selected history IDs:', error);
      }
    }
    
    setIsInitialized(true);
  }, [setDocuments]);

  // Lưu dữ liệu vào localStorage khi có thay đổi
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('selectedDocuments', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('selectedHistoryIds', JSON.stringify(Array.from(selectedHistoryIds)));
  }, [selectedHistoryIds]);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/plain') {
      setUploadStatus({
        type: 'error',
        message: 'Chỉ chấp nhận file văn bản (.txt)',
      });
      return;
    }
    setSelectedFile(file);
    setUploadStatus({ type: null, message: '' });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      setUploadStatus({
        type: 'error',
        message: 'Vui lòng chọn file và nhập mô tả',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const content = await selectedFile.text();
      const response = await api.insertDocument(content, description.trim(), selectedFile.name, selectedFile.size.toString());

      const newDocument: Document = {
        id: response.doc_id,
        name: selectedFile.name,
        description: description.trim(),
        uploadedAt: new Date(),
      };

      // Thêm vào lịch sử
      const updatedHistory = [newDocument, ...uploadHistory];
      setUploadHistory(updatedHistory);

      // Tự động thêm vào danh sách được chọn
      setDocuments([...documents, newDocument]);
      setSelectedHistoryIds(prev => new Set([...prev, newDocument.id]));

      setSelectedFile(null);
      setDescription('');
      setUploadStatus({
        type: 'success',
        message: 'Tải lên thành công!',
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải lên',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
    setSelectedHistoryIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(documentId);
      return newSet;
    });
  };

  const toggleHistorySelection = (doc: Document) => {
    const isSelected = selectedHistoryIds.has(doc.id);
    
    if (isSelected) {
      // Bỏ chọn
      setSelectedHistoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(doc.id);
        return newSet;
      });
      setDocuments(documents.filter(d => d.id !== doc.id));
    } else {
      // Chọn
      setSelectedHistoryIds(prev => new Set([...prev, doc.id]));
      if (!documents.find(d => d.id === doc.id)) {
        setDocuments([...documents, doc]);
      }
    }
  };

  const clearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử upload?')) {
      setUploadHistory([]);
      setSelectedHistoryIds(new Set());
      setDocuments([]);
      localStorage.removeItem('uploadHistory');
      localStorage.removeItem('selectedDocuments');
      localStorage.removeItem('selectedHistoryIds');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Tải lên tài liệu của bạn
          </h1>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Kéo thả file hoặc click để chọn file
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Chỉ hỗ trợ file văn bản (.txt)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Chọn file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-blue-500" />
                  <span className="font-medium text-gray-900">{selectedFile.name}</span>
                  <span className="text-sm text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}

            {/* Description Input */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả tài liệu
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả ngắn gọn về nội dung tài liệu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !description.trim() || isUploading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <UploadIcon size={20} />
                  Upload
                </>
              )}
            </button>

            {/* Status Message */}
            {uploadStatus.type && (
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                uploadStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {uploadStatus.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {uploadStatus.message}
              </div>
            )}
          </div>

          {/* Selected Documents for RAG */}
          {documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tài liệu được chọn cho RAG Chat ({documents.length})
              </h2>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <File size={20} className="text-green-600" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {doc.id} • Tải lên: {doc.uploadedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      title="Bỏ chọn tài liệu"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <History size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-700">Lịch sử upload</h2>
          </div>
          {uploadHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-red-500 hover:text-red-700 text-sm"
              title="Xóa toàn bộ lịch sử"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {uploadHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <History size={48} className="mb-4 opacity-50" />
              <p className="text-center">Chưa có file nào được upload</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {uploadHistory.map((doc) => {
                const isSelected = selectedHistoryIds.has(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleHistorySelection(doc)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isSelected ? (
                          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <File size={14} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {doc.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {doc.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>ID: {doc.id.substring(0, 8)}...</p>
                          <p>{doc.uploadedAt.toLocaleDateString()} {doc.uploadedAt.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>Tổng: {uploadHistory.length} file</p>
            <p>Đã chọn: {selectedHistoryIds.size} file</p>
          </div>
        </div>
      </div>
    </div>
  );
}