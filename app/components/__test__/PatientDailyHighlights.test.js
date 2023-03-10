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
import { NavigationContext } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';
import { act } from 'react-test-renderer';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';
import { getHighlight } from 'app/api/highlight';

const MockEmptyHighlights = [];

const MockFilledHighlights = [
  {
    patientInfo: {
      patientId: 1,
      patientName: 'Alice Lee',
      patientPhoto:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
    },
    highlights: [
      {
        highlightID: 1,
        highlightTypeID: 2,
        highlightType: 'newAllergy',
        highlightJson: {
          id: 36,
          value: 'New allergy to prawn.',
        },
        startDate: '2022-12-28T08:21:54.639Z',
        endDate: '2022-12-28T08:21:54.639Z',
      },
      {
        highlightID: 2,
        highlightTypeID: 4,
        highlightType: 'abnormalVital',
        highlightJson: {
          id: 37,
          value: 'Heartbeat faster than usual.',
        },
        startDate: '2022-12-28T08:21:54.639Z',
        endDate: '2022-12-28T08:21:54.639Z',
      },
    ],
  },
  {
    patientInfo: {
      patientId: 4,
      patientName: 'Bi Gong',
      patientPhoto:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg',
    },
    highlights: [
      {
        highlightID: 3,
        highlightTypeID: 1,
        highlightType: 'newPrescription',
        highlightJson: {
          id: 38,
          value: 'New prescription for blood pressure.',
        },
        startDate: '2022-12-28T08:21:54.639Z',
        endDate: '2022-12-28T08:21:54.639Z',
      },
      {
        highlightID: 4,
        highlightTypeID: 6,
        highlightType: 'medicalHistory',
        highlightJson: {
          id: 39,
          value: 'New diagnosis for dementia.',
        },
        startDate: '2022-12-28T08:21:54.639Z',
        endDate: '2022-12-28T08:21:54.639Z',
      },
    ],
  },
  {
    patientInfo: {
      patientId: 2,
      patientName: 'Yan Yi',
      patientPhoto:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg',
    },
    highlights: [
      {
        highlightID: 5,
        highlightTypeID: 4,
        highlightType: 'abnormalVital',
        highlightJson: {
          id: 40,
          value: 'Blood pressure lower than usual.',
        },
        startDate: '2022-12-28T08:21:54.639Z',
        endDate: '2022-12-28T08:21:54.639Z',
      },
    ],
  },
  {
    patientInfo: {
      patientId: 5,
      patientName: 'Hui Wen',
      patientPhoto: null,
    },
    highlights: [
      {
        highlightID: 5,
        highlightTypeID: 3,
        highlightType: 'newActivityExclusion',
        highlightJson: {
          id: 40,
          value: 'Should not do jumping activities.',
        },
        startDate: '2022-12-28T08:21:54.639Z',
        endDate: '2022-12-28T08:21:54.639Z',
      },
    ],
  },
];

jest.mock('../../hooks/useApiHandler');
// referencing https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-test
jest.mock('../../api/highlight', () => ({
  getHighlight: jest.fn(),
}));

// we need to pass this in to NativeBaseProvider else the content within would
// not be rendered
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// fake NavigationContext value data
// allows useFocusEffect to determine if component has been focused
const navContext = {
  isFocused: () => true,
  // addListener returns an unscubscribe function.
  addListener: jest.fn(() => jest.fn()),
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('Test PatientDailyHighlights', () => {
  test('Initial render with no highlights', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockEmptyHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(flatList).toHaveTextContent('No patient changes found today.');
    });
  });

  test('Initial render with a few highlights', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
  });

  test('Search function', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });

    fireEvent.changeText(searchBar, 'Alic');
    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      1,
    );
  });

  test('Search function then cancel', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });

    fireEvent.changeText(searchBar, 'Alic');
    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      1,
    );

    fireEvent.changeText(searchBar, '');
    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      MockFilledHighlights.length,
    );
  });

  test('Search function should not be case sensitive', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });

    fireEvent.changeText(searchBar, 'alic');
    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      1,
    );

    fireEvent.changeText(searchBar, '');
    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      MockFilledHighlights.length,
    );
  });

  test('Filter function', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
    // press on dropdownPicker to open it
    // referencing https://github.com/hossein-zare/react-native-dropdown-picker/issues/618
    fireEvent.press(dropdownPicker);

    const newAllergyDropdownItem = patientDailyHighlights.getByTestId(
      'newAllergyDropdownItem',
    );
    fireEvent.press(newAllergyDropdownItem);

    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      1,
    );
  });

  test('Filter function choose highlightType with no highlights', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
    fireEvent.press(dropdownPicker);

    const problemDropdownItem = patientDailyHighlights.getByTestId(
      'problemDropdownItem',
    );
    fireEvent.press(problemDropdownItem);

    const flatList = patientDailyHighlights.getByTestId('flatList');
    expect(flatList).toBeVisible();
    expect(flatList).toHaveTextContent('No patient changes found today.');
  });

  test('Filter function choose two highlightTypes', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
    fireEvent.press(dropdownPicker);

    const newPrescriptionDropdownItem = patientDailyHighlights.getByTestId(
      'newPrescriptionDropdownItem',
    );
    fireEvent.press(newPrescriptionDropdownItem);

    const newAllergyDropdownItem = patientDailyHighlights.getByTestId(
      'newAllergyDropdownItem',
    );
    fireEvent.press(newAllergyDropdownItem);

    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      2,
    );
  });

  test('Filter function choose two highlightTypes then cancel one', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
    fireEvent.press(dropdownPicker);

    const newPrescriptionDropdownItem = patientDailyHighlights.getByTestId(
      'newPrescriptionDropdownItem',
    );
    fireEvent.press(newPrescriptionDropdownItem);

    const newAllergyDropdownItem = patientDailyHighlights.getByTestId(
      'newAllergyDropdownItem',
    );
    fireEvent.press(newAllergyDropdownItem);

    fireEvent.press(newPrescriptionDropdownItem);

    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      1,
    );
  });

  test('Filter function then cancel all', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
    fireEvent.press(dropdownPicker);

    const newPrescriptionDropdownItem = patientDailyHighlights.getByTestId(
      'newPrescriptionDropdownItem',
    );
    fireEvent.press(newPrescriptionDropdownItem);

    const newAllergyDropdownItem = patientDailyHighlights.getByTestId(
      'newAllergyDropdownItem',
    );
    fireEvent.press(newAllergyDropdownItem);

    fireEvent.press(newPrescriptionDropdownItem);
    fireEvent.press(newAllergyDropdownItem);

    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      MockFilledHighlights.length,
    );
  });

  test('Search and filter at the same time', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });
    fireEvent.press(dropdownPicker);

    const abnormalVitalDropdownItem = patientDailyHighlights.getByTestId(
      'abnormalVitalDropdownItem',
    );
    fireEvent.press(abnormalVitalDropdownItem);

    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      2,
    );

    fireEvent.changeText(searchBar, 'Alic');

    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      1,
    );
  });

  test('Pull to refresh calls the API again', async () => {
    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });
    const patientDailyHighlights = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <PatientDailyHighlights />
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

    const searchBar = patientDailyHighlights.getByPlaceholderText('Search');
    const dropdownPicker = patientDailyHighlights.getByTestId('dropdownPicker');
    expect(searchBar).toBeVisible();
    expect(dropdownPicker).toBeVisible();

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);

      const flatList = patientDailyHighlights.getByTestId('flatList');
      expect(flatList).toBeVisible();
      expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
      expect(
        patientDailyHighlights.getAllByTestId('highlightsCard').length,
      ).toBe(MockFilledHighlights.length);
    });

    getHighlight.mockReturnValueOnce({
      ok: true,
      data: { data: MockFilledHighlights },
    });

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(1);
    });

    const flatList = patientDailyHighlights.getByTestId('flatList');
    expect(flatList).toBeVisible();
    expect(flatList).toBeDefined();
    expect(patientDailyHighlights.getAllByTestId('flatList').length).toBe(1);
    expect(patientDailyHighlights.getAllByTestId('highlightsCard').length).toBe(
      MockFilledHighlights.length,
    );

    // referencing https://github.com/callstack/react-native-testing-library/issues/809
    const { refreshControl } = flatList.props;
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(getHighlight).toBeCalledTimes(2);
    });
  });
});
