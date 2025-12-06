# iOS In-App Purchase Setup Guide

This guide explains how to configure iOS in-app purchases for Myotopia.

## Prerequisites

1. **Apple Developer Account** ($99/year)
2. **App Store Connect access**
3. **Xcode installed on macOS**
4. **Capacitor project configured**

## Step 1: Configure App Store Connect

### Create App ID
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles → Identifiers
3. Create a new App ID if not exists
4. Enable "In-App Purchase" capability

### Create In-App Purchases in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Navigate to Features → In-App Purchases
4. Click the "+" button to create new IAPs

### Product IDs to Create

```
com.myotopia.premium.monthly    - $9.99/month
com.myotopia.premium.annual     - $99.99/year
```

### Configure Subscription Group
1. Create a subscription group called "Premium"
2. Add both monthly and annual subscriptions
3. Set pricing for each subscription
4. Add localized display names and descriptions

## Step 2: Install Capacitor IAP Plugin

```bash
npm install @capgo/capacitor-purchases
npx cap sync
```

## Step 3: Configure iOS Project

### Update `ios/App/App/Info.plist`
Add the following entries:

```xml
<key>SKPaymentTransactionObserver</key>
<string>YES</string>
```

### Update `capacitor.config.ts`

```typescript
const config: CapacitorConfig = {
  // ... existing config
  plugins: {
    CapacitorPurchases: {
      // RevenueCat API key (if using RevenueCat)
      // apiKey: 'your_revenuecat_api_key'
    }
  }
};
```

## Step 4: Implement IAP Service

The IAP service is implemented in:
- `src/components/subscription/IOSSubscriptionManager.tsx`

### Key Functions

```typescript
// Initialize purchases
await Purchases.configure({ apiKey: 'YOUR_REVENUECAT_KEY' });

// Get available products
const offerings = await Purchases.getOfferings();

// Make purchase
const { purchaserInfo } = await Purchases.purchasePackage({ package: selectedPackage });

// Restore purchases
const { purchaserInfo } = await Purchases.restorePurchases();

// Check subscription status
const isSubscribed = purchaserInfo.activeSubscriptions.length > 0;
```

## Step 5: Testing

### Sandbox Testing
1. Create Sandbox Test Users in App Store Connect
2. Sign out of your Apple ID on the test device
3. Sign in with the sandbox account when prompted during purchase

### Test Scenarios
- [ ] Purchase monthly subscription
- [ ] Purchase annual subscription
- [ ] Restore purchases on new device
- [ ] Cancel subscription (test expiration)
- [ ] Upgrade from monthly to annual
- [ ] Downgrade from annual to monthly

## Step 6: Server-Side Validation (Optional but Recommended)

For enhanced security, implement server-side receipt validation:

1. Create a Supabase edge function for receipt validation
2. Verify receipts with Apple's verification endpoint
3. Store subscription status in database

### Apple Verification Endpoints
- **Sandbox**: `https://sandbox.itunes.apple.com/verifyReceipt`
- **Production**: `https://buy.itunes.apple.com/verifyReceipt`

## RevenueCat Integration (Recommended)

For easier IAP management, consider using RevenueCat:

1. Create account at [RevenueCat](https://www.revenuecat.com)
2. Create a new project and app
3. Add your App Store Connect credentials
4. Configure products in RevenueCat dashboard
5. Update the API key in your app

### Benefits of RevenueCat
- Simplified IAP implementation
- Cross-platform support (iOS, Android, Web)
- Built-in analytics
- Automatic receipt validation
- Subscription status webhooks

## Troubleshooting

### Common Issues

**"Cannot connect to iTunes Store"**
- Ensure device is signed into a sandbox account
- Check network connectivity
- Verify IAP products are approved in App Store Connect

**Products not loading**
- Wait 24 hours after creating products
- Ensure products are in "Ready to Submit" status
- Check product IDs match exactly

**Purchase fails**
- Verify banking and tax information in App Store Connect
- Ensure app is signed with correct provisioning profile
- Check device is not in a region where IAP is unavailable

## Production Checklist

- [ ] All products approved in App Store Connect
- [ ] Banking and tax information complete
- [ ] Privacy policy includes IAP disclosure
- [ ] Terms of service updated
- [ ] Restore Purchases button visible
- [ ] Subscription management link added
- [ ] Receipt validation implemented
- [ ] Error handling covers all edge cases

## Support

For issues with IAP implementation, contact:
- Apple Developer Support
- RevenueCat Support (if using RevenueCat)
- Myotopia development team
