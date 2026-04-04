## MODIFIED Requirements

### Requirement: Admin-only login SHALL gate protected application pages
The system SHALL require admin authentication before accessing protected frontend routes, and SHALL redirect unauthenticated users to a dedicated login page.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** a user navigates to a protected route without valid admin session
- **THEN** the app redirects to `/login`
- **AND** protected content is not rendered

### Requirement: Backend SHALL provide admin identity APIs
The backend SHALL expose authentication endpoints for login, logout, and current-session identity retrieval for admin users, and SHALL emit observability logs for auth outcomes without exposing sensitive credentials.

#### Scenario: Admin login succeeds
- **WHEN** valid admin credentials are submitted
- **THEN** backend returns authenticated admin identity/session token payload
- **AND** backend logs an auth success event with structured fields including `module=auth`, `event=login`, and `result=success`

#### Scenario: Invalid credentials are rejected
- **WHEN** incorrect credentials are submitted
- **THEN** backend returns authentication failure response
- **AND** backend logs an auth failure event at WARN/ERROR level without logging raw password content

#### Scenario: Admin logout requested
- **WHEN** an authenticated admin calls logout
- **THEN** backend invalidates the session token
- **AND** backend logs a structured logout event with request correlation context

#### Scenario: Backend protected APIs are denied without login
- **WHEN** a request targets protected backend API endpoints without valid admin token
- **THEN** backend interceptor SHALL reject the request with unauthorized response
- **AND** backend SHALL NOT execute downstream controller business logic

#### Scenario: Auth and documentation whitelist paths bypass interceptor
- **WHEN** a request targets configured whitelist paths (such as login/logout identity endpoints and swagger/openapi docs endpoints)
- **THEN** backend interceptor SHALL allow the request to continue without admin token validation
