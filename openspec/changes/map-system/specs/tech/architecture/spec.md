# Spec Delta

## MODIFIED Requirements

### Requirement: Shared deterministic course

Each map SHALL be a data module under `public/maps/`, loaded by the server via `require` and by the browser as a script, through the same minimal UMD wrapper. `public/track.js` SHALL build a course from a map module and, for generated maps, a seed, and SHALL be the single source of geometry, surfaces, obstacles and moving-obstacle motion. Moving obstacles SHALL be pure functions of room time `gt` and of the course, so client and server agree without sending obstacle positions. Generation SHALL use a seeded generator, never `Math.random`.

#### Scenario: Barrel on screen
- **WHEN** the client draws a barrel at snapshot time `gt`
- **THEN** it is where the server collided it

#### Scenario: Same seed, same cave
- **WHEN** the server and a client build a generated map from the same seed
- **THEN** every point and obstacle is identical
