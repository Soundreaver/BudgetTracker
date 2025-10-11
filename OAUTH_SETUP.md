# Gmail OAuth Setup Guide

## Error: "Access blocked: Authorization Error - Error 400: invalid_request"

This error occurs because the redirect URI needs to be added to your Google Cloud Console OAuth configuration.

## Fix Steps:

### 1. Update Redirect URI in Google Cloud Console

**IMPORTANT**: Your app uses Expo's authentication proxy which requires this specific redirect URI.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with Client ID `72248493733-...`)
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. **CRITICAL**: Check what "Application type" is selected:
   - If it says "Web application" - this is CORRECT, keep it
   - If it says "iOS" or "Android" - you need to create a NEW OAuth client as "Web application"

6. In the **Authorized redirect URIs** section, **ADD** this EXACT URI:
   
   ```
   https://auth.expo.io/@soundreaver/budget-tracker
   ```
   
   **CRITICAL**: 
   - Must be EXACTLY `https://auth.expo.io/@soundreaver/budget-tracker`
   - The `@soundreaver` must match your Expo username
   - The `budget-tracker` must match your app slug from app.json
   - Copy/paste to avoid typos
   - Do NOT remove any existing redirect URIs, just add this one

7. Click **Save**
8. **WAIT 5-10 minutes** for Google's changes to propagate

### 2. Verify OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Make sure the app is configured:
   - **App name**: Budget Tracker
   - **User support email**: Your email
   - **Developer contact information**: Your email
3. Add these scopes (if not already added):
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
4. Click **Save and Continue**

### 3. Add Test Users

For testing, your app can remain in "Testing" mode, but you need to add ALL Gmail accounts that will test the app:

1. Go to **OAuth consent screen**
2. Under **Test users**, click **ADD USERS**
3. Add BOTH accounts (or whichever Gmail you want to connect):
   - `soundburztwave@gmail.com`
   - `saadmansakif7@gmail.com`
4. Click **Save**

**Important**: In "Testing" mode, ONLY the Gmail accounts listed as test users can authorize the app. If you try to connect with a Gmail account not in the test users list, you'll get an access denied error.

### 4. Alternative: Use Expo Development Client

If you continue having issues with the custom scheme, you can use Expo's development redirect:

Update `src/services/gmailOAuthService.ts`:

```typescript
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'budgettracker',
  // For development, this will use Expo's proxy
  preferLocalhost: __DEV__,
});
```

Then add these redirect URIs to Google Cloud Console:
- `https://auth.expo.io/@your-expo-username/budget-tracker`
- `exp://localhost:8081`

### 5. After Making Changes

1. **Wait 5-10 minutes** for Google's changes to propagate
2. Close and restart your React Native app completely
3. Try the OAuth flow again

## Troubleshooting

### If still getting errors:

1. **Check Client Type**: Make sure your OAuth client is set to **"iOS"** or **"Android"** app type, not "Web application"
   
2. **Bundle ID (iOS)** or **Package Name (Android)**:
   - For iOS: Should match your app's bundle identifier
   - For Android: `com.anonymous.budgettracker` (from app.json)

3. **Check redirect URI format**:
   - Must be EXACTLY: `budgettracker://oauth/callback`
   - No trailing slashes
   - All lowercase

4. **Verify Client ID and Secret** in code match Google Cloud Console

### For Production:

When ready for production:
1. Publish your app to App Store/Play Store
2. Update OAuth consent screen to "In production"
3. Update redirect URIs to use your published app's bundle ID
4. Remove test/development redirect URIs

## Current Configuration

**Client ID**: `72248493733-sas5a47sb6pl4r11gajbaig96fvvcnun.apps.googleusercontent.com`
**Client Secret**: `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`
**Redirect URI**: `budgettracker://oauth/callback`
**Scopes**: 
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/userinfo.email`

## Testing the Fix

After adding the redirect URI:
1. Settings → Email Integration → Connect Gmail
2. Authorize the app
3. Should redirect back to the app successfully
4. Check Supabase `user_email_config` table for saved tokens
