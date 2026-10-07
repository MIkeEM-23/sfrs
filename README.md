# School Facility Reservation System

Full-stack app: **React + Vite + Tailwind** (client) and **Node + Express + MongoDB** (server).
Students sign up, check facility availability, and submit reservations. Admins approve or reject them.

## 1. Requirements
- Node.js 18 or newer (https://nodejs.org, choose the LTS version). Check with `node -v`.
- MongoDB: either **local MongoDB Community Server** or a free **MongoDB Atlas** cloud database.

## 2. MongoDB setup
**Option A: Local MongoDB**
1. Install MongoDB Community Server and make sure it is running.
2. Use this connection string: `mongodb://127.0.0.1:27017/school_facility_reservation`

**Option B: MongoDB Atlas**
1. Create a free account at https://www.mongodb.com/atlas and create a free (M0) cluster.
2. Database Access: add a database user (username + password).
3. Network Access: add your IP address (or `0.0.0.0/0` for testing only).
4. Click **Connect > Drivers** and copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/school_facility_reservation`

## 3. Environment variables
In `server/`, copy `.env.example` to `.env` and edit it:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```
The connection string stays on the server only. It is never in the frontend code.

## 4. Run the backend
```bash
cd server
npm install
npm run seed     # creates facilities, test accounts and sample reservations
npm run dev      # starts http://localhost:5000
```

## 5. Run the frontend (second terminal)
```bash
cd client
npm install
npm run dev      # opens http://localhost:5173
```
Vite forwards `/api` requests to the backend on port 5000 (see `client/vite.config.js`).

## 6. Test accounts (created by the seed)
| Role    | School ID | Password     |
|---------|-----------|--------------|
| Admin   | ADMIN001  | Admin123!    |
| Student | STU001    | Student123!  |
| Student | STU002    | Student123!  |

Re-run `npm run seed` any time to reset the data. The sample reservations are created
relative to today's date, so there is always something to demo:
- **Today:** Gymnasium = Available, Auditorium = Partially Booked, Chapel = Fully Booked, Outdoor Court = Available
- **Tomorrow:** Gymnasium = Partially Booked
- STU001 also has Completed, Rejected, Cancelled and Pending reservations.

## 7. API endpoints
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | Create student account (role is always `student`) |
| POST | /api/auth/login | public | Login, returns JWT |
| GET | /api/auth/me | logged in | Current user |
| POST | /api/reservations | logged in | Create reservation (status Pending) |
| GET | /api/reservations/my | logged in | My reservations |
| GET | /api/reservations/:id | owner/admin | One reservation |
| PUT | /api/reservations/:id | owner | Edit a Pending reservation |
| DELETE | /api/reservations/:id | owner | Cancel a Pending reservation |
| GET | /api/availability?facility=Gymnasium&date=2026-10-15 | logged in | Status + time slots for one facility |
| GET | /api/availability/all?date=2026-10-15 | logged in | Status of all facilities (defaults to today) |
| GET | /api/admin/reservations | admin | All reservations + stats; filters: facility, status, date, q |
| PUT | /api/admin/reservations/:id/approve | admin | Approve |
| PUT | /api/admin/reservations/:id/reject | admin | Reject |
| PUT | /api/admin/reservations/:id/cancel | admin | Cancel |

## 8. Project structure
```
school-facility-reservation/
├── client/                    React app
│   └── src/
│       ├── components/        Layout (sidebar), Calendar, FacilityGrid, StatusBadge, ProtectedRoute
│       ├── pages/             Login, Register, Dashboard, Facilities, Availability,
│       │                      Reservation, MyReservations, Profile, AdminDashboard
│       ├── services/api.js    Axios setup (adds the JWT)
│       ├── context/           AuthContext (login state)
│       └── utils/format.js    Date/time formatting
└── server/
    ├── models/                User, Facility, Reservation
    ├── routes/                auth, reservation, availability, admin
    ├── controllers/           Logic for each route file
    ├── middleware/            authMiddleware (JWT), adminMiddleware
    ├── utils/                 availability.js, booking.js (rules), dates.js
    ├── seed.js
    └── server.js
```

## 9. How the availability and conflict logic works
**Data format:** dates are stored as `"2026-10-15"` and times as 24-hour `"HH:MM"` text, so they can be compared directly.

**Availability** (`server/utils/availability.js`)
1. Take the facility's operating hours (e.g. Gymnasium 08:00 to 17:00) and split them into 1-hour slots.
2. Load that day's reservations with status **Pending** or **Approved** from MongoDB. Rejected and Cancelled ones do not block time.
3. A slot is **Reserved** if a reservation overlaps it, otherwise **Available**.
4. No reserved slots = **Available**. Some = **Partially Booked**. All = **Fully Booked**.

Only times and statuses are sent to students. No names, School IDs or emails.

**Overlap check** (`server/utils/booking.js`), done on the backend for every new reservation.
Two time ranges overlap when:
```
existing.start < new.end   AND   existing.end > new.start
```
Example with an existing 10:00-12:00 reservation:
- 11:00-13:00 overlaps, so it is rejected.
- 09:00-11:00 overlaps, so it is rejected.
- 12:00-14:00 does not overlap (`10:00 < 14:00` but `12:00 > 12:00` is false), so it is allowed.

**Other server rules:** no past dates, end after start, inside operating hours, 1 to 4 hours long,
participants within capacity, and no booking on a fully booked day.

**Statuses:** a reservation starts as `Pending`. The admin changes it to `Approved` or `Rejected`.
Students can cancel while it is Pending. An Approved reservation whose end time has passed
is shown as **Completed** (calculated automatically, nothing to update by hand).

## 10. Customizing
- Facility hours, capacity, and min/max hours: edit the list in `server/seed.js` and re-run the seed.
- Never put the real `.env` file in GitHub (it is in `.gitignore`).
