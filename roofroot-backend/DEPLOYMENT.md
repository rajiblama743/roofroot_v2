# Render Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code must be pushed to GitHub
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step-by-Step Deployment

### 1. Prepare Your Code

Make sure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Set Up MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a new cluster (free tier works)
3. Create a database user
4. Get your connection string
5. Add your IP to the whitelist (or use 0.0.0.0/0 for all IPs)

### 3. Deploy on Render

1. **Sign up/Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `roofroot-backend` directory

3. **Configure the Service**
   - **Name**: `roofroot-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render will override this)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### 4. Verify Deployment

1. Wait for the build to complete (green status)
2. Click on your service URL
3. You should see: `{"message":"RoofRoot API is running","status":"success","timestamp":"..."}`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | Yes |
| `NODE_ENV` | Environment (production) | Yes |
| `PORT` | Server port (Render sets this) | No |

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation works locally: `npm run build`

### Runtime Errors
- Check Render logs in the dashboard
- Verify MongoDB connection string
- Ensure environment variables are set correctly

### CORS Issues
- The app is configured with CORS enabled
- If you have frontend issues, check the CORS configuration in `app.ts`

## Next Steps

After successful deployment:
1. Update your frontend to use the new API URL
2. Set up custom domain (optional)
3. Configure auto-deploy on git push
4. Set up monitoring and logging

## Support

- Render Documentation: [docs.render.com](https://docs.render.com)
- MongoDB Atlas: [cloud.mongodb.com](https://cloud.mongodb.com) 