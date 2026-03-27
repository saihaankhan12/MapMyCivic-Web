# Deployment Guide

This document outlines a practical deployment shape for MapMyCivic.

## Services to Deploy

Deploy these services separately:

1. Frontend
2. Backend
3. Inference service
4. PostgreSQL

## Recommended Production Layout

`frontend`
- Vercel, Netlify, or static hosting behind a CDN

`backend`
- Render, Railway, Fly.io, VPS, Docker host, or cloud VM

`inference-service`
- separate VM, container, or GPU-capable machine if needed

`database`
- managed PostgreSQL or self-hosted PostgreSQL

## Important Production Environment Variables

### Backend

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INFERENCE_SERVICE_URL`

### Inference service

- `PORT`
- `MODEL_CONFIDENCE`

## Storage Recommendation

Current local file storage is fine for development only.

For production, use object storage for:

- citizen-uploaded images
- CCTV clips
- generated review artifacts

Recommended options:

- AWS S3
- Cloudinary
- Azure Blob Storage
- Google Cloud Storage

## Database Recommendation

Use managed PostgreSQL in production if possible.

Recommended:

- Neon
- Supabase Postgres
- Railway Postgres
- Render Postgres
- AWS RDS

## Security Checklist

- use strong `JWT_SECRET`
- enable HTTPS
- do not expose model files publicly
- restrict backend CORS to known frontends
- add rate limiting to public endpoints
- store uploads outside the public app root if possible
- rotate secrets by environment

## Deployment Order

1. Provision PostgreSQL
2. Configure backend env vars
3. Run DB initialization or migrations
4. Deploy inference service with model files available
5. Deploy backend and connect to inference service
6. Deploy frontend and point it to backend

## Production Gaps Still Worth Addressing

- replace init script with migrations
- add refresh tokens
- add request validation middleware
- add audit logs
- add background workers for video processing
- replace placeholder CCTV frame generation with real extraction

## Docker Suggestion

If you want an easier full-stack local/prod-style setup later, add:

- `docker-compose.yml`
- backend container
- inference-service container
- postgres container

This would make local onboarding much easier.
