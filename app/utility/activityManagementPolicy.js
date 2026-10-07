// Current Activity staging has no complete availability read or authoritative
// occurrence/replacement-availability validation contract. Do not enable these
// mutations using a truncated list or frontend scheduling guesses.
export const activityMutationBlockReason = (kind) => {
  if (kind === 'availability') {
    return 'Availability changes are unavailable until the service provides a complete availability read and safe write reconciliation.';
  }
  if (kind === 'adhoc') {
    return 'Ad hoc changes are unavailable until the service validates the affected occurrence and replacement availability.';
  }
  return '';
};
