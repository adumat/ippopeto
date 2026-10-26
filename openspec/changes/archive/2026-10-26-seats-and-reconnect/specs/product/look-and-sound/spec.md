# Spec Delta

## ADDED Requirements

### Requirement: Away hippos

A hippo whose player is away SHALL stay on the raft, drawn faded (more than an exhausted one), with no gas particles. Its seat card SHALL read "torna subito" under the name. A free seat SHALL keep reading "libero".

#### Scenario: Teammate drops
- **WHEN** a teammate's connection drops
- **THEN** everyone sees their hippo fade and "torna subito" on their seat card until they return or the seat frees up
