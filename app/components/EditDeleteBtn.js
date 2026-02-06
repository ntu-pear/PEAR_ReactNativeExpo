// Libs
import React from 'react';
import { Text, View } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

// Configurations
import colors from 'app/config/colors';


const EditDeleteBtn = ({
  testID,
  onEdit,
  onDelete
}) => {  
  return (
    <View style={styles.editDelContainer}>
      {onEdit ? (
        <TouchableOpacity
          testID={`${testID}_edit`}
          style={[styles.btnBase, styles.editBtn]}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, styles.editText]}>Edit</Text>
        </TouchableOpacity>
      ) : null}
      {onDelete ? (
        <TouchableOpacity
          testID={`${testID}_delete`}
          style={[styles.btnBase, styles.deleteBtn]}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, styles.deleteText]}>Delete</Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnBase: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.white,
    minWidth: 64,
    alignItems: 'center',
  },
  editBtn: {
    borderColor: colors.green,
    marginRight: 10,
  },
  deleteBtn: {
    borderColor: colors.red,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editText: {
    color: colors.green,
  },
  deleteText: {
    color: colors.red,
  },
});

export default EditDeleteBtn;
