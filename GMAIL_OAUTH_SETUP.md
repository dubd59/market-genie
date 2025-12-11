# Gmail OAuth Setup Guide for Market Genie

This guide walks you through setting up Gmail OAuth so users can connect their Google/Gmail accounts with one click.

---

## Prerequisites

- Access to Google Cloud Console
- Your Market Genie app is deployed at: https://market-genie-f2d41.web.app

---

## Step 1: Go to Google Cloud Console

**URL:** https://console.cloud.google.com/

---

## Step 2: Select or Create a Project

1. Click the project dropdown at the top of the page
2. Look for an existing project (might be called "Market Genie" or similar)
3. If none exists, click **"New Project"**
   - Name: `Market Genie`
   - Click **Create**

---

## Step 3: Enable the Gmail API

1. Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
2. Make sure your project is selected at the top
3. Click **"Enable"**

---

## Step 4: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent

2. Choose **"External"** user type (so any Google user can connect)

3. Click **"Create"**

4. Fill in the **App Information**:
   | Field | Value |
   |-------|-------|
   | App name | `Market Genie` |
   | User support email | `ddub@dubdproducts.com` |
   | App logo | (optional) |
   | Developer contact email | `ddub@dubdproducts.com` |

5. Click **"Save and Continue"**

6. On the **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Search for and add these scopes:
     ```
     https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.send
     https://www.googleapis.com/auth/userinfo.email
     ```
   - Click **"Update"**
   - Click **"Save and Continue"**

7. On the **Test Users** page:
   - Skip for now (click **"Save and Continue"**)

8. Review the summary and click **"Back to Dashboard"**

---

## Step 5: Create OAuth 2.0 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click **"+ Create Credentials"** at the top

3. Select **"OAuth client ID"**

4. Choose application type: **"Web application"**

5. Fill in:
   | Field | Value |
   |-------|-------|
   | Name | `Market Genie Web Client` |

6. Under **"Authorized JavaScript origins"**, add:
   ```
   https://market-genie-f2d41.web.app
   ```

7. Under **"Authorized redirect URIs"**, add:
   ```
   https://market-genie-f2d41.web.app/oauth/gmail/callback
   ```

8. Click **"Create"**

9. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these!

---

## Step 6: Update Your App (If Needed)

The app already has OAuth credentials configured. If you created NEW credentials in Step 5, you'll need to update the code.

**Current credentials in the app:**
- Client ID: `1023666208479-besa8q2moobncp0ih4njtop8a95htop9.apps.googleusercontent.com`

If your Client ID is different, let me know and I'll update the code.

---

## Step 7: Publish the App

**IMPORTANT:** While in "Testing" mode, only users you add as test users can connect.

To allow all users to connect:

1. Go to: https://console.cloud.google.com/apis/credentials/consent

2. Look for the **"Publishing status"** section

3. Click **"Publish App"**

4. Click **"Confirm"**

> ⚠️ **Note:** Google may show a warning screen to users until your app is verified. This is normal and users can click "Advanced" → "Go to Market Genie (unsafe)" to proceed.

---

## Step 8: Test the Connection

1. Go to: https://market-genie-f2d41.web.app

2. Log in to your account

3. Navigate to **API Keys & Integrations** → **Email Integrations** tab

4. Click on the **Gmail** card

5. Choose **"Connect with Google"** (the green recommended option)

6. A Google popup will appear - authorize with your Google Workspace account

7. You should see a success message!

---

## Troubleshooting

### "Access Blocked" Error
- Make sure you've published the app (Step 7)
- Or add yourself as a test user in the OAuth consent screen

### "Redirect URI Mismatch" Error
- Double-check that the redirect URI in Google Cloud matches exactly:
  ```
  https://market-genie-f2d41.web.app/oauth/gmail/callback
  ```

### "Popup Blocked" Message
- Allow popups for market-genie-f2d41.web.app in your browser

### Token Expired Errors
- The app automatically refreshes tokens, but if issues persist, disconnect and reconnect Gmail

---

## What This Enables

Once connected via OAuth, users get:

| Feature | SMTP (App Password) | OAuth (Connect with Google) |
|---------|--------------------|-----------------------------|
| Daily sending limit | ~500-2,000 | 2,000 |
| Setup complexity | Manual (app password) | One-click |
| Bounce detection | ❌ No | ✅ Yes |
| Token refresh | N/A | Automatic |
| Security | App password | OAuth 2.0 tokens |

---

## Files Modified for OAuth

- `src/components/APIKeysIntegrations.jsx` - Added OAuth connect button and choice modal
- `src/pages/GmailOAuthCallback.jsx` - Handles OAuth callback and token storage
- `functions/index.js` - Added `sendCampaignEmailGmailAPI` function

---

## Support

If you encounter issues, check the browser console (F12) for error messages.
