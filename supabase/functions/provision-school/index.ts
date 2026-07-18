// supabase/functions/provision-school/index.ts
//
// Super Admin only. Creates a school + its first School Admin account +
// an initial subscription row. Needs the service role to create an
// auth.users row and to bypass RLS for the initial insert (the school
// doesn't have any members yet, so no RLS policy would otherwise allow it).
//
// Deploy:  supabase functions deploy provision-school
// Call:    POST /functions/v1/provision-school
//          Authorization: Bearer <super admin's JWT>
//          { "school_name": "...", "slug": "...", "timezone": "Africa/Cairo",
//            "plan_id": "...", "admin_email": "...",
//            "admin_first_name": "...", "admin_last_name": "..." }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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

    const { data: superRow } = await admin
      .from("user_school_roles")
      .select("role")
      .eq("user_id", callerId)
      .is("school_id", null)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!superRow) return json({ error: "super admin only" }, 403);

    const body = await req.json();
    const {
      school_name, slug, timezone = "UTC", plan_id,
      admin_email, admin_first_name, admin_last_name,
    } = body;
    if (!school_name || !plan_id || !admin_email) {
      return json({ error: "school_name, plan_id, and admin_email are required" }, 400);
    }

    const requestedSlug = typeof slug === "string" ? slug.trim() : "";
    const baseSlug = slugify(requestedSlug || school_name);
    if (!baseSlug) {
      return json({ error: "Provide a valid school name or slug." }, 400);
    }

    let finalSlug = baseSlug;
    if (requestedSlug) {
      const { data: existingSlug } = await admin
        .from("schools")
        .select("id")
        .eq("slug", baseSlug)
        .maybeSingle();
      if (existingSlug) {
        return json({ error: `School slug "${baseSlug}" is already in use. Choose another slug.` }, 400);
      }
    } else {
      finalSlug = await generateUniqueSchoolSlug(baseSlug);
    }

    // 1. Create the school
    const { data: school, error: schoolErr } = await admin
      .from("schools")
      .insert({ name: school_name, slug: finalSlug, timezone })
      .select()
      .single();
    if (schoolErr) {
      if (schoolErr.message.includes("schools_slug_key")) {
        return json({ error: "That school slug is already taken. Try another slug." }, 400);
      }
      return json({ error: schoolErr.message }, 400);
    }

    // 2. Attach a subscription
    const { error: subErr } = await admin.from("school_subscriptions").insert({
      school_id: school.id,
      plan_id,
      status: "trialing",
    });
    if (subErr) return json({ error: subErr.message }, 400);

    // 3. Create (or invite) the first School Admin
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      admin_email,
      { data: { first_name: admin_first_name, last_name: admin_last_name } },
    );

    let adminUserId: string;
    if (inviteErr) {
      const { data: existing } = await admin.auth.admin.listUsers({ email: admin_email });
      const found = existing?.users?.find((u) => u.email === admin_email);
      if (!found) return json({ error: inviteErr.message }, 400);
      adminUserId = found.id;
    } else {
      adminUserId = invited.user!.id;
    }

    await admin.from("pr