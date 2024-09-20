const CustomAlert = ({ title, message, onConfirm, onCancel, testID }) => {
  return (
    <Modal
      transparent={true}
      visible={true}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text testID={`${testID}_title`}>{title}</Text>
          <Text testID={`${testID}_message`}>{message}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onCancel} testID={`${testID}_cancel`} />
            <Button title="OK" onPress={onConfirm} testID={`${testID}_confirm`} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;