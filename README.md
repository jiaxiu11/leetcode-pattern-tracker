# LeetCode Pattern Tracker

A spaced repetition tool for tracking LeetCode problems by pattern. Log problems, rate your confidence, and get scheduled review reminders based on how well you solved each one.

**Stack:** React + Vite · Express · PostgreSQL 16 · Docker · Kubernetes · ArgoCD · GitHub Actions

---

## Features

- Auto-fill problem name, difficulty, and pattern from NeetCode or LeetCode URLs
- Solve timer — paste a URL, start the timer, click Done when finished
- 3-point confidence rating drives spaced repetition review schedule
- Pattern-level progress tracking across NeetCode 150
- Dashboard with avg solve time, review queue, and rating distribution

---

## Local Development

**Prerequisites:** Docker, Docker Compose

1. Copy the env file and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Start all services (PostgreSQL, backend, frontend with hot reload):
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. Open [http://localhost:5173](http://localhost:5173)

The dev stack mounts local source files as volumes, so changes to `frontend/` and `backend/` reflect immediately without rebuilding.

To tear down:
```bash
docker compose -f docker-compose.dev.yml down
```

---

## Project Structure

```
.
├── frontend/                  # React + Vite SPA
│   ├── leetcode-pattern-tracker.jsx
│   └── Dockerfile
├── backend/                   # Express API + PostgreSQL
│   ├── server.js
│   └── Dockerfile
├── k8s/                       # Kubernetes manifests
│   ├── frontend/              # Deployment + Service
│   ├── backend/               # Deployment + Service
│   ├── db/                    # StatefulSet, Service, PVC, SealedSecret
│   └── ingress.yaml
├── argocd/
│   └── app.yaml               # ArgoCD Application definition
├── .github/workflows/
│   └── ci.yaml                # Build + deploy pipeline
├── docker-compose.yml         # Production-style local stack
└── docker-compose.dev.yml     # Dev stack with hot reload
```

---

## CI/CD Pipeline

On every push to `main` that touches `frontend/` or `backend/` (or via manual trigger):

1. **Path detection** — `dorny/paths-filter` determines which services changed
2. **Build & push** — only changed services are rebuilt and pushed to GHCR:
   - `ghcr.io/jiaxiu11/leetcode-pattern-tracker/frontend:<sha>`
   - `ghcr.io/jiaxiu11/leetcode-pattern-tracker/backend:<sha>`
   - Image tag = first 7 characters of the commit SHA
3. **Manifest update** — CI commits updated image tags back to `k8s/*/deployment.yaml`
4. **ArgoCD sync** — detects the manifest change and rolls out the new images automatically

```
push to main
    │
    ▼
GitHub Actions
    ├── build frontend image → push to GHCR
    ├── build backend image  → push to GHCR
    └── commit updated image tags to k8s/
            │
            ▼
        ArgoCD (self-heal + auto-prune)
            └── applies updated manifests to cluster
```

---

## Kubernetes Setup

All manifests live in `k8s/` and are managed by ArgoCD with recursive directory discovery.

| Resource | File | Notes |
|---|---|---|
| Frontend Deployment | `k8s/frontend/deployment.yaml` | nginx, port 80 |
| Frontend Service | `k8s/frontend/service.yaml` | ClusterIP |
| Backend Deployment | `k8s/backend/deployment.yaml` | Node.js, port 3001 |
| Backend Service | `k8s/backend/service.yaml` | ClusterIP |
| DB StatefulSet | `k8s/db/statefulset.yaml` | postgres:16-alpine |
| DB Service | `k8s/db/service.yaml` | ClusterIP, headless |
| DB PVC | `k8s/db/pvc.yaml` | 1Gi ReadWriteOnce |
| DB Secret | `k8s/db/sealed-secret.yaml` | Bitnami SealedSecret |
| Ingress | `k8s/ingress.yaml` | NGINX, routes `/api` → backend, `/` → frontend |

### Secrets

Secrets are managed with [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets). The plaintext template is `k8s/db/secret.yaml` (excluded from ArgoCD sync). To rotate or apply secrets:

```bash
# 1. Update values in .env
# 2. Seal and commit
export $(cat .env | xargs)
envsubst < k8s/db/secret.yaml | kubeseal --format yaml > k8s/db/sealed-secret.yaml
git add k8s/db/sealed-secret.yaml && git commit -m "rotate db secret" && git push
```

ArgoCD will apply the updated sealed secret automatically.

---

## ArgoCD Setup

The ArgoCD Application is defined in `argocd/app.yaml`.

```bash
# Apply the ArgoCD app (one-time setup)
kubectl apply -f argocd/app.yaml
```

Key settings:
- **Source:** `k8s/` with recursive directory traversal
- **Sync policy:** automated, with auto-prune and self-heal enabled
- **Excluded:** `k8s/db/secret.yaml` (use sealed-secret instead)

---

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/data` | Load all problems and pattern notes |
| `PUT` | `/api/data` | Upsert problems and pattern notes (bulk) |

The backend performs all writes in a single PostgreSQL transaction (BEGIN/COMMIT/ROLLBACK).

---

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `DATABASE_URL` | Full connection string (auto-constructed in k8s) |
| `VITE_API_URL` | Backend URL for the frontend (default: empty = same origin) |
