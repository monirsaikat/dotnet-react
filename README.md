# Assignment & Submission Management System

A full-stack, role-based school/college application for managing courses, subjects, assignments, submissions, marks, and feedback. The API enforces ownership and role rules; the responsive Next.js interface adapts to Admin, Teacher, and Student workflows.

## Why this submission stands out

- **The demo tells a story immediately.** Seeded assignments include both a reviewed result and a pending review, so every role opens to meaningful data instead of an empty dashboard.
- **The interface is role-native.** Admin sees institutional health and every submission, Teacher gets an assignment studio and review queue, and Student gets deadline urgency and feedback history.
- **Required rules are enforced twice.** The UI guides users, while the API independently enforces ownership, course scope, deadlines, role policies, and mark boundaries.
- **Operations are explainable.** Important writes produce structured logs, migrations reproduce the schema, and the architecture notes document boundaries and trust decisions.
- **Optional polish is purposeful.** Docker setup, advanced filtering, submission analytics, safe destructive actions, realistic seed data, and responsive navigation improve evaluation without obscuring the core brief.

See [Architecture and request flows](docs/ARCHITECTURE.md) for the system map, authorization matrix, and submission lifecycle.

## Main features

- JWT login and server-side role authorization for Admin, Teacher, and Student.
- Admin user, course, and subject management APIs, including teacher/course assignment.
- Teacher assignment draft/publish, update/delete, submission review, marking, feedback, and status workflows.
- Student course-scoped assignment access, deadline-aware create/update submission flow, and results/feedback view.
- PostgreSQL relationships, EF Core migrations, automatic demo seeding, validation, structured error handling, logging, CORS, and Swagger/OpenAPI.
- Unit tests for draft/deadline/course rules, mark boundaries, JWT claims, workflow transitions, and endpoint authorization metadata.

## Technology stack

- Frontend: Next.js 16, React 19, TypeScript, responsive CSS, Fetch API.
- Backend: ASP.NET Core 10 Web API, C#, EF Core, JWT Bearer, Swagger.
- Database: PostgreSQL.
- Testing: xUnit.

## Project structure

```text
.
├── frontend/                       # Next.js client
│   └── src/
│       ├── app/                    # App Router entry point and global styles
│       ├── components/             # Reusable presentation components
│       │   ├── assignments/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   └── layout/
│       ├── features/               # Role-focused application features
│       │   ├── admin/
│       │   ├── dashboard/
│       │   ├── student/
│       │   └── teacher/
│       ├── hooks/                  # React hooks
│       ├── lib/                    # API, errors, and session infrastructure
│       ├── services/               # Typed backend resource operations
│       ├── styles/                 # Base, auth, workspace, responsive layers
│       └── types/                  # Shared domain contracts
├── backend/                        # ASP.NET Core Web API
│   ├── Controllers/                # HTTP endpoints and authorization
│   ├── Data/                       # EF Core context
│   ├── DTOs/                       # Request/response contracts by feature
│   ├── Extensions/                 # Cross-cutting C# extensions
│   ├── Migrations/                 # Reproducible PostgreSQL schema
│   ├── Models/                     # Domain entities and enums
│   └── Services/                   # JWT, seeding, and workflow rules
├── backend.Tests/                  # xUnit business-rule/authorization tests
├── docs/                           # Architecture and evaluator notes
├── docker-compose.yml              # Full local stack
└── .env.example                    # Required environment variable template
```

### Frontend organization

- `app/page.tsx` only selects the authenticated or unauthenticated application shell.
- `features/` owns role-specific behavior and API mutations.
- `components/` contains reusable, mostly presentational UI.
- `services/` owns endpoint paths and typed request payloads.
- `lib/api.ts` is the low-level HTTP boundary; `lib/sessionStore.ts` owns browser session persistence.
- `styles/` keeps base, authentication, workspace, and responsive CSS separate.
- `types/domain.ts` is the single source of truth for frontend API/domain shapes.

### Backend organization

- Controllers handle HTTP concerns, role checks, and response shaping.
- DTOs are separated from persistence entities and grouped by feature.
- `SubmissionWorkflow` contains independently tested business rules.
- `ApplicationDbContext` owns relationships and database constraints.

## Fastest setup (Docker)

1. Copy `.env.example` to `.env` and replace the local database password and JWT key.
2. Run `docker compose up --build` from the repository root.
3. Open the frontend at http://localhost:3000.
4. Open Swagger at http://localhost:5167/swagger.

The backend waits for PostgreSQL, applies migrations, and inserts demo data on the first run. To reset all local demo data, run `docker compose down -v`, then start the stack again. This deletes the Docker database volume.

## Manual local setup

Prerequisites: .NET 10 SDK, Node.js 22+, npm, and PostgreSQL 17 (recent PostgreSQL versions should also work).

1. Create an empty PostgreSQL database named `assignment_management`.
2. Configure backend values with environment variables or .NET user-secrets:

```powershell
$env:ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=assignment_management;Username=postgres;Password=YOUR_PASSWORD'
$env:Jwt__Key='YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS'
$env:Jwt__Issuer='AssignmentManagementApi'
$env:Jwt__Audience='AssignmentManagementClient'
$env:Database__ApplyMigrationsOnStartup='true'
dotnet run --project backend/backend.csproj
```

3. In another terminal, configure and start the frontend:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
Set-Location frontend
npm install
npm run dev
```

When `Database__ApplyMigrationsOnStartup` is `true`, startup applies every migration and seeds the demo accounts only if the users table is empty. Alternatively, run `dotnet ef database update --project backend/backend.csproj --startup-project backend/backend.csproj` and invoke startup once with seeding enabled.

## Demo credentials

| Role    | Email                 | Password      |
| ------- | --------------------- | ------------- |
| Admin   | `admin@example.com`   | `Admin123!`   |
| Teacher | `teacher@example.com` | `Teacher123!` |
| Student | `student@example.com` | `Student123!` |

These credentials are sample data only and must be changed or removed for a real deployment.

## Five-minute evaluator tour

1. **Teacher:** sign in, filter assignments, open one, change draft/published details, review the pending submission, assign marks, add feedback, and select a status.
2. **Student:** sign in, observe the nearest-deadline signal, update the pending answer, and inspect the seeded reviewed result and feedback.
3. **Admin:** sign in, search the institution-wide submission trail, inspect the live review rate, activate/deactivate a user, and manage courses/subjects.
4. **Swagger:** authenticate with any demo token and confirm forbidden operations return `401/403` while role-appropriate operations succeed.
5. **Tests:** run the suite to verify deadlines, draft restrictions, course isolation, marks, JWT role claims, and endpoint policies.

## Requirement coverage

| Brief area | Implementation evidence                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Admin      | User activation/creation, course and subject management, teacher assignment, all assignments, all submissions      |
| Teacher    | Assignment create/update/delete, draft/publish, filtering, owned-subject enforcement, review/marks/feedback/status |
| Student    | Course-scoped assignments, details/deadlines, create/update answer before deadline, marks/status/feedback          |
| Backend    | REST API, validation, problem responses, structured logging, Swagger/OpenAPI, CORS                                 |
| Database   | PostgreSQL relationships, uniqueness constraints, migrations, realistic automatic seed data                        |
| Security   | JWT login, backend role policies, ownership checks, no public role-selection registration                          |
| Testing    | Business rules, workflow boundaries, JWT claims, authorization metadata                                            |
| Submission | Docker setup, `.env.example`, demo accounts, setup/test instructions, assumptions and limitations                  |

## Run tests and checks

```powershell
dotnet test backend/AssignmentManagement.slnx
Set-Location frontend
npm run format:check
npm run lint
npm run build
```

To format frontend files after editing, run `npm run format`. For backend formatting, run `dotnet format backend/AssignmentManagement.slnx` from the repository root.

## API overview

- `POST /api/auth/login`
- Admin: `/api/users`, `/api/courses`, `/api/subjects`
- Admin submission overview: `GET /api/submissions`
- Role-filtered assignments: `/api/assignments`
- Student submissions: `/api/submissions/mine`, `/api/submissions/assignment/{assignmentId}`
- Teacher/Admin review: `/api/submissions/assignment/{assignmentId}`, `/api/submissions/{id}/review`

Use the Swagger **Authorize** control and paste the JWT value. Swagger adds the `Bearer` scheme automatically.

## Important assumptions and design decisions

- A class/course is represented by `Course`; a student belongs to at most one course, while a course contains many subjects.
- A subject has at most one assigned teacher. Only that teacher can create or modify its assignments.
- Students can see only published assignments in their course and can create or replace their answer until the deadline. Updating an answer clears any previous review and returns it to `Submitted`.
- Marks must be between zero and the assignment maximum. Assignments with submissions and courses with dependent records cannot be deleted, preserving academic history.
- User creation and role selection are Admin-only. Public self-registration is intentionally excluded to prevent privilege escalation.
- Times are stored and compared in UTC; the browser displays them in the viewer's local timezone.

## Known limitations

- Answers are text-only; file uploads and notifications are outside the required scope.
- The UI provides the primary workflows and summary administration; Swagger exposes the complete management API.
- There is no password-reset/email-delivery service, pagination, or audit-log UI.
- Demo seeding occurs only when there are no users, so it does not overwrite an existing database.
- The evaluation UI persists the JWT in browser storage. A production deployment should use a secure, HTTP-only cookie or an equivalent hardened token strategy.

## Security notes

No production secrets belong in source control. `.env.example` contains names/placeholders only, `.env` files are ignored, and Docker defaults are for local evaluation only. Use a secret manager, HTTPS, restricted CORS origins, and rotated credentials in production.
