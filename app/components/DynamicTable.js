// Libs
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Divider,
  ScrollView,
  View,
} from 'native-base';
import { Table, Row, Rows } from 'react-native-table-component';

// Configurations
import colors from 'app/config/colors';

// Components
import AppButton from './AppButton';

function DynamicTable({ headerData, rowData, widthData, screenName, onClickEdit, onClickDelete, noDataMessage }){
  // Button to edit item
  const editButton = (id) => {
    return (
      <View style={{marginVertical: '7%', marginHorizontal: '7%'}}>
        <AppButton 
          title="Edit" 
          onPress={() => onClickEdit(id)} 
          color='green'
          />
      </View>
    )
  }

  // Button to delete item
  const deleteButton = (id) => {
    return (
      <View style={{marginVertical: '7%', marginHorizontal: '7%'}}>
        <AppButton 
          title="Delete" 
          onPress={() => onClickDelete(id)} 
          color='red'
        />
      </View>
    )
  }

  // Get row data by removing ID values if any and adding edit/delete buttons
  const getRowData = () => {
    return rowData.map(item=>(
      [...headerData.includes('ID') ? item.slice(headerData.indexOf('ID')+1) : item,  
        onClickEdit ? editButton(item[headerData.indexOf('ID')]): [], 
        onClickDelete ? deleteButton(item[headerData.indexOf('ID')]) : []]
    ))
  }

  return (
    rowData.length > 0 ? (
      <ScrollView style={styles.scrollViewVertical}>
        <ScrollView horizontal>
          <View>
              <View>
                <Table borderStyle={{ borderWidth: 1, borderColor: colors.primary_gray }}>
                  <Row 
                    style={styles.head} 
                    textStyle={styles.titleText}
                    widthArr={[...widthData, onClickEdit ? 140 : [],  onClickDelete ? 140 : []]} 
                    data={[...headerData.filter(x=>x!='ID'), onClickEdit ? 'Edit': [], onClickDelete ? 'Delete' : []]} 
                    />
                  <Rows 
                    textStyle={styles.rowText} 
                    data={getRowData()} 
                    widthArr={[...widthData, onClickEdit ? 140 : [],  onClickDelete ? 140 : []]}
                    /> 
                </Table>
                <Divider/>
              </View>
          </View>
        </ScrollView>
        <Text style={styles.redText}>
          Note: To include extra {screenName} information, please contact system administrator.
        </Text>
      </ScrollView>
    ) : (
      noDataMessage
    )
  );
}

const styles = StyleSheet.create({
  scrollViewVertical: {
    marginTop: 15,
  },
  head: {
    height: 44,
    backgroundColor: colors.green,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light,
    flex: 1,
    textAlign: 'center',
    padding: 10,
  },
  rowText: {
    fontSize: 18,
    color: colors.light_gray2,
    flex: 1,
    //textAlign: 'center',
    padding: 10,
  },
  redText: {
    alignSelf: "center",
    color: colors.red,
    marginBottom: 15,
    marginTop: 15,
  },
});

export default DynamicTable;
