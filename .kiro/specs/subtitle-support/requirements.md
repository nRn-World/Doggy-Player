# Requirements Document

## Introduction

Undertextsstöd (subtitle support) för DoggyStyle Player – en Electron + React/TypeScript mediaspelare. Funktionen låter användaren ladda undertextfiler manuellt eller automatiskt, samt justera undertextsynkronisering i realtid under uppspelning.

## Glossary

- **Player**: DoggyStyle Player-applikationen (Electron + React/TypeScript)
- **SubtitleLoader**: Komponenten/modulen ansvarig för att läsa in och tolka undertextfiler
- **SubtitleRenderer**: Komponenten ansvarig för att visa undertextrader ovanpå videon
- **SubtitleParser**: Modulen som tolkar undertextformat (SRT, VTT) till interna dataobjekt
- **SubtitleCue**: Ett enskilt undertextsegment med starttid, sluttid och textinnehåll
- **SyncOffset**: Tidsjustering i sekunder som appliceras på alla SubtitleCues under uppspelning
- **VideoFile**: En videofil som spelas upp i Player (t.ex. `.mp4`, `.mkv`, `.avi`)

## Requirements

### Requirement 1: Manuell inläsning av undertextfil

**User Story:** Som användare vill jag kunna ladda en undertextfil manuellt, så att jag kan se undertexter för valfri video oavsett filnamn.

#### Acceptance Criteria

1. THE Player SHALL tillhandahålla ett UI-element (knapp) för att öppna en filväljardialog för undertextfiler.
2. WHEN användaren väljer en fil via filväljardialogen, THE SubtitleLoader SHALL acceptera filer med ändelserna `.srt` och `.vtt`.
3. WHEN en giltig undertextfil laddas, THE SubtitleParser SHALL tolka filen till en lista av SubtitleCues.
4. IF en vald fil inte har ändelsen `.srt` eller `.vtt`, THEN THE Player SHALL visa ett felmeddelande som anger att filformatet inte stöds.
5. IF undertextfilen innehåller ogiltigt innehåll som inte kan tolkas, THEN THE SubtitleLoader SHALL visa ett felmeddelande och behålla eventuell tidigare laddad undertextfil.
6. WHEN en ny undertextfil laddas manuellt, THE Player SHALL ersätta eventuell tidigare aktiv undertextfil.

---

### Requirement 2: Automatisk inläsning av undertextfil

**User Story:** Som användare vill jag att undertexter laddas automatiskt om undertextfilen har samma namn som videofilen, så att jag slipper ladda dem manuellt varje gång.

#### Acceptance Criteria

1. WHEN en VideoFile öppnas i Player, THE SubtitleLoader SHALL söka efter en undertextfil med samma basnamn och ändelsen `.srt` i samma katalog som VideoFile.
2. WHEN en VideoFile öppnas i Player och ingen `.srt`-fil hittas, THE SubtitleLoader SHALL söka efter en undertextfil med samma basnamn och ändelsen `.vtt` i samma katalog som VideoFile.
3. WHEN en matchande undertextfil hittas automatiskt, THE SubtitleLoader SHALL ladda filen utan att kräva användarinteraktion.
4. WHEN ingen matchande undertextfil hittas, THE Player SHALL fortsätta uppspelning utan undertexter och utan att visa ett felmeddelande.
5. WHEN en VideoFile öppnas och en undertextfil laddas automatiskt, THE Player SHALL återställa SyncOffset till 0.

---

### Requirement 3: Undertextsynkronisering

**User Story:** Som användare vill jag kunna justera undertextsynkroniseringen i realtid, så att undertexterna stämmer överens med ljudet även om undertextfilen är feljusterad.

#### Acceptance Criteria

1. THE Player SHALL visa en kontroll för att justera SyncOffset i steg om 0,1 sekunder, med ett tillåtet intervall från -30 sekunder till +30 sekunder.
2. WHEN SyncOffset ändras, THE SubtitleRenderer SHALL omedelbart applicera den nya offseten på alla SubtitleCues utan att avbryta uppspelningen.
3. WHILE en undertextfil är aktiv, THE SubtitleRenderer SHALL beräkna visningstiden för varje SubtitleCue som `cue.startTime + SyncOffset` och `cue.endTime + SyncOffset`.
4. THE Player SHALL visa det aktuella SyncOffset-värdet i sekunder i UI:t.
5. WHEN användaren återställer SyncOffset, THE Player SHALL sätta SyncOffset till 0.
6. WHEN en ny VideoFile laddas, THE Player SHALL återställa SyncOffset till 0.

---

### Requirement 4: Undertextrendering

**User Story:** Som användare vill jag se undertexter tydligt ovanpå videon, så att de är läsbara oavsett videobakgrund.

#### Acceptance Criteria

1. WHILE en undertextfil är aktiv och videouppspelning pågår, THE SubtitleRenderer SHALL visa aktuell SubtitleCue centrerat längst ned på videoytan.
2. WHEN videouppspelningens aktuella tid inte faller inom någon SubtitleCues tidsintervall (justerat med SyncOffset), THE SubtitleRenderer SHALL inte visa någon undertextrad.
3. THE SubtitleRenderer SHALL rendera undertexttext med en bakgrundsskugga eller halvtransparent bakgrund för att säkerställa läsbarhet mot varierande videobakgrunder.
4. WHEN Player går in i helskärmsläge, THE SubtitleRenderer SHALL fortsätta visa undertexter korrekt positionerade på videoytan.

---

### Requirement 5: Undertextparser (SRT och VTT)

**User Story:** Som utvecklare vill jag att SubtitleParser hanterar SRT- och VTT-format korrekt, så att undertexterna visas rätt för slutanvändaren.

#### Acceptance Criteria

1. WHEN SubtitleParser tar emot en giltig SRT-sträng, THE SubtitleParser SHALL returnera en lista av SubtitleCues med korrekta start- och sluttider samt textinnehåll.
2. WHEN SubtitleParser tar emot en giltig VTT-sträng, THE SubtitleParser SHALL returnera en lista av SubtitleCues med korrekta start- och sluttider samt textinnehåll.
3. FOR ALL giltiga SubtitleCue-objekt, om SubtitleParser serialiserar och sedan tolkar om dem, SHALL resultatet vara ett ekvivalent SubtitleCue-objekt (round-trip-egenskap).
4. IF SubtitleParser tar emot en tom sträng eller en sträng utan igenkännbara undertextblock, THEN THE SubtitleParser SHALL returnera en tom lista utan att kasta ett undantag.
