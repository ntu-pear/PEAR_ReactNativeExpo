import React, { useContext } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';
import ScheduleAccordion from 'app/components/ScheduleAccordion';
import colors from 'app/config/colors';

export default function ConfigScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  if (
    String(user?.roleName || user?.role || '').toUpperCase() !== 'SUPERVISOR'
  ) {
    return <Text>Configuration requires Supervisor access.</Text>;
  }
  return (
    <View style={styles.content}>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.button}
        testID="manage_centre_activities"
        onPress={() => navigation.navigate(routes.CENTRE_ACTIVITIES)}
      >
        <Text>Manage centre activities and availability</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.button}
        testID="next_week_preview"
        onPress={() => navigation.navigate(routes.NEXT_WEEK_PREVIEW)}
      >
        <Text>Next-week schedule preview</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.button}
        testID="activity_templates"
        onPress={() => navigation.navigate(routes.ACTIVITY_TEMPLATES)}
      >
        <Text>Activity templates</Text>
      </TouchableOpacity>
      <ScheduleAccordion />
    </View>
  );
}
const styles = StyleSheet.create({
  content: { flex: 1 },
  button: {
    margin: 16,
    padding: 16,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.green_lightest,
  },
});
