import type { CapacitorConfig } from '@capacitor/cli';

// Change appId to your own reverse-domain name before building for your iPad.
const config: CapacitorConfig = {
  appId: 'com.yourname.stringartstudio',
  appName: 'String Art Studio',
  webDir: 'dist',
  backgroundColor: '#000000',
  ios: { contentInset: 'never' },
};

export default config;
