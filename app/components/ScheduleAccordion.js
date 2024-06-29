// Libs
import {
    AspectRatio,
    Box,
    Center,
    Divider,
    Image,
    ScrollView,
    Stack,
    Text,
    VStack,
} from 'native-base';
import React, { useEffect, useState, useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// API
// import scheduleAPI from 'app/api/schedule';

import ConfigCard from './ConfigCard';
import { useGetWeekDates } from 'app/hooks/useGetWeekDate';

function ScheduleAccordion({}) {
    const { thisWeek, nextWeek, weekAfterNext } = useGetWeekDates();
    const [activeSections, setActiveSections] = useState([]);
    const [sections, setSections] = useState([]);

    
    const handleScheduleOnPress = () => {
        return (
            <View>
                <VStack flexWrap="wrap" mb="1">
                    <ConfigCard
                        checkWeek={thisWeek}
                        vectorIconComponent={<MaterialCommunityIcons name="calendar" />}
                        text={'This Week (' + thisWeek + ')'}
                    />
                    <ConfigCard
                        checkWeek={nextWeek}
                        vectorIconComponent={<MaterialCommunityIcons name="calendar" />}
                        text={'1 Week later (' + nextWeek + ')'}
                    />
                    <ConfigCard
                        checkWeek={weekAfterNext}
                        vectorIconComponent={<MaterialCommunityIcons name="calendar" />}
                        text={'2 Weeks later (' + weekAfterNext + ')'}
                    />
                </VStack>
            </View>
        );
    };

    const handleOnPress = (title) => {
        switch (title) {
            case 'Generate Schedule':
                return handleScheduleOnPress();
            case 'Others':
                return null;
            default:
                return null;
        }
    };

    useEffect(() => {
        setSections([
            {
                title: 'Generate Schedule',
            },
            {
                title: 'Others',
            },
        ]);
    }, []);

    function renderHeader(section, _, isActive) {
        return (
            <View style={styles.accordHeader}>
                <Text style={styles.accordTitle}>{section.title}</Text>
                <Icon name={isActive ? 'chevron-up' : 'chevron-down'} size={30} color={colors.white_var1} />
            </View>
        );
    }

    function renderContent(section, _, isActive) {
        return (
            <View style={styles.accordBody}>
                {handleOnPress(section.title)}
            </View>
        );
    }

    return (
        <Accordion
            align="top"
            sections={sections}
            activeSections={activeSections}
            renderHeader={renderHeader}
            renderContent={renderContent}
            onChange={(sections) => setActiveSections(sections)}
            sectionContainerStyle={styles.accordContainer}
        />
    );
}

// Accordion styles
const styles = StyleSheet.create({
    accordContainer: {
        paddingBottom: 4,
    },
    accordHeader: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.green,
    },
    accordTitle: {
        fontSize: 30,
        paddingTop: 15,
        fontWeight: 'bold',
        color: colors.white_var1,
        marginHorizontal: '2%',
    },
    accordBody: {
        fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    },
});

export default ScheduleAccordion;
