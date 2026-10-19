import { StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// PEAR's existing palette/type, with a shared rhythm for staff forms.
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export default StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.white },
  formContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: { marginBottom: spacing.xl },
  helper: {
    ...typography.body1,
    lineHeight: 20,
    color: colors.grey,
    marginTop: spacing.xs,
    marginBottom: 20,
  },
  action: { marginTop: 6 },
});
