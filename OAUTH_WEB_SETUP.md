# OAuth Web Setup Guide

This guide will help you set up the web-based OAuth flow for Gmail integration in the Budget Tracker app.

## Overview

The web-based OAuth approach solves the HTTPS requirement issue for Gmail's sensitive scopes:

1. **Mobile App** → Opens web page with user ID
2. **Web Page** → Handles Google OAuth (HTTPS works here)
3. **Tokens** → Saved directly to Supabase
4. **Mobile App** → Reads connection status from Supabase

## Prerequisites

- Node.js installed (v18 or higher)
- Google Cloud Console project with OAuth configured
- Supabase project running

## Step 1: Install Web App Dependencies

```bash
cd oauth-web
npm install
```

## Step 2: Configure Google Cloud Console

### Add Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Click on your OAuth 2.0 Client ID (the Web application one)
4. Under "Authorized redirect URIs", add:

**For Development:**
```
http://localhost:3000/callback
```

**For Production:**
```
https://your-domain.com/callback
```

5. Click **SAVE**
6. Wait 5-10 minutes for changes to propagate

### Verify OAuth Client Type

- Make sure you're using a **"Web application"** OAuth client
- If you only have iOS/Android clients, create a new Web application client

## Step 3: Start the OAuth Web Server

```bash
cd oauth-web
npm start
```

The server will run on http://localhost:3000

You should see:
```
OAuth web server running on http://localhost:3000
Open http://localhost:3000 in your browser
```

## Step 4: Test the OAuth Flow

### Option A: From Mobile App

1. Start your React Native app: `npm start` (from root directory)
2. In the app, go to Settings → Email Integration
3. Click "Connect Gmail"
4. Your browser will open to http://localhost:3000?userId=YOUR_USER_ID
5. Click "Connect Gmail Account"
6. Authorize with Google
7. You should see "Success!" message
8. Return to the app - it should show as connected

### Option B: Manual Testing

1. Get your Supabase user ID from the app or database
2. Open in browser: `http://localhost:3000?userId=YOUR_USER_ID`
3. Follow the OAuth flow
4. Check Supabase `user_email_config` table for saved tokens

## Step 5: Verify in Supabase

1. Go to your Supabase project
2. Navigate to Table Editor → `user_email_config`
3. You should see a row with:
   - `user_id`: Your user ID
   - `email_address`: Connected Gmail
   - `oauth_access_token`: Access token
   - `oauth_refresh_token`: Refresh token
   - `is_active`: true

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

**Problem:** Google redirect URI doesn't match

**Solution:**
1. Check Google Cloud Console has EXACTLY: `http://localhost:3000/callback`
2. No trailing slashes, case-sensitive
3. Wait 5-10 minutes after changing

### "No user ID provided"

**Problem:** URL is missing userId parameter

**Solution:**
- Make sure you're opening from the mobile app
- Or manually add: `?userId=YOUR_USER_ID` to the URL

### "Failed to save connection"

**Problem:** Supabase table doesn't exist or RLS blocking

**Solution:**
1. Run the SQL migration in `supabase_query.sql`
2. Check the `user_email_config` table exists
3. Verify RLS policies allow INSERT for authenticated users

### Mobile app not detecting connection

**Problem:** Polling not working

**Solution:**
- Check console logs in mobile app
- Verify Supabase connection in mobile app
- Try manually refreshing the Email Connection screen

## Production Deployment

### Option 1: Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy
4. Update Google Cloud Console redirect URI to: `https://your-app.vercel.app/callback`
5. Update `.env` in main app: `EXPO_PUBLIC_OAUTH_WEB_URL=https://your-app.vercel.app`

### Option 2: Deploy to Your Server

1. Copy `oauth-web` folder to server
2. Install dependencies: `npm install`
3. Set up PM2: `pm2 start server.js --name oauth-web`
4. Configure nginx reverse proxy with SSL
5. Update redirect URI in Google Cloud Console
6. Update `.env` in main app with your domain

## Security Considerations

### Current Setup (Development)
- ✅ Good for development and testing
- ✅ OAuth credentials in HTML (acceptable for development)
- ⚠️ No backend validation

### Production Recommendations
1. Move credentials to backend environment variables
2. Implement backend API to handle token exchange
3. Add rate limiting
4. Add CSRF protection
5. Use HTTPS everywhere
6. Implement proper error logging

## Environment Variables

### Main App (.env)
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret
EXPO_PUBLIC_OAUTH_WEB_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### OAuth Web App (oauth-web/.env)
```env
PORT=3000
```

## Testing Checklist

- [ ] Web server starts without errors
- [ ] Can open http://localhost:3000 in browser
- [ ] OAuth flow redirects to Google
- [ ] Can authorize with test Gmail account
- [ ] Redirects back to /callback
- [ ] Success message appears
- [ ] Tokens saved in Supabase
- [ ] Mobile app detects connection
- [ ] Mobile app shows connected email
- [ ] Can disconnect from mobile app

## Next Steps

After successful OAuth setup:

1. **Configure n8n** to read tokens from Supabase
2. **Set up email processing** workflow in n8n
3. **Test end-to-end** flow with real emails
4. **Monitor** for any token refresh issues

## Support

If you encounter issues:

1. Check browser console for JavaScript errors
2. Check Supabase logs
3. Verify Google Cloud Console settings
4. Check the troubleshooting section above

## Architecture Diagram

```
┌─────────────┐
│ Mobile App  │
│             │
│ 1. Click    │
│ "Connect"   │
└──────┬──────┘
       │
       │ Opens browser with userId
       ↓
┌─────────────────────────┐
│ OAuth Web (localhost)   │
│                         │
│ 2. Shows connect page   │
└──────┬──────────────────┘
       │
       │ 3. Redirects to Google
       ↓
┌─────────────┐
│   Google    │
│   OAuth     │
│             │
│ 4. User     │
│ authorizes  │
└──────┬──────┘
       │
       │ 5. Redirects back with code
       ↓
┌─────────────────────────┐
│ OAuth Web /callback     │
│                         │
│ 6. Exchange code        │
│ 7. Get tokens           │
│ 8. Save to Supabase     │
└──────┬──────────────────┘
       │
       │ 9. Tokens saved
       ↓
┌─────────────┐
│  Supabase   │
│  Database   │
│             │
│ user_email  │
│ _config     │
└──────┬──────┘
       │
       │ 10. Mobile app polls
       ↓
┌─────────────┐
│ Mobile App  │
│             │
│ Shows:      │
│ ✓ Connected │
└─────────────┘
```

## License

MIT
