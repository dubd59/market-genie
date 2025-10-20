# Microsoft Azure App Registration for Market Genie

## IMPORTANT: Real Outlook Calendar Integration Setup

To enable **REAL** Outlook calendar integration (not simulation), you need to register Market Genie as an application with Microsoft Azure. This is required for production OAuth authentication.

## Step-by-Step Registration Process:

### 1. Go to Microsoft Azure Portal
- Visit: https://portal.azure.com
- Sign in with your Microsoft/Outlook account

### 2. Navigate to App Registrations
- In the Azure portal, search for "App registrations"
- Click "New registration"

### 3. Register Market Genie App
**Application Name:** `Market Genie Calendar Integration`
**Supported account types:** `Accounts in any organizational directory and personal Microsoft accounts`
**Redirect URI:** 
- Platform: `Web`
- URI: `https://market-genie-f2d41.web.app/oauth/microsoft/callback`

### 4. Get Your Client ID
- After registration, copy the **Application (client) ID**
- This replaces the demo ID in the code

### 5. Create Client Secret
- Go to "Certificates & secrets"
- Click "New client secret"
- Add description: "Market Genie Production Secret"
- Copy the secret value (you'll only see it once!)

### 6. Configure API Permissions
- Go to "API permissions"
- Click "Add a permission"
- Select "Microsoft Graph" > "Delegated permissions"
- Add these permissions:
  - `Calendars.ReadWrite` (Read and write user calendars)
  - `User.Read` (Sign in and read user profile)
  - `offline_access` (Maintain access to data)

### 7. Grant Admin Consent
- Click "Grant admin consent for [your organization]"
- Confirm the permissions

## Environment Variables Needed:

Add these to your environment or update the calendarService.js:

```javascript
REACT_APP_MICROSOFT_CLIENT_ID="your-actual-client-id-here"
REACT_APP_MICROSOFT_CLIENT_SECRET="your-actual-client-secret-here"
```

## What This Enables:

✅ **Real Microsoft OAuth authentication**
✅ **Actual Outlook calendar access**
✅ **Create/edit/delete calendar events**
✅ **Full production integration**
✅ **No more simulation mode**

## Current Status:
- OAuth framework: ✅ Ready
- Callback handling: ✅ Ready
- Token management: ✅ Ready
- Calendar API calls: ✅ Ready
- **Missing: Real Microsoft App Registration**

Once you complete the Azure registration and update the Client ID, your Outlook calendar integration will be 100% live and functional!