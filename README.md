# Academix - Modern School Communication Mobile App

Academix is a modern, high-fidelity school communication mobile application built with **React Native**, **TypeScript**, and **Expo**. It is designed to bridge the communication gap between teachers, parents, and students through intuitive real-time messaging, centralized school feeds, role-based group rooms, and a customizable theme engine.

---

## 🚀 Key Features

- **Centralized School Feed**: A clean dashboard displaying announcements, events, and science/track events with full reply thread support.
- **Real-Time WebSocket Messaging**: Instant private direct messaging featuring real-time delivery status indicators (`sent` ➔ `delivered` ➔ `read`).
- **WebRTC Signaling Integration**: Built-in signaling support for establishing peer-to-peer audio/video calls between parents and teachers.
- **Role-Based Group Rooms**: Tailored chat rooms (Class, Faculty Lounge, PIBG Parent-Teacher Council) with view permissions restricted dynamically based on user roles (`teacher`, `parent`, `student`).
- **Dynamic Theme Engine (Slate / Navy / White)**: Fluid switching between gorgeous high-contrast Light and Dark modes.
- **Do Not Disturb (DND) Mode**: Toggle DND on your profile to automatically mute incoming mock simulated replies.

---

## 🛠️ Architecture & Tech Stack

- **Core Framework**: React Native (0.85.3) & Expo SDK 56
- **Language**: TypeScript (v6.0)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs v7)
- **Local Storage / Mock Database**: Simulates database operations (feeds, replies, group rooms, direct messaging) with custom validation loops and asynchronous database service pipelines.
- **WebSocket Gateway**: Configured to connect to `ws://localhost:8080` with a resilient fallback to an automated message delivery simulator.

---

## 📁 Project Structure

```bash
Academix/
├── assets/                  # Visual assets (light/dark logos, app icons, splash screens)
├── constants/
│   └── theme.ts             # Theme configuration (Light/Dark colors, fonts, margins)
├── hooks/
│   ├── ThemeContext.tsx     # Provides theme state, toggle utility, and context mapping
│   └── useWebSockets.ts     # Implements TCP WebSocket connections & WebRTC signaling
├── navigation/
│   └── AppNavigator.tsx     # Defines Bottom Tab bar and stack navigation routes
├── screens/
│   ├── FeedScreen.tsx             # School announcements feed
│   ├── ThreadDetailScreen.tsx     # Thread reply detail screen
│   ├── GroupsScreen.tsx           # Class, faculty, and PIBG group list
│   ├── GroupChatScreen.tsx         # Group conversation screen
│   ├── DirectChatScreen.tsx       # Direct messages contact list
│   ├── ChatConversationScreen.tsx # 1-to-1 conversation view with delivery/read ticks
│   └── ProfileScreen.tsx          # Settings screen for theme toggling, roles, and DND
├── services/
│   └── database.ts          # In-memory local database layer simulating CRUD actions
├── types/
│   └── academic.ts          # Strictly typed interfaces for users, chats, messages, and threads
├── App.tsx                  # Main entry point bootstrapping Providers and AppNavigator
├── app.json                 # Expo configurations
├── tsconfig.json            # TypeScript configuration
└── package.json             # App scripts and dependency definitions
```

---

## ⚙️ Database & Role-Based Rules

Academix enforces role permissions across the application:
- **Teachers**: Full visibility across all group channels, including the *Faculty Lounge*.
- **Parents**: Access to class-specific rooms and the *Parent-Teacher Council (PIBG)*.
- **Students**: Restricted access only to their specific class channels.

---

## 🚦 Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+) and **npm** installed on your development machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Fighter224/academix.git
   cd academix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server using Expo:

```bash
# Start Expo development environment
npm run start

# Launch on Android Emulator / Device
npm run android

# Launch on iOS Simulator / Device
npm run ios

# Launch in Web Browser
npm run web
```

---

## 📡 WebSocket & WebRTC Details

The application attempts to connect to `ws://localhost:8080` to broadcast live chat events. If the local development gateway is offline, it instantly falls back to an **interactive delivery simulator** that:
- Transitions messages through visual states: `Sent` ➔ `Delivered` ➔ `Read`
- Sends automated conversational responses from recipient profiles (Teachers / Parents)
- Generates localized mock WebRTC signals to demonstrate peer-to-peer handshake logic.
