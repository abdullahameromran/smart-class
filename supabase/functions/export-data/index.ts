// supabase/functions/export-data/index.ts
//
// Handles the "Export Data" action from the permission matrix, which
// explicitly requires an audit log entry. The client never queries+downloads
// directly for bulk export — it always goes through here, so the log is
// guaranteed rather than optional.
//
// Deploy:  supabase functions deploy export-data
// Call:    POST /functions/v1/export-data
//          Authorization: Bearer <caller's JWT>
//          { "school_id": "...", "entity": "students" | "attendance" | "final_grades",
//            "academic_year_id": "..." (optional filter) }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Allow-list of exportable entities -> underlying query builder.
// Keeping this explicit (not dynamic SQL) avoids injection entirely.
const EXPORTERS: Record<string, (schoolId: string, filters: Record<string, unknown>) => Promise<any[]>> = {
  students: async (schoolId) => {
    const { data } = await admin
      .from("class_enrollments")
      .select("student_id, status, classes(name), profiles:student_id(first_name,last_name,email)")
      .eq("school_id", schoolId);
    return data ?? [];
  },
  attendance: async (schoolId, filters) => {
    let q = admin
      .from("attendance_records")
      .select("student_id, status, recorded_at, lessons(class_id, subject_id)")
      .eq("school_id", schoolId);
    if (filters.from) q = q.gte("recorded_at", filters.from as string);
    if (filters.to) q = q.lte("recorded_at", filters.to as string);
    const { data } = await q;
    return data ?? [];
  },
  final_grades: async (schoolId, filters) => {
    let q = admin
      .from("final_grades")
      .select("student_id, subject_id, class_id, grade_value, grade_letter, status")
      .eq("school_id", schoolId)
      .is("deleted_at", null);
    if (filters.academic_year_id) q = q.eq("academic_year_id", filters.academic_year_id as string);
    const { data } = await q;
    return data ?? [];
  },
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !callerData?.user) return json({ error: "Not authenticated" }, 401);
    const callerId = callerData.user.id;

    const { school_id, entity, ...filters } = await req.json();
    if (!school_id || !entity || !EXPORTERS[entity]) {
      return json({ error: `entity must be one of: ${Object.keys(EXPORTERS).join(", ")}` }, 400);
    }

    // Authorize: school_admin or super_admin for this school
    const { data: allowedRow } = await admin
      .from("user_school_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("school_id", school_id)
      .eq("role", "school_admin")
      .maybeSingle();
    const { data: superRow } = await admin
      .from("user_school_roles")
      .select("role")
      .eq("user_id", callerId)
      .is("school_id", null)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!allowedRow && !superRow) return json({ error: "not authorized to export this data" }, 403);

    const rows = await EXPORTERS[entity](school_id, filters);
    const csv = toCsv(rows);

    // Mandatory audit log, written before the response goes out.
    await admin.from("audit_logs").insert({
      school_id,
      actor_id: callerId,
      action: "export_data",
      entity_type: entity,
      metadata: { row_count: rows.length, filters },
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${entity}-export.csv"`,
        ...corsHeaders,
      },
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function toCsv(rows: any[]): string {
  if (rows.length === 0) return "";
  const flat = rows.map(flatten);
  const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
  const lines = [headers.join(",")];
  for (const row of flat) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}
