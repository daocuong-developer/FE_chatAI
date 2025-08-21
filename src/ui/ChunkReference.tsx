import React, { useState, useEffect, useRef } from 'react';
import { Download, File, Loader } from 'lucide-react';
import { api } from '../utils/api';

interface ChunkReferenceProps {
  chunkId: string;
}

interface ChunkInfo {
  text: string;
  filename: string;
  file_url?: string;
  doc_describe: string;
  doc_id?: string;
}

export function ChunkReference({ chunkId }: ChunkReferenceProps) {
  const [chunkInfo, setChunkInfo] = useState<ChunkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadChunkInfo = async () => {
    if (chunkInfo || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const info = await api.getChunkInfor(chunkId);
      setChunkInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin chunk');
    } finally {
      setIsLoading(false);
    }
  };

  // Load chunk info immediately when component mounts
  useEffect(() => {
    loadChunkInfo();
  }, [chunkId]);

  const handleDownload = async () => {
    if (!chunkInfo) return;

    console.log('Downloading file for chunk:', chunkId);
    console.log('Chunk info:', chunkInfo);

    try {
      // Nếu có doc_id, sử dụng API download mới
      if (chunkInfo.doc_id) {
        console.log('Using downloadFile API with doc_id:', chunkInfo.doc_id);
        const blob = await api.downloadFile(chunkInfo.doc_id);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = chunkInfo.filename || 'downloaded-file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      // Fallback: Nếu API trả về file_url thì download trực tiếp
      else if (chunkInfo.file_url) {
        console.log('Using direct file_url:', chunkInfo.file_url);
        const link = document.createElement('a');
        link.href = chunkInfo.file_url;
        link.download = chunkInfo.filename || 'chunk-file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // Fallback cuối: Tạo file từ text content
      else {
        console.log('Creating file from text content');
        const blob = new Blob([chunkInfo.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = chunkInfo.filename || `chunk-${chunkId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Không thể tải xuống file. Vui lòng thử lại.');
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowTooltip(true);
    loadChunkInfo();
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span className="relative inline-block">
      <span
        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 transition-colors text-sm"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleDownload}
        title="Click để tải xuống"
      >
        <File size={12} />
        {chunkInfo?.filename || `${chunkId.substring(0, 8)}...`}
        {isLoading ? (
          <Loader size={12} className="animate-spin" />
        ) : (
          <Download size={12} />
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 top-0 left-full ml-2 w-[600px] max-w-2xl max-h-28"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="bg-white text-gray-900 text-sm rounded-lg p-4 shadow-2xl border border-gray-200">
            <div className="absolute top-4 right-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader size={16} className="animate-spin" />
                Đang tải thông tin...
              </div>
            ) : error ? (
              <div className="text-red-600">
                Lỗi: Không có thông tin 
              </div>
            ) : chunkInfo ? (
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">File:</span>{' '}
                  <span className="text-gray-900">{chunkInfo.doc_describe}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Nội dung:</span>
                  <div className="mt-2 max-h-48 overflow-y-auto text-gray-800 bg-gray-50 rounded p-3 border">
                    {chunkInfo.text.length > 500
                      ? chunkInfo.text.substring(0, 500) + '...'
                      : chunkInfo.text
                    }
                  </div>
                </div>
                <div className="text-gray-500 text-xs text-center pt-2 border-t">
                  💡 Click để tải xuống file
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </span>
  );
}
