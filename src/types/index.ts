export interface Document {
  id: string;
  name: string;
  description: string;
  uploadedAt: Date;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  sessionId?: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export type ChatMode = 'rag' | 'chat';

export interface ApiResponse {
  message: string;
  session_id?: string;
}

export interface InsertDocumentResponse {
  doc_id: string;
  message: string;
}