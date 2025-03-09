import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhotoCarouselItem = ({ photoPath }) => {
  const [imageHeight, setImageHeight] = useState(screenHeight * 0.7); // Default to 70% of screen height
  const [imageWidth, setImageWidth] = useState(screenWidth); // Default to screen width

  // Load image to get original dimensions
  useEffect(() => {
    Image.getSize(photoPath, (width, height) => {
      const aspectRatio = width / height;

      // Calculate the height based on screen width and aspect ratio
      let newHeight = screenWidth / aspectRatio;

      // If the calculated height exceeds 70% of screen height, cap it at 70%
      if (newHeight > screenHeight * 0.7) {
        newHeight = screenHeight * 0.7;
        const newWidth = newHeight * aspectRatio; // Adjust width to maintain aspect ratio
        setImageWidth(newWidth);
      }

      setImageHeight(newHeight);
    });
  }, [photoPath]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photoPath }}
        style={{ width: imageWidth, height: imageHeight }}
        resizeMode="contain" // Ensures the image fits within the container while maintaining aspect ratio
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
});

export default PhotoCarouselItem;
