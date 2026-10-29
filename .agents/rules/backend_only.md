---
name: backend_only
description: Enforce strict backend focus and protect frontend code from modifications
always_on: true
---

# Backend-Only Modification Rule

1. **STRICT IMMUTABILITY OF FRONTEND**:
   - NEVER create, edit, or delete any files in `frontend/` or related UI paths.
   - Frontend files may ONLY be read as reference to inspect API endpoint paths, HTTP verbs, payload keys, WebSocket events, and expected response shapes.

2. **CONTRACT PRESERVATION**:
   - The backend must conform to frontend contracts (`frontend/src/api/*`, `frontend/src/pages/*`, `frontend/src/context/*`).
   - If a frontend component expects a specific field (e.g. `category.name` or `res.token`), the backend must supply it or adapt without modifying frontend files.

3. **BACKEND ROBUSTNESS & SECURITY**:
   - Always return semantic HTTP status codes (`400`, `401`, `403`, `404`, `409`, `429`, `500`) with `{ message, ... }` payloads instead of throwing uncaught generic errors.
   - Enforce database transaction atomicity (`prisma.$transaction`) on multi-table operations.
   - Prevent memory leaks in in-memory caches or rate limiters.

