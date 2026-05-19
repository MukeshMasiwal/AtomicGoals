# AtomicGoals

Next.js + MongoDB starter with OTP-based authentication and a seed script.

## Setup

1. Install dependencies:
	npm install
2. Create .env.local with your connection string:
	MONGODB_URI=mongodb://localhost:27017
3. Start the dev server:
	npm run dev

## Seed demo user

Run:
  npm run seed

Seed details:
- Database: atomic_goals
- Collection: employee
- Email: adminmail@gmail.com
- Role: admin

## Login page

Visit:
	https://atomic-goals-kappa.vercel.app/

The login form uses email OTP and seed login flows.
