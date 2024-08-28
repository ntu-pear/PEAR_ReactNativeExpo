import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const BackToTopButton = ({ flatListRef, position = 'bottom-right', offset}) => {
    const handlePress = () => {
        if (flatListRef && flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };

    const getButtonStyle = () => {
        let positionStyle = {};
        switch (position) {
            case 'bottom-right':
                positionStyle = { bottom: offset, right: offset };
                break;
            case 'bottom-left':
                positionStyle = { bottom: offset, left: offset };
                break;
            case 'top-right':
                positionStyle = { top: offset, right: offset };
                break;
            case 'top-left':
                positionStyle = { top: offset, left: offset };
                break;
            default:
                positionStyle = { bottom: offset, right: offset };
        }
        return positionStyle;
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle()]}
            onPress={handlePress}
        >
            <MaterialCommunityIcons name="chevron-up-circle" size={55} color="grey"/>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 65,
        alignItem: 'center',
    },
});

export default BackToTopButton;