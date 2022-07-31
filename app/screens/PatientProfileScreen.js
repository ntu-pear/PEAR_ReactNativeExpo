import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AppButton from '../components/AppButton';

function PatientProfileScreen(props) {
    const {navigation, route} = props;
    const patientProfile = route.params;
    const handleProfileButton = () => {
        console.log("tesitn profile");
        console.log(patientProfile);
    }

    return (
        <View>
            <Text>
                This is patient Profile screen.
                
            </Text>
            <AppButton title="test" color="red" onPress={handleProfileButton}/>
        </View>
    )
}

const styles = StyleSheet.create({})
export default PatientProfileScreen;