# Home Services Marketplace

Production-ready MERN home services marketplace inspired by Urban Company. The app includes JWT authentication, role-based access, service discovery by city or pincode, provider ratings, bookings, mock Razorpay payments, reviews, real-time notifications, geolocation search, AI-style service ranking, provider availability scheduling, Docker deployment, and CI support.

## Folder Structure

```text
home-services-marketplace/
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   `-- pages/
|   |-- Dockerfile
|   `-- package.json
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- constants/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- seeds/
|   |   |-- services/
|   |   `-- utils/
|   |-- Dockerfile
|   `-- package.json
|-- .github/workflows/ci.yml
|-- docker-compose.yml
`-- package.json
```

## Backend Highlights

- MVC Express server with modular routes and controllers
- JWT auth + bcrypt password hashing
- Roles: `user`, `provider`, `admin`
- MongoDB geospatial provider queries with `2dsphere`
- AI-based ranking score using provider rating and distance
- WebSocket notifications using Socket.IO
- Provider weekly availability and booking slot validation
- Mock Razorpay-style paid booking flow
- Rate limiting for authentication and booking endpoints
- Safer CORS allowlist handling, request size limits, and stricter JWT error handling

## Frontend Highlights

- React + Vite with hooks and route protection
- Pages for home, details, booking, auth, user dashboard, provider dashboard
- Live notification panel over WebSockets
- Responsive service cards, filters, dashboard views, and booking forms

## Environment Variables

### Server

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/home-services
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
```

`CLIENT_URL` can also be a comma-separated list if you need to allow multiple frontend origins.

### Client

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Run Locally

1. Install dependencies:

```powershell
npm install
npm install --workspace server
npm install --workspace client
```

2. Start MongoDB locally or with Compass connection `mongodb://localhost:27017`.

3. Seed sample data:

```powershell
npm run seed --workspace server
```

4. Start the app:

```powershell
npm run dev
```

5. Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000/api`

## Run Tests

The API regression suite uses your local MongoDB service with an isolated database named `home-services-test`.

```powershell
cd server
npm test
```

## Demo Accounts

- User: `user@example.com` / `password123`
- Provider: `provider@example.com` / `password123`

## Docker Deployment

```powershell
docker compose up --build
```

This starts:

- MongoDB on port `27017`
- Backend on port `5000`
- Frontend on port `80`

## CI/CD

GitHub Actions workflow at `.github/workflows/ci.yml` installs dependencies and builds the frontend on every push to `main` or `master` and on pull requests.

## Notes

- Reviews can only be submitted after a booking reaches `completed`.
- Booking creation checks provider availability and overlapping slots.
- Real-time notifications appear for providers on new bookings and for users on booking status changes.
