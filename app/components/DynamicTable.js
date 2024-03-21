import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Button,
  Divider,
  ScrollView,
  View,
} from 'native-base';
import { Table, Row, Rows } from 'react-native-table-component';
import colors from 'app/config/colors';

function DynamicTable({ headerData, rowData, widthData, screenName, onClickEdit, onClickDelete }){
  console.log([...widthData, onClickEdit ? [100] : [],  onClickDelete ? [100] : []])
  console.log([...headerData, onClickEdit ? ['Edit'] : [], onClickDelete ? ['Delete'] : []])
  // console.log()

  return (
    <ScrollView style={styles.scrollViewVertical}>
      <ScrollView horizontal>
        <View>
          {rowData.length !== 0 ? 
            <View>
              <Table borderStyle={{ borderWidth: 1, borderColor: colors.primary_gray }}>
                <Row 
                  style={styles.head} 
                  textStyle={styles.titleText}
                  widthArr={[...widthData, onClickEdit ? [100] : [],  onClickDelete ? [100] : []]} 
                  data={[...headerData, onClickEdit ? ['Edit'] : [], onClickDelete ? ['Delete'] : []]} 
                  />
                <Rows 
                  textStyle={styles.rowText} 
                  data={[...rowData,  onClickEdit ? [<Button title="Edit" onPress={() => console.log('Edit button pressed')} />] : [], 
                  onClickDelete ? [<Button title="Edit" onPress={() => console.log('Edit button pressed')} />] : []]} 
                  widthArr={[...widthData, onClickEdit ? [100] : [],  onClickDelete ? [100] : []]}
                  /> 
              </Table>
              <Divider/>
            </View>
            :
            <View>
              <Text style={styles.rowText}>
                No data available
              </Text>
            </View>
          }
        </View>
      </ScrollView>
      <Text style={styles.redText}>
        Note: To include extra {screenName} information, please contact system administrator.
      </Text>
    </ScrollView>
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
