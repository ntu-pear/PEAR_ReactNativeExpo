import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import colors from 'app/config/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhotoCarouselItem = ({
  photoPath,
  photoDetails,
  albumCategoryName,
  startDate,
  endDate,
  country,
  onEdit,
  onDelete,
}) => {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Load image to get original dimensions
  useEffect(() => {
    Image.getSize(photoPath, (width, height) => {
      const aspectRatio = width / height;
      let newWidth = screenWidth * 0.7;
      let newHeight = newWidth / aspectRatio;
      const availableHeight = screenHeight * 0.5;

      if (newHeight > availableHeight) {
        newHeight = availableHeight;
        newWidth = newHeight * aspectRatio;
      }

      setImageWidth(newWidth);
      setImageHeight(newHeight);
    });
  }, [photoPath]);

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0'); // Ensure 2 digits
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`; // Format as DD/MM/YYYY
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photoPath }}
        style={{ width: imageWidth, height: imageHeight }}
      />
      <View style={styles.detailsContainer}>
        {albumCategoryName && (
          <Text style={styles.boldText}>
            Album: <Text style={styles.normalText}>{albumCategoryName}</Text>
          </Text>
        )}
        {photoDetails && (
          <Text style={styles.boldText}>
            Details: <Text style={styles.normalText}>{photoDetails}</Text>
          </Text>
        )}
        {country && (
          <Text style={styles.boldText}>
            Country: <Text style={styles.normalText}>{country}</Text>
          </Text>
        )}
        {startDate && (
          <Text style={styles.boldText}>
            Start Date:{' '}
            <Text style={styles.normalText}>{formatDate(startDate)}</Text>
          </Text>
        )}
        {endDate && (
          <Text style={styles.boldText}>
            End Date:{' '}
            <Text style={styles.normalText}>{formatDate(endDate)}</Text>
          </Text>
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
          style={[styles.button, { borderColor: colors.pink, borderWidth: 2 }]}
          labelStyle={{ color: colors.pink }}
          contentStyle={styles.buttonContent}
        >
          Delete
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  detailsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 5,
  },
  buttonContent: {
    marginVertical: -5,
    marginHorizontal: -10,
  },
});

export default PhotoCarouselItem;
