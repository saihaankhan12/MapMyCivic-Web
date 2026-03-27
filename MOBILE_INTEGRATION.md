# Mobile Integration Guide

This guide explains how a mobile app should integrate with the current MapMyCivic backend.

## Mobile App Responsibility

The mobile app should:

- capture issue title and description
- capture location and ward
- upload one image per submission
- optionally send latitude and longitude
- submit the report to the backend

The mobile app should not:

- run the YOLO models locally
- store model files
- make routing decisions itself

## Submission Flow

1. User captures or selects an image
2. User fills issue details
3. App sends multipart form data to `POST /api/issues`
4. Backend sends the image to the inference service
5. Backend creates one or more issue records
6. App receives the created issues and detection summary

## Recommended Request Payload

Endpoint:

- `POST http://localhost:4000/api/issues`

Multipart fields:

- `image`
- `category`
- `title`
- `description`
- `location`
- `ward`
- `lat` optional
- `lng` optional
- `cctvCameraId` optional

## Example Response Handling

The response may contain:

- multiple created issues
- raw detections
- detected issue types

Your app should:

- show a submission success screen
- optionally list the detected issue types
- use the created issue IDs if you later add citizen issue tracking

## Recommended Mobile Screens

Minimum screens:

1. Splash
2. Report issue form
3. Image capture/upload
4. Location confirmation
5. Submission success
6. My reports, if citizen history is added later

## Validation Recommendations

Before upload:

- ensure image exists
- ensure title is not empty
- ensure description is not empty
- ensure location is not empty
- ensure ward is selected

## Networking Notes

- Use multipart upload, not JSON, for issue submission
- Add retry handling for failed uploads
- Show progress for large image uploads
- Compress very large images if needed, but do not over-compress them

## Future Mobile Improvements

Potential future additions:

- citizen login
- report history
- push notifications
- complaint tracking by issue ID
- multi-image submission
- offline queue and later sync
