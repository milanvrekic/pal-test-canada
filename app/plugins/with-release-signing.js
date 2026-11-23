// Signs Android release builds with the Play upload key when the build provides one, through these environment
// variables (GitHub Actions secrets in CI):
//   ANDROID_UPLOAD_STORE_FILE      path to the upload keystore (.jks)
//   ANDROID_UPLOAD_STORE_PASSWORD  keystore password
//   ANDROID_UPLOAD_KEY_ALIAS       key alias
//   ANDROID_UPLOAD_KEY_PASSWORD    key password
// Without them, release builds keep Expo's default (signed with the debug key): fine for testing, not for Play.
// ANDROID_VERSION_CODE, when set, overrides versionCode so every CI build can be uploaded.
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_CONFIG = `
        release {
            if (System.getenv('ANDROID_UPLOAD_STORE_FILE')) {
                storeFile file(System.getenv('ANDROID_UPLOAD_STORE_FILE'))
                storePassword System.getenv('ANDROID_UPLOAD_STORE_PASSWORD')
                keyAlias System.getenv('ANDROID_UPLOAD_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_UPLOAD_KEY_PASSWORD')
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let g = cfg.modResults.contents;
    if (!g.includes("System.getenv('ANDROID_UPLOAD_STORE_FILE')")) {
      g = g.replace(/signingConfigs\s*\{/, (m) => `${m}${RELEASE_CONFIG}`);
      // In the release build type, use the upload key when it's there, else the debug key.
      g = g.replace(
        /(release\s*\{[^{}]*?)signingConfig signingConfigs\.debug/,
        "$1signingConfig System.getenv('ANDROID_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
      );
      g = g.replace(
        /versionCode\s+\d+/,
        // Integer.parseInt(...) rather than "versionCode (x).toInteger()": Groovy reads the latter as versionCode(x).toInteger().
        "versionCode Integer.parseInt(System.getenv('ANDROID_VERSION_CODE') ?: '" + (cfg.android?.versionCode ?? 1) + "')",
      );
    }
    cfg.modResults.contents = g;
    return cfg;
  });
};
