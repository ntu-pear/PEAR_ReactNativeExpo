// Libs
import React from 'react';
import { Text, View } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

// Configurations
import colors from 'app/config/colors';


const EditDeleteBtn = ({
  onEdit,
  onDelete
}) => {  
  return (
    <View style={styles.editDelContainer}>
      {onEdit ? (
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={{color: colors.green, fontSize: 16}}>Edit</Text>
        </TouchableOpacity>
      ) : null}
      {onDelete ? (
        <TouchableOpacity style={styles.delBtn} onPress={onDelete}>
          <Text style={{color: colors.red, fontSize: 16}}>Delete</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  editDelContainer: {
    position: 'absolute',
    right: 14,
    top: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  editBtn: {
    paddingHorizontal: '5%'
  },
  deleteBtn: {
    paddingHorizontal: '5%'
  },
});

export default EditDeleteBtn;
