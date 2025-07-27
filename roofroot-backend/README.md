# RoofRoot Backend API

A clean, production-ready Node.js + Express.js + TypeScript backend for the RoofRoot real estate platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account

### Installation

1. **Clone and install dependencies:**
```bash
cd roofroot-backend
npm install
```

2. **Environment Setup:**
```bash
cp env.example .env
```

3. **Configure MongoDB Atlas:**
   - Create a MongoDB Atlas account at [cloud.mongodb.com](https://cloud.mongodb.com)
   - Create a new cluster
   - Get your connection string
   - Update `.env` with your `MONGO_URI`

4. **Run the server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📁 Project Structure

```
roofroot-backend/
├── src/
│   ├── config/
│   │   └── database.ts    # MongoDB connection
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── package.json
├── tsconfig.json
└── env.example
```

## 🛠️ Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server
- `npm run clean` - Remove dist folder

## 🌐 API Endpoints

- `GET /` - Health check endpoint

## 🚀 Deployment

This backend is ready for deployment on:
- **Railway** - Zero-config deployment
- **Render** - Free tier available
- **Heroku** - Add buildpack for Node.js
- **Vercel** - Serverless deployment

### Environment Variables
- `MONGO_URI` - MongoDB Atlas connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## 🔧 Development

The project uses:
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin requests
- **Helmet** - Security headers

## 📝 Next Steps

Ready for adding:
- User authentication
- Property models
- API routes
- Validation middleware
- Testing setup 