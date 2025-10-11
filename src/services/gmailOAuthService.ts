import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Enable web browser completion
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration from environment variables
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';

// For web-based OAuth flow, users will authenticate via a separate web page
// This file is kept for reference but won't be used directly
console.log('Google Client ID configured:', !!GOOGLE_CLIENT_ID);

// Gmail readonly scope
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Initialize Google OAuth flow
 * Returns the authorization request and prompt function
 */
export const useGoogleOAuth = () => {
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: [GMAIL_SCOPE],
      redirectUri: GOOGLE_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: {
        access_type: 'offline', // Required to get refresh token
        prompt: 'consent', // Force consent screen to ensure refresh token
      },
    },
    discovery
  );

  return { request, response, promptAsync };
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string
): Promise<OAuthTokens> => {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';

  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const tokens: OAuthTokens = await response.json();
  return tokens;
};

/**
 * Get user's email address from Google
 */
export const getUserEmail = async (accessToken: string): Promise<string> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user email');
  }

  const data = await response.json();
  return data.email;
};

/**
 * Save OAuth tokens to Supabase
 */
export const saveOAuthTokens = async (tokens: OAuthTokens, userEmail: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Calculate token expiry
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);

  // Check if config already exists
  const { data: existingConfig } = await supabase
    .from('user_email_config')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const configData = {
    user_id: user.id,
    email_address: userEmail,
    oauth_access_token: tokens.access_token,
    oauth_refresh_token: tokens.refresh_token || null,
    oauth_token_expiry: expiryDate.toISOString(),
    oauth_provider: 'gmail',
    oauth_scopes: [GMAIL_SCOPE],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  if (existingConfig) {
    // Update existing config
    const { error } = await supabase
      .from('user_email_config')
      .update(configData as any)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating OAuth config:', error);
      throw error;
    }
  } else {
    // Insert new config
    const { error } = await supabase.from('user_email_config').insert(configData as any);

    if (error) {
      console.error('Error saving OAuth config:', error);
      throw error;
    }
  }
};

/**
 * Get current OAuth configuration
 */
export const getOAuthConfig = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_email_config')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error('Error fetching OAuth config:', error);
    throw error;
  }

  return data;
};

/**
 * Disconnect Gmail account
 */
export const disconnectGmail = async (): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Revoke the token with Google
  const config = await getOAuthConfig();
  if (config?.oauth_access_token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${config.oauth_access_token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      console.error('Error revoking token:', error);
      // Continue even if revocation fails
    }
  }

  // Delete from database
  const { error } = await supabase.from('user_email_config').delete().eq('user_id', user.id);

  if (error) {
    console.error('Error deleting OAuth config:', error);
    throw error;
  }
};

/**
 * Check if Gmail is connected
 */
export const isGmailConnected = async (): Promise<boolean> => {
  try {
    const config = await getOAuthConfig();
    return !!(config && config.is_active && config.oauth_access_token);
  } catch (error) {
    return false;
  }
};
