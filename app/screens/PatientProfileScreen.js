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
// import doctorNoteApi from 'app/api/doctorNote';
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

function PatientProfileScreen(props) {
  const { navigation , route } = props;
  const toStr = (v) => (v == null ? '' : String(v));
  const isHtmlError = (resp) =>
    typeof resp?.data === 'string' &&
    resp.data.trim().startsWith('<!DOCTYPE'); // legacy server HTML error page
  
  const logResp = (tag, resp) => {
    const ct = resp?.headers?.['content-type'] || resp?.headers?.get?.('content-type');
    console.log(`[${tag}] status=${resp?.status} ok=${resp?.ok} ct=${ct}`);
  };
  
  const sanitizeProfileForLegacy = (p = {}) => {
    const out = { ...p };
  
    // Ensure both legacy and new keys exist as strings
    out.NRIC = toStr(p.NRIC ?? p.nric);
    out.nric = out.NRIC;
  
    out.firstName = toStr(p.firstName ?? p.FirstName);
    out.lastName  = toStr(p.lastName  ?? p.LastName);
  
    const fullName =
      toStr(p.fullName ?? p.FullName) ||
      `${out.firstName} ${out.lastName}`.trim();
    out.fullName = fullName;
  
    out.preferredName =
      toStr(p.preferredName ?? p.PreferredName) || fullName || out.firstName;
  
    // Gender/lang as strings
    out.gender = toStr(p.gender ?? p.Gender);
    out.preferredLanguage = toStr(p.preferredLanguage ?? p.language ?? '');
    out.language = out.preferredLanguage;
  
    // DOB mirrored across shapes (keep null if invalid)
    const d = p.DateOfBirth ?? p.dob ?? p.date_of_birth ?? null;
    out.DateOfBirth = d ?? null;
    out.dob = out.DateOfBirth;
  
    // Picture key normalization
    out.profilePicture =
      p.profilePicture ?? p.profile_picture ?? p.profile_photo ?? p.photoUrl ?? p.avatar ?? null;
  
    return out;
  };
  
  const sanitizeGuardianData = (gd) => {
    if (!gd) return gd;
    // handle both { guardian: {...} } and flat shapes gracefully
    const out = { ...gd };
    if (out.guardian) {
      const g = { ...out.guardian };
      const n = toStr(g.NRIC ?? g.nric);
      g.NRIC = n;
      g.nric = n;
      out.guardian = g;
    } else {
      const n = toStr(out.NRIC ?? out.nric);
      out.NRIC = n; out.nric = n;
    }
    return out;
  };

  const toISODateOrNull = (v) => {
     if (!v) return null;
     const d = new Date(v);
     return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); // YYYY-MM-DD
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
const ensurePatientId = React.useCallback(() => {
  const pid = getPatientIdFromParams(route?.params || {});
  if (!pid) {
    console.warn('[Profile] No patientID in route params; going back.');
    navigation.goBack();      // or navigate to Patients list
    return null;
  }
  if (pid !== patientID) setPatientID(pid);
  return pid;
}, [route?.params, patientID, navigation]);

  const getPatientIdFromParams = (p = {}) =>  // NEW
    p.patientId ?? p.patientID ?? p.PatientID ?? p.PatientId ?? p.id ?? null;

  const [patientProfile, setPatientProfile] = useState({});
  // const [doctorsNoteData, setDoctorNoteData] = useState([]);
  const [guardianData, setGuardianData] = useState([]);
  const [socialHistoryData, setSocialHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [isSocialHistoryLoading, setIsSocialHistoryLoading] = useState(true);
  const [isGuardianLoading, setIsGuardianLoading] = useState(true);
  // const [isDoctorsNoteLoading, setIsDoctorsNoteLoading] = useState(true);
  const [patientID, setPatientID] = useState(getPatientIdFromParams(route?.params || {})); // CHANGED);
  const ICON = 28;      // good on most phones
  const ICON_SM = 24;  
  const scrollViewRef = useRef(null);

  const normalizeV1 = (p = {}) => {
    const nameRaw = p.name ?? p.full_name ?? p.fullName ?? '';
    const first = (p.first_name ?? p.firstName ?? '').toString().trim();
    const last = (p.last_name ?? p.lastName ?? '').toString().trim();

    let firstName = first;
    let lastName = last;
    if (!firstName || !lastName) {
      const parts = typeof nameRaw === 'string' ? nameRaw.trim().split(/\s+/) : [];
      if (!firstName && parts[0]) firstName = parts[0];
      if (!lastName && parts.length > 1) lastName = parts.slice(1).join(' ');
    }

    const statusStr = typeof p.status === 'string' ? p.status.toLowerCase().trim() : null;
    const isActive =
      typeof p.is_active === 'boolean' ? p.is_active :
      typeof p.isActive === 'boolean' ? p.isActive :
      (statusStr ? statusStr.startsWith('act') : undefined);

    return {
      ...p,
      patientID: p.patient_id ?? p.id ?? p.patientID ?? null,
      firstName,
      lastName,
      fullName,
      preferredName,
      fullName: `${firstName} ${lastName}`.trim() || (typeof nameRaw === 'string' ? nameRaw : ''),
      profilePicture: p.profile_picture ?? p.profile_photo ?? p.photoUrl ?? p.avatar ?? null,
      preferredName: p.preferred_name ?? p.preferredName ?? '',
      isActive,
      startDate: p.start_date ?? p.startDate ?? null,
    };
  };

  
  // useEffect(() => {
  //   // navigated from Highlights Modal or Dashboard Screen
  //   console.log('id', patientID);
  //   setIsLoading(true);
  //   getPatient(patientID);
  //   // retrieveDoctorsNote(patientID);
  //   retrieveGuardian(patientID);
  //   retrieveSocialHistory(patientID);
  // }, [patientID, route.params.patientProfile]);

 // useFocusEffect(
    //React.useCallback(() => {
      //setIsLoading(true);
     // getPatient(patientID);
      //retrieveGuardian(route.params.id);
     // retrieveSocialHistory(route.params.id);
   // }, []),
  //);

  // Retrieval of Patient Info, Doctor's Notes, Guardian Info and Social History
  const getPatient = async (id) => {
    setIsPatientLoading(true);
    try {
      // helpers
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
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); // YYYY-MM-DD
      };
      const toGenderLetter = (g) => {
        const s = toStr(g).trim().toUpperCase();
        if (s.startsWith('F')) return 'F';
        if (s.startsWith('M')) return 'M';
        return '';
      };
  
      let ui = null;
  
      // --- 1) New Patient Service (detail)
      const v1 = await patientApi.readPatientV1(id, { require_auth: true, mask: true });
      if (v1?.ok && v1.data) {
        const p = v1.data || {};
  
        const first = pickFirstFrom(p, ['first_name', 'firstName', 'given_name', 'givenName']);
        const last  = pickFirstFrom(p, ['last_name', 'lastName', 'family_name', 'familyName', 'surname']);
        const fullRaw = pickFirstFrom(p, ['name', 'full_name', 'fullName', 'display_name', 'displayName']);
        const full = (nonEmpty(first) && nonEmpty(last)) ? `${first} ${last}`.trim() : fullRaw;
  
        const preferred = nonEmpty(
          pickFirstFrom(p, ['preferred_name','preferredName','nickname','nick_name','short_name'])
        ) || nonEmpty(first) || full;
  
        const nric = pickFirstFrom(p, [
          'NRIC','nric','nric_no','national_id','nationalId','id_no',
          'identifiers.national_id','identification.nric'
        ]);
  
        const phone = pickFirstFrom(p, [
          'PhoneNumber','handphoneNo','phone','mobile','mobile_number','phone_number',
          'contact.mobile','contact.phone'
        ]);
  
        const picture = pickFirstFrom(p, [
          'profile_picture','profile_photo','photoUrl','avatar','profilePhoto','avatar_url'
        ]);
  
        const genderLetter = toGenderLetter(p.Gender || p.gender || p.sex);
  
        const dobISO = toISODateOrNull(
          p.DateOfBirth || p.dob || p.date_of_birth || p.birth_date || p.birthDate
        );
  
        ui = {
          patientID: p.patient_id || p.id || p.patientID || id,
  
          // names
          firstName: first,  FirstName: first,
          lastName:  last,   LastName:  last,
          fullName:  nonEmpty(full),   FullName:  nonEmpty(full),
          preferredName: preferred,    PreferredName: preferred,
  
          // identifiers & contact
          nric: toStr(nric), NRIC: toStr(nric),
          handphoneNo: toStr(phone), PhoneNumber: toStr(phone),
  
          // other
          gender: genderLetter, Gender: genderLetter,
          preferredLanguage: pickFirstFrom(p, ['preferred_language','preferredLanguage','language']),
          PreferredLanguage: pickFirstFrom(p, ['preferred_language','preferredLanguage','language']),
          dob: dobISO, DateOfBirth: dobISO,
          profilePicture: nonEmpty(picture) ? picture : null,
          isActive: (typeof p.is_active === 'boolean') ? p.is_active : p.isActive,
          startDate: p.start_date || p.startDate || null,
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
          console.log('[PROFILE V1 PARTIAL — will merge with legacy]', ui);
        }
      } else {
        console.log('[PROFILE V1] not ok, status=', v1?.status, 'id=', id);
      }
  
      // --- 2) Legacy fallback/merge
      const legacy = await patientApi.getPatient(id, true);
      if (legacy?.ok) {
        const d = (legacy.data && legacy.data.data) || legacy.data || {};
  
        const merged = {
          ...(ui || {}),
  
          // prefer V1 non-empty; else legacy
          PreferredName: nonEmpty(ui?.PreferredName) ? ui.PreferredName :
                         nonEmpty(d.PreferredName || d.preferredName || d.FirstName || d.FullName),
          preferredName: nonEmpty(ui?.preferredName) ? ui.preferredName :
                         nonEmpty(d.preferredName || d.PreferredName || d.FirstName || d.FullName),
  
          NRIC: nonEmpty(ui?.NRIC) ? ui.NRIC : toStr(d.NRIC || d.nric),
          nric: nonEmpty(ui?.nric) ? ui.nric : toStr(d.nric || d.NRIC),
  
          Gender: nonEmpty(ui?.Gender) ? ui.Gender : toGenderLetter(d.Gender || d.gender),
          gender: nonEmpty(ui?.gender) ? ui.gender : toGenderLetter(d.gender || d.Gender),
  
          DateOfBirth: ui?.DateOfBirth ? ui.DateOfBirth : toISODateOrNull(d.DateOfBirth || d.dob),
          dob: ui?.dob ? ui.dob : toISODateOrNull(d.dob || d.DateOfBirth),
  
          PhoneNumber: nonEmpty(ui?.PhoneNumber) ? ui.PhoneNumber : toStr(d.PhoneNumber || d.handphoneNo || d.phone),
          handphoneNo: nonEmpty(ui?.handphoneNo) ? ui.handphoneNo : toStr(d.handphoneNo || d.PhoneNumber || d.phone),
  
          firstName: nonEmpty(ui?.firstName) ? ui.firstName : toStr(d.FirstName || d.firstName),
          FirstName: nonEmpty(ui?.FirstName) ? ui.FirstName : toStr(d.FirstName || d.firstName),
  
          lastName: nonEmpty(ui?.lastName) ? ui.lastName : toStr(d.LastName || d.lastName),
          LastName: nonEmpty(ui?.LastName) ? ui.LastName : toStr(d.LastName || d.lastName),
  
          fullName: nonEmpty(ui?.fullName) ? ui.fullName :
                    nonEmpty(d.FullName || d.fullName || ((d.FirstName && d.LastName) ? `${d.FirstName} ${d.LastName}` : '')),
          FullName: nonEmpty(ui?.FullName) ? ui.FullName :
                    nonEmpty(d.FullName || d.fullName || ((d.FirstName && d.LastName) ? `${d.FirstName} ${d.LastName}` : '')),
  
          preferredLanguage: nonEmpty(ui?.preferredLanguage) ? ui.preferredLanguage :
                             toStr(d.preferredLanguage || d.PreferredLanguage || d.language || ''),
          PreferredLanguage: nonEmpty(ui?.PreferredLanguage) ? ui.PreferredLanguage :
                             toStr(d.PreferredLanguage || d.preferredLanguage || d.language || ''),
  
          profilePicture: ui?.profilePicture ?? d.profilePicture ?? null,
          isActive: (ui?.isActive !== undefined) ? ui.isActive :
                    ((typeof d.isActive === 'boolean') ? d.isActive : undefined),
          startDate: ui?.startDate ?? d.startDate ?? null,
  
          patientID: (ui?.patientID) || d.patientID || d.PatientID || id,
        };
  
        // final safety: ensure strings for .replace callers
        merged.NRIC = toStr(merged.NRIC);
        merged.nric = toStr(merged.nric);
        merged.PreferredName = toStr(merged.PreferredName);
        merged.preferredName = toStr(merged.preferredName);
  
        console.log('[PROFILE MERGED]', merged);
        setPatientProfile(merged);
        return;
      } else {
        console.log('[PROFILE legacy] not ok, status=', legacy?.status, 'id=', id);
      }
  
      // --- 3) Nothing worked: still set a minimal object so UI renders
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
        profilePicture: null,
        isActive: undefined,
        startDate: null,
      };
      console.log('[PROFILE FALLBACK]', fallback);
      setPatientProfile(fallback);
    } catch (e) {
      console.log('Patient load error:', e?.message || e);
    } finally {
      setIsPatientLoading(false);
    }
  };

  // const retrieveDoctorsNote = async (id) => {
  //   setIsDoctorsNoteLoading(true);
  //   const response = await doctorNoteApi.getDoctorNote(id);
  //   if (!response.ok) {
  //     console.log('Request failed with status code: ', response.status);
  //     // setIsDoctorsNoteLoading(false);
  //     return;
  //   }
  //   // setIsDoctorsNoteLoading(false);
  //   setDoctorNoteData(response.data.data);
  // };

  const retrieveGuardian = async (id) => {
  setIsGuardianLoading(true);
  try {
    const resp = await guardianApi.getPatientGuardian(id, false);
    logResp('Guardian', resp);

    if (resp?.ok && !isHtmlError(resp) && Array.isArray(resp?.data?.data)) {
      setGuardianData(resp.data.data);
    } else {
      // 401/500/HTML => skip silently, do not break the screen
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

    if (resp?.ok && !isHtmlError(resp)) {
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

  // NEW: react if navigation params change later
  useEffect(() => {
    const next = getPatientIdFromParams(route?.params || {});
    if (next && next !== patientID) setPatientID(next);
  }, [route?.params]); // NEW

  // CHANGED: include patientID in deps and always call with the resolved id
  useFocusEffect(
    React.useCallback(() => {
      const pid = ensurePatientId();
      if (!pid) return;     // don’t try to load without an id
      setIsLoading(true);
      getPatient(pid);
      retrieveGuardian(pid);
      retrieveSocialHistory(pid);
    }, [ensurePatientId])
  );

  // Check if all the data has been loaded before loading page
  useEffect(() => {
    if (
      patientProfile !== undefined &&
      Object.keys(patientProfile).length > 0
    ) {
      setIsPatientLoading(false);
    }
    if (socialHistoryData !== undefined) {
      setIsSocialHistoryLoading(false);
    }
    if (guardianData !== undefined && guardianData.length !== 0) {
      setIsGuardianLoading(false);
    }
    // if(doctorsNoteData !== undefined){
    //   setIsDoctorsNoteLoading(false);
    // }
    // if(isPatientLoading === false && isSocialHistoryLoading === false && isGuardianLoading === false && isDoctorsNoteLoading === false ){
    //   setIsLoading(false);
    // }

    if (
      isPatientLoading === false &&
      isSocialHistoryLoading === false &&
      isGuardianLoading === false
    ) {
      setIsLoading(false);
    }

    // }, [patientProfile, isPatientLoading, socialHistoryData, isSocialHistoryLoading,
    //   guardianData, isGuardianLoading, doctorsNoteData, isDoctorsNoteLoading]);
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
            <View testID={'profile'} w="100%" style={{ flex: 1 }}>
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
                  // patientProfile={patientProfile}
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
                  // patientProfile={patientProfile}
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
              {/* //temporary values for doctor icon, change later */}
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

                {/* Below are empty placeholder icons to fix doctor note position, only edit if you know what you're doing */}
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
                // doctorsNoteData={doctorsNoteData}
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
