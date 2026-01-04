# 🎓 E-Learning System

> A modern, full-stack e-learning platform with AI-powered chatbot, real-time notifications, and microservices architecture.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Services](#-services)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

E-Learning System là một nền tảng học trực tuyến hiện đại với các tính năng:

- **💡 AI-Powered Learning**: Chatbot AI hỗ trợ học tập với RAG (Retrieval-Augmented Generation)
- **🔄 Real-time Features**: WebSocket cho notifications và live updates
- **🎯 Microservices Architecture**: Backend (Spring Boot), Frontend (React), AI Chatbot (FastAPI)
- **📊 Event-Driven**: Kafka integration cho async communication
- **🚀 Production-Ready**: Docker support, caching với Redis, scalable design

## ✨ Features

### 🎓 Core Features

- ✅ **Course Management**: Tạo, quản lý, publish courses với rich content
- ✅ **User Roles**: Student, Instructor, Admin với permission-based access
- ✅ **Enrollment System**: Course registration, progress tracking, certificates
- ✅ **Payment Integration**: Shopping cart, orders, promotions, discounts
- ✅ **Review & Rating**: Course reviews với rating system
- ✅ **Commission System**: Instructor payouts và commission tracking

### 🤖 AI Chatbot Features

- ✅ **RAG-Powered Q&A**: Trả lời câu hỏi dựa trên course content
- ✅ **Multi-Provider AI**: Support Gemini, OpenAI, Anthropic
- ✅ **Real-time Streaming**: Stream responses cho better UX
- ✅ **Conversation Memory**: Context-aware conversations
- ✅ **Auto-Sync**: Kafka consumer tự động sync course data

### 🔔 Real-time Features

- ✅ **WebSocket Notifications**: Instant notifications cho users
- ✅ **Live Updates**: Real-time course status changes
- ✅ **Event-Driven**: Kafka events cho course lifecycle

### 🛡️ Security & Performance

- ✅ **JWT Authentication**: Secure token-based auth với refresh tokens
- ✅ **OAuth2 Integration**: Google login support
- ✅ **Redis Caching**: Cache cho better performance
- ✅ **Rate Limiting**: API rate limiting
- ✅ **CORS Configuration**: Secure cross-origin requests

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     E-Learning System                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Frontend   │───▶│   Backend    │───▶│  Chatbot AI │   │
│  │  React + TS  │    │ Spring Boot  │    │   FastAPI    │   │
│  │   Port 5173  │    │  Port 8080   │    │  Port 8000   │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                    │                    │         │
│         │                    ▼                    ▼         │
│         │            ┌──────────────┐    ┌──────────────┐   │
│         │            │  PostgreSQL  │    │   ChromaDB   │   │
│         │            │  Port 5432   │    │ Vector Store │   │
│         │            └──────────────┘    └──────────────┘   │
│         │                    │                              │
│         │                    ▼                              │
│         │            ┌──────────────┐    ┌──────────────┐   │
│         └──────────▶│    Redis     │   │    Kafka     │    │
│                      │  Port 6379   │    │  Port 9092   │   │
│                      └──────────────┘    └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flows

1. **REST API**: Frontend ↔ Backend (HTTP)
2. **WebSocket**: Backend → Frontend (Notifications)
3. **Kafka Events**: Backend → Chatbot (Course sync)
4. **HTTP Client**: Chatbot → Backend (Data fetching)

## 🛠️ Tech Stack

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.5.0
- **Language**: Java 21
- **Database**: PostgreSQL + Spring Data JPA
- **Security**: Spring Security + JWT
- **Messaging**: Apache Kafka, WebSocket (STOMP)
- **Caching**: Redis
- **API Docs**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Gradle (Kotlin DSL)
- **Mapping**: MapStruct
- **Storage**: Cloudinary

### Frontend (React)

- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **UI Library**: Material-UI 7.3.2
- **Routing**: React Router DOM 7.8.2
- **State Management**: Zustand 5.0.8
- **Forms**: React Hook Form 7.62.0 + Yup
- **HTTP Client**: Axios 1.13.2
- **Styling**: Tailwind CSS 3.4.17
- **Charts**: Recharts, ApexCharts
- **Markdown**: React Markdown
- **WebSocket**: STOMP.js + SockJS

### AI Chatbot (FastAPI)

- **Framework**: FastAPI 0.115.0
- **Language**: Python 3.12
- **AI Providers**: Google Gemini, OpenAI, Anthropic
- **RAG**: LangChain 0.3.x
- **Vector DB**: ChromaDB 0.5.x
- **Embeddings**: Sentence Transformers
- **Database**: PostgreSQL + SQLAlchemy
- **Messaging**: Kafka (kafka-python)
- **WebSocket**: Native WebSocket support
- **Server**: Uvicorn (ASGI)

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Message Broker**: Apache Kafka (KRaft mode)
- **Cache**: Redis 7 Alpine
- **Database**: PostgreSQL 15+

## 🚀 Getting Started

### Prerequisites

- **Java**: 21+
- **Node.js**: 18+
- **Python**: 3.12+
- **Docker**: Latest version (optional)
- **PostgreSQL**: 15+ (hoặc dùng Docker)
- **Redis**: 7+ (hoặc dùng Docker)
- **Kafka**: Latest (hoặc dùng Docker)

### Installation

#### 1. Clone Repository

```bash
git clone <repository-url>
cd Elearning-System
```

#### 2. Setup Infrastructure (Docker)

```bash
# Start Kafka và Redis
docker-compose up -d

# Verify services
docker ps
```

#### 3. Setup Backend (Spring Boot)

```bash
cd BackEnd

# Tạo file .env (copy từ .env.example nếu có)
# Hoặc cấu hình trong application.properties

# Build và run
./gradlew bootRun

# Hoặc build JAR
./gradlew build
java -jar build/libs/BackEnd-0.0.1-SNAPSHOT.jar
```

**Backend sẽ chạy tại**: http://localhost:8080

#### 4. Setup Frontend (React)

```bash
cd FrontEnd

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend sẽ chạy tại**: http://localhost:5173

#### 5. Setup AI Chatbot (FastAPI)

```bash
cd ChatbotService

# Tạo virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate
# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Tạo file .env với config
# GEMINI_API_KEY=your_api_key_here
# DATABASE_URL=postgresql://user:password@localhost:5432/elearning
# SPRING_BOOT_URL=http://localhost:8080

# Run server
python main.py
```

**Chatbot API sẽ chạy tại**: http://localhost:8000

### Environment Variables

#### Backend (.env hoặc application.properties)

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/elearning
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT
jwt.secret=your_secret_key
jwt.access-token-expiration=3600000
jwt.refresh-token-expiration=604800000

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Kafka
spring.kafka.bootstrap-servers=localhost:9092

# Cloudinary
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

#### Chatbot (.env)

```env
# AI Provider
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key  # optional

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/elearning

# Spring Boot Integration
SPRING_BOOT_URL=http://localhost:8080

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

## 📦 Services

### 🔧 Backend Service (Port 8080)

**Key Features**:

- RESTful API với Swagger UI: `/swagger-ui.html`
- WebSocket endpoint: `/ws`
- JWT authentication
- Role-based authorization
- Kafka producer cho course events
- Redis caching

**Main Endpoints**:

- `/api/auth/*` - Authentication
- `/api/courses/*` - Course management
- `/api/users/*` - User management
- `/api/enrollments/*` - Enrollment management
- `/api/orders/*` - Order & payment
- `/api/reviews/*` - Reviews & ratings
- `/api/notifications/*` - Notifications

### 🎨 Frontend Service (Port 5173)

**Key Features**:

- Modern React với TypeScript
- Material-UI components
- Real-time notifications qua WebSocket
- Responsive design
- OAuth2 Google login
- Shopping cart & checkout
- Rich text editor cho course content

**Main Pages**:

- `/` - Homepage
- `/courses` - Course catalog
- `/course/:slug` - Course detail
- `/learn/:id` - Learning interface
- `/instructor/*` - Instructor dashboard
- `/admin/*` - Admin panel
- `/cart` - Shopping cart
- `/profile` - User profile

### 🤖 AI Chatbot Service (Port 8000)

**Key Features**:

- RAG-powered Q&A
- Streaming responses
- WebSocket support
- Multi-provider AI (Gemini, OpenAI, Anthropic)
- Conversation memory
- Auto-sync với Backend qua Kafka
- Vector search với ChromaDB

**Main Endpoints**:

- `/api/chat` - Chat endpoint (POST)
- `/api/chat/stream` - Streaming chat (POST)
- `/ws/chat` - WebSocket chat
- `/api/health` - Health check
- `/docs` - API documentation

## 📚 API Documentation

### Backend API

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### Chatbot API

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
Elearning-System/
├── BackEnd/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/example/elearning/
│   │   │   │   ├── config/        # Configuration classes
│   │   │   │   ├── constant/      # Constants (NotificationTemplate, etc.)
│   │   │   │   ├── controller/    # REST Controllers
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── entity/        # JPA Entities
│   │   │   │   ├── enums/         # Enumerations
│   │   │   │   ├── exception/     # Exception handling
│   │   │   │   ├── mapper/        # MapStruct mappers
│   │   │   │   ├── repository/    # Spring Data JPA repositories
│   │   │   │   ├── security/      # Security configuration
│   │   │   │   ├── service/       # Business logic
│   │   │   │   ├── specification/ # JPA Specifications
│   │   │   │   └── websocket/     # WebSocket handlers
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── build.gradle.kts          # Gradle build file
│   └── uploads/                  # File uploads storage
│
├── FrontEnd/                     # React Frontend
│   ├── public/                   # Static assets
│   │   └── images/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── admin/            # Admin components
│   │   │   ├── banner/           # Banner components
│   │   │   ├── course/           # Course components
│   │   │   └── ...
│   │   ├── configs/              # App configurations
│   │   ├── context/              # React contexts
│   │   ├── data/                 # Static data
│   │   ├── hooks/                # Custom hooks
│   │   ├── libs/                 # Utility libraries
│   │   ├── pages/                # Page components
│   │   ├── service/              # API services
│   │   ├── store/                # Zustand stores
│   │   ├── types/                # TypeScript types
│   │   ├── main.tsx              # Entry point
│   │   └── routes.tsx            # Route definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── ChatbotService/               # FastAPI AI Chatbot
│   ├── app/
│   │   ├── ai/                   # AI provider integrations
│   │   │   ├── gemini.py         # Gemini integration
│   │   │   ├── providers.py      # Multi-provider support
│   │   │   ├── memory.py         # Conversation memory
│   │   │   └── ...
│   │   ├── api/                  # API routes
│   │   │   ├── routes.py         # HTTP endpoints
│   │   │   └── websocket.py      # WebSocket endpoint
│   │   ├── constants/            # Constants (Kafka topics, etc.)
│   │   ├── core/                 # Core configurations
│   │   │   ├── config.py         # Settings
│   │   │   ├── database.py       # Database setup
│   │   │   └── spring_boot_client.py
│   │   ├── models/               # Data models
│   │   │   ├── schemas.py        # Pydantic models
│   │   │   └── sql_models.py     # SQLAlchemy models
│   │   ├── rag/                  # RAG components
│   │   │   ├── retriever.py      # Retrieval logic
│   │   │   └── vector_store.py   # ChromaDB interface
│   │   └── services/             # Business logic
│   │       ├── chatbot_service.py
│   │       ├── course_sync.py
│   │       └── kafka_consumer.py
│   ├── chroma_db/                # Vector database storage
│   ├── scripts/                  # Utility scripts
│   │   ├── seed_data.py          # Seed vector store
│   │   └── reset_database.py     # Reset database
│   ├── uploads/                  # File uploads
│   ├── main.py                   # FastAPI application
│   └── requirements.txt          # Python dependencies
│
├── docker-compose.yml            # Docker services (Kafka, Redis)
└── README.md                     # This file
```

## 🧪 Testing

### Backend Tests

```bash
cd BackEnd
./gradlew test
```

### Frontend Tests

```bash
cd FrontEnd
npm run test
```

### Chatbot Tests

```bash
cd ChatbotService
pytest
```

## 🔄 Development Workflow

### Backend Development

1. Make changes trong `src/main/java`
2. Spring Boot DevTools sẽ auto-reload
3. Test API với Swagger UI
4. Check logs trong console

### Frontend Development

1. Make changes trong `src/`
2. Vite HMR sẽ auto-reload browser
3. Use React DevTools để debug
4. Check console cho errors

### Chatbot Development

1. Make changes trong `app/`
2. Uvicorn reload mode sẽ auto-restart
3. Test với FastAPI docs
4. Check logs trong console

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Developer**: Spring Boot, PostgreSQL, Kafka
- **Frontend Developer**: React, TypeScript, Material-UI
- **AI Engineer**: FastAPI, LangChain, RAG

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: See individual service README files
- **Email**: support@elearning.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Video streaming integration
- [ ] Live coding environment
- [ ] Peer-to-peer learning
- [ ] Blockchain certificates
- [ ] Advanced AI tutor features

---

Made with ❤️ by E-Learning Team
