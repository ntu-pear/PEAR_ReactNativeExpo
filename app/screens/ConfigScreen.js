import React, { useContext } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';
import ScheduleAccordion from 'app/components/ScheduleAccordion';

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
    backgroundColor: '#e7edf5',
  },
});
