import { ApiResponse, InsertDocumentResponse } from '../types';

const API_BASE_URL = 'http://192.168.1.79:8009'; // Địa chỉ API của bạn

export const api = {
  // 1. Đẩy nội dung văn bản
  async insertDocument(
    content: string,
    description: string,
    fileName: string,
    fileSize: string // API yêu cầu là "kích thước" kiểu string, nếu là number thì convert trước khi truyền
  ): Promise<InsertDocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/insert_document`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: { describe: description },
        content: content,
        file_name: fileName,
        file_size: fileSize,
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
  sessionId: string,
  fileIds: string[] = []
): Promise<ApiResponse> {
  const payload: any = {
    session_id: sessionId,
    message,
  };

  // Chỉ thêm file_ids nếu mảng không rỗng
  if (fileIds && fileIds.length > 0) {
    payload.file_ids = fileIds;
  }

  const response = await fetch(`${API_BASE_URL}/rag_chat`, {
    method: 'POST',
    headers: { 
      'accept': 'application/json',
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
},

  // 3. Chat thường
  async chat(message: string, sessionId: string): Promise<ApiResponse> {
    const payload = {
      session_id: sessionId,
      message,
    };

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 
        'accept': 'application/json',
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
      headers: { 'accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
