# Google OAuth2 Setup Guide

This guide will help you set up Google OAuth2 login for your Auctionality application.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to Google Cloud Console

## Step 1: Create OAuth2 Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: `Auctionality`
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `openid`, `profile`, `email`
   - Add test users (if in testing mode)
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Auctionality Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:8081
     http://localhost:5173
     ```
     (Add your production URLs when deploying)
   - **Authorized redirect URIs**:
     ```
     http://localhost:8081/login/oauth2/code/google
     ```
     (Add your production redirect URI when deploying)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Backend

Add the following environment variables to your backend configuration:

### Option 1: Environment Variables

```bash
export GOOGLE_CLIENT_ID=your-client-id-here
export GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Option 2: secrets.properties

Create or update `backend/src/main/resources/secrets.properties`:

```properties
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Step 3: Configure Frontend (Optional)

The frontend doesn't need any special configuration. The OAuth2 flow is handled by the backend, and the frontend just needs to redirect to the correct endpoint.

However, if you want to customize the frontend base URL, set:

```bash
export FRONTEND_BASE_URL=http://localhost:5173
```

Or in `backend/src/main/resources/secrets.properties`:

```properties
FRONTEND_BASE_URL=http://localhost:5173
```

## Step 4: Test the Integration

1. Start your backend server:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. Start your frontend server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:5173/login`
4. Click the **"Sign in with Google"** button
5. You should be redirected to Google's login page
6. After successful authentication, you'll be redirected back to the application

## How It Works

1. **User clicks "Sign in with Google"** → Frontend redirects to `/oauth2/authorization/google`
2. **Spring Security OAuth2** → Handles the OAuth2 flow with Google
3. **Google authentication** → User authenticates with Google
4. **OAuth2SuccessHandler** → Processes the OAuth2 user, creates/links account, generates JWT tokens
5. **Redirect to frontend** → Frontend receives tokens via URL parameters and cookies
6. **OAuth2CallbackPage** → Extracts tokens, stores them, fetches user info, redirects to home

## Troubleshooting

### Error: "redirect_uri_mismatch"

- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:8081/login/oauth2/code/google`
- Check that you've added the correct authorized JavaScript origins

### Error: "invalid_client"

- Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Make sure there are no extra spaces or quotes in the values

### User not created/linked

- Check backend logs for errors
- Verify that the database connection is working
- Ensure the `social_login_account` table exists

### Frontend not receiving tokens

- Check browser console for errors
- Verify that `FRONTEND_BASE_URL` is set correctly
- Check that CORS is configured properly in `SecurityConfig.java`

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**:

   - Add production URLs to **Authorized JavaScript origins**
   - Add production redirect URI: `https://yourdomain.com/login/oauth2/code/google`

2. **Update Backend Configuration**:

   - Set `FRONTEND_BASE_URL` to your production frontend URL
   - Use secure environment variables or secrets management

3. **Security Considerations**:
   - Use HTTPS in production
   - Enable secure cookies in `SecurityConfig.java`
   - Consider using a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)

## Note

Currently, only Google OAuth2 is supported. The system is configured exclusively for Google login.

## Support

If you encounter issues, check:

- Backend logs for detailed error messages
- Browser console for frontend errors
- Google Cloud Console for OAuth2 configuration issues
