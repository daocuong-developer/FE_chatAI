# RAG Chat Application

Ứng dụng chat AI với khả năng RAG (Retrieval-Augmented Generation) cho phép người dùng upload tài liệu và trò chuyện dựa trên nội dung tài liệu đó.

## Tính năng chính

- 📄 **Upload tài liệu**: Tải lên file văn bản (.txt) với mô tả
- 💬 **RAG Chat**: Trò chuyện dựa trên nội dung tài liệu đã upload
- 🤖 **Chat thường**: Trò chuyện AI không dựa trên tài liệu
- 📚 **Quản lý tài liệu**: Xem lịch sử upload, chọn/bỏ chọn tài liệu
- 💾 **Lưu trữ local**: Dữ liệu được lưu trong localStorage
- 🔄 **Đa phiên chat**: Quản lý nhiều cuộc trò chuyện

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
# Chạy tất cả services
docker-compose up -d

# Hoặc chạy và xem logs
docker-compose up
```

3. **Truy cập ứng dụng**
- Frontend: http://localhost:3000
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

# Chỉ chạy frontend
docker-compose up frontend

# Chỉ chạy API mock
docker-compose up json-server
```

### 2. Chạy development mode

#### Yêu cầu
- Node.js 18+
- npm hoặc yarn

#### Các bước thực hiện

1. **Cài đặt dependencies**
```bash
npm install
```

2. **Chạy development server**
```bash
npm run dev
```

3. **Chạy JSON Server (API mock) - Terminal khác**
```bash
npx json-server --watch db.json --port 8009
```

4. **Truy cập ứng dụng**
- Frontend: http://localhost:5173
- API Mock: http://localhost:8009

## Cấu trúc dự án

```
├── src/
│   ├── components/          # React components
│   │   ├── Chat.tsx        # Component chat chính
│   │   ├── ChatMessage.tsx # Component tin nhắn
│   │   └── Upload.tsx      # Component upload tài liệu
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   │   ├── api.ts         # API calls
│   │   └── uuid.ts        # UUID validation
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point
├── db.json                # Mock database
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── nginx.conf            # Nginx configuration
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

### Upload Tài liệu
- Hỗ trợ drag & drop hoặc click để chọn file
- Chỉ chấp nhận file .txt
- Yêu cầu mô tả cho mỗi tài liệu
- Lưu lịch sử upload với khả năng chọn lại

### Chat Interface
- 2 chế độ: RAG Chat và Chat thường
- Quản lý nhiều phiên chat
- Markdown support cho tin nhắn bot
- Lưu trữ lịch sử chat persistent

### Quản lý Dữ liệu
- Tất cả dữ liệu lưu trong localStorage
- Không mất dữ liệu khi reload trang
- Có thể xóa lịch sử chat/upload

## Troubleshooting

### Lỗi thường gặp

1. **Port đã được sử dụng**
```bash
# Thay đổi port trong docker-compose.yml
ports:
  - "3001:80"  # Thay vì 3000:80
```

2. **API không kết nối được**
- Kiểm tra JSON server đang chạy trên port 8009
- Kiểm tra proxy config trong vite.config.ts

3. **Build lỗi**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Development Tips

- Sử dụng React DevTools để debug
- Kiểm tra Network tab để xem API calls
- Xem localStorage trong Browser DevTools
- Logs của Docker: `docker-compose logs -f`

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License