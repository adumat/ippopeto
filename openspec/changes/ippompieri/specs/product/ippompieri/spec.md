## ADDED Requirements

### Requirement: The switch

The lobby and the results card SHALL show a switch labelled "Ippompieri (VM18)" next to the map selector. Any seated player SHALL be able to flip it; the last choice SHALL win, and everyone in the room SHALL see it at once. Spectators SHALL see it but SHALL NOT change it. The switch SHALL NOT change during the countdown, the race or a pause. A new room SHALL start with the mode off.

#### Scenario: Turning it on
- **WHEN** a seated player flips the switch in the lobby
- **THEN** every screen in the room switches to the Ippompieri copy, look and sounds

#### Scenario: During a race
- **WHEN** the race is running
- **THEN** the switch cannot be flipped

### Requirement: The notice

The first time a player sees the mode on in a page load, a card SHALL show "Contiene scene di spinta esplicita tra adulti consenzienti." with the button "Ho 18 anni e acconsento". Dismissing it SHALL NOT affect anyone else. The card SHALL NOT stop the game behind it.

#### Scenario: Joining a room already in the mode
- **WHEN** a player opens a room link while the mode is on
- **THEN** they see the notice once and can dismiss it

### Requirement: Title

With the mode on, the browser tab SHALL read "Ippompieri" and the lobby SHALL show the title "Ippompieri: spingono, sempre, forte". With the mode off, everything SHALL read "Ippopeto" as before.

#### Scenario: Tab title
- **WHEN** the mode is turned on
- **THEN** the tab title changes to "Ippompieri"

### Requirement: Copy in the mode

With the mode on, these texts SHALL replace the originals. `{nome}` is the player's name and `{i}`/`{n}` are the checkpoint numbers. Everything not listed SHALL stay as it is, the map names included.

| Where | Original | Ippompieri |
|---|---|---|
| Lobby heading | Equipaggio | L’ammucchiata |
| Sit button | Siediti | Mi unisco all’ammucchiata |
| Start button | Si parte | Su gli idranti! |
| Solo hint | Da soli si gira in tondo… | Da soli non è la stessa cosa. Invita qualcuno. |
| Keys | giri il sedere | mostri il lato B |
| Keys | spingi, finché c’è gas | spingi finché ti regge |
| Gas bar label | (none) | Serbatoio |
| Sync banner | Tutti insieme! | Venite insieme! |
| Checkpoint toast | Checkpoint {i} di {n} | Spintarella {i} di {n} |
| Peto vestito toast | {nome} se l’è fatta addosso | {nome} è venuto troppo presto. |
| Bite toast (Fiume) | Gnam! … | Il coccodrillo vi ha presi da dietro. |
| Jet toast (Fogne) | Che schifo! … | Il tubo vi è venuto addosso. |
| Thin ice toast (Fiordo) | Splash! … | Rotto il ghiaccio: ora fate amicizia. |
| Bomb toast (Lava) | Bum! … | Vampata! Qualcuno è in menopausa? |
| Vent (Lava) | (sound only) | Ce l’hai di fuoco! |
| Bats toast (Grotta) | Pipistrelli! | Vi sono saltati addosso. |
| Void toast (Stelle) | Caduti nel vuoto! … | Oops, è uscito. |
| Turbo (Stelle) | (sound only) | Più a fondo! |
| Pause heading | In pausa | Pausa sigaretta |
| Pause buttons | Ricomincia · Termina la gara | Rifacciamolo · Basta, sono distrutto |
| Results heading | Arrivati | Siete venuti tutti. |
| Best times | Migliori tempi: {mappa} | Le sveltine migliori: {mappa} |
| Peti vestiti count | 3 peti vestiti | 3 schizzi fuori programma |
| Causes | morso di coccodrillo | sorpresa da dietro |
| Causes | morso di ratto | ratto con le mani lunghe |
| Causes | morso d’orso | abbraccio d’orso da dietro |
| Causes | morso di salamandra | leccata di salamandra |
| Causes | morso di pesce cieco | pesce palpatore |

Every cause SHALL have a plural form, as the originals do. Map hints SHALL swap the fart wording for the hose. The copy rules of `product/look-and-sound` SHALL still apply, except the sticker in "The look".

#### Scenario: A crocodile bite
- **WHEN** a crocodile bites the raft with the mode on
- **THEN** everyone reads "Il coccodrillo vi ha presi da dietro." and the results count it as a "sorpresa da dietro"

### Requirement: The look

With the mode on:
- every hippo SHALL wear a red firefighter helmet;
- the gas particles SHALL become a white hose jet from the hippo's rear, in the same direction and with the same cap;
- the touch push button SHALL show 🧯;
- during the race, a round red "VM18 consensuale" sticker SHALL sit in a corner without covering the HUD;
- the peto vestito splats and the culprit's stain SHALL be white foam instead of brown.

#### Scenario: Pushing
- **WHEN** a hippo pushes with the mode on
- **THEN** a white jet comes out of its rear where the gas cloud used to be

### Requirement: The fire captain

With the mode on, a shirtless fire captain in braces SHALL stand in the middle of the raft. He SHALL take no seat and never push. Every time the raft passes a checkpoint, he SHALL spray his hose wildly for about three seconds. While he sprays, the raft SHALL get small random shoves that every screen sees alike, weak enough for the crew to hold its course.

#### Scenario: Checkpoint
- **WHEN** the raft passes a checkpoint with the mode on
- **THEN** the captain sprays at random for about three seconds and the raft wobbles

#### Scenario: Mode off
- **WHEN** the mode is off
- **THEN** there is no captain and checkpoints do not move the raft

### Requirement: Sounds in the mode

With the mode on:
- every push SHALL play a hose jet, varied like the fart voices;
- pushing together SHALL add a choral "oh sì";
- a peto vestito SHALL play an "ops" and a splash;
- a bite SHALL play, at random, either a slap with a floating "Maleducato!" or a surprised moan.

Volume and mute SHALL work as for every other sound.

#### Scenario: Bite sound
- **WHEN** the crew gets bitten twice with the mode on
- **THEN** each bite plays either the slap with "Maleducato!" or the moan, chosen at random
