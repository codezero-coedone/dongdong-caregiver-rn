const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

// IMPORTANT (CI determinism):
// - Codemagic(Node) can fail to load `nativewind/metro` depending on module format/version.
// - NativeWind v4 is already enabled via `nativewind/babel` preset in `babel.config.js`.
// Keep Metro config minimal and deterministic (same rationale as `dongdong-rn`).
module.exports = config;
