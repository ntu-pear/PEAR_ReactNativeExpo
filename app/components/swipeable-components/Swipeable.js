// Libs
import React, { useRef } from 'react';
import { View } from 'native-base';
import { StyleSheet, PanResponder, Animated } from 'react-native';

const Swipeable = ({item, underlay, onSwipeLeft=()=>{}, onSwipeRight=()=>{}}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let dx = gestureState.dx;

        // Limit how far user can swipe
        if (gestureState.dx < 0) {
          dx = Math.max(-150, Math.min(0, gestureState.dx)); 
        } else {
          dx = Math.min(150, Math.max(0, gestureState.dx)); 
        }
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Right swipe
        if (gestureState.dx < -50) {
          onSwipeRight();
        }
        
        // Left Swipe
        if (gestureState.dx > 50) {
          onSwipeLeft();
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {underlay}
      <Animated.View
        style={[styles.swipeable, {transform: [{ translateX: translateX }]}]}
        {...panResponder.panHandlers}
        >
        {item}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  swipeable: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Swipeable;
