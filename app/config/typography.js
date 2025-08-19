// typography.js
import { Platform } from 'react-native';

const baseFontFamily = Platform.select({
  ios: 'Avenir',
  android: 'Roboto',
});

export default {
  heading1: {
    fontFamily: baseFontFamily,
    fontSize: 24,
    fontWeight: '700', // "SemiBold"
  },
  heading2: {
    fontFamily: baseFontFamily,
    fontSize: 20,
    fontWeight: '700', // "SemiBold"
  },
  subheading1: {
    fontFamily: baseFontFamily,
    fontSize: 16,
    fontWeight: '400', // "Regular"
  },
  subheading1Medium: {
    fontFamily: baseFontFamily,
    fontSize: 16,
    fontWeight: '500', // "Medium"
  },
  subheading1SemiBold: {
    fontFamily: baseFontFamily,
    fontSize: 16,
    fontWeight: '700', // "SemiBold"
  },
  body1: {
    fontFamily: baseFontFamily,
    fontSize: 14,
    fontWeight: '400', // "Regular"
  },
  body1Medium: {
    fontFamily: baseFontFamily,
    fontSize: 14,
    fontWeight: '500', // "Medium"
  },
  body1SemiBold: {
    fontFamily: baseFontFamily,
    fontSize: 14,
    fontWeight: '700', // "SemiBold"
  },
  body2: {
    fontFamily: baseFontFamily,
    fontSize: 12,
    fontWeight: '400', // "Regular"
  },
  body2Medium: {
    fontFamily: baseFontFamily,
    fontSize: 12,
    fontWeight: '500', // "Medium"
  },
};
