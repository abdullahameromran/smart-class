
  # School Management Platform

  This is a code bundle for School Management Platform. The original project is available at https://www.figma.com/design/4k4TVfKE30u8WAzwo3tMTZ/School-Management-Platform.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server on `http://localhost:5173`.

  ## Supabase setup

  The frontend now reads its configuration from Vite env vars:

  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

  `.env.example` shows the expected shape, and `.env.local` is already wired for the current project.

  ## Authentication and roles

  This app now uses real Supabase auth and `user_school_roles` instead of the old mock portal switcher.

  After sign-in, the app:

  - loads the user profile from `profiles`
  - resolves active workspaces from `user_school_roles`
  - opens the correct role-based portal for the selected school

  ## Connected backend features

  The live app is wired to the deployed schema/functions for:

  - school provisioning
  - teacher/student/parent invites
  - academic structure setup
  - timetable entries
  - announcements and notification queueing
  - lessons, homework, tests, and MCQ submissions
  - grades, attendance, and messages
  - CSV export through the `export-data` edge function
  
