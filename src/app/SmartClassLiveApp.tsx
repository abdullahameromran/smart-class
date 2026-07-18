import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { hasSupabaseEnv, supabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

type UserRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent";
type AuthMode = "signin" | "signup";
type SettingValueType = "text" | "number" | "boolean" | "list" | "pairs";
type StudentAcademicStatus = "active" | "graduated" | "transferred" | "withdrawn" | "suspended";

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

type SchoolAdminTeacherAssignment = {
  id: string;
  subject_id: string;
  class_id: string | null;
  subjectName: string;
  className: string;
  label: string;
};

type SchoolAdminTeacher = {
  userId: string;
  name: string;
  email: string | null;
  assignments: string[];
  assignmentDetails: SchoolAdminTeacherAssignment[];
};

type SchoolAdminStudentParent = {
  userId: string;
  name: string;
  email: string | null;
  relationship: string;
};

type SchoolAdminStudent = {
  userId: string;
  name: string;
  email: string | null;
  className: string;
  classId: string | null;
  enrollmentId: string | null;
  status: string;
  parents: string[];
  parentDetails: SchoolAdminStudentParent[];
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
  grades: FinalGrade[];
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
    { id: "dashboard", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
    { id: "schools", label: "Schools", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "subscriptions", label: "Subscriptions", icon: <Layers className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ],
  school_admin: [
    { id: "dashboard", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
    { id: "settings", label: "School Settings", icon: <Settings className="w-4 h-4" /> },
    { id: "academic", label: "Academic Setup", icon: <Layers className="w-4 h-4" /> },
    { id: "teachers", label: "Teachers", icon: <Users className="w-4 h-4" /> },
    { id: "students", label: "Students", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "timetable", label: "Timetable", icon: <Calendar className="w-4 h-4" /> },
    { id: "grades", label: "Final Grades", icon: <CheckSquare className="w-4 h-4" /> },
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

const DEFAULT_VIEW = "dashboard";
const PLATFORM_AUDIT_PAGE_SIZE = 8;
const SCHOOL_ACTIVITY_CARD_PAGE_SIZE = 5;
const SCHOOL_ACTIVITY_PAGE_SIZE = 10;

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function getInitialPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizePath(window.location.pathname || "/");
}

function isPublicPath(path: string) {
  const normalized = normalizePath(path);
  return normalized === "/" || normalized === "/login" || normalized === "/signup";
}

function isAuthPath(path: string) {
  const normalized = normalizePath(path);
  return normalized === "/login" || normalized === "/signup";
}

function getAuthModeFromPath(path: string): AuthMode {
  return normalizePath(path) === "/signup" ? "signup" : "signin";
}

function getViewFromPath(path: string) {
  const normalized = normalizePath(path);
  if (isPublicPath(normalized)) {
    return null;
  }

  const segment = normalized.slice(1).split("/")[0];
  return segment || DEFAULT_VIEW;
}

function buildViewPath(view: string) {
  return `/${view || DEFAULT_VIEW}`;
}

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

function formatPlanLabel(value?: string | null) {
  if (!value) return "Untitled plan";
  return titleCaseLabel(value);
}

function normalizePlanName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
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
    grades,
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
    supabase
      .from("final_grades")
      .select("id,school_id,academic_year_id,class_id,subject_id,student_id,grade_value,grade_letter,remarks,status")
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
  const assignmentRows = (unwrap(assignments) as unknown) as TeacherAssignment[];
  const enrollmentRows = (unwrap(enrollments) as unknown) as ClassEnrollment[];
  const parentLinkRows = (unwrap(parentLinks) as unknown) as ParentStudentLink[];

  const rolesByUser = roleData.reduce<Record<string, UserRole[]>>((acc, row) => {
    acc[row.user_id] = acc[row.user_id] ? [...acc[row.user_id], row.role] : [row.role];
    return acc;
  }, {});

  const parentNamesByStudent = parentLinkRows.reduce<Record<string, string[]>>((acc, row) => {
    const list = acc[row.student_id] ?? [];
    const parentName = fullName(profileMap[row.parent_id]);
    acc[row.student_id] = parentName ? [...list, parentName] : list;
    return acc;
  }, {});

  const parentDetailsByStudent = parentLinkRows.reduce<Record<string, SchoolAdminStudentParent[]>>((acc, row) => {
    const parentProfile = profileMap[row.parent_id];
    const list = acc[row.student_id] ?? [];
    acc[row.student_id] = [
      ...list,
      {
        userId: row.parent_id,
        name: fullName(parentProfile),
        email: parentProfile?.email ?? null,
        relationship: row.relationship,
      },
    ];
    return acc;
  }, {});

  const teacherAssignmentDetailsByTeacher = assignmentRows.reduce<Record<string, SchoolAdminTeacherAssignment[]>>(
    (acc, row) => {
      const subjectName = subjectMap[row.subject_id]?.name ?? "Unknown subject";
      const className = row.class_id ? classMap[row.class_id]?.name ?? "Unknown class" : "All classes";
      const assignmentDetail = {
        id: row.id,
        subject_id: row.subject_id,
        class_id: row.class_id,
        subjectName,
        className,
        label: `${subjectName} / ${className}`,
      };
      acc[row.teacher_id] = acc[row.teacher_id] ? [...acc[row.teacher_id], assignmentDetail] : [assignmentDetail];
      return acc;
    },
    {},
  );

  const teachers = unique(roleData.filter((row) => row.role === "teacher").map((row) => row.user_id)).map<SchoolAdminTeacher>(
    (teacherId) => ({
      userId: teacherId,
      name: fullName(profileMap[teacherId]),
      email: profileMap[teacherId]?.email ?? null,
      assignments: (teacherAssignmentDetailsByTeacher[teacherId] ?? []).map((assignment) => assignment.label),
      assignmentDetails: teacherAssignmentDetailsByTeacher[teacherId] ?? [],
    }),
  );

  const students = unique(roleData.filter((row) => row.role === "student").map((row) => row.user_id)).map<SchoolAdminStudent>(
    (studentId) => {
      const enrollment = enrollmentRows.find((row) => row.student_id === studentId);
      return {
        userId: studentId,
        name: fullName(profileMap[studentId]),
        email: profileMap[studentId]?.email ?? null,
        className: enrollment ? classMap[enrollment.class_id]?.name ?? "Unknown class" : "Not enrolled",
        classId: enrollment?.class_id ?? null,
        enrollmentId: enrollment?.id ?? null,
        status: enrollment?.status ?? "inactive",
        parents: parentNamesByStudent[studentId] ?? [],
        parentDetails: parentDetailsByStudent[studentId] ?? [],
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
    grades: (unwrap(grades) as unknown) as FinalGrade[],
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

function ActivityFeed({
  rows,
  profileMap,
  schoolMap,
  emptyMessage,
  page,
  pageSize,
  onPageChange,
  maxHeightClass = "max-h-[30rem]",
  showMetadata = false,
  showSchoolLabel = false,
}: {
  rows: AuditLogRecord[];
  profileMap: Record<string, BasicProfile>;
  schoolMap?: Record<string, SchoolRecord>;
  emptyMessage: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  maxHeightClass?: string;
  showMetadata?: boolean;
  showSchoolLabel?: boolean;
}) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const totalPages = Math.max(Math.ceil(rows.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);
  const visibleStart = startIndex + 1;
  const visibleEnd = startIndex + visibleRows.length;

  return (
    <div className="space-y-4">
      <div className={`space-y-3 overflow-y-auto pr-2 ${maxHeightClass}`}>
        {visibleRows.map((row) => {
          const actor = row.actor_id ? profileMap[row.actor_id] : null;
          const schoolLabel = row.school_id ? schoolMap?.[row.school_id]?.name ?? "Unknown school" : "Platform";
          return (
            <div key={row.id} className="rounded-2xl border border-border bg-muted/25 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{titleCaseLabel(row.action)}</p>
                <Badge>{row.entity_type}</Badge>
                {showSchoolLabel ? <Badge>{schoolLabel}</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {actor ? fullName(actor) : "System"} / {formatDateTime(row.created_at)}
              </p>
              {showMetadata && row.metadata ? (
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-background/70 p-3 text-xs text-muted-foreground">
                  {formatSettingValue(row.metadata)}
                </pre>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Showing {visibleStart}-{visibleEnd} of {rows.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage === 1}
          >
            Previous
          </Button>
          <div className="min-w-[92px] rounded-xl border border-border bg-background px-3 py-2 text-center text-sm font-semibold text-foreground">
            {safePage} / {totalPages}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  onClick,
  className = "",
}: {
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <div
      className={`rounded-2xl border border-border bg-card p-4 shadow-sm transition ${
        onClick ? "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md" : ""
      } ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

function SectionTrail({
  items,
  description,
  action,
}: {
  items: string[];
  description?: string;
  action?: ReactNode;
}) {
  const title = items[items.length - 1] ?? "";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{items.join(" / ")}</p>
        <h3 className="mt-2 text-3xl font-bold text-foreground">{title}</h3>
        {description ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
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

function PopupModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {children}
            {footer ? <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function initialsFor(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarTone(seed: string) {
  const palette = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const value = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[value % palette.length];
}

function MessageChatWorkspace({
  currentUserId,
  recipientLabel,
  recipientId,
  subject,
  body,
  setRecipientId,
  setSubject,
  setBody,
  recipientOptions,
  messages,
  busy,
  onSend,
}: {
  currentUserId: string;
  recipientLabel: string;
  recipientId: string;
  subject: string;
  body: string;
  setRecipientId: (value: string) => void;
  setSubject: (value: string) => void;
  setBody: (value: string) => void;
  recipientOptions: RecipientOption[];
  messages: MessageBundle[];
  busy: boolean;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [query, setQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initialsFor = (value: string) =>
    value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const avatarTone = (seed: string) => {
    const palette = [
      "bg-violet-100 text-violet-700",
      "bg-sky-100 text-sky-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
    ];
    const value = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return palette[value % palette.length];
  };

  const recipientMap = recipientOptions.reduce<Record<string, RecipientOption>>((acc, recipient) => {
    acc[recipient.id] = recipient;
    return acc;
  }, {});

  const conversationMap: Record<
    string,
    {
      id: string;
      recipient: RecipientOption;
      messages: MessageBundle[];
      preview: string;
      lastMessageAt: string;
    }
  > = {};

  [...messages]
    .sort((a, b) => new Date(a.item.created_at).getTime() - new Date(b.item.created_at).getTime())
    .forEach((bundle) => {
      const recipient =
        bundle.item.sender_id === currentUserId
          ? bundle.recipients[0] ?? { id: "unknown", label: "Unknown recipient", email: null }
          : recipientMap[bundle.item.sender_id] ?? {
              id: bundle.item.sender_id,
              label: bundle.senderName,
              email: null,
            };

      const existing = conversationMap[recipient.id] ?? {
        id: recipient.id,
        recipient,
        messages: [],
        preview: "",
        lastMessageAt: bundle.item.created_at,
      };

      existing.messages.push(bundle);
      existing.preview = bundle.item.body;
      existing.lastMessageAt = bundle.item.created_at;
      conversationMap[recipient.id] = existing;
    });

  const conversations = Object.values(conversationMap).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  const filteredConversations = conversations.filter((conversation) => {
    const haystack = `${conversation.recipient.label} ${conversation.preview}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const activeConversation = conversations.find((conversation) => conversation.id === recipientId) ?? null;

  const activeRecipient =
    recipientOptions.find((recipient) => recipient.id === recipientId) ??
    activeConversation?.recipient ??
    null;

  useEffect(() => {
    if (!recipientOptions.length) {
      return;
    }

    if (!recipientId) {
      setRecipientId(conversations[0]?.id ?? recipientOptions[0].id);
      return;
    }

    if (!recipientOptions.some((recipient) => recipient.id === recipientId)) {
      setRecipientId(conversations[0]?.id ?? recipientOptions[0].id);
    }
  }, [conversations, recipientId, recipientOptions, setRecipientId]);

  const activeConversationMessages = activeConversation
    ? [...activeConversation.messages].sort(
        (a, b) => new Date(a.item.created_at).getTime() - new Date(b.item.created_at).getTime(),
      )
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: activeConversationMessages.length > 1 ? "smooth" : "auto",
      block: "end",
    });
  }, [activeConversation?.id, activeConversationMessages.length]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="grid h-[min(82vh,860px)] min-h-[720px] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col border-b border-border bg-card/95 xl:border-b-0 xl:border-r">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 rounded-2xl border-border/70 bg-white/85 pl-10"
                placeholder="Search messages..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth overscroll-y-contain">
            {filteredConversations.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  message={
                    messages.length === 0
                      ? "No conversation history yet. Pick someone on the right and start the chat."
                      : "No conversations match this search."
                  }
                />
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setRecipientId(conversation.recipient.id)}
                  className={`flex w-full items-start gap-3 border-b border-border/70 px-4 py-4 text-left transition ${
                    recipientId === conversation.id
                      ? "bg-secondary/50 shadow-[inset_4px_0_0_theme(colors.primary.DEFAULT)]"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarTone(
                      conversation.id,
                    )}`}
                  >
                    {initialsFor(conversation.recipient.label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-foreground">{conversation.recipient.label}</p>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.preview}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_48%),linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.7))]">
          <div className="border-b border-border/70 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarTone(
                    activeRecipient?.id ?? "new",
                  )}`}
                >
                  {initialsFor(activeRecipient?.label ?? "New chat")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{activeRecipient?.label || "Choose a recipient"}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeRecipient?.email || "Private conversation"}
                  </p>
                </div>
              </div>

              <Select
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
                className="max-w-sm"
              >
                {recipientOptions.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth overscroll-y-contain px-5 py-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
              {activeConversationMessages.length === 0 ? (
                <EmptyState message="Start a message here and this conversation will stay in one place." />
              ) : (
                activeConversationMessages.map((message) => {
                  const mine = message.item.sender_id === currentUserId;
                  return (
                    <div key={message.item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[44rem] rounded-[1.8rem] px-5 py-4 shadow-sm xl:max-w-[52rem] ${
                          mine ? "bg-primary text-white" : "bg-white/96 text-foreground"
                        }`}
                      >
                        {message.item.subject ? (
                          <p className={`text-xs font-semibold ${mine ? "text-white/80" : "text-muted-foreground"}`}>
                            {message.item.subject}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm leading-6">{message.item.body}</p>
                        <p className={`mt-2 text-xs ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatDateTime(message.item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={onSend}
            className="sticky bottom-0 border-t border-border/70 bg-gradient-to-t from-card via-card/95 to-card/70 px-4 pb-4 pt-3 backdrop-blur md:px-5"
          >
            <div className="mx-auto max-w-5xl rounded-[1.8rem] border border-border/70 bg-card/95 p-3 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
              <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
                <Input
                  className="h-12 rounded-2xl border-border/70 bg-white/85"
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
                <Input
                  className="h-12 rounded-2xl border-border/70 bg-white/85"
                  placeholder={`Type a message to this ${recipientLabel.toLowerCase()}...`}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  required
                />
                <Button className="h-12 rounded-2xl px-6" type="submit" disabled={busy || !recipientOptions.length || !recipientId}>
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
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
  const useFloatingSidebar = true;

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
  recipientId,
  subject,
  body,
}: {
  schoolId: string;
  recipientId: string;
  subject?: string;
  body: string;
}) {
  return unwrap(
    await supabase.rpc("send_private_message", {
      p_school_id: schoolId,
      p_recipient_id: recipientId,
      p_subject: subject?.trim() || null,
      p_body: body.trim(),
    }),
  ) as unknown as Message;
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

function LandingPage({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6">
        <header className="flex items-center justify-between rounded-[2rem] border border-border/70 bg-card/85 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Smart Class</p>
            <h1 className="mt-1 text-xl font-bold">Connected school management</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onLogin}>
              Log in
            </Button>
            <Button onClick={onSignup}>Create account</Button>
          </div>
        </header>

        <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2.25rem] border border-border/70 bg-card/92 p-8 shadow-[0_26px_90px_rgba(15,23,42,0.08)] backdrop-blur">
            <Badge>Simple landing page</Badge>
            <h2 className="mt-5 max-w-4xl text-5xl font-bold leading-[1.04] tracking-tight">
              One place for schools, teachers, students, parents, and platform admins.
            </h2>
            <p className="mt-5 max-w-3xl text-base text-muted-foreground">
              Smart Class brings school setup, class management, lessons, homework, tests, announcements, and messaging into one clean system.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <StatCard label="School setup" value="Fast" sub="Create a school and invite its first admin" />
              <StatCard label="Daily work" value="Organized" sub="Lessons, attendance, announcements, and messages" />
              <StatCard label="Access" value="Role-based" sub="Platform admin, school admin, teacher, student, and parent" />
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-border/60 bg-secondary/60 p-5">
                <p className="text-sm font-semibold text-foreground">Public pages now</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We now have a basic landing page at `/`, plus separate `/login` and `/signup` screens.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-border/60 bg-muted/45 p-5">
                <p className="text-sm font-semibold text-foreground">Dashboard pages now</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dashboard sections can open from real paths like `/teachers`, `/students`, `/messages`, and `/settings`.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={onSignup}>Start with sign up</Button>
              <Button variant="secondary" onClick={onLogin}>
                Go to login
              </Button>
            </div>
          </section>

          <aside className="rounded-[2.25rem] border border-border/70 bg-card/92 p-8 shadow-[0_26px_90px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">What is inside</p>
            <div className="mt-5 space-y-4">
              {[
                "Platform overview for Super Admin",
                "School setup and academic structure",
                "Teacher lesson and assessment tools",
                "Student learning and grades pages",
                "Parent follow-up and school messaging",
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-border/60 bg-muted/35 px-4 py-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.75rem] bg-primary px-5 py-5 text-primary-foreground shadow-[0_20px_50px_rgba(37,99,235,0.28)]">
              <p className="text-sm font-semibold">More public pages can come later.</p>
              <p className="mt-2 text-sm text-primary-foreground/80">
                This keeps the first version simple while giving the app a cleaner structure now.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({
  mode,
  loading,
  onNotify,
  onModeChange,
  onBackHome,
}: {
  mode: AuthMode;
  loading: boolean;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onBackHome: () => void;
}) {
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
    onModeChange("signin");
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge>Smart Class</Badge>
            <Button variant="ghost" onClick={onBackHome}>
              Back to home
            </Button>
          </div>
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
              onClick={() => onModeChange("signin")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onModeChange("signup")}
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
  onChangeView,
}: {
  view: string;
  data: SuperAdminData;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
  onOpenSchool: (school: SchoolRecord) => void;
  onChangeView: (view: string) => void;
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
  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolSection, setSchoolSection] = useState<"overview" | "teachers" | "students" | "parents" | "admins" | "activity">("overview");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const [settingsQuery, setSettingsQuery] = useState("");
  const [dashboardFocus, setDashboardFocus] = useState<"overview" | "people" | "access" | "audit">("overview");
  const [dashboardRoleFilter, setDashboardRoleFilter] = useState<"all" | UserRole>("all");
  const [platformAuditPage, setPlatformAuditPage] = useState(1);
  const [schoolRecentActivityPage, setSchoolRecentActivityPage] = useState(1);
  const [schoolActivityPage, setSchoolActivityPage] = useState(1);

  const topLevelView = view === "billing"
    ? "subscriptions"
    : view === "people" || view === "access" || view === "audit"
      ? "dashboard"
      : view;
  const dashboardMode = view === "people"
    ? "people"
    : view === "access"
      ? "access"
      : view === "audit"
        ? "audit"
        : dashboardFocus;

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

  useEffect(() => {
    setPlatformAuditPage(1);
  }, [auditQuery]);

  useEffect(() => {
    setSchoolRecentActivityPage(1);
    setSchoolActivityPage(1);
  }, [selectedSchoolId]);

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

  const allSchoolDirectory = data.stats
    .map((row) => {
      const school = schoolMap[row.school_id] ?? {
        id: row.school_id,
        name: row.school_name,
        slug: "",
        timezone: "UTC",
        is_active: row.is_active,
        created_at: null,
      };
      const subscription = latestSubscriptionsBySchool[row.school_id] ?? null;
      const plan = subscription ? planMap[subscription.plan_id] ?? null : null;
      return {
        ...row,
        school,
        subscription,
        plan,
      };
    })
    .sort((a, b) => a.school_name.localeCompare(b.school_name));

  const schoolDirectory = allSchoolDirectory.filter((row) => {
    const query = schoolQuery.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      row.school_name,
      row.school.slug,
      row.plan?.name ?? "",
      row.subscription_status ?? "",
      row.school.timezone,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const selectedSchoolSummary = selectedSchoolId
    ? allSchoolDirectory.find((row) => row.school_id === selectedSchoolId) ?? null
    : null;

  const schoolMemberDirectory = (schoolId: string, roles: UserRole[]) =>
    unique(
      data.roleRows
        .filter((row) => row.school_id === schoolId && row.is_active && roles.includes(row.role))
        .map((row) => row.user_id),
    )
      .map((userId) => {
        const rows = data.roleRows
          .filter((row) => row.user_id === userId && row.school_id === schoolId && row.is_active)
          .sort((a, b) => roleRank(a.role) - roleRank(b.role));
        return {
          userId,
          profile: profileMap[userId],
          rows,
          joinedAt: rows[0]?.created_at ?? null,
        };
      })
      .sort((a, b) => fullName(a.profile).localeCompare(fullName(b.profile)));

  const selectedSchoolMembers = selectedSchoolId
    ? {
        teachers: schoolMemberDirectory(selectedSchoolId, ["teacher"]),
        students: schoolMemberDirectory(selectedSchoolId, ["student"]),
        parents: schoolMemberDirectory(selectedSchoolId, ["parent"]),
        admins: schoolMemberDirectory(selectedSchoolId, ["school_admin"]),
      }
    : { teachers: [], students: [], parents: [], admins: [] };

  const currentSchoolMemberList =
    schoolSection === "teachers"
      ? selectedSchoolMembers.teachers
      : schoolSection === "students"
        ? selectedSchoolMembers.students
        : schoolSection === "parents"
          ? selectedSchoolMembers.parents
          : schoolSection === "admins"
            ? selectedSchoolMembers.admins
            : [];

  const selectedMemberDetail = selectedMemberId
    ? [
        ...selectedSchoolMembers.teachers,
        ...selectedSchoolMembers.students,
        ...selectedSchoolMembers.parents,
        ...selectedSchoolMembers.admins,
      ].find((row) => row.userId === selectedMemberId) ?? null
    : null;

  const selectedMemberRoles = selectedMemberId
    ? ((roleRowsByUser[selectedMemberId] ?? []).sort((a, b) => roleRank(a.role) - roleRank(b.role)))
    : [];

  const settingsDirectory = data.settings
    .filter((setting) => {
      const query = settingsQuery.trim().toLowerCase();
      if (!query) return true;
      const haystack = `${setting.key} ${formatInlineValue(setting.value)}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const selectedSetting = selectedSettingKey
    ? data.settings.find((setting) => setting.key === selectedSettingKey) ?? null
    : null;

  const planUsage = data.plans
    .map((plan) => {
      const schoolsOnPlan = currentSubscriptions.filter((subscription) => subscription.plan_id === plan.id);
      const revenueCents = schoolsOnPlan
        .filter((subscription) => subscription.status !== "canceled" && subscription.status !== "suspended")
        .length * plan.price_cents;
      return {
        plan,
        schoolsOnPlan,
        schoolCount: schoolsOnPlan.length,
        revenueCents,
      };
    })
    .sort((a, b) => b.schoolCount - a.schoolCount || a.plan.price_cents - b.plan.price_cents);

  const selectedPlanUsage = selectedPlanId
    ? planUsage.find((entry) => entry.plan.id === selectedPlanId) ?? null
    : null;

  const estimatedMonthlyRevenue = currentSubscriptions.reduce((sum, subscription) => {
    if (subscription.status === "canceled" || subscription.status === "suspended") return sum;
    return sum + (planMap[subscription.plan_id]?.price_cents ?? 0);
  }, 0);

  const recentMonthLabels = Array.from({ length: 6 }, (_, index) => {
    const cursor = new Date();
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() - (5 - index));
    return {
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      label: cursor.toLocaleDateString(undefined, { month: "short" }),
    };
  });

  const schoolGrowth = recentMonthLabels.map((month) => ({
    ...month,
    count: data.schools.filter((school) => {
      if (!school.created_at) return false;
      const created = new Date(school.created_at);
      if (Number.isNaN(created.getTime())) return false;
      const createdKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      return createdKey === month.key;
    }).length,
  }));

  const growthMax = Math.max(...schoolGrowth.map((item) => item.count), 1);
  const planUsageMax = Math.max(...planUsage.map((item) => item.schoolCount), 1);

  const openDashboardFocus = (focus: "overview" | "people" | "access" | "audit", roleFilter: "all" | UserRole = "all") => {
    setDashboardFocus(focus);
    setDashboardRoleFilter(roleFilter);
    onChangeView("dashboard");
  };

  const openSchoolDetail = (
    schoolId: string,
    nextSection: "overview" | "teachers" | "students" | "parents" | "admins" | "activity" = "overview",
  ) => {
    setSelectedSchoolId(schoolId);
    setSchoolSection(nextSection);
    setSelectedMemberId(null);
    onChangeView("schools");
  };

  const openSchoolMember = (
    schoolId: string,
    nextSection: "teachers" | "students" | "parents" | "admins",
    userId: string,
  ) => {
    setSelectedSchoolId(schoolId);
    setSchoolSection(nextSection);
    setSelectedMemberId(userId);
    onChangeView("schools");
  };

  const schoolSectionLabels = {
    overview: "Overview",
    teachers: "Teachers",
    students: "Students",
    parents: "Parents",
    admins: "School Admins",
    activity: "Activity",
  } satisfies Record<"overview" | "teachers" | "students" | "parents" | "admins" | "activity", string>;

  const dashboardPeopleRows = peopleRows.filter(({ roles }) => {
    if (dashboardRoleFilter === "all") return true;
    return roles.some((row) => row.role === dashboardRoleFilter);
  });

  const selectedSchoolAuditLogs = selectedSchoolId
    ? data.auditLogs.filter((row) => row.school_id === selectedSchoolId)
    : [];

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
      const trimmedPlanName = planForm.name.trim().replace(/\s+/g, " ");
      if (!trimmedPlanName) {
        throw new Error("Plan name is required.");
      }
      const normalizedPlanName = normalizePlanName(trimmedPlanName);
      const hasDuplicateName = data.plans.some(
        (plan) => plan.id !== planForm.id && normalizePlanName(plan.name) === normalizedPlanName,
      );
      if (hasDuplicateName) {
        throw new Error(`A plan named "${formatPlanLabel(trimmedPlanName)}" already exists.`);
      }

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
        name: trimmedPlanName,
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
      onNotify("success", `${formatPlanLabel(plan.name)} ${plan.is_active ? "deactivated" : "activated"}.`);
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

  if (topLevelView === "dashboard") {
    if (dashboardMode === "people") {
      return (
        <div className="space-y-6">
          <SectionTrail
            items={["Dashboard", "People"]}
            description="Browse people across the platform, then narrow the list to teachers, students, parents, or super admins without leaving the dashboard."
            action={
              <Button type="button" variant="secondary" onClick={() => setDashboardFocus("overview")}>
                Back to dashboard
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Everyone"
              value={peopleRows.length}
              sub="All visible profiles"
              onClick={() => setDashboardRoleFilter("all")}
              className={dashboardRoleFilter === "all" ? "border-primary/40 ring-2 ring-primary/10" : ""}
            />
            <StatCard
              label="Teachers"
              value={data.roleRows.filter((row) => row.role === "teacher" && row.is_active).length}
              sub="Teaching accounts"
              onClick={() => setDashboardRoleFilter("teacher")}
              className={dashboardRoleFilter === "teacher" ? "border-primary/40 ring-2 ring-primary/10" : ""}
            />
            <StatCard
              label="Students"
              value={data.roleRows.filter((row) => row.role === "student" && row.is_active).length}
              sub="Student accounts"
              onClick={() => setDashboardRoleFilter("student")}
              className={dashboardRoleFilter === "student" ? "border-primary/40 ring-2 ring-primary/10" : ""}
            />
            <StatCard
              label="Parents"
              value={data.roleRows.filter((row) => row.role === "parent" && row.is_active).length}
              sub="Parent accounts"
              onClick={() => setDashboardRoleFilter("parent")}
              className={dashboardRoleFilter === "parent" ? "border-primary/40 ring-2 ring-primary/10" : ""}
            />
          </div>

          <Panel title="Platform Directory" description="Use search and the cards above to focus on the people you need.">
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
              {dashboardPeopleRows.length === 0 ? (
                <EmptyState message="No matching profiles found." />
              ) : (
                dashboardPeopleRows.map(({ profile, roles }) => (
                  <div key={profile.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{fullName(profile)}</h3>
                          <Badge tone={profile.is_active ? "success" : "warning"}>
                            {profile.is_active ? "Active profile" : "Inactive profile"}
                          </Badge>
                          {roles.length === 0 ? <Badge tone="warning">No role yet</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {profile.email ?? "No email on file"} / Joined {formatDate(profile.created_at)}
                        </p>
                      </div>
                      <Button type="button" variant="secondary" onClick={() => openDashboardFocus("access")}>
                        Manage access
                      </Button>
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

    if (dashboardMode === "access") {
      return (
        <div className="space-y-6">
          <SectionTrail
            items={["Dashboard", "Access"]}
            description="Grant, restore, or pause platform access without crowding the main navigation."
            action={
              <Button type="button" variant="secondary" onClick={() => setDashboardFocus("overview")}>
                Back to dashboard
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Role Rows" value={data.counts.role_assignments.toLocaleString()} />
            <StatCard label="School Admins" value={data.roleRows.filter((row) => row.role === "school_admin" && row.is_active).length} />
            <StatCard label="Teachers" value={data.roleRows.filter((row) => row.role === "teacher" && row.is_active).length} />
            <StatCard label="Students" value={data.roleRows.filter((row) => row.role === "student" && row.is_active).length} />
          </div>

          <Panel title="Give or Restore Access" description="Choose a person, choose a role, and decide where that role should work.">
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

          <Panel title="Current Access" description="Search by person, role, or school and switch access on or off.">
            <div className="mb-4 max-w-md">
              <Field label="Search access">
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
                          type="button"
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

    if (dashboardMode === "audit") {
      return (
        <div className="space-y-6">
          <SectionTrail
            items={["Dashboard", "Audit"]}
            description="Track platform-wide actions, changes, and recent events in one roomy feed."
            action={
              <Button type="button" variant="secondary" onClick={() => setDashboardFocus("overview")}>
                Back to dashboard
              </Button>
            }
          />

          <Panel title="Recent Activity" description="Use search to narrow the feed to a school, action, person, or entity type.">
            <div className="mb-4 max-w-md">
              <Field label="Search activity">
                <Input
                  value={auditQuery}
                  onChange={(event) => setAuditQuery(event.target.value)}
                  placeholder="Search by action, school, person, or type"
                />
              </Field>
            </div>
            <ActivityFeed
              rows={filteredAuditLogs}
              profileMap={profileMap}
              schoolMap={schoolMap}
              emptyMessage="No matching activity found."
              page={platformAuditPage}
              pageSize={PLATFORM_AUDIT_PAGE_SIZE}
              onPageChange={setPlatformAuditPage}
              maxHeightClass="max-h-[36rem]"
              showMetadata
              showSchoolLabel
            />
          </Panel>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionTrail
          items={["Dashboard"]}
          description="Track platform growth, jump into schools, and open deeper admin workspaces from the cards below."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Schools"
            value={data.counts.schools.toLocaleString()}
            sub={`${activeSchools} active`}
            onClick={() => onChangeView("schools")}
          />
          <StatCard
            label="Total Teachers"
            value={totalTeachers.toLocaleString()}
            sub="Open teacher directory"
            onClick={() => openDashboardFocus("people", "teacher")}
          />
          <StatCard
            label="Total Students"
            value={totalStudents.toLocaleString()}
            sub="Open student directory"
            onClick={() => openDashboardFocus("people", "student")}
          />
          <StatCard
            label="Monthly Revenue"
            value={currencyFromCents(estimatedMonthlyRevenue)}
            sub={`${currentSubscriptions.length} live subscriptions`}
            onClick={() => onChangeView("subscriptions")}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Monthly Growth" description="New schools created over the last six months.">
            <div className="space-y-4">
              {schoolGrowth.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.count} new schools</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${Math.max((item.count / growthMax) * 100, item.count > 0 ? 12 : 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Recent Schools" description="Open a school card to get a more spacious school-level workspace.">
            <div className="space-y-3">
              {allSchoolDirectory.slice(0, 5).map((row) => (
                <button
                  key={row.school_id}
                  type="button"
                  onClick={() => openSchoolDetail(row.school_id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted/25 p-4 text-left transition hover:border-primary/30 hover:bg-card"
                >
                  <div>
                    <p className="font-semibold">{row.school_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.student_count} students / {row.teacher_count} teachers
                    </p>
                  </div>
                  <Badge tone={row.is_active ? "success" : "warning"}>{row.is_active ? "Active" : "Inactive"}</Badge>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <button
            type="button"
            onClick={() => openDashboardFocus("people")}
            className="rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Directory</p>
            <h3 className="mt-3 text-xl font-bold">People</h3>
            <p className="mt-2 text-sm text-muted-foreground">See teachers, students, parents, and platform accounts in one place.</p>
          </button>
          <button
            type="button"
            onClick={() => openDashboardFocus("access")}
            className="rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Control</p>
            <h3 className="mt-3 text-xl font-bold">Access</h3>
            <p className="mt-2 text-sm text-muted-foreground">Grant, restore, or pause platform access without adding more sidebar items.</p>
          </button>
          <button
            type="button"
            onClick={() => openDashboardFocus("audit")}
            className="rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">History</p>
            <h3 className="mt-3 text-xl font-bold">Audit Feed</h3>
            <p className="mt-2 text-sm text-muted-foreground">Review the latest changes, imports, role updates, and school actions.</p>
          </button>
        </div>
      </div>
    );
  }

  if (topLevelView === "schools") {
    if (selectedSchoolSummary && selectedMemberDetail) {
      return (
        <div className="space-y-6">
          <SectionTrail
            items={["Schools", selectedSchoolSummary.school_name, schoolSectionLabels[schoolSection], fullName(selectedMemberDetail.profile)]}
            description="Each profile opens into its own room so you can review access, contact details, and school membership without compressing the page."
            action={
              <>
                <Button type="button" variant="secondary" onClick={() => setSelectedMemberId(null)}>
                  Back to {schoolSectionLabels[schoolSection]}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelectedSchoolId(null);
                    setSelectedMemberId(null);
                    setSchoolSection("overview");
                  }}
                >
                  All schools
                </Button>
              </>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Profile Summary" description="Basic contact details and the roles this person currently carries in the selected school.">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold">{fullName(selectedMemberDetail.profile)}</h3>
                  <Badge tone={selectedMemberDetail.profile?.is_active ? "success" : "warning"}>
                    {selectedMemberDetail.profile?.is_active ? "Active profile" : "Inactive profile"}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="mt-2 text-sm">{selectedMemberDetail.profile?.email ?? "No email on file"}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Joined this school</p>
                    <p className="mt-2 text-sm">{formatDate(selectedMemberDetail.joinedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMemberDetail.rows.map((row) => (
                    <Badge key={row.id}>{ROLE_LABELS[row.role]}</Badge>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Access Footprint" description="See the rest of this person's current access across the whole platform.">
              <div className="space-y-3">
                {selectedMemberRoles.length === 0 ? (
                  <EmptyState message="This person does not have any active role rows." />
                ) : (
                  selectedMemberRoles.map((row) => (
                    <div key={row.id} className="rounded-2xl border border-border bg-muted/25 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={row.is_active ? "success" : "warning"}>{ROLE_LABELS[row.role]}</Badge>
                        <Badge>{row.school_id ? schoolMap[row.school_id]?.name ?? "Unknown school" : "Platform"}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Granted {formatDate(row.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      );
    }

    if (selectedSchoolSummary) {
      return (
        <div className="space-y-6">
          <SectionTrail
            items={schoolSection === "overview" ? ["Schools", selectedSchoolSummary.school_name] : ["Schools", selectedSchoolSummary.school_name, schoolSectionLabels[schoolSection]]}
            description="Move through one school at a time so there is more room for teams, activity, and settings."
            action={
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedMemberId(null);
                    setSchoolSection("overview");
                  }}
                >
                  School home
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelectedSchoolId(null);
                    setSelectedMemberId(null);
                    setSchoolSection("overview");
                  }}
                >
                  All schools
                </Button>
              </>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label="School Admins" value={selectedSchoolMembers.admins.length} sub="Open team" onClick={() => setSchoolSection("admins")} />
            <StatCard label="Teachers" value={selectedSchoolMembers.teachers.length} sub="Open teachers" onClick={() => setSchoolSection("teachers")} />
            <StatCard label="Students" value={selectedSchoolMembers.students.length} sub="Open students" onClick={() => setSchoolSection("students")} />
            <StatCard label="Parents" value={selectedSchoolMembers.parents.length} sub="Open parents" onClick={() => setSchoolSection("parents")} />
            <StatCard label="Classes" value={selectedSchoolSummary.class_count} sub="Recent activity" onClick={() => setSchoolSection("activity")} />
          </div>

          {schoolSection === "overview" ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Panel title="School Snapshot" description="Plan, status, timezone, and actions for this school.">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
                    <p className="mt-2 text-lg font-semibold">{selectedSchoolSummary.plan?.name ?? "No plan"}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
                    <p className="mt-2 text-lg font-semibold">{selectedSchoolSummary.subscription_status ?? "No subscription"}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timezone</p>
                    <p className="mt-2 text-sm">{selectedSchoolSummary.school.timezone}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</p>
                    <p className="mt-2 text-sm">{selectedSchoolSummary.school.slug || "No slug yet"}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</p>
                    <p className="mt-2 text-sm">{formatDate(selectedSchoolSummary.school.created_at)}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last activity</p>
                    <p className="mt-2 text-sm">{formatDateTime(selectedSchoolSummary.last_activity_at)}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => onOpenSchool(selectedSchoolSummary.school)}>
                    Open school dashboard
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => void toggleSchool(selectedSchoolSummary.school)} disabled={busy}>
                    {selectedSchoolSummary.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button type="button" variant="danger" onClick={() => void archiveSchool(selectedSchoolSummary.school)} disabled={busy}>
                    Archive
                  </Button>
                </div>
              </Panel>

              <Panel title="Recent Activity" description="Recent tracked actions for this school only.">
                <ActivityFeed
                  rows={selectedSchoolAuditLogs}
                  profileMap={profileMap}
                  emptyMessage="No school activity has been logged yet."
                  page={schoolRecentActivityPage}
                  pageSize={SCHOOL_ACTIVITY_CARD_PAGE_SIZE}
                  onPageChange={setSchoolRecentActivityPage}
                  maxHeightClass="max-h-[24rem]"
                />
              </Panel>
            </div>
          ) : schoolSection === "activity" ? (
            <Panel title="School Activity Feed" description="Review everything logged for this school in one dedicated stream.">
              <ActivityFeed
                rows={selectedSchoolAuditLogs}
                profileMap={profileMap}
                emptyMessage="No school activity has been logged yet."
                page={schoolActivityPage}
                pageSize={SCHOOL_ACTIVITY_PAGE_SIZE}
                onPageChange={setSchoolActivityPage}
                maxHeightClass="max-h-[40rem]"
                showMetadata
              />
            </Panel>
          ) : (
            <Panel
              title={schoolSectionLabels[schoolSection]}
              description="Open a person to see a focused detail page instead of squeezing all the data into one crowded list."
            >
              <div className="space-y-3">
                {currentSchoolMemberList.length === 0 ? (
                  <EmptyState message={`No ${schoolSectionLabels[schoolSection].toLowerCase()} found yet.`} />
                ) : (
                  currentSchoolMemberList.map((member) => (
                    <div key={member.userId} className="rounded-2xl border border-border bg-muted/25 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-bold">{fullName(member.profile)}</h4>
                            {unique(member.rows.map((row) => ROLE_LABELS[row.role])).map((label) => (
                              <Badge key={label}>{label}</Badge>
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {member.profile?.email ?? "No email on file"} / Joined {formatDate(member.joinedAt)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            openSchoolMember(selectedSchoolSummary.school_id, schoolSection as "teachers" | "students" | "parents" | "admins", member.userId)
                          }
                        >
                          Open profile
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionTrail
          items={["Schools"]}
          description="Search schools, open one into a deeper workspace, and keep extra platform tasks tucked behind roomy drill-down sections."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Schools" value={data.counts.schools.toLocaleString()} sub={`${activeSchools} active`} />
          <StatCard label="Subscriptions" value={currentSubscriptions.length.toLocaleString()} sub="Latest active rows" onClick={() => onChangeView("subscriptions")} />
          <StatCard label="Students" value={totalStudents.toLocaleString()} sub="Across all schools" onClick={() => openDashboardFocus("people", "student")} />
          <StatCard label="Teachers" value={totalTeachers.toLocaleString()} sub="Across all schools" onClick={() => openDashboardFocus("people", "teacher")} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="School Directory" description="Click into one school at a time so people, activity, and settings each have room to breathe.">
            <div className="mb-4 max-w-md">
              <Field label="Search schools">
                <Input
                  value={schoolQuery}
                  onChange={(event) => setSchoolQuery(event.target.value)}
                  placeholder="Search by school name, slug, plan, or timezone"
                />
              </Field>
            </div>

            <div className="space-y-3">
              {schoolDirectory.length === 0 ? (
                <EmptyState message="No matching schools found." />
              ) : (
                schoolDirectory.map((row) => (
                  <div key={row.school_id} className="rounded-2xl border border-border bg-muted/25 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{row.school_name}</h3>
                          <Badge tone={row.is_active ? "success" : "warning"}>{row.is_active ? "Active" : "Inactive"}</Badge>
                          <Badge>{row.subscription_status ?? "No subscription"}</Badge>
                          <Badge>{row.plan ? formatPlanLabel(row.plan.name) : "No plan"}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {row.student_count} students / {row.teacher_count} teachers / {row.class_count} classes
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.school.slug || "No slug"} / {row.school.timezone} / Last activity {formatDateTime(row.last_activity_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => openSchoolDetail(row.school_id)}>
                          Open details
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => onOpenSchool(row.school)}>
                          Open school dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Add a School" description="Create a school, choose its plan, and invite its first admin.">
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
                        {formatPlanLabel(plan.name)}
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

            <Panel title="More Space, Less Clutter" description="Open deeper platform tools only when you need them.">
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => openDashboardFocus("people")}
                  className="rounded-2xl border border-border bg-muted/25 p-4 text-left transition hover:border-primary/30 hover:bg-card"
                >
                  <p className="font-semibold">People</p>
                  <p className="mt-1 text-xs text-muted-foreground">Open platform directory</p>
                </button>
                <button
                  type="button"
                  onClick={() => openDashboardFocus("access")}
                  className="rounded-2xl border border-border bg-muted/25 p-4 text-left transition hover:border-primary/30 hover:bg-card"
                >
                  <p className="font-semibold">Access</p>
                  <p className="mt-1 text-xs text-muted-foreground">Grant or pause roles</p>
                </button>
                <button
                  type="button"
                  onClick={() => openDashboardFocus("audit")}
                  className="rounded-2xl border border-border bg-muted/25 p-4 text-left transition hover:border-primary/30 hover:bg-card"
                >
                  <p className="font-semibold">Audit</p>
                  <p className="mt-1 text-xs text-muted-foreground">Review recent actions</p>
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  if (topLevelView === "analytics") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["Analytics"]}
          description="See school mix, estimated subscription revenue, and recent platform growth without leaving the Super Admin workspace."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active Schools" value={activeSchools} sub="Open school directory" onClick={() => onChangeView("schools")} />
          <StatCard label="Plans in Use" value={planUsage.filter((item) => item.schoolCount > 0).length} sub="Click a plan below" onClick={() => onChangeView("subscriptions")} />
          <StatCard label="Students" value={totalStudents.toLocaleString()} sub="Across all schools" />
          <StatCard label="Estimated Revenue" value={currencyFromCents(estimatedMonthlyRevenue)} sub="Based on current subscriptions" onClick={() => onChangeView("subscriptions")} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Schools by Plan" description="Each bar shows how many schools are currently assigned to that plan.">
            <div className="space-y-4">
              {planUsage.map((entry) => (
                <button
                  key={entry.plan.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlanId(entry.plan.id);
                    onChangeView("subscriptions");
                  }}
                  className="w-full rounded-2xl border border-border bg-muted/25 p-4 text-left transition hover:border-primary/30 hover:bg-card"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{formatPlanLabel(entry.plan.name)}</p>
                      <p className="text-sm text-muted-foreground">{currencyFromCents(entry.plan.price_cents)} / {entry.plan.billing_cycle}</p>
                    </div>
                    <Badge>{entry.schoolCount} schools</Badge>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${Math.max((entry.schoolCount / planUsageMax) * 100, entry.schoolCount > 0 ? 12 : 4)}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Revenue Overview" description="This compares estimated monthly revenue by plan using the latest subscription row for each school.">
            <div className="grid gap-4">
              {planUsage.map((entry) => {
                const revenueMax = Math.max(...planUsage.map((item) => item.revenueCents), 1);
                return (
                  <div key={entry.plan.id} className="rounded-2xl border border-border bg-muted/25 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{formatPlanLabel(entry.plan.name)}</p>
                        <p className="text-sm text-muted-foreground">{entry.schoolCount} schools</p>
                      </div>
                      <p className="text-lg font-bold">{currencyFromCents(entry.revenueCents)}</p>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-muted">
                      <div
                        className="h-3 rounded-full bg-primary"
                        style={{ width: `${Math.max((entry.revenueCents / revenueMax) * 100, entry.revenueCents > 0 ? 12 : 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  if (topLevelView === "subscriptions") {
    if (selectedPlanUsage) {
      return (
        <div className="space-y-6">
          <SectionTrail
            items={["Subscriptions", formatPlanLabel(selectedPlanUsage.plan.name)]}
            description="Edit this plan and review every school that currently uses it."
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedPlanId(null);
                  resetPlanForm();
                }}
              >
                All plans
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Price" value={currencyFromCents(selectedPlanUsage.plan.price_cents)} sub={`per ${selectedPlanUsage.plan.billing_cycle}`} />
            <StatCard label="Schools" value={selectedPlanUsage.schoolCount} sub="Current latest subscriptions" />
            <StatCard label="Revenue" value={currencyFromCents(selectedPlanUsage.revenueCents)} sub="Estimated monthly total" />
            <StatCard
              label="Max Students"
              value={selectedPlanUsage.plan.max_students ?? "Unlimited"}
              sub={selectedPlanUsage.plan.max_teachers == null ? "Teachers unlimited" : `${selectedPlanUsage.plan.max_teachers} teachers`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel
              title="Plan Details"
              description="Adjust plan limits, price, billing cycle, and included features using the same simple editor."
              action={
                <Button type="button" variant="ghost" onClick={() => resetPlanForm()}>
                  Clear form
                </Button>
              }
            >
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
                    placeholder="leave blank for unlimited"
                  />
                </Field>
                <Field label="Max teachers">
                  <Input
                    value={planForm.max_teachers}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, max_teachers: event.target.value }))}
                    placeholder="leave blank for unlimited"
                  />
                </Field>
                <div className="lg:col-span-2">
                  <Field label="Included features">
                    <TextArea
                      rows={5}
                      value={planForm.featuresInput}
                      onChange={(event) => setPlanForm((prev) => ({ ...prev, featuresInput: event.target.value }))}
                      placeholder={"Lessons\nHomework\nMonthly Tests\nMessaging\nReports"}
                    />
                  </Field>
                </div>
                <div className="lg:col-span-2 flex flex-wrap gap-2">
                  <Button type="submit" disabled={busy}>
                    Save plan
                  </Button>
                  <Button type="button" variant="secondary" disabled={busy} onClick={() => togglePlan(selectedPlanUsage.plan)}>
                    {selectedPlanUsage.plan.is_active ? "Deactivate plan" : "Activate plan"}
                  </Button>
                </div>
              </form>
            </Panel>

            <Panel title="Schools on This Plan" description="Update the live subscription row for each school using this plan.">
              <div className="space-y-3">
                {selectedPlanUsage.schoolsOnPlan.length === 0 ? (
                  <EmptyState message="No schools are using this plan yet." />
                ) : (
                  selectedPlanUsage.schoolsOnPlan.map((subscription) => {
                    const school = schoolMap[subscription.school_id];
                    const draft = subscriptionDrafts[subscription.id];
                    return (
                      <div key={subscription.id} className="rounded-2xl border border-border bg-muted/25 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="font-semibold">{school?.name ?? "Unknown school"}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Status {subscription.status} / Starts {formatDate(subscription.starts_at)}
                            </p>
                          </div>
                          <Button type="button" variant="secondary" disabled={busy} onClick={() => void saveSubscription(subscription)}>
                            Save school subscription
                          </Button>
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-3">
                          <Field label="Plan">
                            <Select
                              value={draft?.plan_id ?? subscription.plan_id}
                              onChange={(event) => updateSubscriptionDraft(subscription.id, "plan_id", event.target.value)}
                            >
                              {data.plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {formatPlanLabel(plan.name)}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field label="Status">
                            <Select
                              value={draft?.status ?? subscription.status}
                              onChange={(event) => updateSubscriptionDraft(subscription.id, "status", event.target.value)}
                            >
                              <option value="trialing">trialing</option>
                              <option value="active">active</option>
                              <option value="past_due">past_due</option>
                              <option value="canceled">canceled</option>
                              <option value="suspended">suspended</option>
                            </Select>
                          </Field>
                          <Field label="Ends on">
                            <Input
                              type="date"
                              value={draft?.ends_at ?? ""}
                              onChange={(event) => updateSubscriptionDraft(subscription.id, "ends_at", event.target.value)}
                            />
                          </Field>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionTrail
          items={["Subscriptions"]}
          description="Keep the sidebar simple, then click one plan card to open a larger editing workspace for that plan."
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetPlanForm();
                setSelectedPlanId(null);
              }}
            >
              New plan
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-3">
          {planUsage.map((entry) => (
            <button
              key={entry.plan.id}
              type="button"
              onClick={() => {
                editPlan(entry.plan);
                setSelectedPlanId(entry.plan.id);
              }}
              className="rounded-[1.8rem] border border-border bg-card p-8 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-3xl font-bold">{formatPlanLabel(entry.plan.name)}</h3>
              <p className="mt-2 text-3xl font-bold text-primary">{currencyFromCents(entry.plan.price_cents)}</p>
              <p className="mt-1 text-sm text-muted-foreground">per {entry.plan.billing_cycle}</p>
              <p className="mt-4 text-sm text-muted-foreground">{entry.schoolCount} schools</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (topLevelView === "settings") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={selectedSetting ? ["Settings", titleCaseLabel(selectedSetting.key)] : ["Settings"]}
          description="Keep many platform settings manageable by opening one setting at a time in a wider editor."
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSelectedSettingKey(null);
                resetSettingForm();
              }}
            >
              New setting
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Saved Settings" description="Search and open any saved setting without stretching one long form down the page.">
            <div className="mb-4">
              <Field label="Search settings">
                <Input
                  value={settingsQuery}
                  onChange={(event) => setSettingsQuery(event.target.value)}
                  placeholder="Search by setting name or value"
                />
              </Field>
            </div>
            <div className="space-y-3">
              {settingsDirectory.length === 0 ? (
                <EmptyState message="No matching settings found." />
              ) : (
                settingsDirectory.map((setting) => (
                  <button
                    key={setting.key}
                    type="button"
                    onClick={() => {
                      loadSettingIntoForm(setting);
                      setSelectedSettingKey(setting.key);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:border-primary/30 hover:bg-card ${
                      selectedSettingKey === setting.key ? "border-primary/40 bg-card ring-2 ring-primary/10" : "border-border bg-muted/25"
                    }`}
                  >
                    <p className="font-semibold">{titleCaseLabel(setting.key)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{formatInlineValue(setting.value)}</p>
                  </button>
                ))
              )}
            </div>
          </Panel>

          <Panel
            title={selectedSetting ? "Edit Setting" : "Create Setting"}
            description="Use simple text, number, yes/no, list, or named values. This layout stays roomy even when you add many settings."
          >
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
                    rows={6}
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedSettingKey(null);
                      resetSettingForm();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </form>

            {selectedSetting ? (
              <div className="mt-6 rounded-2xl border border-border bg-muted/25 p-4">
                <p className="text-sm font-semibold">{titleCaseLabel(selectedSetting.key)}</p>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
                  {formatSettingValue(selectedSetting.value)}
                </pre>
              </div>
            ) : null}
          </Panel>
        </div>
      </div>
    );
  }

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
                        <p className="font-semibold">{formatPlanLabel(plan.name)}</p>
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
                      <p className="font-semibold">{formatPlanLabel(plan.name)}</p>
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
                          Started {formatDate(subscription.starts_at)} / Current plan {planMap[subscription.plan_id]?.name ? formatPlanLabel(planMap[subscription.plan_id]?.name) : "Unknown"}
                        </p>
                      </div>
                      <Field label="Plan">
                        <Select
                          value={draft.plan_id}
                          onChange={(event) => updateSubscriptionDraft(subscription.id, "plan_id", event.target.value)}
                        >
                          {data.plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {formatPlanLabel(plan.name)}
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
                    {formatPlanLabel(plan.name)}
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
                const planName = subscription ? formatPlanLabel(planMap[subscription.plan_id]?.name ?? "Unknown plan") : "No plan";
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
                    {formatPlanLabel(plan.name)}
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
                    <p className="font-semibold">{formatPlanLabel(plan.name)}</p>
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
  onChangeView,
}: {
  view: string;
  data: SchoolAdminData;
  profile: BasicProfile;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
  onChangeView: (nextView: string) => void;
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
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);
  const [teacherAssignmentForm, setTeacherAssignmentForm] = useState({
    subject_id: data.subjects[0]?.id ?? "",
    class_id: "",
  });
  const [studentEditForm, setStudentEditForm] = useState({
    class_id: data.classes[0]?.id ?? "",
    status: "active",
  });
  const [announcementEditForm, setAnnouncementEditForm] = useState({
    title: "",
    body: "",
  });

  const selectedTeacher = activeTeacherId ? data.teachers.find((teacher) => teacher.userId === activeTeacherId) ?? null : null;
  const selectedStudent = activeStudentId ? data.students.find((student) => student.userId === activeStudentId) ?? null : null;
  const selectedAnnouncement = activeAnnouncementId
    ? data.announcements.find((announcement) => announcement.item.id === activeAnnouncementId) ?? null
    : null;

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

function SchoolAdminPortalModern({
  view,
  data,
  profile,
  onNotify,
  onRefresh,
  onChangeView,
}: {
  view: string;
  data: SchoolAdminData;
  profile: BasicProfile;
  onNotify: (kind: "success" | "error" | "info", message: string) => void;
  onRefresh: () => Promise<void>;
  onChangeView: (nextView: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [academicSection, setAcademicSection] = useState<
    "working-days" | "time-slots" | "academic-years" | "grade-levels" | "classes" | "subjects"
  >("working-days");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [announcementQuery, setAnnouncementQuery] = useState("");
  const [showTeacherForm, setShowTeacherForm] = useState(data.teachers.length === 0);
  const [showStudentForm, setShowStudentForm] = useState(data.students.length === 0);
  const [showTimetableForm, setShowTimetableForm] = useState(data.timetable.length === 0);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(data.announcements.length === 0);
  const [selectedTimetableClassId, setSelectedTimetableClassId] = useState(data.classes[0]?.id ?? "");
  const [gradeClassFilter, setGradeClassFilter] = useState(data.classes[0]?.id ?? "");
  const [gradeSubjectFilter, setGradeSubjectFilter] = useState(data.subjects[0]?.id ?? "");
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
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);
  const [teacherAssignmentForm, setTeacherAssignmentForm] = useState({
    subject_id: data.subjects[0]?.id ?? "",
    class_id: "",
  });
  const [studentEditForm, setStudentEditForm] = useState<{
    class_id: string;
    status: StudentAcademicStatus;
  }>({
    class_id: data.classes[0]?.id ?? "",
    status: "active",
  });
  const [announcementEditForm, setAnnouncementEditForm] = useState({
    title: "",
    body: "",
  });

  const selectedTeacher = activeTeacherId ? data.teachers.find((teacher) => teacher.userId === activeTeacherId) ?? null : null;
  const selectedStudent = activeStudentId ? data.students.find((student) => student.userId === activeStudentId) ?? null : null;
  const selectedAnnouncement = activeAnnouncementId
    ? data.announcements.find((announcement) => announcement.item.id === activeAnnouncementId) ?? null
    : null;

  useEffect(() => {
    setDaySelection(data.workingDays.map((item) => item.day_of_week));
  }, [data.workingDays]);

  useEffect(() => {
    if (!selectedTimetableClassId && data.classes[0]?.id) {
      setSelectedTimetableClassId(data.classes[0].id);
    }
  }, [data.classes, selectedTimetableClassId]);

  useEffect(() => {
    if (!gradeClassFilter && data.classes[0]?.id) {
      setGradeClassFilter(data.classes[0].id);
    }
  }, [data.classes, gradeClassFilter]);

  useEffect(() => {
    if (!gradeSubjectFilter && data.subjects[0]?.id) {
      setGradeSubjectFilter(data.subjects[0].id);
    }
  }, [data.subjects, gradeSubjectFilter]);

  const classMap = byId(data.classes);
  const subjectMap = byId(data.subjects);
  const currentYear = data.academicYears.find((item) => item.is_current) ?? data.academicYears[0] ?? null;
  const currentYearId = currentYear?.id;
  const schoolSettings =
    data.school.settings && typeof data.school.settings === "object"
      ? (data.school.settings as Record<string, unknown>)
      : {};
  const schoolPhone = typeof schoolSettings.phone === "string" ? schoolSettings.phone : "";
  const schoolContactEmail = typeof schoolSettings.contact_email === "string" ? schoolSettings.contact_email : "";
  const schoolAddress = typeof schoolSettings.address === "string" ? schoolSettings.address : "";
  const workingDayLabels = data.workingDays.map((item) => item.label).join(", ");

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
        unwrap(await supabase.from("academic_years").update({ is_current: false }).eq("school_id", data.school.id));
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
      setShowTeacherForm(false);
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
      setShowStudentForm(false);
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
      setShowTimetableForm(false);
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
      setShowAnnouncementForm(false);
    }, "Announcement published and notifications queued.");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageForm.recipient_id) {
      onNotify("error", "Choose someone to message first.");
      return;
    }
    void runAction(async () => {
      await sendMessageToRecipient({
        schoolId: data.school.id,
        recipientId: messageForm.recipient_id,
        subject: messageForm.subject,
        body: messageForm.body,
      });
      setMessageForm((prev) => ({
        recipient_id: prev.recipient_id,
        subject: "",
        body: "",
      }));
    }, "Message sent.");
  };

  const openTeacherPopup = (teacher: SchoolAdminTeacher) => {
    setActiveTeacherId(teacher.userId);
    setTeacherAssignmentForm({
      subject_id: teacher.assignmentDetails[0]?.subject_id ?? data.subjects[0]?.id ?? "",
      class_id: "",
    });
  };

  const addTeacherAssignment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeacher) return;
    if (!teacherAssignmentForm.subject_id) {
      onNotify("error", "Choose a subject before saving the assignment.");
      return;
    }

    void runAction(async () => {
      unwrap(
        await supabase.from("teacher_subject_assignments").insert({
          school_id: data.school.id,
          teacher_id: selectedTeacher.userId,
          subject_id: teacherAssignmentForm.subject_id,
          class_id: teacherAssignmentForm.class_id || null,
        }),
      );
      setTeacherAssignmentForm((prev) => ({ ...prev, class_id: "" }));
    }, "Teacher assignment saved.");
  };

  const removeTeacherAssignment = (assignmentId: string) => {
    void runAction(async () => {
      unwrap(await supabase.from("teacher_subject_assignments").delete().eq("id", assignmentId));
    }, "Teacher assignment removed.");
  };

  const openStudentPopup = (student: SchoolAdminStudent) => {
    setActiveStudentId(student.userId);
    setStudentEditForm({
      class_id: student.classId ?? data.classes[0]?.id ?? "",
      status: student.status,
    });
  };

  const saveStudentPopup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;
    if (!studentEditForm.class_id) {
      onNotify("error", "Choose a class before saving this student.");
      return;
    }

    void runAction(async () => {
      const enrollmentPayload = {
        school_id: data.school.id,
        class_id: studentEditForm.class_id,
        student_id: selectedStudent.userId,
        status: studentEditForm.status as StudentAcademicStatus,
        status_changed_at: new Date().toISOString(),
      };

      if (selectedStudent.enrollmentId) {
        unwrap(
          await supabase.from("class_enrollments").update(enrollmentPayload).eq("id", selectedStudent.enrollmentId),
        );
      } else {
        unwrap(await supabase.from("class_enrollments").insert(enrollmentPayload));
      }

      setActiveStudentId(null);
    }, "Student details updated.");
  };

  const openAnnouncementPopup = (announcement: AnnouncementBundle) => {
    setActiveAnnouncementId(announcement.item.id);
    setAnnouncementEditForm({
      title: announcement.item.title,
      body: announcement.item.body,
    });
  };

  const saveAnnouncementPopup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAnnouncement) return;

    void runAction(async () => {
      unwrap(
        await supabase
          .from("announcements")
          .update({
            title: announcementEditForm.title,
            body: announcementEditForm.body,
          })
          .eq("id", selectedAnnouncement.item.id),
      );
      setActiveAnnouncementId(null);
    }, "Announcement updated.");
  };

  const filteredTeachers = data.teachers.filter((teacher) => {
    const haystack = [teacher.name, teacher.email ?? "", teacher.assignments.join(" ")].join(" ").toLowerCase();
    return haystack.includes(teacherQuery.trim().toLowerCase());
  });

  const filteredStudents = data.students.filter((student) => {
    const haystack = [
      student.name,
      student.email ?? "",
      student.className,
      student.status,
      student.parents.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(studentQuery.trim().toLowerCase());
  });

  const filteredAnnouncements = data.announcements.filter((announcement) => {
    const haystack = [
      announcement.item.title,
      announcement.item.body,
      announcement.audience,
      announcement.authorName,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(announcementQuery.trim().toLowerCase());
  });

  const classEnrollmentCounts = data.classes.map((item) => ({
    id: item.id,
    name: item.name,
    count: data.students.filter((student) => student.className === item.name).length,
  }));
  const maxEnrollmentCount = Math.max(...classEnrollmentCounts.map((item) => item.count), 1);

  const gradeRows = data.grades.filter((grade) => {
    const matchesClass = !gradeClassFilter || grade.class_id === gradeClassFilter;
    const matchesSubject = !gradeSubjectFilter || grade.subject_id === gradeSubjectFilter;
    return matchesClass && matchesSubject;
  });

  const dashboardCards = [
    {
      label: "Teachers",
      value: data.teachers.length,
      sub: `${data.subjects.length} subjects covered`,
      icon: <Users className="h-5 w-5" />,
      tone: "bg-violet-100 text-violet-700",
      view: "teachers",
    },
    {
      label: "Students",
      value: data.students.length,
      sub: `${unique(data.students.flatMap((student) => student.parents)).length} parents linked`,
      icon: <GraduationCap className="h-5 w-5" />,
      tone: "bg-sky-100 text-sky-700",
      view: "students",
    },
    {
      label: "Subjects",
      value: data.subjects.length,
      sub: `${data.gradeLevels.length} grade levels`,
      icon: <BookOpen className="h-5 w-5" />,
      tone: "bg-emerald-100 text-emerald-700",
      view: "academic",
    },
    {
      label: "Classes",
      value: data.classes.length,
      sub: currentYear?.name ?? "Set current year",
      icon: <Calendar className="h-5 w-5" />,
      tone: "bg-amber-100 text-amber-700",
      view: "timetable",
    },
  ] as const;

  const announcementPopup = selectedAnnouncement ? (
    <PopupModal
      open={!!selectedAnnouncement}
      onClose={() => setActiveAnnouncementId(null)}
      title={selectedAnnouncement.item.title}
      description="Open the announcement in a larger workspace, review the audience, and update the message copy."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-[1.7rem] bg-muted/30 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{selectedAnnouncement.audience}</Badge>
              <Badge tone={selectedAnnouncement.item.is_published ? "success" : "warning"}>
                {selectedAnnouncement.item.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-card px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Author</p>
                <p className="mt-2 text-base font-bold text-foreground">{selectedAnnouncement.authorName}</p>
              </div>
              <div className="rounded-2xl bg-card px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Published</p>
                <p className="mt-2 text-base font-bold text-foreground">
                  {formatDateTime(selectedAnnouncement.item.published_at || selectedAnnouncement.item.created_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.7rem] bg-muted/20 p-5">
            <h4 className="text-lg font-bold text-foreground">Audience</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              The target is shown here for context. This popup focuses on the announcement content itself.
            </p>
            <div className="mt-4 rounded-2xl bg-card px-4 py-4">
              <p className="font-semibold text-foreground">{selectedAnnouncement.audience}</p>
            </div>
          </div>
        </div>

        <Panel title="Edit Announcement" description="Adjust the title or body and save from this popup.">
          <form className="grid gap-4" onSubmit={saveAnnouncementPopup}>
            <Field label="Title">
              <Input
                value={announcementEditForm.title}
                onChange={(event) => setAnnouncementEditForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </Field>
            <Field label="Body">
              <TextArea
                rows={8}
                value={announcementEditForm.body}
                onChange={(event) => setAnnouncementEditForm((prev) => ({ ...prev, body: event.target.value }))}
                required
              />
            </Field>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setActiveAnnouncementId(null)}>
                Close
              </Button>
              <Button type="submit" disabled={busy}>
                Save Announcement
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </PopupModal>
  ) : null;

  if (view === "settings") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "School Settings"]}
          description={`Review the details your team uses across ${data.school.name}.`}
        />
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            title="School Information"
            description="These details are shown across the workspace. Editing can be unlocked in a secure flow next."
            action={<Badge tone="warning">View only</Badge>}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="School name">
                <Input value={data.school.name} readOnly />
              </Field>
              <Field label="Timezone">
                <Input value={data.school.timezone} readOnly />
              </Field>
              <Field label="Slug">
                <Input value={data.school.slug} readOnly />
              </Field>
              <Field label="Status">
                <Input value={data.school.is_active ? "Active" : "Inactive"} readOnly />
              </Field>
              <Field label="Phone">
                <Input value={schoolPhone} placeholder="Not added yet" readOnly />
              </Field>
              <Field label="Email">
                <Input value={schoolContactEmail} placeholder="Not added yet" readOnly />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address">
                  <Input value={schoolAddress} placeholder="Not added yet" readOnly />
                </Field>
              </div>
            </div>
          </Panel>

          <Panel title="School Snapshot" description="A calm, quick summary for daily admin work.">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current year</p>
                <p className="mt-2 text-lg font-bold text-foreground">{currentYear?.name ?? "Not set yet"}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
                <p className="mt-2 text-lg font-bold text-foreground">{titleCaseLabel(data.subscription?.status ?? "unknown")}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Working days</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{workingDayLabels || "Not configured yet"}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last activity</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(data.usageStat?.last_activity_at)}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  if (view === "academic") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Academic Setup"]}
          description="Open one setup area at a time so schedules, grades, classes, and subjects stay easy to manage."
        />
        <div className="flex flex-wrap gap-2">
          {[
            ["working-days", "Working Days"],
            ["time-slots", "Time Slots"],
            ["academic-years", "Academic Year"],
            ["grade-levels", "Grades"],
            ["classes", "Classes"],
            ["subjects", "Subjects"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                setAcademicSection(
                  id as "working-days" | "time-slots" | "academic-years" | "grade-levels" | "classes" | "subjects",
                )
              }
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                academicSection === id
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {academicSection === "working-days" ? (
          <Panel title="Configure Working Days" description="Choose which days the school uses for teaching.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setDaySelection((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]))
                  }
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    daySelection.includes(day)
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {dayLabel(day)}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <Button type="button" onClick={saveWorkingDays} disabled={busy}>
                Save Working Days
              </Button>
            </div>
          </Panel>
        ) : null}

        {academicSection === "time-slots" ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Add Time Slot" description="Build the daily teaching rhythm in order.">
              <form className="grid gap-4" onSubmit={createTimeSlot}>
                <Field label="Label">
                  <Input value={slotForm.label} onChange={(event) => setSlotForm((prev) => ({ ...prev, label: event.target.value }))} required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
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
                <Button type="submit" disabled={busy}>
                  Add Time Slot
                </Button>
              </form>
            </Panel>
            <Panel title="Current Time Slots">
              <div className="space-y-3">
                {data.timeSlots.length === 0 ? (
                  <EmptyState message="No time slots yet." />
                ) : (
                  data.timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between rounded-2xl bg-muted/30 px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{slot.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                        </p>
                      </div>
                      <Badge>#{slot.sort_order}</Badge>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        ) : null}

        {academicSection === "academic-years" ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Add Academic Year" description="Keep one year marked as current for the whole school.">
              <form className="grid gap-4" onSubmit={createAcademicYear}>
                <Field label="Name">
                  <Input value={yearForm.name} onChange={(event) => setYearForm((prev) => ({ ...prev, name: event.target.value }))} required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start date">
                    <Input type="date" value={yearForm.start_date} onChange={(event) => setYearForm((prev) => ({ ...prev, start_date: event.target.value }))} required />
                  </Field>
                  <Field label="End date">
                    <Input type="date" value={yearForm.end_date} onChange={(event) => setYearForm((prev) => ({ ...prev, end_date: event.target.value }))} required />
                  </Field>
                </div>
                <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <input type="checkbox" checked={yearForm.is_current} onChange={(event) => setYearForm((prev) => ({ ...prev, is_current: event.target.checked }))} />
                  Set this as the current year
                </label>
                <Button type="submit" disabled={busy}>
                  Create Academic Year
                </Button>
              </form>
            </Panel>
            <Panel title="Academic Year List">
              <div className="space-y-3">
                {data.academicYears.length === 0 ? (
                  <EmptyState message="No academic years yet." />
                ) : (
                  data.academicYears.map((year) => (
                    <div key={year.id} className="rounded-2xl bg-muted/30 p-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{year.name}</p>
                        {year.is_current ? <Badge tone="success">Current</Badge> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(year.start_date)} - {formatDate(year.end_date)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        ) : null}

        {academicSection === "grade-levels" ? (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Add Grade Level">
              <form className="grid gap-4" onSubmit={createGrade}>
                <Field label="Grade name">
                  <Input value={gradeForm.name} onChange={(event) => setGradeForm((prev) => ({ ...prev, name: event.target.value }))} required />
                </Field>
                <Field label="Sort order">
                  <Input type="number" value={gradeForm.sort_order} onChange={(event) => setGradeForm((prev) => ({ ...prev, sort_order: event.target.value }))} />
                </Field>
                <Button type="submit" disabled={busy}>
                  Add Grade
                </Button>
              </form>
            </Panel>
            <Panel title="Grade Levels">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.gradeLevels.length === 0 ? (
                  <EmptyState message="No grade levels yet." />
                ) : (
                  data.gradeLevels.map((grade) => (
                    <div key={grade.id} className="rounded-2xl bg-muted/30 p-4">
                      <p className="font-semibold text-foreground">{grade.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Order {grade.sort_order}</p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        ) : null}

        {academicSection === "classes" ? (
          <div className="space-y-6">
            <Panel title="Create Class" description="Pair each class with a grade level and academic year.">
              <form className="grid gap-4 lg:grid-cols-4" onSubmit={createClass}>
                <Field label="Class name">
                  <Input value={classForm.name} onChange={(event) => setClassForm((prev) => ({ ...prev, name: event.target.value }))} required />
                </Field>
                <Field label="Grade level">
                  <Select value={classForm.grade_level_id} onChange={(event) => setClassForm((prev) => ({ ...prev, grade_level_id: event.target.value }))}>
                    {data.gradeLevels.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Academic year">
                  <Select value={classForm.academic_year_id} onChange={(event) => setClassForm((prev) => ({ ...prev, academic_year_id: event.target.value }))}>
                    {data.academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex items-end">
                  <Button type="submit" disabled={busy || !data.gradeLevels.length || !data.academicYears.length} className="w-full">
                    Create Class
                  </Button>
                </div>
              </form>
            </Panel>
            <Panel title="Class Directory">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.classes.length === 0 ? (
                  <EmptyState message="No classes yet." />
                ) : (
                  data.classes.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-muted/30 p-4">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.gradeLevels.find((grade) => grade.id === item.grade_level_id)?.name ?? "Unknown grade"} / {data.academicYears.find((year) => year.id === item.academic_year_id)?.name ?? "Unknown year"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        ) : null}

        {academicSection === "subjects" ? (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Add Subject">
              <form className="grid gap-4" onSubmit={createSubject}>
                <Field label="Subject name">
                  <Input value={subjectForm.name} onChange={(event) => setSubjectForm((prev) => ({ ...prev, name: event.target.value }))} required />
                </Field>
                <Field label="Code">
                  <Input value={subjectForm.code} onChange={(event) => setSubjectForm((prev) => ({ ...prev, code: event.target.value }))} />
                </Field>
                <Button type="submit" disabled={busy}>
                  Add Subject
                </Button>
              </form>
            </Panel>
            <Panel title="Subject List">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.subjects.length === 0 ? (
                  <EmptyState message="No subjects yet." />
                ) : (
                  data.subjects.map((subject) => (
                    <div key={subject.id} className="rounded-2xl bg-muted/30 p-4">
                      <p className="font-semibold text-foreground">{subject.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{subject.code || "No code yet"}</p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    );
  }

  if (view === "teachers") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Teachers"]}
          description="Keep the teaching team organized with a calmer workspace and more room for assignments."
          action={
            <Button type="button" onClick={() => setShowTeacherForm((prev) => !prev)}>
              <UserPlus className="h-4 w-4" />
              {showTeacherForm ? "Hide form" : "Add Teacher"}
            </Button>
          }
        />
        {showTeacherForm ? (
          <Panel title="Invite Teacher" description="Invite a teacher and connect them to a subject and class.">
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
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Class">
                <Select value={teacherForm.class_id} onChange={(event) => setTeacherForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                  {data.classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="lg:col-span-4">
                <Button type="submit" disabled={busy}>
                  Invite Teacher
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}
        <Panel title="Teaching Team" description="Search by name, email, or assignment.">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search teachers..." value={teacherQuery} onChange={(event) => setTeacherQuery(event.target.value)} />
            </div>
            <Badge>{filteredTeachers.length} teachers</Badge>
          </div>
          {filteredTeachers.length === 0 ? (
            <EmptyState message="No teachers match this search yet." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="hidden grid-cols-[1.4fr_1.1fr_0.7fr_0.7fr] gap-4 border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
                <p>Teacher</p>
                <p>Assignments</p>
                <p>Status</p>
                <p>Open</p>
              </div>
              <div className="divide-y divide-border">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher.userId} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.4fr_1.1fr_0.7fr_0.7fr] lg:items-center">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarTone(teacher.userId)}`}>
                        {initialsFor(teacher.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.assignments.length === 0 ? <Badge>No assignments yet</Badge> : teacher.assignments.map((assignment) => <Badge key={assignment}>{assignment}</Badge>)}
                    </div>
                    <div>
                      <Badge tone="success">Active</Badge>
                    </div>
                    <div>
                      <Button type="button" variant="secondary" onClick={() => openTeacherPopup(teacher)}>
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
        {selectedTeacher ? (
          <PopupModal
            open={!!selectedTeacher}
            onClose={() => setActiveTeacherId(null)}
            title={selectedTeacher.name}
            description="View this teacher and update teaching assignments without leaving the dashboard."
          >
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[1.7rem] bg-muted/30 p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full text-base font-bold ${avatarTone(selectedTeacher.userId)}`}>
                    {initialsFor(selectedTeacher.name)}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{selectedTeacher.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.email || "No email added yet"}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-card px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assignments</p>
                    <p className="mt-2 text-lg font-bold text-foreground">{selectedTeacher.assignmentDetails.length}</p>
                  </div>
                  <div className="rounded-2xl bg-card px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile editing</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Name and email stay view-only here so school admins do not overwrite a teacher&apos;s own profile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.7rem] bg-muted/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Current assignments</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Remove or review one assignment at a time.</p>
                  </div>
                  <Badge>{selectedTeacher.assignmentDetails.length} items</Badge>
                </div>
                {selectedTeacher.assignmentDetails.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState message="This teacher does not have any assignments yet." />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selectedTeacher.assignmentDetails.map((assignment) => (
                      <div key={assignment.id} className="flex flex-col gap-3 rounded-2xl bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{assignment.subjectName}</p>
                          <p className="text-sm text-muted-foreground">{assignment.className}</p>
                        </div>
                        <Button type="button" variant="danger" onClick={() => removeTeacherAssignment(assignment.id)} disabled={busy}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Panel title="Add Assignment" description="Attach another subject or class from this popup.">
              <form className="grid gap-4 lg:grid-cols-3" onSubmit={addTeacherAssignment}>
                <Field label="Subject">
                  <Select
                    value={teacherAssignmentForm.subject_id}
                    onChange={(event) => setTeacherAssignmentForm((prev) => ({ ...prev, subject_id: event.target.value }))}
                  >
                    {data.subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Class">
                  <Select
                    value={teacherAssignmentForm.class_id}
                    onChange={(event) => setTeacherAssignmentForm((prev) => ({ ...prev, class_id: event.target.value }))}
                  >
                    <option value="">All classes</option>
                    {data.classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex items-end">
                  <Button type="submit" disabled={busy || !data.subjects.length} className="w-full">
                    Save Assignment
                  </Button>
                </div>
              </form>
            </Panel>
          </PopupModal>
        ) : null}
      </div>
    );
  }

  if (view === "students") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Students"]}
          description="Keep enrollment, parent links, and exports in one cleaner workspace."
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void downloadExport("students", data.school.id)}>
                <Download className="h-4 w-4" />
                Export Students
              </Button>
              <Button type="button" onClick={() => setShowStudentForm((prev) => !prev)}>
                <UserPlus className="h-4 w-4" />
                {showStudentForm ? "Hide form" : "Add Student"}
              </Button>
            </div>
          }
        />
        {showStudentForm ? (
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
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
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
                <Button type="submit" disabled={busy || !studentForm.class_id}>
                  Invite Student
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}
        <Panel
          title="Student Directory"
          description="Search by student, class, parent, or status."
          action={
            <Button type="button" variant="secondary" onClick={() => void downloadExport("final_grades", data.school.id, currentYearId)}>
              <Download className="h-4 w-4" />
              Export Grades
            </Button>
          }
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search students..." value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} />
            </div>
            <Badge>{filteredStudents.length} students</Badge>
          </div>
          {filteredStudents.length === 0 ? (
            <EmptyState message="No students match this search yet." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="hidden grid-cols-[1.35fr_0.75fr_0.95fr_0.7fr_0.7fr] gap-4 border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
                <p>Student</p>
                <p>Class</p>
                <p>Parent</p>
                <p>Status</p>
                <p>Open</p>
              </div>
              <div className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <div key={student.userId} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.35fr_0.75fr_0.95fr_0.7fr_0.7fr] lg:items-center">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarTone(student.userId)}`}>
                        {initialsFor(student.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email || "No email"}</p>
                      </div>
                    </div>
                    <div>
                      <Badge>{student.className}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{student.parents.length > 0 ? student.parents.join(", ") : "Not linked yet"}</div>
                    <div>
                      <Badge tone={student.status === "active" ? "success" : "warning"}>{titleCaseLabel(student.status)}</Badge>
                    </div>
                    <div>
                      <Button type="button" variant="secondary" onClick={() => openStudentPopup(student)}>
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
        {selectedStudent ? (
          <PopupModal
            open={!!selectedStudent}
            onClose={() => setActiveStudentId(null)}
            title={selectedStudent.name}
            description="Open a fuller student view, confirm parent links, and update enrollment without leaving the list."
          >
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4">
                <div className="rounded-[1.7rem] bg-muted/30 p-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full text-base font-bold ${avatarTone(selectedStudent.userId)}`}>
                      {initialsFor(selectedStudent.name)}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{selectedStudent.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.email || "No email added yet"}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current class</p>
                      <p className="mt-2 text-base font-bold text-foreground">{selectedStudent.className}</p>
                    </div>
                    <div className="rounded-2xl bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Academic status</p>
                      <p className="mt-2 text-base font-bold text-foreground">{titleCaseLabel(selectedStudent.status)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.7rem] bg-muted/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Parent contacts</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Review linked contacts before reaching out.</p>
                    </div>
                    <Badge>{selectedStudent.parentDetails.length} linked</Badge>
                  </div>
                  {selectedStudent.parentDetails.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState message="No parent has been linked to this student yet." />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {selectedStudent.parentDetails.map((parent) => (
                        <div key={`${parent.userId}-${parent.relationship}`} className="rounded-2xl bg-card px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{parent.name}</p>
                            <Badge>{titleCaseLabel(parent.relationship)}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{parent.email || "No email added yet"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Panel title="Update Enrollment" description="Move the student, change their academic status, then save from here.">
                <form className="grid gap-4" onSubmit={saveStudentPopup}>
                  <Field label="Class">
                    <Select
                      value={studentEditForm.class_id}
                      onChange={(event) => setStudentEditForm((prev) => ({ ...prev, class_id: event.target.value }))}
                    >
                      {data.classes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Academic status">
                    <Select
                      value={studentEditForm.status}
                      onChange={(event) => setStudentEditForm((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="graduated">Graduated</option>
                      <option value="transferred">Transferred</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </Field>
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setActiveStudentId(null)}>
                      Close
                    </Button>
                    <Button type="submit" disabled={busy || !studentEditForm.class_id}>
                      Save Student
                    </Button>
                  </div>
                </form>
              </Panel>
            </div>
          </PopupModal>
        ) : null}
      </div>
    );
  }

  if (view === "timetable") {
    const timetableEntries = data.timetable.filter((entry) => !selectedTimetableClassId || entry.class_id === selectedTimetableClassId);

    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Timetable"]}
          description="Work on one class at a time so the schedule stays readable even as it grows."
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setShowTimetableForm((prev) => !prev)}>
                <Plus className="h-4 w-4" />
                {showTimetableForm ? "Hide form" : "Add Entry"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => onNotify("info", "Auto-generation can be added next. The timetable layout is ready for it.")}>
                <Sparkles className="h-4 w-4" />
                Auto Generate
              </Button>
            </div>
          }
        />
        {showTimetableForm ? (
          <Panel title="Add Timetable Entry" description="Assign one lesson block to a class, day, and time.">
            <form className="grid gap-4 lg:grid-cols-3" onSubmit={createTimetable}>
              <Field label="Academic year">
                <Select value={timetableForm.academic_year_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, academic_year_id: event.target.value }))}>
                  {data.academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Working day">
                <Select value={timetableForm.working_day_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, working_day_id: event.target.value }))}>
                  {data.workingDays.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Time slot">
                <Select value={timetableForm.time_slot_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, time_slot_id: event.target.value }))}>
                  {data.timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Class">
                <Select value={timetableForm.class_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, class_id: event.target.value }))}>
                  {data.classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Subject">
                <Select value={timetableForm.subject_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, subject_id: event.target.value }))}>
                  {data.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Teacher">
                <Select value={timetableForm.teacher_id} onChange={(event) => setTimetableForm((prev) => ({ ...prev, teacher_id: event.target.value }))}>
                  {data.teachers.map((teacher) => (
                    <option key={teacher.userId} value={teacher.userId}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="lg:col-span-3">
                <Button type="submit" disabled={busy || !data.classes.length || !data.subjects.length || !data.teachers.length || !data.timeSlots.length || !data.workingDays.length}>
                  Save Timetable Entry
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}
        <Panel title="Weekly Timetable" description="Review one class at a time in a roomier layout.">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedTimetableClassId} onChange={(event) => setSelectedTimetableClassId(event.target.value)} className="min-w-[180px]">
                {data.classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
              {currentYear ? <Badge tone="success">{currentYear.name}</Badge> : null}
            </div>
            <Button type="button" variant="secondary" onClick={() => onNotify("info", "Publishing can be added when you want to share the timetable outside admin view.")}>
              Publish Timetable
            </Button>
          </div>
          {!data.classes.length || !data.timeSlots.length || !data.workingDays.length ? (
            <EmptyState message="Add classes, time slots, and working days first to build the timetable." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full border-collapse">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</th>
                    {data.workingDays.map((day) => (
                      <th key={day.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.timeSlots.map((slot) => (
                    <tr key={slot.id} className="border-t border-border">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-foreground">{slot.label}</td>
                      {data.workingDays.map((day) => {
                        const entry = timetableEntries.find((item) => item.time_slot_id === slot.id && item.working_day_id === day.id);
                        return (
                          <td key={day.id} className="px-4 py-4 align-top">
                            {entry ? (
                              <div className="rounded-2xl bg-secondary px-3 py-3 text-sm">
                                <p className="font-semibold text-primary">{subjectMap[entry.subject_id]?.name ?? "Subject"}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{data.teachers.find((teacher) => teacher.userId === entry.teacher_id)?.name ?? "Teacher"}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    );
  }

  if (view === "grades") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Final Grades"]}
          description="Filter by class and subject so grade review stays roomy even when records grow."
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => onNotify("info", "CSV upload can be added next. The review table is ready for it.")}>
                Upload CSV
              </Button>
              <Button type="button" variant="secondary" onClick={() => void downloadExport("final_grades", data.school.id, currentYearId)}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          }
        />
        <Panel title="Final Grade Register" description="Use the filters to focus on one class or subject at a time.">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select value={gradeClassFilter} onChange={(event) => setGradeClassFilter(event.target.value)} className="max-w-[220px]">
              {data.classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select value={gradeSubjectFilter} onChange={(event) => setGradeSubjectFilter(event.target.value)} className="max-w-[220px]">
              {data.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </div>
          {gradeRows.length === 0 ? (
            <EmptyState message="No final grades match these filters yet." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="hidden grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_0.7fr_0.9fr] gap-4 border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
                <p>Student</p>
                <p>Class</p>
                <p>Subject</p>
                <p>Score</p>
                <p>Letter</p>
                <p>Status</p>
              </div>
              <div className="divide-y divide-border">
                {gradeRows.map((grade) => {
                  const student = data.students.find((item) => item.userId === grade.student_id);
                  return (
                    <div key={grade.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_0.7fr_0.9fr] lg:items-center">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarTone(grade.student_id)}`}>
                          {initialsFor(student?.name ?? "Student")}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{student?.name ?? "Unknown student"}</p>
                          <p className="text-sm text-muted-foreground">{student?.email || "No email"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{classMap[grade.class_id]?.name ?? "Unknown class"}</p>
                      <p className="text-sm text-foreground">{subjectMap[grade.subject_id]?.name ?? "Unknown subject"}</p>
                      <p className="text-sm font-semibold text-foreground">{grade.grade_value ?? "-"}</p>
                      <p className="text-sm font-semibold text-foreground">{grade.grade_letter || "-"}</p>
                      <div>
                        <Badge tone={grade.status === "approved" ? "success" : "warning"}>{titleCaseLabel(grade.status)}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
      </div>
    );
  }

  if (view === "announcements") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Announcements"]}
          description="Share updates without crowding the page. Open the writer only when you need it."
          action={
            <Button type="button" onClick={() => setShowAnnouncementForm((prev) => !prev)}>
              <Plus className="h-4 w-4" />
              {showAnnouncementForm ? "Hide form" : "New Announcement"}
            </Button>
          }
        />
        {showAnnouncementForm ? (
          <Panel title="Publish Announcement" description="Share an update with the whole school, one role, or one class.">
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
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
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
                <Button type="submit" disabled={busy}>
                  <Megaphone className="h-4 w-4" />
                  Publish Announcement
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}
        <Panel title="Announcement Feed" description="Search published updates by title, audience, or content.">
          <div className="mb-4 relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search announcements..." value={announcementQuery} onChange={(event) => setAnnouncementQuery(event.target.value)} />
          </div>
          <div className="space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <EmptyState message="No announcements match this search yet." />
            ) : (
              filteredAnnouncements.map((announcement) => (
                <button
                  key={announcement.item.id}
                  type="button"
                  onClick={() => openAnnouncementPopup(announcement)}
                  className="block w-full rounded-[1.6rem] border border-border bg-card px-5 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{announcement.audience}</Badge>
                      <p className="text-sm text-muted-foreground">{formatDate(announcement.item.published_at || announcement.item.created_at)}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">Open</span>
                  </div>
                  <p className="mt-3 text-xl font-bold text-foreground">{announcement.item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{announcement.item.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">By {announcement.authorName}</p>
                </button>
              ))
            )}
          </div>
        </Panel>
        {announcementPopup}
      </div>
    );
  }

  if (view === "messages") {
    return (
      <div className="space-y-6">
        <SectionTrail
          items={["School Admin", "Messages"]}
          description="Keep each chat in one smooth thread with more space for reading, replying, and scrolling."
        />
        <MessageChatWorkspace
          currentUserId={profile.id}
          recipientLabel="recipient"
          recipientId={messageForm.recipient_id}
          subject={messageForm.subject}
          body={messageForm.body}
          setRecipientId={(value) => setMessageForm((prev) => ({ ...prev, recipient_id: value }))}
          setSubject={(value) => setMessageForm((prev) => ({ ...prev, subject: value }))}
          setBody={(value) => setMessageForm((prev) => ({ ...prev, body: value }))}
          recipientOptions={data.recipientOptions}
          messages={data.messages}
          busy={busy}
          onSend={sendMessage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTrail items={["School Admin", data.school.name, "Dashboard"]} description="A smoother home view with quick paths into the parts you use most." action={currentYear ? <Badge tone="success">{currentYear.name}</Badge> : undefined} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <button key={card.label} type="button" onClick={() => onChangeView(card.view)} className="text-left">
            <div className="rounded-[1.8rem] border border-border bg-card px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}>{card.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{card.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.sub}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Student Enrollment by Class" description="A quick visual read on how classes are filling up.">
          {classEnrollmentCounts.length === 0 ? (
            <EmptyState message="Add classes and students to see enrollment here." />
          ) : (
            <div className="rounded-[1.8rem] bg-muted/20 p-5">
              <div className="flex h-72 items-end gap-4">
                {classEnrollmentCounts.map((item) => {
                  const height = Math.max((item.count / maxEnrollmentCount) * 100, item.count === 0 ? 8 : 18);
                  return (
                    <div key={item.id} className="flex flex-1 flex-col items-center gap-3">
                      <span className="text-sm font-semibold text-muted-foreground">{item.count}</span>
                      <div className="flex h-56 w-full items-end rounded-2xl bg-white/60 p-2">
                        <div className="w-full rounded-2xl bg-primary/80" style={{ height: `${height}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
        <Panel title="Recent Announcements" description="See the latest school-wide messages without leaving the dashboard.">
          <div className="space-y-3">
            {data.announcements.slice(0, 4).length === 0 ? (
              <EmptyState message="No announcements have been published yet." />
            ) : (
              data.announcements.slice(0, 4).map((announcement) => (
                <button
                  key={announcement.item.id}
                  type="button"
                  onClick={() => openAnnouncementPopup(announcement)}
                  className="block w-full rounded-2xl bg-secondary/35 px-4 py-4 text-left transition hover:bg-secondary/55"
                >
                  <div className="flex items-center gap-2">
                    <Badge>{announcement.audience}</Badge>
                    <p className="text-xs text-muted-foreground">{formatDate(announcement.item.published_at || announcement.item.created_at)}</p>
                  </div>
                  <p className="mt-3 font-semibold text-foreground">{announcement.item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{announcement.item.body}</p>
                </button>
              ))
            )}
          </div>
        </Panel>
      </div>
      {announcementPopup}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="School Snapshot" description="Plan, status, timezone, and recent activity in one place.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subscription</p>
              <p className="mt-2 text-lg font-bold text-foreground">{titleCaseLabel(data.subscription?.status ?? "unknown")}</p>
            </div>
            <div className="rounded-2xl bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timezone</p>
              <p className="mt-2 text-lg font-bold text-foreground">{data.school.timezone}</p>
            </div>
            <div className="rounded-2xl bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</p>
              <p className="mt-2 text-lg font-bold text-foreground">{data.school.slug}</p>
            </div>
            <div className="rounded-2xl bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last activity</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(data.usageStat?.last_activity_at)}</p>
            </div>
          </div>
        </Panel>
        <Panel title="Quick Setup" description="Jump straight into the places that usually need daily attention.">
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => onChangeView("academic")} className="rounded-2xl border border-border bg-muted/20 p-4 text-left transition hover:border-primary/30 hover:bg-muted/30">
              <p className="font-semibold text-foreground">Academic Setup</p>
              <p className="mt-1 text-sm text-muted-foreground">Working days, time slots, grade levels, classes, and subjects.</p>
            </button>
            <button type="button" onClick={() => onChangeView("messages")} className="rounded-2xl border border-border bg-muted/20 p-4 text-left transition hover:border-primary/30 hover:bg-muted/30">
              <p className="font-semibold text-foreground">Messages</p>
              <p className="mt-1 text-sm text-muted-foreground">Open the larger conversation view when your inbox gets busy.</p>
            </button>
            <button type="button" onClick={() => onChangeView("announcements")} className="rounded-2xl border border-border bg-muted/20 p-4 text-left transition hover:border-primary/30 hover:bg-muted/30">
              <p className="font-semibold text-foreground">Announcements</p>
              <p className="mt-1 text-sm text-muted-foreground">Publish updates for the whole school or one audience.</p>
            </button>
            <button type="button" onClick={() => onChangeView("settings")} className="rounded-2xl border border-border bg-muted/20 p-4 text-left transition hover:border-primary/30 hover:bg-muted/30">
              <p className="font-semibold text-foreground">School Settings</p>
              <p className="mt-1 text-sm text-muted-foreground">Review school details and current setup in one calmer page.</p>
            </button>
          </div>
        </Panel>
      </div>
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
        <SectionTrail
          items={["Teacher", "Messages"]}
          description="Keep each conversation in one thread so you can continue replying without losing context."
        />
        <MessageChatWorkspace
          currentUserId={profile.id}
          recipientLabel="recipient"
          recipientId={messageForm.recipient_id}
          subject={messageForm.subject}
          body={messageForm.body}
          setRecipientId={(value) => setMessageForm((prev) => ({ ...prev, recipient_id: value }))}
          setSubject={(value) => setMessageForm((prev) => ({ ...prev, subject: value }))}
          setBody={(value) => setMessageForm((prev) => ({ ...prev, body: value }))}
          recipientOptions={data.recipientOptions}
          messages={data.messages}
          busy={busy}
          onSend={sendMessage}
        />
      </div>
    );
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
        <SectionTrail
          items={["Student", "Messages"]}
          description="Keep speaking in the same thread so teacher replies and your follow-ups stay together."
        />
        <MessageChatWorkspace
          currentUserId={profile.id}
          recipientLabel="teacher"
          recipientId={messageForm.recipient_id}
          subject={messageForm.subject}
          body={messageForm.body}
          setRecipientId={(value) => setMessageForm((prev) => ({ ...prev, recipient_id: value }))}
          setSubject={(value) => setMessageForm((prev) => ({ ...prev, subject: value }))}
          setBody={(value) => setMessageForm((prev) => ({ ...prev, body: value }))}
          recipientOptions={data.recipientOptions}
          messages={data.messages}
          busy={busy}
          onSend={sendMessage}
        />
      </div>
    );
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
        <SectionTrail
          items={["Parent", "Messages"]}
          description="Keep one clear thread with the school team so updates and replies stay easy to follow."
        />
        <MessageChatWorkspace
          currentUserId={profile.id}
          recipientLabel="teacher"
          recipientId={messageForm.recipient_id}
          subject={messageForm.subject}
          body={messageForm.body}
          setRecipientId={(value) => setMessageForm((prev) => ({ ...prev, recipient_id: value }))}
          setSubject={(value) => setMessageForm((prev) => ({ ...prev, subject: value }))}
          setBody={(value) => setMessageForm((prev) => ({ ...prev, body: value }))}
          recipientOptions={data.recipientOptions}
          messages={data.messages}
          busy={busy}
          onSend={sendMessage}
        />
      </div>
    );
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
  const [pathname, setPathname] = useState(getInitialPath);
  const [bootLoading, setBootLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceKey, setWorkspaceKey] = useState<string | null>(null);
  const [workspaceOverride, setWorkspaceOverride] = useState<Workspace | null>(null);
  const [data, setData] = useState<LoadedWorkspaceData | null>(null);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [flash, setFlash] = useState<FlashState>(null);
  const [error, setError] = useState<string | null>(null);

  const navigateTo = (nextPath: string, replace = false) => {
    const normalized = normalizePath(nextPath);
    if (typeof window !== "undefined" && normalizePath(window.location.pathname) !== normalized) {
      window.history[replace ? "replaceState" : "pushState"]({}, "", normalized);
    }
    setPathname(normalized);
  };

  const navigateToView = (nextView: string, replace = false) => {
    setView(nextView);
    navigateTo(buildViewPath(nextView), replace);
  };

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
    const syncPath = () => setPathname(getInitialPath());
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

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
  const navItems = selectedWorkspace ? NAV_BY_ROLE[selectedWorkspace.role] : [];

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
    void refreshWorkspaceData();
  }, [selectedWorkspace?.key, session?.user?.id, workspaceOverride]);

  useEffect(() => {
    if (bootLoading) {
      return;
    }

    if (!session) {
      if (!isPublicPath(pathname)) {
        navigateTo("/login", true);
      }
      return;
    }

    if (!selectedWorkspace) {
      return;
    }

    const requestedView = getViewFromPath(pathname);
    const allowedView = navItems.find((item) => item.id === requestedView)?.id ?? DEFAULT_VIEW;

    if (view !== allowedView) {
      setView(allowedView);
    }

    const expectedPath = buildViewPath(allowedView);
    if (normalizePath(pathname) !== expectedPath) {
      navigateTo(expectedPath, true);
    }
  }, [bootLoading, navItems, pathname, selectedWorkspace, session, view]);

  const notify = (kind: "success" | "error" | "info", message: string) => {
    setFlash({ kind, message });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setData(null);
    setWorkspaces([]);
    setWorkspaceKey(null);
    setWorkspaceOverride(null);
    navigateTo("/login", true);
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
    if (pathname === "/") {
      return <LandingPage onLogin={() => navigateTo("/login")} onSignup={() => navigateTo("/signup")} />;
    }

    return (
      <AuthScreen
        mode={getAuthModeFromPath(pathname)}
        loading={membershipLoading || dataLoading}
        onNotify={notify}
        onModeChange={(mode) => navigateTo(mode === "signup" ? "/signup" : "/login")}
        onBackHome={() => navigateTo("/")}
      />
    );
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

  return (
    <WorkspaceShell
      navItems={navItems}
      activeView={view}
      onSelect={(nextView) => navigateToView(nextView)}
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
            onChangeView={(nextView) => navigateToView(nextView)}
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
          <SchoolAdminPortalModern
            view={view}
            data={data}
            profile={profile}
            onNotify={notify}
            onRefresh={refreshWorkspaceData}
            onChangeView={(nextView) => navigateToView(nextView)}
          />
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
