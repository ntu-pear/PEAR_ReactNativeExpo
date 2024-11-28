// Libs
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Configurations
import colors from 'app/config/colors';

// PhotoGridItem Component
const PhotoGridItem = ({
  patientPhotoID,
  photoPath,
  albumCategoryName,
  photoDetails,
}) => {
  console.log('Rendering PhotoGridItem with ID:', patientPhotoID);
  console.log('Photo path:', photoPath);
  console.log('Album category:', albumCategoryName);
  console.log('Photo details:', photoDetails);
  return (
    <View style={styles.container}>
      <Image 
        source={photoPath ? { uri: photoPath } : { uri: 'https://res.cloudinary.com/dbpearfyp/image/upload/v1730400494/Patient/Yan_Yi_Sxxxx148C/Family/tygjuwvopmrafe59rkfq.jpg' }} 
        style={styles.image} 
        resizeMode="cover" 
      />
      <View style={styles.descriptionContainer}>
        {albumCategoryName && (
          <Text style={styles.categoryText}>{albumCategoryName}</Text>
        )}
        {photoDetails && (
          <Text style={styles.detailsText}>{photoDetails}</Text>
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    borderRadius: 10, // Round corners
    overflow: 'hidden', // Prevent content from overflowing
    backgroundColor: colors.white, // Background color for contrast
    margin: 10, // Margin around the item
    elevation: 2, // Optional shadow for Android
    shadowColor: colors.black, // Optional shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Optional shadow for iOS
    shadowOpacity: 0.1, // Optional shadow for iOS
    shadowRadius: 4, // Optional shadow for iOS
  },
  image: {
    width: '100%', // Full width of the container
    height: 150, // Fixed height for the image
    borderRadius: 10, // Round corners of the image
  },
  descriptionContainer: {
    padding: 10, // Padding around the text
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.dark_gray, // Adjust color as needed
  },
  detailsText: {
    fontSize: 14,
    color: colors.gray, // Adjust color as needed
  },
});

export default PhotoGridItem;



// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   TouchableOpacity,
//   Platform,
//   StyleSheet,
//   Image,
//   ToastAndroid,
// } from 'react-native';
// import { Text, VStack } from 'native-base';
// import typography from 'app/config/typography';
// import DefaultImage from 'app/assets/placeholder.png';
// import colors from 'app/config/colors';
// import { formatDate } from 'app/utility/miscFunctions';

// function PhotoGridItem({
//   testID='',
//   imageUri,
//   labelText,
//   date,
//   size,
//   isVertical,
//   onPress,
//   isActive=null,
// }) {

//   // Reset error if imageUri changes
//   useEffect(() => {
//     setIsError(false);
//   }, [imageUri])

//   const [isError, setIsError] = useState(false);

//   const containerStyle = isVertical
//     ? styles.ContentWrapperVertical
//     : styles.ContentWrapperHorizontal;

//   const imageStyle = styles.RoundedSquareImage;
//   const textLayoutStyle = styles.TextContainer;

//   const customImageStyle = {
//     ...imageStyle,
//     height: size,
//     width: size,
//   };

//   const customTextContainerStyle = {
//     ...textLayoutStyle,
//     marginLeft: isVertical ? null : 20,
//   };

//   const handleImageError = () => {
//     ToastAndroid.show(('Error loading image'), ToastAndroid.SHORT)
//     setIsError(true);
//   }

//   return (
//     <View alignItems="center">
//       <TouchableOpacity testID={testID} onPress={onPress}>
//         <View style={containerStyle}>
//           <Image
//             style={customImageStyle}
//             alt="photo_album_image"
//             onError={handleImageError}
//             source={
//               imageUri 
//                 ? isError 
//                   ? DefaultImage
//                   : { uri: `${imageUri}` } 
//                 : DefaultImage
//             }
//           />
//           <View style={customTextContainerStyle}>
//             {labelText ? (
//               <Text
//                 style={[styles.DefaultText, styles.LabelText, ...isVertical ? [{textAlign: 'center'}] : []]}
//                 fontSize={size / 5}
//               >
//                 {labelText.trim()}
//               </Text>
//             ) : null}
//             {date != null ? (
//               <Text style={styles.DefaultText} fontSize={size / 6}>
//                 {formatDate(new Date(date))}
//               </Text>
//             ) : null}
//             {isActive != null ? (
//               <Text style={styles.DefaultText} fontSize={size / 6} color={isActive ? colors.green : colors.red}>
//                 {isActive ? 'Active' : 'Inactive'}
//               </Text>
//             ) : null}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// }

// PhotoGridItem.defaultProps = {
//   isVertical: true,
//   size: 100,
// };

// const styles = StyleSheet.create({
//   ContentWrapperVertical: {
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: '4%',
//     paddingTop: '6%',
//   },
//   ContentWrapperHorizontal: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: '4%',
//     paddingTop: '6%',
//   },
//   RoundedSquareImage: {
//     borderRadius: 20, // Rounded corners for a "rounded square" effect
//     height: 100,
//     width: 100,
//   },
//   DefaultText: {
//     fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
//   },
//   LabelText: {
//     fontWeight: 'bold',
//   },
//   TextContainer: {
//     justifyContent: 'flex-start',
//     marginLeft: 20,
//   },
// });

// export default PhotoGridItem;


// // PhotoGrid.js CODE 1
// import React from 'react';
// import {
//   View,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import colors from 'app/config/colors';

// const { width: screenWidth } = Dimensions.get('window');
// const numColumns = 3;
// const photoMargin = 10;
// const containerPadding = 20;
// const photoSize =
//   (screenWidth - containerPadding * 2 - photoMargin * (numColumns * 2)) /
//   numColumns;

// const PhotoGrid = ({ photos, onDeletePhoto, testID = 'photo_grid' }) => {
//   const renderPhotoItem = ({ item }) => (
//     <View style={styles.photoContainer}>
//       <Image
//         source={{ uri: item.uri }}
//         style={[styles.photo, { width: photoSize, height: photoSize }]}
//       />
//       <TouchableOpacity
//         style={styles.deleteButton}
//         onPress={() => onDeletePhoto(item.id)}
//         testID={`${testID}_delete_${item.id}`}
//       >
//         <MaterialCommunityIcons
//           name="delete"
//           size={20}
//           color={colors.dark_red}
//         />
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View testID={testID} style={styles.container}>
//       <FlatList
//         data={photos}
//         renderItem={renderPhotoItem}
//         keyExtractor={(item) => item.id}
//         numColumns={numColumns}
//         contentContainerStyle={styles.list}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: containerPadding,
//     backgroundColor: colors.white,
//   },
//   list: {
//     justifyContent: 'center',
//   },
//   photoContainer: {
//     position: 'relative',
//     margin: photoMargin,
//   },
//   photo: {
//     borderRadius: 5,
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: 5,
//     right: 5,
//     backgroundColor: colors.white_var1,
//     borderRadius: 15,
//     padding: 5,
//   },
// });

// export default PhotoGrid;


// //CODE 2

// // Libs
// import React from 'react';
// import { Text, Icon, View, Image } from 'native-base';
// import { StyleSheet, TouchableOpacity } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';

// // Configurations
// import colors from 'app/config/colors';

// // Utilities
// import formatDateTime from 'app/hooks/useFormatDateTime.js';
// import EditDeleteBtn from './EditDeleteBtn';

// const PhotoGridItem = ({
//   thumbnailUrl,
//   title,
//   uploadDate,
//   onDelete,
//   onEdit,
// }) => {  
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.imageContainer}>
//         <Image
//           source={{ uri: thumbnailUrl }}
//           alt="thumbnail"
//           style={styles.image}
//         />
//       </TouchableOpacity>
//       <View style={styles.textContainer}>
//         <Text style={styles.title}>{title}</Text>
//         <Text style={styles.date}>{formatDateTime(new Date(uploadDate), true)}</Text>
//       </View>
//       <EditDeleteBtn onDelete={onDelete} onEdit={onEdit}/>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: 150,
//     margin: 10,
//     backgroundColor: colors.green_lightest,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   imageContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.grey_light,
//     height: 100,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 8,
//   },
//   textContainer: {
//     padding: 10,
//     justifyContent: 'space-between',
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.black,
//     marginBottom: 4,
//   },
//   date: {
//     fontSize: 14,
//     color: colors.grey_dark,
//   },
// });

// export default PhotoGridItem;