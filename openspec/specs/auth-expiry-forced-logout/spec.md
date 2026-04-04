## Purpose

Define forced logout behavior when authentication expires during protected-page usage.

## Requirements

### Requirement: Client SHALL force logout and redirect on auth expiry
When authentication becomes invalid during protected-page usage, the client SHALL immediately clear admin session state, exit the protected page context, and redirect the user to login.

#### Scenario: 401 is returned while user is on a protected page
- **WHEN** frontend receives unauthorized response for an API call and current route is not `/login`
- **THEN** client clears local admin session token/identity
- **AND** client navigates to `/login` immediately without waiting for manual user action

#### Scenario: User is informed that login is required
- **WHEN** forced redirect to login occurs due to auth expiry
- **THEN** login page SHALL display a clear prompt that authentication has expired
- **AND** user can re-authenticate and continue normal access
