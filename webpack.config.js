//Creating webpack config: https://docs.expo.dev/guides/customizing-webpack/
//Lottie for web: https://github.com/react-native-web-community/react-native-web-lottie

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.resolve.alias['lottie-react-native'] = 'react-native-web-lottie';

  return config;
};
