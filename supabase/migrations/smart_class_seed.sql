-- =====================================================================
-- SMART CLASS — STARTER SEED DATA
-- Optional. Safe to run once after the schema + storage policies.
-- =====================================================================

insert into subscription_plans (name, max_students, max_teachers, price_cents, billing_cycle, features) values
  ('Starter',  150,  15, 4900,  'monthly', '{"lessons": true, "homework": true, "monthly_tests": true, "messaging": true, "reports": false}'),
  ('Growth',   600,  60, 14900, 'monthly', '{"lessons": true, "homework": true, "monthly_tests": true, "messaging": true, "reports": true}'),
  ('Enterprise', null, null, 39900, 'monthly', '{"lessons": true, "homework": true, "monthly_tests": true, "messaging": true, "reports": true, "priority_support": true}')
on conflict do nothing;

insert into platform_settings (key, value) values
  ('platform_name', '"Smart Class"'),
  ('support_email', '"support@smartclass.example"'),
  ('default_timezone', '"UTC"'),
  ('maintenance_mode', 'false')
on conflict (key) do nothing;
