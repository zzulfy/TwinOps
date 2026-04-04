## ADDED Requirements

### Requirement: Frontend SHALL enforce immediate protected-page exit on expired auth
The frontend SHALL immediately leave protected pages and route to login when backend reports unauthorized session, instead of keeping user on invalid protected context.

#### Scenario: Unauthorized API response in protected route
- **WHEN** backend returns `401` for protected API and current route is protected
- **THEN** frontend clears auth session and redirects to login
- **AND** protected page content is no longer accessible until re-login
