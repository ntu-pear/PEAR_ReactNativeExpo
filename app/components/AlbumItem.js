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

// Assets
import placeholderImage from 'app/assets/album_placeholder.png';

// Configurations
import colors from 'app/config/colors';
import { useNavigation } from '@react-navigation/native';
import typography from 'app/config/typography';

const { width, height } = Dimensions.get('window');

const photoHeight = (height - 750) / 3;
const photoWidth = (width - 160) / 2;

const AlbumItem = ({
  patientID,
  patientPhotoID,
  photoPath,
  albumCategoryName,
  albumCategoryListID,
  photoCount,
  holidayExperience,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('PatientPhotoGrid', {
      patientID,
      albumCategoryListID,
      previousScreen: 'PatientPhotoGrid',
    });
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
              {albumCategoryName ? (
                <View
                  style={{ flexDirection: 'row', marginLeft: 5, marginTop: 5 }}
                >
                  <Text>
                    <Text style={[styles.text, styles.bold]}>
                      {albumCategoryName}
                    </Text>
                  </Text>
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
              ) : null}
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
    marginLeft: 20,
    ...typography.heading2,
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

export default AlbumItem;