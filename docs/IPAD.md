# iPad and iPhone

## Option A: install the web app (no Mac, no developer account)

1. Open the deployed site in Safari on the iPad.
2. Share, **Add to Home Screen**.
3. Open it once while online. After that it works offline and keeps designs on the device.

## Option B: native app with Xcode (needs a Mac)

```bash
npm install
npm run build
npm run ios:add        # creates ios/
npm run ios:assets     # app icons and splash from assets/
npm run ios:sync       # builds and copies dist into the app
npm run ios:open       # opens Xcode
```

In Xcode: choose your Team, set a unique Bundle Identifier (also `appId` in `capacitor.config.ts`), set **Deployment Info** to iPad, pick your iPad and press Run.
A free Apple ID installs on your own iPad for 7 days. TestFlight and the App Store need a paid developer account.

After changing the web code run `npm run ios:sync` again.
