import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import colors from '../config/colors';

function AppButton(props) {
    // Destructure props
    const { title, onPress, color } = props;
    return (
        <TouchableOpacity style={[styles.button, {backgroundColor: colors[color]}]} onPress={onPress}>
            <Text style={styles.text}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.light_gray,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        widht: "100%"
    },
    text: {
        color: colors.secondary,
        textTransform: "uppercase",
        fontWeight: "bold",
        fontSize: 18
    }
})

export default AppButton;
