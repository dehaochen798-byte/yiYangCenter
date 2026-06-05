# API Layer

- All frontend requests go through `gateway`
- Base URL is configured by `VITE_API_BASE_URL`
- Auth token is attached in `src/api/http.ts`
- Feature modules should keep request wrappers under `src/modules/*/api`
