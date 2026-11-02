# CivicVoice AI — Intelligence v2 (Conversational Update)

A multilingual, voice-first civic complaint prototype. Citizens can describe a civic issue in Tamil, Tanglish, Telugu, Telugish, or English; review the recognised text; confirm a map location; and save a local, trackable demo record.

## What's improved in this version

- **Confidence-aware complaint classification:** all matching category rules are scored together rather than selecting the first matching keyword rule.
- **Better code-mixed phrase coverage:** adds common Tanglish/Telugish forms such as `thanni varala`, `theru vilakku eriyala`, `kuppai edukkala`, and `veedhi light pani avvatledu`.
- **Contextual disambiguation:** context helps separate water supply, water leakage, stormwater flooding, drainage, potholes, general road damage, streetlights, and power outages.
- **Negated mention handling:** a phrase such as “not a pothole, the road is cracked” should not be auto-classified as a pothole.
- **Clarify instead of guess:** when the top categories are too close, the API leaves the category unassigned, asks for another detail, returns possible categories, and shows a notice in the UI.
- **Language-candidate scoring:** the auto-detect path now uses native-script evidence plus separate Tamil- and Telugu-romanized vocabulary, instead of relying mainly on character counts.
- **Colloquial Tamil coverage:** understands phrases such as `மழை வந்தா உடனே ரோடு ஃபுல்லாக தண்ணி நிக்குது` and `ட்ரெயினும் அடச்சுக்குது`, including spelling variants.
- **Linked-issue understanding:** when rainwater is pooling on a road and a blocked drain is explicitly mentioned, flooding is the primary category while the drain blockage is preserved as a related issue in the description.
- **Natural conversation:** acknowledges what it understood and asks for only the next missing detail (usually the street/area), instead of repeating the same generic complaint question. If the citizen repeats the complaint while being asked for a location, it keeps the dialogue on the location question rather than treating the whole complaint as an address.
- **Active-state safeguards:** explicit "not blocked", "working fine", no-pothole, and no-mosquito statements are checked; later positive mentions are still evaluated.
- **Regression tests:** 81 deterministic tests cover the existing categories plus the expanded issue set in English, Tamil, Telugu, Tanglish, and Telugish, including linked rainwater/drain complaints, ambiguity, negated/resolved states, natural follow-up responses, and language-candidate ranking.
- **Broader complaint coverage:** the UI and backend now share 29 categories including water quality, open manholes, road obstructions, road signage, illegal parking, illegal dumping, air pollution, bus-stop facilities, and public infrastructure. Phrase matching includes English, Tamil, and Telugu wording for the new types.
- **Single-playback voice fix:** Gnani audio errors now use one browser-voice fallback path; new speech cancels stale or overlapping playback so one assistant response is not spoken twice.

The classifier is intentionally deterministic and transparent: its scores are ranking signals, **not calibrated probabilities**. Real-world accuracy still needs evaluation on diverse citizen recordings and transcripts. Speech recognition itself still comes from the Gnani API; this change does not claim to train or replace the underlying speech model.

## Requirements

- Node.js 20 or newer (Node.js 22 recommended)
- npm
- A Gnani API key enabled for the configured Prisma STT and Timbre TTS endpoints
- Chrome or Edge for browser microphone recording
- Internet access for Gnani APIs, map tiles, and geocoding

## Install

From the project root:

```bash
npm install
npm --prefix server install
```

Set the Gnani key in a private environment file:

**Windows PowerShell**

```powershell
Copy-Item server/.env.example server/.env
notepad server/.env
```

**macOS / Linux**

```bash
cp server/.env.example server/.env
nano server/.env
```

Set `GNANI_API_KEY` in `server/.env`. The app reads the key only on the backend. Never paste it into frontend source, chat, screenshots, or GitHub.

## Run

From the project root:

```bash
npm run dev
```

- Web interface: `http://localhost:5173`
- API server: `http://localhost:4000`
- API health: `http://localhost:4000/api/health`

The server creates `server/data/civicvoice.db` on first start and seeds fictional sample records. These are local demo records, not reports submitted by actual residents.

## Test classification and language scoring

These tests do not require a Gnani key or network access:

```bash
npm test
```

Or from the server folder:

```bash
npm test
```

## Manual test checklist

1. Choose Auto-detect and record an English, Tamil, Tanglish, Telugu, or Telugish civic issue.
2. Compare language candidates when auto-detection is uncertain; edit the recognised words before applying them.
3. Try a single issue, e.g. `theru vilakku eriyala`, `thanni varala`, `சாக்கடை அடைப்பு`, or `రోడ్డులో గుంత`.
4. Test the expanded types: “The drinking water is muddy and smells bad”, `சாக்கடை மூடி இல்லை`, `రోడ్డుపై అడ్డంకి ఉంది`, “the street name board is missing”, or `காற்று மாசு அதிகமாக உள்ளது`.
5. Try an ambiguous report, e.g. “water is flooding because the drain is blocked”. CivicVoice should request clarification instead of silently assigning a category.
6. Try the colloquial Tamil sentence `மழை வந்தா உடனே ரோடு ஃபுல்லாக தண்ணி நிக்குது ட்ரெயினும் அடச்சுக்குது`. CivicVoice should acknowledge both the waterlogging and blocked-drain detail, then ask for the affected street/area.
7. Repeat the complaint instead of giving the location. It should acknowledge it again and ask for the area, not restart the complaint or geocode the sentence as an address.
8. Try a negated mention, e.g. “not a pothole, the road is cracked”.
9. Verify location and review the complaint details before saving the local demo record.

## Important boundaries

- This is a prototype, not a production civic service.
- Submissions are stored locally in SQLite and are **not** sent to a municipality or government service.
- The complaint categories, department suggestions, and workflow status are demo logic, not official routing or resolution assurances.
- This app uses browser push-to-talk; it does not listen continuously in the background.
- Before production, add authentication and authorisation, privacy and retention controls, accessibility testing, load-tested geocoding, robust multilingual validation, monitoring, and an authorised municipal integration.
