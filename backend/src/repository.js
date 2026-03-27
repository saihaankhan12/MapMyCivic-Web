import bcrypt from "bcryptjs";
import { query, withTransaction } from "./db.js";

function mapIssue(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    location: row.location,
    ward: row.ward,
    time: row.time_label,
    reportedBy: row.reported_by,
    severity: row.severity,
    workflowStatus: row.workflow_status,
    verificationStatus: row.verification_status,
    verificationConfidence: row.verification_confidence,
    departmentId: row.department_id,
    department: row.department_name,
    cctvStatus: row.cctv_status,
    cctvCameraId: row.cctv_camera_id,
    evidenceCount: row.evidence_count,
    notes: row.notes ?? "",
    cctvFrames: row.cctv_frames ?? [],
    sourceUploads: row.source_uploads ?? [],
    detections: row.detections ?? [],
    lat: Number(row.lat),
    lng: Number(row.lng),
  };
}

function mapNotice(row) {
  return {
    id: row.id,
    title: row.title,
    department: row.department_name,
    date: row.date_label,
    description: row.description,
    type: row.type,
  };
}

export async function healthcheck() {
  await query("select 1");
}

export async function getDepartments() {
  const result = await query(
    `select id, name, short_name as "shortName", zone, color
     from departments
     order by name`
  );
  return result.rows;
}

export async function getChecklist() {
  const result = await query(
    `select step_text
     from cctv_checklist
     order by position`
  );
  return result.rows.map((row) => row.step_text);
}

export async function getIssues({ departmentId } = {}) {
  const conditions = [];
  const params = [];

  if (departmentId) {
    params.push(departmentId);
    conditions.push(`i.department_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `where ${conditions.join(" and ")}` : "";

  const result = await query(
    `select
       i.id,
       i.category,
       i.title,
       i.description,
       i.location,
       i.ward,
       i.time_label,
       i.reported_by,
       i.severity,
       i.workflow_status,
       i.verification_status,
       i.verification_confidence,
       i.department_id,
       d.name as department_name,
       i.cctv_status,
       i.cctv_camera_id,
       i.evidence_count,
       i.notes,
       i.lat,
       i.lng,
       coalesce(
         json_agg(
           json_build_object(
             'id', f.id,
             'time', f.frame_time,
             'label', f.label
           )
           order by f.created_at
         ) filter (where f.id is not null),
         '[]'::json
       ) as cctv_frames,
       coalesce(
         json_agg(
           distinct jsonb_build_object(
             'id', u.id,
             'originalFilename', u.original_filename,
             'storedFilename', u.stored_filename,
             'filePath', u.file_path
           )
         ) filter (where u.id is not null),
         '[]'::json
       ) as source_uploads,
       coalesce(
         json_agg(
           distinct jsonb_build_object(
             'id', det.id,
             'uploadId', det.upload_id,
             'model', det.model_name,
             'label', det.label,
             'issueType', det.issue_type,
             'category', det.category,
             'departmentId', det.department_id,
             'severity', det.severity,
             'verificationStatus', det.verification_status,
             'suggestedCameraId', det.suggested_camera_id,
             'confidence', det.confidence,
             'bbox', det.bbox
           )
         ) filter (where det.id is not null),
         '[]'::json
       ) as detections
     from issues i
     join departments d on d.id = i.department_id
     left join cctv_frames f on f.issue_id = i.id
     left join issue_upload_links iul on iul.issue_id = i.id
     left join issue_uploads u on u.id = iul.upload_id
     left join issue_detections det on det.issue_id = i.id
     ${whereClause}
     group by i.id, d.name
     order by i.id desc`,
    params
  );

  return result.rows.map(mapIssue);
}

export async function getIssueById(issueId) {
  const issues = await getIssues();
  return issues.find((issue) => issue.id === Number(issueId)) ?? null;
}

export async function getNotices() {
  const result = await query(
    `select
       n.id,
       n.title,
       d.name as department_name,
       to_char(n.created_at, 'Mon DD, YYYY') as date_label,
       n.description,
       n.type
     from notices n
     join departments d on d.id = n.department_id
     order by n.created_at desc`
  );

  return result.rows.map(mapNotice);
}

export async function authenticateUser(email, password, departmentId) {
  const result = await query(
    `select
       u.id,
       u.name,
       u.email,
       u.password_hash,
       u.role,
       u.department_id,
       d.name as department_name
     from users u
     join departments d on d.id = u.department_id
     where lower(u.email) = lower($1)
       and u.department_id = $2`,
    [email, departmentId]
  );

  const user = result.rows[0];

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
    departmentName: user.department_name,
  };
}

export async function createNotice({ title, departmentId, description, type }) {
  const result = await query(
    `insert into notices (title, department_id, description, type)
     values ($1, $2, $3, $4)
     returning id`,
    [title, departmentId, description, type]
  );

  const notices = await getNotices();
  return notices.find((notice) => notice.id === result.rows[0].id) ?? null;
}

export async function updateIssueNotes(issueId, notes) {
  await query(
    `update issues
     set notes = $2
     where id = $1`,
    [issueId, notes]
  );

  return getIssueById(issueId);
}

export async function updateIssueStatus(issueId, { workflowStatus, cctvStatus }) {
  await query(
    `update issues
     set workflow_status = coalesce($2, workflow_status),
         cctv_status = coalesce($3, cctv_status)
     where id = $1`,
    [issueId, workflowStatus ?? null, cctvStatus ?? null]
  );

  return getIssueById(issueId);
}

export async function attachCctvFrames(issueId, clipFilename) {
  return withTransaction(async (client) => {
    await client.query(
      `update issues
       set cctv_status = 'Frames Reviewed',
           workflow_status = case
             when workflow_status = 'Awaiting CCTV Review' then 'Department Assigned'
             else workflow_status
           end
       where id = $1`,
      [issueId]
    );

    await client.query(`delete from cctv_frames where issue_id = $1`, [issueId]);

    const checkpoints = ["00:00", "00:02", "00:04", "00:06", "00:08"];

    for (const time of checkpoints) {
      await client.query(
        `insert into cctv_frames (issue_id, frame_time, label)
         values ($1, $2, $3)`,
        [issueId, time, `Generated from ${clipFilename}`]
      );
    }
  }).then(() => getIssueById(issueId));
}

export async function createCitizenIssue(payload) {
  const result = await query(
    `insert into issues (
       category, title, description, location, ward, time_label, reported_by,
       severity, workflow_status, verification_status, verification_confidence,
       department_id, cctv_status, cctv_camera_id, evidence_count, notes, lat, lng
     ) values (
       $1, $2, $3, $4, $5, 'Just now', 'Citizen mobile app',
       $6, 'Awaiting CCTV Review', $7, $8,
       $9, 'No Clip Yet', $10, $11, '', $12, $13
     )
     returning id`,
    [
      payload.category,
      payload.title,
      payload.description,
      payload.location,
      payload.ward,
      payload.severity ?? "Medium",
      payload.verificationStatus,
      payload.verificationConfidence,
      payload.departmentId,
      payload.cctvCameraId ?? "TBD",
      payload.evidenceCount ?? 1,
      payload.lat,
      payload.lng,
    ]
  );

  return getIssueById(result.rows[0].id);
}

export async function createIssueUpload({
  originalFilename,
  storedFilename,
  filePath,
  contentType,
}) {
  const result = await query(
    `insert into issue_uploads (original_filename, stored_filename, file_path, content_type)
     values ($1, $2, $3, $4)
     returning id`,
    [originalFilename, storedFilename, filePath, contentType ?? null]
  );

  return result.rows[0].id;
}

export async function linkUploadToIssue(uploadId, issueId) {
  await query(
    `insert into issue_upload_links (upload_id, issue_id)
     values ($1, $2)
     on conflict do nothing`,
    [uploadId, issueId]
  );
}

export async function createIssueDetection({
  uploadId,
  issueId,
  detection,
}) {
  await query(
    `insert into issue_detections (
       upload_id, issue_id, model_name, label, issue_type, category,
       department_id, severity, verification_status, suggested_camera_id,
       confidence, bbox
     ) values (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10,
       $11, $12::jsonb
     )`,
    [
      uploadId,
      issueId ?? null,
      detection.model,
      detection.label,
      detection.issueType,
      detection.category,
      detection.departmentId,
      detection.severity,
      detection.verificationStatus,
      detection.suggestedCameraId ?? null,
      detection.confidence,
      JSON.stringify(detection.bbox),
    ]
  );
}
