# Budget Tracker OAuth Web App

This is a separate web application that handles Gmail OAuth authentication for the Budget Tracker mobile app.

## Why a Separate Web App?

Google requires HTTPS redirect URIs for Gmail's sensitive scopes. Mobile apps using Expo Go can't provide HTTPS redirects directly, so this web application acts as an intermediary:

1. User opens this web page from the mobile app (with their user ID)
2. User authenticates with Google (HTTPS redirect works here)
3. OAuth tokens are saved directly to Supabase
4. User returns to the mobile app
5. Mobile app reads the saved connection from Supabase

## Setup

### 1. Install Dependencies

```bash
cd oauth-web
npm install
```

### 2. Configure Google Cloud Console

Add this redirect URI to your Google OAuth client:

```
http://localhost:3000/callback
```

For production, use your deployed URL:
```
https://your-domain.com/callback
```

### 3. Start the Server

```bash
npm start
```

The server will run on http://localhost:3000

## Usage

### From Mobile App

The mobile app will open this URL with the user's ID:
```
http://localhost:3000?userId=USER_ID
```

### Manual Testing

Open in browser:
```
http://localhost:3000?userId=YOUR_SUPABASE_USER_ID
```

## How It Works

1. **Initial Page Load**: User lands on the page with their `userId` in the URL
2. **OAuth Initiation**: Clicking "Connect Gmail" redirects to Google's OAuth page
3. **Google Authorization**: User signs in and grants permissions
4. **Callback**: Google redirects back to `/callback` with authorization code
5. **Token Exchange**: JavaScript exchanges the code for access/refresh tokens
6. **Save to Supabase**: Tokens are saved to the `user_email_config` table
7. **Success**: User sees success message and can close the window

## Security Notes

- Client ID and Secret are embedded in the HTML for simplicity
- For production, move credentials to environment variables and use a backend API
- The current setup is suitable for development/testing with limited users
- Consider implementing proper backend OAuth flow for production

## Deployment

### Option 1: Deploy to Vercel/Netlify

1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Deploy
4. Update redirect URI in Google Cloud Console

### Option 2: Deploy to Your Own Server

1. Set up Node.js server
2. Copy files to server
3. Install dependencies: `npm install`
4. Start with PM2: `pm2 start server.js`
5. Set up reverse proxy (nginx) with SSL
6. Update redirect URI in Google Cloud Console

## File Structure

```
oauth-web/
├── public/
│   └── index.html      # Main OAuth page (client-side)
├── server.js           # Express server
├── package.json        # Dependencies
├── .env                # Environment variables
└── README.md          # This file
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
```

## Troubleshooting

### "Error 400: invalid_request"
- Check that redirect URI in Google Cloud Console matches exactly
- Ensure it's `http://localhost:3000/callback` for development

### "Failed to save connection"
- Check Supabase URL and anon key in the HTML file
- Verify the `user_email_config` table exists
- Check that the user ID is valid

### "No user ID provided"
- Make sure the mobile app is passing `userId` in the URL
- URL should be: `http://localhost:3000?userId=USER_ID`

## License

MIT
