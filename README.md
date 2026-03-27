# Mazar Frontend (Next.js)

## Overview

This is the frontend for the Mazar MVP.

- Tech stack: Next.js 16, React 18, TypeScript, TailwindCSS, PWA
- Port: `3000`
- Docker image (current): `keroles149/mazar_frontend:<tag>`

The frontend talks to the backend using a **build-time** environment variable:

- `NEXT_PUBLIC_API_URL` – public HTTP URL of the backend service.

Because this is a `NEXT_PUBLIC_*` variable, it **must be set at build time**, not at runtime.

---

## Local development

```bash
cd Mazar-frontend
npm ci
npm run dev
```

Set the API URL before running dev (example):

```bash
export NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## Docker build

The Dockerfile is multi-stage (builder + runtime).

Build the image with the correct backend URL baked in:

```bash
# Example for local Docker or minikube
BACKEND_URL="http://<backend-host-or-minikube-ip>:30400"

docker build \
  --build-arg NEXT_PUBLIC_API_URL=${BACKEND_URL} \
  -t keroles149/mazar_frontend:local .
```

Run it (example):

```bash
docker run --rm -p 3000:3000 keroles149/mazar_frontend:local
```

> Do **not** rely on Kubernetes env vars for `NEXT_PUBLIC_API_URL` – Next.js won’t pick them up at runtime. Build a new image for each environment with the correct URL.

---

## CI/CD suggestions

Typical pipeline steps:

1. Install deps & test
   ```bash
   npm ci
   npm run build
   npm test
   ```

2. Build & push image (per environment)
   ```bash
   # Example for dev on minikube
   BACKEND_URL="http://<minikube-ip>:30400"
   docker build \
     --build-arg NEXT_PUBLIC_API_URL=${BACKEND_URL} \
     -t keroles149/mazar_frontend:${GIT_SHA_OR_VERSION} .

   docker push keroles149/mazar_frontend:${GIT_SHA_OR_VERSION}
   ```

3. Update `mvp-delivery/k8s/frontend-deployment.yaml` image tag and apply:
   ```bash
   kubectl apply -f mvp-delivery/k8s/
   ```

---

## Environment variable

- `NEXT_PUBLIC_API_URL` – build-time base URL for the backend.

For production, build with your real backend URL (Ingress/LoadBalancer) and deploy that image to the cluster.
