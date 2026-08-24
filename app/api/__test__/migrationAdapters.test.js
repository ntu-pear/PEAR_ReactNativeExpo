/**
 * @jest-environment node
 */

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  setHeaders: jest.fn(),
  axiosInstance: { defaults: { headers: { common: {} } } },
};

jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  V1_BASE: 'http://user-service/api/v1',
  PATIENT_V1_BASE: 'http://patient-service/api/v1',
  ACTIVITY_V1_BASE: 'http://activity-service/api/v1',
  SCHEDULER_V1_BASE: 'http://scheduler-service',
}));

jest.mock('react-native', () => ({
  Image: {},
}));

global.FormData = class FormData {
  constructor() {
    this.parts = [];
  }

  append(name, value) {
    this.parts.push([name, value]);
  }
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('migration API adapters', () => {
  test('activity preferences use Activity Service and normalize mobile fields', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: [
        {
          id: 11,
          centre_activity_id: 22,
          patient_id: 7,
          is_like: 1,
          activity: { title: 'Mahjong' },
        },
      ],
    });

    const response = await activityApi.getActivityPreference(7);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/centre_activity_preferences/patient/7',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        CentreActivityPreferenceID: 11,
        centreActivityID: 22,
        activityTitle: 'Mahjong',
        isLike: 1,
      }),
    );
  });

  test('doctor notes use Patient Service and return mobile list shape', async () => {
    const doctorNoteApi = require('app/api/doctorNote').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        data: [
          {
            id: 4,
            doctorName: 'Dr Tan',
            doctorRemarks: 'Review medication',
            createdDate: '2026-01-01T00:00:00',
          },
        ],
      },
    });

    const response = await doctorNoteApi.getDoctorNote(9);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/DoctorNote/GetDoctorNotesByPatient',
      { patient_id: 9, pageNo: 0, pageSize: 100 },
      expect.objectContaining({ baseURL: 'http://patient-service/api/v1' }),
    );
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        doctorNoteId: 4,
        doctorName: 'Dr Tan',
        doctorRemarks: 'Review medication',
      }),
    );
  });

  test('patient photos combine album names and personal photo records', async () => {
    const patientApi = require('app/api/patient').default;
    mockClient.get
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [
          {
            PatientID: 5,
            PatientPhotoID: 99,
            PhotoPath: 'https://example.test/photo.jpg',
            AlbumCategoryListID: 3,
            PhotoDetails: 'Birthday',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [{ AlbumCategoryListID: 3, Value: 'Family' }],
      });

    const response = await patientApi.getPatientPhoto(5);

    expect(mockClient.get).toHaveBeenNthCalledWith(
      1,
      '/PersonalPhoto/by-patient-id/5',
      {},
      expect.objectContaining({ baseURL: 'http://patient-service/api/v1' }),
    );
    expect(mockClient.get).toHaveBeenNthCalledWith(
      2,
      '/PhotoListAlbum/get_photo_list_albums',
      {},
      expect.objectContaining({ baseURL: 'http://patient-service/api/v1' }),
    );
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        patientID: 5,
        patientPhotoID: 99,
        albumCategoryName: 'Family',
        photoDetails: 'Birthday',
      }),
    );
  });

  test('activity recommendations use Activity Service and normalize labels', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: [
        {
          id: 3,
          centre_activity_id: 8,
          patient_id: 12,
          doctor_recommendation: 1,
          doctor_remarks: 'Good for mobility',
          is_deleted: false,
        },
      ],
    });

    const response = await activityApi.getActivityRecommendations(12);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/centre_activity_recommendations/patient/12',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        id: 3,
        centreActivityID: 8,
        doctorRecommendationLabel: 'Recommended',
        doctorRemarks: 'Good for mobility',
      }),
    );
  });

  test('activity recommendations fall back to list filter when patient path is missing', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        data: { detail: 'Not Found' },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [
          {
            id: 3,
            centre_activity_id: 8,
            patient_id: 12,
            doctor_recommendation: 1,
            doctor_remarks: 'Good for mobility',
            is_deleted: false,
          },
          {
            id: 4,
            centre_activity_id: 9,
            patient_id: 99,
            doctor_recommendation: -1,
            doctor_remarks: 'Other patient',
            is_deleted: false,
          },
        ],
      });

    const response = await activityApi.getActivityRecommendations(12);

    expect(mockClient.get).toHaveBeenNthCalledWith(
      1,
      '/centre_activity_recommendations/patient/12',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(mockClient.get).toHaveBeenNthCalledWith(
      2,
      '/centre_activity_recommendations/',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.data.data).toHaveLength(1);
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        id: 3,
        centreActivityID: 8,
        doctorRecommendationLabel: 'Recommended',
      }),
    );
  });

  test('activity recommendations treat empty-not-found 404 as an empty list', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get.mockResolvedValueOnce({
      ok: false,
      status: 404,
      data: { detail: 'No Centre Activity Recommendations found for Patient ID 12' },
    });

    const response = await activityApi.getActivityRecommendations(12);

    expect(response.ok).toBe(true);
    expect(response.data.data).toEqual([]);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
  });

  test('activity exclusions fall back to list filter when patient path is missing', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        data: { detail: 'Not Found' },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [
          {
            id: 1,
            centre_activity_id: 9,
            patient_id: 12,
            exclusion_remarks: 'Avoid stairs',
            start_date: '2026-07-01',
            end_date: null,
            is_deleted: false,
          },
          {
            id: 2,
            centre_activity_id: 10,
            patient_id: 99,
            exclusion_remarks: 'Other patient',
            start_date: '2026-07-01',
            is_deleted: false,
          },
        ],
      });

    const response = await activityApi.getActivityExclusions(12);

    expect(mockClient.get).toHaveBeenNthCalledWith(
      1,
      '/centre_activity_exclusions/patient/12',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(mockClient.get).toHaveBeenNthCalledWith(
      2,
      '/centre_activity_exclusions/',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.data.data).toHaveLength(1);
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        id: 1,
        centreActivityID: 9,
        exclusionRemarks: 'Avoid stairs',
      }),
    );
  });

  test('notifications list normalizes snake_case fields into mobile shape', async () => {
    const notificationApi = require('app/api/notification').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        data: {
          results: [
            {
              notification_id: 7,
              message: 'Please approve allocation',
              status: null,
              requires_action: true,
              sender_name: 'Admin',
              is_read: false,
            },
          ],
        },
        next_offset: 1,
        next_limit: 20,
      },
    });

    const response = await notificationApi.getNotificationOfUser(false, 0, 20, '');

    expect(mockClient.get).toHaveBeenCalledWith(
      '/Notification/User',
      expect.objectContaining({ offset: 0, limit: 20, readStatus: false }),
    );
    expect(response.data.data.results[0]).toEqual(
      expect.objectContaining({
        notificationID: 7,
        message: 'Please approve allocation',
        requiresAction: true,
        senderName: 'Admin',
        readStatus: false,
      }),
    );
    expect(response.data.next_offset).toBe(1);
  });

  test('notification approve action uses Action endpoint with params', async () => {
    const notificationApi = require('app/api/notification').default;
    mockClient.put.mockResolvedValueOnce({ ok: true, status: 200, data: {} });

    const response = await notificationApi.setNotificationAction(7, 'approve');

    expect(mockClient.put).toHaveBeenCalledWith(
      '/Notification/Action',
      {},
      { params: { notificationID: 7, action: 'approve' } },
    );
    expect(response.ok).toBe(true);
  });

  test('activity exclusions fall back to list filter when patient path returns 403', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        data: { detail: 'Forbidden' },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [
          {
            id: 1,
            centre_activity_id: 9,
            patient_id: 12,
            exclusion_remarks: 'Avoid stairs',
            start_date: '2026-07-01',
            end_date: null,
            is_deleted: false,
          },
        ],
      });

    const response = await activityApi.getActivityExclusions(12);

    expect(mockClient.get).toHaveBeenNthCalledWith(
      1,
      '/centre_activity_exclusions/patient/12',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(mockClient.get).toHaveBeenNthCalledWith(
      2,
      '/centre_activity_exclusions/',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.ok).toBe(true);
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        id: 1,
        centreActivityID: 9,
        exclusionRemarks: 'Avoid stairs',
      }),
    );
  });

  test('activity title map fills untitled centre activities from the catalog', () => {
    const { applyActivityTitles, buildActivityTitleMap, isMissingActivityTitle } = require('app/api/activity');
    const map = buildActivityTitleMap(
      [{ centreActivityID: 22, activityID: 5, activityTitle: 'Untitled Activity' }],
      [{ id: 5, title: 'Mahjong' }],
    );

    expect(isMissingActivityTitle('Untitled Activity')).toBe(true);
    expect(map['22']).toBe('Mahjong');
    expect(
      applyActivityTitles([{ centreActivityID: 22, activityTitle: '' }], map)[0].activityTitle,
    ).toBe('Mahjong');
  });

  test('activity titles prefer the catalog name like web main, and skip unnamed rows', () => {
    const {
      applyActivityTitles,
      buildActivityTitleMap,
      keepNamedActivities,
    } = require('app/api/activity');
    const map = buildActivityTitleMap(
      [
        { id: 22, activity_id: 5, title: 'Centre nickname' },
        { id: 23, activity_id: 9, is_deleted: true },
        { id: 24, activity_id: 8 },
      ],
      [
        { id: 5, title: 'Mahjong' },
        { id: 8, title: '' },
        { id: 9, title: 'Deleted Craft' },
      ],
    );

    expect(map['22']).toBe('Mahjong');
    expect(map['23']).toBeUndefined();
    expect(map['24']).toBeUndefined();

    const titled = applyActivityTitles(
      [
        { centreActivityID: 22, activityTitle: '' },
        { centreActivityID: 24, activityTitle: '' },
      ],
      map,
    );
    expect(titled[0].activityTitle).toBe('Mahjong');
    expect(keepNamedActivities(titled)).toHaveLength(1);
    expect(keepNamedActivities(titled)[0].centreActivityID).toBe(22);
  });

  test('catalogue merge fills Neutral for named centre activities with no preference row', () => {
    const { mergeCataloguePreferences } = require('app/api/activity');
    const rows = mergeCataloguePreferences(
      [
        { id: 22, activity_id: 5 },
        { id: 23, activity_id: 6 },
        { id: 24, activity_id: 8, is_deleted: true },
        { id: 25, activity_id: 9 },
      ],
      [
        { id: 5, title: 'Mahjong' },
        { id: 6, title: 'Art & Craft AM' },
        { id: 9, title: '' },
      ],
      [{ centreActivityID: 22, isLike: 1, centreActivityPreferenceID: 90 }],
    );

    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.centreActivityID === 22)).toEqual(
      expect.objectContaining({
        activityTitle: 'Mahjong',
        isLike: 1,
        centreActivityPreferenceID: 90,
      }),
    );
    expect(rows.find((row) => row.centreActivityID === 23)).toEqual(
      expect.objectContaining({
        activityTitle: 'Art & Craft AM',
        isLike: 0,
      }),
    );
  });

  test('create activity exclusion posts dated payload like web main', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.post.mockResolvedValueOnce({ ok: true, status: 201, data: { id: 4 } });

    const response = await activityApi.createActivityExclusion({
      centreActivityID: 22,
      patientID: 1,
      exclusionRemarks: 'Away this week',
      startDate: '2026-08-25',
      endDate: '2026-08-29',
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/centre_activity_exclusions/',
      expect.objectContaining({
        centre_activity_id: 22,
        patient_id: 1,
        exclusion_remarks: 'Away this week',
        start_date: '2026-08-25',
        end_date: '2026-08-29',
      }),
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.ok).toBe(true);
  });

  test('patient routines use Activity Service without a trailing slash', async () => {
    const activityApi = require('app/api/activity').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: [
        {
          id: 1,
          activity_id: 8,
          name: 'Morning stretch',
          day_of_week: 3,
          start_time: '09:00',
          end_time: '09:30',
        },
      ],
    });

    const response = await activityApi.getPatientRoutine(7);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/routines/patient/7',
      {},
      expect.objectContaining({ baseURL: 'http://activity-service/api/v1' }),
    );
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        activityName: 'Morning stretch',
        days: expect.stringContaining('Monday'),
        startTime: '09:00',
      }),
    );
  });

  test('patient medications normalize PascalCase PatientMedication rows', async () => {
    const patientApi = require('app/api/patient').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        data: [
          {
            Id: 9,
            PrescriptionName: 'Ibuprofen',
            Dosage: '1 tab',
            AdministerTime: '09:00',
            Instruction: 'After food',
            StartDate: '2026-08-01',
            EndDate: '2026-08-31',
          },
        ],
      },
    });

    const response = await patientApi.listPatientMedicationsV1(1);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/Medication/PatientMedication',
      expect.objectContaining({ patient_id: 1, pageNo: 0 }),
      expect.objectContaining({ baseURL: 'http://patient-service/api/v1' }),
    );
    expect(response.data.data[0]).toEqual(
      expect.objectContaining({
        medicationID: 9,
        prescriptionName: 'Ibuprofen',
        administerTime: '09:00',
        dosage: '1 tab',
      }),
    );
  });

  test('patient read fills firstName from name when first and last are missing', async () => {
    const patientApi = require('app/api/patient').default;
    mockClient.get.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { id: 1, name: 'ALICE' },
    });

    const response = await patientApi.readPatientV1(1);

    expect(response.data.data).toEqual(
      expect.objectContaining({
        firstName: 'ALICE',
        preferredName: 'ALICE',
      }),
    );
  });
});
