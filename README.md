# 🍯🦡 Honey Badger Delivery

A gamified digital gift delivery app where honey badger chatbots motivate recipients to complete challenges and unlock rewards.

## 🎯 Concept

Honey Badger is like digital gift cards meets personal trainer meets loyal companion. Send challenges and rewards to friends and family through persistent, motivational honey badger AI companions that won't give up until the task is complete.

Inspired by the "Rat Things" from Snow Crash - autonomous, loyal, and relentlessly helpful digital entities.

## ✨ Features

- **Send Honey Badgers**: Create challenges with rewards (money, photos, videos, messages)
- **AI Chatbot Companions**: Each honey badger has a unique personality and motivational style
- **Challenge Verification**: Photo/video proof, fitness tracker integration, location check-ins
- **Real-time Motivation**: Persistent encouragement, progress tracking, adaptive coaching
- **Reward Delivery**: Automated gift card generation, money transfers, media sharing
- **Social Features**: Share achievements, challenge friends, create group goals

## 🏗️ Tech Stack

### Frontend (iOS Optimized)
- **React Native** with iOS-specific optimizations
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **Socket.io Client** for real-time chat
- **React Native Camera** for photo/video capture
- **HealthKit Integration** for fitness tracking
- **Push Notifications** with APNs

### Backend
- **Node.js** with Express
- **Socket.io** for real-time communication
- **PostgreSQL** with Prisma ORM
- **Redis** for session management
- **OpenAI API** for honey badger personalities
- **Stripe** for payments
- **AWS S3** for media storage
- **Apple Push Notification Service**

### AI & ML
- **OpenAI GPT-4** for honey badger personalities
- **Custom prompt engineering** for motivational coaching
- **Sentiment analysis** for adaptive responses
- **Achievement pattern recognition**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- Xcode (for iOS development)
- PostgreSQL
- Redis

### Installation

1. Clone the repository
```bash
git clone https://github.com/LewChew/honey-badger-delivery.git
cd honey-badger-delivery
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables (see `.env.example`)

5. Run database migrations
```bash
cd ../backend
npx prisma migrate dev
```

6. Start the development servers
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npx react-native run-ios
```

## 📱 App Flow

1. **Create Challenge**: User sets task, reward, and deadline
2. **Hire Honey Badger**: Choose personality and motivation style
3. **Send to Recipient**: Honey badger introduces itself and explains the challenge
4. **Daily Motivation**: Persistent check-ins, encouragement, and progress tracking
5. **Verification**: Photo/video proof or automatic tracking integration
6. **Reward Delivery**: Automated delivery of gifts upon completion
7. **Celebration**: Achievement sharing and social recognition

## 🦡 Honey Badger Personalities

- **The Relentless**: Never gives up, maximum persistence
- **The Cheerleader**: Positive reinforcement and celebration
- **The Coach**: Strategic guidance and technique tips
- **The Buddy**: Friendly companion and accountability partner
- **The Competitor**: Gamification and competitive motivation

## 🔒 Security & Privacy

- End-to-end encryption for all messages
- Secure payment processing with Stripe
- Privacy-first fitness data handling
- User consent for all data sharing
- GDPR and CCPA compliance

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

---

*"Honey badger don't care, honey badger don't give up!"* 🦡💪