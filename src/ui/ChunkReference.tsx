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
    
    try {
      // Nếu API trả về file_url thì download trực tiếp
      if (chunkInfo.file_url) {
        const link = document.createElement('a');
        link.href = chunkInfo.file_url;
        link.download = chunkInfo.filename || 'chunk-file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Nếu không có file_url, tạo file từ text content
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
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 max-w-lg"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="bg-white text-gray-900 text-sm rounded-lg p-4 shadow-2xl border border-gray-200">
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader size={16} className="animate-spin" />
                Đang tải thông tin...
              </div>
            ) : error ? (
              <div className="text-red-600">
                Lỗi: {error}
              </div>
            ) : chunkInfo ? (
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">File:</span>{' '}
                  <span className="text-gray-900">{chunkInfo.filename}</span>
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
