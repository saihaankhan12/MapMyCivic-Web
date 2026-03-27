import bcrypt from "bcryptjs";
import { query, pool, withTransaction } from "../db.js";
import {
  cctvChecklist,
  departmentCatalog,
  issues,
  notices,
  users,
} from "../data/seed.js";

async function createSchema() {
  await query(`
    create table if not exists departments (
      id text primary key,
      name text not null,
      short_name text not null,
      zone text not null,
      color text not null
    );

    create table if not exists users (
      id serial primary key,
      name text not null,
      email text not null unique,
      password_hash text not null,
      role text not null,
      department_id text not null references departments(id)
    );

    create table if not exists issues (
      id serial primary key,
      category text not null,
      title text not null,
      description text not null,
      location text not null,
      ward text not null,
      time_label text not null,
      reported_by text not null,
      severity text not null,
      workflow_status text not null,
      verification_status text not null,
      verification_confidence integer not null,
      department_id text not null references departments(id),
      cctv_status text not null,
      cctv_camera_id text not null,
      evidence_count integer not null default 1,
      notes text not null default '',
      lat numeric(10,6) not null,
      lng numeric(10,6) not null
    );

    create table if not exists issue_uploads (
      id serial primary key,
      original_filename text not null,
      stored_filename text not null,
      file_path text not null,
      content_type text,
      created_at timestamptz not null default now()
    );

    create table if not exists issue_upload_links (
      upload_id integer not null references issue_uploads(id) on delete cascade,
      issue_id integer not null references issues(id) on delete cascade,
      primary key (upload_id, issue_id)
    );

    create table if not exists issue_detections (
      id serial primary key,
      upload_id integer not null references issue_uploads(id) on delete cascade,
      issue_id integer references issues(id) on delete set null,
      model_name text not null,
      label text not null,
      issue_type text not null,
      category text not null,
      department_id text not null references departments(id),
      severity text not null,
      verification_status text not null,
      suggested_camera_id text,
      confidence numeric(7,2) not null,
      bbox jsonb not null,
      created_at timestamptz not null default now()
    );

    create table if not exists cctv_frames (
      id serial primary key,
      issue_id integer not null references issues(id) on delete cascade,
      frame_time text not null,
      label text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists notices (
      id serial primary key,
      title text not null,
      department_id text not null references departments(id),
      description text not null,
      type text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists cctv_checklist (
      id serial primary key,
      position integer not null unique,
      step_text text not null
    );
  `);
}

async function seedDatabase() {
  await withTransaction(async (client) => {
    await client.query("delete from issue_detections");
    await client.query("delete from issue_upload_links");
    await client.query("delete from issue_uploads");
    await client.query("delete from cctv_frames");
    await client.query("delete from notices");
    await client.query("delete from issues");
    await client.query("delete from users");
    await client.query("delete from cctv_checklist");
    await client.query("delete from departments");

    for (const department of departmentCatalog) {
      await client.query(
        `insert into departments (id, name, short_name, zone, color)
         values ($1, $2, $3, $4, $5)`,
        [
          department.id,
          department.name,
          department.shortName,
          department.zone,
          department.color,
        ]
      );
    }

    for (const [index, step] of cctvChecklist.entries()) {
      await client.query(
        `insert into cctv_checklist (position, step_text)
         values ($1, $2)`,
        [index + 1, step]
      );
    }

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await client.query(
        `insert into users (id, name, email, password_hash, role, department_id)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          user.name,
          user.email,
          passwordHash,
          user.role,
          user.departmentId,
        ]
      );
    }

    for (const issue of issues) {
      await client.query(
        `insert into issues (
           id, category, title, description, location, ward, time_label, reported_by,
           severity, workflow_status, verification_status, verification_confidence,
           department_id, cctv_status, cctv_camera_id, evidence_count, notes, lat, lng
         ) values (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12,
           $13, $14, $15, $16, $17, $18, $19
         )`,
        [
          issue.id,
          issue.category,
          issue.title,
          issue.description,
          issue.location,
          issue.ward,
          issue.time,
          issue.reportedBy,
          issue.severity,
          issue.workflowStatus,
          issue.verificationStatus,
          issue.verificationConfidence,
          issue.departmentId,
          issue.cctvStatus,
          issue.cctvCameraId,
          issue.evidenceCount,
          issue.notes ?? "",
          issue.lat,
          issue.lng,
        ]
      );

      for (const frame of issue.cctvFrames ?? []) {
        await client.query(
          `insert into cctv_frames (issue_id, frame_time, label)
           values ($1, $2, $3)`,
          [issue.id, frame.time, frame.label]
        );
      }
    }

    const departmentByName = Object.fromEntries(
      departmentCatalog.map((department) => [department.name, department.id])
    );

    for (const notice of notices) {
      await client.query(
        `insert into notices (id, title, department_id, description, type, created_at)
         values ($1, $2, $3, $4, $5, now())`,
        [
          notice.id,
          notice.title,
          departmentByName[notice.department],
          notice.description,
          notice.type,
        ]
      );
    }
  });
}

async function main() {
  await createSchema();
  await seedDatabase();
  console.log("Database initialized with schema and seed data.");
}

main()
  .catch((error) => {
    console.error("Failed to initialize database.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
