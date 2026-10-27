# Spec Delta

## ADDED Requirements

### Requirement: Forcing it risks a peto vestito

While a hippo pushes with less than 25 gas, it SHALL risk a peto vestito at a rate of 1.45 per second times (1 − gas/25)², so the risk grows quadratically towards an empty tank. The rule SHALL apply in the lobby and in the race, and never during the countdown, when nobody can push.

#### Scenario: Forcing to empty
- **WHEN** a hippo pushes from 25 gas down to zero
- **THEN** it soils itself about one time in three

#### Scenario: Letting go in time
- **WHEN** a hippo stops pushing at 15 gas
- **THEN** it soils itself less than one time in thirty

### Requirement: A peto vestito empties the tank

A peto vestito SHALL empty that hippo's tank and lock it out exactly as running dry does, until the gas refills to 35.

#### Scenario: The cost
- **WHEN** a hippo soils itself at 12 gas
- **THEN** its gas drops to 0 and it cannot push for about 2.2 seconds
