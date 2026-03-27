# MapMyCivic

MapMyCivic is a civic issue monitoring platform with three main parts:

- [frontend](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend): admin web portal for department officers
- [backend](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend): Express API with PostgreSQL and JWT authentication
- [inference-service](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\inference-service): Python YOLOv8 inference service

## Documentation Index

- [README.md](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\README.md): overall architecture, setup, and system overview
- [API.md](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\API.md): backend endpoint reference and request/response details
- [MOBILE_INTEGRATION.md](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\MOBILE_INTEGRATION.md): mobile app integration guide
- [DEPLOYMENT.md](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\DEPLOYMENT.md): deployment guidance and production notes
- [ADMIN_WORKFLOW.md](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\ADMIN_WORKFLOW.md): admin portal usage and workflow

The intended product flow is:

1. A citizen uploads an issue from the mobile app.
2. The backend stores the submission and sends the uploaded image to the inference service.
3. The inference service runs all configured YOLOv8 models in parallel.
4. The backend receives raw detections and creates one or more issue records.
5. Department officers review those issues from the admin web portal.

## Architecture

### Services

`frontend`
- React + Vite admin interface
- Reads data from backend APIs
- Used by department officers only

`backend`
- Handles authentication
- Stores departments, users, issues, notices, CCTV review state, uploads, and detections
- Persists data in PostgreSQL
- Accepts citizen issue submissions
- Calls the inference service

`inference-service`
- Loads YOLOv8 `.pt` models
- Runs all configured models on the uploaded image
- Returns merged detections and a primary classification result

### Why the models are server-side

The models should not be placed in the web app and should not be placed in the mobile app.

Reasons:

- model files are large
- model weights should not be exposed publicly
- inference behavior should stay consistent for all clients
- models can be updated without shipping new app builds
- the backend can log, route, validate, and audit every prediction

Current model files:

- [pothole.pt](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\models\pothole.pt)
- [garbage.pt](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\models\garbage.pt)
- [road-flood.pt](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\models\road-flood.pt)

## Repository Structure

```text
MapMyCivic-Web-main/
  backend/
    src/
      auth.js
      config.js
      db.js
      inferenceClient.js
      repository.js
      server.js
      data/
      scripts/
        initDb.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      routes/
  inference-service/
    src/
      server.py
    requirements.txt
  models/
    pothole.pt
    garbage.pt
    road-flood.pt
```

## Core Features

### Citizen issue ingestion

- `POST /api/issues` accepts a multipart form submission
- one uploaded image is required
- all YOLOv8 models run on that image
- one image can create multiple issue records when multiple civic issue types are detected

### Admin workflow

- department sign-in with JWT
- issue queues by department
- verification confidence and model result display
- raw detection visibility on the issue page
- officer notes
- issue status updates
- CCTV clip upload for review
- department notices

### Detection persistence

The backend stores:

- source upload metadata
- links between uploads and created issues
- every raw detection produced by the inference service

This means admins can see:

- which uploaded image created an issue
- which model produced a detection
- confidence score
- bounding box coordinates
- linked issue type and department

## Data Flow

### Mobile app to backend

Expected flow:

1. Mobile app uploads issue details and an image
2. Backend saves the uploaded file
3. Backend sends the image to the inference service
4. Inference service runs all models in parallel
5. Backend groups detections by issue type
6. Backend creates one issue per detected issue type
7. Backend stores upload and detection records

### Backend to admin web

1. Admin signs in
2. Frontend fetches bootstrap data
3. Officer opens issue details
4. Officer sees:
   - issue metadata
   - source upload info
   - raw detections
   - CCTV review section
   - notes and workflow controls

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- React Leaflet

### Backend

- Node.js
- Express
- PostgreSQL
- `pg`
- `jsonwebtoken`
- `bcryptjs`
- `multer`

### Inference service

- Python 3
- FastAPI
- Uvicorn
- Ultralytics YOLOv8
- Pillow
- NumPy

## Setup

### Prerequisites

Install the following first:

- Node.js
- Python 3
- PostgreSQL

### PostgreSQL

Create a database named `mapmycivic`.

Example:

```sql
CREATE DATABASE mapmycivic;
```

### Environment files

Copy:

- [backend\.env.example](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\.env.example) -> `backend/.env`
- [inference-service\.env.example](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\inference-service\.env.example) -> `inference-service/.env`

Important backend values:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INFERENCE_SERVICE_URL`

Important inference-service values:

- `PORT`
- `MODEL_CONFIDENCE`

## Installation

### Frontend

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend
npm install
```

### Backend

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend
npm install
```

### Inference service

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\inference-service
python -m pip install -r requirements.txt
```

## Database Initialization

Run this after PostgreSQL is available:

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend
npm run db:init
```

This script:

- creates schema tables if needed
- clears seeded tables
- inserts departments
- inserts demo users
- inserts seeded issues
- inserts notices
- inserts CCTV checklist data

### Tables created

- `departments`
- `users`
- `issues`
- `issue_uploads`
- `issue_upload_links`
- `issue_detections`
- `cctv_frames`
- `notices`
- `cctv_checklist`

## Running the System

Start services in this order.

### 1. Start PostgreSQL

Make sure PostgreSQL is running and accessible using your configured `DATABASE_URL`.

### 2. Start inference service

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\inference-service
npm start
```

Runs on:

- `http://localhost:4100`

### 3. Start backend

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend
npm start
```

Runs on:

- `http://localhost:4000`

### 4. Start frontend

```powershell
cd C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend
npm run dev
```

The frontend uses Vite proxying for:

- `/api`
- `/uploads`

## Demo Accounts

These are seeded by `npm run db:init`:

- `pwd@mapmycivic.gov / pwd123`
- `sanitation@mapmycivic.gov / clean123`
- `electricity@mapmycivic.gov / light123`
- `water@mapmycivic.gov / water123`
- `traffic@mapmycivic.gov / traffic123`

## API Overview

### Public or mobile-facing endpoints

`GET /api/health`
- health check for backend

`POST /api/auth/login`
- admin login

`GET /api/bootstrap`
- returns departments, issues, notices, and checklist data

`GET /api/departments`
- returns department list

`GET /api/departments/:departmentId/issues`
- returns issues for a department

`GET /api/issues`
- returns all issues

`GET /api/issues/:issueId`
- returns a single issue, including uploads and detections

`POST /api/issues`
- multipart form endpoint
- expects:
  - `image`
  - `category`
  - `title`
  - `description`
  - `location`
  - `ward`
  - optional `lat`
  - optional `lng`
  - optional `cctvCameraId`
- creates one or more issue records
- stores raw detections and upload metadata

### Admin-protected endpoints

`POST /api/issues/:issueId/notes`
- update review notes

`PATCH /api/issues/:issueId/status`
- update workflow or CCTV status

`POST /api/issues/:issueId/cctv-clip`
- upload CCTV clip for review

`GET /api/notices`
- get notices

`POST /api/notices`
- create notice

## Inference Behavior

The inference service:

- loads all configured YOLOv8 models on startup
- reads the uploaded image once
- runs all models in parallel
- merges all detections into one response
- selects the highest-confidence detection as the primary result

### Current model mapping

`pothole.pt`
- issue type: `pothole`
- category: `Road Damage`
- department: `pwd`

`garbage.pt`
- issue type: `garbage`
- category: `Waste Management`
- department: `sanitation`

`road-flood.pt`
- issue type: `road-flood`
- category: `Water Supply`
- department: `water`

## Important Files

### Frontend

- [client.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend\src\api\client.js)
- [PortalProvider.jsx](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend\src\context\PortalProvider.jsx)
- [ProtectedRoute.jsx](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend\src\components\ProtectedRoute.jsx)
- [Dashboard.jsx](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend\src\pages\Dashboard.jsx)
- [IssueDetails.jsx](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\frontend\src\pages\IssueDetails.jsx)

### Backend

- [server.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\src\server.js)
- [repository.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\src\repository.js)
- [db.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\src\db.js)
- [auth.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\src\auth.js)
- [inferenceClient.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\src\inferenceClient.js)
- [initDb.js](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\backend\src\scripts\initDb.js)

### Inference service

- [server.py](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\inference-service\src\server.py)
- [requirements.txt](C:\Users\saiha\OneDrive\Documents\Playground\MapMyCivic-Web-main\inference-service\requirements.txt)

## Troubleshooting

### Backend cannot start

If backend startup fails with `ECONNREFUSED` on port `5432`:

- PostgreSQL is not running
- or `DATABASE_URL` is wrong

### Inference service cannot start

Possible reasons:

- required Python packages are not installed
- one or more `.pt` files are missing
- Python environment does not have Ultralytics dependencies

### Frontend loads but data is missing

Possible reasons:

- backend is not running
- inference service is not running and issue creation is failing
- Vite proxy is not pointing to the backend

## Current Status

Implemented:

- PostgreSQL-backed backend
- JWT admin auth
- YOLOv8 multi-model inference
- parallel model execution
- multi-issue creation from one image
- source upload persistence
- raw detection persistence
- admin visibility into detections
- professionalized admin web UI

Still good future improvements:

1. real CCTV frame extraction instead of placeholders
2. object storage for evidence files
3. refresh tokens and session invalidation
4. supervisor roles and richer permissions
5. background jobs for inference and video work
6. annotated image previews with bounding boxes
7. mobile-app-specific client docs and payload examples
