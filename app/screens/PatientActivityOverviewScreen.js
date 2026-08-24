import React, { useCallback, useContext, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Box, Text } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import activityApi, {
  applyActivityTitles,
  buildActivityTitleMap,
  keepNamedActivities,
  mergeCataloguePreferences,
} from 'app/api/activity';
import patientApi from 'app/api/patient';
import AuthContext from 'app/auth/context';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddActivityExclusionModal from 'app/components/AddActivityExclusionModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';
import { patientFromApiResponse, patientProfileLines } from 'app/utility/patientHeader';

const MEDIUM = colors.grey;
const LIGHT = colors.grey_lighter;

const preferenceLabel = (isLike) => {
  const n = Number(isLike);
  if (n === 1) return 'Like';
  if (n === -1) return 'Dislike';
  return 'Neutral';
};

const statusChip = (kind) => {
  if (kind === 'like' || kind === 'recommend') {
    return { bg: colors.green_lightest, fg: colors.black_darker };
  }
  if (kind === 'dislike' || kind === 'not-recommend') {
    return { bg: colors.pink_lightest, fg: colors.black_darker };
  }
  if (kind === 'exclude') {
    return { bg: colors.purple_lightest, fg: colors.black_darker };
  }
  return { bg: colors.grey_lightest, fg: colors.black_darker };
};

const preferenceChip = (isLike) => {
  const n = Number(isLike);
  if (n === 1) return statusChip('like');
  if (n === -1) return statusChip('dislike');
  return statusChip('neutral');
};

const recommendationChip = (value) => {
  const n = Number(value);
  if (n === 1) return statusChip('recommend');
  if (n === -1) return statusChip('not-recommend');
  return statusChip('neutral');
};

function SectionHeader({ title, count }) {
  return (
    <Box mt={4} mb={2} flexDirection="row" alignItems="center" justifyContent="space-between">
      <Text fontSize="lg" fontWeight="700" color={colors.black}>
        {title}
      </Text>
      <Text fontSize="sm" color={MEDIUM}>
        {count}
      </Text>
    </Box>
  );
}

function EmptyRow({ message }) {
  return (
    <Box
      bg="white"
      borderRadius={12}
      borderWidth={1}
      borderColor={LIGHT}
      px={4}
      py={3}
      mb={2}
    >
      <Text color={colors.black}>{message}</Text>
    </Box>
  );
}

function ListRow({ title, subtitle, badge, badgeBg, badgeFg, onPress, testID }) {
  const chip = { bg: badgeBg || colors.grey_lightest, fg: badgeFg || colors.black_darker };
  const row = (
    <Box
      bg={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={LIGHT}
      px={4}
      py={3}
      mb={2}
      minHeight={64}
      justifyContent="center"
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flex={1} pr={3}>
          <Text fontSize="md" fontWeight="600" color={colors.black}>
            {title || 'Activity'}
          </Text>
          {!!subtitle && (
            <Text fontSize="sm" color={colors.black} mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
        {!!badge && (
          <Box px={3} py={1} borderRadius={999} bg={chip.bg}>
            <Text fontSize="xs" fontWeight="700" color={chip.fg}>
              {badge}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (!onPress) return row;
  return (
    <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={0.85}>
      {row}
    </TouchableOpacity>
  );
}

function PatientActivityOverviewScreen(props) {
  let { patientID, patientId, patientProfile } = props.route.params || {};
  if (patientId) patientID = patientId;

  const navigation = useNavigation();
  const { user } = useContext(AuthContext) || {};
  const roleName = (user?.roleName || user?.role || '').toUpperCase();
  const isSupervisor = roleName === 'SUPERVISOR';
  const canManagePreferences = isSupervisor || roleName === 'CAREGIVER';

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [patientData, setPatientData] = useState(patientProfile || {});
  const [preferences, setPreferences] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [exclusionModalMode, setExclusionModalMode] = useState('add');
  const [editingExclusion, setEditingExclusion] = useState(null);

  const resolveTitles = (items, activityMap) =>
    keepNamedActivities(applyActivityTitles(items, activityMap));

  const loadData = useCallback(async () => {
    if (!patientID) return;
    setErrors([]);

    try {
      const [patientRes, prefsRes, recsRes, exclRes, centreRes, activitiesRes] =
        await Promise.all([
          patientApi.readPatientV1
            ? patientApi.readPatientV1(patientID, { require_auth: true, mask: true })
            : patientApi.getPatient?.(patientID),
          activityApi.getActivityPreference(patientID),
          activityApi.getActivityRecommendations(patientID),
          activityApi.getActivityExclusions(patientID),
          activityApi.getCentreActivities(),
          activityApi.getActivities(),
        ]);

      const nextErrors = [];
      if (prefsRes && !prefsRes.ok) nextErrors.push('preferences');
      if (recsRes && !recsRes.ok) nextErrors.push('recommendations');
      if (exclRes && !exclRes.ok) nextErrors.push('exclusions');

      const activityMap = buildActivityTitleMap(
        centreRes?.ok ? centreRes.data?.data || [] : [],
        activitiesRes?.ok ? activitiesRes.data?.data || [] : [],
      );

      if (patientRes?.ok) {
        setPatientData({
          ...patientFromApiResponse(patientRes),
          patientID,
        });
      }

      setPreferences(
        prefsRes?.ok
          ? mergeCataloguePreferences(
              centreRes?.ok ? centreRes.data?.data || [] : [],
              activitiesRes?.ok ? activitiesRes.data?.data || [] : [],
              prefsRes?.data?.data || [],
            )
          : [],
      );
      setRecommendations(
        recsRes?.ok ? resolveTitles(recsRes?.data?.data || [], activityMap) : [],
      );
      setExclusions(
        exclRes?.ok ? resolveTitles(exclRes?.data?.data || [], activityMap) : [],
      );
      setErrors(nextErrors);
    } catch (e) {
      setErrors(['preferences', 'recommendations', 'exclusions']);
      Alert.alert(
        'Unable to load activity overview',
        'Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [patientID]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData();
    }, [loadData]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleExclusionSubmit = async (values) => {
    const payload = {
      id: values.id,
      centreActivityID: values.centreActivityID,
      patientID,
      exclusionRemarks: values.exclusionRemarks,
      startDate: values.startDate,
      endDate: values.endDate,
    };
    const result =
      exclusionModalMode === 'edit' && values.id
        ? await activityApi.updateActivityExclusion(payload)
        : await activityApi.createActivityExclusion(payload);

    if (!result?.ok) {
      Alert.alert(
        'Could not save exclusion',
        result?.data?.detail ||
          result?.data?.message ||
          result?.problem ||
          `Request failed (${result?.status || 'unknown'}).`,
      );
      return;
    }

    setShowExclusionModal(false);
    setEditingExclusion(null);
    loadData();
  };

  const profileLines = patientProfileLines(patientData);

  if (isLoading) {
    return <ActivityIndicator visible />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <ProfileNameButton
        testID={`activity_overview_screen_${patientID}_profileNameButton`}
        profileLineOne={profileLines.line1}
        profileLineTwo={profileLines.line2}
        profilePicture={patientData.profilePicture}
        isPatient
        handleOnPress={() =>
          navigation.navigate(routes.PATIENT_PROFILE, { id: patientID })
        }
      />

      <Text fontSize="md" color={colors.black} mt={2} mb={1}>
        Condensed view of preferences, doctor recommendations, and exclusions
        (aligned with web patient activity tabs). Caregivers can update
        preferences; supervisors can add dated exclusions. Recommendations
        stay read-only on mobile.
      </Text>

      {errors.length > 0 && (
        <Box bg="#fff3e0" borderRadius={10} px={3} py={2} mt={2}>
          <Text color="#e65100">
            Some sections could not be loaded: {errors.join(', ')}. Pull to
            refresh.
          </Text>
        </Box>
      )}

      {canManagePreferences && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() =>
            navigation.navigate(routes.ACTIVITY_PREFERENCE, {
              patientID,
              patientId: patientID,
              patientProfile: patientData,
            })
          }
          testID={`activity_overview_manage_prefs_${patientID}`}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="white" />
          <Text color="white" fontWeight="700" ml={2}>
            Manage Preferences
          </Text>
        </TouchableOpacity>
      )}

      {isSupervisor && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => {
            setEditingExclusion(null);
            setExclusionModalMode('add');
            setShowExclusionModal(true);
          }}
          testID={`activity_overview_add_exclusion_${patientID}`}
        >
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text color="white" fontWeight="700" ml={2}>
            Add Exclusion
          </Text>
        </TouchableOpacity>
      )}

      <SectionHeader title="Preferences" count={preferences.length} />
      {preferences.length === 0 ? (
        <EmptyRow
          message={
            errors.includes('preferences')
              ? 'Could not load preferences. Pull to refresh.'
              : 'No named centre activities to show.'
          }
        />
      ) : (
        preferences.map((item) => (
          <ListRow
            key={`pref-${item.centreActivityPreferenceID || item.CentreActivityPreferenceID || item.centreActivityID}`}
            title={item.activityTitle}
            badge={preferenceLabel(item.isLike)}
            badgeBg={preferenceChip(item.isLike).bg}
            badgeFg={preferenceChip(item.isLike).fg}
          />
        ))
      )}

      <SectionHeader title="Doctor Recommendations" count={recommendations.length} />
      {recommendations.length === 0 ? (
        <EmptyRow
          message={
            errors.includes('recommendations')
              ? 'Could not load doctor recommendations. Pull to refresh.'
              : 'No doctor recommendations for this patient.'
          }
        />
      ) : (
        recommendations.map((item) => (
          <ListRow
            key={`rec-${item.id}`}
            title={item.activityTitle}
            subtitle={item.doctorRemarks || undefined}
            badge={item.doctorRecommendationLabel}
            badgeBg={recommendationChip(item.doctorRecommendation).bg}
            badgeFg={recommendationChip(item.doctorRecommendation).fg}
          />
        ))
      )}

      <SectionHeader title="Exclusions" count={exclusions.length} />
      {exclusions.length === 0 ? (
        <EmptyRow
          message={
            errors.includes('exclusions')
              ? 'Could not load exclusions. Pull to refresh.'
              : 'No activity exclusions for this patient.'
          }
        />
      ) : (
        exclusions.map((item) => (
          <ListRow
            key={`excl-${item.id}`}
            title={item.activityTitle}
            subtitle={[
              item.exclusionRemarks,
              item.startDate ? `From ${String(item.startDate).slice(0, 10)}` : null,
              item.endDate ? `to ${String(item.endDate).slice(0, 10)}` : 'ongoing',
            ]
              .filter(Boolean)
              .join(' · ')}
            badge="Excluded"
            badgeBg={statusChip('exclude').bg}
            badgeFg={statusChip('exclude').fg}
            testID={`activity_overview_exclusion_${item.id}`}
            onPress={
              isSupervisor
                ? () => {
                    setEditingExclusion(item);
                    setExclusionModalMode('edit');
                    setShowExclusionModal(true);
                  }
                : undefined
            }
          />
        ))
      )}

      <Box mt={4} mb={8}>
        <Text fontSize="sm" color={colors.black}>
          Recommendations stay read-only on mobile (doctor-managed on web).
          Caregivers can update preferences. Supervisors can add or edit
          dated exclusions here. Creating centre activities and generating
          schedules stay on Config.
        </Text>
      </Box>

      <AddActivityExclusionModal
        testID={`activity_overview_exclusion_modal_${patientID}`}
        showModal={showExclusionModal}
        modalMode={exclusionModalMode}
        existingExclusion={editingExclusion}
        excludedActivityIds={exclusions.map((item) => item.centreActivityID)}
        onClose={() => {
          setShowExclusionModal(false);
          setEditingExclusion(null);
        }}
        onSubmit={handleExclusionSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey_lightest,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  manageButton: {
    marginTop: 12,
    backgroundColor: colors.pink,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});

export default PatientActivityOverviewScreen;
