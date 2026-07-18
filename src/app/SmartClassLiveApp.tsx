import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  ClipboardList,
  Download,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  Mail,
  Megaphone,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { hasSupabaseEnv, supabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

type UserRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent";
type SettingValueType = "text" | "number" | "boolean" | "list" | "pairs";

type BasicProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url?: string | null;
};

type PlatformProfile = BasicProfile & {
  is_active: boolean;
  created_at: string;
};

type SchoolRecord = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  is_active: boolean;
  settings?: Record<string, unknown> | null;
  created_at?: string | null;
};

type Workspace = {
  key: string;
  role: UserRole;
  schoolId: string | null;
  schoolName: string;
  school: SchoolRecord | null;
};

type RoleRow = {
  id: string;
  user_id: string;
  school_id: string | null;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
};

type Plan = {
  id: string;
  name: string;
  max_students: number | null;
  max_teachers: number | null;
  price_cents: number;
  billing_cycle: string;
  features: Record<string, unknown> | null;
  is_active: boolean;
};

type SchoolSubscription = {
  id: string;
  school_id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
};

type PlatformSetting = {
  key: string;
  value: unknown;
};

type AuditLogRecord = {
  id: string;
  school_id: string | null;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type PlatformCounts = {
  profiles: number;
  role_assignments: number;
  schools: number;
  subscriptions: number;
  classes: number;
  subjects: number;
  lessons: number;
  announcements: number;
  messages: number;
};

type AcademicYear = {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

type WorkingDay = {
  id: string;
  school_id: string;
  day_of_week: number;
  label: string;
};

type TimeSlot = {
  id: string;
  school_id: string;
  label: string;
  start_time: string;
  end_time: string;
  sort_order: number;
};

type GradeLevel = {
  id: string;
  school_id: string;
  name: string;
  sort_order: number;
};

type ClassRecord = {
  id: string;
  school_id: string;
  academic_year_id: string;
  grade_level_id: string;
  name: string;
  created_at?: string;
};

type SubjectRecord = {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
};

type TeacherAssignment = {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string | null;
};

type ClassEnrollment = {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  status: string;
  enrolled_at?: string;
};

type ParentStudentLink = {
  id: string;
  school_id: string;
  parent_id: string;
  student_id: string;
  relationship: string;
};

type Lesson = {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  lesson_date: string;
  created_at: string;
};

type Homework = {
  id: string;
  school_id: string;
  lesson_id: string;
  title: string;
  due_date: string;
  created_at: string;
};

type HomeworkQuestion = {
  id: string;
  homework_id: string;
  question_text: string;
  sort_order: number;
};

type HomeworkChoice = {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  sort_order: number;
};

type HomeworkSubmission = {
  id: string;
  homework_id: string;
  student_id: string;
  submitted_at: string;
  score: number | null;
  graded_at: string | null;
};

type HomeworkAnswer = {
  id: string;
  submission_id: string;
  question_id: string;
  selected_choice_id: string | null;
  is_correct: boolean | null;
};

type MonthlyTest = {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  test_date: string;
  duration_minutes: number;
  kind: string;
  created_at: string;
};

type TestQuestion = {
  id: string;
  test_id: string;
  question_text: string;
  sort_order: number;
};

type TestChoice = {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  sort_order: number;
};

type TestSubmission = {
  id: string;
  test_id: string;
  student_id: string;
  submitted_at: string;
  score: number | null;
  graded_at: string | null;
};

type TestAnswer = {
  id: string;
  submission_id: string;
  question_id: string;
  selected_choice_id: string | null;
  is_correct: boolean | null;
};

type FinalGrade = {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  student_id: string;
  grade_value: number | null;
  grade_letter: string | null;
  remarks: string | null;
  status: string;
};

type Announcement = {
  id: string;
  school_id: string;
  author_id: string;
  title: string;
  body: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

type AnnouncementTarget = {
  id: string;
  announcement_id: string;
  target_type: string;
  target_id: string | null;
  target_role: string | null;
};

type Message = {
  id: string;
  school_id: string;
  sender_id: string;
  subject: string | null;
  body: string;
  created_at: string;
};

type MessageRecipient = {
  id: string;
  message_id: string;
  recipient_id: string;
  is_read: boolean;
  read_at: string | null;
};

type TimetableEntry = {
  id: string;
  school_id: string;
  academic_year_id: string;
  working_day_id: string;
  time_slot_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
};

type AttendanceRecord = {
  id: string;
  school_id: string;
  lesson_id: string;
  student_id: string;
  status: string;
  recorded_at: string;
};

type NotificationRow = {
  id: string;
  title: string | null;
  body: string | null;
  status: string;
  created_at: string;
};

type SchoolUsageStat = {
  school_id: string;
  school_name: string;
  is_active: boolean;
  student_count: number;
  teacher_count: number;
  parent_count: number;
  class_count: number;
  subscription_status: string | null;
  last_activity_at: string | null;
};

type RecipientOption = {
  id: string;
  label: string;
  email: string | null;
};

type HomeworkBundle = {
  item: Homework;
  lesson?: Lesson;
  questions: Array<HomeworkQuestion & { choices: HomeworkChoice[] }>;
  submissions: HomeworkSubmission[];
  answers: HomeworkAnswer[];
};

type TestBundle = {
  item: MonthlyTest;
  questions: Array<TestQuestion & { choices: TestChoice[] }>;
  submissions: TestSubmission[];
  answers: TestAnswer[];
};

type MessageBundle = {
  item: Message;
  senderName: string;
  recipients: RecipientOption[];
};

type AnnouncementBundle = {
  item: Announcement;
  authorName: string;
  audience: string;
};

type SchoolAdminTeacher = {
  userId: string;
  name: string;
  email: string | null;
  assignments: string[];
};

type SchoolAdminStudent = {
  userId: string;
  name: string;
  email: string | null;
  className: string;
  status: string;
  parents: string[];
};

type StudentSummary = {
  userId: string;
  name: string;
  email: string | null;
  className: string;
};

type ChildSummary = {
  userId: string;
  name: string;
  className: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

type SuperAdminData = {
  role: "super_admin";
  plans: Plan[];
  schools: SchoolRecord[];
  subscriptions: SchoolSubscription[];
  settings: PlatformSetting[];
  stats: SchoolUsageStat[];
  profiles: PlatformProfile[];
  roleRows: RoleRow[];
  auditLogs: AuditLogRecord[];
  counts: PlatformCounts;
};

type SchoolAdminData = {
  role: "school_admin";
  school: SchoolRecord;
  subscription: SchoolSubscription | null;
  usageStat: SchoolUsageStat | null;
  academicYears: AcademicYear[];
  workingDays: WorkingDay[];
  timeSlots: TimeSlot[];
  gradeLevels: GradeLevel[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  teachers: SchoolAdminTeacher[];
  students: SchoolAdminStudent[];
  recipientOptions: RecipientOption[];
  announcements: AnnouncementBundle[];
  timetable: TimetableEntry[];
  messages: MessageBundle[];
};

type TeacherData = {
  role: "teacher";
  school: SchoolRecord;
  assignments: TeacherAssignment[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  students: StudentSummary[];
  lessons: Lesson[];
  homework: HomeworkBundle[];
  tests: TestBundle[];
  timetable: TimetableEntry[];
  announcements: AnnouncementBundle[];
  messages: MessageBundle[];
  recipientOptions: RecipientOption[];
  grades: FinalGrade[];
};

type StudentData = {
  role: "student";
  school: SchoolRecord;
  enrollments: ClassEnrollment[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  lessons: Lesson[];
  homework: HomeworkBundle[];
  tests: TestBundle[];
  grades: FinalGrade[];
  attendance: AttendanceRecord[];
  timetable: TimetableEntry[];
  announcements: AnnouncementBundle[];
  messages: MessageBundle[];
  recipientOptions: RecipientOption[];
  notifications: NotificationRow[];
};

type ParentData = {
  role: "parent";
  school: SchoolRecord;
  children: ChildSummary[];
  enrollments: ClassEnrollment[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  lessons: Lesson[];
  homework: HomeworkBundle[];
  tests: TestBundle[];
  grades: FinalGrade[];
  attendance: AttendanceRecord[];
  timetable: TimetableEntry[];
  announcements: AnnouncementBundle[];
  messages: MessageBundle[];
  recipientOptions: RecipientOption[];
};

type LoadedWorkspaceData =
  | SuperAdminData
  | SchoolAdminData
  | TeacherData
  | StudentData
  | ParentData;

type FlashState = {
  kind: "success" | "error" | "info";
  message: string;
} | null;

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  super_admin: [
    { id: "dashboard", label: "Overview", icon: <Shield className="w-4 h-4" /> },
    { id: "schools", label: "Schools", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "people", label: "People", icon: <Users className="w-4 h-4" /> },
    { id: "access", label: "Access", icon: <UserPlus className="w-4 h-4" /> },
    { id: "billing", label: "Plans", icon: <Layers className="w-4 h-4" /> },
    { id: "audit", label: "Audit", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ],
  school_admin: [
    { id: "dashboard", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { id: "academic", label: "Academic", icon: <Layers className="w-4 h-4" /> },
    { id: "teachers", label: "Teachers", icon: <Users className="w-4 h-4" /> },
    { id: "students", label: "Students", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "timetable", label: "Timetable", icon: <Calendar className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" /> },
  ],
  teacher: [
    { id: "dashboard", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { id: "lessons", label: "Lessons", icon: <BookOpen className="w-4 h-4" /> },
    { id: "homework", label: "Homework", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "tests", label: "Tests", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
    { id: "timetable", label: "Timetable", icon: <Calendar className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" /> },
  ],
  student: [
    { id: "dashboard", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { id: "lessons", label: "Lessons", icon: <BookOpen className="w-4 h-4" /> },
    { id: "homework", label: "Homework", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "tests", label: "Tests", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "grades", label: "Grades", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <Calendar className="w-4 h-4" /> },
    { id: "timetable", label: "Timetable", icon: <Calendar className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" /> },
  ],
  parent: [
    { id: "dashboard", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { id: "children", label: "Children", icon: <Users className="w-4 h-4" /> },
    { id: "homework", label: "Homework", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "tests", label: "Tests", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "grades", label: "Grades", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <Calendar className="w-4 h-4" /> },
    { id: "timetable", label: "Timetable", icon: <Calendar className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" /> },
  ],
};

function unwrap<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function byId<T extends { id: string }>(rows: T[]) {
  return rows.reduce<Record<string, T>>((acc, row) => {
    acc[row.id] = row;
    return acc;
  }, {});
}

async function fetchExactCount(table: string) {
  const result = await supabase.from(table).select("id", { count: "exact", head: true });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.count ?? 0;
}

function fullName(profile?: Partial<BasicProfile> | null) {
  if (!profile) return "Unknown";
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return name || profile.email || "Unknown";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function currencyFromCents(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function roleRank(role: UserRole) {
  return {
    super_admin: 0,
    school_admin: 1,
    teacher: 2,
    student: 3,
    parent: 4,
  }[role];
}

function dayLabel(day: number) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day] ?? `Day ${day}`;
}

function parseName(value: string) {
  const trimmed = value.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] ?? "",
    last_name: parts.slice(1).join(" "),
  };
}

function titleCaseLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeLineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function keyFromLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseLooseScalar(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const lowered = trimmed.toLowerCase();
  if (lowered === "true") return true;
  if (lowered === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function formatEditorScalar(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (Array.isArray(value)) return value.map((item) => formatEditorScalar(item)).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${titleCaseLabel(key)} ${formatEditorScalar(item)}`.trim())
      .join(", ");
  }
  return String(value);
}

function formatInlineValue(value: unknown): string {
  if (value == null || value === "") return "Empty";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (Array.isArray(value)) return value.map((item) => formatInlineValue(item)).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${titleCaseLabel(key)}: ${formatInlineValue(item)}`)
      .join(", ");
  }
  return String(value);
}

function planFeaturesToEditorValue(features: Plan["features"]) {
  if (!features) return "";
  return Object.entries(features)
    .flatMap(([key, value]) => {
      if (value === false || value == null || value === "") return [];
      if (value === true) return [titleCaseLabel(key)];
      return [`${titleCaseLabel(key)}: ${formatEditorScalar(value)}`];
    })
    .join("\n");
}

function planFeaturesToList(features: Plan["features"]) {
  if (!features) return [] as string[];
  return Object.entries(features).flatMap(([key, value]) => {
    if (value === false || value == null || value === "") return [];
    if (value === true) return [titleCaseLabel(key)];
    return [`${titleCaseLabel(key)}: ${formatInlineValue(value)}`];
  });
}

function parsePlanFeaturesInput(value: string) {
  const features: Record<string, unknown> = {};
  for (const line of normalizeLineList(value)) {
    const separatorIndex = line.search(/[:=]/);
    const label = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1).trim();
    const key = keyFromLabel(label);
    if (!key) continue;
    features[key] = rawValue ? parseLooseScalar(rawValue) : true;
  }
  return features;
}

function inferSettingValueType(value: unknown): SettingValueType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "list";
  if (value && typeof value === "object") return "pairs";
  return "text";
}

function settingValueToEditorState(value: unknown) {
  const valueType = inferSettingValueType(value);
  if (valueType === "boolean") {
    return {
      valueType,
      valueInput: "",
      booleanValue: value ? "true" : "false",
    };
  }
  if (valueType === "number") {
    return {
      valueType,
      valueInput: String(value),
      booleanValue: "false" as const,
    };
  }
  if (valueType === "list") {
    return {
      valueType,
      valueInput: (value as unknown[]).map((item) => formatEditorScalar(item)).join("\n"),
      booleanValue: "false" as const,
    };
  }
  if (valueType === "pairs") {
    return {
      valueType,
      valueInput: Object.entries(value as Record<string, unknown>)
        .map(([key, item]) => `${key} = ${formatEditorScalar(item)}`)
        .join("\n"),
      booleanValue: "false" as const,
    };
  }
  return {
    valueType,
    valueInput: value == null ? "" : String(value),
    booleanValue: "false" as const,
  };
}

function parseSettingPairsInput(value: string) {
  const entries: [string, unknown][] = [];
  for (const line of normalizeLineList(value)) {
    const separatorIndex = line.search(/[:=]/);
    if (separatorIndex === -1) {
      throw new Error("Use one key/value pair per line, like support_email = help@school.com.");
    }
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!key) {
      throw new Error("Every key/value line needs a key before =.");
    }
    entries.push([key, parseLooseScalar(rawValue)]);
  }
  return Object.fromEntries(entries);
}

function formatSettingValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value || "Empty";
  if (Array.isArray(value)) {
    return value.length ? value.map((item) => `- ${formatInlineValue(item)}`).join("\n") : "Empty list";
  }
  if (value && typeof value === "object") {
    const lines = Object.entries(value as Record<string, unknown>).map(
      ([key, item]) => `${titleCaseLabel(key)}: ${formatInlineValue(item)}`,
    );
    return lines.length ? lines.join("\n") : "No values";
  }
  return "Empty";
}

function targetSummary(
  target: AnnouncementTarget | undefined,
  classMap: Record<string, ClassRecord>,
): string {
  if (!target) return "Published";
  if (target.target_type === "school") return "Whole school";
  if (target.target_type === "role") return `All ${target.target_role?.replace("_", " ") ?? "members"}`;
  if (target.target_type === "class" && target.target_id) {
    return classMap[target.target_id]?.name ? `Class ${classMap[target.target_id].name}` : "Class group";
  }
  if (target.target_type === "grade_level") return "Grade level";
  return "Published";
}

async function fetchProfilesByIds(ids: string[]) {
  if (ids.length === 0) return [] as BasicProfile[];
  return unwrap(
    await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,phone,avatar_url")
      .in("id", unique(ids)),
  ) as BasicProfile[];
}

async function getAuthHeaders() {
  const sessionResult = await supabase.auth.getSession();
  const accessToken = sessionResult.data.session?.access_token;
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {};
}

async function invokeFunctionJson<T>(name: string, body: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data as T;
}

async function bootstrapSuperAdminRole(firstName?: string | null, lastName?: string | null) {
  return invokeFunctionJson<{ status: string; role: string; user_id: string }>("bootstrap-super-admin", {
    first_name: firstName ?? undefined,
    last_name: lastName ?? undefined,
  });
}

async function downloadExport(entity: string, schoolId: string, academicYearId?: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${supabaseUrl}/functions/v1/export-data`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: (headers.Authorization as string | undefined) ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      school_id: schoolId,
      entity,
      academic_year_id: academicYearId,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Export failed");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function loadMemberships(user: Session["user"]) {
  const [profile, roles] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,first_name,last_name,phone,avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_school_roles")
      .select("id,user_id,school_id,role,is_active")
      .eq("user_id", user.id)
      .eq("is_active", true),
  ]);

  const roleRows = unwrap(roles) as RoleRow[];
  const schoolIds = unique(roleRows.map((row) => row.school_id).filter(Boolean) as string[]);
  const schools = schoolIds.length
    ? ((unwrap(
        await supabase
          .from("schools")
          .select("id,name,slug,timezone,is_active,settings,created_at")
          .in("id", schoolIds),
      ) as unknown) as SchoolRecord[])
    : [];
  const schoolMap = byId(schools);

  const currentProfile: BasicProfile = profile.data
    ? (profile.data as BasicProfile)
    : {
        id: user.id,
        email: user.email ?? null,
        first_name: (user.user_metadata?.first_name as string | undefined) ?? null,
        last_name: (user.user_metadata?.last_name as string | undefined) ?? null,
        phone: null,
      };

  const workspaces = roleRows
    .map<Workspace>((row) => ({
      key: `${row.school_id ?? "platform"}:${row.role}`,
      role: row.role,
      schoolId: row.school_id,
      schoolName: row.school_id ? schoolMap[row.school_id]?.name ?? "Unknown school" : "Platform",
      school: row.school_id ? schoolMap[row.school_id] ?? null : null,
    }))
    .sort((a, b) => roleRank(a.role) - roleRank(b.role) || a.schoolName.localeCompare(b.schoolName));

  return { profile: currentProfile, workspaces };
}

async function loadMessagesForSchool(schoolId: string) {
  const messages = (unwrap(
    await supabase
      .from("messages")
      .select("id,school_id,sender_id,subject,body,created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(40),
  ) as unknown) as Message[];
  const messageIds = messages.map((item) => item.id);
  const recipients = messageIds.length
    ? ((unwrap(
        await supabase
          .from("message_recipients")
          .select("id,message_id,recipient_id,is_read,read_at")
          .in("message_id", messageIds),
      ) as unknown) as MessageRecipient[])
    : [];
  return { messages, recipients };
}

async function loadAnnouncementsForSchool(schoolId: string) {
  const announcements = (unwrap(
    await supabase
      .from("announcements")
      .select("id,school_id,author_id,title,body,is_published,published_at,created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(40),
  ) as unknown) as Announcement[];
  const announcementIds = announcements.map((item) => item.id);
  const targets = announcementIds.length
    ? ((unwrap(
        await supabase
          .from("announcement_targets")
          .select("id,announcement_id,target_type,target_id,target_role")
          .in("announcement_id", announcementIds),
      ) as unknown) as AnnouncementTarget[])
    : [];
  return { announcements, targets };
}

function bundleMessages(
  messages: Message[],
  recipients: MessageRecipient[],
  profiles: Record<string, BasicProfile>,
) {
  return messages.map<MessageBundle>((item) => ({
    item,
    senderName: fullName(profiles[item.sender_id]),
    recipients: recipients
      .filter((recipient) => recipient.message_id === item.id)
      .map((recipient) => ({
        id: recipient.recipient_id,
        label: fullName(profiles[recipient.recipient_id]),
        email: profiles[recipient.recipient_id]?.email ?? null,
      })),
  }));
}

function bundleAnnouncements(
  announcements: Announcement[],
  targets: AnnouncementTarget[],
  profiles: Record<string, BasicProfile>,
  classMap: Record<string, ClassRecord>,
) {
  return announcements.map<AnnouncementBundle>((item) => ({
    item,
    authorName: fullName(profiles[item.author_id]),
    audience: targetSummary(targets.find((target) => target.announcement_id === item.id), classMap),
  }));
}

function bundleHomework(
  homework: Homework[],
  lessons: Lesson[],
  questions: HomeworkQuestion[],
  choices: HomeworkChoice[],
  submissions: HomeworkSubmission[],
  answers: HomeworkAnswer[],
) {
  const lessonMap = byId(lessons);
  return homework.map<HomeworkBundle>((item) => ({
    item,
    lesson: lessonMap[item.lesson_id],
    questions: questions
      .filter((question) => question.homework_id === item.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((question) => ({
        ...question,
        choices: choices
          .filter((choice) => choice.question_id === question.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      })),
    submissions: submissions.filter((submission) => submission.homework_id === item.id),
    answers,
  }));
}

function bundleTests(
  tests: MonthlyTest[],
  questions: TestQuestion[],
  choices: TestChoice[],
  submissions: TestSubmission[],
  answers: TestAnswer[],
) {
  return tests.map<TestBundle>((item) => ({
    item,
    questions: questions
      .filter((question) => question.test_id === item.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((question) => ({
        ...question,
        choices: choices
          .filter((choice) => choice.question_id === question.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      })),
    submissions: submissions.filter((submission) => submission.test_id === item.id),
    answers,
  }));
}

async function loadSuperAdminData() {
  const [
    stats,
    schools,
    plans,
    subscriptions,
    settings,
    profiles,
    roleRows,
    auditLogs,
    classCount,
    subjectCount,
    lessonCount,
    announcementCount,
    messageCount,
  ] = await Promise.all([
    supabase.rpc("get_school_usage_stats"),
    supabase
      .from("schools")
      .select("id,name,slug,timezone,is_active,settings,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("subscription_plans")
      .select("id,name,max_students,max_teachers,price_cents,billing_cycle,features,is_active")
      .order("price_cents", { ascending: true }),
    supabase
      .from("school_subscriptions")
      .select("id,school_id,plan_id,status,starts_at,ends_at,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("platform_settings").select("key,value").order("key"),
    supabase
      .from("profiles")
      .select("id,email,first_name,last_name,phone,avatar_url,is_active,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_school_roles")
      .select("id,user_id,school_id,role,is_active,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("id,school_id,actor_id,action,entity_type,entity_id,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(120),
    fetchExactCount("classes"),
    fetchExactCount("subjects"),
    fetchExactCount("lessons"),
    fetchExactCount("announcements"),
    fetchExactCount("messages"),
  ]);

  const statsRows = (unwrap(stats) as unknown) as SchoolUsageStat[];
  const schoolRows = (unwrap(schools) as unknown) as SchoolRecord[];
  const planRows = (unwrap(plans) as unknown) as Plan[];
  const subscriptionRows = (unwrap(subscriptions) as unknown) as SchoolSubscription[];
  const settingRows = (unwrap(settings) as unknown) as PlatformSetting[];
  const profileRows = (unwrap(profiles) as unknown) as PlatformProfile[];
  const roleRowsData = (unwrap(roleRows) as unknown) as RoleRow[];
  const auditRows = (unwrap(auditLogs) as unknown) as AuditLogRecord[];
  const statsBySchoolId = statsRows.reduce<Record<string, SchoolUsageStat>>((acc, row) => {
    acc[row.school_id] = row;
    return acc;
  }, {});
  const latestSubscriptionsBySchool = subscriptionRows.reduce<Record<string, SchoolSubscription>>((acc, row) => {
    if (!acc[row.school_id]) {
      acc[row.school_id] = row;
    }
    return acc;
  }, {});
  const roleCountsBySchool = roleRowsData.reduce<Record<string, { student_count: number; teacher_count: number; parent_count: number }>>(
    (acc, row) => {
      if (!row.school_id || !row.is_active) return acc;
      if (!acc[row.school_id]) {
        acc[row.school_id] = { student_count: 0, teacher_count: 0, parent_count: 0 };
      }
      if (row.role === "student") acc[row.school_id].student_count += 1;
      if (row.role === "teacher") acc[row.school_id].teacher_count += 1;
      if (row.role === "parent") acc[row.school_id].parent_count += 1;
      return acc;
    },
    {},
  );
  const hydratedStatsRows = schoolRows.map<SchoolUsageStat>((school) => {
    const stat = statsBySchoolId[school.id];
    const subscription = latestSubscriptionsBySchool[school.id];
    const roleCounts = roleCountsBySchool[school.id] ?? {
      student_count: 0,
      teacher_count: 0,
      parent_count: 0,
    };

    return {
      school_id: school.id,
      school_name: school.name,
      is_active: school.is_active,
      student_count: stat?.student_count ?? roleCounts.student_count,
      teacher_count: stat?.teacher_count ?? roleCounts.teacher_count,
      parent_count: stat?.parent_count ?? roleCounts.parent_count,
      class_count: stat?.class_count ?? 0,
      subscription_status: stat?.subscription_status ?? subscription?.status ?? null,
      last_activity_at: stat?.last_activity_at ?? school.created_at ?? null,
    };
  });

  return {
    role: "super_admin",
    stats: hydratedStatsRows,
    schools: schoolRows,
    plans: planRows,
    subscriptions: subscriptionRows,
    settings: settingRows,
    profiles: profileRows,
    roleRows: roleRowsData,
    auditLogs: auditRows,
    counts: {
      profiles: profileRows.length,
      role_assignments: roleRowsData.length,
      schools: schoolRows.length,
      subscriptions: subscriptionRows.length,
      classes: classCount,
      subjects: subjectCount,
      lessons: lessonCount,
      announcements: announcementCount,
      messages: messageCount,
    },
  } satisfies SuperAdminData;
}

async function loadSchoolAdminData(schoolId: string, currentUserId: string) {
  const [
    school,
    subscriptions,
    usageStats,
    academicYears,
    workingDays,
    timeSlots,
    gradeLevels,
    classes,
    subjects,
    roleRows,
    assignments,
    enrollments,
    parentLinks,
    timetable,
  ] = await Promise.all([
    supabase
      .from("schools")
      .select("id,name,slug,timezone,is_active,settings,created_at")
      .eq("id", schoolId)
      .single(),
    supabase
      .from("school_subscriptions")
      .select("id,school_id,plan_id,status,starts_at,ends_at,created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.rpc("get_school_usage_stats", { p_school_id: schoolId }),
    supabase
      .from("academic_years")
      .select("id,school_id,name,start_date,end_date,is_current")
      .eq("school_id", schoolId)
      .order("start_date", { ascending: false }),
    supabase
      .from("working_days")
      .select("id,school_id,day_of_week,label")
      .eq("school_id", schoolId)
      .order("day_of_week", { ascending: true }),
    supabase
      .from("time_slots")
      .select("id,school_id,label,start_time,end_time,sort_order")
      .eq("school_id", schoolId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("grade_levels")
      .select("id,school_id,name,sort_order")
      .eq("school_id", schoolId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("classes")
      .select("id,school_id,academic_year_id,grade_level_id,name,created_at")
      .eq("school_id", schoolId)
      .order("name", { ascending: true }),
    supabase
      .from("subjects")
      .select("id,school_id,name,code")
      .eq("school_id", schoolId)
      .order("name", { ascending: true }),
    supabase
      .from("user_school_roles")
      .select("id,user_id,school_id,role,is_active")
      .eq("school_id", schoolId)
      .eq("is_active", true),
    supabase
      .from("teacher_subject_assignments")
      .select("id,school_id,teacher_id,subject_id,class_id")
      .eq("school_id", schoolId),
    supabase
      .from("class_enrollments")
      .select("id,school_id,class_id,student_id,status,enrolled_at")
      .eq("school_id", schoolId),
    supabase
      .from("parent_student_links")
      .select("id,school_id,parent_id,student_id,relationship")
      .eq("school_id", schoolId),
    supabase
      .from("timetable_entries")
      .select("id,school_id,academic_year_id,working_day_id,time_slot_id,class_id,subject_id,teacher_id")
      .eq("school_id", schoolId),
  ]);

  const { messages, recipients } = await loadMessagesForSchool(schoolId);
  const { announcements, targets } = await loadAnnouncementsForSchool(schoolId);

  const roleData = (unwrap(roleRows) as unknown) as RoleRow[];
  const profiles = await fetchProfilesByIds(roleData.map((row) => row.user_id));
  const profileMap = byId(profiles);
  const classRows = (unwrap(classes) as unknown) as ClassRecord[];
  const classMap = byId(classRows);
  const subjectRows = (unwrap(subjects) as unknown) as SubjectRecord[];
  const subjectMap = byId(subjectRows);

  const rolesByUser = roleData.reduce<Record<string, UserRole[]>>((acc, row) => {
    acc[row.user_id] = acc[row.user_id] ? [...acc[row.user_id], row.role] : [row.role];
    return acc;
  }, {});

  const parentNamesByStudent = ((unwrap(parentLinks) as unknown) as ParentStudentLink[]).reduce<Record<string, string[]>>(
    (acc, row) => {
      const list = acc[row.student_id] ?? [];
      const parentName = fullName(profileMap[row.parent_id]);
      acc[row.student_id] = parentName ? [...list, parentName] : list;
      return acc;
    },
    {},
  );

  const teacherAssignments = ((unwrap(assignments) as unknown) as TeacherAssignment[]).reduce<Record<string, string[]>>(
    (acc, row) => {
      const subjectName = subjectMap[row.subject_id]?.name ?? "Unknown subject";
      const className = row.class_id ? classMap[row.class_id]?.name ?? "Unknown class" : "All classes";
      const label = `${subjectName} · ${className}`;
      acc[row.teacher_id] = acc[row.teacher_id] ? [...acc[row.teacher_id], label] : [label];
      return acc;
    },
    {},
  );

  const teachers = unique(roleData.filter((row) => row.role === "teacher").map((row) => row.user_id)).map<SchoolAdminTeacher>(
    (teacherId) => ({
      userId: teacherId,
      name: fullName(profileMap[teacherId]),
      email: profileMap[teacherId]?.email ?? null,
      assignments: teacherAssignments[teacherId] ?? [],
    }),
  );

  const students = unique(roleData.filter((row) => row.role === "student").map((row) => row.user_id)).map<SchoolAdminStudent>(
    (studentId) => {
      const enrollment = ((unwrap(enrollments) as unknown) as ClassEnrollment[]).find(
        (row) => row.student_id === studentId,
      );
      return {
        userId: studentId,
        name: fullName(profileMap[studentId]),
        email: profileMap[studentId]?.email ?? null,
        className: enrollment ? classMap[enrollment.class_id]?.name ?? "Unknown class" : "Not enrolled",
        status: enrollment?.status ?? "inactive",
        parents: parentNamesByStudent[studentId] ?? [],
      };
    },
  );

  const recipientOptions = unique(roleData.map((row) => row.user_id))
    .filter((userId) => userId !== currentUserId)
    .map<RecipientOption>((userId) => ({
      id: userId,
      label: `${fullName(profileMap[userId])}${rolesByUser[userId]?.length ? ` · ${rolesByUser[userId].map((role) => ROLE_LABELS[role]).join(", ")}` : ""}`,
      email: profileMap[userId]?.email ?? null,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    role: "school_admin",
    school: (unwrap(school) as unknown) as SchoolRecord,
    subscription: (((unwrap(subscriptions) as unknown) as SchoolSubscription[]) ?? [])[0] ?? null,
    usageStat: (((unwrap(usageStats) as unknown) as SchoolUsageStat[]) ?? [])[0] ?? null,
    academicYears: (unwrap(academicYears) as unknown) as AcademicYear[],
    workingDays: (unwrap(workingDays) as unknown) as WorkingDay[],
    timeSlots: (unwrap(timeSlots) as unknown) as TimeSlot[],
    gradeLevels: (unwrap(gradeLevels) as unknown) as GradeLevel[],
    classes: classRows,
    subjects: subjectRows,
    teachers,
    students,
    recipientOptions,
    announcements: bundleAnnouncements(announcements, targets, profileMap, classMap),
    timetable: (unwrap(timetable) as unknown) as TimetableEntry[],
    messages: bundleMessages(messages, recipients, profileMap),
  } satisfies SchoolAdminData;
}

async function loadTeacherData(schoolId: string, currentUserId: string) {
  const [
    school,
    assignments,
    classes,
    subjects,
    enrollments,
    lessons,
    homework,
    tests,
    grades,
    timetable,
  ] = await Promise.all([
    supabase
      .from("schools")
      .select("id,name,slug,timezone,is_active,settings,created_at")
      .eq("id", schoolId)
      .single(),
    supabase
      .from("teacher_subject_assignments")
      .select("id,school_id,teacher_id,subject_id,class_id")
      .eq("school_id", schoolId)
      .eq("teacher_id", currentUserId),
    supabase
      .from("classes")
      .select("id,school_id,academic_year_id,grade_level_id,name,created_at")
      .eq("school_id", schoolId),
    supabase.from("subjects").select("id,school_id,name,code").eq("school_id", schoolId),
    supabase
      .from("class_enrollments")
      .select("id,school_id,class_id,student_id,status,enrolled_at")
      .eq("school_id", schoolId),
    supabase
      .from("lessons")
      .select("id,school_id,class_id,subject_id,teacher_id,title,description,video_url,lesson_date,created_at")
      .eq("school_id", schoolId)
      .eq("teacher_id", currentUserId)
      .order("lesson_date", { ascending: false }),
    supabase
      .from("homework")
      .select("id,school_id,lesson_id,title,due_date,created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false }),
    supabase
      .from("monthly_tests")
      .select("id,school_id,class_id,subject_id,teacher_id,title,test_date,duration_minutes,kind,created_at")
      .eq("school_id", schoolId)
      .eq("teacher_id", currentUserId)
      .order("created_at", { ascending: false }),
    supabase
      .from("final_grades")
      .select("id,school_id,academic_year_id,class_id,subject_id,student_id,grade_value,grade_letter,remarks,status")
      .eq("school_id", schoolId),
    supabase
      .from("timetable_entries")
      .select("id,school_id,academic_year_id,working_day_id,time_slot_id,class_id,subject_id,teacher_id")
      .eq("school_id", schoolId)
      .eq("teacher_id", currentUserId),
  ]);

  const { messages, recipients } = await loadMessagesForSchool(schoolId);
  const { announcements, targets } = await loadAnnouncementsForSchool(schoolId);

  const assignmentRows = (unwrap(assignments) as unknown) as TeacherAssignment[];
  const lessonRows = (unwrap(lessons) as unknown) as Lesson[];
  const homeworkRows = ((unwrap(homework) as unknown) as Homework[]).filter((item) =>
    lessonRows.some((lesson) => lesson.id === item.lesson_id),
  );
  const homeworkIds = homeworkRows.map((item) => item.id);
  const testRows = (unwrap(tests) as unknown) as MonthlyTest[];
  const testIds = testRows.map((item) => item.id);
  const assignedClassIds = unique(assignmentRows.map((row) => row.class_id).filter(Boolean) as string[]);

  const [
    homeworkQuestions,
    homeworkChoices,
    homeworkSubmissions,
    homeworkAnswers,
    testQuestions,
    testChoices,
    testSubmissions,
    testAnswers,
    teacherProfiles,
  ] = await Promise.all([
    homeworkIds.length
      ? supabase
          .from("homework_questions")
          .select("id,homework_id,question_text,sort_order")
          .in("homework_id", homeworkIds)
      : Promise.resolve({ data: [] as HomeworkQuestion[], error: null }),
    homeworkIds.length
      ? supabase
          .from("homework_choices")
          .select("id,question_id,choice_text,is_correct,sort_order")
          .in(
            "question_id",
            unique(
              (((await (homeworkIds.length
                ? supabase
                    .from("homework_questions")
                    .select("id,homework_id,question_text,sort_order")
                    .in("homework_id", homeworkIds)
                : Promise.resolve({ data: [] as HomeworkQuestion[], error: null }))) as unknown as {
                data: HomeworkQuestion[];
              }).data ?? []).map((question) => question.id),
            ),
          )
      : Promise.resolve({ data: [] as HomeworkChoice[], error: null }),
    homeworkIds.length
      ? supabase
          .from("homework_submissions")
          .select("id,homework_id,student_id,submitted_at,score,graded_at")
          .in("homework_id", homeworkIds)
      : Promise.resolve({ data: [] as HomeworkSubmission[], error: null }),
    homeworkIds.length
      ? supabase
          .from("homework_answers")
          .select("id,submission_id,question_id,selected_choice_id,is_correct")
          .in(
            "submission_id",
            unique(
              (((await (homeworkIds.length
                ? supabase
                    .from("homework_submissions")
                    .select("id,homework_id,student_id,submitted_at,score,graded_at")
                    .in("homework_id", homeworkIds)
                : Promise.resolve({ data: [] as HomeworkSubmission[], error: null }))) as unknown as {
                data: HomeworkSubmission[];
              }).data ?? []).map((submission) => submission.id),
            ),
          )
      : Promise.resolve({ data: [] as HomeworkAnswer[], error: null }),
    testIds.length
      ? supabase.from("test_questions").select("id,test_id,question_text,sort_order").in("test_id", testIds)
      : Promise.resolve({ data: [] as TestQuestion[], error: null }),
    testIds.length
      ? supabase
          .from("test_choices")
          .select("id,question_id,choice_text,is_correct,sort_order")
          .in(
            "question_id",
            unique(
              (((await (testIds.length
                ? supabase.from("test_questions").select("id,test_id,question_text,sort_order").in("test_id", testIds)
                : Promise.resolve({ data: [] as TestQuestion[], error: null }))) as unknown as {
                data: TestQuestion[];
              }).data ?? []).map((question) => question.id),
            ),
          )
      : Promise.resolve({ data: [] as TestChoice[], error: null }),
    testIds.length
      ? supabase
          .from("test_submissions")
          .select("id,test_id,student_id,submitted_at,score,graded_at")
          .in("test_id", testIds)
      : Promise.resolve({ data: [] as TestSubmission[], error: null }),
    testIds.length
      ? supabase
          .from("test_answers")
          .select("id,submission_id,question_id,selected_choice_id,is_correct")
          .in(
            "submission_id",
            unique(
              (((await (testIds.length
                ? supabase
                    .from("test_submissions")
                    .select("id,test_id,student_id,submitted_at,score,graded_at")
                    .in("test_id", testIds)
                : Promise.resolve({ data: [] as TestSubmission[], error: null }))) as unknown as {
                data: TestSubmission[];
              }).data ?? []).map((submission) => submission.id),
            ),
          )
      : Promise.resolve({ data: [] as TestAnswer[], error: null }),
    fetchProfilesByIds(
      unique([
        ...((unwrap(enrollments) as unknown) as ClassEnrollment[])
          .filter((row) => assignedClassIds.includes(row.class_id))
          .map((row) => row.student_id),
        ...messages.map((message) => message.sender_id),
        ...recipients.map((recipient) => recipient.recipient_id),
        ...announcements.map((announcement) => announcement.author_id),
        currentUserId,
      ]),
    ),
  ]);

  const profileMap = byId(teacherProfiles);
  const classRows = (unwrap(classes) as unknown) as ClassRecord[];
  const classMap = byId(classRows);
  const subjectRows = (unwrap(subjects) as unknown) as SubjectRecord[];
  const subjectMap = byId(subjectRows);
  const homeworkBundles = bundleHomework(
    homeworkRows,
    lessonRows,
    (unwrap(homeworkQuestions) as unknown) as HomeworkQuestion[],
    (unwrap(homeworkChoices) as unknown) as HomeworkChoice[],
    (unwrap(homeworkSubmissions) as unknown) as HomeworkSubmission[],
    (unwrap(homeworkAnswers) as unknown) as HomeworkAnswer[],
  );
  const testBundles = bundleTests(
    testRows,
    (unwrap(testQuestions) as unknown) as TestQuestion[],
    (unwrap(testChoices) as unknown) as TestChoice[],
    (unwrap(testSubmissions) as unknown) as TestSubmission[],
    (unwrap(testAnswers) as unknown) as TestAnswer[],
  );

  const studentRows = ((unwrap(enrollments) as unknown) as ClassEnrollment[])
    .filter((row) => assignedClassIds.includes(row.class_id))
    .map<StudentSummary>((row) => ({
      userId: row.student_id,
      name: fullName(profileMap[row.student_id]),
      email: profileMap[row.student_id]?.email ?? null,
      className: classMap[row.class_id]?.name ?? "Unknown class",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const recipientOptions = unique([
    ...studentRows.map((row) => row.userId),
    ...assignmentRows.map((row) => row.teacher_id),
  ])
    .filter((id) => id !== currentUserId)
    .map<RecipientOption>((id) => ({
      id,
      label: fullName(profileMap[id]),
      email: profileMap[id]?.email ?? null,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    role: "teacher",
    school: (unwrap(school) as unknown) as SchoolRecord,
    assignments: assignmentRows,
    classes: classRows,
    subjects: subjectRows,
    students: studentRows,
    lessons: lessonRows,
    homework: homeworkBundles,
    tests: testBundles,
    timetable: (unwrap(timetable) as unknown) as TimetableEntry[],
    announcements: bundleAnnouncements(announcements, targets, profileMap, classMap),
    messages: bundleMessages(messages, recipients, profileMap),
    recipientOptions,
    grades: (unwrap(grades) as unknown) as FinalGrade[],
  } satisfies TeacherData;
}

async function loadStudentData(schoolId: string, currentUserId: string) {
  const [school, enrollments, classes, subjects, lessons, homework, tests, grades, attendance, timetable, notifications] =
    await Promise.all([
      supabase
        .from("schools")
        .select("id,name,slug,timezone,is_active,settings,created_at")
        .eq("id", schoolId)
        .single(),
      supabase
        .from("class_enrollments")
        .select("id,school_id,class_id,student_id,status,enrolled_at")
        .eq("school_id", schoolId)
        .eq("student_id", currentUserId),
      supabase
        .from("classes")
        .select("id,school_id,academic_year_id,grade_level_id,name,created_at")
        .eq("school_id", schoolId),
      supabase.from("subjects").select("id,school_id,name,code").eq("school_id", schoolId),
      supabase
        .from("lessons")
        .select("id,school_id,class_id,subject_id,teacher_id,title,description,video_url,lesson_date,created_at")
        .eq("school_id", schoolId)
        .order("lesson_date", { ascending: false }),
      supabase
        .from("homework")
        .select("id,school_id,lesson_id,title,due_date,created_at")
        .eq("school_id", schoolId)
        .order("due_date", { ascending: true }),
      supabase
        .from("monthly_tests")
        .select("id,school_id,class_id,subject_id,teacher_id,title,test_date,duration_minutes,kind,created_at")
        .eq("school_id", schoolId)
        .order("test_date", { ascending: true }),
      supabase
        .from("final_grades")
        .select("id,school_id,academic_year_id,class_id,subject_id,student_id,grade_value,grade_letter,remarks,status")
        .eq("school_id", schoolId),
      supabase
        .from("attendance_records")
        .select("id,school_id,lesson_id,student_id,status,recorded_at")
        .eq("school_id", schoolId)
        .eq("student_id", currentUserId)
        .order("recorded_at", { ascending: false }),
      supabase
        .from("timetable_entries")
        .select("id,school_id,academic_year_id,working_day_id,time_slot_id,class_id,subject_id,teacher_id")
        .eq("school_id", schoolId),
      supabase
        .from("notifications")
        .select("id,title,body,status,created_at")
        .eq("recipient_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const { messages, recipients } = await loadMessagesForSchool(schoolId);
  const { announcements, targets } = await loadAnnouncementsForSchool(schoolId);

  const homeworkRows = (unwrap(homework) as unknown) as Homework[];
  const testRows = (unwrap(tests) as unknown) as MonthlyTest[];
  const homeworkIds = homeworkRows.map((item) => item.id);
  const testIds = testRows.map((item) => item.id);

  const [homeworkQuestions, homeworkChoices, homeworkSubmissions, homeworkAnswers, testQuestions, testChoices, testSubmissions, testAnswers, assignments] =
    await Promise.all([
      homeworkIds.length
        ? supabase
            .from("homework_questions")
            .select("id,homework_id,question_text,sort_order")
            .in("homework_id", homeworkIds)
        : Promise.resolve({ data: [] as HomeworkQuestion[], error: null }),
      homeworkIds.length
        ? supabase
            .from("homework_choices")
            .select("id,question_id,choice_text,is_correct,sort_order")
            .in(
              "question_id",
              unique(
                (((await (homeworkIds.length
                  ? supabase
                      .from("homework_questions")
                      .select("id,homework_id,question_text,sort_order")
                      .in("homework_id", homeworkIds)
                  : Promise.resolve({ data: [] as HomeworkQuestion[], error: null }))) as unknown as {
                  data: HomeworkQuestion[];
                }).data ?? []).map((question) => question.id),
              ),
            )
        : Promise.resolve({ data: [] as HomeworkChoice[], error: null }),
      homeworkIds.length
        ? supabase
            .from("homework_submissions")
            .select("id,homework_id,student_id,submitted_at,score,graded_at")
            .eq("student_id", currentUserId)
            .in("homework_id", homeworkIds)
        : Promise.resolve({ data: [] as HomeworkSubmission[], error: null }),
      homeworkIds.length
        ? supabase
            .from("homework_answers")
            .select("id,submission_id,question_id,selected_choice_id,is_correct")
            .in(
              "submission_id",
              unique(
                (((await (homeworkIds.length
                  ? supabase
                      .from("homework_submissions")
                      .select("id,homework_id,student_id,submitted_at,score,graded_at")
                      .eq("student_id", currentUserId)
                      .in("homework_id", homeworkIds)
                  : Promise.resolve({ data: [] as HomeworkSubmission[], error: null }))) as unknown as {
                  data: HomeworkSubmission[];
                }).data ?? []).map((submission) => submission.id),
              ),
            )
        : Promise.resolve({ data: [] as HomeworkAnswer[], error: null }),
      testIds.length
        ? supabase.from("test_questions").select("id,test_id,question_text,sort_order").in("test_id", testIds)
        : Promise.resolve({ data: [] as TestQuestion[], error: null }),
      testIds.length
        ? supabase
            .from("test_choices")
            .select("id,question_id,choice_text,is_correct,sort_order")
            .in(
              "question_id",
              unique(
                (((await (testIds.length
                  ? supabase.from("test_questions").select("id,test_id,question_text,sort_order").in("test_id", testIds)
                  : Promise.resolve({ data: [] as TestQuestion[], error: null }))) as unknown as {
                  data: TestQuestion[];
                }).data ?? []).map((question) => question.id),
              ),
            )
        : Promise.resolve({ data: [] as TestChoice[], error: null }),
      testIds.length
        ? supabase
            .from("test_submissions")
            .select("id,test_id,student_id,submitted_at,score,graded_at")
            .eq("student_id", currentUserId)
            .in("test_id", testIds)
        : Promise.resolve({ data: [] as TestSubmission[], error: null }),
      testIds.length
        ? supabase
            .from("test_answers")
            .select("id,submission_id,question_id,selected_choice_id,is_correct")
            .in(
              "submission_id",
              unique(
                (((await (testIds.length
                  ? supabase
                      .from("test_submissions")
                      .select("id,test_id,student_id,submitted_at,score,graded_at")
                      .eq("student_id", currentUserId)
                      .in("test_id", testIds)
                  : Promise.resolve({ data: [] as TestSubmission[], error: null }))) as unknown as {
                  data: TestSubmission[];
                }).data ?? []).map((submission) => submission.id),
              ),
            )
        : Promise.resolve({ data: [] as TestAnswer[], error: null }),
      supabase
        .from("teacher_subject_assignments")
        .select("id,school_id,teacher_id,subject_id,class_id")
        .eq("school_id", schoolId),
    ]);

  const classRows = (unwrap(classes) as unknown) as ClassRecord[];
  const classMap = byId(classRows);
  const profileIds = unique([
    ...messages.map((message) => message.sender_id),
    ...recipients.map((recipient) => recipient.recipient_id),
    ...announcements.map((announcement) => announcement.author_id),
    ...(((unwrap(assignments) as unknown) as TeacherAssignment[]).map((row) => row.teacher_id)),
    ...((unwrap(lessons) as unknown) as Lesson[]).map((row) => row.teacher_id),
    currentUserId,
  ]);
  const profiles = await fetchProfilesByIds(profileIds);
  const profileMap = byId(profiles);

  return {
    role: "student",
    school: (unwrap(school) as unknown) as SchoolRecord,
    enrollments: (unwrap(enrollments) as unknown) as ClassEnrollment[],
    classes: classRows,
    subjects: (unwrap(subjects) as unknown) as SubjectRecord[],
    lessons: (unwrap(lessons) as unknown) as Lesson[],
    homework: bundleHomework(
      homeworkRows,
      (unwrap(lessons) as unknown) as Lesson[],
      (unwrap(homeworkQuestions) as unknown) as HomeworkQuestion[],
      (unwrap(homeworkChoices) as unknown) as HomeworkChoice[],
      (unwrap(homeworkSubmissions) as unknown) as HomeworkSubmission[],
      (unwrap(homeworkAnswers) as unknown) as HomeworkAnswer[],
    ),
    tests: bundleTests(
      testRows,
      (unwrap(testQuestions) as unknown) as TestQuestion[],
      (unwrap(testChoices) as unknown) as TestChoice[],
      (unwrap(testSubmissions) as unknown) as TestSubmission[],
      (unwrap(testAnswers) as unknown) as TestAnswer[],
    ),
    grades: (unwrap(grades) as unknown) as FinalGrade[],
    attendance: (unwrap(attendance) as unknown) as AttendanceRecord[],
    timetable: ((unwrap(timetable) as unknown) as TimetableEntry[]).filter((entry) =>
      ((unwrap(enrollments) as unknown) as ClassEnrollment[]).some((enrollment) => enrollment.class_id === entry.class_id),
    ),
    announcements: bundleAnnouncements(announcements, targets, profileMap, classMap),
    messages: bundleMessages(messages, recipients, profileMap),
    recipientOptions: unique(
      (((unwrap(assignments) as unknown) as TeacherAssignment[]).map((row) => row.teacher_id)),
    ).map<RecipientOption>((teacherId) => ({
      id: teacherId,
      label: fullName(profileMap[teacherId]),
      email: profileMap[teacherId]?.email ?? null,
    })),
    notifications: (unwrap(notifications) as unknown) as NotificationRow[],
  } satisfies StudentData;
}

async function loadParentData(schoolId: string, currentUserId: string) {
  const [school, links, enrollments, classes, subjects, lessons, homework, tests, grades, attendance, timetable, assignments] =
    await Promise.all([
      supabase
        .from("schools")
        .select("id,name,slug,timezone,is_active,settings,created_at")
        .eq("id", schoolId)
        .single(),
      supabase
        .from("parent_student_links")
        .select("id,school_id,parent_id,student_id,relationship")
        .eq("school_id", schoolId)
        .eq("parent_id", currentUserId),
      supabase
        .from("class_enrollments")
        .select("id,school_id,class_id,student_id,status,enrolled_at")
        .eq("school_id", schoolId),
      supabase
        .from("classes")
        .select("id,school_id,academic_year_id,grade_level_id,name,created_at")
        .eq("school_id", schoolId),
      supabase.from("subjects").select("id,school_id,name,code").eq("school_id", schoolId),
      supabase
        .from("lessons")
        .select("id,school_id,class_id,subject_id,teacher_id,title,description,video_url,lesson_date,created_at")
        .eq("school_id", schoolId)
        .order("lesson_date", { ascending: false }),
      supabase
        .from("homework")
        .select("id,school_id,lesson_id,title,due_date,created_at")
        .eq("school_id", schoolId)
        .order("due_date", { ascending: true }),
      supabase
        .from("monthly_tests")
        .select("id,school_id,class_id,subject_id,teacher_id,title,test_date,duration_minutes,kind,created_at")
        .eq("school_id", schoolId)
        .order("test_date", { ascending: true }),
      supabase
        .from("final_grades")
        .select("id,school_id,academic_year_id,class_id,subject_id,student_id,grade_value,grade_letter,remarks,status")
        .eq("school_id", schoolId),
      supabase
        .from("attendance_records")
        .select("id,school_id,lesson_id,student_id,status,recorded_at")
        .eq("school_id", schoolId)
        .order("recorded_at", { ascending: false }),
      supabase
        .from("timetable_entries")
        .select("id,school_id,academic_year_id,working_day_id,time_slot_id,class_id,subject_id,teacher_id")
        .eq("school_id", schoolId),
      supabase
        .from("teacher_subject_assignments")
        .select("id,school_id,teacher_id,subject_id,class_id")
        .eq("school_id", schoolId),
    ]);

  const { messages, recipients } = await loadMessagesForSchool(schoolId);
  const { announcements, targets } = await loadAnnouncementsForSchool(schoolId);

  const childIds = (((unwrap(links) as unknown) as ParentStudentLink[]) ?? []).map((link) => link.student_id);
  const homeworkRows = (unwrap(homework) as unknown) as Homework[];
  const homeworkIds = homeworkRows.map((item) => item.id);
  const testRows = (unwrap(tests) as unknown) as MonthlyTest[];
  const testIds = testRows.map((item) => item.id);

  const [
    homeworkQuestions,
    homeworkChoices,
    homeworkSubmissions,
    homeworkAnswers,
    testQuestions,
    testChoices,
    testSubmissions,
    testAnswers,
  ] = await Promise.all([
    homeworkIds.length
      ? supabase
          .from("homework_questions")
          .select("id,homework_id,question_text,sort_order")
          .in("homework_id", homeworkIds)
      : Promise.resolve({ data: [] as HomeworkQuestion[], error: null }),
    homeworkIds.length
      ? supabase
          .from("homework_choices")
          .select("id,question_id,choice_text,is_correct,sort_order")
          .in(
            "question_id",
            unique(
              (((await (homeworkIds.length
                ? supabase
                    .from("homework_questions")
                    .select("id,homework_id,question_text,sort_order")
                    .in("homework_id", homeworkIds)
                : Promise.resolve({ data: [] as HomeworkQuestion[], error: null }))) as unknown as {
                data: HomeworkQuestion[];
              }).data ?? []).map((question) => question.id),
            ),
          )
      : Promise.resolve({ data: [] as HomeworkChoice[], error: null }),
    childIds.length && homeworkIds.length
      ? supabase
          .from("homework_submissions")
          .select("id,homework_id,student_id,submitted_at,score,graded_at")
          .in("student_id", childIds)
          .in("homework_id", homeworkIds)
      : Promise.resolve({ data: [] as HomeworkSubmission[], error: null }),
    childIds.length && homeworkIds.length
      ? supabase
          .from("homework_answers")
          .select("id,submission_id,question_id,selected_choice_id,is_correct")
          .in(
            "submission_id",
            unique(
              (((await (childIds.length && homeworkIds.length
                ? supabase
                    .from("homework_submissions")
                    .select("id,homework_id,student_id,submitted_at,score,graded_at")
                    .in("student_id", childIds)
                    .in("homework_id", homeworkIds)
                : Promise.resolve({ data: [] as HomeworkSubmission[], error: null }))) as unknown as {
                data: HomeworkSubmission[];
              }).data ?? []).map((submission) => submission.id),
            ),
          )
      : Promise.resolve({ data: [] as HomeworkAnswer[], error: null }),
    testIds.length
      ? supabase.from("test_questions").select("id,test_id,question_text,sort_order").in("test_id", testIds)
      : Promise.resolve({ data: [] as TestQuestion[], error: null }),
    testIds.length
      ? supabase
          .from("test_choices")
          .select("id,question_id,choice_text,is_correct,sort_order")
          .in(
            "question_id",
            unique(
              (((await (testIds.length
                ? supabase.from("test_questions").select("id,test_id,question_text,sort_order").in("test_id", testIds)
                : Promise.resolve({ data: [] as TestQuestion[], error: null }))) as unknown as {
                data: TestQuestion[];
              }).data ?? []).map((question) => question.id),
            ),
          )
      : Promise.resolve({ data: [] as TestChoice[], error: null }),
    childIds.length && testIds.length
      ? supabase
          .from("test_submissions")
          .select("id,test_id,student_id,submitted_at,score,graded_at")
          .in("student_id", childIds)
          .in("test_id", testIds)
      : Promise.resolve({ data: [] as TestSubmission[], error: null }),
    childIds.length && testIds.length
      ? supabase
          .from("test_answers")
          .select("id,submission_id,question_id,selected_choice_id,is_correct")
          .in(
            "submission_id",
            unique(
              (((await (childIds.length && testIds.length
                ? supabase
                    .from("test_submissions")
                    .select("id,test_id,student_id,submitted_at,score,graded_at")
                    .in("student_id", childIds)
                    .in("test_id", testIds)
                : Promise.resolve({ data: [] as TestSubmission[], error: null }))) as unknown as {
                data: TestSubmission[];
              }).data ?? []).map((submission) => submission.id),
            ),
          )
      : Promise.resolve({ data: [] as TestAnswer[], error: null }),
  ]);

  const classRows = (unwrap(classes) as unknown) as ClassRecord[];
  const classMap = byId(classRows);
  const profileIds = unique([
    ...childIds,
    ...messages.map((message) => message.sender_id),
    ...recipients.map((recipient) => recipient.recipient_id),
    ...announcements.map((announcement) => announcement.author_id),
    ...(((unwrap(assignments) as unknown) as TeacherAssignment[]).map((row) => row.teacher_id)),
    currentUserId,
  ]);
  const profiles = await fetchProfilesByIds(profileIds);
  const profileMap = byId(profiles);

  return {
    role: "parent",
    school: (unwrap(school) as unknown) as SchoolRecord,
    children: childIds.map<ChildSummary>((studentId) => {
      const enrollment = ((unwrap(enrollments) as unknown) as ClassEnrollment[]).find(
        (row) => row.student_id === studentId,
      );
      return {
        userId: studentId,
        name: fullName(profileMap[studentId]),
        className: enrollment ? classMap[enrollment.class_id]?.name ?? "Unknown class" : "Not enrolled",
      };
    }),
    enrollments: ((unwrap(enrollments) as unknown) as ClassEnrollment[]).filter((row) => childIds.includes(row.student_id)),
    classes: classRows,
    subjects: (unwrap(subjects) as unknown) as SubjectRecord[],
    lessons: ((unwrap(lessons) as unknown) as Lesson[]).filter((lesson) =>
      ((unwrap(enrollments) as unknown) as ClassEnrollment[]).some(
        (enrollment) => childIds.includes(enrollment.student_id) && enrollment.class_id === lesson.class_id,
      ),
    ),
    homework: bundleHomework(
      homeworkRows,
      ((unwrap(lessons) as unknown) as Lesson[]).filter((lesson) =>
        ((unwrap(enrollments) as unknown) as ClassEnrollment[]).some(
          (enrollment) => childIds.includes(enrollment.student_id) && enrollment.class_id === lesson.class_id,
        ),
      ),
      (unwrap(homeworkQuestions) as unknown) as HomeworkQuestion[],
      (unwrap(homeworkChoices) as unknown) as HomeworkChoice[],
      (unwrap(homeworkSubmissions) as unknown) as HomeworkSubmission[],
      (unwrap(homeworkAnswers) as unknown) as HomeworkAnswer[],
    ),
    tests: bundleTests(
      testRows,
      (unwrap(testQuestions) as unknown) as TestQuestion[],
      (unwrap(testChoices) as unknown) as TestChoice[],
      (unwrap(testSubmissions) as unknown) as TestSubmission[],
      (unwrap(testAnswers) as unknown) as TestAnswer[],
    ),
    grades: ((unwrap(grades) as unknown) as FinalGrade[]).filter((grade) => childIds.includes(grade.student_id)),
    attendance: ((unwrap(attendance) as unknown) as AttendanceRecord[]).filter((row) => childIds.includes(row.student_id)),
    timetable: ((unwrap(timetable) as unknown) as TimetableEntry[]).filter((entry) =>
      ((unwrap(enrollments) as unknown) as ClassEnrollment[]).some(
        (enrollment) => childIds.includes(enrollment.student_id) && enrollment.class_id === entry.class_id,
      ),
    ),
    announcements: bundleAnnouncements(announcements, targets, profileMap, classMap),
    messages: bundleMessages(messages, recipients, profileMap),
    recipientOptions: unique((((unwrap(assignments) as unknown) as TeacherAssignment[]).map((row) => row.teacher_id))).map<RecipientOption>(
      (teacherId) => ({
        id: teacherId,
        label: fullName(profileMap[teacherId]),
        email: profileMap[teacherId]?.email ?? null,
      }),
    ),
  } satisfies ParentData;
}

async function loadWorkspaceData(workspace: Workspace, currentUserId: string) {
  if (workspace.role === "super_admin") return loadSuperAdminData();
  if (!workspace.schoolId) throw new Error("This school access record is incomplete.");
  if (workspace.role === "school_admin") return loadSchoolAdminData(workspace.schoolId, currentUserId);
  if (workspace.role === "teacher") return loadTeacherData(workspace.schoolId, currentUserId);
  if (workspace.role === "student") return loadStudentData(workspace.schoolId, currentUserId);
  return loadParentData(workspace.schoolId, currentUserId);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
        props.className ?? ""
      }`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
        props.className ?? ""
      }`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
        props.className ?? ""
      }`}
    />
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const palette = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-primary hover:bg-secondary/80",
    ghost: "bg-transparent text-muted-foreground hover:bg-muted",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${palette[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "bg-secondary text-primary",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function Flash({ flash }: { flash: FlashState }) {
  if (!flash) return null;
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[flash.kind]}`}>
      {flash.message}
    </div>
  );
}

function WorkspaceShell({
  navItems,
  activeView,
  onSelect,
  onRefresh,
  onSignOut,
  onSwitchWorkspace,
  workspace,
  profile,
  loading,
  children,
}: {
  navItems: NavItem[];
  activeView: string;
  onSelect: (view: string) => void;
  onRefresh: () => void;
  onSignOut: () => void;
  onSwitchWorkspace: () => void;
  workspace: Workspace;
  profile: BasicProfile;
  loading: boolean;
  children: ReactNode;
}) {
  const useFloatingSidebar = workspace.role === "school_admin";

  return (
    <div
      className={`min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,24,39,0.06),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_26%)] text-foreground ${
        useFloatingSidebar ? "" : "md:h-screen md:overflow-hidden"
      }`}
    >
      <div
        className={`mx-auto flex min-h-screen max-w-[1600px] ${
          useFloatingSidebar ? "items-start px-4 py-4" : "md:h-full md:px-4 md:py-4"
        }`}
      >
        <aside
          className={`hidden w-80 shrink-0 md:flex md:pr-4 ${
            useFloatingSidebar ? "md:sticky md:top-4 md:z-20 md:self-start" : ""
          }`}
        >
          <div
            className={`flex w-full flex-col rounded-[2rem] border border-border/70 bg-card/92 px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur ${
              useFloatingSidebar
                ? "h-[calc(100vh-2rem)] ring-1 ring-white/40"
                : "sticky top-4 h-[calc(100vh-2rem)]"
            }`}
          >
            <div className="rounded-[1.5rem] bg-secondary p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Smart Class</p>
              <h1 className="mt-2 text-2xl font-bold">{workspace.schoolName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{ROLE_LABELS[workspace.role]}</p>
            </div>

            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeView === item.id
                      ? "bg-primary text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-5 rounded-[1.5rem] border border-border bg-muted/45 p-4">
              <p className="text-sm font-semibold">{fullName(profile)}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" className="flex-1" onClick={onSwitchWorkspace}>
                  Switch
                </Button>
                <Button variant="ghost" className="flex-1" onClick={onSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main
          className={`min-w-0 flex-1 px-4 py-4 md:rounded-[2rem] md:border md:border-border/60 md:bg-card/30 md:px-8 md:py-6 md:shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${
            useFloatingSidebar ? "self-start" : "md:h-full md:overflow-y-auto"
          }`}
        >
          <div
            className={`mb-6 flex flex-col gap-3 md:sticky md:z-10 md:-mx-2 md:rounded-[1.5rem] md:border md:border-border/60 md:bg-background/90 md:px-2 md:py-3 md:backdrop-blur md:flex-row md:items-center md:justify-between ${
              useFloatingSidebar ? "md:top-4" : "md:top-0"
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{ROLE_LABELS[workspace.role]}</p>
              <h2 className="text-2xl font-bold">{workspace.schoolName}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onSwitchWorkspace}>
                Switch view
              </Button>
              <Button variant="secondary" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="ghost" onClick={onSignOut}>
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

async function sendMessageToRecipient({
  schoolId,
  senderId,
  recipientId,
  subject,
  body,
}: {
  schoolId: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  body: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const effectiveSenderId = session?.user.id ?? senderId;

  const message = unwrap(
    await supabase
      .from("messages")
      .insert({
        school_id: schoolId,
        sender_id: effectiveSenderId,
        subject: subject?.trim() || null,
        body,
      })
      .select("id,school_id,sender_id,subject,body,created_at")
      .single(),
  ) as unknown as Message;
  unwrap(
    await supabase.from("message_recipients").insert({
      message_id: message.id,
      recipient_id: recipientId,
    }),
  );
  return message;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ConfigScreen() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-50 p-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Smart Class needs setup</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add the app connection details to `.env.local` using `.env.example` as a guide, then reload the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({
  loading,
  onNotify,
}: {
  loading: boolean;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      onNotify("error", error.message);
      return;
    }
    onNotify("success", "Signed in successfully.");
  };

  const signUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      onNotify("error", "Use a password with at least 6 characters.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    setBusy(false);
    if (error) {
      onNotify("error", error.message);
      return;
    }
    if (data.session) {
      onNotify("success", "Account created. If this is a fresh project, continue with bootstrap after sign-in.");
      return;
    }
    onNotify("info", "Account created. Check your email to confirm, then sign in.");
  };

  const sendMagicLink = async () => {
    if (!email.trim()) {
      onNotify("error", "Enter an email first.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setBusy(false);
    if (error) {
      onNotify("error", error.message);
      return;
    }
    onNotify("info", "Magic link sent. Check your inbox.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,191,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_30px_80px_rgba(28,27,58,0.08)] backdrop-blur">
          <Badge>Smart Class</Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Run your school in one connected place.</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Sign in to manage schools, people, classes, learning, and communication from one shared dashboard.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Access" value="Ready" sub="Password + magic link" />
            <StatCard label="Schools" value="Connected" sub="Live people, classes, and records" />
            <StatCard label="Actions" value="Built in" sub="Setup, invites, exports, and alerts" />
          </div>
          <div className="mt-8 rounded-2xl bg-muted/40 p-5">
            <p className="text-sm font-semibold text-foreground">First time opening Smart Class?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              1. Create an account here.
              <br />
              2. Sign in.
              <br />
              3. If no access appears yet, use the one-time setup button on the next screen.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_30px_80px_rgba(28,27,58,0.08)] backdrop-blur">
          <div className="inline-flex rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign up
            </button>
          </div>

          <h2 className="mt-6 text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Use your invited account. Magic link is helpful if you do not have a password yet."
              : "Create a new login. If this is the first account in a new project, you can bootstrap the first platform admin after signing in."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={mode === "signin" ? signIn : signUp}>
            {mode === "signup" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                </Field>
                <Field label="Last name">
                  <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
                </Field>
              </div>
            ) : null}
            <Field label="Email">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </Field>
            <Field label="Password">
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </Field>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={busy || loading} className="min-w-[170px] flex-1">
                {busy ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
              <Button type="button" variant="secondary" onClick={sendMagicLink} disabled={busy || loading}>
                Send magic link
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function NoWorkspaceScreen({
  error,
  profile,
  onBootstrap,
  onRefresh,
  onSignOut,
  busy,
}: {
  error: string | null;
  profile: BasicProfile;
  onBootstrap: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
  busy: boolean;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,191,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%)]" />
      <div className="relative mx-auto w-full max-w-3xl rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_30px_80px_rgba(28,27,58,0.08)] backdrop-blur">
        <Badge>No access yet</Badge>
        <h1 className="mt-5 text-3xl font-bold">This account is signed in, but it does not have access yet.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {error || "If this is the first account for a new setup, you can give it owner access once. Otherwise, ask an existing admin to invite this email."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-muted/40 p-5">
            <p className="text-sm font-semibold">Signed in as</p>
            <p className="mt-2 text-lg font-bold">{fullName(profile)}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-5">
            <p className="text-sm font-semibold">What to do next</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use first-time setup only once for a brand-new system. If schools are already set up, ask an existing admin to give this account access.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={onBootstrap} disabled={busy}>
            {busy ? "Setting up..." : "Run first-time setup"}
          </Button>
          <Button variant="secondary" onClick={onRefresh} disabled={busy}>
            Refresh access
          </Button>
          <Button variant="ghost" onClick={onSignOut} disabled={busy}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkspacePicker({
  workspaces,
  onPick,
  onSignOut,
  profile,
}: {
  workspaces: Workspace[];
  onPick: (workspace: Workspace) => void;
  onSignOut: () => void;
  profile: BasicProfile | null;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Choose dashboard</p>
            <h1 className="text-3xl font-bold">{fullName(profile)}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This account can open more than one school or role. Choose where you want to go.
            </p>
          </div>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <button
              key={workspace.key}
              onClick={() => onPick(workspace)}
              className="rounded-[1.5rem] border border-border bg-card p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <Badge>{ROLE_LABELS[workspace.role]}</Badge>
              <h2 className="mt-4 text-xl font-bold">{workspace.schoolName}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {workspace.school ? `${workspace.school.slug} / ${workspace.school.timezone}` : "All schools"}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                Open dashboard
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuperAdminPortal({
  view,
  data,
  onNotify,
  onRefresh,
  onOpenSchool,
}: {
  view: string;
  data: SuperAdminData;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
  onOpenSchool: (school: SchoolRecord) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [schoolForm, setSchoolForm] = useState({
    school_name: "",
    slug: "",
    timezone: "Africa/Cairo",
    plan_id: data.plans[0]?.id ?? "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
  });
  const [settingForm, setSettingForm] = useState({
    key: "",
    valueType: "text" as SettingValueType,
    valueInput: "",
    booleanValue: "false" as "true" | "false",
  });
  const [planForm, setPlanForm] = useState({
    id: "",
    name: "",
    max_students: "",
    max_teachers: "",
    price_cents: "0",
    billing_cycle: "monthly",
    featuresInput: "",
    is_active: true,
  });
  const [roleForm, setRoleForm] = useState({
    user_id: data.profiles[0]?.id ?? "",
    role: "school_admin" as UserRole,
    school_id: data.schools[0]?.id ?? "",
  });
  const [peopleQuery, setPeopleQuery] = useState("");
  const [accessQuery, setAccessQuery] = useState("");
  const [auditQuery, setAuditQuery] = useState("");
  const [subscriptionDrafts, setSubscriptionDrafts] = useState<Record<string, { plan_id: string; status: string; ends_at: string }>>({});

  const totalStudents = data.stats.reduce((sum, item) => sum + Number(item.student_count || 0), 0);
  const totalTeachers = data.stats.reduce((sum, item) => sum + Number(item.teacher_count || 0), 0);
  const totalParents = data.stats.reduce((sum, item) => sum + Number(item.parent_count || 0), 0);
  const activeSchools = data.stats.filter((item) => item.is_active).length;
  const activeProfiles = data.profiles.filter((item) => item.is_active).length;
  const schoolMap = byId(data.schools);
  const planMap = byId(data.plans);
  const profileMap = byId(data.profiles);
  const activeSuperAdminCount = data.roleRows.filter((row) => row.role === "super_admin" && row.is_active).length;

  useEffect(() => {
    setSubscriptionDrafts(
      Object.fromEntries(
        data.subscriptions.map((subscription) => [
          subscription.id,
          {
            plan_id: subscription.plan_id,
            status: subscription.status,
            ends_at: subscription.ends_at ? subscription.ends_at.slice(0, 10) : "",
          },
        ]),
      ),
    );
  }, [data.subscriptions]);

  useEffect(() => {
    setSchoolForm((prev) => ({
      ...prev,
      plan_id: prev.plan_id || data.plans[0]?.id || "",
    }));
    setRoleForm((prev) => ({
      ...prev,
      user_id: prev.user_id || data.profiles[0]?.id || "",
      school_id: prev.school_id || data.schools[0]?.id || "",
    }));
  }, [data.plans, data.profiles, data.schools]);

  const roleRowsByUser = data.roleRows.reduce<Record<string, RoleRow[]>>((acc, row) => {
    if (!acc[row.user_id]) {
      acc[row.user_id] = [];
    }
    acc[row.user_id].push(row);
    return acc;
  }, {});

  const latestSubscriptionsBySchool = data.subscriptions.reduce<Record<string, SchoolSubscription>>((acc, row) => {
    if (!acc[row.school_id]) {
      acc[row.school_id] = row;
    }
    return acc;
  }, {});

  const currentSubscriptions = Object.values(latestSubscriptionsBySchool).sort((a, b) => {
    const schoolA = schoolMap[a.school_id]?.name ?? "";
    const schoolB = schoolMap[b.school_id]?.name ?? "";
    return schoolA.localeCompare(schoolB);
  });

  const peopleRows = data.profiles
    .map((profile) => ({
      profile,
      roles: (roleRowsByUser[profile.id] ?? []).sort((a, b) => {
        const rank = roleRank(a.role) - roleRank(b.role);
        if (rank !== 0) return rank;
        const scopeA = a.school_id ? schoolMap[a.school_id]?.name ?? "" : "Platform";
        const scopeB = b.school_id ? schoolMap[b.school_id]?.name ?? "" : "Platform";
        return scopeA.localeCompare(scopeB);
      }),
    }))
    .filter(({ profile, roles }) => {
      const query = peopleQuery.trim().toLowerCase();
      if (!query) return true;
      const haystack = [
        fullName(profile),
        profile.email ?? "",
        roles.map((row) => ROLE_LABELS[row.role]).join(" "),
        roles.map((row) => (row.school_id ? schoolMap[row.school_id]?.name ?? "" : "platform")).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => fullName(a.profile).localeCompare(fullName(b.profile)));

  const filteredRoleRows = [...data.roleRows]
    .filter((row) => {
      const query = accessQuery.trim().toLowerCase();
      if (!query) return true;
      const profile = profileMap[row.user_id];
      const haystack = [
        fullName(profile),
        profile?.email ?? "",
        ROLE_LABELS[row.role],
        row.school_id ? schoolMap[row.school_id]?.name ?? "" : "platform",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      const rank = roleRank(a.role) - roleRank(b.role);
      if (rank !== 0) return rank;
      const schoolA = a.school_id ? schoolMap[a.school_id]?.name ?? "" : "Platform";
      const schoolB = b.school_id ? schoolMap[b.school_id]?.name ?? "" : "Platform";
      if (schoolA !== schoolB) return schoolA.localeCompare(schoolB);
      return fullName(profileMap[a.user_id]).localeCompare(fullName(profileMap[b.user_id]));
    });

  const filteredAuditLogs = data.auditLogs.filter((row) => {
    const query = auditQuery.trim().toLowerCase();
    if (!query) return true;
    const actor = row.actor_id ? profileMap[row.actor_id] : null;
    const schoolLabel = row.school_id ? schoolMap[row.school_id]?.name ?? "" : "platform";
    const haystack = [row.action, row.entity_type, fullName(actor), actor?.email ?? "", schoolLabel].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  const resetPlanForm = () => {
    setPlanForm({
      id: "",
      name: "",
      max_students: "",
      max_teachers: "",
      price_cents: "0",
      billing_cycle: "monthly",
      featuresInput: "",
      is_active: true,
    });
  };

  const resetSettingForm = () => {
    setSettingForm({
      key: "",
      valueType: "text",
      valueInput: "",
      booleanValue: "false",
    });
  };

  const loadSettingIntoForm = (setting: PlatformSetting) => {
    const next = settingValueToEditorState(setting.value);
    setSettingForm({
      key: setting.key,
      valueType: next.valueType,
      valueInput: next.valueInput,
      booleanValue: next.booleanValue,
    });
  };

  const submitSchool = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBusy(true);
      await invokeFunctionJson("provision-school", {
        ...schoolForm,
        slug: schoolForm.slug.trim() || undefined,
      });
      setSchoolForm({
        school_name: "",
        slug: "",
        timezone: "Africa/Cairo",
        plan_id: data.plans[0]?.id ?? "",
        admin_first_name: "",
        admin_last_name: "",
        admin_email: "",
      });
      onNotify("success", "School provisioned and admin invite sent.");
      await onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to provision school.";
      onNotify(
        "error",
        message.includes("already in use") || message.includes("schools_slug_key")
          ? "That slug is already used by another school. Leave slug blank for auto-generation or choose a different one."
          : message,
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleSchool = async (school: SchoolRecord) => {
    try {
      setBusy(true);
      unwrap(
        await supabase.from("schools").update({ is_active: !school.is_active }).eq("id", school.id),
      );
      onNotify("success", `${school.name} ${school.is_active ? "deactivated" : "activated"}.`);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to update school.");
    } finally {
      setBusy(false);
    }
  };

  const archiveSchool = async (school: SchoolRecord) => {
    try {
      setBusy(true);
      await invokeFunctionJson("soft-delete-entity", {
        table: "schools",
        id: school.id,
        hard: false,
      });
      onNotify("success", `${school.name} archived.`);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to archive school.");
    } finally {
      setBusy(false);
    }
  };

  const saveSetting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBusy(true);
      const key = settingForm.key.trim();
      if (!key) {
        throw new Error("Setting key is required.");
      }
      let parsed: unknown;
      if (settingForm.valueType === "boolean") {
        parsed = settingForm.booleanValue === "true";
      } else if (settingForm.valueType === "number") {
        const numericValue = Number(settingForm.valueInput);
        if (!Number.isFinite(numericValue)) {
          throw new Error("Enter a valid number for this setting.");
        }
        parsed = numericValue;
      } else if (settingForm.valueType === "list") {
        parsed = normalizeLineList(settingForm.valueInput);
      } else if (settingForm.valueType === "pairs") {
        parsed = parseSettingPairsInput(settingForm.valueInput);
      } else {
        parsed = settingForm.valueInput.trim();
      }
      unwrap(
        await supabase.from("platform_settings").upsert({
          key,
          value: parsed,
        }),
      );
      onNotify("success", "Platform setting saved.");
      resetSettingForm();
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to save setting.");
    } finally {
      setBusy(false);
    }
  };

  const savePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBusy(true);
      const priceCents = Number(planForm.price_cents);
      if (!Number.isFinite(priceCents)) {
        throw new Error("Plan price must be a valid number in cents.");
      }
      const maxStudents = planForm.max_students.trim() ? Number(planForm.max_students) : null;
      const maxTeachers = planForm.max_teachers.trim() ? Number(planForm.max_teachers) : null;
      if (maxStudents !== null && !Number.isFinite(maxStudents)) {
        throw new Error("Max students must be a valid number.");
      }
      if (maxTeachers !== null && !Number.isFinite(maxTeachers)) {
        throw new Error("Max teachers must be a valid number.");
      }

      const parsedFeatures = parsePlanFeaturesInput(planForm.featuresInput);

      const payload: Record<string, unknown> = {
        name: planForm.name,
        max_students: maxStudents,
        max_teachers: maxTeachers,
        price_cents: priceCents,
        billing_cycle: planForm.billing_cycle,
        features: parsedFeatures,
        is_active: planForm.is_active,
      };
      if (planForm.id) {
        payload.id = planForm.id;
      }

      unwrap(await supabase.from("subscription_plans").upsert(payload));
      onNotify("success", planForm.id ? "Subscription plan updated." : "Subscription plan created.");
      resetPlanForm();
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to save subscription plan.");
    } finally {
      setBusy(false);
    }
  };

  const editPlan = (plan: Plan) => {
    setPlanForm({
      id: plan.id,
      name: plan.name,
      max_students: plan.max_students == null ? "" : String(plan.max_students),
      max_teachers: plan.max_teachers == null ? "" : String(plan.max_teachers),
      price_cents: String(plan.price_cents),
      billing_cycle: plan.billing_cycle,
      featuresInput: planFeaturesToEditorValue(plan.features),
      is_active: plan.is_active,
    });
  };

  const togglePlan = async (plan: Plan) => {
    try {
      setBusy(true);
      unwrap(await supabase.from("subscription_plans").update({ is_active: !plan.is_active }).eq("id", plan.id));
      onNotify("success", `${plan.name} ${plan.is_active ? "deactivated" : "activated"}.`);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to update plan.");
    } finally {
      setBusy(false);
    }
  };

  const saveRoleAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBusy(true);
      if (!roleForm.user_id) {
        throw new Error("Select a user first.");
      }
      if (roleForm.role !== "super_admin" && !roleForm.school_id) {
        throw new Error("Select a school for school-scoped roles.");
      }
      unwrap(
        await supabase.from("user_school_roles").upsert(
          {
            user_id: roleForm.user_id,
            school_id: roleForm.role === "super_admin" ? null : roleForm.school_id,
            role: roleForm.role,
            is_active: true,
          },
          { onConflict: "user_id,school_id,role" },
        ),
      );
      onNotify("success", "Role assignment saved.");
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to save role assignment.");
    } finally {
      setBusy(false);
    }
  };

  const toggleRoleAssignment = async (row: RoleRow) => {
    try {
      if (row.role === "super_admin" && row.is_active && activeSuperAdminCount <= 1) {
        onNotify("error", "Keep at least one active super admin in the project.");
        return;
      }
      setBusy(true);
      unwrap(await supabase.from("user_school_roles").update({ is_active: !row.is_active }).eq("id", row.id));
      onNotify("success", `${ROLE_LABELS[row.role]} access ${row.is_active ? "disabled" : "enabled"}.`);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to update role assignment.");
    } finally {
      setBusy(false);
    }
  };

  const updateSubscriptionDraft = (
    subscriptionId: string,
    field: "plan_id" | "status" | "ends_at",
    value: string,
  ) => {
    setSubscriptionDrafts((prev) => ({
      ...prev,
      [subscriptionId]: {
        plan_id: prev[subscriptionId]?.plan_id ?? "",
        status: prev[subscriptionId]?.status ?? "trialing",
        ends_at: prev[subscriptionId]?.ends_at ?? "",
        [field]: value,
      },
    }));
  };

  const saveSubscription = async (subscription: SchoolSubscription) => {
    try {
      setBusy(true);
      const draft = subscriptionDrafts[subscription.id];
      if (!draft?.plan_id) {
        throw new Error("Select a plan for this subscription.");
      }
      unwrap(
        await supabase
          .from("school_subscriptions")
          .update({
            plan_id: draft.plan_id,
            status: draft.status,
            ends_at: draft.ends_at || null,
          })
          .eq("id", subscription.id),
      );
      onNotify("success", "School subscription updated.");
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Failed to update school subscription.");
    } finally {
      setBusy(false);
    }
  };

  if (view === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <StatCard label="Schools" value={data.counts.schools.toLocaleString()} sub={`${activeSchools} active`} />
          <StatCard label="Students" value={totalStudents.toLocaleString()} />
          <StatCard label="Teachers" value={totalTeachers.toLocaleString()} />
          <StatCard label="Profiles" value={data.counts.profiles.toLocaleString()} />
          <StatCard label="Role Rows" value={data.counts.role_assignments.toLocaleString()} />
          <StatCard label="Classes" value={data.counts.classes.toLocaleString()} />
          <StatCard label="Lessons" value={data.counts.lessons.toLocaleString()} />
          <StatCard label="Plans" value={data.plans.length.toLocaleString()} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="School Activity" description="See how each school is doing and jump into its dashboard in one click.">
            <div className="space-y-3">
              {data.stats.slice(0, 8).map((row) => (
                <div key={row.school_id} className="rounded-2xl bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold">{row.school_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.student_count} students / {row.teacher_count} teachers / {row.class_count} classes
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={row.is_active ? "success" : "warning"}>{row.subscription_status ?? "No plan"}</Badge>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const school = data.schools.find((item) => item.id === row.school_id);
                          if (school) {
                            onOpenSchool(school);
                          }
                        }}
                      >
                        Open school
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Recent Activity" description="A quick look at the latest actions across all schools.">
              <div className="space-y-3">
                {data.auditLogs.slice(0, 6).map((row) => (
                  <div key={row.id} className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{row.action}</p>
                      <Badge>{row.entity_type}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {row.actor_id ? fullName(profileMap[row.actor_id]) : "System"} / {formatDateTime(row.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Subscription Plans" description="Review the plans schools can use and what each one includes.">
              <div className="space-y-3">
                {data.plans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {currencyFromCents(plan.price_cents)} / {plan.billing_cycle}
                        </p>
                      </div>
                      <Badge tone={plan.is_active ? "success" : "warning"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  if (view === "people") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Profiles" value={data.counts.profiles.toLocaleString()} sub={`${activeProfiles} active`} />
          <StatCard label="Parents" value={totalParents.toLocaleString()} />
          <StatCard label="Super Admins" value={activeSuperAdminCount.toLocaleString()} />
          <StatCard label="No Role" value={data.profiles.filter((profile) => (roleRowsByUser[profile.id] ?? []).length === 0).length} />
        </div>

        <Panel title="Project Directory" description="See everyone in Smart Class and where they belong.">
          <div className="mb-4 max-w-md">
            <Field label="Search people">
              <Input
                value={peopleQuery}
                onChange={(event) => setPeopleQuery(event.target.value)}
                placeholder="Search by name, email, school, or role"
              />
            </Field>
          </div>
          <div className="space-y-3">
            {peopleRows.length === 0 ? (
              <EmptyState message="No matching profiles found." />
            ) : (
              peopleRows.map(({ profile, roles }) => (
                <div key={profile.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{fullName(profile)}</h3>
                        <Badge tone={profile.is_active ? "success" : "warning"}>
                          {profile.is_active ? "Profile active" : "Profile inactive"}
                        </Badge>
                        {roles.length === 0 ? <Badge tone="warning">No assigned role</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {profile.email ?? "No email on file"} / Joined {formatDate(profile.created_at)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Access changes happen in the Access tab. School operations open from the Schools tab.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {roles.map((row) => (
                      <Badge key={row.id} tone={row.is_active ? "default" : "warning"}>
                        {ROLE_LABELS[row.role]} / {row.school_id ? schoolMap[row.school_id]?.name ?? "Unknown school" : "Platform"}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "access") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Role Rows" value={data.counts.role_assignments.toLocaleString()} />
          <StatCard label="School Admins" value={data.roleRows.filter((row) => row.role === "school_admin" && row.is_active).length} />
          <StatCard label="Teachers" value={data.roleRows.filter((row) => row.role === "teacher" && row.is_active).length} />
          <StatCard label="Students" value={data.roleRows.filter((row) => row.role === "student" && row.is_active).length} />
        </div>

        <Panel title="Give or Restore Access" description="Choose a person, choose their role, and decide which school they can open.">
          <form className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_1fr_auto]" onSubmit={saveRoleAssignment}>
            <Field label="User">
              <Select
                value={roleForm.user_id}
                onChange={(event) => setRoleForm((prev) => ({ ...prev, user_id: event.target.value }))}
                required
              >
                {data.profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {fullName(profile)} / {profile.email ?? "No email"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Role">
              <Select
                value={roleForm.role}
                onChange={(event) => setRoleForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              >
                <option value="super_admin">Super Admin</option>
                <option value="school_admin">School Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </Select>
            </Field>
            <Field label="School">
              <Select
                value={roleForm.school_id}
                onChange={(event) => setRoleForm((prev) => ({ ...prev, school_id: event.target.value }))}
                disabled={roleForm.role === "super_admin"}
                required={roleForm.role !== "super_admin"}
              >
                {data.schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={busy}>
                Save access
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="Current Access" description="Review access across the platform and turn it on or off when needed.">
          <div className="mb-4 max-w-md">
            <Field label="Search role assignments">
              <Input
                value={accessQuery}
                onChange={(event) => setAccessQuery(event.target.value)}
                placeholder="Search by user, role, or school"
              />
            </Field>
          </div>
          <div className="space-y-3">
            {filteredRoleRows.length === 0 ? (
              <EmptyState message="No matching role assignments found." />
            ) : (
              filteredRoleRows.map((row) => {
                const profile = profileMap[row.user_id];
                const scopeLabel = row.school_id ? schoolMap[row.school_id]?.name ?? "Unknown school" : "Platform";
                return (
                  <div key={row.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{fullName(profile)}</p>
                          <Badge>{ROLE_LABELS[row.role]}</Badge>
                          <Badge tone={row.is_active ? "success" : "warning"}>
                            {row.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {profile?.email ?? "No email"} / {scopeLabel}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Granted {formatDate(row.created_at)}
                        </p>
                      </div>
                      <Button
                        variant={row.is_active ? "danger" : "secondary"}
                        onClick={() => void toggleRoleAssignment(row)}
                        disabled={busy}
                      >
                        {row.is_active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "billing") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Plans" value={data.plans.length.toLocaleString()} />
          <StatCard label="Subscriptions" value={currentSubscriptions.length.toLocaleString()} />
          <StatCard label="Active Plans" value={data.plans.filter((plan) => plan.is_active).length} />
          <StatCard label="Past Due" value={currentSubscriptions.filter((subscription) => subscription.status === "past_due").length} />
        </div>

        <Panel title="Create or Update Plan" description="Set the plan name, limits, price, and included features in simple fields.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={savePlan}>
            <Field label="Plan name">
              <Input
                value={planForm.name}
                onChange={(event) => setPlanForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Billing cycle">
              <Select
                value={planForm.billing_cycle}
                onChange={(event) => setPlanForm((prev) => ({ ...prev, billing_cycle: event.target.value }))}
              >
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </Select>
            </Field>
            <Field label="Price (cents)">
              <Input
                value={planForm.price_cents}
                onChange={(event) => setPlanForm((prev) => ({ ...prev, price_cents: event.target.value }))}
                required
              />
            </Field>
            <Field label="Active">
              <Select
                value={planForm.is_active ? "true" : "false"}
                onChange={(event) => setPlanForm((prev) => ({ ...prev, is_active: event.target.value === "true" }))}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </Field>
            <Field label="Max students">
              <Input
                value={planForm.max_students}
                onChange={(event) => setPlanForm((prev) => ({ ...prev, max_students: event.target.value }))}
                placeholder="optional"
              />
            </Field>
            <Field label="Max teachers">
              <Input
                value={planForm.max_teachers}
                onChange={(event) => setPlanForm((prev) => ({ ...prev, max_teachers: event.target.value }))}
                placeholder="optional"
              />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Plan features">
                <TextArea
                  rows={6}
                  value={planForm.featuresInput}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, featuresInput: event.target.value }))}
                  placeholder={"Lessons\nHomework\nMonthly tests\nReports: true"}
                />
              </Field>
              <p className="mt-1 text-xs text-muted-foreground">
                Add one feature per line. You can also write Feature: value when you need a simple note or limit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <Button type="submit" disabled={busy}>
                {planForm.id ? "Update plan" : "Create plan"}
              </Button>
              {planForm.id ? (
                <Button type="button" variant="ghost" onClick={resetPlanForm}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Panel>

        <Panel title="Subscription Plans" description="Review the plans schools can use and what each one includes.">
          <div className="space-y-3">
            {data.plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{plan.name}</p>
                      <Badge tone={plan.is_active ? "success" : "warning"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {currencyFromCents(plan.price_cents)} / {plan.billing_cycle}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Max students: {plan.max_students ?? "Unlimited"} / Max teachers: {plan.max_teachers ?? "Unlimited"}
                    </p>
                    {planFeaturesToList(plan.features).length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {planFeaturesToList(plan.features).map((feature) => (
                          <Badge key={`${plan.id}-${feature}`}>{feature}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => editPlan(plan)}>
                      Edit
                    </Button>
                    <Button variant={plan.is_active ? "danger" : "secondary"} onClick={() => void togglePlan(plan)} disabled={busy}>
                      {plan.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="School Subscriptions" description="Change a school's plan, status, or end date in one place.">
          <div className="space-y-4">
            {currentSubscriptions.length === 0 ? (
              <EmptyState message="No school subscriptions found yet." />
            ) : (
              currentSubscriptions.map((subscription) => {
                const draft = subscriptionDrafts[subscription.id] ?? {
                  plan_id: subscription.plan_id,
                  status: subscription.status,
                  ends_at: subscription.ends_at ? subscription.ends_at.slice(0, 10) : "",
                };
                return (
                  <div key={subscription.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_180px_auto]">
                      <div>
                        <p className="font-semibold">{schoolMap[subscription.school_id]?.name ?? "Unknown school"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Started {formatDate(subscription.starts_at)} / Current plan {planMap[subscription.plan_id]?.name ?? "Unknown"}
                        </p>
                      </div>
                      <Field label="Plan">
                        <Select
                          value={draft.plan_id}
                          onChange={(event) => updateSubscriptionDraft(subscription.id, "plan_id", event.target.value)}
                        >
                          {data.plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Status">
                        <Select
                          value={draft.status}
                          onChange={(event) => updateSubscriptionDraft(subscription.id, "status", event.target.value)}
                        >
                          <option value="trialing">trialing</option>
                          <option value="active">active</option>
                          <option value="past_due">past_due</option>
                          <option value="canceled">canceled</option>
                          <option value="suspended">suspended</option>
                        </Select>
                      </Field>
                      <Field label="Ends at">
                        <Input
                          type="date"
                          value={draft.ends_at}
                          onChange={(event) => updateSubscriptionDraft(subscription.id, "ends_at", event.target.value)}
                        />
                      </Field>
                      <div className="flex items-end">
                        <Button onClick={() => void saveSubscription(subscription)} disabled={busy}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "audit") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Audit Logs" value={data.auditLogs.length.toLocaleString()} />
          <StatCard label="Announcements" value={data.counts.announcements.toLocaleString()} />
          <StatCard label="Messages" value={data.counts.messages.toLocaleString()} />
          <StatCard label="Lessons" value={data.counts.lessons.toLocaleString()} />
        </div>

        <Panel title="Recent Activity History" description="Review the latest important changes across the platform.">
          <div className="mb-4 max-w-md">
            <Field label="Search activity">
              <Input
                value={auditQuery}
                onChange={(event) => setAuditQuery(event.target.value)}
                placeholder="Search by action, entity, actor, or school"
              />
            </Field>
          </div>
          <div className="space-y-3">
            {filteredAuditLogs.length === 0 ? (
              <EmptyState message="No matching activity found." />
            ) : (
              filteredAuditLogs.map((row) => {
                const actor = row.actor_id ? profileMap[row.actor_id] : null;
                const schoolLabel = row.school_id ? schoolMap[row.school_id]?.name ?? "Unknown school" : "Platform";
                return (
                  <div key={row.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{row.action}</p>
                          <Badge>{row.entity_type}</Badge>
                          <Badge tone="warning">{schoolLabel}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {actor ? `${fullName(actor)} / ${actor.email ?? "No email"}` : "System action"} / {formatDateTime(row.created_at)}
                        </p>
                      </div>
                    </div>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-background/80 p-3 text-xs text-muted-foreground">
                      {formatSettingValue(row.metadata)}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Profiles" value={data.counts.profiles.toLocaleString()} />
          <StatCard label="Classes" value={data.counts.classes.toLocaleString()} />
          <StatCard label="Subjects" value={data.counts.subjects.toLocaleString()} />
          <StatCard label="Messages" value={data.counts.messages.toLocaleString()} />
        </div>

        <Panel title="System Settings" description="Manage shared names, contact details, reminders, and other platform-wide preferences.">
          <form className="grid gap-4 lg:grid-cols-[220px_180px_1fr_auto]" onSubmit={saveSetting}>
            <Field label="Setting name">
              <Input
                value={settingForm.key}
                onChange={(event) => setSettingForm((prev) => ({ ...prev, key: event.target.value }))}
                required
              />
            </Field>
            <Field label="Type">
              <Select
                value={settingForm.valueType}
                onChange={(event) =>
                  setSettingForm((prev) => ({ ...prev, valueType: event.target.value as SettingValueType }))
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Yes / No</option>
                <option value="list">List</option>
                <option value="pairs">Named values</option>
              </Select>
            </Field>
            <Field
              label={
                settingForm.valueType === "list"
                  ? "Items"
                  : settingForm.valueType === "pairs"
                    ? "Values"
                    : "Value"
              }
            >
              {settingForm.valueType === "boolean" ? (
                <Select
                  value={settingForm.booleanValue}
                  onChange={(event) => setSettingForm((prev) => ({ ...prev, booleanValue: event.target.value as "true" | "false" }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              ) : (
                <TextArea
                  rows={4}
                  value={settingForm.valueInput}
                  onChange={(event) => setSettingForm((prev) => ({ ...prev, valueInput: event.target.value }))}
                  placeholder={
                    settingForm.valueType === "list"
                      ? "Item one\nItem two"
                      : settingForm.valueType === "pairs"
                        ? "Support email = help@school.com\nSchool day starts = 8:00 AM"
                        : settingForm.valueType === "number"
                          ? "25"
                          : "Smart Class"
                  }
                />
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {settingForm.valueType === "list"
                  ? "Write one item per line."
                  : settingForm.valueType === "pairs"
                    ? "Write one name and value per line, like Support email = help@school.com."
                    : settingForm.valueType === "boolean"
                      ? "Choose whether this setting is on or off."
                      : "Use a simple value only."}
              </p>
            </Field>
            <div className="flex items-end">
              <div className="flex gap-2">
                <Button type="submit" disabled={busy}>
                  Save
                </Button>
                <Button type="button" variant="ghost" onClick={resetSettingForm}>
                  Clear
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-6 space-y-3">
            {data.settings.length === 0 ? (
              <EmptyState message="No settings have been added yet." />
            ) : (
              data.settings.map((setting) => (
                <div key={setting.key} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{setting.key}</p>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                        {formatSettingValue(setting.value)}
                      </pre>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => loadSettingIntoForm(setting)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "schools") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Schools" value={data.counts.schools.toLocaleString()} sub={`${activeSchools} active`} />
          <StatCard label="Subscriptions" value={currentSubscriptions.length.toLocaleString()} />
          <StatCard label="Students" value={totalStudents.toLocaleString()} />
          <StatCard label="Teachers" value={totalTeachers.toLocaleString()} />
        </div>

        <Panel title="Add a School" description="Create a new school, choose its plan, and invite its first admin.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={submitSchool}>
            <Field label="School name">
              <Input
                value={schoolForm.school_name}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, school_name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Slug">
              <Input
                value={schoolForm.slug}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="auto-generated if blank"
              />
            </Field>
            <Field label="Timezone">
              <Input
                value={schoolForm.timezone}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, timezone: event.target.value }))}
                required
              />
            </Field>
            <Field label="Subscription plan">
              <Select
                value={schoolForm.plan_id}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, plan_id: event.target.value }))}
                required
              >
                {data.plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Admin first name">
              <Input
                value={schoolForm.admin_first_name}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, admin_first_name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Admin last name">
              <Input
                value={schoolForm.admin_last_name}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, admin_last_name: event.target.value }))}
              />
            </Field>
            <Field label="Admin email">
              <Input
                type="email"
                value={schoolForm.admin_email}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, admin_email: event.target.value }))}
                required
              />
            </Field>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>
                <Plus className="w-4 h-4" />
                {busy ? "Provisioning..." : "Provision school"}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="Schools" description="View each school's plan, size, and recent activity.">
          <div className="space-y-3">
            {data.stats.length === 0 ? (
              <EmptyState message="No schools found yet." />
            ) : (
              data.stats.map((school) => {
                const subscription = latestSubscriptionsBySchool[school.school_id];
                const planName = subscription ? planMap[subscription.plan_id]?.name ?? "Unknown plan" : "No plan";
                const schoolRow = data.schools.find((row) => row.id === school.school_id) ?? {
                  id: school.school_id,
                  name: school.school_name,
                  slug: "",
                  timezone: "UTC",
                  is_active: school.is_active,
                };

                return (
                  <div key={school.school_id} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{school.school_name}</h3>
                          <Badge tone={school.is_active ? "success" : "warning"}>
                            {school.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge>{school.subscription_status ?? "No subscription"}</Badge>
                          <Badge>{planName}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {school.student_count} students / {school.teacher_count} teachers / {school.class_count} classes
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last activity: {formatDateTime(school.last_activity_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => onOpenSchool(schoolRow)}>
                          Open school dashboard
                        </Button>
                        <Button variant="secondary" onClick={() => toggleSchool(schoolRow)}>
                          {school.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="danger" onClick={() => void archiveSchool(schoolRow)}>
                          Archive
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "schools") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Schools" value={data.counts.schools.toLocaleString()} sub={`${activeSchools} active`} />
          <StatCard label="Subscriptions" value={currentSubscriptions.length.toLocaleString()} />
          <StatCard label="Students" value={totalStudents.toLocaleString()} />
          <StatCard label="Teachers" value={totalTeachers.toLocaleString()} />
        </div>

        <Panel title="Add a School" description="Create a new school, choose its plan, and invite its first admin.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={submitSchool}>
            <Field label="School name">
              <Input
                value={schoolForm.school_name}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, school_name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Slug">
              <Input
                value={schoolForm.slug}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="auto-generated if blank"
              />
            </Field>
            <Field label="Timezone">
              <Input
                value={schoolForm.timezone}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, timezone: event.target.value }))}
                required
              />
            </Field>
            <Field label="Subscription plan">
              <Select
                value={schoolForm.plan_id}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, plan_id: event.target.value }))}
                required
              >
                {data.plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Admin first name">
              <Input
                value={schoolForm.admin_first_name}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, admin_first_name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Admin last name">
              <Input
                value={schoolForm.admin_last_name}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, admin_last_name: event.target.value }))}
              />
            </Field>
            <Field label="Admin email">
              <Input
                type="email"
                value={schoolForm.admin_email}
                onChange={(event) => setSchoolForm((prev) => ({ ...prev, admin_email: event.target.value }))}
                required
              />
            </Field>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>
                <Plus className="w-4 h-4" />
                {busy ? "Provisioning..." : "Provision school"}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="Schools" description="View each school's plan, size, and recent activity.">
          <div className="space-y-3">
            {data.stats.length === 0 ? (
              <EmptyState message="No schools found yet." />
            ) : (
              data.stats.map((school) => (
                <div key={school.school_id} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{school.school_name}</h3>
                        <Badge tone={school.is_active ? "success" : "warning"}>
                          {school.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge>{school.subscription_status ?? "No subscription"}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {school.student_count} students · {school.teacher_count} teachers · {school.class_count} classes
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last activity: {formatDateTime(school.last_activity_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => toggleSchool(data.schools.find((row) => row.id === school.school_id) ?? {
                        id: school.school_id,
                        name: school.school_name,
                        slug: "",
                        timezone: "UTC",
                        is_active: school.is_active,
                      })}>
                        {school.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          const row = data.schools.find((item) => item.id === school.school_id);
                          if (row) {
                            void archiveSchool(row);
                          }
                        }}
                      >
                        Archive
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="space-y-6">
        <Panel title="System Settings" description="Manage shared names, contact details, reminders, and other platform-wide preferences.">
          <form className="grid gap-4 lg:grid-cols-[220px_180px_1fr_auto]" onSubmit={saveSetting}>
            <Field label="Setting name">
              <Input
                value={settingForm.key}
                onChange={(event) => setSettingForm((prev) => ({ ...prev, key: event.target.value }))}
                required
              />
            </Field>
            <Field label="Type">
              <Select
                value={settingForm.valueType}
                onChange={(event) =>
                  setSettingForm((prev) => ({ ...prev, valueType: event.target.value as SettingValueType }))
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Yes / No</option>
                <option value="list">List</option>
                <option value="pairs">Named values</option>
              </Select>
            </Field>
            <Field
              label={
                settingForm.valueType === "list"
                  ? "Items"
                  : settingForm.valueType === "pairs"
                    ? "Values"
                    : "Value"
              }
            >
              {settingForm.valueType === "boolean" ? (
                <Select
                  value={settingForm.booleanValue}
                  onChange={(event) => setSettingForm((prev) => ({ ...prev, booleanValue: event.target.value as "true" | "false" }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              ) : (
                <TextArea
                  rows={4}
                  value={settingForm.valueInput}
                  onChange={(event) => setSettingForm((prev) => ({ ...prev, valueInput: event.target.value }))}
                  placeholder={
                    settingForm.valueType === "list"
                      ? "Item one\nItem two"
                      : settingForm.valueType === "pairs"
                        ? "Support email = help@school.com\nSchool day starts = 8:00 AM"
                        : settingForm.valueType === "number"
                          ? "25"
                          : "Smart Class"
                  }
                />
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {settingForm.valueType === "list"
                  ? "Write one item per line."
                  : settingForm.valueType === "pairs"
                    ? "Write one name and value per line, like Support email = help@school.com."
                    : settingForm.valueType === "boolean"
                      ? "Choose whether this setting is on or off."
                      : "Use a simple value only."}
              </p>
            </Field>
            <div className="flex items-end">
              <div className="flex gap-2">
                <Button type="submit" disabled={busy}>
                  Save
                </Button>
                <Button type="button" variant="ghost" onClick={resetSettingForm}>
                  Clear
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-6 space-y-3">
            {data.settings.length === 0 ? (
              <EmptyState message="No settings have been added yet." />
            ) : (
              data.settings.map((setting) => (
                <div key={setting.key} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{setting.key}</p>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                        {formatSettingValue(setting.value)}
                      </pre>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => loadSettingIntoForm(setting)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Schools" value={data.stats.length} sub={`${activeSchools} active`} />
        <StatCard label="Students" value={totalStudents.toLocaleString()} />
        <StatCard label="Teachers" value={totalTeachers.toLocaleString()} />
        <StatCard label="Plans" value={data.plans.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="School Activity" description="See which schools are busy and how many students and teachers they serve.">
          <div className="space-y-3">
            {data.stats.slice(0, 8).map((row) => (
              <div key={row.school_id} className="flex items-center justify-between rounded-2xl bg-muted/30 p-4">
                <div>
                  <p className="font-semibold">{row.school_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.student_count} students · {row.teacher_count} teachers
                  </p>
                </div>
                <Badge tone={row.is_active ? "success" : "warning"}>{row.subscription_status ?? "No plan"}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Subscription Plans" description="Review the plans schools can use and what each one includes.">
          <div className="space-y-3">
            {data.plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currencyFromCents(plan.price_cents)} / {plan.billing_cycle}
                    </p>
                  </div>
                  <Badge tone={plan.is_active ? "success" : "warning"}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SchoolAdminPortal({
  view,
  data,
  profile,
  onNotify,
  onRefresh,
}: {
  view: string;
  data: SchoolAdminData;
  profile: BasicProfile;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [daySelection, setDaySelection] = useState<number[]>(data.workingDays.map((item) => item.day_of_week));
  const [yearForm, setYearForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_current: true,
  });
  const [slotForm, setSlotForm] = useState({
    label: "",
    start_time: "",
    end_time: "",
    sort_order: String(data.timeSlots.length + 1),
  });
  const [gradeForm, setGradeForm] = useState({
    name: "",
    sort_order: String(data.gradeLevels.length + 1),
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
  });
  const [classForm, setClassForm] = useState({
    name: "",
    grade_level_id: data.gradeLevels[0]?.id ?? "",
    academic_year_id: data.academicYears.find((item) => item.is_current)?.id ?? data.academicYears[0]?.id ?? "",
  });
  const [teacherForm, setTeacherForm] = useState({
    full_name: "",
    email: "",
    subject_id: data.subjects[0]?.id ?? "",
    class_id: data.classes[0]?.id ?? "",
  });
  const [studentForm, setStudentForm] = useState({
    full_name: "",
    email: "",
    class_id: data.classes[0]?.id ?? "",
    parent_name: "",
    parent_email: "",
  });
  const [timetableForm, setTimetableForm] = useState({
    academic_year_id: data.academicYears.find((item) => item.is_current)?.id ?? data.academicYears[0]?.id ?? "",
    working_day_id: data.workingDays[0]?.id ?? "",
    time_slot_id: data.timeSlots[0]?.id ?? "",
    class_id: data.classes[0]?.id ?? "",
    subject_id: data.subjects[0]?.id ?? "",
    teacher_id: data.teachers[0]?.userId ?? "",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    body: "",
    target_type: "school",
    target_role: "student",
    target_id: data.classes[0]?.id ?? "",
  });
  const [messageForm, setMessageForm] = useState({
    recipient_id: data.recipientOptions[0]?.id ?? "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    setDaySelection(data.workingDays.map((item) => item.day_of_week));
  }, [data.workingDays]);

  const classMap = byId(data.classes);
  const subjectMap = byId(data.subjects);
  const currentYearId = data.academicYears.find((item) => item.is_current)?.id ?? data.academicYears[0]?.id;

  const runAction = async (work: () => Promise<void>, successMessage: string) => {
    try {
      setBusy(true);
      await work();
      onNotify("success", successMessage);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveWorkingDays = () =>
    runAction(async () => {
      unwrap(await supabase.from("working_days").delete().eq("school_id", data.school.id));
      if (daySelection.length > 0) {
        unwrap(
          await supabase.from("working_days").insert(
            daySelection.map((day) => ({
              school_id: data.school.id,
              day_of_week: day,
              label: dayLabel(day),
            })),
          ),
        );
      }
    }, "Working days saved.");

  const createAcademicYear = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      if (yearForm.is_current) {
        unwrap(
          await supabase.from("academic_years").update({ is_current: false }).eq("school_id", data.school.id),
        );
      }
      unwrap(
        await supabase.from("academic_years").insert({
          school_id: data.school.id,
          name: yearForm.name,
          start_date: yearForm.start_date,
          end_date: yearForm.end_date,
          is_current: yearForm.is_current,
        }),
      );
      setYearForm({ name: "", start_date: "", end_date: "", is_current: true });
    }, "Academic year created.");
  };

  const createTimeSlot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("time_slots").insert({
          school_id: data.school.id,
          label: slotForm.label,
          start_time: slotForm.start_time,
          end_time: slotForm.end_time,
          sort_order: Number(slotForm.sort_order),
        }),
      );
      setSlotForm({ label: "", start_time: "", end_time: "", sort_order: String(data.timeSlots.length + 2) });
    }, "Time slot created.");
  };

  const createGrade = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("grade_levels").insert({
          school_id: data.school.id,
          name: gradeForm.name,
          sort_order: Number(gradeForm.sort_order),
        }),
      );
      setGradeForm({ name: "", sort_order: String(data.gradeLevels.length + 2) });
    }, "Grade level created.");
  };

  const createSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("subjects").insert({
          school_id: data.school.id,
          name: subjectForm.name,
          code: subjectForm.code || null,
        }),
      );
      setSubjectForm({ name: "", code: "" });
    }, "Subject created.");
  };

  const createClass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("classes").insert({
          school_id: data.school.id,
          name: classForm.name,
          grade_level_id: classForm.grade_level_id,
          academic_year_id: classForm.academic_year_id,
        }),
      );
      setClassForm((prev) => ({ ...prev, name: "" }));
    }, "Class created.");
  };

  const inviteTeacher = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      const { first_name, last_name } = parseName(teacherForm.full_name);
      const response = await invokeFunctionJson<{ user_id: string }>("invite-user", {
        school_id: data.school.id,
        email: teacherForm.email,
        role: "teacher",
        first_name,
        last_name,
      });
      if (teacherForm.subject_id) {
        unwrap(
          await supabase.from("teacher_subject_assignments").insert({
            school_id: data.school.id,
            teacher_id: response.user_id,
            subject_id: teacherForm.subject_id,
            class_id: teacherForm.class_id || null,
          }),
        );
      }
      setTeacherForm({
        full_name: "",
        email: "",
        subject_id: data.subjects[0]?.id ?? "",
        class_id: data.classes[0]?.id ?? "",
      });
    }, "Teacher invited and assignment saved.");
  };

  const inviteStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      const parsedStudent = parseName(studentForm.full_name);
      const studentResponse = await invokeFunctionJson<{ user_id: string }>("invite-user", {
        school_id: data.school.id,
        email: studentForm.email,
        role: "student",
        first_name: parsedStudent.first_name,
        last_name: parsedStudent.last_name,
      });
      unwrap(
        await supabase.from("class_enrollments").insert({
          school_id: data.school.id,
          class_id: studentForm.class_id,
          student_id: studentResponse.user_id,
        }),
      );
      if (studentForm.parent_email.trim()) {
        const parsedParent = parseName(studentForm.parent_name || studentForm.parent_email);
        const parentResponse = await invokeFunctionJson<{ user_id: string }>("invite-user", {
          school_id: data.school.id,
          email: studentForm.parent_email,
          role: "parent",
          first_name: parsedParent.first_name,
          last_name: parsedParent.last_name,
        });
        unwrap(
          await supabase.from("parent_student_links").insert({
            school_id: data.school.id,
            parent_id: parentResponse.user_id,
            student_id: studentResponse.user_id,
            relationship: "parent",
          }),
        );
      }
      setStudentForm({
        full_name: "",
        email: "",
        class_id: data.classes[0]?.id ?? "",
        parent_name: "",
        parent_email: "",
      });
    }, "Student invited and enrollment saved.");
  };

  const createTimetable = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("timetable_entries").insert({
          school_id: data.school.id,
          academic_year_id: timetableForm.academic_year_id,
          working_day_id: timetableForm.working_day_id,
          time_slot_id: timetableForm.time_slot_id,
          class_id: timetableForm.class_id,
          subject_id: timetableForm.subject_id,
          teacher_id: timetableForm.teacher_id,
        }),
      );
    }, "Timetable entry saved.");
  };

  const publishAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      const announcement = unwrap(
        await supabase
          .from("announcements")
          .insert({
            school_id: data.school.id,
            author_id: profile.id,
            title: announcementForm.title,
            body: announcementForm.body,
            is_published: true,
            published_at: new Date().toISOString(),
          })
          .select("id,school_id,author_id,title,body,is_published,published_at,created_at")
          .single(),
      ) as unknown as Announcement;

      const target =
        announcementForm.target_type === "role"
          ? {
              announcement_id: announcement.id,
              target_type: "role",
              target_role: announcementForm.target_role,
            }
          : announcementForm.target_type === "class"
            ? {
                announcement_id: announcement.id,
                target_type: "class",
                target_id: announcementForm.target_id,
              }
            : {
                announcement_id: announcement.id,
                target_type: "school",
              };

      unwrap(await supabase.from("announcement_targets").insert(target));
      await invokeFunctionJson("send-announcement", { announcement_id: announcement.id });
      setAnnouncementForm({
        title: "",
        body: "",
        target_type: "school",
        target_role: "student",
        target_id: data.classes[0]?.id ?? "",
      });
    }, "Announcement published and notifications queued.");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      await sendMessageToRecipient({
        schoolId: data.school.id,
        senderId: profile.id,
        recipientId: messageForm.recipient_id,
        subject: messageForm.subject,
        body: messageForm.body,
      });
      setMessageForm({
        recipient_id: data.recipientOptions[0]?.id ?? "",
        subject: "",
        body: "",
      });
    }, "Message sent.");
  };

  if (view === "academic") {
    return (
      <div className="space-y-6">
        <Panel title="Working Days" description="Choose which days the school is open for classes.">
          <div className="grid gap-3 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                onClick={() =>
                  setDaySelection((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]))
                }
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  daySelection.includes(day)
                    ? "border-primary bg-secondary text-primary"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                {dayLabel(day)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={saveWorkingDays} disabled={busy}>
              Save working days
            </Button>
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Academic Years">
            <form className="grid gap-4" onSubmit={createAcademicYear}>
              <Field label="Name">
                <Input value={yearForm.name} onChange={(event) => setYearForm((prev) => ({ ...prev, name: event.target.value }))} required />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Start date">
                  <Input type="date" value={yearForm.start_date} onChange={(event) => setYearForm((prev) => ({ ...prev, start_date: event.target.value }))} required />
                </Field>
                <Field label="End date">
                  <Input type="date" value={yearForm.end_date} onChange={(event) => setYearForm((prev) => ({ ...prev, end_date: event.target.value }))} required />
                </Field>
              </div>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={yearForm.is_current} onChange={(event) => setYearForm((prev) => ({ ...prev, is_current: event.target.checked }))} />
                Set as current year
              </label>
              <Button type="submit" disabled={busy}>Create academic year</Button>
            </form>
            <div className="mt-4 space-y-2">
              {data.academicYears.map((year) => (
                <div key={year.id} className="rounded-xl bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{year.name}</p>
                    {year.is_current ? <Badge tone="success">Current</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(year.start_date)} to {formatDate(year.end_date)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Time Slots">
            <form className="grid gap-4" onSubmit={createTimeSlot}>
              <Field label="Label">
                <Input value={slotForm.label} onChange={(event) => setSlotForm((prev) => ({ ...prev, label: event.target.value }))} required />
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Start">
                  <Input type="time" value={slotForm.start_time} onChange={(event) => setSlotForm((prev) => ({ ...prev, start_time: event.target.value }))} required />
                </Field>
                <Field label="End">
                  <Input type="time" value={slotForm.end_time} onChange={(event) => setSlotForm((prev) => ({ ...prev, end_time: event.target.value }))} required />
                </Field>
                <Field label="Order">
                  <Input type="number" value={slotForm.sort_order} onChange={(event) => setSlotForm((prev) => ({ ...prev, sort_order: event.target.value }))} required />
                </Field>
              </div>
              <Button type="submit" disabled={busy}>Add time slot</Button>
            </form>
            <div className="mt-4 space-y-2">
              {data.timeSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between rounded-xl bg-muted/30 p-3">
                  <div>
                    <p className="font-semibold">{slot.label}</p>
                    <p className="text-xs text-muted-foreground">{slot.start_time} to {slot.end_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Grade Levels">
            <form className="grid gap-4" onSubmit={createGrade}>
              <Field label="Grade name">
                <Input value={gradeForm.name} onChange={(event) => setGradeForm((prev) => ({ ...prev, name: event.target.value }))} required />
              </Field>
              <Field label="Sort order">
                <Input type="number" value={gradeForm.sort_order} onChange={(event) => setGradeForm((prev) => ({ ...prev, sort_order: event.target.value }))} />
              </Field>
              <Button type="submit" disabled={busy}>Add grade</Button>
            </form>
            <div className="mt-4 space-y-2">
              {data.gradeLevels.map((grade) => (
                <div key={grade.id} className="rounded-xl bg-muted/30 p-3 font-semibold">
                  {grade.name}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Subjects">
            <form className="grid gap-4" onSubmit={createSubject}>
              <Field label="Subject name">
                <Input value={subjectForm.name} onChange={(event) => setSubjectForm((prev) => ({ ...prev, name: event.target.value }))} required />
              </Field>
              <Field label="Code">
                <Input value={subjectForm.code} onChange={(event) => setSubjectForm((prev) => ({ ...prev, code: event.target.value }))} />
              </Field>
              <Button type="submit" disabled={busy}>Add subject</Button>
            </form>
            <div className="mt-4 space-y-2">
              {data.subjects.map((subject) => (
                <div key={subject.id} className="rounded-xl bg-muted/30 p-3">
                  <p className="font-semibold">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.code || "No code"}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Classes">
          <form className="grid gap-4 lg:grid-cols-4" onSubmit={createClass}>
            <Field label="Class name">
              <Input value={classForm.name} onChange={(event) => setClassForm((prev) => ({ ...prev, name: event.target.value }))} required />
            </Field>
            <Field label="Grade level">
              <Select value={classForm.grade_level_id} onChange={(event) => setClassForm((prev) => ({ ...prev, grade_level_id: event.target.value }))}>
                {data.gradeLevels.map((grade) => (
                  <option key={grade.id} value={grade.id}>{grade.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Academic year">
              <Select value={classForm.academic_year_id} onChange={(event) => setClassForm((prev) => ({ ...prev, academic_year_id: event.target.value }))}>
                {data.academicYears.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={busy}>Create class</Button>
            </div>
          </form>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.classes.map((item) => (
              <div key={item.id} className="rounded-xl bg-muted/30 p-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.gradeLevels.find((grade) => grade.id === item.grade_level_id)?.name ?? "Unknown grade"} ·{" "}
                  {data.academicYears.find((year) => year.id === item.academic_year_id)?.name ?? "Unknown year"}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "teachers") {
    return (
      <div className="space-y-6">
        <Panel title="Invite Teacher" description="Invite a teacher and link them to a subject and class.">
          <form className="grid gap-4 lg:grid-cols-4" onSubmit={inviteTeacher}>
            <Field label="Full name">
              <Input value={teacherForm.full_name} onChange={(event) => setTeacherForm((prev) => ({ ...prev, full_name: event.target.value }))} required />
            </Field>
            <Field label="Email">
              <Input type="email" value={teacherForm.email} onChange={(event) => setTeacherForm((prev) => ({ ...prev, email: event.target.value }))} required />
            </Field>
            <Field label="Subject">
              <Select value={teacherForm.subject_id} onChange={(event) => setTeacherForm((prev) => ({ ...prev, subject_id: event.target.value }))}>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Class">
              <Select value={teacherForm.class_id} onChange={(event) => setTeacherForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                {data.classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <div className="lg:col-span-4">
              <Button type="submit" disabled={busy}><UserPlus className="w-4 h-4" />Invite teacher</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Teachers">
          <div className="space-y-3">
            {data.teachers.map((teacher) => (
              <div key={teacher.userId} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">{teacher.name}</p>
                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teacher.assignments.length === 0 ? <Badge>No assignments</Badge> : teacher.assignments.map((assignment) => <Badge key={assignment}>{assignment}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "students") {
    return (
      <div className="space-y-6">
        <Panel title="Invite Student" description="Invite a student, place them in a class, and optionally connect a parent.">
          <form className="grid gap-4 lg:grid-cols-4" onSubmit={inviteStudent}>
            <Field label="Student name">
              <Input value={studentForm.full_name} onChange={(event) => setStudentForm((prev) => ({ ...prev, full_name: event.target.value }))} required />
            </Field>
            <Field label="Student email">
              <Input type="email" value={studentForm.email} onChange={(event) => setStudentForm((prev) => ({ ...prev, email: event.target.value }))} required />
            </Field>
            <Field label="Class">
              <Select value={studentForm.class_id} onChange={(event) => setStudentForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                {data.classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Parent name">
              <Input value={studentForm.parent_name} onChange={(event) => setStudentForm((prev) => ({ ...prev, parent_name: event.target.value }))} />
            </Field>
            <Field label="Parent email">
              <Input type="email" value={studentForm.parent_email} onChange={(event) => setStudentForm((prev) => ({ ...prev, parent_email: event.target.value }))} />
            </Field>
            <div className="lg:col-span-4">
              <Button type="submit" disabled={busy}><UserPlus className="w-4 h-4" />Invite student</Button>
            </div>
          </form>
        </Panel>

        <Panel
          title="Students"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => void downloadExport("students", data.school.id)}>
                <Download className="w-4 h-4" />
                Export students
              </Button>
              <Button variant="secondary" onClick={() => void downloadExport("final_grades", data.school.id, currentYearId)}>
                <Download className="w-4 h-4" />
                Export grades
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {data.students.map((student) => (
              <div key={student.userId} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{student.className}</Badge>
                    <Badge tone={student.status === "active" ? "success" : "warning"}>{student.status}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Parents: {student.parents.length > 0 ? student.parents.join(", ") : "Not linked yet"}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "timetable") {
    return (
      <div className="space-y-6">
        <Panel title="Add Timetable Entry" description="Build the weekly class schedule for your school.">
          <form className="grid gap-4 lg:grid-cols-3" onSubmit={createTimetable}>
            <Field label="Academic year">
              <Select value={timetableForm.academic_year_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, academic_year_id: event.target.value }))}>
                {data.academicYears.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Working day">
              <Select value={timetableForm.working_day_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, working_day_id: event.target.value }))}>
                {data.workingDays.map((day) => (
                  <option key={day.id} value={day.id}>{day.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Time slot">
              <Select value={timetableForm.time_slot_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, time_slot_id: event.target.value }))}>
                {data.timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>{slot.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Class">
              <Select value={timetableForm.class_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                {data.classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={timetableForm.subject_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, subject_id: event.target.value }))}>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Teacher">
              <Select value={timetableForm.teacher_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, teacher_id: event.target.value }))}>
                {data.teachers.map((teacher) => (
                  <option key={teacher.userId} value={teacher.userId}>{teacher.name}</option>
                ))}
              </Select>
            </Field>
            <div className="lg:col-span-3">
              <Button type="submit" disabled={busy}>Save timetable entry</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Current Timetable">
          <div className="space-y-3">
            {data.timetable.length === 0 ? (
              <EmptyState message="No timetable entries yet." />
            ) : (
              data.timetable.map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-muted/30 p-4">
                  <p className="font-semibold">
                    {classMap[entry.class_id]?.name ?? "Unknown class"} · {subjectMap[entry.subject_id]?.name ?? "Unknown subject"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.workingDays.find((day) => day.id === entry.working_day_id)?.label ?? "Day"} ·{" "}
                    {data.timeSlots.find((slot) => slot.id === entry.time_slot_id)?.label ?? "Slot"} ·{" "}
                    {data.teachers.find((teacher) => teacher.userId === entry.teacher_id)?.name ?? "Teacher"}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "announcements") {
    return (
      <div className="space-y-6">
        <Panel title="Publish Announcement" description="Share an update with the whole school, a role, or a class.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={publishAnnouncement}>
            <Field label="Title">
              <Input value={announcementForm.title} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </Field>
            <Field label="Audience type">
              <Select value={announcementForm.target_type} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, target_type: event.target.value }))}>
                <option value="school">Whole school</option>
                <option value="role">Role</option>
                <option value="class">Class</option>
              </Select>
            </Field>
            {announcementForm.target_type === "role" ? (
              <Field label="Role">
                <Select value={announcementForm.target_role} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, target_role: event.target.value }))}>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                  <option value="school_admin">School admins</option>
                </Select>
              </Field>
            ) : null}
            {announcementForm.target_type === "class" ? (
              <Field label="Class">
                <Select value={announcementForm.target_id} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, target_id: event.target.value }))}>
                  {data.classes.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <div className="lg:col-span-2">
              <Field label="Body">
                <TextArea rows={5} value={announcementForm.body} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, body: event.target.value }))} required />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}><Megaphone className="w-4 h-4" />Publish announcement</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Published Announcements">
          <div className="space-y-3">
            {data.announcements.map((announcement) => (
              <div key={announcement.item.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{announcement.item.title}</p>
                  <Badge>{announcement.audience}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">{announcement.item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {announcement.authorName} · {formatDateTime(announcement.item.published_at || announcement.item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "messages") {
    return (
      <div className="space-y-6">
        <Panel title="Compose Message" description="Send a private message to one person.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={sendMessage}>
            <Field label="Recipient">
              <Select value={messageForm.recipient_id} onChange={(event) => setMessageForm((prev) => ({ ...prev, recipient_id: event.target.value }))}>
                {data.recipientOptions.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>{recipient.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Input value={messageForm.subject} onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Message">
                <TextArea rows={5} value={messageForm.body} onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))} required />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}><Send className="w-4 h-4" />Send message</Button>
            </div>
          </form>
        </Panel>

        <Panel title="Inbox and Sent Items">
          <div className="space-y-3">
            {data.messages.length === 0 ? (
              <EmptyState message="No visible messages yet." />
            ) : (
              data.messages.map((message) => (
                <div key={message.item.id} className="rounded-2xl bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{message.item.subject || "No subject"}</p>
                    <Badge>{message.senderName}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{message.item.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    To: {message.recipients.map((recipient) => recipient.label).join(", ") || "No recipients"} ·{" "}
                    {formatDateTime(message.item.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Teachers" value={data.teachers.length} />
        <StatCard label="Students" value={data.students.length} />
        <StatCard label="Classes" value={data.classes.length} />
        <StatCard label="Plan" value={data.subscription?.status ?? "No plan"} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="School Snapshot">
          <div className="space-y-3 text-sm">
            <p><span className="font-semibold">School:</span> {data.school.name}</p>
            <p><span className="font-semibold">Timezone:</span> {data.school.timezone}</p>
            <p><span className="font-semibold">Current year:</span> {data.academicYears.find((item) => item.is_current)?.name ?? "Not set"}</p>
            <p><span className="font-semibold">Subscription:</span> {data.subscription?.status ?? "Unknown"}</p>
            <p><span className="font-semibold">Recent activity:</span> {formatDateTime(data.usageStat?.last_activity_at)}</p>
          </div>
        </Panel>
        <Panel
          title="Recent Announcements"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => void downloadExport("students", data.school.id)}>
                <Download className="w-4 h-4" />
                Students CSV
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {data.announcements.slice(0, 4).map((announcement) => (
              <div key={announcement.item.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{announcement.item.title}</p>
                  <Badge>{announcement.audience}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {announcement.authorName} · {formatDateTime(announcement.item.published_at || announcement.item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="School Settings">
        <p className="text-sm text-muted-foreground">
          School-wide settings are view only right now. If you want school admins to edit them directly, we can unlock
          that in the next update.
        </p>
      </Panel>
    </div>
  );
}

function TeacherPortal({
  view,
  data,
  profile,
  onNotify,
  onRefresh,
}: {
  view: string;
  data: TeacherData;
  profile: BasicProfile;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    class_id: data.assignments.find((item) => item.class_id)?.class_id ?? data.classes[0]?.id ?? "",
    subject_id: data.assignments[0]?.subject_id ?? data.subjects[0]?.id ?? "",
    lesson_date: "",
    description: "",
    video_url: "",
  });
  const [homeworkForm, setHomeworkForm] = useState({
    title: "",
    lesson_id: data.lessons[0]?.id ?? "",
    due_date: "",
  });
  const [homeworkQuestionForm, setHomeworkQuestionForm] = useState({
    homework_id: data.homework[0]?.item.id ?? "",
    question_text: "",
    opt_a: "",
    opt_b: "",
    opt_c: "",
    opt_d: "",
    correct: "a",
  });
  const [testForm, setTestForm] = useState({
    title: "",
    class_id: data.assignments.find((item) => item.class_id)?.class_id ?? data.classes[0]?.id ?? "",
    subject_id: data.assignments[0]?.subject_id ?? data.subjects[0]?.id ?? "",
    test_date: "",
    duration_minutes: "60",
    kind: "monthly",
  });
  const [testQuestionForm, setTestQuestionForm] = useState({
    test_id: data.tests[0]?.item.id ?? "",
    question_text: "",
    opt_a: "",
    opt_b: "",
    opt_c: "",
    opt_d: "",
    correct: "a",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    class_id: data.assignments.find((item) => item.class_id)?.class_id ?? data.classes[0]?.id ?? "",
    title: "",
    body: "",
  });
  const [messageForm, setMessageForm] = useState({
    recipient_id: data.recipientOptions[0]?.id ?? "",
    subject: "",
    body: "",
  });

  const classMap = byId(data.classes);
  const subjectMap = byId(data.subjects);

  const runAction = async (work: () => Promise<void>, successMessage: string) => {
    try {
      setBusy(true);
      await work();
      onNotify("success", successMessage);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const createLesson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("lessons").insert({
          school_id: data.school.id,
          class_id: lessonForm.class_id,
          subject_id: lessonForm.subject_id,
          teacher_id: profile.id,
          title: lessonForm.title,
          description: lessonForm.description || null,
          video_url: lessonForm.video_url || null,
          lesson_date: lessonForm.lesson_date,
        }),
      );
      setLessonForm((prev) => ({
        ...prev,
        title: "",
        lesson_date: "",
        description: "",
        video_url: "",
      }));
    }, "Lesson created.");
  };

  const createHomework = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("homework").insert({
          school_id: data.school.id,
          lesson_id: homeworkForm.lesson_id,
          title: homeworkForm.title,
          due_date: homeworkForm.due_date,
        }),
      );
      setHomeworkForm({ title: "", lesson_id: data.lessons[0]?.id ?? "", due_date: "" });
    }, "Homework created.");
  };

  const addHomeworkQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      const question = unwrap(
        await supabase
          .from("homework_questions")
          .insert({
            homework_id: homeworkQuestionForm.homework_id,
            question_text: homeworkQuestionForm.question_text,
            sort_order:
              (data.homework.find((item) => item.item.id === homeworkQuestionForm.homework_id)?.questions.length ?? 0) + 1,
          })
          .select("id,homework_id,question_text,sort_order")
          .single(),
      ) as unknown as HomeworkQuestion;

      const options = [
        { key: "a", value: homeworkQuestionForm.opt_a },
        { key: "b", value: homeworkQuestionForm.opt_b },
        { key: "c", value: homeworkQuestionForm.opt_c },
        { key: "d", value: homeworkQuestionForm.opt_d },
      ];
      unwrap(
        await supabase.from("homework_choices").insert(
          options.map((option, index) => ({
            question_id: question.id,
            choice_text: option.value,
            is_correct: option.key === homeworkQuestionForm.correct,
            sort_order: index + 1,
          })),
        ),
      );
      setHomeworkQuestionForm({
        homework_id: homeworkQuestionForm.homework_id,
        question_text: "",
        opt_a: "",
        opt_b: "",
        opt_c: "",
        opt_d: "",
        correct: "a",
      });
    }, "Homework question saved.");
  };

  const createTest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      unwrap(
        await supabase.from("monthly_tests").insert({
          school_id: data.school.id,
          class_id: testForm.class_id,
          subject_id: testForm.subject_id,
          teacher_id: profile.id,
          title: testForm.title,
          test_date: testForm.test_date,
          duration_minutes: Number(testForm.duration_minutes),
          kind: testForm.kind,
        }),
      );
      setTestForm((prev) => ({
        ...prev,
        title: "",
        test_date: "",
        duration_minutes: "60",
      }));
    }, "Test created.");
  };

  const addTestQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      const question = unwrap(
        await supabase
          .from("test_questions")
          .insert({
            test_id: testQuestionForm.test_id,
            question_text: testQuestionForm.question_text,
            sort_order:
              (data.tests.find((item) => item.item.id === testQuestionForm.test_id)?.questions.length ?? 0) + 1,
          })
          .select("id,test_id,question_text,sort_order")
          .single(),
      ) as unknown as TestQuestion;

      const options = [
        { key: "a", value: testQuestionForm.opt_a },
        { key: "b", value: testQuestionForm.opt_b },
        { key: "c", value: testQuestionForm.opt_c },
        { key: "d", value: testQuestionForm.opt_d },
      ];
      unwrap(
        await supabase.from("test_choices").insert(
          options.map((option, index) => ({
            question_id: question.id,
            choice_text: option.value,
            is_correct: option.key === testQuestionForm.correct,
            sort_order: index + 1,
          })),
        ),
      );
      setTestQuestionForm({
        test_id: testQuestionForm.test_id,
        question_text: "",
        opt_a: "",
        opt_b: "",
        opt_c: "",
        opt_d: "",
        correct: "a",
      });
    }, "Test question saved.");
  };

  const publishAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      const announcement = unwrap(
        await supabase
          .from("announcements")
          .insert({
            school_id: data.school.id,
            author_id: profile.id,
            title: announcementForm.title,
            body: announcementForm.body,
            is_published: true,
            published_at: new Date().toISOString(),
          })
          .select("id,school_id,author_id,title,body,is_published,published_at,created_at")
          .single(),
      ) as unknown as Announcement;
      unwrap(
        await supabase.from("announcement_targets").insert({
          announcement_id: announcement.id,
          target_type: "class",
          target_id: announcementForm.class_id,
        }),
      );
      await invokeFunctionJson("send-announcement", { announcement_id: announcement.id });
      setAnnouncementForm({
        class_id: data.assignments.find((item) => item.class_id)?.class_id ?? data.classes[0]?.id ?? "",
        title: "",
        body: "",
      });
    }, "Class announcement published.");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      await sendMessageToRecipient({
        schoolId: data.school.id,
        senderId: profile.id,
        recipientId: messageForm.recipient_id,
        subject: messageForm.subject,
        body: messageForm.body,
      });
      setMessageForm({
        recipient_id: data.recipientOptions[0]?.id ?? "",
        subject: "",
        body: "",
      });
    }, "Message sent.");
  };

  if (view === "lessons") {
    return (
      <div className="space-y-6">
        <Panel title="Create Lesson" description="Add a new lesson for one of your classes.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={createLesson}>
            <Field label="Lesson title">
              <Input value={lessonForm.title} onChange={(event) => setLessonForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </Field>
            <Field label="Lesson date">
              <Input type="date" value={lessonForm.lesson_date} onChange={(event) => setLessonForm((prev) => ({ ...prev, lesson_date: event.target.value }))} required />
            </Field>
            <Field label="Class">
              <Select value={lessonForm.class_id} onChange={(event) => setLessonForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                {data.classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={lessonForm.subject_id} onChange={(event) => setLessonForm((prev) => ({ ...prev, subject_id: event.target.value }))}>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </Field>
            <div className="lg:col-span-2">
              <Field label="Description">
                <TextArea rows={4} value={lessonForm.description} onChange={(event) => setLessonForm((prev) => ({ ...prev, description: event.target.value }))} />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Field label="Video URL">
                <Input value={lessonForm.video_url} onChange={(event) => setLessonForm((prev) => ({ ...prev, video_url: event.target.value }))} />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>Create lesson</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Lessons">
          <div className="space-y-3">
            {data.lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{lesson.title}</p>
                  <Badge>{classMap[lesson.class_id]?.name ?? "Class"}</Badge>
                  <Badge>{subjectMap[lesson.subject_id]?.name ?? "Subject"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{lesson.description || "No description"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(lesson.lesson_date)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "homework") {
    return (
      <div className="space-y-6">
        <Panel title="Create Homework" description="Pick a lesson and set homework for students.">
          <form className="grid gap-4 lg:grid-cols-3" onSubmit={createHomework}>
            <Field label="Homework title">
              <Input value={homeworkForm.title} onChange={(event) => setHomeworkForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </Field>
            <Field label="Lesson">
              <Select value={homeworkForm.lesson_id} onChange={(event) => setHomeworkForm((prev) => ({ ...prev, lesson_id: event.target.value }))}>
                {data.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="datetime-local" value={homeworkForm.due_date} onChange={(event) => setHomeworkForm((prev) => ({ ...prev, due_date: event.target.value }))} required />
            </Field>
            <div className="lg:col-span-3">
              <Button type="submit" disabled={busy}>Create homework</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Add Multiple Choice Question" description="Add answer choices and mark the correct one.">
          <form className="grid gap-4" onSubmit={addHomeworkQuestion}>
            <Field label="Homework">
              <Select value={homeworkQuestionForm.homework_id} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, homework_id: event.target.value }))}>
                {data.homework.map((item) => (
                  <option key={item.item.id} value={item.item.id}>{item.item.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Question">
              <TextArea rows={3} value={homeworkQuestionForm.question_text} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, question_text: event.target.value }))} required />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Option A"><Input value={homeworkQuestionForm.opt_a} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, opt_a: event.target.value }))} required /></Field>
              <Field label="Option B"><Input value={homeworkQuestionForm.opt_b} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, opt_b: event.target.value }))} required /></Field>
              <Field label="Option C"><Input value={homeworkQuestionForm.opt_c} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, opt_c: event.target.value }))} required /></Field>
              <Field label="Option D"><Input value={homeworkQuestionForm.opt_d} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, opt_d: event.target.value }))} required /></Field>
            </div>
            <Field label="Correct answer">
              <Select value={homeworkQuestionForm.correct} onChange={(event) => setHomeworkQuestionForm((prev) => ({ ...prev, correct: event.target.value }))}>
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
                <option value="d">Option D</option>
              </Select>
            </Field>
            <Button type="submit" disabled={busy}>Save question</Button>
          </form>
        </Panel>
        <Panel title="Homework List">
          <div className="space-y-3">
            {data.homework.map((item) => (
              <div key={item.item.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.item.title}</p>
                  <Badge>{item.lesson ? classMap[item.lesson.class_id]?.name ?? "Class" : "Lesson missing"}</Badge>
                  <Badge>{item.questions.length} questions</Badge>
                  <Badge>{item.submissions.length} submissions</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Due {formatDateTime(item.item.due_date)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "tests") {
    return (
      <div className="space-y-6">
        <Panel title="Create Test">
          <form className="grid gap-4 lg:grid-cols-3" onSubmit={createTest}>
            <Field label="Test title">
              <Input value={testForm.title} onChange={(event) => setTestForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </Field>
            <Field label="Class">
              <Select value={testForm.class_id} onChange={(event) => setTestForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                {data.classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={testForm.subject_id} onChange={(event) => setTestForm((prev) => ({ ...prev, subject_id: event.target.value }))}>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Test date">
              <Input type="date" value={testForm.test_date} onChange={(event) => setTestForm((prev) => ({ ...prev, test_date: event.target.value }))} required />
            </Field>
            <Field label="Duration">
              <Input type="number" value={testForm.duration_minutes} onChange={(event) => setTestForm((prev) => ({ ...prev, duration_minutes: event.target.value }))} required />
            </Field>
            <Field label="Kind">
              <Select value={testForm.kind} onChange={(event) => setTestForm((prev) => ({ ...prev, kind: event.target.value }))}>
                <option value="monthly">Monthly</option>
                <option value="final">Final</option>
              </Select>
            </Field>
            <div className="lg:col-span-3">
              <Button type="submit" disabled={busy}>Create test</Button>
            </div>
          </form>
        </Panel>

        <Panel title="Add Multiple Choice Question" description="Add answer choices and mark the correct one.">
          <form className="grid gap-4" onSubmit={addTestQuestion}>
            <Field label="Test">
              <Select value={testQuestionForm.test_id} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, test_id: event.target.value }))}>
                {data.tests.map((item) => (
                  <option key={item.item.id} value={item.item.id}>{item.item.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Question">
              <TextArea rows={3} value={testQuestionForm.question_text} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, question_text: event.target.value }))} required />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Option A"><Input value={testQuestionForm.opt_a} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, opt_a: event.target.value }))} required /></Field>
              <Field label="Option B"><Input value={testQuestionForm.opt_b} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, opt_b: event.target.value }))} required /></Field>
              <Field label="Option C"><Input value={testQuestionForm.opt_c} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, opt_c: event.target.value }))} required /></Field>
              <Field label="Option D"><Input value={testQuestionForm.opt_d} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, opt_d: event.target.value }))} required /></Field>
            </div>
            <Field label="Correct answer">
              <Select value={testQuestionForm.correct} onChange={(event) => setTestQuestionForm((prev) => ({ ...prev, correct: event.target.value }))}>
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
                <option value="d">Option D</option>
              </Select>
            </Field>
            <Button type="submit" disabled={busy}>Save question</Button>
          </form>
        </Panel>

        <Panel title="Tests">
          <div className="space-y-3">
            {data.tests.map((item) => (
              <div key={item.item.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.item.title}</p>
                  <Badge>{classMap[item.item.class_id]?.name ?? "Class"}</Badge>
                  <Badge>{subjectMap[item.item.subject_id]?.name ?? "Subject"}</Badge>
                  <Badge>{item.questions.length} questions</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(item.item.test_date)} · {item.item.duration_minutes} minutes · {item.submissions.length} submissions
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "students") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Assigned Students" value={data.students.length} />
          <StatCard label="Homework Items" value={data.homework.length} />
          <StatCard label="Tests" value={data.tests.length} />
        </div>
        <Panel title="Students in Assigned Classes">
          <div className="space-y-3">
            {data.students.map((student) => (
              <div key={student.userId} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {student.email} · {student.className}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "timetable") {
    return (
      <Panel title="My Timetable">
        <div className="space-y-3">
          {data.timetable.length === 0 ? (
            <EmptyState message="No timetable entries for this teacher yet." />
          ) : (
            data.timetable.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">
                  {classMap[entry.class_id]?.name ?? "Class"} · {subjectMap[entry.subject_id]?.name ?? "Subject"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.academic_year_id)}
                </p>
              </div>
            ))
          )}
        </div>
      </Panel>
    );
  }

  if (view === "announcements") {
    return (
      <div className="space-y-6">
        <Panel title="Publish Class Announcement" description="Share an update with one of the classes you teach.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={publishAnnouncement}>
            <Field label="Class">
              <Select value={announcementForm.class_id} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                {data.classes
                  .filter((item) => data.assignments.some((assignment) => assignment.class_id === item.id))
                  .map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
              </Select>
            </Field>
            <Field label="Title">
              <Input value={announcementForm.title} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Body">
                <TextArea rows={5} value={announcementForm.body} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, body: event.target.value }))} required />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>Publish class announcement</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Announcements">
          <div className="space-y-3">
            {data.announcements.map((announcement) => (
              <div key={announcement.item.id} className="rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{announcement.item.title}</p>
                  <Badge>{announcement.audience}</Badge>
                </div>
                <p className="mt-2 text-sm">{announcement.item.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "messages") {
    return (
      <div className="space-y-6">
        <Panel title="Compose Message">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={sendMessage}>
            <Field label="Recipient">
              <Select value={messageForm.recipient_id} onChange={(event) => setMessageForm((prev) => ({ ...prev, recipient_id: event.target.value }))}>
                {data.recipientOptions.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>{recipient.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Input value={messageForm.subject} onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Message">
                <TextArea rows={5} value={messageForm.body} onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))} required />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>Send message</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Messages">
          <div className="space-y-3">
            {data.messages.map((message) => (
              <div key={message.item.id} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">{message.item.subject || "No subject"}</p>
                <p className="mt-2 text-sm">{message.item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  From {message.senderName} · To {message.recipients.map((recipient) => recipient.label).join(", ")} · {formatDateTime(message.item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Classes" value={unique(data.assignments.map((item) => item.class_id).filter(Boolean)).length} />
        <StatCard label="Lessons" value={data.lessons.length} />
        <StatCard label="Homework" value={data.homework.length} />
        <StatCard label="Tests" value={data.tests.length} />
      </div>
      <Panel title="Recent Work">
        <div className="space-y-3">
          {data.lessons.slice(0, 5).map((lesson) => (
            <div key={lesson.id} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">{lesson.title}</p>
              <p className="text-xs text-muted-foreground">
                {classMap[lesson.class_id]?.name ?? "Class"} · {subjectMap[lesson.subject_id]?.name ?? "Subject"} · {formatDate(lesson.lesson_date)}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function StudentPortal({
  view,
  data,
  profile,
  onNotify,
  onRefresh,
}: {
  view: string;
  data: StudentData;
  profile: BasicProfile;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [homeworkSelections, setHomeworkSelections] = useState<Record<string, string>>({});
  const [testSelections, setTestSelections] = useState<Record<string, string>>({});
  const [messageForm, setMessageForm] = useState({
    recipient_id: data.recipientOptions[0]?.id ?? "",
    subject: "",
    body: "",
  });

  const classMap = byId(data.classes);
  const subjectMap = byId(data.subjects);
  const enrollment = data.enrollments[0];

  const runAction = async (work: () => Promise<void>, successMessage: string) => {
    try {
      setBusy(true);
      await work();
      onNotify("success", successMessage);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitHomework = (bundle: HomeworkBundle) => {
    void runAction(async () => {
      const existing = bundle.submissions.find((submission) => submission.student_id === profile.id);
      if (existing) {
        throw new Error("This homework is already submitted.");
      }
      const missing = bundle.questions.find((question) => !homeworkSelections[question.id]);
      if (missing) {
        throw new Error("Answer every question before submitting.");
      }

      const submission = unwrap(
        await supabase
          .from("homework_submissions")
          .insert({
            homework_id: bundle.item.id,
            student_id: profile.id,
          })
          .select("id,homework_id,student_id,submitted_at,score,graded_at")
          .single(),
      ) as unknown as HomeworkSubmission;

      unwrap(
        await supabase.from("homework_answers").insert(
          bundle.questions.map((question) => ({
            submission_id: submission.id,
            question_id: question.id,
            selected_choice_id: homeworkSelections[question.id],
          })),
        ),
      );
      setActiveHomeworkId(null);
      setHomeworkSelections({});
    }, "Homework submitted.");
  };

  const submitTest = (bundle: TestBundle) => {
    void runAction(async () => {
      const existing = bundle.submissions.find((submission) => submission.student_id === profile.id);
      if (existing) {
        throw new Error("This test is already submitted.");
      }
      const missing = bundle.questions.find((question) => !testSelections[question.id]);
      if (missing) {
        throw new Error("Answer every question before submitting.");
      }

      const submission = unwrap(
        await supabase
          .from("test_submissions")
          .insert({
            test_id: bundle.item.id,
            student_id: profile.id,
          })
          .select("id,test_id,student_id,submitted_at,score,graded_at")
          .single(),
      ) as unknown as TestSubmission;

      unwrap(
        await supabase.from("test_answers").insert(
          bundle.questions.map((question) => ({
            submission_id: submission.id,
            question_id: question.id,
            selected_choice_id: testSelections[question.id],
          })),
        ),
      );
      setActiveTestId(null);
      setTestSelections({});
    }, "Test submitted.");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      await sendMessageToRecipient({
        schoolId: data.school.id,
        senderId: profile.id,
        recipientId: messageForm.recipient_id,
        subject: messageForm.subject,
        body: messageForm.body,
      });
      setMessageForm({
        recipient_id: data.recipientOptions[0]?.id ?? "",
        subject: "",
        body: "",
      });
    }, "Message sent.");
  };

  if (view === "lessons") {
    return (
      <Panel title="Lessons">
        <div className="space-y-3">
          {data.lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-2xl bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{lesson.title}</p>
                <Badge>{classMap[lesson.class_id]?.name ?? "Class"}</Badge>
                <Badge>{subjectMap[lesson.subject_id]?.name ?? "Subject"}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{lesson.description || "No description"}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(lesson.lesson_date)}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "homework") {
    const active = data.homework.find((item) => item.item.id === activeHomeworkId) ?? null;
    return (
      <div className="space-y-6">
        {active ? (
          <Panel title={active.item.title} description="Submit your answers once and your score will be updated automatically.">
            <div className="space-y-5">
              {active.questions.map((question, index) => (
                <div key={question.id} className="rounded-2xl bg-muted/30 p-4">
                  <p className="font-semibold">Question {index + 1}</p>
                  <p className="mt-2 text-sm">{question.question_text}</p>
                  <div className="mt-4 space-y-2">
                    {question.choices.map((choice) => (
                      <label key={choice.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                        <input
                          type="radio"
                          name={question.id}
                          checked={homeworkSelections[question.id] === choice.id}
                          onChange={() => setHomeworkSelections((prev) => ({ ...prev, [question.id]: choice.id }))}
                        />
                        {choice.choice_text}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setActiveHomeworkId(null)}>
                  Back
                </Button>
                <Button onClick={() => submitHomework(active)} disabled={busy}>
                  Submit homework
                </Button>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Homework">
            <div className="space-y-3">
              {data.homework.map((item) => {
                const submission = item.submissions.find((row) => row.student_id === profile.id);
                return (
                  <div key={item.item.id} className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold">{item.item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {formatDateTime(item.item.due_date)} · {item.questions.length} questions
                        </p>
                      </div>
                      {submission ? (
                        <Badge tone="success">Score: {submission.score ?? "Pending"}</Badge>
                      ) : (
                        <Button onClick={() => setActiveHomeworkId(item.item.id)}>Open</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </div>
    );
  }

  if (view === "tests") {
    const active = data.tests.find((item) => item.item.id === activeTestId) ?? null;
    return (
      <div className="space-y-6">
        {active ? (
          <Panel title={active.item.title} description="Submit your answers once and your attempt will be saved automatically.">
            <div className="space-y-5">
              {active.questions.map((question, index) => (
                <div key={question.id} className="rounded-2xl bg-muted/30 p-4">
                  <p className="font-semibold">Question {index + 1}</p>
                  <p className="mt-2 text-sm">{question.question_text}</p>
                  <div className="mt-4 space-y-2">
                    {question.choices.map((choice) => (
                      <label key={choice.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                        <input
                          type="radio"
                          name={question.id}
                          checked={testSelections[question.id] === choice.id}
                          onChange={() => setTestSelections((prev) => ({ ...prev, [question.id]: choice.id }))}
                        />
                        {choice.choice_text}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setActiveTestId(null)}>
                  Back
                </Button>
                <Button onClick={() => submitTest(active)} disabled={busy}>
                  Submit test
                </Button>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Tests">
            <div className="space-y-3">
              {data.tests.map((item) => {
                const submission = item.submissions.find((row) => row.student_id === profile.id);
                return (
                  <div key={item.item.id} className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold">{item.item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.item.test_date)} · {item.item.duration_minutes} minutes · {item.questions.length} questions
                        </p>
                      </div>
                      {submission ? (
                        <Badge tone="success">Score: {submission.score ?? "Pending"}</Badge>
                      ) : (
                        <Button onClick={() => setActiveTestId(item.item.id)}>Open</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </div>
    );
  }

  if (view === "grades") {
    return (
      <Panel title="Final Grades">
        <div className="space-y-3">
          {data.grades.map((grade) => (
            <div key={grade.id} className="rounded-2xl bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{subjectMap[grade.subject_id]?.name ?? "Subject"}</p>
                <Badge>{grade.status}</Badge>
              </div>
              <p className="mt-2 text-sm">
                {grade.grade_letter ?? "—"} · {grade.grade_value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "attendance") {
    return (
      <Panel title="Attendance">
        <div className="space-y-3">
          {data.attendance.map((row) => (
            <div key={row.id} className="rounded-2xl bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{row.status}</p>
                <Badge>{formatDateTime(row.recorded_at)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "timetable") {
    return (
      <Panel title="Timetable">
        <div className="space-y-3">
          {data.timetable.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">
                {classMap[entry.class_id]?.name ?? "Class"} · {subjectMap[entry.subject_id]?.name ?? "Subject"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "announcements") {
    return (
      <Panel title="Announcements">
        <div className="space-y-3">
          {data.announcements.map((announcement) => (
            <div key={announcement.item.id} className="rounded-2xl bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{announcement.item.title}</p>
                <Badge>{announcement.audience}</Badge>
              </div>
              <p className="mt-2 text-sm">{announcement.item.body}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "messages") {
    return (
      <div className="space-y-6">
        <Panel title="Compose Message">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={sendMessage}>
            <Field label="Teacher">
              <Select value={messageForm.recipient_id} onChange={(event) => setMessageForm((prev) => ({ ...prev, recipient_id: event.target.value }))}>
                {data.recipientOptions.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>{recipient.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Input value={messageForm.subject} onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Message">
                <TextArea rows={5} value={messageForm.body} onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))} required />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>Send message</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Messages">
          <div className="space-y-3">
            {data.messages.map((message) => (
              <div key={message.item.id} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">{message.item.subject || "No subject"}</p>
                <p className="mt-2 text-sm">{message.item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  From {message.senderName} · {formatDateTime(message.item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Class" value={enrollment ? classMap[enrollment.class_id]?.name ?? "Unknown" : "None"} />
        <StatCard label="Homework" value={data.homework.length} />
        <StatCard label="Tests" value={data.tests.length} />
        <StatCard label="Notifications" value={data.notifications.length} />
      </div>
      <Panel title="Recent Notifications">
        <div className="space-y-3">
          {data.notifications.length === 0 ? (
            <EmptyState message="No notifications yet." />
          ) : (
            data.notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">{notification.title || "Notification"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{notification.body || "No content"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(notification.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

function ParentPortal({
  view,
  data,
  profile,
  onNotify,
  onRefresh,
}: {
  view: string;
  data: ParentData;
  profile: BasicProfile;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(data.children[0]?.userId ?? "");
  const [messageForm, setMessageForm] = useState({
    recipient_id: data.recipientOptions[0]?.id ?? "",
    subject: "",
    body: "",
  });

  const classMap = byId(data.classes);
  const subjectMap = byId(data.subjects);
  const selectedChild = data.children.find((child) => child.userId === selectedChildId) ?? data.children[0] ?? null;
  const selectedEnrollment = data.enrollments.find((row) => row.student_id === selectedChildId);
  const childHomework = data.homework.map((item) => ({
    ...item,
    submission: item.submissions.find((submission) => submission.student_id === selectedChildId),
  }));
  const childTests = data.tests.map((item) => ({
    ...item,
    submission: item.submissions.find((submission) => submission.student_id === selectedChildId),
  }));
  const childGrades = data.grades.filter((grade) => grade.student_id === selectedChildId);
  const childAttendance = data.attendance.filter((row) => row.student_id === selectedChildId);

  const runAction = async (work: () => Promise<void>, successMessage: string) => {
    try {
      setBusy(true);
      await work();
      onNotify("success", successMessage);
      await onRefresh();
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(async () => {
      await sendMessageToRecipient({
        schoolId: data.school.id,
        senderId: profile.id,
        recipientId: messageForm.recipient_id,
        subject: messageForm.subject,
        body: messageForm.body,
      });
      setMessageForm({
        recipient_id: data.recipientOptions[0]?.id ?? "",
        subject: "",
        body: "",
      });
    }, "Message sent.");
  };

  if (view === "children") {
    return (
      <Panel title="Children">
        <div className="space-y-3">
          {data.children.map((child) => (
            <div key={child.userId} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">{child.name}</p>
              <p className="text-xs text-muted-foreground">{child.className}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "homework") {
    return (
      <Panel title={`Homework${selectedChild ? ` · ${selectedChild.name}` : ""}`}>
        <div className="space-y-3">
          {childHomework.map((item) => (
            <div key={item.item.id} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">{item.item.title}</p>
              <p className="text-xs text-muted-foreground">Due {formatDateTime(item.item.due_date)}</p>
              <p className="mt-2 text-sm">Score: {item.submission?.score ?? "Not submitted yet"}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "tests") {
    return (
      <Panel title={`Tests${selectedChild ? ` · ${selectedChild.name}` : ""}`}>
        <div className="space-y-3">
          {childTests.map((item) => (
            <div key={item.item.id} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">{item.item.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(item.item.test_date)}</p>
              <p className="mt-2 text-sm">Score: {item.submission?.score ?? "Not submitted yet"}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "grades") {
    return (
      <Panel title={`Grades${selectedChild ? ` · ${selectedChild.name}` : ""}`}>
        <div className="space-y-3">
          {childGrades.map((grade) => (
            <div key={grade.id} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">{subjectMap[grade.subject_id]?.name ?? "Subject"}</p>
              <p className="mt-2 text-sm">
                {grade.grade_letter ?? "—"} · {grade.grade_value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "attendance") {
    return (
      <Panel title={`Attendance${selectedChild ? ` · ${selectedChild.name}` : ""}`}>
        <div className="space-y-3">
          {childAttendance.map((row) => (
            <div key={row.id} className="rounded-2xl bg-muted/30 p-4">
              <p className="font-semibold">{row.status}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(row.recorded_at)}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "timetable") {
    return (
      <Panel title={`Timetable${selectedChild ? ` · ${selectedChild.name}` : ""}`}>
        <div className="space-y-3">
          {data.timetable
            .filter((entry) => !selectedEnrollment || entry.class_id === selectedEnrollment.class_id)
            .map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">
                  {classMap[entry.class_id]?.name ?? "Class"} · {subjectMap[entry.subject_id]?.name ?? "Subject"}
                </p>
              </div>
            ))}
        </div>
      </Panel>
    );
  }

  if (view === "announcements") {
    return (
      <Panel title="Announcements">
        <div className="space-y-3">
          {data.announcements.map((announcement) => (
            <div key={announcement.item.id} className="rounded-2xl bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{announcement.item.title}</p>
                <Badge>{announcement.audience}</Badge>
              </div>
              <p className="mt-2 text-sm">{announcement.item.body}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (view === "messages") {
    return (
      <div className="space-y-6">
        <Panel title="Compose Message">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={sendMessage}>
            <Field label="Teacher">
              <Select value={messageForm.recipient_id} onChange={(event) => setMessageForm((prev) => ({ ...prev, recipient_id: event.target.value }))}>
                {data.recipientOptions.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>{recipient.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Input value={messageForm.subject} onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Message">
                <TextArea rows={5} value={messageForm.body} onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))} required />
              </Field>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={busy}>Send message</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Messages">
          <div className="space-y-3">
            {data.messages.map((message) => (
              <div key={message.item.id} className="rounded-2xl bg-muted/30 p-4">
                <p className="font-semibold">{message.item.subject || "No subject"}</p>
                <p className="mt-2 text-sm">{message.item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  From {message.senderName} · {formatDateTime(message.item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Field label="Child">
          <Select value={selectedChildId} onChange={(event) => setSelectedChildId(event.target.value)}>
            {data.children.map((child) => (
              <option key={child.userId} value={child.userId}>{child.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Child" value={selectedChild?.name ?? "None"} />
        <StatCard label="Class" value={selectedChild?.className ?? "None"} />
        <StatCard label="Homework" value={childHomework.length} />
        <StatCard label="Attendance" value={childAttendance.length} />
      </div>
      <Panel title="Current Snapshot">
        <div className="space-y-3 text-sm">
          <p><span className="font-semibold">School:</span> {data.school.name}</p>
          <p><span className="font-semibold">Child:</span> {selectedChild?.name ?? "None selected"}</p>
          <p><span className="font-semibold">Class:</span> {selectedChild?.className ?? "Unknown"}</p>
        </div>
      </Panel>
    </div>
  );
}

export default function SmartClassLiveApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceKey, setWorkspaceKey] = useState<string | null>(null);
  const [workspaceOverride, setWorkspaceOverride] = useState<Workspace | null>(null);
  const [data, setData] = useState<LoadedWorkspaceData | null>(null);
  const [view, setView] = useState("dashboard");
  const [flash, setFlash] = useState<FlashState>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMemberships = async (targetUser: Session["user"]) => {
    setMembershipLoading(true);
    try {
      const result = await loadMemberships(targetUser);
      setProfile(result.profile);
      setWorkspaces(result.workspaces);
      setWorkspaceOverride(null);
      const stored = window.localStorage.getItem(`smart-class.workspace.${targetUser.id}`);
      const nextWorkspace = result.workspaces.find((item) => item.key === stored) ?? result.workspaces[0] ?? null;
      setWorkspaceKey(nextWorkspace?.key ?? null);
      setView("dashboard");
      setError(result.workspaces.length === 0 ? "This account does not have access to any school or admin area yet." : null);
    } catch (membershipError) {
      setError(membershipError instanceof Error ? membershipError.message : "Failed to load your access.");
    } finally {
      setMembershipLoading(false);
    }
  };

  useEffect(() => {
    if (!flash) return;
    const timeout = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setBootLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(sessionData.session ?? null);
      setBootLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setWorkspaces([]);
      setWorkspaceKey(null);
      setWorkspaceOverride(null);
      setData(null);
      return;
    }

    void refreshMemberships(session.user);
  }, [session?.user]);

  const selectedWorkspace = workspaceOverride ?? workspaces.find((item) => item.key === workspaceKey) ?? null;

  const refreshWorkspaceData = async () => {
    if (!selectedWorkspace || !session?.user) return;
    setDataLoading(true);
    setError(null);
    try {
      const nextData = await loadWorkspaceData(selectedWorkspace, session.user.id);
      setData(nextData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load workspace data.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedWorkspace || !session?.user) {
      setData(null);
      return;
    }
    if (!workspaceOverride) {
      window.localStorage.setItem(`smart-class.workspace.${session.user.id}`, selectedWorkspace.key);
    }
    setView("dashboard");
    void refreshWorkspaceData();
  }, [selectedWorkspace?.key, session?.user?.id, workspaceOverride]);

  const notify = (kind: "success" | "error" | "info", message: string) => {
    setFlash({ kind, message });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setData(null);
    setWorkspaces([]);
    setWorkspaceKey(null);
    setWorkspaceOverride(null);
  };

  const bootstrapInitialSuperAdmin = async () => {
    if (!session?.user || !profile) return;
    setBootstrapLoading(true);
    try {
      await bootstrapSuperAdminRole(profile.first_name, profile.last_name);
      notify("success", "Initial super admin role created.");
      await refreshMemberships(session.user);
    } catch (bootstrapError) {
      notify(
        "error",
        bootstrapError instanceof Error
          ? bootstrapError.message
          : "Failed to bootstrap the first super admin.",
      );
    } finally {
      setBootstrapLoading(false);
    }
  };

  if (!hasSupabaseEnv) {
    return <ConfigScreen />;
  }

  if (bootLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-sm">
          Connecting to Smart Class...
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen loading={membershipLoading || dataLoading} onNotify={notify} />;
  }

  if (membershipLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-sm">
          Loading your access...
        </div>
      </div>
    );
  }

  if (workspaces.length > 1 && !selectedWorkspace) {
    return <WorkspacePicker workspaces={workspaces} onPick={(workspace) => setWorkspaceKey(workspace.key)} onSignOut={() => void signOut()} profile={profile} />;
  }

  if (!selectedWorkspace) {
    return (
      <>
        <NoWorkspaceScreen
          error={error}
          profile={profile}
          busy={membershipLoading || bootstrapLoading}
          onBootstrap={() => void bootstrapInitialSuperAdmin()}
          onRefresh={() => void refreshMemberships(session.user)}
          onSignOut={() => void signOut()}
        />
        <div className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-3xl">
          <Flash flash={flash} />
        </div>
      </>
    );
  }

  const navItems = NAV_BY_ROLE[selectedWorkspace.role];

  return (
    <WorkspaceShell
      navItems={navItems}
      activeView={view}
      onSelect={setView}
      onRefresh={() => void refreshWorkspaceData()}
      onSignOut={() => void signOut()}
      onSwitchWorkspace={() => {
        if (workspaceOverride) {
          setWorkspaceOverride(null);
          return;
        }
        if (workspaces.length > 1) {
          setWorkspaceKey(null);
        }
      }}
      workspace={selectedWorkspace}
      profile={profile}
      loading={dataLoading}
    >
      <div className="space-y-6">
        <Flash flash={flash} />
        {error ? (
          <Panel title="Could Not Load Page">
            <p className="text-sm text-muted-foreground">{error}</p>
          </Panel>
        ) : null}
        {dataLoading && !data ? (
          <Panel title="Loading">
            <p className="text-sm text-muted-foreground">Loading the latest information for this dashboard...</p>
          </Panel>
        ) : null}
        {data?.role === "super_admin" ? (
          <SuperAdminPortal
            view={view}
            data={data}
            onNotify={notify}
            onRefresh={refreshWorkspaceData}
            onOpenSchool={(school) =>
              setWorkspaceOverride({
                key: `override-school-admin-${school.id}`,
                role: "school_admin",
                schoolId: school.id,
                schoolName: school.name,
                school,
              })
            }
          />
        ) : null}
        {data?.role === "school_admin" ? (
          <SchoolAdminPortal view={view} data={data} profile={profile} onNotify={notify} onRefresh={refreshWorkspaceData} />
        ) : null}
        {data?.role === "teacher" ? (
          <TeacherPortal view={view} data={data} profile={profile} onNotify={notify} onRefresh={refreshWorkspaceData} />
        ) : null}
        {data?.role === "student" ? (
          <StudentPortal view={view} data={data} profile={profile} onNotify={notify} onRefresh={refreshWorkspaceData} />
        ) : null}
        {data?.role === "parent" ? (
          <ParentPortal view={view} data={data} profile={profile} onNotify={notify} onRefresh={refreshWorkspaceData} />
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
