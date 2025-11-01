# Firebase Admin SDK Setup Guide

## Problem Solved

This guide addresses the **"Missing or insufficient permissions"** error when running administrative scripts like `checkDatabase.js` and `createCollections.js`.

### Root Cause

The scripts were previously using the Firebase Web SDK, which:
- Requires user authentication
- Is subject to Firestore security rules
- Cannot bypass tenant isolation rules

This caused permission errors when trying to check or create collections programmatically.

### Solution

We've converted these scripts to use the **Firebase Admin SDK**, which:
- Has full administrative access to Firestore
- Bypasses all security rules
- Does not require user authentication
- Can perform any database operation

## Setup Instructions

### Step 1: Get Your Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **market-genie-f2d41**
3. Click the gear icon ⚙️ next to "Project Overview" → **Project settings**
4. Navigate to the **Service accounts** tab
5. Click **Generate new private key**
6. Click **Generate key** to download the JSON file

### Step 2: Install the Service Account Key

1. Rename the downloaded file to `service-account-key.json`
2. Move it to the root directory of your project:
   ```bash
   mv ~/Downloads/market-genie-f2d41-*.json ./service-account-key.json
   ```

### Step 3: Verify the Setup

The file should already be in `.gitignore` to prevent accidental commits of sensitive credentials.

Run this command to verify:
```bash
grep "service-account-key.json" .gitignore
```

You should see it listed in the output.

## Using the Scripts

### Check Database Collections

To check your Firebase collection structure (including the tenant collection):

```bash
node checkDatabase.js
```

Expected output:
```
✅ Firebase Admin initialized successfully!
🔍 Checking Firebase Collection Structure...
 Checking tenant collection...
✅ Found X tenant(s):

📄 Tenant ID: ...
   Owner: ...
   Plan: ...
   Status: active
```

### Create Collections

To create or populate database collections:

```bash
node createCollections.js
```

This will create:
- Tenants collection
- Deals collection
- Contacts collection
- Companies collection
- Tasks collection
- Settings collection

## Updated Scripts

The following scripts have been converted to use Firebase Admin SDK:

1. **checkDatabase.js** - Check collection structure and list tenants
2. **createCollections.js** - Create and populate collections with sample data

## Security Notes

⚠️ **IMPORTANT**: 
- **Never commit** `service-account-key.json` to version control
- This file grants **full administrative access** to your Firebase project
- Keep it secure and only share with trusted team members
- Rotate the key periodically for security

## Troubleshooting

### Error: "Cannot find module 'service-account-key.json'"

**Solution**: Follow Steps 1-2 above to download and install the service account key.

### Error: "Permission denied"

**Solution**: Ensure you downloaded the key from the correct Firebase project (market-genie-f2d41).

### Error: "EACCES: permission denied"

**Solution**: Check file permissions:
```bash
chmod 600 service-account-key.json
```

## Related Files

- `fixUserClaims.js` - Already uses Admin SDK ✅
- `addSampleDataToTenant.js` - Already uses Admin SDK ✅
- `init-data.js` - Already uses Admin SDK ✅
- `quickDatabaseSetup.js` - Already uses Admin SDK ✅
- `verifyData.js` - Already uses Admin SDK ✅

## Next Steps

After setting up the service account key:

1. Run `node checkDatabase.js` to verify your collections
2. If you need to create sample data, run `node createCollections.js`
3. Use the Admin SDK for any future administrative scripts

---

**Note**: The Firebase Web SDK is still used in the client application (browser) for authenticated user access, which is correct. Only administrative scripts should use the Admin SDK.
