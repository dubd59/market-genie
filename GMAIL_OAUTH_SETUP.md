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
   - Search for and add this scope:
     ```
     https://www.googleapis.com/auth/gmail.send
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

## ⚠️ Important: Verification Process Active

**DO NOT switch back to testing mode** if you see this warning! Your app is currently undergoing Google's verification review for the Gmail scope.

### What This Means:
- ✅ Your verification application is **active** and being reviewed
- ✅ The process takes **4-6 weeks** for full approval
- ✅ Switching to testing mode will **withdraw your application**
- ✅ You'll need to **resubmit** if you want production access later

### What You CAN Do Right Now:
1. **Wait for verification** - Google will email you within 3-5 days
2. **Respond promptly** to any Google emails about verification
3. **Use alternative email methods** for testing (App Passwords)
4. **Continue development** of other features

### Alternative Testing Options:
While waiting for Gmail OAuth approval, users can:
- Connect Gmail via **App Passwords** (Settings → Email Integrations)
- Use **SMTP settings** for other email providers
- Test all other app features normally

### When Verification Completes:
- You'll get an email from Google
- Gmail OAuth will work for all users
- No more "unverified app" warnings

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
