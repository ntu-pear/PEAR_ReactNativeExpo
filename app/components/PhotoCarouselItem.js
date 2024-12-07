import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-paper'; // Assuming you're using react-native-paper for Button
import colors from 'app/config/colors'; // Adjust this according to your color scheme

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhotoCarouselItem = ({
  photoPath,
  photoDetails,
  albumCategoryName,
  onEdit,
  onDelete,
}) => {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Load image to get original dimensions
  useEffect(() => {
    Image.getSize(photoPath, (width, height) => {
      // Set the original width and height of the image
      const aspectRatio = width / height;

      // Start by setting the width of the image as a percentage of the screen width
      let newWidth = screenWidth * 0.8; // 80% of the screen width
      let newHeight = newWidth / aspectRatio; // Maintain the aspect ratio

      // If the new image height exceeds the available screen height (minus space for text)
      const availableHeight = screenHeight * 0.5; // Reserve 30% of the screen for other elements (like text)
      if (newHeight > availableHeight) {
        // If the height is too big, adjust it based on the available space
        newHeight = availableHeight;
        newWidth = newHeight * aspectRatio; // Recalculate the width to maintain aspect ratio
      }

      setImageWidth(newWidth);
      setImageHeight(newHeight);
    });
  }, [photoPath]);

  return (
    <View style={styles.container}>
      {/* Photo Display with original dimensions */}
      <Image
        source={{ uri: photoPath }}
        style={{ width: imageWidth, height: imageHeight }}
      />

      {/* Photo Details - Now placed below the image */}
      {photoDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.boldText}>
            Album: <Text style={styles.normalText}>{albumCategoryName}</Text>
          </Text>
          <Text style={styles.boldText}>
            Details: <Text style={styles.normalText}>{photoDetails}</Text>
          </Text>
        </View>
      )}

      {/* Button Container - Edit and Delete buttons */}
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
    backgroundColor: '#fff', // Background color for container
  },
  detailsContainer: {
    marginTop: 10, // Adds space between the image and the details
    paddingHorizontal: 20,
    alignItems: 'center', // Center-align text
    justifyContent: 'center',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold', // Bold text style for labels
    textAlign: 'center', // Center-align the text in the bold section
  },
  normalText: {
    fontSize: 16,
    fontWeight: 'normal', // Normal text style for values
    color: '#000', // Change text color if needed for better contrast
    textAlign: 'center', // Center-align the text in the normal section
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center buttons horizontally
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
