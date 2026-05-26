# CPS Mobile — Flutter Web App

Crime Prevention System mobile-first app built with Flutter Web.

## Prerequisites

Install these before anything else:

1. **Flutter SDK** → https://docs.flutter.dev/get-started/install
   - After installing, run: `flutter doctor` to verify everything is OK
   - Make sure Chrome is installed (for web)

2. **VSCode** with the **Flutter extension** installed
   - Open Extensions (Ctrl+Shift+X) → search "Flutter" → Install

---

## Setup in VSCode

### Step 1 — Open the Flutter project folder

```
File → Open Folder → select the `flutter_app` folder
```

### Step 2 — Get dependencies

Open the VSCode terminal (Ctrl+`) and run:

```bash
flutter pub get
```

### Step 3 — Configure the backend URL

Open `lib/services/api_service.dart` and update `kBaseUrl`:

```dart
// If running the Replit backend (recommended):
const String kBaseUrl = 'https://YOUR-REPLIT-APP-URL.replit.dev';

// If running the backend locally on port 5000:
const String kBaseUrl = 'http://localhost:5000';
```

> Your Replit backend URL is shown in the Replit preview panel.

### Step 4 — Run the app in Chrome

```bash
flutter run -d chrome
```

That's it! The app will open in Chrome automatically.

---

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Citizen | ogwang_daiel | btynatqnavry |
| Police IO | otim_joshua | iam josh |
| Police OC | jowie | 123456789 |
| Police DPC | dpc_demo | password123 |
| Admin | admin | password123 |

---

## Features

### Citizen (Green Theme)
- **Dashboard** — Quick actions, community alerts, invisible mode (swipe up/down)
- **SOS Emergency** — Hold 3 seconds to activate, 6-second choice window
- **AI Chat** — AI-powered crime reporting assistant
- **My Reports** — Submit and track crime reports

### Police (Blue Theme)
- **Dashboard** — All cases with status stats, alerts tab
- **Case Detail** — Timeline, messaging, status updates

### Auto-Fit Screen
The app automatically scales to fit any screen/window size using Flutter's `LayoutBuilder` + `Transform.scale`. Designed for 390×844 (iPhone 14 size) then scaled to fit your browser window.

---

## Project Structure

```
lib/
  main.dart              # App entry point + router
  theme/
    app_theme.dart       # Green/blue themes
  models/
    user.dart            # User model
    report.dart          # Report model
    alert.dart           # Alert model
  services/
    api_service.dart     # All API calls to backend
  providers/
    auth_provider.dart   # Authentication state
  screens/
    login_screen.dart    # Login + Register
    citizen/
      citizen_dashboard.dart
      citizen_sos.dart
      citizen_chat.dart
      citizen_reports.dart
    police/
      police_dashboard.dart
      report_detail_screen.dart
  widgets/
    auto_fit_screen.dart # Auto-scale to fit any screen
```

---

## Backend

The backend is a Node.js/Express app connected to Supabase PostgreSQL.
It runs on Replit and is already live. You do **not** need to run the backend locally.

If you want to run it locally:
```bash
# In the root project folder (not flutter_app/)
npm install
npm run dev
```
Then set `kBaseUrl = 'http://localhost:5000'` in `api_service.dart`.
