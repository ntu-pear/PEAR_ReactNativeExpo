/**
 * @jest-environment node
 */
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { NativeBaseProvider, FlatList } from 'native-base';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';
import '@testing-library/jest-native/extend-expect';
import errors from 'app/config/errors';
import { getHighlight } from 'app/api/highlight';

const MockEmptyHighlights = [];

const MockFilledHighlights = [
  {
    patientName: 'Alice Lee',
    profilePicture:
      'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
    patientID: 1,
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
    patientName: 'Bi Gong',
    profilePicture:
      'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg',
    patientID: 4,
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
    patientName: 'Yan Yi',
    profilePicture:
      'https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg',
    patientID: 2,
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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

    const newActivityExclusionDropdownItem = patientDailyHighlights.getByTestId(
      'newActivityExclusionDropdownItem',
    );
    fireEvent.press(newActivityExclusionDropdownItem);

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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
        <PatientDailyHighlights />
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
});
