/**
 * @jest-environment node
 */
import {
  cleanup,
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';
import DashboardNavigator from 'app/navigation/DashboardNavigator';
import { getHighlight } from 'app/api/highlight';
import { getDashboard } from 'app/api/dashboard';

const MockEmptyPatientsData = [];
const MockEmptyHighlights = [];

jest.mock('../../hooks/useApiHandler');
// referencing https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-test
jest.mock('../../api/dashboard', () => ({
  getDashboard: jest.fn(),
}));
jest.mock('../../api/highlight', () => ({
  getHighlight: jest.fn(),
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('Test DashboardNavigator', () => {
  test('Should open highlights popup when button is pressed', async () => {
    getDashboard.mockImplementation(() =>
      Promise.resolve(MockEmptyPatientsData),
    );
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockEmptyHighlights },
    });
    const dashboardNavigator = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContainer>
          <DashboardNavigator />
        </NavigationContainer>
      </NativeBaseProvider>,
    );
    await waitFor(() => {
      const highlightsButton =
        dashboardNavigator.getByTestId('highlightsButton');
      expect(highlightsButton).toBeVisible();

      fireEvent.press(highlightsButton);
    });

    const highlightsModal = dashboardNavigator.getByTestId('highlightsModal');
    expect(highlightsModal).toBeTruthy();
    expect(highlightsModal).toHaveProp('visible', true);
  });

  test('Should close highlights popup when close button is pressed', async () => {
    getDashboard.mockImplementation(() =>
      Promise.resolve(MockEmptyPatientsData),
    );
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockEmptyHighlights },
    });
    const dashboardNavigator = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContainer>
          <DashboardNavigator />
        </NavigationContainer>
      </NativeBaseProvider>,
    );
    await waitFor(() => {
      const highlightsButton =
        dashboardNavigator.getByTestId('highlightsButton');
      expect(highlightsButton).toBeVisible();

      fireEvent.press(highlightsButton);
    });

    const highlightsModal = dashboardNavigator.getByTestId('highlightsModal');
    expect(highlightsModal).toBeTruthy();
    expect(highlightsModal).toHaveProp('visible', true);

    const highlightsCloseButton = dashboardNavigator.getByTestId(
      'highlightsCloseButton',
    );
    expect(highlightsCloseButton).toBeTruthy();

    fireEvent.press(highlightsCloseButton);
    expect(highlightsModal).toHaveProp('visible', false);
  });
});
