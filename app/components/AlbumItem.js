import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';

// Configurations
import colors from 'app/config/colors';

const AlbumItem = ({ photoPath, albumCategoryName, onEdit, onDelete }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Image source={{ uri: photoPath }} style={styles.photo} />

        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            {albumCategoryName ? (
              <View
                style={{ flexDirection: 'row', marginLeft: 5, marginTop: 5 }}
              >
                <Text>
                  <Text style={[styles.text, styles.bold]}>
                    {albumCategoryName}
                  </Text>
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onEdit}
              style={[
                styles.button,
                {
                  borderColor: colors.green,
                  borderWidth: 2,
                },
              ]}
              labelStyle={{ color: colors.green }}
              contentStyle={styles.buttonContent}
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={onDelete}
              style={[
                styles.button,
                { borderColor: colors.pink, borderWidth: 2 },
              ]}
              labelStyle={{ color: colors.pink }}
              contentStyle={styles.buttonContent}
            >
              Delete
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 8,
    elevation: 2, // Adds shadow for Android
    backgroundColor: colors.green_lightest,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: colors.green_lighter,
    borderWidth: 3,
  },
  contentContainer: {
    flexDirection: 'row', // Align title, description, and buttons in a row
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1, // Allow the text section to take as much space as possible
  },
  text: {
    marginTop: 4,
    fontSize: 20,
  },
  bold: {
    marginLeft: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align buttons vertically in the center
    marginLeft: 10,
    marginTop: 5,
  },
  button: {
    marginHorizontal: 5,
  },
  buttonContent: {
    marginVertical: -5, // Reduce vertical padding to make the button more compact
    marginHorizontal: -10, // Reduce horizontal padding if needed
  },
});

export default AlbumItem;
