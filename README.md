# GreenTrack AI 🌍♻️

GreenTrack AI is a smart waste management platform designed to help communities keep their cities clean and environmentally friendly. Using Google's Gemini AI, it identifies and classifies waste from images, helping users dispose of it properly while gamifying the experience to encourage eco-friendly behavior.

## 🚀 Features

- **AI Waste Classification:** Snap a photo of waste, and Gemini AI will categorize it (plastic, organic, metal, etc.) and provide disposal instructions.
- **Real-time Waste Mapping:** Visualize waste hotspots and collection points in your community.
- **Community Gamification:** Earn points and badges for every report you make. Climb the leaderboard and become a local "Eco Warrior".
- **Impact Tracking:** Monitor the total waste diverted from landfills by the community.

## 🛠️ Tech Stack

- **Frontend:** Angular 19+ (Signals, Standalone Components)
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini 1.5 Flash (@google/genai)
- **Backend:** Firebase (Firestore, Authentication, Storage)

## 📦 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/greentrack-ai.git
   cd greentrack-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or use the platform's secret manager) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Firebase Setup:**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore Database**, **Authentication** (Google Provider), and **Storage**.
   - Add your Firebase configuration to `src/app/firebase-applet-config.json`.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ for a cleaner planet.
