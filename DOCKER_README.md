# Docker Compose E-learning System

Hệ thống E-learning được containerized với Docker Compose, bao gồm:
- **Backend**: Spring Boot (Java 21)
- **Frontend**: React + Vite
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Queue**: Apache Kafka

## Yêu cầu

- Docker Desktop hoặc Docker Engine + Docker Compose
- Ít nhất 4GB RAM
- 10GB dung lượng đĩa trống

## Cài đặt nhanh

### 1. Clone repository và cấu hình môi trường

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
# Ít nhất cần cấu hình JWT_SECRET
```

### 2. Build và chạy tất cả services

```bash
# Build và start tất cả containers
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092

## Quản lý Services

### Dừng tất cả services
```bash
docker-compose down
```

### Dừng và xóa volumes (xóa dữ liệu)
```bash
docker-compose down -v
```

### Restart một service cụ thể
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild một service
```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Xem trạng thái services
```bash
docker-compose ps
```

### Xem resource usage
```bash
docker stats
```

## Development

### Chạy chỉ infrastructure (không build backend/frontend)

Nếu bạn muốn chạy backend/frontend locally nhưng vẫn dùng PostgreSQL, Redis, Kafka từ Docker:

```bash
# Chạy chỉ postgres, redis, kafka
docker-compose up -d postgres redis kafka

# Sau đó chạy backend và frontend locally như bình thường
```

### Hot reload trong Docker

Để enable hot reload, bạn có thể mount source code:

**Backend** (thêm vào docker-compose.yml):
```yaml
volumes:
  - ./BackEnd/src:/app/src
```

**Frontend** (sử dụng dev server thay vì production build):
```yaml
command: npm run dev -- --host
ports:
  - "5173:5173"
volumes:
  - ./FrontEnd:/app
  - /app/node_modules
```

## Troubleshooting

### Backend không kết nối được database
```bash
# Kiểm tra postgres đã ready chưa
docker-compose logs postgres

# Restart backend
docker-compose restart backend
```

### Frontend không gọi được API
- Kiểm tra VITE_API_URL trong FrontEnd/.env
- Đảm bảo backend đang chạy: `docker-compose ps`

### Out of memory
```bash
# Tăng memory cho Docker Desktop
# Settings > Resources > Memory > Tăng lên 4GB+

# Hoặc giảm số services chạy đồng thời
docker-compose up -d postgres redis backend
```

### Xóa tất cả và bắt đầu lại
```bash
# Dừng và xóa containers, networks, volumes
docker-compose down -v

# Xóa images (optional)
docker-compose down --rmi all -v

# Build và start lại
docker-compose up -d --build
```

## Production Deployment

### Sử dụng .env file riêng cho production
```bash
docker-compose --env-file .env.production up -d
```

### Cấu hình bảo mật
1. Thay đổi tất cả passwords mặc định
2. Sử dụng secrets thay vì environment variables
3. Enable HTTPS với reverse proxy (nginx/traefik)
4. Giới hạn exposed ports
5. Sử dụng Docker secrets cho sensitive data

### Health checks
Tất cả services đều có health checks. Kiểm tra:
```bash
docker-compose ps
# Cột STATUS sẽ hiển thị "healthy" khi service sẵn sàng
```

## Backup & Restore

### Backup PostgreSQL
```bash
docker-compose exec postgres pg_dump -U postgres elearning > backup.sql
```

### Restore PostgreSQL
```bash
docker-compose exec -T postgres psql -U postgres elearning < backup.sql
```

### Backup uploads folder
```bash
tar -czf uploads-backup.tar.gz BackEnd/uploads/
```

## Monitoring

### View logs in real-time
```bash
docker-compose logs -f --tail=100
```

### Check resource usage
```bash
docker stats
```

### Inspect a container
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Network

Tất cả services đều trong cùng network `elearning-network`, cho phép chúng giao tiếp với nhau qua service names:
- Backend → Postgres: `jdbc:postgresql://postgres:5432/elearning`
- Backend → Redis: `redis:6379`
- Backend → Kafka: `kafka:9092`
- Frontend → Backend: `http://backend:8080`

## Volumes

- `postgres_data`: Lưu trữ database
- `kafka_data`: Lưu trữ Kafka logs
- `redis_data`: Lưu trữ Redis data
- `./BackEnd/uploads`: Lưu trữ uploaded files

## License

MIT
