# ExpiryGuard AI – Walkthrough 🚀

Welcome to **ExpiryGuard AI**, the ultimate Smart Pantry & Expiry Tracking System designed to reduce food waste and save you money!

## 🌟 Key Features

### 1. Smart Authentication 🔐
- **Email/Password:** Classic login and signup with validation.
- **Google Sign-In:** A fast, simulated "Continue with Google" flow for a modern onboarding experience.
- **Session Persistence:** You stay logged in even after refreshing the page!

### 2. Full-Stack Cloud Autosave 💾
- **Real Persistence:** Your pantry data is now synchronized with a **Flask backend** and stored in the cloud. No more losing data if you clear your browser cache!
- **Visual Sync Indicator:** Look at the top right for the new **Cloud Sync icon**. A pulsing green dot appears whenever the app is silently backing up your changes.
- **Hybrid Storage:** The app uses a smart hybrid approach, combining `localStorage` for speed and a backend API for long-term reliability.

### 3. Waste Analytics Dashboard 📊
- **Real-time Metrics:** Track your "Total Added," "Consumed," and "Wasted" items. It even estimates your **"Money Saved"** in **₹** by preventing food waste!
- **Visual Insights:** Doughnut charts for usage distribution and bar charts for monthly trends.
- **"Mark as Used" Action:** Every item has a "Use" button that feeds directly into your analytics.

### 4. Smart Shopping Assistant 🛒
- **Proactive Suggestions:** One click scans your pantry for missing essentials (Milk, Eggs, etc.) and expired items.
- **Interactive Checklist:** Track your shopping progress and manually add custom items.

### 5. AI Recipe Generator 🍳
- **Waste Rescue:** Uses Google Gemini AI (simulated or real) to suggest recipes specifically using your expiring ingredients.

### 6. Community Donation Mode 🤝
- **Reduce Waste:** List items expiring within 3 days for community pickup.
- **Interactive Simulation:** Simulate a community request to see how the status changes from "Available" to "Requested."

### 7. Smart Alerts 🔔
- **Multi-Channel:** Simulated WhatsApp and SMS alerts for expiring items.
- **Notification Panel:** A dedicated panel to view all historical alerts.

---

## 🎨 Design Philosophy
- **Glassmorphism:** Premium frosted glass effects throughout the UI.
- **Theme-Aware:** Fully optimized for both **Light** and **Dark** modes.
- **Responsive:** Designed to work perfectly on desktops, tablets, and phones.

---

## 🚀 Getting Started
1. Run the Flask backend: `python app.py`
2. Open `index.html` in your browser.
3. Sign in or use Google Sign-In.
4. Add some items and watch the magic happen!

*Built with ❤️ for a smarter, zero-waste future.*
