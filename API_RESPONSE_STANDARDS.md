# API Response Standards

## Overview
All API endpoints now follow a consistent, production-ready response format.

---

## Success Response Format

```json
{
  "message": "Clear success message",
  "data": {
    // Actual response payload
  }
}
```

**HTTP Status Codes:**
- `200 OK` - GET requests, login callbacks
- `201 Created` - POST requests that create resources (voting)

---

## Error Response Format

```json
{
  "message": "Clear, actionable error message"
}
```

**HTTP Status Codes:**
- `400 Bad Request` - Missing/invalid input (candidateId, etc.)
- `400 Bad Request` - Business logic violations (already voted)
- `401 Unauthorized` - Missing/invalid JWT token
- `404 Not Found` - Resource not found (user, candidate)
- `500 Internal Server Error` - Unhandled server errors

---

## Endpoint Standards

### Authentication Routes
```
GET /auth/google
GET /auth/google/callback
GET /auth/linkedin
GET /auth/linkedin/callback
```

**Success (200):**
```json
{
  "message": "Google/LinkedIn login successful",
  "data": { "token": "jwt_token_here" }
}
```

---

### Candidates Route
```
GET /api/candidates
```

**Success (200):**
```json
{
  "message": "Candidates fetched successfully",
  "data": [
    {
      "id": "...",
      "name": "Candidate Name",
      "description": "...",
      "linkedinUrl": "..."
    }
  ]
}
```

**Error (500):**
```json
{
  "message": "Failed to fetch candidates"
}
```

---

### Voting Route
```
POST /api/vote
Header: Authorization: Bearer <jwt_token>
Body: { "candidateId": "..." }
```

**Success (201):**
```json
{
  "message": "Vote cast successfully",
  "data": {
    "voteId": "...",
    "candidateId": "..."
  }
}
```

**Error Cases:**
- `400` - Missing Candidate ID: `{ "message": "Candidate ID is required" }`
- `400` - Already Voted: `{ "message": "You have already voted" }`
- `404` - User Not Found: `{ "message": "User not found" }`
- `404` - Candidate Not Found: `{ "message": "Candidate not found" }`
- `500` - Server Error: `{ "message": "Failed to cast vote" }`

---

### Voters Route
```
GET /api/voters/:candidateId
Header: Authorization: Bearer <jwt_token>
```

**Success (200):**
```json
{
  "message": "Voters fetched successfully",
  "data": {
    "candidateId": "...",
    "voters": [
      {
        "id": "...",
        "name": "Voter Name",
        "linkedinUrl": "..."
      }
    ]
  }
}
```

**Error Cases:**
- `400` - Missing Candidate ID: `{ "message": "Candidate ID is required" }`
- `500` - Server Error: `{ "message": "Failed to fetch voters" }`

---

### Health Check Route
```
GET /health
```

**Success (200):**
```json
{
  "message": "Server is healthy"
}
```

---

## Global Error Handlers

### 404 Not Found (Unmatched Route)
```json
{
  "message": "Route not found"
}
```

### 500 Internal Server Error (Unhandled Exception)
```json
{
  "message": "Internal server error"
}
```

---

## Key Changes Made

1. **All success responses now include `message` field** for clarity
2. **All error responses use consistent `message` field** (no more `error` field)
3. **Status codes are explicit and appropriate:**
   - `201 Created` for POST /api/vote
   - `200 OK` for GET and login callbacks
   - `400` for client errors
   - `404` for not found
   - `500` for server errors
4. **Response data is wrapped in `data` field** for consistency
5. **Global 404 handler** for unmatched routes
6. **Global error handler** for unhandled exceptions
7. **Error messages are clear and actionable** for frontend developers

---

## Files Modified

- `src/app.js` - Added 404 and error handlers, standardized health check
- `src/controllers/candidates.controller.js` - Added message and data wrapper
- `src/routes/vote.controller.js` - Standardized to message field, 201 status, wrapped data
- `src/controllers/voters.controllers.js` - Standardized to message field, wrapped data
- `src/routes/auth.routes.js` - Added 200 status, wrapped token in data field

---

## Frontend Integration Notes

- **Always expect `message` field** in responses
- **Always check HTTP status code** for success/error determination
- **Success data is in `data` field** - destructure it from response
- **Authentication failures** (401) mean JWT is missing/invalid - re-authenticate user
- **Business logic errors** (400) provide specific, actionable messages
- **Server errors** (500) are generic for security - check server logs for details
