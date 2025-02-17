import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import placeholderImage from 'app/assets/album_placeholder.png';
import colors from 'app/config/colors';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const photoHeight = (height - 750) / 3;
const photoWidth = (width - 160) / 2;

const HolidayItem = ({
  patientID,
  patientPhotoID,
  photoPath,
  country,
  countryListID,
  startDate,
  endDate,
  photoCount,
  holidayExperience,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    console.log('Holiday Experience:', holidayExperience);
    navigation.navigate('PatientHolidayGrid', {
      patientID,
      countryListID,
      startDate,
      endDate,
      holidayExperience,
      previousScreen: 'PatientHolidayGrid',
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`; 
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
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginLeft: 10,
    marginRight: -20,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: colors.green_lightest,
  },
  photo: {
    width: photoWidth,
    height: photoHeight,
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
});

export default HolidayItem;
