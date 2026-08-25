# 4th Floor Explorer

An interactive 3D walkthrough of a college floor (Foyer, Corridor, CS Lab / Room 7-12) built with Vite, vanilla JavaScript, Three.js, and Capacitor for native Android packaging.

---

## Features

- **Overview Mode:** Isometric top-down view with OrbitControls. Click on room floors to inspect them and read their details on a stylish overlay card.
- **Walk Mode:** Immersive first-person walkthrough at eye level (`y = 1.6`). Look around using inertia-based touch/mouse drags, and click on floating 3D navigation arrows to move smoothly between connected rooms (Foyer ↔ Corridor ↔ Room 7-12).
- **Premium Design:** Glassmorphic UI overlays styled with a curated Navy (`#0B2545`) palette, Outfit typography, and glowing neon 3D edges.
- **PWA Ready:** Web app manifest registration and a service worker for caching assets and offline capabilities.
- **Capacitor Wrapped:** Fully packaged for Android, supporting touch-friendly inputs.

---

## 1. Running Locally (Web Dev Server)

To run the web version locally:

1. Clone or download this project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
4. Open the local address displayed in the terminal (usually `http://localhost:5173`) in any modern browser.

---

## 2. Production Web Build (Vercel / Netlify / Staging)

To compile the application into standard web assets ready for deployment:

1. Run the build script:
   ```bash
   npm run build
   ```
2. This creates a optimized production bundle inside the `dist` folder. You can drag-and-drop this folder directly to Vercel, Netlify, or serve it on any static web host.

---

## 3. Building the Android App (APK)

This project is packaged with Capacitor, which translates the web code into native Android views.

### Prerequisites

To assemble the APK on your machine, ensure you have:
1. **Java Development Kit (JDK 17 or higher)** installed and added to your environment `PATH`.
2. **Android SDK** installed (usually via Android Studio).
3. Set the `ANDROID_HOME` environment variable pointing to your Android SDK directory.

### Building & Syncing Steps

Whenever you modify the HTML, CSS, or JS code, rebuild the APK by running:

1. **Build the web bundle:**
   ```bash
   npm run build
   ```
2. **Sync the assets to the Android folder:**
   ```bash
   npx cap sync
   ```
3. **Assemble the Debug APK:**
   Navigate to the `android` folder and run the Gradle wrapper:
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```
   *(On macOS/Linux, run `./gradlew assembleDebug`)*

### APK Output Path
Once the Gradle build finishes successfully, the output debug APK file will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
You can transfer this `.apk` file directly to any Android device to install and test the app.
