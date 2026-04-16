Đây là bản nháp `README.md` chuyên nghiệp và đầy đủ cho dự án **Smart Life OS** – hệ thống quản lý thời gian thông minh tích hợp AI. Bản này được thiết kế để không chỉ giúp bạn quản lý công việc mà còn là một "điểm cộng" cực lớn trong mắt nhà tuyển dụng khi bạn đi thực tập.

---

# 🚀 Smart Life OS - The Adaptive Time Management System

**Smart Life OS** không chỉ là một ứng dụng To-Do list thông thường. Đây là một hệ điều hành cá nhân có khả năng học hỏi thói quen của người dùng, tự động phân loại mức độ ưu tiên bằng AI và đưa ra lịch trình thực tế nhất dựa trên hiệu suất thực thi trong quá khứ.

---

## 🌟 Tính năng cốt lõi (Core Features)

### 1. AI-Powered Auto-Sorter (Eisenhower 2.0)

- **Mô tả:** Người dùng nhập liệu tự do qua văn bản hoặc giọng nói. Hệ thống sử dụng **Gemini AI** để phân tích và tự động gắn thẻ vào ma trận ưu tiên (Quan trọng/Khẩn cấp).
- **Thực tế:** Tự động nhận diện các task như "Học Spring Boot" là _Quan trọng - Dài hạn_, còn "Mua mỹ phẩm chăm sóc da" là _Việc vặt_.

### 2. Adaptive Buffer Scheduling

- **Mô tả:** Hệ thống không chỉ xếp lịch khít kẽ mà tự động cộng thêm "thời gian dự phòng" (Buffer Time) dựa trên dữ liệu lịch sử.
- **Thực tế:** Nếu bạn thường xuyên trễ các task lập trình 20%, hệ thống sẽ tự động cộng thêm 15-20 phút cho mỗi giờ làm việc kế tiếp.

### 3. Focus Tracker & Deep Work Mode

- **Mô tả:** Đồng hồ bấm giờ tích hợp giúp theo dõi thời gian thực hiện thực tế so với dự kiến.
- **Thực tế:** Giao diện tối giản (Minimalist) để loại bỏ xao nhãng, ghi nhận "Thời gian thực thi" để cung cấp dữ liệu cho bộ máy học hỏi của AI.

### 4. Panic Mode (Emergency Rescheduling)

- **Mô tả:** Khi có quá nhiều task bị trễ hoặc dồn ứ, người dùng kích hoạt "Panic Mode".
- **Thực tế:** AI sẽ tự động dọn dẹp lịch trình, hủy bỏ/dời các task không quan trọng và chỉ tập trung vào các deadline "sống còn".

---

## 🛠 Tech Stack

### Frontend

- **Ngôn ngữ chính:** TypeScript (Đã thay thế hoàn toàn JavaScript thuần trong các dự án chuyên nghiệp vì tính an toàn và dễ bảo trì).
- **Framework:** Next.js (để tối ưu SEO và hiệu năng).
- **Styling:** Tailwind CSS (Giao diện hiện đại, responsive tốt trên mobile).
- **Charts:** Recharts (Trực quan hóa biểu đồ năng suất).

### Database

- **Database:** MySQL (Xampp)

### DevOps & Tools

- **Containerization:** Docker & Docker Compose.
- **CI/CD:** GitHub Actions (Tự động build và test khi push code).

---

## 📊 Database Schema (Sơ đồ cơ bản)

Hệ thống tập trung vào tính toàn vẹn dữ liệu để phục vụ phân tích AI:

- **`users`**: `id`, `username`, `password_hash`, `email`, `created_at`.
- **`tasks`**: `id`, `user_id`, `title`, `description`, `category_id`, `priority_score` (AI tính), `estimated_duration`.
- **`schedules`**: `id`, `task_id`, `start_time`, `end_time`, `buffer_applied`, `status` (PENDING, IN_PROGRESS, COMPLETED, DELAYED).
- **`execution_logs`**: `id`, `schedule_id`, `actual_start`, `actual_end`, `efficiency_rate`.
- **`ai_metrics`**: `id`, `user_id`, `category`, `avg_delay_percentage` (Dữ liệu để AI học).

---

## 🏗 Kiến trúc Backend (Architecture)

Dự án tuân thủ mô hình **Layered Architecture** để dễ dàng bảo trì và mở rộng:

```text
src/main/java/com/nguyenanhphu/smartmanager
├── controller    # Tiếp nhận Request từ Frontend
├── service       # Xử lý logic nghiệp vụ (Tính toán Buffer, Gọi Gemini API)
├── repository    # Giao tiếp với MySQL qua JPA/Hibernate
├── entity        # Định nghĩa các bảng Database
├── dto           # Data Transfer Objects
└── config        # Cấu hình Security, Docker, Spring AI
```

---

## 🚀 Hướng dẫn cài đặt (Installation)

1.  **Clone dự án:**
    ```bash
    git clone https://github.com/AnhPhu29/smart-life-os.git
    ```
2.  **Cấu hình môi trường:** Tạo file `.env` từ `.env.example` và điền:
    - `GEMINI_API_KEY`: [Lấy từ Google AI Studio](https://aistudio.google.com)
    - `SMTP_*`: Thông tin email server (Gmail, SendGrid, v.v.)
    - `TELEGRAM_BOT_TOKEN`: Token bot Telegram (nếu muốn dùng Telegram notifications)
3.  **Cài đặt dependencies:**
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```
4.  **Setup database:**
    ```bash
    cd backend
    npm run prisma:push
    ```
5.  **Chạy bằng Docker:**
    ```bash
    docker-compose up -d
    ```
6.  **Truy cập:**
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:8080/api/v1`
    - API Docs: Xem [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🎯 Sử dụng các tính năng mới

### 1. AI Task Classification (Phân loại Task tự động)

```bash
curl -X POST http://localhost:8080/api/v1/tasks/ai-classify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Học Spring Boot",
    "description": "Hoàn thành khóa Spring Boot tutorial"
  }'
```

Hệ thống sẽ:\*\*

- Gọi Gemini AI phân tích task
- Tự động gán vào ma trận Eisenhower
- Tính priority score (0-100)
- Lưu vào database

### 2. Adaptive Buffer Scheduling (Tự động thêm thời gian dự phòng)

```bash
curl -X POST http://localhost:8080/api/v1/schedules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "startTime": "2024-04-20T09:00:00Z",
    "endTime": "2024-04-20T10:30:00Z",
    "applyBuffer": true
  }'
```

**Cách hoạt động:**

- Phân tích 30 ngày dữ liệu lịch sử
- Tính % delay trung bình cho category
- Tự động cộng thêm buffer time (10-50% của task duration)
- Ví dụ: Task 60 phút, delay history 20% → buffer 12 phút → tổng 72 phút

### 3. Email/Telegram Notifications

Các thông báo được gửi tự động khi:

- **Deadline Reminder**: 1 giờ trước deadline
- **Task Đã Quá Hạn**: Khi miss deadline
- **Panic Mode Activated**: Khi kích hoạt chế độ khẩn cấp
- **Task Hoàn Thành**: Sau khi hoàn thành task

Cấu hình email (Gmail):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Create App Password in Gmail settings
```

Cấu hình Telegram:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11  # From @BotFather
```

### 4. Panic Mode (Chế độ khẩn cấp)

Kích hoạt khi có quá nhiều task bị trễ:

```bash
curl -X POST http://localhost:8080/api/v1/schedules/panic-mode/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Hệ thống sẽ tự động:**

- ❌ Hủy các task KHÔNG quan trọng
- ⏰ Thêm buffer cho các task URGENT_IMPORTANT
- 📅 Sắp xếp lại lịch trình
- 📢 Gửi thông báo

### 5. Performance Analytics

Xem phân tích hiệu suất theo category:

```bash
curl -X GET http://localhost:8080/api/v1/tasks/ai/performance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "Learning": {
    "total": 10,
    "delayed": 2,
    "avgDelay": 15.5
  }
}
```

---

## 🔧 CI/CD Pipeline (GitHub Actions)

Tự động build, test, và deploy khi push code:

### Backend Pipeline (`.github/workflows/backend.yml`)

- ✅ Cài node_modules
- ✅ Generate Prisma Client
- ✅ Compile TypeScript
- ✅ Type checking
- ✅ Security scan (npm audit)

### Frontend Pipeline (`.github/workflows/frontend.yml`)

- ✅ Cài dependencies
- ✅ Next.js lint
- ✅ Build app
- ✅ Type checking

### Docker Pipeline (`.github/workflows/docker.yml`)

- 🐳 Build Docker images (backend + frontend)
- 📤 Push to Docker Hub / GitHub Container Registry
- 🔄 Multi-stage build cho optimization

**Setup GitHub Actions:**

1. Tạo `.github/workflows/` folder (đã có)
2. Add secrets vào GitHub:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `GEMINI_API_KEY`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   - `TELEGRAM_BOT_TOKEN`

---

## 📊 Database Schema (Updated)

```plaintext
users (1) ──── (N) tasks
              ──── (N) ai_metrics
              ──── (N) categories

tasks (1) ──── (N) schedules
          ──── (1) categories

schedules (1) ──── (N) execution_logs

execution_logs: Tracks actual time vs planned time
ai_metrics: Tracks performance per category
```

---

## 📈 Định hướng phát triển (Roadmap)

- [x] Hoàn thiện Module tích hợp Gemini AI để phân loại Task.
- [x] Xây dựng thuật toán Adaptive Buffer dựa trên dữ liệu lịch sử 30 ngày.
- [x] Tích hợp thông báo qua Telegram/Email cho các deadline quan trọng.
- [x] Triển khai hệ thống tự động hóa CI/CD hoàn chỉnh để sẵn sàng cho môi trường Production.

---

_Dự án được thực hiện bởi **Phu** - Với mục tiêu tối ưu hóa hiệu suất cá nhân và chinh phục công nghệ Backend._

---

Hy vọng bản `README.md` này sẽ là bộ khung vững chắc để bạn bắt đầu dự án. Hãy tận dụng các tính năng tích hợp AI để nâng cao hiệu suất quản lý thời gian của bạn!
