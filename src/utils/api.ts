import { ApiResponse, InsertDocumentResponse } from '../types';
import { isUuid } from '../utils/uuid'; // regex check UUID

const API_BASE_URL = '/api'; // endpoint chung

export const api = {
  // 1. Đẩy nội dung văn bản
  async insertDocument(
    content: string,
    description: string,
    fileName: string,
    fileSize: string
  ): Promise<InsertDocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/insert_document`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: { 
          describe: description,
          file_name: fileName,
          file_size: fileSize,
        },
        content,
      }),
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
};
