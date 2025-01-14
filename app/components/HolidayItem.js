import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import placeholderImage from 'app/assets/album_placeholder.png';
import colors from 'app/config/colors';
import { useNavigation } from '@react-navigation/native';

const HolidayItem = ({
  patientID,
  patientPhotoID,
  photoPath,
  country,
  startDate,
  endDate,
  photoCount,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation();

  // Debugging
  console.log('HolidayItem Props:', {
    patientID,
    patientPhotoID,
    photoPath,
    country,
    startDate,
    endDate,
  });

  const handlePress = () => {
    navigation.navigate('PatientPhotoGrid', {
      patientID,
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString(); // Formats the date to DD/MM/YYYY or locale format
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Content>
          <Image
            source={photoPath ? { uri: photoPath } : placeholderImage}
            style={styles.photo}
          />

          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              {country ? (
                <View style={{ marginLeft: 5, marginTop: 5 }}>
                  {/* Country and photo count side by side */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.text, styles.bold]}>{country}</Text>
                    <Text style={{ marginTop: 6, marginLeft: 10 }}>
                      (
                      {photoCount < 1
                        ? 'No photos'
                        : `${photoCount} ${
                            photoCount === 1 ? 'photo' : 'photos'
                          }`}
                      )
                    </Text>
                  </View>

                  {/* Start and end dates below */}
                  {startDate && endDate ? (
                    <Text style={styles.textBody}>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </Text>
                  ) : (
                    <Text style={styles.text}>No dates available</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.text}>Country not available</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onEdit}
                style={[
                  styles.button,
                  {
                    borderColor: colors.green,
                    borderWidth: 2,
                  },
                ]}
                labelStyle={{ color: colors.green }}
                contentStyle={styles.buttonContent}
              >
                Edit
              </Button>
              <Button
                mode="outlined"
                onPress={onDelete}
                style={[
                  styles.button,
                  { borderColor: colors.pink, borderWidth: 2 },
                ]}
                labelStyle={{ color: colors.pink }}
                contentStyle={styles.buttonContent}
              >
                Delete
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: colors.green_lightest,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: colors.green_lighter,
    borderWidth: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    marginTop: 4,
    fontSize: 20,
  },
  textBody: {
    marginTop: 4,
    fontSize: 17,
  },
  bold: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 5,
  },
  button: {
    marginHorizontal: 5,
  },
  buttonContent: {
    marginVertical: -5,
    marginHorizontal: -10,
  },
});

export default HolidayItem;
