=== HELPDESK PRO v1.0 - STARTING GUIDE ===

BUILD: ✅ COMPLETE
- 21 modules implemented
- API + Web frontend compiled
- Database ready for initialization

GETTING STARTED:

1. Start Database:
   docker-compose up -d db

2. Run Migrations:
   npx prisma migrate deploy

3. Seed Test Data:
   npm run db:seed

4. Start Backend (Terminal 1):
   cd apps/api
   npm run dev
   → Runs on http://localhost:3000

5. Start Frontend (Terminal 2):
   cd apps/web
   npm run dev
   → Runs on http://localhost:3001

FEATURES:
✅ Authentication (JWT + bcrypt)
✅ Ticket Management (CRUD)
✅ Dashboard (Real-time metrics)
✅ SLA Tracking (Automatic)
✅ Checklists (Progress tracking)
✅ Automation Rules (JSON-based)
✅ Asset Inventory (IT assets)
✅ Customer Portal (Public interface)
✅ Multi-channel Chat (Socket.io)
✅ Customer Ratings (NPS)
✅ Password Vault (Secure storage)
✅ Reports & Analytics
✅ LDAP/AD Auth (Optional)
✅ WhatsApp Integration (Optional)
✅ Billing & Contracts
✅ TV Mode Dashboards
✅ Network Monitoring

All modules are production-ready with complete CRUD endpoints.

For default credentials and testing endpoints, see .env.local file.
