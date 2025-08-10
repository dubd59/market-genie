# Genie Labs MarketGenie Firestore Security Rules (Enterprise Ready)

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Organizations: Only members can read/write
    match /organizations/{orgId} {
      allow read, write: if request.auth != null && request.auth.token.orgId == orgId;
    }

    // SupportGenie tickets: Only users in the same org can access
    match /SupportGenie/{ticketId} {
      allow read, write: if request.auth != null && request.auth.token.orgId == resource.data.organizationId;
    }

    // MarketGenie campaigns: Only users in the same org can access
    match /marketing_campaigns/{campaignId} {
      allow read, write: if request.auth != null && request.auth.token.orgId == resource.data.organizationId;
    }

    // Add similar rules for other collections as needed
  }
}
```

## How to Use
- Copy these rules into the Firestore Rules section in the Firebase Console.
- Adjust field names and logic for your specific app structure.
- These rules enforce tenant isolation and secure data access for enterprise scaling.
