# ServeSure - Database Schema → Implementation Roadmap

## 🎯 Current Status
✅ **Database Schema Completed** - Prisma schema and migrations are ready with all entities, enums, and relationships.

---

## 📋 Comprehensive Next Steps (9 Phases)

### **PHASE 1: Environment & Setup (2 days)**
This is the IMMEDIATE NEXT STEP after schema completion.

#### 1.1 Backend Environment Setup
```bash
cd backend/
npm install  # Install all dependencies
```

**Required packages:**
- `express` - Web framework
- `@prisma/client` - ORM client
- `prisma` - ORM CLI
- `dotenv` - Environment variables
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT auth
- `cors` - CORS middleware
- `express-validator` - Request validation
- `nodemon` - Development auto-reload
- `jest` & `supertest` - Testing
- `cloudinary` - Image storage
- `razorpay` - Payment gateway
- `resend` - Email service
- `express-rate-limit` - Rate limiting

**Setup checklist:**
- [ ] Create `.env.local` file with database connection string (PostgreSQL/Supabase)
- [ ] Run `npx prisma generate` to generate Prisma client
- [ ] Run `npx prisma migrate dev --name init` to apply migrations to database
- [ ] Set up Cloudinary, Razorpay, Resend API keys in `.env`
- [ ] Test database connection: create `src/config/db.js` and verify Prisma client works

#### 1.2 Frontend Environment Setup
```bash
cd frontend/
npm create vite@latest . -- --template react
npm install
```

**Required packages:**
- `react-router-dom` - Routing
- `zustand` - State management
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form handling
- `yup` - Form validation
- `tailwindcss` - Styling
- `shadcn/ui` - Component library
- `axios` - HTTP client
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `recharts` - Charts for analytics

**Setup checklist:**
- [ ] Configure Vite + React
- [ ] Install Tailwind CSS and shadcn/ui
- [ ] Create `.env` with backend API URL
- [ ] Set up folder structure as per PRD

---

### **PHASE 2: Authentication System (9 days)**

**Why first?** All other features depend on auth - you can't create users, providers, admins without it.

#### 2.1 Backend Auth Implementation (5 days)
- [ ] Create auth routes, controller, service, validation files
- [ ] Implement JWT token generation (access + refresh tokens)
- [ ] Implement password hashing (bcryptjs)
- [ ] Email verification via OTP (Resend email service)
- [ ] Password reset flow
- [ ] RBAC middleware to enforce role-based access
- [ ] Rate limiting on auth endpoints

**Key endpoints:**
- `POST /api/auth/register` - Customer/Provider/Admin registration
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Reset request
- `POST /api/auth/reset-password` - Reset completion

#### 2.2 Frontend Auth Implementation (4 days)
- [ ] Create Login page with email/password form (Yup validation)
- [ ] Create Register page with role selection (Customer/Provider/Admin)
- [ ] Create Forgot Password page
- [ ] Zustand auth store (login, logout, check role)
- [ ] Protected route component (redirect non-auth users to login)
- [ ] API service layer for auth calls
- [ ] Persistent auth token (localStorage or session storage)

#### 2.3 Auth Testing (3 days)
- [ ] Unit tests for JWT generation and verification
- [ ] Password hashing tests
- [ ] Role-based access control tests (ensure admin routes block customers)
- [ ] Login/register flow integration tests
- [ ] Test data: create test users with different roles

**Deliverable:** Three different users (customer, provider, admin) can register, login, and access only their allowed routes.

---

### **PHASE 3: Provider Profile & Services (7 days)**

**Why after auth?** Providers need to be authenticated before creating profiles.

#### 3.1 Provider Profile - Backend (3 days)
- [ ] Profile model endpoints (create, update, get)
- [ ] Verification status management
- [ ] Rating aggregation logic
- [ ] Category selection
- [ ] Document upload endpoints (integration with Cloudinary)

**Key endpoints:**
- `POST /api/providers/profile` - Create profile
- `PUT /api/providers/profile` - Update profile
- `GET /api/providers/profile/:id` - Get provider details
- `GET /api/providers/pending-verification` - Admin: list pending providers
- `PATCH /api/providers/:id/verify` - Admin: approve provider

#### 3.2 Service Listings - Backend (3 days)
- [ ] Create/update/delete service endpoints
- [ ] Service metadata (title, description, price, images)
- [ ] Image upload (Cloudinary)
- [ ] List services by provider
- [ ] Search services

**Key endpoints:**
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/provider/:providerId` - Get provider's services
- `GET /api/services` - List all services (with filters)

#### 3.3 Availability Management - Backend (3 days)
- [ ] Availability slots model (separate table or extend Booking model logic)
- [ ] Create/update availability slots
- [ ] Slot occupancy checking
- [ ] Block/unblock dates logic

**Key endpoints:**
- `POST /api/availability` - Create availability slots
- `PUT /api/availability/:id` - Update slot
- `GET /api/availability/provider/:providerId` - Get provider's available slots
- `DELETE /api/availability/:id` - Remove slot

#### 3.4 Frontend - Provider Profile & Services (3 days)
- [ ] Provider dashboard layout
- [ ] Profile form (bio, category, document upload)
- [ ] Service CRUD forms (add/edit/delete services)
- [ ] Service gallery component
- [ ] Availability calendar widget
- [ ] Pricing table
- [ ] Profile verification status badge

---

### **PHASE 4: Customer Browsing & Booking (7 days)**

#### 4.1 Customer Browse - Backend (3 days)
- [ ] Service search API with full-text search
- [ ] Filtering: category, location, price range, rating
- [ ] Sorting: price (asc/desc), rating (desc), availability
- [ ] Pagination (limit, offset)
- [ ] Provider profile endpoints

**Key endpoints:**
- `GET /api/services/search?query=...&category=...&priceMin=...&priceMax=...` - Search
- `GET /api/services/:id` - Get service details with provider info
- `GET /api/providers/:id` - Get provider profile with reviews

#### 4.2 Booking Flow - Backend (4 days)
- [ ] Create booking endpoint
- [ ] Slot availability validation (prevent double-booking)
- [ ] Booking status updates (PENDING → ACCEPTED/REJECTED/COMPLETED/CANCELLED)
- [ ] Booking history
- [ ] Cancellation policy validation (e.g., 24-hour cancellation window)

**Key endpoints:**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/customer/:customerId` - Customer's bookings
- `GET /api/bookings/provider/:providerId` - Provider's incoming bookings
- `PATCH /api/bookings/:id/accept` - Accept booking
- `PATCH /api/bookings/:id/reject` - Reject booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/complete` - Mark as completed

#### 4.3 Frontend - Customer Browse & Booking (3 days)
- [ ] Browse/Search page with filters
- [ ] Provider card component (name, rating, services, price range)
- [ ] Service detail page
- [ ] Booking form (date/time slot selection)
- [ ] Booking confirmation modal
- [ ] My Bookings page
- [ ] Booking status display and cancellation UI

---

### **PHASE 5: Payment Integration (6 days)**

#### 5.1 Payment Backend - Razorpay (4 days)
- [ ] Razorpay order creation API
- [ ] Payment verification webhook
- [ ] Payment status updates in database
- [ ] Transaction logging
- [ ] Refund logic (if cancellation within policy window)
- [ ] Error handling (payment failures, timeouts)

**Key endpoints:**
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment webhook
- `GET /api/payments/:bookingId` - Get payment status
- `POST /api/payments/:id/refund` - Request refund

#### 5.2 Payment Frontend - Razorpay (2 days)
- [ ] Razorpay checkout component
- [ ] Payment loading state
- [ ] Success/failure screens
- [ ] Payment receipt/invoice generation
- [ ] Payment history page

#### 5.3 Payment Testing (2 days)
- [ ] Test with Razorpay test keys (test payment success/failure)
- [ ] Verify payment webhook handling
- [ ] Test refund logic

---

### **PHASE 6: Reviews, Ratings & Notifications (8 days)**

#### 6.1 Reviews Backend (3 days)
- [ ] Create review after booking completion
- [ ] Rating aggregation (calculate provider average rating)
- [ ] Review moderation endpoints (admin delete/approve reviews)
- [ ] Provider response to reviews

**Key endpoints:**
- `POST /api/reviews` - Create review
- `GET /api/reviews/provider/:providerId` - Get provider's reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review (provider/admin)
- `PATCH /api/reviews/:id/respond` - Provider response

#### 6.2 Notifications - Email Backend (3 days)
- [ ] Email service setup (Resend)
- [ ] OTP email template
- [ ] Booking confirmation email
- [ ] Status update emails (accepted, rejected, completed)
- [ ] Review notification emails

#### 6.3 Reviews & Notifications Frontend (2 days)
- [ ] Review form (star rating + comment)
- [ ] Reviews display component
- [ ] Toast notifications (success/error alerts)
- [ ] Notification bell (in-app notifications)
- [ ] Notification history page

---

### **PHASE 7: Admin Panel (11 days)**

#### 7.1 Admin - Provider Verification (3 days)
- [ ] Pending providers queue
- [ ] View provider documents (from Cloudinary)
- [ ] Approve/reject with reason
- [ ] Audit trail logging

**Key endpoints:**
- `GET /api/admin/providers/pending` - List pending providers
- `PATCH /api/admin/providers/:id/verify` - Approve
- `PATCH /api/admin/providers/:id/reject` - Reject
- `GET /api/admin/audit-log` - View actions

#### 7.2 Admin - Moderation (3 days)
- [ ] Flagged reviews dashboard
- [ ] Remove/restore reviews
- [ ] Suspend/ban user accounts
- [ ] Content moderation audit log

**Key endpoints:**
- `GET /api/admin/reviews/flagged` - Flagged reviews
- `DELETE /api/admin/reviews/:id` - Delete review
- `PATCH /api/admin/users/:id/suspend` - Suspend user

#### 7.3 Admin - Analytics Dashboard (3 days)
- [ ] Dashboard KPIs: total bookings, total revenue, active users, top providers
- [ ] Charts (Recharts): revenue over time, bookings by category
- [ ] Filters: date range, category

**Key endpoints:**
- `GET /api/admin/analytics/overview` - KPIs
- `GET /api/admin/analytics/revenue` - Revenue data
- `GET /api/admin/analytics/bookings` - Booking stats
- `GET /api/admin/analytics/top-providers` - Top performers

#### 7.4 Admin - Category Management (2 days)
- [ ] Create/edit/delete service categories
- [ ] Category list view

**Key endpoints:**
- `POST /api/admin/categories` - Create
- `PUT /api/admin/categories/:id` - Update
- `DELETE /api/admin/categories/:id` - Delete
- `GET /api/admin/categories` - List all

#### 7.5 Admin Frontend (4 days)
- [ ] Admin dashboard layout
- [ ] Verification queue page with provider modals
- [ ] Moderation dashboard
- [ ] Analytics dashboard with charts (Recharts)
- [ ] Category management CRUD
- [ ] Audit log viewer

---

### **PHASE 8: Testing, Security & Deployment (16 days)**

#### 8.1 Testing Suite (5 days)
- [ ] Jest setup for backend
- [ ] Supertest setup for API testing
- [ ] Auth module unit tests (100% coverage)
- [ ] Auth API integration tests
- [ ] Booking flow integration tests
- [ ] Payment flow tests (with mocked Razorpay)
- [ ] Review and rating tests

**Target:** Minimum 80% code coverage

#### 8.2 Integration Tests (4 days)
- [ ] End-to-end: Customer registration → profile → browse → booking → payment → review
- [ ] End-to-end: Provider registration → verification → profile → services → receive bookings
- [ ] End-to-end: Admin verification flow
- [ ] Admin moderation flow

#### 8.3 Security Audit (3 days)
- [ ] RBAC enforcement (verify role-based restrictions work)
- [ ] SQL injection prevention
- [ ] XSS prevention (input sanitization)
- [ ] CSRF token implementation
- [ ] Rate limiting effectiveness
- [ ] Password security validation
- [ ] JWT security (token expiry, refresh logic)

#### 8.4 Docker & Deployment (2 days)
- [ ] Docker setup for backend (Node.js)
- [ ] Docker setup for frontend (Node.js build)
- [ ] PostgreSQL Docker image
- [ ] docker-compose.yml orchestration
- [ ] GitHub Actions CI/CD pipeline
- [ ] Environment-specific configs (dev, staging, production)

#### 8.5 Documentation (3 days)
- [ ] API specification (Swagger/OpenAPI)
- [ ] ER diagram (dbdiagram.io or similar)
- [ ] Architecture.md (system design, component interactions)
- [ ] Deployment guide
- [ ] README with setup instructions
- [ ] Code comments for complex logic

#### 8.6 Polish & Bug Fixes (2 days)
- [ ] UI/UX polish
- [ ] Responsive design fixes (mobile, tablet, desktop)
- [ ] Performance optimization
- [ ] Bug fixes from integration testing

---

### **PHASE 9: Final Demo & Deployment (2 days)**

- [ ] End-to-end demo script (10-minute walkthrough)
- [ ] Test data setup (seed 5-10 providers, customers)
- [ ] Demo environment (staging or local)
- [ ] Final walkthrough of all 3 roles' flows
- [ ] Performance testing (load testing if time permits)

---

## 🚀 Quick Start Checklist (TODAY)

### ✅ IMMEDIATE ACTIONS (Do This Today):

1. **Backend Setup**
   ```bash
   cd backend
   npm install  # Install all dependencies
   ```

2. **Create `.env` file** (backend)
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/servesure"
   JWT_SECRET="your-secret-key-change-this-in-production"
   JWT_EXPIRE="7d"
   REFRESH_TOKEN_EXPIRE="30d"
   CLOUDINARY_NAME="your-cloudinary-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   RAZORPAY_KEY_ID="your-razorpay-key"
   RAZORPAY_KEY_SECRET="your-razorpay-secret"
   RESEND_API_KEY="your-resend-api-key"
   ```

3. **Initialize Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init  # Apply to your database
   npx prisma studio  # Explore database GUI
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev  # Start dev server
   ```

5. **Create folder structure** in `backend/src/` (from PRD):
   ```
   src/
   ├── modules/
   │   ├── auth/
   │   ├── users/
   │   ├── providers/
   │   ├── bookings/
   │   ├── payments/
   │   ├── reviews/
   │   └── admin/
   ├── middlewares/
   ├── config/
   ├── utils/
   ├── app.js
   └── server.js
   ```

6. **Database Connection Test**
   Create `backend/src/config/db.js`:
   ```javascript
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   
   async function testConnection() {
     try {
       await prisma.$connect();
       console.log('✅ Database connected!');
     } catch (err) {
       console.error('❌ Database error:', err);
     } finally {
       await prisma.$disconnect();
     }
   }
   
   module.exports = testConnection;
   ```

---

## ⏱️ Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| **Phase 1: Setup** | 2 days | 2 days |
| **Phase 2: Auth** | 9 days | 11 days |
| **Phase 3: Provider Profile & Services** | 7 days | 18 days |
| **Phase 4: Customer Browse & Booking** | 7 days | 25 days |
| **Phase 5: Payments** | 6 days | 31 days |
| **Phase 6: Reviews & Notifications** | 8 days | 39 days |
| **Phase 7: Admin Panel** | 11 days | 50 days |
| **Phase 8: Testing & Deployment** | 16 days | 66 days |
| **Phase 9: Demo & Polish** | 2 days | **68 days** |

**Accelerated Timeline:** If you prioritize core features (auth → bookings → payments) before admin panel and advanced features, you could complete an MVP in **4-5 weeks**.

---

## 📊 Dependency Graph

```
Setup (DB + Packages)
    ↓
Auth System
    ├→ Provider Profile & Services
    │   ├→ Customer Browse & Booking
    │   │   ├→ Payments
    │   │   └→ Reviews & Notifications
    │   └→ Availability Management
    │
    └→ Admin Panel (Verification + Moderation + Analytics)
    
All → Testing & Deployment → Documentation → Final Demo
```

---

## 🎯 Success Metrics

At each phase completion:
1. **Phase 2:** All 3 roles can register, login, access role-specific routes
2. **Phase 3:** Providers can create profiles and service listings
3. **Phase 4:** Customers can browse and book services
4. **Phase 5:** Payments work end-to-end in Razorpay sandbox
5. **Phase 6:** Reviews appear, emails are sent, notifications work
6. **Phase 7:** Admin can verify, moderate, and see analytics
7. **Phase 8:** 80%+ test coverage, all security checks pass
8. **Phase 9:** Full demo runs without errors

---

## 💡 Pro Tips

1. **Test early and often** - Don't wait for testing phase. Write tests as you build each module.
2. **Use Prisma Studio** - `npx prisma studio` helps visualize data while developing.
3. **Seed test data** - Create a seed script to populate test customers, providers, services.
4. **Postman/Insomnia** - Test API endpoints as you build them (before frontend).
5. **Environment parity** - Keep dev/staging/prod configs similar to catch issues early.
6. **Git workflow** - Create feature branches for each phase (e.g., `feature/auth`, `feature/bookings`).

---

## 📌 Current Focus (Next 2-3 Days)

1. ✅ Complete Phase 1 setup (today/tomorrow)
2. Start Phase 2 (Auth) - begin with JWT token generation and registration endpoint
3. Get first API working and test with Postman

Good luck! Let me know when Phase 1 is complete, and I can help guide Phase 2.
