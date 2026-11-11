import React, { useContext } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';
import ScheduleAccordion from 'app/components/ScheduleAccordion';
import colors from 'app/config/colors';

const LINKS = [
  {
    testID: 'manage_centre_activities',
    label: 'Manage Centre Activities and Availability',
    route: routes.CENTRE_ACTIVITIES,
  },
  {
    testID: 'next_week_preview',
    label: 'Next-Week Schedule Preview',
    route: routes.NEXT_WEEK_PREVIEW,
  },
  {
    testID: 'activity_templates',
    label: 'Activity Templates',
    route: routes.ACTIVITY_TEMPLATES,
  },
];

export default function ConfigScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  if (
    String(user?.roleName || user?.role || '').toUpperCase() !== 'SUPERVISOR'
  ) {
    return <Text>Configuration requires Supervisor access.</Text>;
  }
  return (
    <View style={styles.content}>
      {LINKS.map((link) => (
        <TouchableOpacity
          key={link.testID}
          accessibilityRole="button"
          style={styles.button}
          testID={link.testID}
          onPress={() => navigation.navigate(link.route)}
        >
          <Text style={styles.label}>{link.label}</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.green} />
        </TouchableOpacity>
      ))}
      <ScheduleAccordion />
    </View>
  );
}
const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 8, backgroundColor: colors.white },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: colors.green_lightest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 16, color: colors.black, flexShrink: 1 },
});
