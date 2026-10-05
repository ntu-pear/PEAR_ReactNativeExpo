// Libs
import React, { useContext, useState, useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  Button,
  Center,
  VStack,
  HStack,
  ScrollView,
  Text,
  View,
} from 'native-base';
import { useFocusEffect } from '@react-navigation/native';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';

// API
import patientApi from 'app/api/patient';
import guardianApi from 'app/api/guardian';
import socialHistoryApi from 'app/api/socialHistory';
import AuthContext from 'app/auth/context';

// Config
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';

// Components
import PatientInformationCard from 'app/components/PatientInformationCard';
import PatientProfileCard from 'app/components/PatientProfileCard';
import PatientInformationAccordion from 'app/components/PatientInformationAccordion';
import ActivityIndicator from 'app/components/ActivityIndicator';
import requestDeadline from 'app/utility/requestDeadline';

// Import default placeholder image
const defaultProfilePicture = require('app/assets/placeholder.png');

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const { user } = useContext(AuthContext) || {};
  const toStr = (v) => (v == null ? '' : String(v));

  const sanitizeGuardianData = (gd) => {
    if (!gd) {
      return null;
    }

    // Extract the actual guardian data from nested structure
    // API returns: { patient_guardian: {...}, relationshipName: "..." }
    const guardianData = gd.patient_guardian || gd;
    const relationshipName = gd.relationshipName || gd.relationship;

    // Helper to get value from multiple possible keys
    const getValue = (obj, keys) => {
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key];
        }
      }
      return undefined;
    };

    // Normalize field names to camelCase as expected by the Edit screen
    const normalized = {
      guardianID: getValue(guardianData, [
        'guardianID',
        'guardian_id',
        'GuardianID',
        'id',
        'ID',
      ]),
      firstName: getValue(guardianData, [
        'firstName',
        'first_name',
        'FirstName',
        'given_name',
        'givenName',
      ]),
      lastName: getValue(guardianData, [
        'lastName',
        'last_name',
        'LastName',
        'family_name',
        'familyName',
        'surname',
      ]),
      preferredName: getValue(guardianData, [
        'preferredName',
        'preferred_name',
        'PreferredName',
        'nickname',
      ]),
      nric: toStr(
        getValue(guardianData, ['nric', 'NRIC', 'Nric', 'nric_no', 'NRIC_No']),
      ),
      NRIC: toStr(
        getValue(guardianData, ['NRIC', 'nric', 'Nric', 'nric_no', 'NRIC_No']),
      ),
      contactNo: getValue(guardianData, [
        'contactNo',
        'contact_no',
        'ContactNo',
        'phoneNumber',
        'phone_number',
        'contact_number',
      ]),
      gender: getValue(guardianData, ['gender', 'Gender', 'sex', 'Sex']),
      dob: getValue(guardianData, [
        'dob',
        'DOB',
        'dateOfBirth',
        'date_of_birth',
        'DateOfBirth',
      ]),
      address: getValue(guardianData, [
        'address',
        'Address',
        'home_address',
        'homeAddress',
      ]),
      postalCode: getValue(guardianData, [
        'postalCode',
        'postal_code',
        'PostalCode',
        'postal',
        'Postal',
      ]),
      tempAddress: getValue(guardianData, [
        'tempAddress',
        'temp_address',
        'TempAddress',
        'temporary_address',
      ]),
      tempPostalCode: getValue(guardianData, [
        'tempPostalCode',
        'temp_postal_code',
        'TempPostalCode',
        'temp_postal',
      ]),
      email: getValue(guardianData, [
        'email',
        'Email',
        'EMAIL',
        'email_address',
      ]),
      relationshipID: getValue(guardianData, [
        'relationshipID',
        'relationship_id',
        'RelationshipID',
        'relation_id',
      ]),
      relationship:
        relationshipName ||
        getValue(guardianData, [
          'relationship',
          'Relationship',
          'relation',
          'Relation',
        ]),
      isActive: getValue(guardianData, [
        'isActive',
        'is_active',
        'IsActive',
        'active',
        'Active',
      ]),
    };

    // Ensure NRIC fields are strings
    const nricValue = toStr(normalized.NRIC || normalized.nric);
    normalized.NRIC = nricValue;
    normalized.nric = nricValue;

    return normalized;
  };

  const getPatientIdFromParams = (p = {}) => {
    // direct
    const direct =
      p.patientId ?? p.patientID ?? p.PatientID ?? p.PatientId ?? p.id ?? null;

    if (direct) {
      return direct;
    }

    // nested in patientProfile
    const prof = p.patientProfile || {};
    return (
      prof.patientID ?? prof.patientId ?? prof.PatientID ?? prof.id ?? null
    );
  };

  const [patientProfile, setPatientProfile] = useState({});
  const [guardianData, setGuardianData] = useState({});
  const [socialHistoryData, setSocialHistoryData] = useState({});
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [isSocialHistoryLoading, setIsSocialHistoryLoading] = useState(true);
  const [isGuardianLoading, setIsGuardianLoading] = useState(true);
  const patientID = getPatientIdFromParams(route?.params || {});
  const [retryVersion, setRetryVersion] = useState(0);
  const [patientError, setPatientError] = useState(null);
  const [guardianError, setGuardianError] = useState(null);
  const [socialHistoryError, setSocialHistoryError] = useState(null);
  const loadError = (response) =>
    response?.status
      ? `Unable to load this section (HTTP ${response.status}). Try again or sign in again.`
      : 'Unable to load this section. Check the VPN connection and try again.';
  const roleName = (user?.roleName || user?.role || '').toUpperCase();
  const isSupervisor = roleName === 'SUPERVISOR';
  const isDoctor = roleName === 'DOCTOR';
  const isGuardian = roleName === 'GUARDIAN';
  const isCaregiver = roleName === 'CAREGIVER';
  const canViewRoutine = isSupervisor || isGuardian || isCaregiver;
  const canManageActivityPreference = isSupervisor;
  const canViewActivityOverview = isSupervisor || isCaregiver;
  const canViewDoctorNotes = isSupervisor || isDoctor;

  const ICON = 28;
  const ICON_SM = 24;
  const scrollViewRef = useRef(null);
  const currentLoad = useRef(null);

  // Main patient data retrieval with transformation
  const getPatient = async (id, isCurrent) => {
    setIsPatientLoading(true);
    try {
      // Helper functions
      const toStr = (v) => (v === undefined || v === null ? '' : String(v));
      const nonEmpty = (v) => {
        const s = toStr(v).trim();
        return s.length ? s : '';
      };
      const getPath = (obj, path) =>
        path
          .split('.')
          .reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
      const pickFirstFrom = (obj, paths) => {
        for (const p of paths) {
          const v = p.includes('.') ? getPath(obj, p) : obj[p];
          const s = nonEmpty(v);
          if (s) {
            return s;
          }
        }
        return '';
      };
      const toISODateOrNull = (v) => {
        if (!v) {
          return null;
        }
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      };
      const toGenderLetter = (g) => {
        const s = toStr(g).trim().toUpperCase();
        if (s.startsWith('F')) {
          return 'F';
        }
        if (s.startsWith('M')) {
          return 'M';
        }
        return '';
      };

      let ui = null;

      // Try new Patient Service V1
      const v1 = await requestDeadline(
        patientApi.readPatientV1(id, { require_auth: true, mask: true }),
      );
      if (!isCurrent()) {
        return;
      }
      if (!v1?.ok) {
        setPatientError(loadError(v1));
        return;
      }

      if (v1?.ok && v1.data) {
        // Handle nested data structure - check if data is inside v1.data.data
        const p = v1.data.data || v1.data || {};
        const returnedId = p.patient_id ?? p.id ?? p.patientID;
        if (returnedId == null || String(returnedId) !== String(id)) {
          setPatientError(
            'The patient service returned unexpected patient information. Try again.',
          );
          return;
        }

        const first = pickFirstFrom(p, [
          'first_name',
          'firstName',
          'given_name',
          'givenName',
        ]);
        const last = pickFirstFrom(p, [
          'last_name',
          'lastName',
          'family_name',
          'familyName',
          'surname',
        ]);
        const fullRaw = pickFirstFrom(p, [
          'name',
          'full_name',
          'fullName',
          'display_name',
          'displayName',
        ]);
        const full =
          nonEmpty(first) && nonEmpty(last)
            ? `${first} ${last}`.trim()
            : fullRaw;
        const preferred =
          nonEmpty(
            pickFirstFrom(p, [
              'preferredName',
              'preferred_name',
              'nickname',
              'nick_name',
              'short_name',
            ]),
          ) ||
          nonEmpty(first) ||
          full;
        // Fallback: derive first/last from preferred or full name if API didn't provide them
        let firstFinal = nonEmpty(first);
        let lastFinal = nonEmpty(last);

        const baseName = nonEmpty(preferred) || nonEmpty(full); // prefer PreferredName, else FullName
        if (!firstFinal && !lastFinal && baseName) {
          const parts = baseName.split(/\s+/).filter(Boolean);
          firstFinal = parts[0] || '';
          lastFinal = parts.length > 1 ? parts.slice(1).join(' ') : '';
        }

        const nric = pickFirstFrom(p, [
          'nric',
          'NRIC',
          'nric_no',
          'national_id',
          'nationalId',
          'id_no',
          'identifiers.national_id',
          'identification.nric',
        ]);

        const phone = pickFirstFrom(p, [
          'handphoneNo',
          'PhoneNumber',
          'phone',
          'mobile',
          'mobile_number',
          'phone_number',
          'contact.mobile',
          'contact.phone',
        ]);

        // PROFILE PICTURE WITH FALLBACK
        let picture = pickFirstFrom(p, [
          'profilePicture',
          'profile_picture',
          'profile_photo',
          'photoUrl',
          'avatar',
          'profilePhoto',
          'avatar_url',
        ]);

        // Validate profile picture (must not be null, empty, whitespace, or literal "string")
        const hasValidProfilePicture =
          picture &&
          typeof picture === 'string' &&
          picture.trim().length > 0 &&
          picture.trim().toLowerCase() !== 'string';

        if (!hasValidProfilePicture) {
          picture = defaultProfilePicture;
        }

        const genderLetter = toGenderLetter(p.gender || p.Gender || p.sex);

        const dobISO = toISODateOrNull(
          p.dateOfBirth ||
            p.DateOfBirth ||
            p.dob ||
            p.date_of_birth ||
            p.birth_date ||
            p.birthDate,
        );

        // Address + Postal normalisation
        const fullAddressRaw = pickFirstFrom(p, [
          'address',
          'Address',
          'home_address',
          'homeAddress',
          'residential_address',
        ]);
        const postalRaw = pickFirstFrom(p, [
          'postal_code',
          'postalCode',
          'postal',
          'zip',
          'zipCode',
        ]);

        let Address = nonEmpty(fullAddressRaw);
        let PostalCode = nonEmpty(postalRaw);

        // If postal is missing but address ends with a 6-digit code (optionally prefixed by S)
        // Handles: "… 123456", "… S123456", "… S 123456", "… S(123456)".
        if (!PostalCode && Address) {
          const tail = Address.match(/(?:\bS\s*\(?\s*)?(\d{6})\)?\s*$/i);
          if (tail) {
            PostalCode = tail[1];
            // Remove the matched S(123456)/S 123456/123456 from the end of the address
            Address = Address.replace(
              /(?:\bS\s*\(?\s*)?\d{6}\)?\s*$/i,
              '',
            ).trim();
          }
        }

        const toBool01 = (v) =>
          v === true || v === 1 || v === '1' || v === 'true';

        // TEMP Address + Postal normalisation (v1 → UI)
        const fullTempAddrRaw = pickFirstFrom(p, [
          'tempAddress',
          'TempAddress',
          'temporary_address',
          'temp_address',
        ]);
        const tempPostalRaw = pickFirstFrom(p, [
          'temp_postal_code',
          'tempPostalCode',
          'TempPostalCode',
        ]);

        let TempAddress = (fullTempAddrRaw ?? '').toString().trim();
        let TempPostalCode = (tempPostalRaw ?? '').toString().trim();

        // If temp postal missing but TempAddress ends with postal, extract it.
        // Handles "… 123456", "… S123456", "… S 123456", "… S(123456)"
        if (!TempPostalCode && TempAddress) {
          const t = TempAddress.match(/(?:\bS\s*\(?\s*)?(\d{6})\)?\s*$/i);
          if (t) {
            TempPostalCode = t[1];
            TempAddress = TempAddress.replace(
              /(?:\bS\s*\(?\s*)?\d{6}\)?\s*$/i,
              '',
            ).trim();
          }
        }

        // Home telephone
        const HomeNo = toStr(
          pickFirstFrom(p, ['homeNo', 'home_number', 'homeNumber', 'HomeNo']),
        );

        ui = {
          ...p,
          patientID: p.patient_id || p.id || p.patientID || id,

          // names
          firstName: firstFinal,
          FirstName: firstFinal,
          lastName: lastFinal,
          LastName: lastFinal,
          fullName: nonEmpty(full),
          FullName: nonEmpty(full),
          preferredName: preferred,
          PreferredName: preferred,
          Address,
          address: Address,
          PostalCode,
          postalCode: PostalCode,

          // Temporary
          TempAddress,
          tempAddress: TempAddress,
          TempPostalCode,
          tempPostalCode: TempPostalCode,

          // Home phone
          HomeNo,
          homeNo: HomeNo,

          // identifiers & contact
          nric: toStr(nric),
          NRIC: toStr(nric),
          handphoneNo: toStr(phone),
          PhoneNumber: toStr(phone),

          // other
          gender: genderLetter,
          Gender: genderLetter,
          preferredLanguage: pickFirstFrom(p, [
            'preferred_language',
            'preferredLanguageId',
            'language',
          ]),
          PreferredLanguage: pickFirstFrom(p, [
            'preferred_language',
            'preferredLanguageId',
            'language',
          ]),
          dob: dobISO,
          DateOfBirth: dobISO,
          profilePicture: picture, // Will be either URL or default placeholder
          isActive:
            typeof p.isActive === 'boolean'
              ? p.isActive
              : p.isActive === '1' || p.isActive === 1 || p.is_active === true,
          startDate: p.startDate || p.start_date || null,
          isRespiteCare: toBool01(
            p.isRespiteCare ?? p.IsRespiteCare ?? p.respite_care,
          ),
          IsRespiteCare: toBool01(
            p.isRespiteCare ?? p.IsRespiteCare ?? p.respite_care,
          ),
          privacyLevel:
            p.privacyLevel ??
            p.privacy_level ??
            p.PrivacyLevel ??
            p.accessLevelSensitive ??
            2, // Default to Medium
        };

        // Optional or masked fields must not erase a successfully returned patient.
        setPatientProfile(ui);
      } else {
        setPatientError(
          'The patient service returned no patient information. Try again.',
        );
      }
    } catch (error) {
      if (isCurrent()) {
        setPatientError(loadError());
      }
    } finally {
      if (isCurrent()) {
        setIsPatientLoading(false);
      }
    }
  };

  const retrieveGuardian = async (id, isCurrent) => {
    setIsGuardianLoading(true);
    try {
      const resp = await requestDeadline(
        guardianApi.getPatientGuardian(id, false),
      );
      if (!isCurrent()) {
        return;
      }

      if (resp?.ok && resp?.data) {
        // The API returns: { data: [{ patient: {...}, patient_guardians: [...] }] }
        let responseData = resp.data.data || resp.data;

        // If it's an array, get the first element
        if (Array.isArray(responseData) && responseData.length > 0) {
          responseData = responseData[0];
        }

        // Extract guardians from patient_guardians array
        let guardianArray = [];
        if (
          responseData?.patient_guardians &&
          Array.isArray(responseData.patient_guardians)
        ) {
          guardianArray = responseData.patient_guardians;
        } else if (responseData?.patient_guardians) {
          guardianArray = [responseData.patient_guardians];
        }

        // Transform to expected structure: first guardian + optional additional guardian
        if (guardianArray.length > 0) {
          const structured = {
            guardian: sanitizeGuardianData(guardianArray[0]),
            additionalGuardian:
              guardianArray.length > 1
                ? sanitizeGuardianData(guardianArray[1])
                : null,
          };
          setGuardianData(structured);
        } else {
          setGuardianData({});
        }
      } else {
        setGuardianError(loadError(resp));
      }
    } catch (error) {
      if (isCurrent()) {
        setGuardianError(loadError());
      }
    } finally {
      if (isCurrent()) {
        setIsGuardianLoading(false);
      }
    }
  };

  const retrieveSocialHistory = async (id, isCurrent) => {
    setIsSocialHistoryLoading(true);
    try {
      const resp = await requestDeadline(socialHistoryApi.getSocialHistory(id));
      if (!isCurrent()) {
        return;
      }

      if (resp?.ok) {
        let payload = resp?.data?.data ?? resp?.data;
        if (Array.isArray(payload)) {
          payload = payload[0];
        }

        // Patient Service v1 response - normalize to UI format
        const normalized = payload
          ? {
              id: payload.id,
              socialHistoryId: payload.id,
              patientId: payload.patientId,

              liveWithDescription: payload.liveWithDescription,
              liveWithListId: payload.liveWithListId,
              educationDescription: payload.educationDescription,
              educationListId: payload.educationListId,
              occupationDescription: payload.occupationDescription,
              occupationListId: payload.occupationListId,
              religionDescription: payload.religionDescription,
              religionListId: payload.religionListId,
              petDescription: payload.petDescription,
              petListId: payload.petListId,
              dietDescription: payload.dietDescription,
              dietListId: payload.dietListId,

              exercise: payload.exercise,
              sexuallyActive: payload.sexuallyActive,
              drugUse: payload.drugUse,
              caffeineUse: payload.caffeineUse,
              alcoholUse: payload.alcoholUse,
              tobaccoUse: payload.tobaccoUse,
              secondhandSmoker: payload.secondHandSmoker,
            }
          : {};

        setSocialHistoryData(normalized);
      } else {
        setSocialHistoryError(loadError(resp));
      }
    } catch (error) {
      if (isCurrent()) {
        setSocialHistoryError(loadError());
      }
    } finally {
      if (isCurrent()) {
        setIsSocialHistoryLoading(false);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const scope = {
        active: true,
        guardianStarted: false,
        socialHistoryStarted: false,
      };
      currentLoad.current = scope;
      const isCurrent = () => scope.active;
      setPatientProfile({});
      setGuardianData(null);
      setSocialHistoryData(null);
      setPatientError(null);
      setGuardianError(null);
      setSocialHistoryError(null);
      if (!patientID) {
        setPatientError(
          'No patient was selected. Return to Patients and select a patient.',
        );
        setIsPatientLoading(false);
        return () => {
          scope.active = false;
        };
      }
      setIsPatientLoading(true);
      setIsGuardianLoading(true);
      setIsSocialHistoryLoading(true);
      getPatient(patientID, isCurrent);
      return () => {
        scope.active = false;
      };
      // Functions use only the supplied ID and the per-focus lifecycle guard.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientID, retryVersion]),
  );

  const loadGuardian = () => {
    const scope = currentLoad.current;
    if (!scope?.active || scope.guardianStarted) {
      return;
    }
    scope.guardianStarted = true;
    retrieveGuardian(patientID, () => scope.active);
  };
  const loadSocialHistory = () => {
    const scope = currentLoad.current;
    if (!scope?.active || scope.socialHistoryStarted) {
      return;
    }
    scope.socialHistoryStarted = true;
    retrieveSocialHistory(patientID, () => scope.active);
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  return (
    <>
      {isPatientLoading ||
      (!patientError &&
        String(patientProfile.patientID) !== String(patientID)) ? (
        <ActivityIndicator visible />
      ) : patientError ? (
        <Center flex={1} p={6} backgroundColor={colors.white}>
          <Text testID="patient-load-error" accessibilityRole="alert">
            {patientError}
          </Text>
          <Button
            testID="patient-load-retry"
            mt={4}
            onPress={() => setRetryVersion((v) => v + 1)}
          >
            Try Again
          </Button>
        </Center>
      ) : (
        <Center backgroundColor={colors.white} style={{ flex: 1 }}>
          <ScrollView
            testID={`${patientID}_scroll_view`}
            w="100%"
            h="100%"
            contentContainerStyle={{
              flexGrow: 1,
              flexDirection: 'column',
            }}
            ref={scrollViewRef}
          >
            <View testID={'profile'} w="100%">
              <PatientInformationCard
                patientProfile={patientProfile}
                navigation={navigation}
              />
            </View>

            <ScrollView style={{ flex: 1, padding: '3%' }}>
              <View flexDirection="row" width="100%">
                <PatientProfileCard
                  vectorIconComponent={
                    <MaterialCommunityIcons
                      name="allergy"
                      size={ICON}
                      color={colors.pink}
                    />
                  }
                  testID={`allergy_${patientID}`}
                  text="Allergy"
                  navigation={navigation}
                  routes={routes.PATIENT_ALLERGY}
                  patientProfile={patientProfile}
                  patientId={patientID}
                />
                <PatientProfileCard
                  vectorIconComponent={
                    <MaterialCommunityIcons
                      name="heart-pulse"
                      size={ICON}
                      color={colors.pink}
                    />
                  }
                  testID={`vital_${patientID}`}
                  text="Vital"
                  navigation={navigation}
                  routes={routes.PATIENT_VITAL}
                  patientProfile={patientProfile}
                  patientId={patientID}
                />
                <PatientProfileCard
                  vectorIconComponent={
                    <FontAwesome5
                      name="pills"
                      size={ICON}
                      color={colors.pink}
                    />
                  }
                  testID={`medication_${patientID}`}
                  text="Medication"
                  navigation={navigation}
                  routes={routes.PATIENT_MEDICATION}
                  patientId={patientID}
                />
                <PatientProfileCard
                  vectorIconComponent={
                    <FontAwesome5
                      name="prescription-bottle"
                      size={ICON}
                      color={colors.pink}
                    />
                  }
                  testID={`prescription_${patientID}`}
                  text="Prescriptions"
                  navigation={navigation}
                  routes={routes.PATIENT_PRESCRIPTION}
                  patientId={patientID}
                />
              </View>
              <View flexDirection="row" width="100%">
                <PatientProfileCard
                  vectorIconComponent={
                    <FontAwesome5
                      name="exclamation-triangle"
                      size={ICON}
                      color={colors.pink}
                    />
                  }
                  testID={`problemLog_${patientID}`}
                  text="Problem Log"
                  navigation={navigation}
                  routes={routes.PATIENT_PROBLEM_LOG}
                  patientProfile={patientProfile}
                />
                <PatientProfileCard
                  vectorIconComponent={
                    <MaterialCommunityIcons
                      name="clipboard-text"
                      size={ICON}
                      color={colors.pink}
                    />
                  }
                  testID={`medicalHistory_${patientID}`}
                  text="Medical History"
                  navigation={navigation}
                  routes={routes.PATIENT_MEDICAL_HISTORY}
                  patientProfile={patientProfile}
                />
                {canViewRoutine && (
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="clock"
                        size={SCREEN_HEIGHT * 0.04}
                        color={colors.pink}
                      />
                    }
                    testID={`activityRoutine_${patientID}`}
                    text="Activity Routine"
                    navigation={navigation}
                    routes={routes.PATIENT_ROUTINE}
                    patientProfile={patientProfile}
                  />
                )}
                <PatientProfileCard
                  vectorIconComponent={
                    <FontAwesome5
                      name="calendar-week"
                      size={SCREEN_HEIGHT * 0.04}
                      color={colors.pink}
                    />
                  }
                  testID={`schedule_${patientID}`}
                  text="Schedule"
                  navigation={navigation}
                  routes={routes.PATIENT_SCHEDULE}
                  patientId={patientID}
                />
              </View>
              <View flexDirection="row" width="100%" flexWrap="wrap">
                {canViewActivityOverview && (
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="view-list"
                        size={SCREEN_HEIGHT * 0.04}
                        color={colors.pink}
                      />
                    }
                    testID={`activityOverview_${patientID}`}
                    text="Activity Overview"
                    navigation={navigation}
                    routes={routes.PATIENT_ACTIVITY_OVERVIEW}
                    patientProfile={patientProfile}
                    patientId={patientID}
                  />
                )}
                {canManageActivityPreference && (
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={SCREEN_HEIGHT * 0.04}
                        color={colors.pink}
                      />
                    }
                    testID={`activityPreference_${patientID}`}
                    text="Activity Preference"
                    navigation={navigation}
                    routes={routes.ACTIVITY_PREFERENCE}
                    patientProfile={patientProfile}
                    patientId={patientID}
                  />
                )}
                <PatientProfileCard
                  vectorIconComponent={
                    <MaterialIcons
                      name="insert-photo"
                      size={SCREEN_HEIGHT * 0.04}
                      color={colors.pink}
                    />
                  }
                  testID={`photoAlbum_${patientID}`}
                  text="Photo Album"
                  navigation={navigation}
                  routes={routes.PATIENT_PHOTO_ALBUM}
                  patientProfile={patientProfile}
                />
                <PatientProfileCard
                  vectorIconComponent={
                    <MaterialCommunityIcons
                      name="umbrella-beach"
                      size={SCREEN_HEIGHT * 0.04}
                      color={colors.pink}
                    />
                  }
                  testID={`holiday_${patientID}`}
                  text="Holiday"
                  navigation={navigation}
                  routes={routes.PATIENT_HOLIDAY}
                  patientProfile={patientProfile}
                />
                <PatientProfileCard
                  vectorIconComponent={
                    <MaterialCommunityIcons
                      name="wheelchair-accessibility"
                      size={SCREEN_HEIGHT * 0.04}
                      color={colors.pink}
                    />
                  }
                  testID={`mobilityAid_${patientID}`}
                  text="Mobility Aids"
                  navigation={navigation}
                  routes={routes.PATIENT_MOBILITY_AIDS}
                  patientProfile={patientProfile}
                />
              </View>
              <View flexDirection="row" width="100%">
                {canViewDoctorNotes && (
                  <PatientProfileCard
                    vectorIconComponent={
                      <MaterialCommunityIcons
                        name="doctor"
                        size={SCREEN_HEIGHT * 0.04}
                        color={colors.pink}
                      />
                    }
                    testID={`doctorNote_${patientID}`}
                    text="Doctor's Note"
                    navigation={navigation}
                    routes={routes.DOCTORNOTE_SCREEN}
                    patientProfile={patientProfile}
                  />
                )}
                <PatientProfileCard
                  routes={routes.DOCTORNOTE_SCREEN}
                  navigation={navigation}
                  style={styles.container}
                  patientProfile={patientProfile}
                />
                <PatientProfileCard
                  routes={routes.DOCTORNOTE_SCREEN}
                  navigation={navigation}
                  style={styles.container}
                  patientProfile={patientProfile}
                />
                <PatientProfileCard
                  routes={routes.DOCTORNOTE_SCREEN}
                  navigation={navigation}
                  style={styles.container}
                  patientProfile={patientProfile}
                />
              </View>
            </ScrollView>
            <View w="100%" style={{ flex: 1 }}>
              <PatientInformationAccordion
                patientID={patientID}
                patientProfile={patientProfile}
                guardianData={guardianData}
                socialHistoryData={socialHistoryData}
                scrollViewRef={scrollViewRef}
                guardianLoading={isGuardianLoading}
                guardianError={guardianError}
                socialHistoryLoading={isSocialHistoryLoading}
                socialHistoryError={socialHistoryError}
                onRetry={() => setRetryVersion((v) => v + 1)}
                onLoadGuardian={loadGuardian}
                onLoadSocialHistory={loadSocialHistory}
              />
            </View>
          </ScrollView>
        </Center>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    flex: 1,
    margin: '3%',
    aspectRatio: 1.1,
  },
});

export default PatientProfileScreen;
