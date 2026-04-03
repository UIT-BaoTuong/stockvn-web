# XenForo Clone - Stock Forum Platform

Nền tảng forum thảo luận chứng khoán với kiến trúc microservices, frontend React, backend Spring Boot, triển khai trên Kubernetes và quản lý cấu hình bằng Kustomize.

## 1. Tech Stack

### Frontend
- React 19
- Vite 7
- React Router DOM
- Axios
- React Query
- Recharts
- Framer Motion
- Nginx (serve static + reverse proxy nội bộ)

### Backend
- Java 21
- Spring Boot 3.4.3
- Spring Web
- Spring Data JPA
- Spring Validation
- Springdoc OpenAPI (Swagger)
- JWT (jjwt)

### Data Layer
- PostgreSQL
- Tách DB theo service:
	- auth_db
	- forum_db

### DevOps / Platform
- Docker
- Kubernetes
- Kustomize
- ArgoCD
- NGINX Ingress Controller
- Tekton (CI/CD event listener + dashboard)
- Grafana monitoring

## 2. System Flow

### Business flow (request flow)
1. User truy cập UI tại stockvn.online hoặc www.stockvn.online.
2. Ingress terminate TLS và route traffic vào service frontend (HTTP nội bộ).
3. Frontend Nginx reverse proxy:
	 - /api/auth/* -> auth-service:8080
	 - /api/forum/* -> forum-service:8080
4. auth-service xử lý đăng nhập, JWT, profile.
5. forum-service xử lý categories, threads, posts, reactions.
6. Mỗi service truy cập PostgreSQL riêng thông qua secret cấu hình.

### Delivery flow (GitOps)
1. Code push lên branch (ví dụ dev).
2. ArgoCD theo dõi repo/path Kubernetes.
3. ArgoCD build Kustomize rồi đồng bộ tài nguyên lên cluster.
4. Ingress expose ứng dụng qua domain public và TLS.

## 3. Domain Map

### Public application
- stockvn.online
- www.stockvn.online

### Platform / Ops domains
- cd.stockvn.online -> ArgoCD UI
- monitor.stockvn.online -> Grafana
- tekton.stockvn.online -> Tekton Dashboard
- dashboard.stockvn.online -> Kubernetes Dashboard
- webhook.stockvn.online -> Tekton Event Listener

Các domain trên đang được định nghĩa trong:
- [kubernetes/ingress.yaml](kubernetes/ingress.yaml)
- [kubernetes/admin-ingress.yaml](kubernetes/admin-ingress.yaml)

## 4. SSL/TLS

### Cơ chế SSL hiện tại
- TLS terminate ở NGINX Ingress.
- Pod frontend/backend giao tiếp nội bộ bằng HTTP trong cluster.
- Ingress đang bật redirect về HTTPS bằng annotations:
	- nginx.ingress.kubernetes.io/ssl-redirect: "true"
	- nginx.ingress.kubernetes.io/force-ssl-redirect: "true" (ở ingress public)

### TLS secret đang dùng
- Secret name: stockvn-tls-secret
- Dùng chung cho nhiều host tại các Ingress.

### Lưu ý với service đặc thù
- ArgoCD và Kubernetes Dashboard backend chạy HTTPS nội bộ, nên ingress có cấu hình backend-protocol HTTPS.

## 5. Kubernetes + Kustomize Structure

Root Kustomize:
- [kubernetes/kustomization.yaml](kubernetes/kustomization.yaml)

Service-level Kustomize:
- [kubernetes/auth-service/kustomization.yaml](kubernetes/auth-service/kustomization.yaml)
- [kubernetes/forum-service/kustomization.yaml](kubernetes/forum-service/kustomization.yaml)
- [kubernetes/frontend/kustomization.yaml](kubernetes/frontend/kustomization.yaml)
- [kubernetes/postgres/kustomization.yaml](kubernetes/postgres/kustomization.yaml)

Build thử local:

```bash
kubectl kustomize kubernetes
```

Apply toàn bộ:

```bash
kubectl apply -k kubernetes
```

## 6. Local Development (Quick Start)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Auth Service
```bash
cd auth-service
./gradlew bootRun
```

### Forum Service
```bash
cd forum-service
./gradlew bootRun
```

Ghi chú: cần PostgreSQL tương ứng với cấu hình datasource trong mỗi service.