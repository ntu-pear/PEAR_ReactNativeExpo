// // Libs
// import React from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';

// // Configurations
// import colors from 'app/config/colors';

// // Utilities
// import formatDateTime from 'app/hooks/useFormatDateTime.js';
// import EditDeleteBtn from './EditDeleteBtn';

// // PhotoGridItem Component
// const PhotoGridItem = ({
//   patientPhotoID,
//   photoPath,
//   albumCategoryName,
//   photoDetails,
//   onDelete,
//   onEdit,
// }) => {
//   console.log('Rendering PhotoGridItem with ID:', patientPhotoID);
//   console.log('Photo path:', photoPath);
//   console.log('Album category:', albumCategoryName);
//   console.log('Photo details:', photoDetails);
//   return (
//     <View style={styles.container}>
//       <Image
//         source={
//           photoPath
//             ? { uri: photoPath }
//             : {
//                 uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1730400494/Patient/Yan_Yi_Sxxxx148C/Family/tygjuwvopmrafe59rkfq.jpg',
//               }
//         }
//         style={styles.image}
//         resizeMode="cover"
//       />
//       <View style={styles.textContainer}>
//         {albumCategoryName ? (
//           <View style={{ flexDirection: 'row', marginLeft: 20 }}>
//             <Text>
//               <Text style={[styles.text, styles.bold]}>Album: </Text>
//               <Text style={[styles.text]}>{albumCategoryName}</Text>
//             </Text>
//           </View>
//         ) : null}
//         {photoDetails ? (
//           <View style={{ flexDirection: 'row', marginLeft: 20 }}>
//             <Text>
//               <Text style={[styles.text, styles.bold]}>Photo Details: </Text>
//               <Text style={[styles.text]}>{photoDetails}</Text>
//             </Text>
//           </View>
//         ) : null}
//       </View>
//       <EditDeleteBtn onDelete={onDelete} onEdit={onEdit} />
//     </View>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 8, // Round corners
//     overflow: 'hidden', // Prevent content from overflowing
//     backgroundColor: colors.white, // Background color for contrast
//     margin: 10, // Margin around the item
//     elevation: 2, // Shadow for Android
//     flexDirection: 'row',
//   },
//   image: {
//     width: '100%', // Full width of the container
//     height: 150, // Fixed height for the image
//     borderRadius: 10, // Round corners of the image
//   },
//   text: {
//     fontSize: 16,
//     lineHeight: 26,
//   },
//   bold: {
//     marginLeft: 20,
//     fontWeight: '600',
//   },
//   textContainer: {
//     flex: 1,
//     marginTop: 15,
//     marginBottom: 15,
//   },
// });

// export default PhotoGridItem;

//////////////////////////////////

// import React from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import { Card, Button } from 'react-native-paper';

// // Configurations
// import colors from 'app/config/colors';

// // Utilities
// import EditDeleteBtn from './EditDeleteBtn';

// const PhotoGridItem = ({
//   photoPath,
//   albumCategoryName,
//   photoDetails,
//   onEdit,
//   onDelete,
// }) => {
//   return (
//     <View style={[styles.container]}>
//       <Image source={{ uri: photoPath }} style={styles.photo} />

//       <View style={styles.textContainer}>
//         {albumCategoryName ? (
//           <View style={{ flexDirection: 'row', marginLeft: 20 }}>
//             <Text>
//               <Text style={[styles.text, styles.bold]}>Album: </Text>
//               <Text style={[styles.text]}>{albumCategoryName}</Text>
//             </Text>
//           </View>
//         ) : null}
//         {photoDetails ? (
//           <View style={{ flexDirection: 'row', marginLeft: 20 }}>
//             <Text>
//               <Text style={[styles.text, styles.bold]}>Photo Details: </Text>
//               <Text style={[styles.text]}>{photoDetails}</Text>
//             </Text>
//           </View>
//         ) : null}
//       </View>
//       <EditDeleteBtn onDelete={onDelete} onEdit={onEdit} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.green_lightest,
//     padding: 20,
//     borderRadius: 8,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   photo: {
//     width: 150,
//     height: 150,
//     borderRadius: 8, // Rounded corners
//     resizeMode: 'cover',
//   },
//   heading: {
//     marginLeft: 20,
//     fontSize: 19,
//     fontWeight: '600',
//     marginBottom: 7,
//   },
//   text: {
//     marginTop: 4,
//     fontSize: 16,
//   },
//   bold: {
//     marginLeft: 20,
//     fontWeight: '600',
//   },
// });

// export default PhotoGridItem;

//////////////////////////////////
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
                  <Text style={[styles.text, styles.bold]}>Description: </Text>
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
    marginLeft: 10,
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
