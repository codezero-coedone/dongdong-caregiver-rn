const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Android 11+ package visibility:
 * - Without <queries><package android:name="com.kakao.talk"/></queries>,
 *   checks like Linking.canOpenURL('kakaotalk://') (and KakaoTalk availability)
 *   can return false even when KakaoTalk is installed.
 *
 * This plugin ensures the KakaoTalk package is queryable.
 */
module.exports = function withKakaoTalkQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    const queries = Array.isArray(manifest.queries) ? manifest.queries : [];
    const q0 = queries[0] || {};

    const packages = Array.isArray(q0.package) ? q0.package : [];
    const exists = packages.some(
      (p) => p?.$?.["android:name"] === "com.kakao.talk"
    );
    if (!exists) {
      packages.push({ $: { "android:name": "com.kakao.talk" } });
    }

    q0.package = packages;
    queries[0] = q0;
    manifest.queries = queries;

    return cfg;
  });
};


