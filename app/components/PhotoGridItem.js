import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Button } from 'react-native-paper';

// Configurations
import colors from 'app/config/colors';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const photoSize = (width - 215) / 3;

const PhotoGridItem = ({
  photoPath,
  albumCategoryName,
  photoDetails,
  patientID,
  albumCategoryListID,
  patientPhotoID,
  onEdit,
  onDelete,
  initialIndex,
  numPhotos,
  photoData,
  startDate,
  endDate,
  countryListID,
  previousScreen,
}) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('PatientViewPhoto', {
      patientID,
      albumCategoryListID,
      patientPhotoID,
      photoDetails,
      initialIndex,
      numPhotos,
      photoPath,
      photoData,
      countryListID,
      startDate,
      endDate,
      previousScreen,
    });
  };
  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Photo as a square */}
          <Image source={{ uri: photoPath }} style={styles.photo} />
          <View style={styles.contentContainer}>
            {/* Photo details */}
            {photoDetails ? (
              <View style={styles.detailsContainer}>
                <Text
                  style={styles.text}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  <Text style={[styles.text]}>{photoDetails}</Text>
                </Text>
              </View>
            ) : null}

            {/* Edit and Delete buttons */}
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
    marginLeft: 10,
    marginRight: -20,
    borderRadius: 8,
    elevation: 2, // Adds shadow for Android
    backgroundColor: colors.green_lightest,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: colors.green_lighter,
    borderWidth: 3,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 2,
  },
  detailsContainer: {
    marginTop: 2,
  },
  textContainer: {
    marginTop: 10,
  },
  text: {
    marginTop: 4,
    fontSize: 16,
    maxWidth: photoSize,
    flexWrap: 'wrap',
    textAlign: 'center',
    alignSelf: 'center',
  },
  bold: {
    marginLeft: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 18,
  },
  button: {
    marginHorizontal: 5,
  },
  buttonContent: {
    marginVertical: -5,
    marginHorizontal: -10,
  },
});

export default PhotoGridItem;
