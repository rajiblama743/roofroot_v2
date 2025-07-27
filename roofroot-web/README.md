# RoofRoot Web Frontend

A modern React Native Web application for the RoofRoot real estate platform, built with Expo and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (optional but recommended)

### Installation

1. **Install dependencies:**
```bash
cd roofroot-web
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Open in browser:**
- Press `w` to open in web browser
- Or visit `http://localhost:19006`

## 📁 Project Structure

```
roofroot-web/
├── src/
│   ├── components/
│   │   └── Header.tsx        # Reusable header component
│   ├── screens/
│   │   └── HomeScreen.tsx    # Main home screen
│   └── config/
│       └── api.ts           # API configuration
├── App.tsx                   # Main app component
├── app.json                  # Expo configuration
├── package.json
└── tsconfig.json
```

## 🛠️ Available Scripts

- `npm start` - Start Expo development server
- `npm run web` - Start web-only development server
- `npm run android` - Start Android emulator
- `npm run ios` - Start iOS simulator
- `npm run build` - Build for production web

## 🌐 Web Deployment

This app is ready for deployment on:
- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **Expo** - Built-in hosting
- **Firebase Hosting** - Google's hosting platform

### Environment Configuration

The API URL is configured in `app.json`:
```json
{
  "extra": {
    "apiUrl": "http://localhost:3001"
  }
}
```

For production, update this to your backend URL.

## 🔧 Development

The project uses:
- **React Native Web** - Cross-platform development
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Constants** - Environment configuration

## 📱 Platform Support

- ✅ **Web** - Primary target
- ✅ **iOS** - Via Expo
- ✅ **Android** - Via Expo

## 🎨 UI Components

- Clean, minimal design
- Responsive layout
- Cross-platform compatible
- Ready for custom styling

## 📝 Next Steps

Ready for adding:
- Navigation (React Navigation)
- State management (Redux/Context)
- API integration
- Authentication
- Property listings
- User profiles
- Search functionality

## 🚀 Production Build

```bash
npm run build
```

This creates a production-ready web build in the `web-build` directory. 