// /**
//  * @jest-environment node
//  */
// import { cleanup, render, fireEvent } from '@testing-library/react-native';
// import { NativeBaseProvider } from 'native-base';
// import { NavigationContext } from '@react-navigation/native';
// import '@testing-library/jest-native/extend-expect';
// import DashboardScreen from 'app/screens/DashboardScreen';
// import { getHighlight } from 'app/api/highlight';
//
// const MockEmptyHighlights = [];
//
// jest.mock('../../hooks/useApiHandler');
// // referencing https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-test
// jest.mock('../../api/highlight', () => ({
//   getHighlight: jest.fn(),
// }));
//
// const inset = {
//   frame: { x: 0, y: 0, width: 0, height: 0 },
//   insets: { top: 0, left: 0, right: 0, bottom: 0 },
// };
//
// // fake NavigationContext value data
// // allows useFocusEffect to determine if component has been focused
// const navContext = {
//   isFocused: () => true,
//   // addListener returns an unscubscribe function.
//   addListener: jest.fn(() => jest.fn()),
// };
//
// afterEach(() => {
//   cleanup();
//   jest.clearAllMocks();
// });
//
// describe('Test DashboardScreen', () => {
//   test('Should open highlights popup when button is pressed', async () => {
//     getHighlight.mockReturnValueOnce({
//       ok: true,
//       data: { data: MockEmptyHighlights },
//     });
//     const dashboardScreen = render(
//       <NativeBaseProvider initialWindowMetrics={inset}>
//         <NavigationContext.Provider value={navContext}>
//           <DashboardScreen />
//         </NavigationContext.Provider>
//       </NativeBaseProvider>,
//     );
//     const highlightsButton = dashboardScreen.getByTestId('highlightsButton');
//     expect(highlightsButton).toBeVisible();
//
//     fireEvent.press(highlightsButton);
//
//     const highlightsModal = dashboardScreen.getByTestId('highlightsModal');
//     expect(highlightsModal).toBeTruthy();
//     expect(highlightsModal).toHaveProp('visible', true);
//   });
//
//   test('Should close highlights popup when close button is pressed', async () => {
//     getHighlight.mockReturnValueOnce({
//       ok: true,
//       data: { data: MockEmptyHighlights },
//     });
//     const dashboardScreen = render(
//       <NativeBaseProvider initialWindowMetrics={inset}>
//         <NavigationContext.Provider value={navContext}>
//           <DashboardScreen />
//         </NavigationContext.Provider>
//       </NativeBaseProvider>,
//     );
//     const highlightsButton = dashboardScreen.getByTestId('highlightsButton');
//     expect(highlightsButton).toBeVisible();
//
//     fireEvent.press(highlightsButton);
//
//     const highlightsModal = dashboardScreen.getByTestId('highlightsModal');
//     expect(highlightsModal).toBeTruthy();
//     expect(highlightsModal).toHaveProp('visible', true);
//
//     const highlightsCloseButton = dashboardScreen.getByTestId(
//       'highlightsCloseButton',
//     );
//     expect(highlightsCloseButton).toBeTruthy();
//
//     fireEvent.press(highlightsCloseButton);
//     expect(highlightsModal).toHaveProp('visible', false);
//   });
// });
