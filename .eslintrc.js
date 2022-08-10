module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:react-hooks/recommended'],
  // 0 = off, 1 = warn, 2 = error
  rules: {
    'no-console': 1,
  },
};

// Note: Sample Configuration if needed
// {
//   "env": {
//     "browser": true,
//     "es2021": true,
//     "react-native/react-native": true
//   },
//   "extends": [
//     "eslint:recommended",
//     "plugin:react/recommended",
//     "airbnb",
//     "airbnb/hooks",
//     "prettier",
//     "@react-native-community"
//   ],
//   "parserOptions": {
//     "ecmaFeatures": {
//       "jsx": false
//     },
//     "ecmaVersion": 2022,
//     "sourceType": "module"
//   },
//   "plugins": ["react", "react-native"],
//   "rules": {
//     "react-native/no-unused-styles": 2,
//     "react-native/split-platform-components": 2,
//     "react-native/no-inline-styles": 2,
//     "react-native/no-color-literals": 2,
//     "react-native/no-raw-text": 2,
//     "react-native/no-single-element-style-arrays": 2,
//     // allow .js files to contain JSX code
//     // "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
//     "react/jsx-filename-extension": "off",

//     // prevent eslint to complain about the "styles" variable being used before it was defined
//     "no-use-before-define": ["error", { "variables": false }]

//     // ignore errors for the react-navigation package
//     // "react/prop-types": ["error", { "ignore": ["navigation", "navigation.navigate"] }]
//     // "react/prop-types": "off"
//   }
// }
