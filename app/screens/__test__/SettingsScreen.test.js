/**
 * @jest-environment node
 */
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import SettingsScreen from 'app/screens/SettingsScreen';
import '@testing-library/jest-native/extend-expect';
import routes from 'app/navigation/routes';

const createTestProps = (props) => ({
  navigation: {
    push: jest.fn(),
  },
  ...props,
});

jest.setTimeout(10000);
// we need to pass this in to NativeBaseProvider else the content within would
// not be rendered
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
describe('Test Settings Screen', () => {
  test('should navigate to Change Password Screen upon clicking Change Password', async () => {
    this.props = createTestProps({});
    const settingsScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <SettingsScreen {...this.props} />
      </NativeBaseProvider>,
    );
    const changePassword = settingsScreen.getByText('Change Password');
    expect(changePassword).toBeVisible();
    fireEvent.press(changePassword);

    await waitFor(() => {
      expect(this.props.navigation.push).toHaveBeenCalledTimes(1);
      expect(this.props.navigation.push).toHaveBeenCalledWith(
        routes.CHANGE_PASSWORD,
      );
    });
  });
});
