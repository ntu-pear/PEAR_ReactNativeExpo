// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = getDefaultConfig(__dirname);
  config.resolver.sourceExts.push('cjs'); // Adds support for `.cjs` files
  return config;
})();
