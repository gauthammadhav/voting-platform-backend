# Voting Platform Backend

Backend service for an online voting platform built for the White Matrix Internship – Machine Test (Dec 2025). Provides OAuth-based login (Google, LinkedIn via OIDC), JWT-protected APIs, and transaction-safe vote casting against a PostgreSQL database.

## Project Overview
- OAuth-first authentication: Google OAuth 2.0 and LinkedIn OpenID Connect managed by Passport.
- Stateless session model with JWT for protected resources.
- Candidate listing, single-vote casting, and voter lookup by candidate.
- Prisma ORM for schema management and migrations; PostgreSQL as the datastore.
- Express.js app with clear separation of routes, controllers, services, middleware, and config.

## Tech Stack
- Node.js, Express.js
- PostgreSQL with Prisma ORM
- Passport.js (Google OAuth 2.0, LinkedIn OIDC)
- JSON Web Tokens (JWT) for stateless auth

## Folder Structure
```
├── API_RESPONSE_STANDARDS.md
├── STANDARDIZATION_CHECKLIST.md
├── prisma
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── src
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── jwt.js
│   │   ├── passport.js
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── candidates.controller.js
│   │   └── voters.controllers.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── candidates.routes.js
│   │   ├── test.routes.js
│   │   ├── vote.controller.js
│   │   ├── vote.routes.js
│   │   └── vote.service.js
│   └── services/
│       ├── candidates.service.js
│       └── voters.service.js
├── .env.example
├── package.json
└── package-lock.json
```

## Database Design
- User: OAuth identities stored with provider + providerUserId uniqueness, optional email/linkedinUrl, and `hasVoted` flag for one-vote enforcement ([prisma/schema.prisma](prisma/schema.prisma#L10-L27)).
- Candidate: Basic candidate profile with LinkedIn URL ([prisma/schema.prisma](prisma/schema.prisma#L29-L36)).
- Vote: One-to-one with User via unique `userId`, references Candidate, and timestamps ([prisma/schema.prisma](prisma/schema.prisma#L38-L48)).

## Authentication Flow
- Google OAuth: `/auth/google` redirects to Google; callback issues a JWT with user id + provider ([src/routes/auth.routes.js](src/routes/auth.routes.js#L9-L46)).
- LinkedIn OIDC: `/auth/linkedin` uses OpenID scopes; callback issues JWT ([src/routes/auth.routes.js](src/routes/auth.routes.js#L18-L36)).
- JWT strategy: Bearer tokens validated by Passport; user loaded from DB and attached to `req.user` ([src/config/passport.js](src/config/passport.js#L1-L214)).

## Voting Logic (One Vote Per User)
- Vote creation is wrapped in a Prisma transaction with sequential checks for user existence, duplicate voting, and candidate existence ([src/routes/vote.service.js](src/routes/vote.service.js#L1-L59)).
- `User.hasVoted` flag and unique `Vote.userId` constraint prevent duplicate submissions, even under concurrent requests ([prisma/schema.prisma](prisma/schema.prisma#L20-L48)).

## API Endpoints
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | /health | Public | Liveness check. |
| GET | /auth/google | Public | Start Google OAuth. |
| GET | /auth/google/callback | Public (OAuth redirect) | Completes Google OAuth, returns JWT. |
| GET | /auth/linkedin | Public | Start LinkedIn OIDC login. |
| GET | /auth/linkedin/callback | Public (OIDC redirect) | Completes LinkedIn login, returns JWT. |
| GET | /api/test/protected | JWT | Sample protected route returning authenticated user. |
| GET | /api/candidates | Public | List all candidates. |
| POST | /api/vote | JWT | Cast a vote for a candidate (`candidateId` in body). |
| GET | /api/voters/:candidateId | JWT | List voters (name + LinkedIn URL) for a candidate. |

## Setup Instructions
1. Clone: `git clone https://github.com/gauthammadhav/voting-platform-backend.git && cd voting-platform-backend`
2. Install deps: `npm install`
3. Configure environment: copy `.env.example` to `.env` and fill in values below.
4. Apply migrations: `npx prisma migrate deploy` (or `npx prisma migrate dev` for local dev).
5. Seed database with initial candidates: `npx prisma db seed` (seed script in `prisma/seed.js`).
6. Run the server: `node src/server.js` (defaults to port 3000).

## Environment Variables
| Variable | Purpose |
| --- | --- |
| DATABASE_URL | PostgreSQL connection string. |
| PORT | (Optional) HTTP port; defaults to 3000. |
| JWT_SECRET | Signing key for issuing and verifying JWTs. |
| GOOGLE_CLIENT_ID | Google OAuth client id. |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret. |
| GOOGLE_CALLBACK_URL | OAuth callback URL (e.g., `http://localhost:3000/auth/google/callback`). |
| LINKEDIN_CLIENT_ID | LinkedIn application client id. |
| LINKEDIN_CLIENT_SECRET / LINKED_IN_CLIENT_SECRET | LinkedIn client secret (both names supported). |
| LINKEDIN_CALLBACK_URL | LinkedIn callback URL; defaults to `http://localhost:3000/auth/linkedin/callback` if unset. |
| LINKEDIN_SCOPE | (Optional) Comma-separated scopes; defaults to `openid,profile,email`. |

## Sanity Checks / Testing
- Verify health: `curl http://localhost:3000/health`.
- Run OAuth flows via browser for Google and LinkedIn, capture returned JWT.
- Access protected sample: `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/test/protected`.
- Cast a vote: `curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"candidateId\":\"<id>\"}" http://localhost:3000/api/vote`.
- Confirm voter listing: `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/voters/<candidateId>`.

## Notes
- Forgot password is intentionally omitted because authentication relies on external OAuth providers (Google and LinkedIn). There is no local credential store to reset.
- LinkedIn integration uses OpenID Connect scopes (not legacy LinkedIn OAuth permissions) as configured in Passport.

## Conclusion
This backend meets the machine test requirements: OAuth-based authentication (Google + LinkedIn OIDC), JWT-protected endpoints, one-vote enforcement with transaction safety, and Prisma-managed PostgreSQL persistence. It is ready to be paired with a frontend client for end-to-end voting flows.

## Author
Gautham Madhav
