# ✈️ Air Battle Typing

A hyper-realistic, cinematic typing game built with **Next.js**, **TypeScript**, and **Tailwind CSS** — experience the thrill of aerial combat while sharpening your typing skills!

![Game Preview](/asset/c1.png)  
![Game Preview](/asset/c2.png)  
![Game Preview](/asset/c3.png)  
![Game Preview](/asset/c4.png)

---

## 🌟 Features

### 🎨 Enhanced Visual Design
- Vibrant **gradient backgrounds** with smooth transitions
- Glowing **neon borders** (cyan, yellow, green)
- **Gradient buttons** with animated hover effects
- Deep shadows and a modern futuristic UI

### ☁️ Real-Time Moving Clouds
- Animated clouds with **natural parallax**
- Variable speed and **realistic off-screen entry**
- Multiple cloud layers for visual depth

### ✈️ Realistic Combat Simulation
- **JF-17 Thunder** fighter jet 🇵🇰
- **Jet exhausts**, contrails, missile trails
- **Radar UI**, missile locks, and combat overlays
- Altitude grid lines for realistic battlefield awareness

### 🎯 Typing Mechanics
- Real-time typing challenge with **gradient feedback**
- Live **accuracy, WPM, score, and result** tracking
- Military-style HUD and status indicators

### 💥 Special Effects
- Twinkling stars & animated space background
- Explosions, rocket trails, and velocity indicators

### 📊 Firebase Leaderboard Integration ✅
- **Firestore integration** for real-time score tracking
- Tracks **player name, score, WPM, accuracy, win/lose**
- **Leaderboard page** with player stats:
  - Total games, average WPM, win rate, best score
- Fallback to **localStorage** if Firebase fails

---

## 🔧 Tech Stack

| Tech        | Details                           |
|-------------|-----------------------------------|
| Framework   | [Next.js](https://nextjs.org/)    |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS                      |
| Animations  | CSS Keyframes + Custom Utilities  |
| Firebase    | Firestore DB for scores & leaderboard |
| Assets      | Real military aircraft and effects |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/air-battle-typing.git
cd air-battle-typing

# Install dependencies
npm install

# Run the development server
npm run dev
