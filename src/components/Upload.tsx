import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, File, AlertCircle, CheckCircle2, X } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
  if (file.type !== 'text/plain') {
    setUploadStatus({
      type: 'error',
      message: 'Chỉ chấp nhận file văn bản (.txt)',
    });
    return; // Dừng xử lý nếu không phải file .txt
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
      const response = await api.insertDocument(content, description.trim(), selectedFile.name, selectedFile.size);

      const newDocument: Document = {
        id: response.doc_id,
        name: selectedFile.name,
        description: description.trim(),
        uploadedAt: new Date(),
      };

      setDocuments([...documents, newDocument]);
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
  };

  return (
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

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tài liệu đã tải lên ({documents.length})
          </h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <File size={20} className="text-blue-500" />
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
                  title="Xóa tài liệu"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}