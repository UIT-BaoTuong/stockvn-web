# StockVN - XenForo Clone

## Domain
- Public site: stockvn.online

## Tech Stack
- Frontend: React + Vite + Nginx
- Backend:
	- auth-service: Spring Boot
	- forum-service: Spring Boot
- Data: PostgreSQL
- Container/Orchestration: Docker + Kubernetes
- Config management: Kustomize, Ansible
- CI/CD: Tekton + ArgoCD (GitOps)
- Monitoring: Prometheus + Grafana
- Ingress/SSL: NGINX Ingress + TLS secret

## System Flow

<img width="721" height="431" alt="System flow" src="https://github.com/user-attachments/assets/67060940-8004-4aa6-acb8-71f08805e654" />

## Tekton Dashboard
Dashboard theo dõi pipeline CI/CD. Tại đây có thể xem trạng thái pipeline run, task run, log từng step build/test/deploy và debug khi pipeline fail.

<img width="1919" height="940" alt="Tekton dashboard" src="https://github.com/user-attachments/assets/48eeae1c-c0d2-4e71-a640-59e2feee65cd" />

## ArgoCD Dashboard
Dashboard GitOps hiển thị trạng thái đồng bộ giữa Git và Kubernetes cluster. Dùng để sync/re-sync app, theo dõi drift và rollback theo revision.

<img width="1440" height="786" alt="ArgoCD dashboard" src="https://github.com/user-attachments/assets/23cdf560-49e3-405f-834e-176d40306dd9" />

## Prometheus Monitoring
Giao diện giám sát metrics hệ thống và ứng dụng. Dùng để query số liệu, theo dõi health, latency, tài nguyên và làm nguồn dữ liệu cho cảnh báo/dashboard.

<img width="1919" height="952" alt="Prometheus monitoring" src="https://github.com/user-attachments/assets/71c51aa3-3130-4a94-bb35-0a82c56a319f" />

## DNS / Domain Mapping
Cấu hình DNS mapping các subdomain dịch vụ (app, ArgoCD, monitoring, dashboard, webhook...) về ingress endpoint để truy cập từ internet.

<img width="1421" height="494" alt="DNS mapping" src="https://github.com/user-attachments/assets/b5293698-b92b-416c-8902-a38306289b6a" />

## Frontend UI
Giao diện người dùng của nền tảng StockVN. Người dùng truy cập, xem bài viết/chủ đề, tương tác forum và gọi API backend thông qua route /api/auth và /api/forum.

<img width="1919" height="964" alt="Frontend UI" src="https://github.com/user-attachments/assets/042dedd0-79c3-417d-9f86-e25c47657df5" />

