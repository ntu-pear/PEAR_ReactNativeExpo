/*
This is an example of how to create a custom hook. 
This is especially useful when we need to repetiviely use the same hook.

Naming Convention: use<Insert meaningful name>
*/

// import { useEffect, useState } from "react";
// import * as Location from "expo-location";

// export default useLocation = () => {
//   const [location, setLocation] = useState();

//   const getLocation = async () => {
//     try {
//       const { granted } = await Location.requestPermissionsAsync();
//       if (!granted) return;
//       const {
//         coords: { latitude, longitude },
//       } = await Location.getLastKnownPositionAsync();
//       setLocation({ latitude, longitude });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getLocation();
//   }, []);

//   return location;
// };
