# 📄 Product Requirements Document (PRD)

## Product: **60% Trap** (Web App)

---

## 1. 🎯 Product Overview

**60% Trap** is a fast, interactive web-based simulation that demonstrates how people lose money even when the odds are in their favor.

Users play a biased coin flip game (60% win probability) and quickly discover that **poor bet sizing leads to failure**, despite having a statistical edge.

The experience is designed to be:

* ⚡ Instant (no login, no install)
* 🎮 Highly interactive
* 🧠 Insight-driven (learn by doing, not reading)

---

## 2. 🎯 Goals & Objectives

### Primary Goals

* Deliver a **complete game experience in under 5 Minutes**
* Enable **1-click start gameplay**
* Maximize **shareability and virality**
* Teach **risk management subconsciously**

### Secondary Goals

* Collect behavioral insights (optional analytics)
* Create a strong **portfolio-grade web app**
* Serve as a base for future mobile app

---

## 3. 👤 Target Users

* Beginner investors
* Students (probability / finance)
* Tech-savvy users
* Social media users (viral sharing)

---

## 4. 🧩 Core Features

### 4.1 Game Mechanics

* Starting balance: **$25**
* Win probability: **60% (hidden by default)**
* Loss probability: **40%**
* Max cap: **$250**
* Game ends when:

  * Balance = $0 (bankrupt)
  * Balance ≥ $250 (win)

---

### 4.2 Betting System

* Defailt lasyt bet
* Quick bet buttons:
     -5$+
  * 10% / 20% / 50% / ALL-IN
* Optional:

  * Slider for custom bet
* “Repeat last bet” (auto-enabled)

---

### 4.3 Core Gameplay Loop (Ultra Minimal)

```id="gameflow01"
Landing → Start Game → Tap Flip → Repeat → End → Result → Replay
```

👉 No unnecessary screens
👉 No forms / login / setup

---

### 4.4 Coin Flip Interaction

* Single **“FLIP” button**
* Instant or animated result (≤ 500ms)
* Visual feedback:

  * ✅ Win → green flash + balance increase
  * ❌ Loss → red flash + balance drop

---

### 4.5 Results & Insight Screen

Displayed immediately after game ends:

#### Metrics

* Final balance
* Total rounds
* Max win/loss streak
* Peak balance

#### Behavioral Insight (auto-generated)

Examples:

* “You went bankrupt due to aggressive betting.”
* “You underutilized your advantage.”
* “You played close to optimal strategy.”

#### CTA

* “Play Again”
* “Share Result”

---

### 4.6 Shareability (Key Feature 🚀)

* Generate share text:

  * “I lost everything in a 60% winning game 😅 Try it”
* Copy link button
* Optional:

  * Social share (WhatsApp / Twitter)

---

### 4.7 Theme & UI

* Default: **Dark modern theme**
* Toggle: Light / Dark mode
* Design style:

  * Minimal
  * High contrast
  * Rounded UI
  * Smooth transitions

---

## 5. 🎨 UI/UX Requirements

### Design Principles

* **Zero friction**
* **Instant clarity**
* **Minimal clicks (≤2 to start)**
* **Mobile-first responsive**

---

### Key Screens

#### 5.1 Landing Screen

* Title: **60% Trap**
* Subtitle: “You have a 60% chance to win. Can you make money?”
* CTA: **Start Playing**

---

#### 5.2 Game Screen

* Top: Balance display
* Center: Coin / result feedback
* Bottom:

  * Bet controls
  * Flip button (primary focus)

---

#### 5.3 Result Screen

* Summary stats
* Insight message
* Replay button
* Share button

---

## 6. 📱 Responsiveness

* Mobile-first design
* Breakpoints:

  * Mobile (primary)
  * Tablet
  * Desktop
* Touch-friendly controls
* No hover dependency

---

## 7. ⚙️ Technical Requirements

### Tech Stack Options

**Option A (Recommended for you):**

* Flutter Web

**Option B (Faster iteration):**

* React + Vite

---

### Performance

* Initial load < 2s
* Interaction latency < 100ms
* Smooth animations (60fps)

---

### State Management

* Lightweight (Provider / Riverpod / Zustand)

---

### Randomness

* Pseudo-random generator (client-side)
* Ensure fairness perception

---

## 8. 📊 Analytics (Optional but Powerful)

Track:

* Games started
* Completion rate
* Avg rounds per session
* Bankruptcy rate
* Avg bet size

---

## 9. 🚀 Future Enhancements

* Strategy suggestions (e.g., “Try 20% rule”)
* Graph of balance over time
* Leaderboard (optional)
* Daily challenge mode
* Educational overlay mode

---

## 10. ⚠️ Risks & Considerations

* Must avoid perception of gambling
* Keep focus on **education + simulation**
* Avoid complexity creep

---

## 11. 🧠 Core Product Philosophy

> “Let users fail fast — and learn instantly.”

No tutorials.
No long explanations.
**The experience is the teacher.**

---

## 12. ✅ Definition of Done

* Game playable within **2 clicks**
* Fully responsive (mobile-first)
* Dark/light mode working
* Smooth UI and animations
* Insightful result screen
* Share feature implemented

---

## 🔥 Final Vision

A user should:

1. Click the link
2. Play for 30–60 seconds
3. Lose (most likely)
4. Think:

> “Wait… how did I lose with a 60% chance?”

That moment = success.

---
