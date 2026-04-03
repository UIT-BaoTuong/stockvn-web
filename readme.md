# StockVN - Online Forum

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

## CI/CD Flow

This diagram represents the full infrastructure + CI/CD + delivery workflow:
<img width="721" height="501" alt="Image" src="https://github.com/user-attachments/assets/0f0eb8bb-a7e6-4711-a6f2-f4afbc6adf57" />

### Infrastructure bootstrap (top layer)
1. Terraform provisions cloud infrastructure on Azure.
2. Terraform creates/provisions the Kubernetes environment (AKS).
3. Ansible applies post-provision configuration (cluster/tooling setup).

### Application CI/CD and GitOps delivery (runtime layer)
1. Developers push code to GitHub.
2. GitHub webhook triggers Tekton Pipeline.
3. Tekton builds Docker images for application services.
4. Tekton pushes images to Docker Hub.
5. Tekton updates Kubernetes manifests (YAML/image tags) in Git.
6. ArgoCD detects manifest changes and syncs from Git (GitOps).
7. ArgoCD deploys workloads to Kubernetes.
8. NGINX Ingress exposes services through a public IP with SSL/TLS.
9. DNS maps stockvn.online and subdomains to the Ingress public IP.
10. End users access the application through domain endpoints.
11. Prometheus monitors Kubernetes workloads and cluster metrics.



## Pipeline Strengths
- End-to-end automation from source commit to Kubernetes deployment.
- Clear GitOps model using ArgoCD for declarative sync and drift detection.
- Modular microservice structure with independent service manifests.
- Kustomize-based image tag updates for cleaner Kubernetes configuration management.
- Practical observability stack with Prometheus and Grafana.
- Cloud + platform bootstrap flow is documented (Terraform + Ansible + AKS).

## Pipeline Weaknesses
- Test stage is still lightweight and should include real unit/integration checks as a hard gate.
- Security gates are not fully integrated yet (SAST, dependency scanning, image CVE scanning, signing/SBOM).
- Environment promotion strategy can be improved (dev -> staging -> production approvals).
- Access control can be tightened further with least-privilege RBAC and scoped service accounts.
- Some workflows still rely on direct manifest updates; PR-based manifest promotion would be safer.
- Reliability controls can be expanded (rollback automation, release strategy, stricter quality policies).

## Tekton Dashboard
This dashboard is used to track CI/CD pipelines. You can inspect pipeline runs, task runs, step logs for build/test/deploy, and debug failed executions.

<img width="1919" height="940" alt="Tekton dashboard" src="https://github.com/user-attachments/assets/48eeae1c-c0d2-4e71-a640-59e2feee65cd" />

## ArgoCD Dashboard
This GitOps dashboard shows sync status between Git and the Kubernetes cluster. It is used to sync/re-sync applications, detect drift, and roll back by revision.

<img width="1440" height="786" alt="ArgoCD dashboard" src="https://github.com/user-attachments/assets/23cdf560-49e3-405f-834e-176d40306dd9" />

## Prometheus Monitoring
Monitoring interface for system and application metrics. It is used to query data, observe health/latency/resource usage, and provide data for alerts and dashboards.

<img width="1919" height="952" alt="Prometheus monitoring" src="https://github.com/user-attachments/assets/71c51aa3-3130-4a94-bb35-0a82c56a319f" />

## DNS / Domain Mapping
DNS records map service subdomains (app, ArgoCD, monitoring, dashboard, webhook, and others) to the Ingress endpoint for public internet access.

<img width="1463" height="718" alt="Image" src="https://github.com/user-attachments/assets/268b67ff-28ce-497f-860c-efe1e59e1613" />

## Frontend UI
Main user interface of the StockVN platform. Users browse topics/posts, interact with the forum, and call backend APIs through /api/auth and /api/forum routes.

<img width="1919" height="964" alt="Frontend UI" src="https://github.com/user-attachments/assets/042dedd0-79c3-417d-9f86-e25c47657df5" />

