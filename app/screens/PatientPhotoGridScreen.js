// PhotoGridScreen.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import PhotoGrid from 'app/components/PhotoGridItem';

const PatientPhotoGridScreen = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/PatientPhoto');
        const json = await response.json();
        if (json.status === 'SUCCESS') {
          const formattedPhotos = json.data.map((photo) => ({
            id: photo.patientPhotoID.toString(),
            uri: photo.photoPath,
            details: photo.photoDetails,
          }));
          setPhotos(formattedPhotos);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <PhotoGrid
        photos={photos}
        onDeletePhoto={(id) => console.log(`Delete photo with ID: ${id}`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default PatientPhotoGridScreen;
