// Libs
import React from 'react';
import { Text, Icon, View } from 'native-base';
import {  StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import formatDateTime from 'app/hooks/useFormatDateTime.js';
import EditDeleteBtn from './EditDeleteBtn';

const ProblemLogItem = ({
  problemLogRemarks,
  authorName,
  problemLogListDesc,
  createdDateTime,
  onDelete,
  onEdit
}) => {  
  return (
    <View 
      style={[styles.container]}>
      <Icon
        as={
          <MaterialIcons 
          name="report-problem" 
          />
        } 
        size={12}
        color={colors.red}
      >
      </Icon>
      <View style={styles.textContainer}>
        {authorName ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.text, styles.bold]}>Author: </Text>
              <Text style={[styles.text]}>{authorName}</Text>
            </Text>
          </View>
          ): null}
        {problemLogListDesc ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.text, styles.bold]}>Description: </Text>
              <Text style={[styles.text]}>{problemLogListDesc}</Text>
            </Text>
          </View>
          ): null}
        
        {problemLogRemarks ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.text, styles.bold]}>Remarks: </Text>
              <Text style={[styles.text]}>{problemLogRemarks}</Text>
            </Text>
          </View>
          ): null}
        {createdDateTime ? (
          <View style={{flexDirection: 'row',  marginLeft: 20}}>
            <Text>
              <Text style={[styles.text, styles.bold]}>Created: </Text>
              <Text style={[styles.text]}>{formatDateTime(new Date(createdDateTime), true)}</Text>
            </Text>
          </View>
          ): null}
      </View>
      <EditDeleteBtn onDelete={onDelete} onEdit={onEdit}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: colors.green_lightest,
    padding: 20, 
    borderRadius: 8
  },
  textContainer: {
    flex: 1
  },
  heading: {
    marginLeft: 20,
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 7,
  },
  text: {
    marginTop: 4,
    fontSize: 16,
  },
  medTime: {
    fontSize: 20,
    marginLeft: 17,
    marginRight: 15,
  },
  red: {
    color: colors.dark_red
  },
  bold: {
    marginLeft: 20,
    fontWeight: '600',
  },
});

export default ProblemLogItem;
