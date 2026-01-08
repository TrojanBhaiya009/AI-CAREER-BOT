# Google OAuth Setup Guide

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select an existing one)
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth client ID"
   - Choose "Web application"
   - Name it: "AI Career Copilot"

5. **Configure OAuth consent screen** (if prompted):
   - User Type: External
   - App name: AI Career Copilot
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email`, `profile`, `openid`
   - Test users: Add your email for testing

6. **Add Authorized Redirect URIs**:
   ```
   https://cartaqqegfrqfqeoirhz.supabase.co/auth/v1/callback
   http://localhost:8080/auth/v1/callback (for local testing)
   ```

7. **Copy the credentials**:
   - Client ID (looks like: `xxx.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-xxxxx`)

## Step 2: Configure Supabase

1. **Go to Supabase Authentication Settings**:
   - https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/auth/providers

2. **Enable Google Provider**:
   - Find "Google" in the list
   - Toggle it ON
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click "Save"

3. **Configure Redirect URLs** (already set in previous steps):
   - Site URL: `http://localhost:8080`
   - Redirect URLs: Should include your app URL

## Step 3: Test Google Sign-In

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to**: http://localhost:8080/auth

3. **Click "Continue with Google"**

4. **You should**:
   - Be redirected to Google sign-in
   - Select/authenticate with your Google account
   - Be redirected back to your app
   - See your profile created in Supabase

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console EXACTLY matches:
  ```
  https://cartaqqegfrqfqeoirhz.supabase.co/auth/v1/callback
  ```
- No trailing slashes, must be HTTPS for production

### "OAuth consent screen needs verification"
- For development, add yourself as a test user
- For production, submit app for verification

### "User not redirected after sign-in"
- Check Supabase Site URL is set correctly
- Verify redirect URLs are configured
- Check browser console for errors

## Security Notes

⚠️ **Important**:
- Never commit Google Client Secret to Git
- Store it in Supabase dashboard only
- Rotate credentials if exposed
- Use environment variables for sensitive data

## What Happens on Google Sign-In

1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User approves permissions
4. Google redirects back to Supabase callback
5. Supabase creates/updates user profile
6. User automatically logged in
7. Redirected to onboarding (new users) or dashboard

## Additional Configuration (Optional)

### Request Additional Scopes
If you need more user data from Google, update the `signInWithGoogle` function:

```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      scopes: 'email profile openid', // Add more scopes as needed
    },
  });
  
  return { error: error as Error | null };
};
```

### Get User's Google Profile Picture
The user's avatar URL is available in `user.user_metadata.avatar_url`

---

## ✅ You're Done!

Your application now supports:
- ✅ Email/password authentication
- ✅ Google OAuth sign-in
- ✅ Automatic profile creation
- ✅ Seamless user experience

Users can now sign in with either method and enjoy a unified experience!
