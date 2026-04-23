# HomeSphere

HomeSphere is a MERN home services marketplace for booking trusted local providers. It includes customer booking, provider scheduling, admin operations, local offline contact support, help requests, real-time notifications, geolocation discovery, and Docker-based deployment.

## Tech Stack

- Frontend: React, Vite, Axios, Socket.IO client
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt
- Deployment: Docker, Docker Compose, nginx
- CI: GitHub Actions

## Core Features

- JWT authentication with `user`, `provider`, and `admin` roles
- Service discovery by city, pincode, category, minimum price, minimum rating, and location
- Browser geolocation with saved last-used location
- MongoDB geospatial provider matching
- AI-style ranking using provider rating and distance
- Provider public profiles
- Provider availability scheduling
- Booking creation, status updates, cancellation, and mock Razorpay-style payment flow
- Booking chat between user and provider
- Reviews with star picker after completed bookings
- Real-time notifications
- Admin dashboard for users, services, bookings, reviews, local contacts, and help requests
- Admin-managed local contacts directory for offline providers
- Local contacts directory is protected and visible only to logged-in users/admins
- User help-request flow for local service needs
- Responsive blue/white UI with sharper panels

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
|   |-- nginx.conf
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
|   |   |-- tests/
|   |   `-- utils/
|   |-- Dockerfile
|   `-- package.json
|-- .github/workflows/ci.yml
|-- docker-compose.yml
`-- package.json
```

## Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/home-services
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For Docker Compose, these values are provided in `docker-compose.yml`.

## Local Setup

From the project root:

```powershell
cd D:\home-services-marketplace
npm install
npm install --workspace server
npm install --workspace client
```

Make sure MongoDB is running locally, then seed demo data:

```powershell
npm run seed --workspace server
```

Run the app:

```powershell
npm run dev
```

Useful URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Demo Accounts

```text
User:
user@example.com
password123

Provider:
provider@example.com
password123

Admin:
admin@example.com
password123
```

## Tests And Build

Backend regression tests:

```powershell
cd D:\home-services-marketplace\server
npm test
```

Frontend production build:

```powershell
cd D:\home-services-marketplace\client
npm run build
```

Root frontend build command:

```powershell
cd D:\home-services-marketplace
npm run build
```

## Docker Desktop Deployment

Start Docker Desktop first, then from the project root run:

```powershell
cd D:\home-services-marketplace
docker compose up --build -d
```

This starts:

- MongoDB: `localhost:27017`
- Backend API: `http://localhost:5001/api`
- Frontend: `http://localhost`

Check running containers:

```powershell
docker compose ps
```

View logs:

```powershell
docker compose logs -f
```

Seed the Docker MongoDB database:

```powershell
docker compose exec server npm run seed
```

Stop the deployment:

```powershell
docker compose down
```

Reset Docker data completely:

```powershell
docker compose down -v
```

## Important Routes

- `/` home and service discovery
- `/services/:id` service details
- `/book/:id` booking flow
- `/dashboard` user bookings, reviews, chat, cancellation
- `/provider` provider services, availability, bookings, chat
- `/providers/:id` public provider profile
- `/profile` onboarding/profile completion
- `/local-contacts` protected offline local provider directory
- `/admin` admin console

## CI/CD

GitHub Actions workflow lives in `.github/workflows/ci.yml`.

Current CI behavior:

- installs dependencies
- builds the frontend

Recommended next CI improvement:

- add MongoDB service container
- run `npm test --workspace server`
- build Docker images on `main`

## Notes

- Local contacts are admin-managed field data and are visible only after login.
- Help requests require login before submission.
- Payments are mock Razorpay-style and ready to be replaced with real Razorpay checkout.
- Reviews are allowed only after booking status becomes `completed`.
- Real-time notifications require the backend Socket.IO server to be running.
