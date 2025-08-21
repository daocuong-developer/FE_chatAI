import { ApiResponse, InsertDocumentResponse } from '../types';
import { isUuid } from '../utils/uuid'; // regex check UUID

const API_BASE_URL = '/api'; // endpoint chung

export const api = {
  // 1. Upload file hỗ trợ cả text và html
  async uploadFile(file: File, description: string): Promise<InsertDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload_file?describe=${encodeURIComponent(description)}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // 2. RAG chat
  async ragChat(
    message: string,
    sessionId: string | null = null, // null -> chat mới
    fileIds: string[] = [],
    topK: number = 5
  ): Promise<ApiResponse> {
    // Làm sạch file_ids
    const cleanFileIds = (fileIds ?? [])
      .filter(Boolean)
      .map(id => id.trim())
      .filter(isUuid);

    const payload: Record<string, any> = { message, top_k: topK };

    // Chỉ gửi session_id nếu hợp lệ
    if (isUuid(sessionId)) {
      payload.session_id = sessionId!.trim();
    }
    if (cleanFileIds.length > 0) {
      payload.file_ids = cleanFileIds;
    }

    const res = await fetch(`${API_BASE_URL}/rag_chat`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let detail = '';
      try {
        const err = await res.json();
        detail = err?.detail ? ` – ${JSON.stringify(err.detail)}` : '';
      } catch {}
      throw new Error(`HTTP ${res.status}${detail}`);
    }

    const data = await res.json();
    return data;
  },

  // 3. Chat thường
  async chat(message: string, sessionId: string): Promise<ApiResponse> {
    const payload = { session_id: sessionId, message };

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 
        accept: 'application/json',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // 4. Lấy danh sách văn bản đã đẩy
  async getDocInfor(startIndex = 0, endIndex = 100, getContent = false) {
    const url = `${API_BASE_URL}/get_doc_infor?start_index=${startIndex}&end_index=${endIndex}&get_content=${getContent}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

// 5. Lấy thông tin chunk
  async getChunkInfor(chunkId: string): Promise<any> {
    const url = `${API_BASE_URL}/get_chunk_infor?chunk_id=${chunkId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

// 6. Xóa văn bản
  async removeDocument(docId: string): Promise<ApiResponse> {
    // Kiểm tra xem docId có phải là UUID hợp lệ không
    if (!isUuid(docId)) {
      throw new Error('Invalid doc_id format. Must be a valid UUID.');
    }

    const url = `${API_BASE_URL}/remove_doc?doc_id=${docId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Cố g���ng đọc chi tiết lỗi nếu có
      let detail = '';
      try {
        const errorData = await response.json();
        detail = errorData?.detail ? ` – ${JSON.stringify(errorData.detail)}` : '';
      } catch (e) {
        // Bỏ qua nếu không thể phân tích JSON
      }
      throw new Error(`HTTP error! status: ${response.status}${detail}`);
    }

    // API xóa có thể trả về một đối tượng rỗng hoặc thông báo thành công
    return response.json();
  },

  // 7. Download file
  async downloadFile(docId: string): Promise<Blob> {
    // Kiểm tra xem docId có phải là UUID hợp lệ không
    if (!isUuid(docId)) {
      throw new Error('Invalid doc_id format. Must be a valid UUID.');
    }

    const url = `${API_BASE_URL}/download_file?doc_id=${docId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Cố gắng đọc chi tiết lỗi nếu có
      let detail = '';
      try {
        const errorData = await response.json();
        detail = errorData?.detail ? ` – ${JSON.stringify(errorData.detail)}` : '';
      } catch (e) {
        // Bỏ qua nếu không thể phân tích JSON
      }
      throw new Error(`HTTP error! status: ${response.status}${detail}`);
    }

    // Trả về blob để có thể download
    return response.blob();
  },

};
