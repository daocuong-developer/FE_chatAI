# RAG Chat Application

Hệ thống chat AI với khả năng RAG (Retrieval-Augmented Generation) bao gồm 2 ứng dụng riêng biệt:
- **Admin App**: Quản lý và upload tài liệu (Port 3001)
- **User App**: Giao diện chat cho người dùng cuối (Port 3002)

## Tính năng chính

### Admin App (Port 3001)
- 📄 **Upload tài liệu**: Tải lên file văn bản (.txt) với mô tả
- 📚 **Quản lý tài liệu**: Xem lịch sử upload, chọn/bỏ chọn tài liệu
- 🗑️ **Xóa tài liệu**: Xóa tài liệu không cần thiết
- 🔄 **Đồng bộ API**: Lấy dữ liệu từ server thay vì localStorage

### User App (Port 3002)
- 💬 **RAG Chat**: Trò chuyện dựa trên nội dung tài liệu đã upload
- 🤖 **Chat thường**: Trò chuyện AI không dựa trên tài liệu
- 🎤 **Voice Input**: Nhận dạng giọng nói tiếng Việt
- 🔄 **Đa phiên chat**: Quản lý nhiều cuộc trò chuyện
- 💾 **Lưu trữ local**: Lịch sử chat được lưu trong localStorage

## Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: React Markdown với GFM support
- **Build Tool**: Vite
- **Container**: Docker + Docker Compose

## Cài đặt và chạy

### 1. Chạy với Docker (Khuyến nghị)

#### Yêu cầu
- Docker
- Docker Compose

#### Các bước thực hiện

1. **Clone repository**
```bash
git clone <repository-url>
cd rag-chat-app
```

2. **Chạy ứng dụng**
```bash
# Chạy tất cả services (Admin + User + API)
docker-compose up -d

# Hoặc chạy và xem logs
docker-compose up
```

3. **Truy cập ứng dụng**
- Admin App: http://localhost:3001 (Quản lý tài liệu)
- User App: http://localhost:3002 (Chat interface)
- API Mock: http://localhost:8009

4. **Dừng ứng dụng**
```bash
docker-compose down
```

#### Các lệnh Docker hữu ích

```bash
# Xem logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build

# Xóa containers và volumes
docker-compose down -v

# Chỉ chạy admin app
docker-compose up admin-app

# Chỉ chạy user app
docker-compose up user-app

# Chỉ chạy API mock
docker-compose up json-server
```

### 2. Chạy development mode

#### Yêu cầu
- Node.js 18+
- npm hoặc yarn

#### Các bước thực hiện

1. **Cài đặt dependencies cho cả 2 app**
```bash
# Admin App
cd admin-app && npm install

# User App  
cd ../user-app && npm install
```

2. **Chạy JSON Server (API mock)**
```bash
npx json-server --watch db.json --port 8009
```

3. **Chạy Admin App - Terminal khác**
```bash
cd admin-app && npm run dev
```

4. **Chạy User App - Terminal khác**
```bash
cd user-app && npm run dev
```

5. **Truy cập ứng dụng**
- Admin App: http://localhost:3001
- User App: http://localhost:3002
- API Mock: http://localhost:8009

## Cấu trúc dự án

```
├── admin-app/              # Admin application
│   ├── src/
│   │   ├── components/
│   │   │   └── Upload.tsx  # Upload component
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # API utilities
│   │   └── App.tsx         # Admin App component
│   ├── Dockerfile          # Docker config for admin
│   └── package.json        # Admin dependencies
├── user-app/               # User application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Chat.tsx    # Chat component
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChunkReference.tsx
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # API utilities
│   │   └── App.tsx         # User App component
│   ├── Dockerfile          # Docker config for user
│   └── package.json        # User dependencies
├── src/
├── db.json                # Mock database
├── docker-compose.yml     # Docker Compose configuration
└── README.md             # Documentation
```

## API Endpoints

### 1. Upload Document
```
POST /api/insert_document
Content-Type: application/json

{
  "metadata": {
    "describe": "Mô tả tài liệu",
    "file_name": "filename.txt",
    "file_size": "1024"
  },
  "content": "Nội dung văn bản"
}
```

### 2. RAG Chat
```
POST /api/rag_chat
Content-Type: application/json

{
  "message": "Câu hỏi của user",
  "session_id": "uuid-session-id",
  "file_ids": ["doc-id-1", "doc-id-2"],
  "top_k": 5
}
```

### 3. Normal Chat
```
POST /api/chat
Content-Type: application/json

{
  "session_id": "uuid-session-id",
  "message": "Câu hỏi của user"
}
```

### 4. Get Documents
```
GET /api/get_doc_infor?start_index=0&end_index=100&get_content=false
```

## Tính năng chi tiết

### Admin App - Quản lý Tài liệu
- Hỗ trợ drag & drop hoặc click để chọn file
- Chỉ chấp nhận file .txt
- Yêu cầu mô tả cho mỗi tài liệu
- Lấy lịch sử từ API (đồng bộ multi-device)
- Xóa tài liệu không cần thiết
- Chọn/bỏ chọn tài liệu cho RAG

### User App - Giao diện Chat
- 2 chế độ: RAG Chat và Chat thường
- Quản lý nhiều phiên chat
- Markdown support cho tin nhắn bot
- Voice input (nhận dạng giọng nói)
- ChatGPT-style floating input
- Lưu trữ lịch sử chat persistent

### Quản lý Dữ liệu
- Admin: Dữ liệu tài liệu từ API
- User: Lịch sử chat trong localStorage
- Đồng bộ multi-device cho tài liệu
- Persistent chat sessions

## Troubleshooting

### Lỗi thường gặp

1. **Port đã được sử dụng**
```bash
# Thay đổi port trong docker-compose.yml nếu cần
admin-app:
  ports:
    - "3003:3001"  # Thay vì 3001:3001
user-app:
  ports:
    - "3004:3002"  # Thay vì 3002:3002
```

2. **API không kết nối được**
- Kiểm tra JSON server đang chạy trên port 8009
- Kiểm tra proxy config trong cả 2 vite.config.ts

3. **Build lỗi**
```bash
# Xóa node_modules và reinstall cho cả 2 app
cd admin-app && rm -rf node_modules package-lock.json && npm install
cd ../user-app && rm -rf node_modules package-lock.json && npm install
```

### Development Tips

- Admin App: Focus vào upload/document management
- User App: Focus vào chat experience
- Kiểm tra Network tab để xem API calls ở cả 2 app
- Admin localStorage: selected document IDs
- User localStorage: chat sessions
- Logs của Docker: `docker-compose logs -f`
- Hot reload cho cả 2 apps trong Docker

## Phân quyền

### Admin App (Port 3001)
- Dành cho quản trị viên
- Upload và quản lý tài liệu
- Xem tất cả file đã upload
- Xóa tài liệu không cần thiết

### User App (Port 3002)  
- Dành cho người dùng cuối
- Chỉ chat với AI
- Không thể upload/xóa tài liệu
- Trải nghiệm chat tối ưu

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License