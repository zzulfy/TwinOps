## ADDED Requirements

### Requirement: Admin-only login SHALL gate protected application pages
The system SHALL require admin authentication before accessing protected frontend routes, and SHALL redirect unauthenticated users to a dedicated login page.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** a user navigates to a protected route without valid admin session
- **THEN** the app redirects to `/login`
- **AND** protected content is not rendered

### Requirement: Backend SHALL provide admin identity APIs
The backend SHALL expose authentication endpoints for login, logout, and current-session identity retrieval for admin users.

#### Scenario: Admin login succeeds
- **WHEN** valid admin credentials are submitted
- **THEN** backend returns authenticated admin identity/session token payload
- **AND** frontend can access protected routes

#### Scenario: Invalid credentials are rejected
- **WHEN** incorrect credentials are submitted
- **THEN** backend returns authentication failure response
- **AND** frontend displays login error without entering protected pages
