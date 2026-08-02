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
});
