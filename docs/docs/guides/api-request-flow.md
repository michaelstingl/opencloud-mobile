---
sidebar_position: 6
---

# API Request Flow

Diese Dokumentation erklärt den vollständigen Ablauf eines API-Requests in der OpenCloud Mobile App, von der Initiierung bis zur Verarbeitung der Antwort.

## Übersicht des Request-Flows

Ein typischer API-Request in der OpenCloud Mobile App durchläuft folgende Phasen:

1. **Request-Initiierung**: Ein Komponent oder Hook fordert Daten an
2. **Header-Erstellung**: Standardisierte Header werden erstellt
3. **Request-Vorbereitung**: Die Anfrage wird konfiguriert
4. **Logging (Pre-Request)**: Die Anfrage wird protokolliert
5. **Netzwerkanfrage**: Die eigentliche HTTP-Anfrage wird gesendet
6. **Antwortverarbeitung**: Die Serverantwort wird verarbeitet
7. **Logging (Post-Request)**: Die Antwort wird protokolliert
8. **Fehlerbehandlung**: Eventuelle Fehler werden behandelt
9. **Datenrückgabe**: Die verarbeiteten Daten werden zurückgegeben

## Detaillierte Phasen

### 1. Request-Initiierung

API-Requests werden typischerweise von React-Komponenten über einen Hook oder direkt über einen Service initiiert:

```typescript
// Beispiel: Initiierung über einen Hook
function UserProfileScreen() {
  const { userData, loading, error } = useUserData();
  // ...
}

// Beispiel: Direkte Nutzung des API-Services
async function fetchUserData() {
  const userData = await ApiService.getCurrentUser();
  // ...
}
```

### 2. Header-Erstellung

Alle Requests verwenden standardisierte Header, die über die `HttpUtil.createStandardHeaders()` Methode erzeugt werden:

```typescript
// Erstellen der Standard-Header
const headers = HttpUtil.createStandardHeaders(
  true,               // includeAuth: Authentifizierungs-Header einfügen?
  this.accessToken,   // token: Das Auth-Token, falls inkludiert
  'application/json'  // contentType: Format des Request-Body
);
```

Die Header enthalten:
- `Content-Type`: Definiert das Format des Request-Body (Standard: 'application/json')
- `Accept`: Definiert akzeptierte Antwortformate
- `User-Agent`: Identifiziert die App-Version und Plattform
- `X-Request-ID`: Eindeutige UUID für Request-Korrelation
- `Authorization`: Auth-Token, falls Authentifizierung erforderlich ist

### 3. Request-Vorbereitung

Die Request-Optionen werden mit `HttpUtil.createRequestOptions()` erstellt:

```typescript
// Erstellen der Request-Optionen
const options = HttpUtil.createRequestOptions(
  'GET',       // HTTP-Methode
  headers,     // Vorbereitete Header
  requestBody  // Optional: Request-Body als String
);
```

Wichtige Optionen:
- `method`: HTTP-Methode (GET, POST, PUT, DELETE, etc.)
- `redirect: 'manual'`: Verhindert automatisches Folgen von Weiterleitungen
- `headers`: Die standardisierten Header
- `body`: Request-Body (falls vorhanden)

### 4. Logging (Pre-Request)

Vor dem Senden wird der Request protokolliert:

```typescript
// Request protokollieren
HttpUtil.logRequest(
  requestId,    // UUID zur Nachverfolgung
  'API',        // Service-Präfix für Logs
  url,          // Ziel-URL
  method,       // HTTP-Methode
  headers,      // Header (sensible Daten werden redigiert)
  body          // Request-Body (falls vorhanden)
);

// Optional: cURL-Befehl für Debugging generieren
if (apiConfig.logging?.generateCurlCommands) {
  const curlCommand = HttpUtil.generateCurlCommand(url, options);
  console.log(`[API:${requestId}] Äquivalenter curl-Befehl:\n${curlCommand}`);
}
```

### 5. Netzwerkanfrage

Der eigentliche HTTP-Request wird mit der Fetch-API gesendet:

```typescript
// Timing starten
const requestStartTime = Date.now();

// Request ausführen
const response = await fetch(url, options);

// Timing beenden
const requestDuration = Date.now() - requestStartTime;
```

### 6. Antwortverarbeitung

Die Antwort wird basierend auf Status-Code und Content-Type verarbeitet:

```typescript
// Antwort protokollieren
await HttpUtil.logResponse(requestId, 'API', response, requestDuration);

// Status-Code prüfen
if (!response.ok) {
  // Fehlerbehandlung (siehe Punkt 8)
  throw new Error(`API-Anfrage fehlgeschlagen: ${response.status}`);
}

// Content-Type prüfen und Antwort entsprechend verarbeiten
const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
  return await response.json();
} else {
  return await response.text();
}
```

### 7. Logging (Post-Request)

Nach Erhalt wird die Antwort protokolliert:

```typescript
// Protokollierung der Antwort mit HttpUtil
await HttpUtil.logResponse(
  requestId,        // UUID zur Nachverfolgung
  'API',            // Service-Präfix für Logs
  response,         // Die vollständige Response
  requestDuration   // Dauer der Anfrage in ms
);
```

Die Protokollierung umfasst:
- Antwort-Status und Status-Text
- Antwort-Header
- Antwortzeit in Millisekunden
- Bei aktiviertem Debug-Logging: Antwort-Body (gekürzt auf konfigurierte Maximallänge)

### 8. Fehlerbehandlung

Fehler werden strukturiert behandelt und mit Kontext angereichert:

```typescript
try {
  // API-Anfrage...
} catch (error) {
  // Fehlerprotokollierung
  console.error(`[API:${requestId}] Anfrage fehlgeschlagen nach ${requestDuration}ms: ${error.message}`);
  
  // Fehlerklassifizierung
  if (error.name === 'AbortError') {
    console.error(`[API:${requestId}] Request-Timeout`);
  } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
    console.error(`[API:${requestId}] Netzwerkverbindungsfehler`);
  }
  
  // Fehler weiterleiten für übergeordnete Behandlung
  throw error;
}
```

### 9. Datenrückgabe

Nach erfolgreicher Verarbeitung werden die Daten zurückgegeben:

```typescript
// Daten an den Aufrufer zurückgeben
return processedData;
```

## Spezielle Anwendungsfälle

### Umgang mit Weiterleitungen

Bei Weiterleitungsantworten (Status-Codes 300-399) werden diese manuell verarbeitet:

```typescript
if (response.status >= 300 && response.status < 400) {
  const redirectUrl = response.headers.get('location');
  return { redirectUrl, status: response.status };
}
```

### Authentifizierte vs. Nicht-Authentifizierte Anfragen

- **Authentifizierte Anfragen**: Verwenden das gespeicherte Access-Token im Authorization-Header
- **Nicht-Authentifizierte Anfragen**: Senden keine Auth-Header (z.B. WebFinger- oder OIDC-Konfigurationsanfragen)

### Deaktivierung der Logging-Funktionalität

Das Logging kann über die Konfiguration gesteuert werden:

```typescript
// In config/app.config.ts
logging: {
  maxBodyLogLength: 1000,
  generateCurlCommands: true,
  enableDebugLogging: false, // Auf true setzen, um ausführliches Logging zu aktivieren
}
```

## Beispiel eines vollständigen Request-Flows

Hier ist ein vollständiges Beispiel des API-Request-Flows für das Abrufen von Benutzerinformationen:

```typescript
async function getCurrentUser() {
  const operationId = HttpUtil.generateUuid();
  
  try {
    console.log(`[API:${operationId}] Benutzerinformationen werden abgerufen`);
    
    // Verschiedene API-Endpunkte versuchen (mit Fallback)
    try {
      console.log(`[API:${operationId}] Graph-Endpunkt wird versucht: /graph/v1.0/me`);
      
      // Header erstellen
      const headers = HttpUtil.createStandardHeaders(true, this.accessToken);
      
      // Request-Optionen erstellen
      const options = HttpUtil.createRequestOptions('GET', headers);
      
      // URL erstellen
      const url = `${this.baseUrl}/graph/v1.0/me?$expand=memberOf`;
      
      // Request protokollieren
      HttpUtil.logRequest(operationId, 'API', url, 'GET', headers);
      
      // Optional: cURL-Befehl generieren
      if (apiConfig.logging?.generateCurlCommands) {
        const curlCommand = HttpUtil.generateCurlCommand(url, options);
        console.log(`[API:${operationId}] Äquivalenter curl-Befehl:\n${curlCommand}`);
      }
      
      // Anfrage senden
      const startTime = Date.now();
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      // Antwort protokollieren
      await HttpUtil.logResponse(operationId, 'API', response, duration);
      
      // Fehler prüfen
      if (!response.ok) {
        throw new Error(`API-Anfrage fehlgeschlagen: ${response.status}`);
      }
      
      // Antwort verarbeiten und zurückgeben
      return await response.json();
      
    } catch (graphError) {
      // Fallback zum regulären Endpunkt bei Fehler
      console.error(`[API:${operationId}] Graph-Endpunkt fehlgeschlagen:`, graphError.message);
      
      // Ähnlicher Prozess für den Fallback-Endpunkt...
      // [...]
    }
  } catch (error) {
    // Allgemeine Fehlerbehandlung
    console.error(`[API:${operationId}] Fehler beim Abrufen der Benutzerinformationen:`, error.message);
    throw error;
  }
}
```

## Schlüsselkonzepte und Best Practices

1. **Einheitlichkeit**: Alle Anfragen verwenden dieselben Dienstprogramme und Standards
2. **Nachverfolgbarkeit**: Jede Anfrage hat eine eindeutige ID für die End-to-End-Nachverfolgung
3. **Sicherheit**: Manuelle Weiterleitungssteuerung und Redaktierung sensibler Daten in Logs
4. **Fehlerbehandlung**: Strukturierte Fehlererfassung und -berichterstattung
5. **Performance-Messung**: Zeitmessung für jede Anfrage zur Leistungsüberwachung
6. **Konfigurierbarkeit**: Logging-Verhalten ist über die Konfiguration steuerbar