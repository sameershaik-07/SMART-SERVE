# ServeSure — Product Requirements Document (PRD)

**Project Type:** Semester Academic Project (Web-based Service Booking Platform)
**Inspired by:** Slash Services Booking App
**Version:** 1.0
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement
Customers looking for local services (home repair, cleaning, tutoring, salon, etc.) rely on unverified word-of-mouth or unstructured listings, with no standard way to compare providers, check availability, or trust reviews. Service providers, meanwhile, lack a simple platform to manage bookings, showcase their work, and track earnings without paying commission to multiple fragmented apps.

### 1.2 Solution
ServeSure is a multi-sided web marketplace connecting **customers**, **service providers**, and an **admin** who moderates the platform. Customers can browse, filter, book, pay, and review services. Providers manage their profile, service listings, pricing, availability, and view booking/earnings analytics. Admin verifies providers, moderates content, manages categories, and monitors platform health.

### 1.3 Business Model
Commission or subscription-based marketplace — the platform takes a cut per booking (commission model recommended for MVP simplicity; subscription model as future roadmap item).

### 1.4 Goals
- Build a functioning three-role marketplace demonstrating full-stack competency for academic evaluation.
- Produce a portfolio-quality project reflecting real-world architectural decisions (modular structure, RBAC, transactional payments).
- Keep MVP scope achievable by a solo/small team within a semester timeline.

### 1.5 Non-Goals (MVP)
- Real-time chat between customer and provider (future roadmap).
- Native mobile apps (web-responsive only for MVP).
- Multi-language support.
- Advanced fuzzy/typo-tolerant search (Postgres full-text search is sufficient for MVP).

---

## 2. Target Users & Personas

| Persona | Role | Core Needs |
|---|---|---|
| **Customer** | End user booking services | Find trustworthy providers fast, transparent pricing, easy booking + payment, ability to review |
| **Service Provider** | Individual/business offering services | Get discovered, manage availability without double-booking, track earnings, build reputation via reviews |
| **Admin** | Platform operator | Verify providers, moderate disputes/fake reviews, manage service categories, monitor platform health via analytics |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- Email/password registration and login for all 3 roles.
- OTP-based email verification on signup.
- JWT-based auth: access token (short-lived) + refresh token (long-lived), role embedded in token payload.
- Role-based access control (RBAC) enforced on every protected backend route.
- Password reset via email link.

### 3.2 Customer Features
- Browse/search services by category, location, price range, rating.
- Filter and sort results (price, rating, availability).
- View provider profile: services offered, past reviews, verification badge.
- Book a service: select date/time slot based on provider availability.
- Make payment (Razorpay) at time of booking or after service completion (configurable per provider).
- View booking history and status (pending, confirmed, completed, cancelled).
- Leave a rating and written review after service completion.
- Cancel/reschedule a booking within a defined policy window.
- Receive email notifications for booking confirmation, reminders, and status changes.

### 3.3 Service Provider Features
- Create and manage provider profile (bio, service categories, photos via Cloudinary).
- Add/edit/remove service listings with pricing.
- Set and update availability calendar (block out unavailable dates/times).
- View incoming booking requests; accept/reject/reschedule.
- Dashboard: earnings summary, completed bookings count, average rating (via Recharts).
- Respond to customer reviews.
- Receive notifications for new bookings and cancellations.

### 3.4 Admin Features
- View and verify pending provider registrations (approve/reject with reason).
- Moderate reviews and listings (remove abusive/fake content).
- Manage service categories (add/edit/remove).
- View platform-wide analytics: total bookings, revenue, active users, top-performing providers.
- View audit log of admin actions (verification decisions, moderation actions, bans).
- Suspend/ban customer or provider accounts for policy violations.

### 3.5 Cross-Cutting Features
- Search: PostgreSQL full-text search across service names/categories.
- Notifications: Email (Resend) for OTP, booking confirmations, status updates.
- Image upload: Cloudinary for profile photos and service images, with MIME type + size validation before upload.
- Responsive UI across desktop, tablet, mobile viewports.

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Page loads under 2 seconds at expected load (tens to low hundreds of concurrent users) |
| Security | HTTPS everywhere, bcrypt/argon2 password hashing, input validation (Yup on frontend, custom middleware validation on backend), rate limiting, CORS restricted to frontend domain |
| Data Integrity | ACID-compliant transactions for bookings and payments (PostgreSQL) |
| Scalability | Modular monolith backend — each module (auth, bookings, payments, etc.) can be extracted into a microservice later without a rewrite |
| Availability | No formal SLA required for academic scope; should not have single points of failure that block core booking flow |
| Auditability | Admin actions (verification, moderation, bans) logged to an audit table |
| Accessibility | Reasonable semantic HTML and keyboard navigability (not a strict WCAG target for MVP) |

---

## 5. Data Model (High-Level Entities)

- **User** — id, email, password hash, role (customer/provider/admin), verification status, created_at
- **ProviderProfile** — user_id (FK), bio, categories, verification status, average_rating
- **Service** — id, provider_id (FK), title, description, category, price, images
- **Availability** — id, provider_id (FK), date, time_slot, is_booked
- **Booking** — id, customer_id (FK), provider_id (FK), service_id (FK), slot_id (FK), status, created_at
- **Payment** — id, booking_id (FK), amount, status, razorpay_reference, created_at
- **Review** — id, booking_id (FK), customer_id (FK), provider_id (FK), rating, comment, created_at
- **Category** — id, name, description
- **AuditLog** — id, admin_id (FK), action_type, target_entity, timestamp

Relationships are enforced via foreign keys in PostgreSQL (via Prisma), ensuring a booking cannot exist without a valid customer, provider, service, and slot.

---

## 6. Technology Stack (Finalized)

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) + JavaScript |
| Routing | React Router v6 |
| UI/Styling | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Yup |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Backend | Express.js + JavaScript |
| Database | PostgreSQL (Supabase or Neon) |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens), role-based claims |
| Storage | Cloudinary |
| Search | PostgreSQL Full-Text Search |
| Payments | Razorpay |
| Email | Resend |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) + Render/Railway (backend) |

---

## 7. Folder Structure

```
servesure/
├── frontend/                      # React (Vite) app
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                # images, static SVGs
│   │   ├── components/
│   │   │   ├── ui/                # shadcn components (button, dialog, etc.)
│   │   │   ├── common/            # shared components (Navbar, Footer, Loader)
│   │   │   ├── customer/          # customer-specific components
│   │   │   ├── provider/          # provider-specific components
│   │   │   └── admin/             # admin-specific components
│   │   ├── pages/
│   │   │   ├── customer/          # Browse, Booking, Profile, Reviews
│   │   │   ├── provider/          # Dashboard, Services, Earnings, Availability
│   │   │   ├── admin/             # Verification, Moderation, Analytics
│   │   │   └── auth/              # Login, Register, ForgotPassword
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx      # top-level route definitions
│   │   │   ├── ProtectedRoute.jsx # role-based route guard
│   │   │   └── roleRoutes.js      # route configs per role
│   │   ├── hooks/                 # custom hooks (useAuth, useBooking, etc.)
│   │   ├── store/                 # zustand stores (authStore, uiStore)
│   │   ├── lib/
│   │   │   ├── api.js             # axios/fetch instance, base config
│   │   │   ├── queryClient.js     # TanStack Query client setup
│   │   │   └── validators.js      # Yup schemas
│   │   ├── utils/                 # formatters, helpers, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                       # Express app
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── users/
│   │   │   ├── providers/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── reviews/
│   │   │   └── admin/
│   │   │       ├── <module>.routes.js
│   │   │       ├── <module>.controller.js
│   │   │       ├── <module>.service.js
│   │   │       └── <module>.validation.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # JWT verification
│   │   │   ├── role.middleware.js      # RBAC guard
│   │   │   ├── error.middleware.js     # centralized error handler
│   │   │   └── rateLimiter.middleware.js
│   │   ├── config/
│   │   │   ├── db.js               # Prisma client instance
│   │   │   ├── cloudinary.js
│   │   │   ├── razorpay.js
│   │   │   └── resend.js
│   │   ├── utils/                  # logger, helpers, constants
│   │   ├── app.js                  # express app setup, route mounting
│   │   └── server.js               # entry point
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
│
├── infra/
│   ├── docker-compose.yml
│   └── nginx/ (or caddy/)
│
└── docs/
    ├── ER-diagram.png
    ├── architecture.md
    └── api-spec.yaml
```

**Structural principles:**
- **Frontend** is organized by role first (`customer/`, `provider/`, `admin/`) within both `components/` and `pages/`, so any feature's location is predictable. `common/` holds only what's genuinely shared across 2+ roles.
- **Backend** is organized by domain module (`auth`, `bookings`, `payments`, etc.), each with the same four-file pattern: `routes` (URL → handler), `controller` (parses request, calls service), `service` (business logic, the only layer touching Prisma), `validation` (input checks). Controllers never contain business logic; services never touch `req`/`res`.
- `lib/` (frontend) holds configuration/wiring for external tools; `utils/` holds pure helper functions — keeping these separate makes it clear where to look when something breaks.

---

## 8. User Flows (Summary)

**Booking Flow (Customer):**
Browse/Search → Select Provider/Service → Choose Available Slot → Confirm Booking → Pay (Razorpay) → Receive Confirmation Email → Service Delivered → Leave Review

**Onboarding Flow (Provider):**
Register → Submit Profile + Documents → Await Admin Verification → Approved → Create Service Listings → Set Availability → Start Receiving Bookings

**Moderation Flow (Admin):**
New Provider Registers → Appears in Verification Queue → Admin Reviews Documents → Approve/Reject → Action Logged to Audit Table

---

## 9. Success Metrics (Academic Evaluation Context)

- All 3 role-based flows demonstrable end-to-end in a live demo.
- Booking → payment → confirmation completes without data inconsistency (transactional integrity holds under test).
- RBAC correctly blocks cross-role access (e.g., customer cannot access admin routes).
- Clean, modular codebase mapping directly to the documented architecture (evaluators can trace a feature from route → controller → service → DB).

---

## 10. Milestones (Suggested)

| Phase | Deliverable |
|---|---|
| 1 | Auth system (all 3 roles) + DB schema + base folder structure |
| 2 | Provider profile + service listing + availability management |
| 3 | Customer browse/search/booking flow |
| 4 | Payment integration (Razorpay sandbox) |
| 5 | Reviews + notifications (email) |
| 6 | Admin panel (verification, moderation, analytics) |
| 7 | Testing (Jest, Supertest), polish, deployment |
| 8 | Documentation (ER diagram, architecture.md, API spec) + final report |

---

## 11. Out of Scope / Future Roadmap

- AI-powered service recommendations
- Real-time chat/booking updates (Socket.io)
- Native mobile app (reusing existing Express API)
- Multi-language support (i18n)
- Extracting payments/bookings into separate microservices at scale

---

## 12. Open Questions

- Commission vs. subscription model for MVP — needs a final decision before the payments module is built.
- Cancellation/rescheduling policy window (e.g., how many hours before a slot) — needs to be defined.
- Whether payment is collected at booking time or after service completion (affects Payment entity status flow).