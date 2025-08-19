import React from 'react';
import { Text, Icon, View } from 'native-base';
import { StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Configurations
import colors from 'app/config/colors';

// Utilities
import { formatDate } from 'app/utility/miscFunctions';
import { TouchableOpacity } from 'react-native';

const ItemCard = ({
  icon,
  cardContents,
  onEdit=()=>{},
  onDelete=()=>{},
  bottomButton,
}) => {
  return (
    <View style={[styles.container, {borderBottomLeftRadius: bottomButton ? 0 : 8, borderBottomRightRadius: bottomButton ? 0 : 8}]}>
      <View style={styles.editDelContainer}>
        {onEdit ? (
          <TouchableOpacity style={styles.editBtn}>
            <Text style={{color: colors.green, fontSize: 16}}>Edit</Text>
          </TouchableOpacity>
        ) : null}
        {onDelete ? (
          <TouchableOpacity style={styles.delBtn}>
            <Text style={{color: colors.red, fontSize: 16}}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {icon}
      {cardContents}
      {bottomButton}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green_lightest,
    padding: 20,
    borderRadius: 8,
    marginTop: 100,
  },
  editDelContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  editBtn: {
    paddingHorizontal: '10%'
  },
  deleteBtn: {
    paddingHorizontal: '10%'
  },
  whiteText: {
    marginTop: 4,
    fontSize: 16,
    color: colors.white
  },
  administerContainer: {
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderBottomLeftRadius: 8, 
    borderBottomRightRadius: 8,
  },
  
});

export default ItemCard;
