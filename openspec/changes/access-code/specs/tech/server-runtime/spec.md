# Spec Delta

## MODIFIED Requirements

### Requirement: Admission limits

A WebSocket upgrade with a path other than `/ws`, or with a room id that is empty after normalisation, SHALL be refused by destroying the socket. Every other refusal SHALL complete the upgrade, send a `denied` message and close the socket, in this order of checks:
- the access code is configured and the `k` parameter does not match it (`code`);
- the room would be new and `MAX_ROOMS` (default 50) already exist (`server-full`);
- the room already has 12 clients (`room-full`).

A refused connection SHALL NOT create a room and SHALL NOT count as a client.

#### Scenario: Room cap reached
- **WHEN** 50 rooms exist and someone with a valid code opens a 51st
- **THEN** they receive `denied` with reason `server-full`, and no room is created

#### Scenario: Wrong code for a new room
- **WHEN** someone with a wrong code opens a room that does not exist
- **THEN** they receive `denied` with reason `code`, and `/stats` still shows the same number of rooms

## ADDED Requirements

### Requirement: Access code check

The access code SHALL come from the `IPPO_ACCESS_CODE` environment variable. An empty or unset variable SHALL disable the check. The comparison SHALL take the same time whatever the input, and the server SHALL NOT log the configured code or the submitted one.

#### Scenario: Code disabled
- **WHEN** `IPPO_ACCESS_CODE` is unset
- **THEN** connections without `k` are admitted

#### Scenario: Guessing by timing
- **WHEN** an attacker submits codes sharing longer and longer prefixes with the real one
- **THEN** the response time does not depend on the shared prefix
