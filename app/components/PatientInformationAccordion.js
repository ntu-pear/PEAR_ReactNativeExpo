/*eslint eslint-comments/no-unlimited-disable: error */
// Libs
import { Text } from 'native-base';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome';

// Hooks
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// API
import patientApi from 'app/api/patient';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

// Components
import InformationCard from 'app/components/InformationCard';

// Helper functions (defined outside component to avoid recreation)
const pick = (...vals) => {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v;
  return '';
};

const maskNRIC = (v) => {
  const s = String(v || '');
  return s.replace(/\d{4}(\d{3})$/, 'xxxx$1');
};

const triStateLabel = (v) => {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (n === 1) return 'YES';
  if (n === 0) return 'NO';
  return 'Not available';
};

const optionLabelById = (options, id) => {
  if (!options || !Array.isArray(options) || id === undefined || id === null) return '';
  const needle = Number(id);
  const found = options.find((o) => Number(o.value) === needle);
  return found?.label || '';
};

function PatientInformationAccordion({
  patientID,
  patientProfile,
  guardianData,
  socialHistoryData,
  scrollViewRef,
}) {
  const navigation = useNavigation();
  
  // Only state that truly needs to be stateful
  const [activeSections, setActiveSections] = useState([]);
  const [unMaskedPatientNRIC, setUnMaskedPatientNRIC] = useState('');
  const [unMaskedGuardianNRIC, setUnMaskedGuardianNRIC] = useState('');
  const [unMasked2ndGuardianNRIC, setUnMasked2ndGuardianNRIC] = useState('');

  // Social History list option lookups (used when API returns only list IDs)
  const { data: liveWithOptions } = useGetSelectionOptions('livewith');
  const { data: educationOptions } = useGetSelectionOptions('education');
  const { data: occupationOptions } = useGetSelectionOptions('occupation');
  const { data: religionOptions } = useGetSelectionOptions('religion');
  const { data: petOptions } = useGetSelectionOptions('pet');
  const { data: dietOptions } = useGetSelectionOptions('diet');

  // Memoized derived data - Patient Information
  const patientData = useMemo(() => {
    if (!patientProfile || Object.keys(patientProfile).length === 0) {
      return [];
    }
    const nric = pick(patientProfile.NRIC, patientProfile.nric);
    
    // Format privacy level
    const getPrivacyLevelLabel = (level) => {
      const levelNum = parseInt(level);
      if (levelNum === 1) return 'Low';
      if (levelNum === 2) return 'Medium';
      if (levelNum === 3) return 'High';
      return '-';
    };
    
    return [
      { label: 'First Name', value: patientProfile.firstName || '-' },
      { label: 'Last Name', value: patientProfile.lastName || '-' },
      { label: 'NRIC', value: nric ? maskNRIC(nric) : '-' },
      { label: 'DOB', value: patientProfile.dob || '-' },
      { label: 'Gender', value: patientProfile.gender === 'F' ? 'FEMALE' : 'MALE' },
      { label: 'Address', value: patientProfile.address || '-' },
      { label: 'Home Number', value: patientProfile.homeNo || '-' },
      { label: 'Mobile Number', value: patientProfile.handphoneNo || '-' },
      { label: 'Temp. Address', value: patientProfile.tempAddress || '-' },
      { label: 'Start Date', value: patientProfile.startDate || '-' },
      {
        label: 'End Date',
        value:
          patientProfile.endDate != null &&
          patientProfile.endDate !== '1970-01-01T00:00:00'
            ? patientProfile.endDate
            : null,
      },
      { label: 'Respite Care', value: patientProfile.isRespiteCare ? 'YES' : 'NO' },
      { label: 'Privacy Level', value: getPrivacyLevelLabel(patientProfile.privacyLevel) },
    ];
  }, [patientProfile]);

  // Memoized derived data - Patient Preferences
  const preferenceData = useMemo(() => {
    if (!patientProfile) return [];
    return [
      { label: 'Preferred name', value: patientProfile.preferredName || '-' },
      { label: 'Preferred language', value: patientProfile.preferredLanguage || '-' },
    ];
  }, [patientProfile?.preferredName, patientProfile?.preferredLanguage]);

  // Memoized derived data - Guardian Information
  const { guardianInfoData, isSecondGuardian, secondGuardianInfoData } = useMemo(() => {
    const result = {
      guardianInfoData: [],
      isSecondGuardian: false,
      secondGuardianInfoData: [],
    };

    if (guardianData?.guardian && Object.keys(guardianData.guardian).length > 0) {
      const g = guardianData.guardian;
      const fullName = [g.firstName, g.lastName].filter(Boolean).join(' ') || '-';
      
      result.guardianInfoData = [
        { label: 'Guardian Name', value: fullName },
        { label: 'Preferred Name', value: g.preferredName || '-' },
        { label: 'NRIC', value: g.nric ? maskNRIC(g.nric) : '-' },
        { label: "Patient's", value: g.relationship || '-' },
        { label: 'Contact Number', value: g.contactNo || '-' },
        { label: 'Address', value: g.address || '-' },
        { label: 'Email', value: g.email || '-' },
      ];
    }

    if (
      guardianData?.additionalGuardian?.nric != null &&
      guardianData?.guardian &&
      guardianData.additionalGuardian.nric !== guardianData.guardian.nric
    ) {
      result.isSecondGuardian = true;
      const g2 = guardianData.additionalGuardian;
      const fullName = [g2.firstName, g2.lastName].filter(Boolean).join(' ') || '-';
      
      result.secondGuardianInfoData = [
        { label: 'Guardian Name', value: fullName },
        { label: 'Preferred Name', value: g2.preferredName || '-' },
        { label: 'NRIC', value: g2.nric ? maskNRIC(g2.nric) : '-' },
        { label: "Patient's", value: g2.relationship || '-' },
        { label: 'Contact Number', value: g2.contactNo || '-' },
        { label: 'Address', value: g2.address || '-' },
        { label: 'Email', value: g2.email || '-' },
      ];
    }

    return result;
  }, [guardianData]);

  // Memoized derived data - Social History
  const { socialHistoryInfo, isSocialHistoryEmpty } = useMemo(() => {
    const src = Array.isArray(socialHistoryData) ? socialHistoryData[0] : socialHistoryData;
    const isEmpty = !src || Object.keys(src).length === 0;

    if (isEmpty) {
      return { socialHistoryInfo: [], isSocialHistoryEmpty: true };
    }

    const secondHandSmoker = src.secondhandSmoker ?? src.secondHandSmoker ?? src.SecondhandSmoker;
    const liveWithDesc =
      src.liveWithDescription ??
      src.LiveWithDescription ??
      optionLabelById(liveWithOptions, src.liveWithListId ?? src.LiveWithListId);
    const educationDesc =
      src.educationDescription ??
      src.EducationDescription ??
      optionLabelById(educationOptions, src.educationListId ?? src.EducationListId);
    const occupationDesc =
      src.occupationDescription ??
      src.OccupationDescription ??
      optionLabelById(occupationOptions, src.occupationListId ?? src.OccupationListId);
    const religionDesc =
      src.religionDescription ??
      src.ReligionDescription ??
      optionLabelById(religionOptions, src.religionListId ?? src.ReligionListId);
    const petDesc =
      src.petDescription ??
      src.PetDescription ??
      optionLabelById(petOptions, src.petListId ?? src.PetListId);
    const dietDesc =
      src.dietDescription ??
      src.DietDescription ??
      optionLabelById(dietOptions, src.dietListId ?? src.DietListId);

    return {
      isSocialHistoryEmpty: false,
      socialHistoryInfo: [
        { label: 'Live with', value: liveWithDesc || '-' },
        { label: 'Education', value: educationDesc || '-' },
        { label: 'Occupation', value: occupationDesc || '-' },
        { label: 'Religion', value: religionDesc || '-' },
        { label: 'Pet', value: petDesc || '-' },
        { label: 'Diet', value: dietDesc || '-' },
        { label: 'Exercise', value: triStateLabel(src.exercise ?? src.Exercise) },
        { label: 'Sexually active', value: triStateLabel(src.sexuallyActive ?? src.SexuallyActive) },
        { label: 'Drug use', value: triStateLabel(src.drugUse ?? src.DrugUse) },
        { label: 'Caffeine use', value: triStateLabel(src.caffeineUse ?? src.CaffeineUse) },
        { label: 'Alcohol use', value: triStateLabel(src.alcoholUse ?? src.AlcoholUse) },
        { label: 'Tobacco use', value: triStateLabel(src.tobaccoUse ?? src.TobaccoUse) },
        { label: 'Secondhand smoker', value: triStateLabel(secondHandSmoker) },
      ],
    };
  }, [
    socialHistoryData,
    liveWithOptions,
    educationOptions,
    occupationOptions,
    religionOptions,
    petOptions,
    dietOptions,
  ]);

  // Memoized sections array
  const sections = useMemo(() => [
    { title: 'Patient Information', content: patientData },
    { title: 'Patient Preferences', content: preferenceData },
    { title: 'Guardian(s) Information', content: guardianInfoData },
    { title: 'Social History', content: socialHistoryInfo },
  ], [patientData, preferenceData, guardianInfoData, socialHistoryInfo]);

  // Update unmasked NRICs when guardian data changes
  useEffect(() => {
    if (guardianData?.guardian?.nric) {
      setUnMaskedGuardianNRIC(guardianData.guardian.nric);
    }
    if (guardianData?.additionalGuardian?.nric) {
      setUnMasked2ndGuardianNRIC(guardianData.additionalGuardian.nric);
    }
  }, [guardianData]);

  // Retrieve patient NRIC on focus
  const retrievePatientNRIC = useCallback(async (id) => {
    const response = await patientApi.getPatient(id, false);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setUnMaskedPatientNRIC(response.data.data.nric);
  }, []);

  useFocusEffect(
    useCallback(() => {
      retrievePatientNRIC(patientID);
    }, [patientID, retrievePatientNRIC]),
  );

  // Memoized navigation handlers
  const handlePatientInfoOnPress = useCallback(() => {
    navigation.push(routes.EDIT_PATIENT_INFO, {
      patientProfile: patientProfile,
    });
  }, [navigation, patientProfile]);

  const handlePatientPrefOnPress = useCallback(() => {
    navigation.push(routes.EDIT_PATIENT_PREFERENCES, {
      patientProfile: patientProfile,
    });
  }, [navigation, patientProfile]);

  const handlePatientGuardianOnPress = useCallback(() => {
    if (guardianData?.guardian) {
      navigation.push(routes.EDIT_PATIENT_GUARDIAN, {
        guardianProfile: guardianData.guardian,
        patientID: patientProfile?.patientID || patientProfile?.patientId || patientProfile?.PatientID,
      });
    }
  }, [navigation, guardianData, patientProfile]);

  const handlePatientSecondGuardianOnPress = useCallback(() => {
    if (guardianData?.additionalGuardian) {
      navigation.push(routes.EDIT_PATIENT_GUARDIAN, {
        guardianProfile: guardianData.additionalGuardian,
        patientID: patientProfile?.patientID || patientProfile?.patientId || patientProfile?.PatientID,
      });
    }
  }, [navigation, guardianData, patientProfile]);

  const handlePatientSocialHistOnPress = useCallback(() => {
    const src = Array.isArray(socialHistoryData) ? socialHistoryData[0] : socialHistoryData;

    if (!src || Object.keys(src).length === 0) {
      navigation.push(routes.EDIT_PATIENT_SOCIALHIST, {
        socialHistory: {},
        patientID: patientID,
      });
      return;
    }

    const decoded = {
      ...(src || {}),
      liveWithDescription:
        src?.liveWithDescription ??
        src?.LiveWithDescription ??
        optionLabelById(liveWithOptions, src?.liveWithListId ?? src?.LiveWithListId) ??
        '',
      educationDescription:
        src?.educationDescription ??
        src?.EducationDescription ??
        optionLabelById(educationOptions, src?.educationListId ?? src?.EducationListId) ??
        '',
      occupationDescription:
        src?.occupationDescription ??
        src?.OccupationDescription ??
        optionLabelById(occupationOptions, src?.occupationListId ?? src?.OccupationListId) ??
        '',
      religionDescription:
        src?.religionDescription ??
        src?.ReligionDescription ??
        optionLabelById(religionOptions, src?.religionListId ?? src?.ReligionListId) ??
        '',
      petDescription:
        src?.petDescription ??
        src?.PetDescription ??
        optionLabelById(petOptions, src?.petListId ?? src?.PetListId) ??
        '',
      dietDescription:
        src?.dietDescription ??
        src?.DietDescription ??
        optionLabelById(dietOptions, src?.dietListId ?? src?.DietListId) ??
        '',
      secondhandSmoker:
        src?.secondhandSmoker ?? src?.secondHandSmoker ?? src?.SecondhandSmoker ?? null,
    };

    navigation.push(routes.EDIT_PATIENT_SOCIALHIST, {
      socialHistory: decoded,
      patientID: patientID,
    });
  }, [
    navigation,
    socialHistoryData,
    patientID,
    liveWithOptions,
    educationOptions,
    occupationOptions,
    religionOptions,
    petOptions,
    dietOptions,
  ]);

  const handleOnPress = useCallback((title) => {
    switch (title) {
      case 'Patient Information':
        return handlePatientInfoOnPress;
      case 'Patient Preferences':
        return handlePatientPrefOnPress;
      case 'Guardian(s) Information':
        return handlePatientGuardianOnPress;
      case 'Guardian 2':
        return handlePatientSecondGuardianOnPress;
      case 'Social History':
        return handlePatientSocialHistOnPress;
      default:
        return null;
    }
  }, [
    handlePatientInfoOnPress,
    handlePatientPrefOnPress,
    handlePatientGuardianOnPress,
    handlePatientSecondGuardianOnPress,
    handlePatientSocialHistOnPress,
  ]);

  const handleOnChange = useCallback((newSections) => {
    setActiveSections(newSections);

    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 2000, animated: true });
    }
  }, [scrollViewRef]);

  const getUnmaskedNRIC = useCallback((title) => {
    switch (title) {
      case 'Patient Information':
        return unMaskedPatientNRIC;
      case 'Guardian(s) Information':
        return unMaskedGuardianNRIC;
      case 'Guardian 2':
        return unMasked2ndGuardianNRIC;
      default:
        return null;
    }
  }, [unMaskedPatientNRIC, unMaskedGuardianNRIC, unMasked2ndGuardianNRIC]);

  // Memoized render functions
  const renderHeader = useCallback((section, _, isActive) => {
    return (
      <View
        testID={`accordion_${section.title.replace(/\s+/g, '_')}_header`}
        style={styles.accordHeader}
      >
        <Text style={styles.accordTitle}>{section.title}</Text>
        <Icon
          name={isActive ? 'chevron-up' : 'chevron-down'}
          size={30}
          color={colors.white}
        />
      </View>
    );
  }, []);

  const renderContent = useCallback((section) => {
    return (
      <View
        testID={`accordion_${section.title.replace(/\s+/g, '_')}_content`}
        style={styles.accordBody}
      >
        <InformationCard
          title={section.title}
          subtitle={
            section.title === 'Guardian(s) Information' && isSecondGuardian
              ? 'Guardian 1'
              : null
          }
          displayData={section.content}
          handleOnPress={handleOnPress(section.title)}
          unMaskedNRIC={getUnmaskedNRIC(section.title)}
          buttonTitle={section.title === 'Social History' && isSocialHistoryEmpty ? 'ADD' : null}
        />
        {section.title === 'Guardian(s) Information' && isSecondGuardian ? (
          <InformationCard
            title={section.title}
            subtitle={'Guardian 2'}
            displayData={secondGuardianInfoData}
            handleOnPress={handlePatientSecondGuardianOnPress}
            unMaskedNRIC={getUnmaskedNRIC('Guardian 2')}
          />
        ) : null}
      </View>
    );
  }, [
    isSecondGuardian,
    isSocialHistoryEmpty,
    secondGuardianInfoData,
    handleOnPress,
    getUnmaskedNRIC,
    handlePatientSecondGuardianOnPress,
  ]);

  return (
    <Accordion
      align="bottom"
      sections={sections}
      activeSections={activeSections}
      renderHeader={renderHeader}
      renderContent={renderContent}
      onChange={handleOnChange}
      sectionContainerStyle={styles.accordContainer}
    />
  );
}

const styles = StyleSheet.create({
  accordContainer: {
    paddingBottom: 4,
  },
  accordHeader: {
    padding: 12,
    backgroundColor: '#eee',
    color: '#eee',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.green,
  },
  accordTitle: {
    fontSize: 30,
    paddingTop: 15,
    fontWeight: 'bold',
    color: colors.white,
    marginHorizontal: '2%',
  },
  accordBody: {
    padding: 12,
    fontFamily: typography.baseFontFamily,
  },
});

export default PatientInformationAccordion;
