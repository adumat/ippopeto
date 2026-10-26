# Spec Delta

## MODIFIED Requirements

### Requirement: Transport

The client SHALL connect to `/ws?room=<id>` over the same origin, using `wss` under HTTPS, adding `&k=<code>` when its page URL carries one. Every message SHALL be a JSON object with a `t` type field. The server SHALL ignore unparsable messages and unknown types without closing the socket. Inbound messages SHALL be capped at 2048 bytes.

#### Scenario: Garbage frame
- **WHEN** a client sends invalid JSON
- **THEN** the server drops it and the connection stays open

#### Scenario: Forwarding the code
- **WHEN** the page URL is `/?room=venerdi&k=abc`
- **THEN** the client connects to `/ws?room=venerdi&k=abc`

## ADDED Requirements

### Requirement: Denied message

A refused connection SHALL receive exactly one message, `{t:'denied', reason}`, with `reason` one of `code`, `room-full`, `server-full`. The socket SHALL then close with code 4001 for `code`, 4002 for `room-full` and 4003 for `server-full`. No `hello` and no snapshot SHALL precede it.

#### Scenario: Wrong code
- **WHEN** a client connects with a wrong `k`
- **THEN** it receives `{t:'denied', reason:'code'}` and a close with code 4001
