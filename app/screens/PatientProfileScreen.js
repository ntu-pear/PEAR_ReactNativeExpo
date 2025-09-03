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
    const toStr = (v) => (v == null ? '' : String(v));
    const toISODateOrNull = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); // YYYY-MM-DD
    };

    // 1) New Patient Service (detail)
    const v1 = await patientApi.readPatientV1(id, { require_auth: true, mask: true });
    if (v1?.ok && v1.data) {
      const p = v1.data || {};

      // map names
      const nameRaw = p.name ?? p.full_name ?? p.fullName ?? '';
      const first = toStr(p.first_name ?? p.firstName).trim();
      const last  = toStr(p.last_name  ?? p.lastName).trim();
      const parts = (!first || !last) && typeof nameRaw === 'string' ? nameRaw.trim().split(/\s+/) : [];
      const firstName = first || (parts[0] || '');
      const lastName  = last  || (parts.length > 1 ? parts.slice(1).join(' ') : '');
      const fullName  = `${firstName} ${lastName}`.trim() || (typeof nameRaw === 'string' ? nameRaw : '');

      // map legacy keys your UI expects
      const preferredName = toStr(((p.preferred_name ?? p.preferredName ?? firstName) || fullName));
      const nric   = toStr(p.NRIC ?? p.nric ?? p.nric_no ?? p.national_id);
      const gender = toStr(p.Gender ?? p.gender).toUpperCase();
      const dobISO = toISODateOrNull(p.dob ?? p.date_of_birth ?? p.birth_date ?? p.DateOfBirth);

      const normalized = {
        ...p,
        patientID: p.patient_id ?? p.id ?? p.patientID ?? id,
        firstName,
        lastName,
        fullName,
        preferredName,
        FirstName: firstName,
        LastName: lastName,
        FullName: fullName,
        PreferredName: preferredName,
        NRIC: nric,
        Gender: gender,
        DateOfBirth: dobISO, // keep null when unknown
        profilePicture: p.profile_picture ?? p.profile_photo ?? p.photoUrl ?? p.avatar ?? null,
        isActive: typeof p.is_active === 'boolean' ? p.is_active : p.isActive,
        startDate: p.start_date ?? p.startDate ?? null,
      };

      setPatientProfile(normalized);
      return;
    } else {
      console.log('[PROFILE v1] status:', v1?.status, 'id:', id);
    }

    // 2) Fallback: legacy Core API
    const legacy = await patientApi.getPatient(id, true);
    if (legacy?.ok) {
      const data = legacy.data?.data ?? legacy.data ?? {};
      setPatientProfile({
        ...data,
        PreferredName: toStr(data.PreferredName ?? data.preferredName ?? data.FirstName ?? ''),
        NRIC: toStr(data.NRIC ?? data.nric),
        Gender: toStr(data.Gender ?? data.gender).toUpperCase(),
        DateOfBirth: toISODateOrNull(data.DateOfBirth ?? data.dob),
      });
    } else {
      console.log('[PROFILE legacy] status:', legacy?.status, 'id:', id);
    }
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
     const response = await guardianApi.getPatientGuardian(id, false);
     if (response.ok) {
       setGuardianData(response.data?.data ?? []);
     } else {
       console.log('Request failed with status code: ', response.status);
       setGuardianData([]); // NEW: keep data defined
     }
   } catch (e) {
     console.log('Guardian load error:', e?.message || e);
     setGuardianData([]);
   } finally {
     setIsGuardianLoading(false); // NEW: never block UI
   }
 };
  const retrieveSocialHistory = async (id) => {
    setIsSocialHistoryLoading(true);
    try {
     const response = await socialHistoryApi.getSocialHistory(id);
      if (response.ok) {
       const data = response.data?.data ?? [];
       setSocialHistoryData(data || []);
     } else {
       console.log('Request failed with status code: ', response.status);
       setSocialHistoryData([]);
     }
   } catch (e) {
     console.log('Social history load error:', e?.message || e);
     setSocialHistoryData([]);
   } finally {
     setIsSocialHistoryLoading(false); // NEW
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
       if (!patientID) {
       console.log('No patientID found in route params');
        setIsLoading(false);
       return;
       }
       let mounted = true;
       (async () => {
       setIsLoading(true);
       await getPatient(patientID);      // wait for v1 patient only
       if (mounted) setIsLoading(false); // NEW: render now
      // fire-and-forget legacy calls; they won't block UI
       retrieveGuardian(patientID);
        retrieveSocialHistory(patientID);
       })();
       return () => { mounted = false; };
       }, [patientID])
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
