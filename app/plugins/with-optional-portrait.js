// The app locks to portrait, which makes Google Play treat a portrait screen as a hardware
// requirement and hide the app from devices that don't report one (some tablets, Chromebooks,
// Android XR). Declaring the feature optional keeps the portrait lock but lets every device install.
const { withAndroidManifest } = require('expo/config-plugins');

const FEATURES = ['android.hardware.screen.portrait', 'android.hardware.screen.landscape'];

module.exports = function withOptionalPortrait(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const list = (manifest['uses-feature'] = manifest['uses-feature'] || []);
    for (const name of FEATURES) {
      const existing = list.find((f) => f.$['android:name'] === name);
      if (existing) {
        existing.$['android:required'] = 'false';
      } else {
        list.push({ $: { 'android:name': name, 'android:required': 'false' } });
      }
    }
    return cfg;
  });
};
