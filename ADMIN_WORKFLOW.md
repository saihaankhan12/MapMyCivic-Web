# Admin Workflow

This document explains how the current admin web portal is intended to be used.

## Users

The current web portal is for department officers.

Departments currently represented:

- Public Works Department
- Municipal Sanitation
- Electricity Board
- Water Supply Board
- Traffic Police

## Main Workflow

1. Officer signs in
2. Officer reviews department dashboard
3. Officer opens issue details
4. Officer checks:
   - issue metadata
   - verification score
   - raw detections
   - source upload details
5. Officer uploads CCTV clip if required
6. Officer adds notes
7. Officer updates status or marks issue resolved

## Department Views

The portal currently supports:

- overall dashboard
- department-specific desks
- issue detail page
- reports log
- notices

## Evidence Review

Admins can currently review:

- citizen upload metadata
- raw model detections
- bounding box values
- CCTV upload state

## Current Limitations

- CCTV frame generation is placeholder-only
- no supervisor-specific role yet
- no issue reassignment workflow yet
- no audit trail UI yet

## Recommended Next Admin Features

1. annotated image preview with detection boxes
2. status history timeline
3. issue reassignment between departments
4. supervisor review queue
5. exportable operational reports
