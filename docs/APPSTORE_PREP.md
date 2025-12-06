# App Store Submission Preparation Guide

This document outlines the steps required to prepare Myotopia for Apple App Store submission.

## Pre-Submission Checklist

### App Configuration

- [x] App ID configured with In-App Purchase capability
- [x] Bundle ID: `app.lovable.8121866124ca47f1bdc10449f8b1af91`
- [x] App Name: Myotopia
- [ ] App Icon (1024x1024) created
- [ ] Launch screens configured for all device sizes

### Capacitor Configuration

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'app.lovable.8121866124ca47f1bdc10449f8b1af91',
  appName: 'myotopia',
  webDir: 'dist',
  server: {
    // Remove for production build
    // url: 'https://...',
  }
};
```

### Required Assets

#### App Icons
Generate icons for all required sizes:
- 20pt (1x, 2x, 3x)
- 29pt (1x, 2x, 3x)
- 40pt (1x, 2x, 3x)
- 60pt (2x, 3x)
- 76pt (1x, 2x)
- 83.5pt (2x)
- 1024pt (1x) - App Store

#### Screenshots
Required for each device size:
- iPhone 6.5" Display (1242 x 2688)
- iPhone 5.5" Display (1242 x 2208)
- iPad Pro 12.9" Display (2048 x 2732)
- iPad Pro 11" Display (1668 x 2388)

### App Store Connect Metadata

#### App Description
```
Myotopia is your AI-powered fitness companion, designed to help you achieve your health and fitness goals through science-backed training programs, personalized meal plans, and intelligent progress tracking.

Features:
• AI Coach - Get personalized fitness advice and answers to your training questions
• Smart Training - Evidence-based workout programs tailored to your goals
• Meal Planning - AI-generated nutrition plans that fit your lifestyle
• Workout Logger - Track your exercises with smart progressive overload insights
• Progress Tracking - Monitor your fitness journey with detailed analytics
• Blueprint AI - Science-based workout templates for every goal
• Physique AI - Advanced body composition analysis (Premium)
• Recovery Coach - Optimize your rest and recovery

Premium Subscription:
• Unlimited AI coaching
• Advanced analytics
• Exclusive features
• Priority support

Subscription Terms:
• Payment will be charged to your Apple ID account at confirmation of purchase
• Subscription automatically renews unless canceled at least 24 hours before the end of the current period
• Manage subscriptions in Account Settings after purchase
```

#### Keywords
```
fitness, workout, gym, training, AI, coach, meal plan, diet, nutrition, exercise, bodybuilding, weight loss, muscle, health, tracker
```

#### Support URL
```
https://myotopia.app/support
```

#### Privacy Policy URL
```
https://myotopia.app/privacy
```

#### Terms of Service URL
```
https://myotopia.app/terms
```

### App Review Guidelines Compliance

#### 1. Safety
- [x] No objectionable content
- [x] User-generated content moderation (N/A - no UGC)
- [x] Physical harm warnings included in workout descriptions

#### 2. Performance
- [x] App completeness - all features functional
- [x] Beta/test references removed
- [x] No placeholder content

#### 3. Business
- [x] In-app purchases use Apple's payment system
- [x] No external payment links
- [x] Accurate app description
- [x] Subscription terms clearly stated

#### 4. Design
- [x] Minimum functionality requirements met
- [x] Standard UI elements used appropriately
- [x] Safe area compliance
- [x] 44pt minimum touch targets

#### 5. Legal
- [x] Privacy policy included
- [x] Terms of service included
- [x] Health/fitness disclaimer

### In-App Purchases

#### Products to Register
| Product ID | Type | Price | Description |
|------------|------|-------|-------------|
| com.myotopia.premium.monthly | Auto-Renewable | $9.99 | Monthly Premium Access |
| com.myotopia.premium.annual | Auto-Renewable | $99.99 | Annual Premium Access |

#### Subscription Features
- Unlimited AI queries
- Full access to all modules
- Advanced analytics
- Priority support

### Code Signing

1. Create Distribution Certificate in Apple Developer Portal
2. Create App Store Provisioning Profile
3. Configure Xcode with correct signing settings

```bash
# Build for App Store
npm run build
npx cap sync ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive -archivePath ./build/App.xcarchive
```

### Pre-Submission Testing

1. **TestFlight Beta Testing**
   - Upload build to App Store Connect
   - Add internal testers
   - Test all features
   - Fix any issues

2. **Device Testing Matrix**
   - iPhone 15 Pro Max
   - iPhone 15
   - iPhone SE (3rd gen)
   - iPad Pro 12.9"
   - iPad Air

3. **Feature Testing**
   - [ ] User registration/login
   - [ ] In-app purchases
   - [ ] Restore purchases
   - [ ] All AI features
   - [ ] Workout logging
   - [ ] Progress tracking
   - [ ] Push notifications
   - [ ] Deep links

### Common Rejection Reasons to Avoid

1. **Guideline 2.1 - Performance: App Completeness**
   - Ensure all features work without crashes
   - Remove any debug/test code

2. **Guideline 3.1.1 - In-App Purchase**
   - All digital goods/subscriptions through IAP
   - No external payment links

3. **Guideline 4.2 - Minimum Functionality**
   - App provides substantial value
   - Not just a wrapper for a website

4. **Guideline 5.1.1 - Data Collection and Storage**
   - Clear privacy policy
   - Proper data handling disclosures

### Submission Steps

1. Archive the app in Xcode
2. Upload to App Store Connect
3. Fill in app metadata
4. Submit screenshots
5. Answer export compliance questions
6. Submit for review

### Post-Submission

- Monitor for review status updates
- Be prepared to respond quickly to reviewer questions
- Have demo account ready if requested

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | TBD | Initial App Store release |

## Contact

For App Store submission issues:
- Apple Developer Support
- Myotopia Development Team
