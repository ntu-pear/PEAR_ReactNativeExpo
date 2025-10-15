// Libs
import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Center, VStack, HStack, ScrollView, View } from 'native-base';
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

// Config
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';

// Components
import PatientInformationCard from 'app/components/PatientInformationCard';
import PatientProfileCard from 'app/components/PatientProfileCard';
import PatientInformationAccordion from 'app/components/PatientInformationAccordion';
import ActivityIndicator from 'app/components/ActivityIndicator';

// Import default placeholder image
const defaultProfilePicture = require('app/assets/placeholder.png');

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const toStr = (v) => (v == null ? '' : String(v));

  const logResp = (tag, resp) => {
    const ct = resp?.headers?.['content-type'] || resp?.headers?.get?.('content-type');
    console.log(`[${tag}] status=${resp?.status} ok=${resp?.ok} ct=${ct}`);
  };

  const sanitizeGuardianData = (gd) => {
    if (!gd) return gd;
    const out = { ...gd };
    if (out.guardian) {
      const g = { ...out.guardian };
      const n = toStr(g.NRIC ?? g.nric);
      g.NRIC = n;
      g.nric = n;
      out.guardian = g;
    } else {
      const n = toStr(out.NRIC ?? out.nric);
      out.NRIC = n;
      out.nric = n;
    }
    return out;
  };

  const toISODateOrNull = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };

  const STRINGY_KEYS = [
    'NRIC',
    'PhoneNumber',
    'HomeNumber',
    'Address',
    'PostalCode',
    'Email',
    'Gender',
    'PreferredName',
    'FirstName',
    'LastName',
    'FullName',
    'CaregiverName',
    'StartDate',
    'EndDate',
    'DateOfBirth',
  ];

  const getPatientIdFromParams = (p = {}) =>
    p.patientId ?? p.patientID ?? p.PatientID ?? p.PatientId ?? p.id ?? null;

  const ensurePatientId = React.useCallback(() => {
    const pid = getPatientIdFromParams(route?.params || {});
    if (!pid) {
      console.warn('[Profile] No patientID in route params; going back.');
      navigation.goBack();
      return null;
    }
    if (pid !== patientID) setPatientID(pid);
    return pid;
  }, [route?.params, patientID, navigation]);

  const [patientProfile, setPatientProfile] = useState({});
  const [guardianData, setGuardianData] = useState([]);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [isSocialHistoryLoading, setIsSocialHistoryLoading] = useState(true);
  const [isGuardianLoading, setIsGuardianLoading] = useState(true);
  const [patientID, setPatientID] = useState(getPatientIdFromParams(route?.params || {}));

  const ICON = 28;
  const ICON_SM = 24;
  const scrollViewRef = useRef(null);

  // Main patient data retrieval with transformation
  const getPatient = async (id) => {
    setIsPatientLoading(true);
    try {
      // Helper functions
      const toStr = (v) => (v === undefined || v === null ? '' : String(v));
      const nonEmpty = (v) => {
        const s = toStr(v).trim();
        return s.length ? s : '';
      };
      const getPath = (obj, path) =>
        path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
      const pickFirstFrom = (obj, paths) => {
        for (const p of paths) {
          const v = p.includes('.') ? getPath(obj, p) : obj[p];
          const s = nonEmpty(v);
          if (s) return s;
        }
        return '';
      };
      const toISODateOrNull = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      };
      const toGenderLetter = (g) => {
        const s = toStr(g).trim().toUpperCase();
        if (s.startsWith('F')) return 'F';
        if (s.startsWith('M')) return 'M';
        return '';
      };

      let ui = null;

      // Try new Patient Service V1
      const v1 = await patientApi.readPatientV1(id, { require_auth: true, mask: true });
      
      if (v1?.ok && v1.data) {
        // Handle nested data structure - check if data is inside v1.data.data
        const p = v1.data.data || v1.data || {};

        console.log('[PROFILE V1] raw', p);

        const first = pickFirstFrom(p, ['first_name', 'firstName', 'given_name', 'givenName']);
        const last = pickFirstFrom(p, ['last_name', 'lastName', 'family_name', 'familyName', 'surname']);
        const fullRaw = pickFirstFrom(p, ['name', 'full_name', 'fullName', 'display_name', 'displayName']);
        const full = (nonEmpty(first) && nonEmpty(last)) ? `${first} ${last}`.trim() : fullRaw;

        const preferred = nonEmpty(
          pickFirstFrom(p, ['preferredName', 'preferred_name', 'nickname', 'nick_name', 'short_name'])
        ) || nonEmpty(first) || full;

        const nric = pickFirstFrom(p, [
          'nric', 'NRIC', 'nric_no', 'national_id', 'nationalId', 'id_no',
          'identifiers.national_id', 'identification.nric'
        ]);

        const phone = pickFirstFrom(p, [
          'handphoneNo', 'PhoneNumber', 'phone', 'mobile', 'mobile_number', 'phone_number',
          'contact.mobile', 'contact.phone'
        ]);

        // PROFILE PICTURE WITH FALLBACK
        let picture = pickFirstFrom(p, [
          'profilePicture', 'profile_picture', 'profile_photo', 'photoUrl', 'avatar', 'profilePhoto', 'avatar_url'
        ]);
        
        // If no picture or empty string, use default placeholder
        if (!picture || (typeof picture === 'string' && picture.trim() === '')) {
          console.log('[PROFILE PICTURE] Using default placeholder for patient:', id);
          picture = defaultProfilePicture;
        } else {
          console.log('[PROFILE PICTURE] Using API picture for patient:', id);
        }

        const genderLetter = toGenderLetter(p.gender || p.Gender || p.sex);

        const dobISO = toISODateOrNull(
          p.dateOfBirth || p.DateOfBirth || p.dob || p.date_of_birth || p.birth_date || p.birthDate
        );

        ui = {
          patientID: p.patient_id || p.id || p.patientID || id,

          // names
          firstName: first,
          FirstName: first,
          lastName: last,
          LastName: last,
          fullName: nonEmpty(full),
          FullName: nonEmpty(full),
          preferredName: preferred,
          PreferredName: preferred,

          // identifiers & contact
          nric: toStr(nric),
          NRIC: toStr(nric),
          handphoneNo: toStr(phone),
          PhoneNumber: toStr(phone),

          // other
          gender: genderLetter,
          Gender: genderLetter,
          preferredLanguage: pickFirstFrom(p, ['preferred_language', 'preferredLanguageId', 'language']),
          PreferredLanguage: pickFirstFrom(p, ['preferred_language', 'preferredLanguageId', 'language']),
          dob: dobISO,
          DateOfBirth: dobISO,
          profilePicture: picture, // Will be either URL or default placeholder
          isActive: (typeof p.isActive === 'boolean') ? p.isActive : (p.isActive === '1' || p.isActive === 1 || p.is_active === true),
          startDate: p.startDate || p.start_date || null,
        };

        const missingKey =
          !nonEmpty(ui.PreferredName) ||
          !nonEmpty(ui.NRIC) ||
          !nonEmpty(ui.Gender) ||
          !ui.DateOfBirth;

        if (!missingKey) {
          console.log('[PROFILE V1 SET]', ui);
          setPatientProfile(ui);
          return;
        } else {
          console.log('[PROFILE V1 PARTIAL]', ui);
        }
      } else {
        console.log('[PROFILE V1] not ok, status=', v1?.status, 'id=', id);
      }

      // Fallback if nothing worked
      const fallback = {
        patientID: id,
        PreferredName: '',
        preferredName: '',
        NRIC: '',
        nric: '',
        Gender: '',
        gender: '',
        DateOfBirth: null,
        dob: null,
        PhoneNumber: '',
        handphoneNo: '',
        firstName: '',
        lastName: '',
        fullName: '',
        profilePicture: defaultProfilePicture, // Use placeholder for fallback
        isActive: undefined,
        startDate: null,
      };
      console.log('[PROFILE FALLBACK]', fallback);
      setPatientProfile(fallback);
    } catch (e) {
      console.log('Patient load error:', e?.message || e);
      // Set fallback on error
      setPatientProfile({
        patientID: id,
        PreferredName: '',
        preferredName: '',
        profilePicture: defaultProfilePicture,
      });
    } finally {
      setIsPatientLoading(false);
    }
  };

  const retrieveGuardian = async (id) => {
    setIsGuardianLoading(true);
    try {
      const resp = await guardianApi.getPatientGuardian(id, false);
      logResp('Guardian', resp);

      if (resp?.ok && Array.isArray(resp?.data?.data)) {
        setGuardianData(resp.data.data);
      } else {
        setGuardianData([]);
      }
    } catch (e) {
      console.log('[Guardian] error:', e?.message || e);
      setGuardianData([]);
    } finally {
      setIsGuardianLoading(false);
    }
  };

  const retrieveSocialHistory = async (id) => {
    setIsSocialHistoryLoading(true);
    try {
      const resp = await socialHistoryApi.getSocialHistory(id);
      logResp('SocialHistory', resp);

      if (resp?.ok) {
        const payload = resp?.data?.data;
        setSocialHistoryData(payload ?? []);
      } else {
        setSocialHistoryData([]);
      }
    } catch (e) {
      console.log('[SocialHistory] error:', e?.message || e);
      setSocialHistoryData([]);
    } finally {
      setIsSocialHistoryLoading(false);
    }
  };

  // React if navigation params change
  useEffect(() => {
    const next = getPatientIdFromParams(route?.params || {});
    if (next && next !== patientID) setPatientID(next);
  }, [route?.params]);

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      const pid = ensurePatientId();
      if (!pid) return;
      setIsLoading(true);
      getPatient(pid);
      retrieveGuardian(pid);
      retrieveSocialHistory(pid);
    }, [ensurePatientId])
  );

  // Check if all data loaded
  useEffect(() => {
    if (patientProfile !== undefined && Object.keys(patientProfile).length > 0) {
      setIsPatientLoading(false);
    }
    if (socialHistoryData !== undefined) {
      setIsSocialHistoryLoading(false);
    }
    if (guardianData !== undefined && guardianData.length !== 0) {
      setIsGuardianLoading(false);
    }

    if (
      isPatientLoading === false &&
      isSocialHistoryLoading === false &&
      isGuardianLoading === false
    ) {
      setIsLoading(false);
    }
  }, [
    patientProfile,
    isPatientLoading,
    socialHistoryData,
    isSocialHistoryLoading,
    guardianData,
    isGuardianLoading,
  ]);

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
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
              <View flexDirection="row" width="100%">
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