# 🌱 SoulSync — AI Self-Care Companion

SoulSync is an empathetic mental wellness web application featuring a virtual companion, daily mood tracking, typing cadence sensing, secure encryption, and safety circles.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: Firebase (Auth + Firestore) with dynamic client-side AES encryption
- **APIs**: Google Gemini AI (`gemini-1.5-flash`) & Twilio SMS

---

## ⚡ Quick Start (Local Run)

Since Node.js is configured in this workspace under the `/node` folder, you can run the following commands using the pre-configured paths.

### 1. Launch the Backend
From the project root directory, run:
```powershell
# Set path and start backend
$env:PATH = "$pwd\node;" + $env:PATH
cd backend
npm run dev
```
*Runs on `http://localhost:5000`.*

### 2. Launch the Frontend
In a new shell window:
```powershell
# Set path and start frontend
$env:PATH = "$pwd\node;" + $env:PATH
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🛡️ Dual-Mode Configuration

SoulSync is designed to run in **Demo Mode** out-of-the-box, meaning you don't need active API keys to preview the features:
- Authentication falls back to a simulated Local Auth (`localStorage`).
- Chat features use a rule-based empathetic responder.
- SMS alerts log directly to the backend terminal window.

To switch to **Production Mode**, configure the credentials:
- **Backend `.env`**: Add your `GEMINI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
- **Frontend `.env`**: Create a `frontend/.env` file with:
  ```env
  VITE_FIREBASE_API_KEY=your_key
  VITE_FIREBASE_AUTH_DOMAIN=your_domain
  VITE_FIREBASE_PROJECT_ID=your_id
  VITE_FIREBASE_STORAGE_BUCKET=your_bucket
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```
