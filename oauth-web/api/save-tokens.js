// Vercel Serverless Function to Save OAuth Tokens
// Uses service role key to bypass RLS
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId, tokens, userEmail } = req.body;

    // Validate input
    if (!userId || !tokens || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, tokens, userEmail' 
      });
    }

    if (!tokens.access_token) {
      return res.status(400).json({ 
        error: 'Missing access_token in tokens object' 
      });
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Calculate token expiry
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + (tokens.expires_in || 3600));

    // Prepare data
    const configData = {
      user_id: userId,
      email_address: userEmail,
      oauth_access_token: tokens.access_token,
      oauth_refresh_token: tokens.refresh_token || null,
      oauth_token_expiry: expiryDate.toISOString(),
      oauth_provider: 'gmail',
      oauth_scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      is_active: true,
      updated_at: new Date().toISOString()
    };

    // Check if config already exists
    const { data: existingConfig } = await supabase
      .from('user_email_config')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;
    if (existingConfig) {
      // Update existing config
      result = await supabase
        .from('user_email_config')
        .update(configData)
        .eq('user_id', userId);
    } else {
      // Insert new config
      result = await supabase
        .from('user_email_config')
        .insert(configData);
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      return res.status(500).json({ 
        error: 'Failed to save tokens',
        details: result.error.message 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Tokens saved successfully',
      email: userEmail
    });

  } catch (error) {
    console.error('Error saving tokens:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
