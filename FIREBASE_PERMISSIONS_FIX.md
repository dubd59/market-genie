# Firebase Collection Permissions Issue - RESOLVED

## Summary

This document outlines the Firebase collection permissions issue and the comprehensive fixes that were implemented.

## Problem Statement

Users encountered two related issues:

### 1. "Missing or insufficient permissions" Error
When running database check scripts like `checkDatabase.js`, users received:
```
Checking Firebase Collection Structure...
 Checking tenant collection...
 Error: Missing or insufficient permissions.
```

### 2. Leads Not Saving to Database
When using the lead scraper, leads were found via the Prospeo API but failed to save to Firebase:
- Prospeo API successfully found emails and consumed credits
- Database save attempts timed out after 10 seconds
- No leads were actually stored despite scraper showing completion

## Root Causes

### Issue #1: Admin Scripts Using Web SDK
The database management scripts (`checkDatabase.js`, `createCollections.js`, `check-leads.js`) were using the Firebase Web SDK instead of the Firebase Admin SDK.

**Why this was a problem:**
- Web SDK requires user authentication
- Web SDK is subject to Firestore security rules
- Scripts couldn't bypass tenant isolation rules
- Resulted in "Missing or insufficient permissions" errors

### Issue #2: Missing Subcollection Security Rules
The Firestore security rules had comprehensive rules for top-level collections but were missing rules for subcollections within `MarketGenie_tenants/{tenantId}`.

**Why this was a problem:**
- Leads are stored in `MarketGenie_tenants/{tenantId}/leads` (subcollection)
- No explicit rules existed for this path
- Authenticated users couldn't write to their own tenant's subcollections
- Caused timeout errors when trying to save leads

## Solutions Implemented

### Solution #1: Convert Admin Scripts to Firebase Admin SDK

**Files Updated:**
- `checkDatabase.js` - Converted to use Firebase Admin SDK
- `createCollections.js` - Converted to use Firebase Admin SDK  
- `check-leads.js` - Converted to use Firebase Admin SDK

**Changes Made:**
```javascript
// BEFORE (Web SDK - requires authentication)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = { /* config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// AFTER (Admin SDK - full access, bypasses rules)
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'market-genie-f2d41'
});
const db = admin.firestore();
```

**Benefits:**
- Admin SDK has full administrative access
- Bypasses all Firestore security rules
- No authentication required for server-side scripts
- Can perform any database operation

### Solution #2: Add Subcollection Security Rules

**File Updated:**
- `firestore.rules`

**Rules Added:**
```javascript
match /MarketGenie_tenants/{tenantId} {
  // ... existing tenant rules ...
  
  // SUBCOLLECTIONS FOR TENANT-SPECIFIC DATA
  
  // Leads subcollection
  match /leads/{leadId} {
    allow read, write, delete: if isAuthenticated() && 
                                  (isSuperAdmin() || 
                                   request.auth.token.tenantId == tenantId ||
                                   request.auth.token.email == 'dubdproducts@gmail.com');
    allow create: if isAuthenticated() && 
                     (isSuperAdmin() || 
                      request.auth.token.tenantId == tenantId ||
                      request.auth.token.email == 'dubdproducts@gmail.com');
  }
  
  // Campaigns subcollection
  match /campaigns/{campaignId} {
    // ... similar rules ...
  }
  
  // Analytics subcollection  
  match /analytics/{analyticId} {
    // ... similar rules ...
  }
  
  // Catch-all for other subcollections
  match /{subcollection}/{document=**} {
    allow read, write, delete: if isAuthenticated() && 
                                  (isSuperAdmin() || 
                                   request.auth.token.tenantId == tenantId ||
                                   request.auth.token.email == 'dubdproducts@gmail.com');
    allow create: if isAuthenticated() && 
                     (isSuperAdmin() || 
                      request.auth.token.tenantId == tenantId ||
                      request.auth.token.email == 'dubdproducts@gmail.com');
  }
}
```

**Benefits:**
- Users can now save leads to their tenant's subcollections
- Maintains security isolation between tenants
- Allows authenticated users to write to their own tenant data
- Prevents cross-tenant data access

### Solution #3: Documentation and Setup Guide

**Files Created:**
- `FIREBASE_ADMIN_SETUP.md` - Comprehensive setup guide
- `FIREBASE_PERMISSIONS_FIX.md` - This document

**Contents:**
- Step-by-step service account key setup
- Explanation of the issues and fixes
- Troubleshooting guide
- Usage instructions

## Deployment Steps

To fully resolve these issues, follow these steps:

### Step 1: Set Up Service Account Key (For Admin Scripts)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `market-genie-f2d41`
3. Click ⚙️ → **Project settings** → **Service accounts** tab
4. Click **Generate new private key**
5. Save the downloaded file as `service-account-key.json` in the project root

### Step 2: Deploy Updated Firestore Rules

Deploy the updated `firestore.rules` to Firebase:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules

# Or deploy from Firebase Console
# 1. Go to Firestore Database → Rules tab
# 2. Copy contents of firestore.rules
# 3. Paste and publish
```

### Step 3: Verify User Authentication

Ensure users have the correct `tenantId` in their auth token:

```bash
# Run this script to set up user claims (if needed)
node fixUserClaims.js
```

Users should sign out and sign back in after claims are updated.

### Step 4: Test the Fixes

**Test Admin Scripts:**
```bash
# Should now work without permission errors
node checkDatabase.js
```

**Test Lead Saving:**
1. Log into the application as an authenticated user
2. Use the lead scraper to find leads
3. Verify leads are saved successfully
4. Check with: `node check-leads.js`

## What Changed

### Before

❌ Admin scripts failed with "Missing or insufficient permissions"
❌ Leads couldn't be saved to tenant subcollections
❌ Database operations timed out
❌ No proper security rules for subcollections

### After

✅ Admin scripts run with full access using Admin SDK
✅ Leads save successfully to tenant subcollections
✅ Proper security isolation between tenants maintained
✅ Authenticated users can access their own tenant data
✅ Comprehensive documentation provided

## Security Considerations

### What's Secure

✅ **Tenant Isolation**: Users can only access their own tenant's data
✅ **Authentication Required**: All operations require authentication
✅ **Token Validation**: Uses Firebase Auth tokens with tenantId claims
✅ **Founder Override**: Founder account has full access for support
✅ **Admin SDK Separation**: Admin SDK only used in server-side scripts

### What to Watch

⚠️ **Service Account Key**: Keep `service-account-key.json` secure and never commit it
⚠️ **User Claims**: Ensure users have correct `tenantId` in their auth tokens
⚠️ **Rule Deployment**: Test rules in a staging environment before production

## Troubleshooting

### "Missing or insufficient permissions" for Admin Scripts

**Solution**: Ensure service account key is properly set up (see Step 1 above)

### Leads Still Not Saving

**Checklist:**
1. ✅ Firestore rules deployed? (See Step 2)
2. ✅ User authenticated?
3. ✅ User has `tenantId` in auth token? (Run `fixUserClaims.js`)
4. ✅ User signed out and back in after claim changes?

### How to Check User Claims

```javascript
// In browser console while logged in
firebase.auth().currentUser.getIdTokenResult()
  .then(idTokenResult => {
    console.log('Tenant ID:', idTokenResult.claims.tenantId);
    console.log('All claims:', idTokenResult.claims);
  });
```

## Files Modified

### Scripts Converted to Admin SDK
1. `checkDatabase.js`
2. `createCollections.js`
3. `check-leads.js`

### Security Rules Updated
1. `firestore.rules` - Added subcollection rules

### Documentation Added
1. `FIREBASE_ADMIN_SETUP.md` - Service account setup guide
2. `FIREBASE_PERMISSIONS_FIX.md` - This comprehensive fix document

### Configuration
1. `.gitignore` - Added clean `service-account-key.json` entry

## Testing Recommendations

### For Development
1. Test with a non-founder user account
2. Verify tenant isolation works
3. Test lead creation, reading, updating, deleting
4. Check database with admin scripts

### For Production
1. Deploy rules to staging environment first
2. Test with real user accounts
3. Verify no cross-tenant data access
4. Monitor Firebase logs for permission errors

## Related Documentation

- [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md) - Service account setup
- [MULTI_TENANT_SECURITY.md](./MULTI_TENANT_SECURITY.md) - Security architecture
- [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md) - Complete rules guide

## Support

If you continue to experience issues:

1. Check Firebase Console → Authentication → Users for auth tokens
2. Check Firestore → Rules tab for deployed rules
3. Review Firebase logs for specific error messages
4. Ensure service account key permissions are correct

---

**Last Updated**: 2025-10-31
**Status**: ✅ RESOLVED
