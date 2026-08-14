# Frontend Architecture

The frontend is a Next.js App Router client organized by responsibility rather than file type alone.

```text
src/
|-- app/          Route entry points and global style composition
|-- components/   Reusable presentation components
|-- features/     Admin, Teacher, Student, and shared dashboard behavior
|-- hooks/        React integration hooks
|-- lib/          Framework-independent utilities and the HTTP client
|-- services/     Typed API operations grouped by backend resource
|-- styles/       Base, authentication, workspace, and responsive style layers
`-- types/        Shared API/domain contracts
```

## Dependency direction

```text
app -> features -> components
              \-> services -> lib/api
all layers -> types
```

- Components do not contain endpoint URLs.
- Services own request paths, methods, and payload serialization.
- Features own user interaction, local state, and workflow orchestration.
- `lib/api.ts` is the only low-level Fetch wrapper.
- `lib/sessionStore.ts` is the only browser-session persistence boundary.
- Global CSS is composed in `app/globals.css`; rules live in focused files under `styles/`.

## Commands

```powershell
npm run format
npm run format:check
npm run lint
npm run build
npm run dev
```

Run `format:check`, `lint`, and `build` before submitting changes.
