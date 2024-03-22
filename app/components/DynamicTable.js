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

function DynamicTable({ headerData, rowData, widthData, screenName, onClickEdit, edit=false, onClickDelete, del=false, customColumns=[], noDataMessage=()=>{} }){  
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


  // Get header data
  const getHeaderData = () => {
    let tempHeaderData = [...headerData.filter(x=>x!='ID')]
    if(edit) {
      tempHeaderData.push('Edit');
    }
    if(del) {
      tempHeaderData.push('Delete');
    }
    customColumns.forEach(item=>(
      tempHeaderData.push(item.title)
    ));
    return tempHeaderData;
  }

  // Get row data by removing ID values if any and adding edit/delete/custom buttons
  const getRowData = () => {
    let tempRowData = [...rowData];
    if(edit) {
      tempRowData = tempRowData.map(item=>(
        [...item, editButton(item[headerData.indexOf('ID')])]
      ))
    }
    if(del) {
      tempRowData = tempRowData.map(item=>(
        [...item, deleteButton(item[headerData.indexOf('ID')])]
      ))
    }
    if(headerData.includes('ID')) {
      tempRowData = tempRowData.map(item=>(
        item.slice(headerData.indexOf('ID')+1)
      ))
    }
    console.log(tempRowData)
    return tempRowData;
  }

  // Get width data
  const getWidthData = () => {
    let tempWidthData = [...widthData]
    if(edit) {
      tempWidthData.push(140);
    } 
    if(del) {
      tempWidthData.push(140);
    } 
    customColumns.forEach(item=>(
      tempWidthData.push(item.width)
    ))
    return tempWidthData;
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
                    widthArr={getWidthData()} 
                    data={getHeaderData()} 
                    />
                    {getRowData().map((row, index) => (
                      <Row
                        textStyle={styles.rowText} 
                        widthArr={getWidthData()}
                        key={index}
                        data={row.concat(
                          customColumns.map((column) => (
                            <View key={column.title} style={{marginVertical: '7%', marginHorizontal: '7%'}}>
                              <AppButton 
                                title={column.title} 
                                onPress={() => column.onPress(index)} 
                                color={column.color}
                              />
                            </View>
                          ))
                        )}
                      />
                    ))} 
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
