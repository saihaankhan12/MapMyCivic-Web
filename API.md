# API Reference

This document describes the current backend API for MapMyCivic.

Base URL:

- Local backend: `http://localhost:4000`

Authentication:

- Admin-protected endpoints require a bearer token from `POST /api/auth/login`
- Public issue submission does not require admin auth

## Auth

### `POST /api/auth/login`

Sign in an admin user.

Request body:

```json
{
  "email": "pwd@mapmycivic.gov",
  "password": "pwd123",
  "departmentId": "pwd"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Asha Menon",
    "email": "pwd@mapmycivic.gov",
    "role": "Department Officer",
    "departmentId": "pwd",
    "departmentName": "Public Works Department"
  }
}
```

## Health

### `GET /api/health`

Backend health check.

Response:

```json
{
  "status": "ok",
  "service": "mapmycivic-backend"
}
```

## Bootstrap

### `GET /api/bootstrap`

Returns the main admin bootstrap payload.

Response shape:

```json
{
  "departments": [],
  "issues": [],
  "notices": [],
  "cctvChecklist": []
}
```

## Departments

### `GET /api/departments`

Returns all departments.

### `GET /api/departments/:departmentId/issues`

Returns issues for one department.

Example:

`GET /api/departments/pwd/issues`

## Issues

### `GET /api/issues`

Returns all issues.

### `GET /api/issues/:issueId`

Returns one issue, including:

- `cctvFrames`
- `sourceUploads`
- `detections`

## Citizen Issue Submission

### `POST /api/issues`

Creates one or more issue records from a single uploaded image.

Content type:

- `multipart/form-data`

Required fields:

- `image`
- `category`
- `title`
- `description`
- `location`
- `ward`

Optional fields:

- `lat`
- `lng`
- `cctvCameraId`
- `evidenceCount`

Behavior:

- uploads the image
- sends the image to the YOLOv8 inference service
- runs all configured models in parallel
- groups detections by civic issue type
- creates one issue record per detected issue type
- stores raw detections and upload metadata

Example curl:

```bash
curl -X POST http://localhost:4000/api/issues \
  -F "image=@sample.jpg" \
  -F "category=Road Damage" \
  -F "title=Road issue near school" \
  -F "description=Citizen reported visible damage and flooding" \
  -F "location=School Road" \
  -F "ward=Ward 7" \
  -F "lat=19.0795" \
  -F "lng=72.8834"
```

Response shape:

```json
{
  "issues": [],
  "upload": {
    "id": 1,
    "originalFilename": "sample.jpg",
    "storedFilename": "123-sample.jpg",
    "filePath": "/uploads/123-sample.jpg"
  },
  "detections": [],
  "detectedIssueTypes": ["pothole", "road-flood"]
}
```

## Issue Notes

### `POST /api/issues/:issueId/notes`

Protected endpoint.

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "notes": "Confirmed by review team."
}
```

## Issue Status

### `PATCH /api/issues/:issueId/status`

Protected endpoint.

Request body:

```json
{
  "workflowStatus": "Resolved",
  "cctvStatus": "Frames Reviewed"
}
```

## CCTV Upload

### `POST /api/issues/:issueId/cctv-clip`

Protected endpoint.

Content type:

- `multipart/form-data`

Required field:

- `clip`

Behavior:

- stores the uploaded clip
- updates issue CCTV status
- generates placeholder review frame checkpoints

## Notices

### `GET /api/notices`

Returns notices.

### `POST /api/notices`

Protected endpoint.

Request body:

```json
{
  "title": "Zone review update",
  "departmentId": "pwd",
  "description": "Pending CCTV reviews to be completed today.",
  "type": "warning"
}
```

## Issue Object

Typical issue response fields:

```json
{
  "id": 12,
  "category": "Road Damage",
  "title": "Large pothole near market",
  "description": "Detected from uploaded image",
  "location": "MG Road",
  "ward": "Ward 11",
  "time": "Just now",
  "reportedBy": "Citizen mobile app",
  "severity": "Critical",
  "workflowStatus": "Awaiting CCTV Review",
  "verificationStatus": "Verified by Model",
  "verificationConfidence": 94,
  "departmentId": "pwd",
  "department": "Public Works Department",
  "cctvStatus": "No Clip Yet",
  "cctvCameraId": "CAM-PWD-AUTO",
  "evidenceCount": 1,
  "notes": "",
  "cctvFrames": [],
  "sourceUploads": [],
  "detections": [],
  "lat": 19.076,
  "lng": 72.8777
}
```
