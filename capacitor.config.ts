import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'ug.cps.mobile',
  appName: 'CPS Mobile',
  webDir: 'dist/public',
  server: {
    url: 'https://form-maker--danogwang222.replit.app',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0B0C10',
      showSpinner: false,
    },
  },
};

export default config;
