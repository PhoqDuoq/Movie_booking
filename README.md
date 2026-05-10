# Movie Booking Website

Hệ thống website đặt vé xem phim được xây dựng theo mô hình **microservices**, gồm frontend giao diện người dùng và backend tách thành nhiều dịch vụ độc lập như quản lý người dùng, danh mục phim, đặt vé, thanh toán và thông báo.

---

## 1. Công nghệ sử dụng

### Frontend

- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS
- Radix UI / shadcn-style components
- Zustand
- Recharts

### Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT Authentication
- Redis
- Docker Compose

---

## 2. Kiến trúc hệ thống

Backend được tổ chức theo dạng NestJS monorepo, gồm các service:

| Service | Chức năng | Port |
|---|---|---:|
| API Gateway | Cổng truy cập chung, chuyển tiếp request đến các service phía sau | `3000` |
| User Service | Đăng ký, đăng nhập, xác thực người dùng | `3001` |
| Catalog Service | Quản lý phim, rạp, suất chiếu | `3002` |
| Booking Service | Khóa ghế, xác nhận đặt vé, quản lý ghế | `3003` |
| Payment Service | Tạo thanh toán, webhook giả lập, cổng thanh toán mô phỏng | `3004` |
| Notification Service | Nhận sự kiện thanh toán qua Redis và xử lý gửi thông báo | Redis microservice |

API Gateway hiện chuyển tiếp request theo các prefix:

| Prefix qua Gateway | Service đích |
|---|---|
| `/api/users` | User Service |
| `/api/catalog` | Catalog Service |
| `/api/bookings` | Booking Service |
| `/api/payments` | Payment Service |

---

## 3. Cấu trúc thư mục

```text
Movie_booking/
├─ backend/
│  ├─ docker-compose.yml
│  └─ movie-system/
│     ├─ apps/
│     │  ├─ api-gateway/
│     │  ├─ user-service/
│     │  ├─ catalog-service/
│     │  ├─ booking-service/
│     │  ├─ payment-service/
│     │  └─ notification-service/
│     ├─ package.json
│     ├─ package-lock.json
│     ├─ nest-cli.json
│     ├─ tsconfig.json
│     └─ .env.example
│
├─ frontend/
│  ├─ src/
│  ├─ package.json
│  ├─ package-lock.json
│  └─ vite.config.ts
│
├─ start-all.bat
├─ .gitignore
└─ README.md
